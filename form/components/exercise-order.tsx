'use client';
import React,{useState} from 'react';
import {ArrowDown,ArrowUp} from 'lucide-react';
import {moveItem} from '@/lib/exercise-order';
import './exercise-order.css';
export function ExerciseOrder({items,onChange,disabled=false}:{items:{id:string;name:string}[];onChange:(ids:string[])=>void;disabled?:boolean}){
 const [notice,setNotice]=useState('');
 function move(from:number,to:number){if(disabled)return;const next=moveItem(items,from,to);if(next===items)return;onChange(next.map(e=>e.id));setNotice(`${items[from].name} moved to position ${to+1} of ${items.length}.`)}
 return <div className="exercise-order"><p className="muted">Use the arrows or choose a position. Sets and exercise settings stay together.</p><ol aria-label="Exercise order">{items.map((e,i)=><li key={e.id}><span className="exercise-order-number" aria-hidden="true">{i+1}</span><b>{e.name}</b><div className="exercise-order-controls"><select aria-label={'Position for '+e.name} disabled={disabled||items.length<2} value={i} onChange={event=>move(i,Number(event.target.value))}>{items.map((_,position)=><option key={position} value={position}>{position+1}</option>)}</select><button type="button" aria-label={'Move '+e.name+' up'} disabled={disabled||i===0} onClick={()=>move(i,i-1)}><ArrowUp size={18}/></button><button type="button" aria-label={'Move '+e.name+' down'} disabled={disabled||i===items.length-1} onClick={()=>move(i,i+1)}><ArrowDown size={18}/></button></div></li>)}</ol><p className="sr-only" role="status" aria-live="polite">{notice}</p></div>
}
