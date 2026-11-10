'use client';
import {clearDeviceStore,deviceList} from '@/lib/device-store';
import React,{useEffect,useState} from 'react';
export default function SignOut(){
  const [error,setError]=useState('');
  useEffect(()=>{async function signout(){
    const pending=await deviceList('queue:');if(pending.length&&!confirm('There are unsynced saves on this device. Signing out clears them. Export them from Home first if needed. Sign out and clear them?')){location.replace('/');return}await clearDeviceStore();
    const config=await fetch('/api/auth').then(r=>r.json()) as any;
    for(const key of Object.keys(localStorage))if(key.startsWith('form-'))localStorage.removeItem(key);
    if('caches'in window)for(const key of await caches.keys())if(key.startsWith('form-'))await caches.delete(key);
    if((window as any).ReactNativeWebView){const response=await fetch('/api/mobile/session',{method:'DELETE'});if(!response.ok)throw new Error('Connect to the internet to disconnect your iPhone securely.');(window as any).ReactNativeWebView.postMessage(JSON.stringify({type:'signed-out'}));return;}
    if(config.mode==='sites'){location.replace('/signout-with-chatgpt?return_to=/');return;}
    const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'signout'})});
    if(!r.ok)throw new Error('Could not sign out. Please try again.');
    location.replace('/signin');
  }signout().catch(e=>setError(e.message))},[]);
  return <main className="connection-state panel"><h1>{error||'Signing out…'}</h1>{error&&<button className="btn" onClick={()=>location.reload()}>Try again</button>}</main>;
}
