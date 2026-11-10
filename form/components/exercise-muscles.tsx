'use client';
import React from 'react';
import {muscles,muscleAssignment,muscleReference} from '@/lib/muscle-assignments';
import type {Exercise} from '@/lib/domain';
export function ExerciseMuscles({exercise,onChange}:{exercise:Exercise;onChange:(patch:Partial<Exercise>)=>void}){
 const a=muscleAssignment(exercise);
 const toggle=(group:'direct'|'indirect',muscle:typeof muscles[number])=>{
  const values=a[group].includes(muscle)?a[group].filter(m=>m!==muscle):[...a[group],muscle];
  if(group==='direct'&&!values.length)return;
  const direct=group==='direct'?values:a.direct.filter(m=>!values.includes(m));
  if(!direct.length)return;
  const indirect=group==='indirect'?values:a.indirect.filter(m=>!values.includes(m));
  onChange({muscle:direct[0],primaryMuscles:direct,secondaryMuscles:indirect,muscleOverride:true});
 };
 return <details className="exercise-muscle-editor"><summary>Muscle assignments · direct & indirect</summary><p className="tiny muted">Direct: 1 point per working set. Indirect: 0.5. These are tracking weights, not a measured amount of muscle growth.</p>{(['direct','indirect'] as const).map(group=><fieldset key={group}><legend>{group==='direct'?'Direct · 1 point':'Indirect · 0.5 points'}</legend><div className="muscle-assignment-options">{muscles.map(m=><label className="toggle-label" key={m}><input type="checkbox" checked={a[group].includes(m)} onChange={()=>toggle(group,m)}/>{m}</label>)}</div></fieldset>)}<p className="tiny muted">{a.basis==='custom'?'Your custom assignment':a.basis==='source-match'?'Matched source exercise':a.direct.includes('Other')?'Needs review: no reliable muscle assignment':'Estimated from the movement family'}{a.basis!=='custom'&&<> · <a href={muscleReference(a)} target="_blank" rel="noreferrer">Reference</a></>}</p>{exercise.muscleOverride&&<button type="button" className="text-btn" onClick={()=>onChange({muscleOverride:false,primaryMuscles:undefined,secondaryMuscles:undefined})}>Restore catalogue assignment</button>}</details>;
}
