'use client';
import React,{useRef,useState} from 'react';
import {ArrowDown,ArrowUp,Plus} from 'lucide-react';
import {authFetch as fetch} from '@/lib/auth-fetch';
import {mealGroupList} from '@/lib/meal-groups';

export function MealGroupEditor({client,groups,version,preview,onApplied}:{client:string;groups:string[];version:number;preview:boolean;onApplied:()=>Promise<void>}){
  const [rows,setRows]=useState(()=>groups.map(name=>({id:crypto.randomUUID(),original:name as string|null,name}))),[busy,setBusy]=useState(false),[status,setStatus]=useState('');
  const lock=useRef(false);
  function move(index:number,offset:number){setRows(current=>{const copy=[...current];[copy[index],copy[index+offset]]=[copy[index+offset],copy[index]];return copy});}
  async function save(){
    if(lock.current)return;const parsed=mealGroupList.safeParse(rows.map(row=>row.name));
    if(!parsed.success){setStatus(parsed.error.issues[0]?.message||'Check group names.');return;}
    const renames=rows.filter(row=>row.original&&row.original!==row.name.trim()).map(row=>({from:row.original!,to:row.name.trim()}));
    if(renames.length&&!confirm('Rename these groups across all diary dates? Foods, amounts and nutrition will stay the same.'))return;
    lock.current=true;setBusy(true);setStatus('');
    try{
      const response=await fetch('/api/meal-groups',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client,version,groups:parsed.data,renames})}),body=await response.json() as any;
      if(!response.ok)throw new Error(body.error||'Could not save meal groups.');
      await onApplied();
    }catch(error:any){setStatus(error.message||'Could not save. Your changes are still here.');}finally{lock.current=false;setBusy(false);}
  }
  return <section aria-label="Manage meal groups"><p className="muted">Add groups, change names, or use the arrows to set their order. Renames apply across all diary dates; food quantities and nutrition stay unchanged.</p><fieldset disabled={busy||preview}>{rows.map((row,index)=><div className="row" key={row.id}><label className="field" style={{flex:1}}><span>Group {index+1}</span><input aria-label={'Meal group '+(index+1)} maxLength={30} value={row.name} disabled={row.original==='Uncategorized'} onChange={event=>setRows(current=>current.map(item=>item.id===row.id?{...item,name:event.target.value}:item))}/></label><button type="button" className="icon" aria-label={'Move group '+(index+1)+' up'} disabled={index===0} onClick={()=>move(index,-1)}><ArrowUp size={18}/></button><button type="button" className="icon" aria-label={'Move group '+(index+1)+' down'} disabled={index===rows.length-1} onClick={()=>move(index,1)}><ArrowDown size={18}/></button></div>)}<button type="button" className="btn" disabled={rows.length>=30} onClick={()=>setRows(current=>[...current,{id:crypto.randomUUID(),original:null,name:''}])}><Plus size={16}/>Add meal group</button></fieldset><p className="tiny muted">Uncategorized remains available for foods without an assigned group.</p>{status&&<p role="alert" className="notice">{status}</p>}<div className="modal-actions"><button type="button" className="btn primary" disabled={busy||preview} onClick={()=>void save()}>{busy?'Saving groups…':'Save meal groups'}</button></div></section>;
}
