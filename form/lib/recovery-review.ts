import {shiftDate} from './domain';
import {trainingRows} from './training-analytics';
export type ReadinessInput={sleepHours:number|null;energy:number|null;stress:number|null;soreness:number|null};
export type ReadinessTargets={sleepHours:number;energy:number;stress:number;soreness:number};
export const defaultReadinessTargets:ReadinessTargets={sleepHours:7,energy:3,stress:3,soreness:3};
export function readinessChecklist(input:ReadinessInput,target=defaultReadinessTargets){
 const definitions=[{key:'sleepHours' as const,label:'Sleep duration',weight:.4,direction:'at least'},{key:'energy' as const,label:'Subjective energy',weight:.2,direction:'at least'},{key:'stress' as const,label:'Subjective stress',weight:.2,direction:'at most'},{key:'soreness' as const,label:'Subjective soreness',weight:.2,direction:'at most'}];
 const rules=definitions.map(rule=>{const value=input[rule.key],known=typeof value==='number'&&Number.isFinite(value)&&value>=0&&(rule.key==='sleepHours'?value<=24:value>=1&&value<=5),met=known&&(rule.direction==='at least'?value!>=target[rule.key]:value!<=target[rule.key]);return {...rule,value:known?value:null,target:target[rule.key],known,met}}),known=rules.filter(rule=>rule.known),coverage=known.reduce((sum,rule)=>sum+rule.weight,0),earned=known.filter(rule=>rule.met).reduce((sum,rule)=>sum+rule.weight,0);
 return {rules,coverage:Math.round(coverage*100),score:known.length>=2?Math.round(earned/coverage*100):null,known:known.length};
}
export function hoursOfSleep(value:unknown,unit:unknown){if(typeof value!=='number'||!Number.isFinite(value)||value<0)return null;const units=String(unit).toLowerCase();const hours=['h','hr','hrs','hour','hours'].includes(units)?value:['min','mins','minute','minutes'].includes(units)?value/60:['s','sec','seconds'].includes(units)?value/3600:null;return hours!=null&&hours<=24?hours:null}
export function clockOffset(actual:string|undefined,goal:string|undefined){const valid=(value:unknown)=>typeof value==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);if(!valid(actual)||!valid(goal))return null;const minutes=(value:string)=>Number(value.slice(0,2))*60+Number(value.slice(3));return ((minutes(actual!)-minutes(goal!)+2160)%1440)-720}
export function dailyRecovery(readings:any[],journals:any[],logs:any[],date:string,source=''):ReadinessInput{
 const log=logs.find(row=>row.date===date)?.data||{},journal=journals.filter(row=>row.kind==='sleep-journal'&&!row.deleted&&row.data.date===date).sort((a,b)=>String(b.updated||'').localeCompare(String(a.updated||'')))[0]?.data||{},sleep=readings.filter(row=>row.date===date&&row.metric==='sleep_duration'&&(!source||row.source===source)).sort((a,b)=>String(b.created||'').localeCompare(String(a.created||'')));
 // Never average conflicting providers. With no selected source, prefer the manual diary duration.
 const manual=typeof log.sleep==='number'&&log.sleep>=0&&log.sleep<=24?log.sleep:null,sleepHours=source?hoursOfSleep(sleep[0]?.value,sleep[0]?.unit):manual??(new Set(sleep.map(row=>row.source)).size===1?hoursOfSleep(sleep[0]?.value,sleep[0]?.unit):null);
 const field=(key:string)=>typeof log[key]==='number'?log[key]:typeof journal[key]==='number'?journal[key]:null;
 return {sleepHours,energy:field('energy'),stress:field('stress'),soreness:field('soreness')};
}
export function recoveryPerformance(workouts:any[],readings:any[],journals:any[],logs:any[],{exerciseId,equipment,start,end,source='',minReps=1,maxReps=1000,side='both'}:{exerciseId:string;equipment:string;start:string;end:string;source?:string;minReps?:number;maxReps?:number;side?:'both'|'left'|'right'}){
 const daily=new Map<string,{date:string;weight:number;reps:number;sets:number}>();
 for(const set of trainingRows(workouts,start,end,{exercise:exerciseId,side})){if(String(set.equipment||'')!==equipment||!(set.reps>=minReps&&set.reps<=maxReps)||!Number.isFinite(set.load)||set.load<0)continue;const old=daily.get(set.date);if(!old)daily.set(set.date,{date:set.date,weight:set.load,reps:set.reps,sets:1});else{old.sets++;if(set.load>old.weight||set.load===old.weight&&set.reps>old.reps){old.weight=set.load;old.reps=set.reps}}}
 return [...daily.values()].sort((a,b)=>a.date.localeCompare(b.date)).map(row=>({...row,...dailyRecovery(readings,journals,logs,row.date,source)}));
}
export function sampleCorrelation(rows:{x:number|null;y:number|null}[]){const known=rows.filter((row):row is {x:number;y:number}=>row.x!=null&&row.y!=null&&Number.isFinite(row.x)&&Number.isFinite(row.y));if(known.length<3)return {value:null,count:known.length};const mean=(key:'x'|'y')=>known.reduce((sum,row)=>sum+row[key],0)/known.length,mx=mean('x'),my=mean('y'),xx=known.reduce((sum,row)=>sum+(row.x-mx)**2,0),yy=known.reduce((sum,row)=>sum+(row.y-my)**2,0);return {count:known.length,value:xx&&yy?known.reduce((sum,row)=>sum+(row.x-mx)*(row.y-my),0)/Math.sqrt(xx*yy):null}}
export function recoveryDates(date:string,days:number){return Array.from({length:Math.max(1,Math.min(365,days))},(_,index)=>shiftDate(date,index-days+1))}
