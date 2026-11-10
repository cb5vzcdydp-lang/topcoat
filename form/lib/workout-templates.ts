import {normaliseUnilateralSets,pairSet} from './unilateral';
import {z} from 'zod';
import {exerciseSchema, type Exercise, type Plan, type Workout} from './domain';

export const workoutTemplateSchema=z.object({
  id:z.string().uuid(),name:z.string().trim().min(1).max(80),
  exercises:z.array(exerciseSchema).min(1).max(30),folder:z.string().max(60).default(''),tags:z.array(z.string().max(30)).max(12).default([]),favourite:z.boolean().default(false),loadScale:z.number().min(.1).max(1).default(1)
}).refine(v=>new Set(v.exercises.map(e=>e.id)).size===v.exercises.length,'Each exercise must have a unique ID');
export type WorkoutTemplate={id:string;client?:string;name:string;exercises:Exercise[];version?:number;legacy?:boolean;folder?:string;tags?:string[];favourite?:boolean;loadScale?:number};

// Legacy weekday programs remain available without copying or destroying them.
export function availableWorkouts(plan:Plan,saved:WorkoutTemplate[]=[]):WorkoutTemplate[]{
  return [...saved,...plan.filter(d=>d.exercises.length).map((d,i)=>({id:'plan:'+d.day,name:d.name,exercises:d.exercises,legacy:true}))];
}
export function sessionSets(exercises:Exercise[],history:Workout[],approved:Record<string,{weight:number;reps:number}>={}){
 const recent=history.map(w=>({...w,sets:normaliseUnilateralSets(w.sets)})).sort((a,b)=>b.date.localeCompare(a.date)||(b.created||'').localeCompare(a.created||''));
 return exercises.filter(e=>!e.optional).flatMap(e=>{
  const latest=recent.flatMap(w=>w.sets).find(s=>s.exerciseId===e.id&&s.completed&&!s.warmup);
  const unilateral=e.unilateral??latest?.unilateral??false;
  const previous=recent.find(w=>w.sets.some(s=>s.exerciseId===e.id&&s.completed&&!s.warmup&&!!s.unilateral===unilateral));
  const last=previous?.sets.filter(s=>s.exerciseId===e.id&&s.completed&&!s.warmup&&!!s.unilateral===unilateral)||[];
  return Array.from({length:e.sets},(_,i)=>{
   const target=e.prescriptions?.[i]||{min:e.min,max:e.max};
   const suggested=approved[e.id]?.reps??last[i]?.reps??target.min;
   const base={unilateral,exerciseId:e.id,name:e.name,muscle:e.muscle,primaryMuscles:e.primaryMuscles,secondaryMuscles:e.secondaryMuscles,muscleOverride:e.muscleOverride,equipment:e.equipment||'free-weight',weight:approved[e.id]?.weight??last[i]?.weight??0,reps:Math.max(target.min,Math.min(target.max,suggested)),targetMin:target.min,targetMax:target.max,bandColors:[...(last[i]?.bandColors||[])],gymPinAdded:last[i]?.gymPinAdded??!!e.gymPin,gymPinWeight:last[i]?.gymPinWeight||0,rir:null,failure:false,completed:false,warmup:false};
   if(!unilateral)return base;
   const prior=last[i]?.sides;
   return pairSet({...base,sides:{origin:'new',right:{...base,...prior?.right,weight:approved[e.id]?.weight??prior?.right.weight??base.weight,reps:Math.max(target.min,Math.min(target.max,approved[e.id]?.reps??prior?.right.reps??base.reps)),rir:null,failure:false,completed:false,unrecorded:false},left:{...base,...prior?.left,weight:approved[e.id]?.weight??prior?.left.weight??base.weight,reps:Math.max(target.min,Math.min(target.max,approved[e.id]?.reps??prior?.left.reps??base.reps)),rir:null,failure:false,completed:false,unrecorded:false}}},'new');
  });
 });
}
