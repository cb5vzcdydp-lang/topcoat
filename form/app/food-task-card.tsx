'use client';
import React,{useEffect,useState} from 'react';
import {deviceDelete,deviceList,type DeviceRecord} from '@/lib/device-store';
import {foodDraftPrefix,foodDraftSchema,type FoodDraft} from '@/lib/food-drafts';

export function FoodTaskCard({uid,client,onResume}:{uid:string;client:string;onResume:(draft:FoodDraft)=>void}){
  const [rows,setRows]=useState<(DeviceRecord&{data:FoodDraft})[]>([]),[status,setStatus]=useState('');
  useEffect(()=>{let active=true;const load=()=>void deviceList(foodDraftPrefix(uid,client)).then(records=>{if(active)setRows(records.flatMap(row=>{const parsed=foodDraftSchema.safeParse(row.data);return parsed.success?[{...row,data:parsed.data}]:[]}).sort((a,b)=>b.savedAt.localeCompare(a.savedAt)).slice(0,5))}).catch(()=>{});load();window.addEventListener('form-food-drafts-change',load);return()=>{active=false;window.removeEventListener('form-food-drafts-change',load)}},[uid,client]);
  if(!rows.length)return null;
  return <section className="panel" aria-label="Continue food tasks"><h3>Continue where you left off</h3><p className="tiny muted">Unfinished meals and recipes saved on this device. Nothing is added to your diary until you save.</p>{rows.map(row=><div className="tool-record" key={row.key}><div><b>{row.data.name||'Untitled '+row.data.kind}</b><small>{row.data.kind} · {row.data.items.length} ingredients · {row.data.date}</small></div><div className="row"><button className="btn" onClick={()=>onResume(row.data)} aria-label={'Resume '+(row.data.name||row.data.kind)}>Resume</button><button className="text-btn" onClick={async()=>{if(!confirm('Discard this unfinished '+row.data.kind+'?'))return;try{await deviceDelete(row.key);setRows(current=>current.filter(item=>item.key!==row.key));setStatus('Draft discarded.')}catch{setStatus('Could not discard this draft. Try again.')}}} aria-label={'Discard '+(row.data.name||row.data.kind)}>Discard</button></div></div>)}{status&&<p role="status">{status}</p>}</section>;
}
