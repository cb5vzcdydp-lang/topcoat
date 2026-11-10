"use client";
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {authFetch} from '@/lib/auth-fetch';
import {workoutTabIdentity} from '@/lib/workout-tab-identity';
type Access='checking'|'held'|'conflict'|'unavailable'|'local';
export function SessionGate({client,session,uid='',preview,visible,onLease,onClose,children}:{client:string;session:string;uid?:string;preview:boolean;visible:boolean;onLease:(token:string|null)=>void;onClose:()=>void;children:ReactNode}){
 const dialog=useRef<HTMLElement>(null),token=useRef<string|null>(null),leaseVersion=useRef<number|undefined>(undefined),callback=useRef(onLease);callback.current=onLease;
 const [state,setState]=useState<Access>('checking'),[message,setMessage]=useState('Checking the active workout…'),[version,setVersion]=useState<number>(),[busy,setBusy]=useState(false);
 const access=useRef<Access>('checking'),active=useRef(false),generation=useRef(0),pending=useRef<AbortController|null>(null);
 function show(next:Access){access.current=next;setState(next)}
 async function request(action:'acquire'|'renew'|'takeover',expected?:number){
  if(preview){show('held');return;}if(!active.current||!token.current||pending.current)return;
  const epoch=generation.current,controller=new AbortController();pending.current=controller;setBusy(true);
  const current=()=>active.current&&generation.current===epoch&&!controller.signal.aborted;
  try{
   let response:Response,data:any;
   for(let attempt=0;;attempt++){
    response=await authFetch('/api/workout-lease',{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({action,client,session,token:token.current,...(expected?{version:expected}:{})})});
    data=await response.json();if(!current())return;
    // Recheck an expired/racing lease once; never report a missing renewal as another device.
    if(response.status===409&&attempt===0&&(action==='renew'||data.sameTab||Number(data.expires)<=Date.now())){action='acquire';expected=undefined;continue;}
    break;
   }
   if(response.status===409){show('conflict');setVersion(data.version||undefined);setMessage(data.error||'Another tab or device currently holds editing access.');callback.current(null);return;}
   if(!response.ok)throw new Error(data.error||'Could not check workout editing access.');
   leaseVersion.current=data.version;setVersion(data.version);show('held');setMessage('This tab owns the active workout.');callback.current(token.current);
  }catch(error:any){if(current()&&error.name!=='AbortError'){show(access.current==='held'||access.current==='local'?'local':'unavailable');setMessage(error.message||'Connection unavailable.');callback.current(null)}}
  finally{if(pending.current===controller)pending.current=null;if(current())setBusy(false)}
 }
 useEffect(()=>{
  active.current=true;generation.current++;const epoch=generation.current,identityController=new AbortController();let dispose:(()=>void)|undefined;
  if(preview)show('held');else void workoutTabIdentity(client,uid,identityController.signal).then(identity=>{if(!active.current||generation.current!==epoch){identity.dispose();return;}token.current=identity.token;dispose=identity.dispose;void request('acquire')}).catch(error=>{if(active.current&&generation.current===epoch&&error.name!=='AbortError'){show('unavailable');setMessage('Could not restore workout access. Retry when connected.')}});
  const reconnect=()=>{if(document.visibilityState==='visible')void request('acquire')};
  const heartbeat=setInterval(()=>{if(document.visibilityState==='visible')void request(access.current==='held'?'renew':'acquire')},20000);
  window.addEventListener('online',reconnect);window.addEventListener('focus',reconnect);document.addEventListener('visibilitychange',reconnect);
  return()=>{
   active.current=false;identityController.abort();pending.current?.abort();pending.current=null;clearInterval(heartbeat);window.removeEventListener('online',reconnect);window.removeEventListener('focus',reconnect);document.removeEventListener('visibilitychange',reconnect);dispose?.();callback.current(null);
   if(!preview&&token.current&&leaseVersion.current)void authFetch('/api/workout-lease',{method:'POST',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'release',client,session,token:token.current,version:leaseVersion.current})}).catch(()=>{});
  };
 },[client,session,uid,preview]);
 useEffect(()=>{if(!visible||['held','local'].includes(state))return;const root=dialog.current;if(!root)return;const before=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;document.body.style.overflow='hidden';root.focus();const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();onClose()}if(event.key!=='Tab')return;const nodes=Array.from(root.querySelectorAll<HTMLElement>('button:not(:disabled)'));if(!nodes.length)return;const first=nodes[0],last=nodes.at(-1)!;if(event.shiftKey&&(document.activeElement===first||!root.contains(document.activeElement))){event.preventDefault();last.focus()}else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===root)){event.preventDefault();first.focus()}};root.addEventListener('keydown',key);return()=>{root.removeEventListener('keydown',key);document.body.style.overflow=overflow;if(before?.isConnected)before.focus()}},[visible,state]);
 if(state==='held')return <>{children}</>;
 if(state==='local')return <><div className="session-local-notice" role="status">Local draft mode · Editing access will reconnect automatically. Your draft is kept on this device.</div>{children}</>;
 if(!visible)return null;
 return <div className="modal-backdrop"><section ref={dialog} className="modal" role="dialog" aria-modal="true" aria-label="Active workout editing access" tabIndex={-1}><h2>{state==='checking'?'Checking workout access':state==='conflict'?'Workout active in another tab or device':'Could not verify the active workout'}</h2><p role="status">{message}</p><p className="tiny muted">Your saved device draft is kept. Continuing here moves editing access to this tab; another device’s unfinished sets are not merged. Inactive access is retried automatically.</p><div className="row wrap">{state==='conflict'&&version&&<button className="btn primary" disabled={busy} onClick={()=>void request('takeover',version)}>Continue workout on this device</button>}<button className="btn" disabled={busy} onClick={()=>void request('acquire')}>Retry access check</button>{state==='unavailable'&&<button className="btn" disabled={busy} onClick={()=>{show('local');callback.current(null)}}>Continue local draft only</button>}<button className="btn" onClick={onClose}>Back · keep my draft</button></div></section></div>;
}
