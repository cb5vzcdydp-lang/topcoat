import {shiftDate,type Workout,type Log} from './domain';
import {normaliseUnilateralSets,sideValues,type SideValues} from './unilateral';
export function trainingRows(workouts:Workout[],start:string,end:string,{exercise='',includeAssisted=false,side='all',includeShared=false}:{exercise?:string;includeAssisted?:boolean;side?:string;includeShared?:boolean}={}){
 return workouts.filter(w=>w.date>=start&&w.date<=end).flatMap(w=>normaliseUnilateralSets(w.sets).flatMap((s,index)=>{
  if(s.warmup||exercise&&s.exerciseId!==exercise)return [];
  const eligible=(v:SideValues)=>v.completed&&v.reps>0&&!v.unrecorded&&(includeAssisted||v.setType!=='assisted');
  const row=(v:typeof s,recordSide:string)=>({...v,date:w.date,session:w.id,logicalSet:index,recordSide,sideOrigin:s.sides?.origin,load:v.weight+(v.gymPinAdded?v.gymPinWeight||0:0)});
  if(side==='left'||side==='right'||side==='compare'){
   if(!s.unilateral||!s.sides||!includeShared&&s.sides.origin==='shared')return [];
   return (side==='compare'?['right','left'] as const:[side]).flatMap(recordSide=>{const v=s.sides![recordSide as 'left'|'right'];return eligible(v)?[row({...s,...sideValues(v),setType:v.setType,tempo:v.tempo,group:v.group,targetMin:v.targetMin,targetMax:v.targetMax,side:recordSide as 'left'|'right',sides:undefined},recordSide)]:[]});
  }
  if(side==='both'&&s.unilateral)return [];
  return eligible(s)?[row(s,s.unilateral?'summary':'both')]:[];
 }));
}
export function strengthSummary(rows:ReturnType<typeof trainingRows>,logs:Log[]){const groups=new Map<string,typeof rows>();for(const s of rows){const a=groups.get(s.date)||[];a.push(s);groups.set(s.date,a)}return [...groups].sort((a,b)=>a[0].localeCompare(b[0])).map(([date,sets])=>{const source=logs.filter(l=>l.date<=date&&l.date>=shiftDate(date,-7)&&l.data.weight).sort((a,b)=>b.date.localeCompare(a.date))[0];return {date,sets:sets.length,volume:sets.reduce((a,s)=>a+s.load*s.reps,0),bestLoad:Math.max(...sets.map(s=>s.load)),estimatedMax:Math.max(...sets.filter(s=>s.reps<=12&&s.load>0).map(s=>s.load*(1+s.reps/30)),0)||null,bodyweight:source?.data.weight||null}})}
const bestRow=(rows:ReturnType<typeof trainingRows>)=>[...rows].sort((a,b)=>b.load-a.load||b.reps-a.reps||b.date.localeCompare(a.date))[0]||null;
export function repRecords(rows:ReturnType<typeof trainingRows>){return [1,3,5,8,10,12].map(reps=>({reps,best:bestRow(rows.filter(s=>s.reps===reps))}))}
export function repRangeRecords(rows:ReturnType<typeof trainingRows>,ranges:{min:number;max:number}[]){return ranges.map(range=>({...range,best:bestRow(rows.filter(s=>s.reps>=range.min&&s.reps<=range.max))}))}
export function sideComparison(rows:ReturnType<typeof trainingRows>,logs:Log[]){
 const right=strengthSummary(rows.filter(s=>s.recordSide==='right'),logs),left=strengthSummary(rows.filter(s=>s.recordSide==='left'),logs);
 return [...new Set([...right,...left].map(s=>s.date))].sort().map(date=>({date,right:right.find(s=>s.date===date)||null,left:left.find(s=>s.date===date)||null}));
}
export function circularTimeSpread(values:number[]){if(values.length<2)return null;const angles=values.map(v=>v/1440*2*Math.PI),s=angles.reduce((a,v)=>a+Math.sin(v),0)/values.length,c=angles.reduce((a,v)=>a+Math.cos(v),0)/values.length,r=Math.hypot(s,c);return r>0?Math.sqrt(-2*Math.log(Math.min(1,r)))*1440/(2*Math.PI):720}
