import {normaliseUnilateralSets,type SideValues} from './unilateral';
import type {Workout} from './domain';
export function activeSeconds(s:any,now=Date.now()){const start=Date.parse(s.startedAt||'');if(!Number.isFinite(start))return 0;const end=s.pausedAt?Date.parse(s.pausedAt):now;return Math.max(0,Math.floor((end-start-(s.pausedMs||0))/1000))}
export function warmupRamp(load:number,increment=2.5){if(!(load>0&&increment>0))return [];return [.4,.6,.8].map((f,i)=>({weight:Math.min(load,Math.round(load*f/increment)*increment),reps:[8,5,3][i]})).filter((v,i,a)=>v.weight>0&&(!i||v.weight!==a[i-1].weight))}
export function eligibleSet(s:Workout['sets'][number]){return s.completed&&!s.warmup&&s.setType!=='assisted'&&s.side!=='right'&&s.reps>0&&Number.isFinite(s.weight)}
export function sessionRecap(s:Workout,history:Workout[]){
 const work=normaliseUnilateralSets(s.sets).filter(eligibleSet),load=(x:SideValues)=>x.weight+(x.gymPinAdded?x.gymPinWeight||0:0);
 const source=(sets:Workout['sets'])=>normaliseUnilateralSets(sets).flatMap(x=>x.unilateral&&x.sides?(['right','left'] as const).filter(side=>{const v=x.sides![side];return v.completed&&!v.unrecorded&&!x.warmup&&v.setType!=='assisted'&&v.reps>0}).map(side=>({...x,...x.sides![side],recordSide:side as string})):eligibleSet(x)?[{...x,recordSide:''}]:[]);
 const old=history.flatMap(w=>source(w.sets)),records=source(s.sets).filter(x=>load(x)>0&&!old.some(p=>p.exerciseId===x.exerciseId&&!!p.unilateral===!!x.unilateral&&p.recordSide===x.recordSide&&p.reps>=x.reps&&load(p)>=load(x))).map(x=>({name:x.name+(x.recordSide?' · '+(x.recordSide==='right'?'Right':'Left'):''),side:x.recordSide,weight:load(x),reps:x.reps}));
 return {sets:work.length,reps:work.reduce((a,x)=>a+x.reps,0),volume:work.reduce((a,x)=>a+load(x)*x.reps,0),records,seconds:activeSeconds(s)};
}
