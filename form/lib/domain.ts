import { z } from 'zod';
import {normaliseUnilateralSets} from './unilateral';
import {waterEntrySchema} from './water';
import {muscles,muscleAssignment} from './muscle-assignments';
export {muscles} from './muscle-assignments';
export const equipmentTypes=['free-weight','machine','cable','bodyweight','banded','other'] as const;
export const bandColors=['Red','Orange','Yellow','Green','Blue','Purple','Black'] as const;
export const exerciseSchema=z.object({id:z.string().max(100),name:z.string().min(1).max(100),sets:z.number().int().min(1).max(12),min:z.number().int().min(1).max(100),max:z.number().int().min(1).max(100),muscle:z.enum(muscles),primaryMuscles:z.array(z.enum(muscles)).max(24).optional(),secondaryMuscles:z.array(z.enum(muscles)).max(24).optional(),muscleOverride:z.boolean().optional(),equipment:z.enum(equipmentTypes).default('free-weight'),gymPin:z.boolean().default(false),unilateral:z.boolean().optional(),restSeconds:z.number().int().min(0).max(1800).optional(),prescriptions:z.array(z.object({min:z.number().int().min(1).max(100),max:z.number().int().min(1).max(100)})).max(12).optional(),optional:z.boolean().default(false),note:z.string().max(500).default('')}).refine(v=>v.max>=v.min&&(!v.prescriptions||v.prescriptions.every(p=>p.max>=p.min)),'Maximum reps must be at least minimum reps');
export const planSchema=z.array(z.object({day:z.string().max(20),name:z.string().max(80),exercises:z.array(exerciseSchema).max(30)})).length(7);
export const targetsSchema=z.object({macroMode:z.enum(['ratios','fixed','keto']).optional(),customEnergy:z.boolean().optional(),calories:z.number().min(0).max(15000),protein:z.number().min(0).max(1000),fat:z.number().min(0).max(1000),carbs:z.number().min(0).max(3000),steps:z.number().min(0).max(100000),cardio:z.number().min(0).max(1440),sleep:z.number().min(0).max(24),water:z.number().min(0).max(20),goalWeight:z.number().min(0).max(500),goalDate:z.string().max(10),goal:z.string().max(250),height:z.number().min(0).max(300),startWeight:z.number().min(0).max(500),bodyFat:z.number().min(0).max(75),maintenance:z.number().min(0).max(15000),scheduleMode:z.enum(['flexible','fixed','rolling']).default('flexible'),timezone:z.string().max(60).refine(v=>{try{new Intl.DateTimeFormat('en',{timeZone:v});return true}catch{return false}},'Use a valid time zone, such as Australia/Perth')});
export type Exercise=z.infer<typeof exerciseSchema>; export type Plan=z.infer<typeof planSchema>; export type Targets=z.infer<typeof targetsSchema>;
export type Client={id:string;name:string;email:string;owner:string;member:string|null;demo:number;personal?:number;targets:Targets;plan:Plan;created:string;version:number};
const number=(max:number)=>z.number().min(0).max(max).nullable().optional();
export const logSchema=z.object({weight:number(500),waist:number(300),bodyFat:number(75),calories:number(15000),protein:number(1000),fat:number(1000),carbs:number(3000),steps:number(100000),cardio:number(1440),sleep:number(24),water:number(20),waterEntries:z.array(waterEntrySchema).max(200).optional(),energy:number(5),hunger:number(5),stress:number(5),soreness:number(5),notes:z.string().max(2000).default(''),checkin:z.boolean().default(false),reviewed:z.boolean().default(false)});
export type LogData=z.infer<typeof logSchema>;export type Log={id:string;client:string;date:string;data:LogData;updated:string};
export const setSideSchema=z.object({weight:z.number().min(0).max(2000),reps:z.number().int().min(0).max(1000),rir:z.number().min(0).max(20).nullable().optional(),completed:z.boolean(),failure:z.boolean().optional(),bandColors:z.array(z.string().trim().min(1).max(30)).max(12).optional(),gymPinAdded:z.boolean().optional(),gymPinWeight:z.number().min(0).max(2000).optional(),setType:z.enum(['straight','drop','back-off','tempo','assisted']).optional(),tempo:z.string().max(30).optional(),group:z.string().max(20).optional(),targetMin:z.number().int().min(1).max(100).optional(),targetMax:z.number().int().min(1).max(100).optional(),unrecorded:z.boolean().optional()});
export const workoutSchema=z.object({id:z.string().min(1).max(100),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),name:z.string().max(80),notes:z.string().max(2000).default(''),templateId:z.string().max(100).optional(),templateVersion:z.number().int().positive().optional(),startedAt:z.string().datetime().optional(),pausedAt:z.string().datetime().nullable().optional(),pausedMs:z.number().min(0).max(1e10).optional(),restPresets:z.record(z.number().min(0).max(1800)).optional(),swaps:z.array(z.object({from:z.string().max(100),to:z.string().max(100),reason:z.string().max(300)})).max(100).optional(),exerciseNotes:z.record(z.string().max(100),z.string().max(500)).optional(),sets:z.array(z.object({exerciseId:z.string().max(100),name:z.string().min(1).max(100),muscle:z.enum(muscles),primaryMuscles:z.array(z.enum(muscles)).max(24).optional(),secondaryMuscles:z.array(z.enum(muscles)).max(24).optional(),muscleOverride:z.boolean().optional(),equipment:z.enum(equipmentTypes).default('free-weight'),weight:z.number().min(0).max(2000),bandColors:z.array(z.string().trim().min(1).max(30)).max(12).default([]),gymPinAdded:z.boolean().default(false),gymPinWeight:z.number().min(0).max(2000).default(0),reps:z.number().int().min(0).max(1000),targetMin:z.number().int().min(1).max(100).optional(),targetMax:z.number().int().min(1).max(100).optional(),rir:z.number().min(0).max(20).nullable().optional(),failure:z.boolean().default(false),completed:z.boolean(),warmup:z.boolean().default(false),setType:z.enum(['straight','drop','back-off','tempo','assisted']).optional(),side:z.enum(['both','left','right']).optional(),unilateral:z.boolean().optional(),sides:z.object({right:setSideSchema,left:setSideSchema,origin:z.enum(['shared','separate','new']).optional()}).optional(),tempo:z.string().max(30).optional(),group:z.string().max(20).optional()})).max(200)}).transform(value=>({...value,sets:normaliseUnilateralSets(value.sets)}));
export type Workout=z.infer<typeof workoutSchema>&{client:string;created?:string};
export const defaultTargets:Targets={calories:2200,protein:100,fat:50,carbs:337.5,steps:15000,cardio:30,sleep:8,water:2.5,goalWeight:0,goalDate:'',goal:'Build consistency',height:0,startWeight:0,bodyFat:0,maintenance:0,scheduleMode:'flexible',timezone:'Australia/Perth'};
const ex=(name:string,muscle:typeof muscles[number],sets=2,note='',optional=false):Exercise=>({id:name.toLowerCase().replace(/[^a-z0-9]/g,'-'),name,muscle,sets,min:6,max:12,note,optional,equipment:'free-weight',gymPin:false});
const lower=[ex('Leg extension','Quads'),ex('Hamstring curl','Hamstrings'),ex('Squat variation','Quads'),ex('Stiff-legged deadlift','Hamstrings'),ex('Hip adduction','Adductors'),ex('Hip abduction','Abductors'),ex('Straight-leg calf press','Calves'),ex('Hip thrust','Glutes',2,'Optional',true),ex('Tibialis raise','Tibialis',2,'Optional',true)];
const upper=[ex('Lateral raise','Side delts',3),ex('Front raise','Front delts',2,'Or top-half shoulder press'),ex('Sagittal-plane pulldown','Lats'),ex('Frontal-plane pulldown','Lats'),ex('Upper-back row','Upper back',2,'Or Kelso shrug'),ex('Triceps pushdown','Triceps'),ex('Reverse curl','Forearms'),ex('Pec deck','Chest'),ex('Low-to-high fly','Chest'),ex('Oblique twist','Obliques'),ex('Ab crunch','Abs'),ex('Rear-delt fly','Rear delts',2,'Only when using Kelso shrugs',true)];
const weak=[ex('Lateral raise','Side delts',3),ex('Lat pulldown','Lats'),ex('Pec deck','Chest'),ex('Alternating arm isolation','Triceps',2,'Alternate triceps and biceps each Saturday; select the correct muscle when editing.'),ex('Ab crunch','Abs')];
export const samplePlan:Plan=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((day,i)=>({day,name:i===6?'Rest':i===5?'Weak point':i%2===0?'Lower body':'Upper body',exercises:structuredClone(i===6?[]:i===5?weak:i%2===0?lower:upper)}));
export const emptyPlan:Plan=samplePlan.map(d=>({...d,name:'Rest',exercises:[]}));
export function dayKey(timezone='Australia/Perth',d=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(d);}
export function shiftDate(date:string,n:number){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export function mean(values:(number|undefined|null)[]){const v=values.filter((x):x is number=>typeof x==='number'&&Number.isFinite(x));return v.length?v.reduce((a,b)=>a+b,0)/v.length:null;}
export function averageWeight(logs:Log[],end:string){return mean(logs.filter(l=>l.date<=end&&l.date>=shiftDate(end,-6)).map(l=>l.data.weight));}
/** Estimate maintenance calories from logged intake and the observed weight trend.
 * Requires at least 21 days of trend, three weigh-ins, and 14 logged
 * calorie days. Treat the result as a trend estimate, not a measured TDEE.
 */
export function estimateMaintenance(logs:Log[],meals:{client?:string;date:string;data?:{calories?:number}}[],endDate:string,windowDays=28){
  const start=shiftDate(endDate,-Math.max(13,windowDays-1));
  const byDate=new Map(logs.filter(l=>l.date>=start&&l.date<=endDate).map(l=>[l.date,l]));
  const weights=[...byDate.values()].filter(l=>typeof l.data.weight==='number').sort((a,b)=>a.date.localeCompare(b.date));
  const caloriesByDate=new Map<string,number>();
  const mealDays=new Set<string>();
  for(const meal of meals){if(meal.date<start||meal.date>endDate)continue;mealDays.add(meal.date);caloriesByDate.set(meal.date,(caloriesByDate.get(meal.date)||0)+(meal.data?.calories||0));}
  for(const [date,log] of byDate){if(!mealDays.has(date)&&typeof log.data.calories==='number')caloriesByDate.set(date,log.data.calories);}
  const calorieEntries=[...caloriesByDate.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
  const result={maintenance:null as number|null,averageIntake:mean(calorieEntries.map(([,value])=>value)),weightChangePerWeek:null as number|null,weighIns:weights.length,calorieDays:calorieEntries.length,daysBetween:0,confidence:'warming up' as 'warming up'|'early trend'|'building'|'steady'};
  if(weights.length>=2)result.daysBetween=Math.round((Date.parse(weights[weights.length-1].date+'T12:00:00Z')-Date.parse(weights[0].date+'T12:00:00Z'))/86400000)+1;
  if(weights.length<3||calorieEntries.length<14)return result;
  const first=weights[0],last=weights[weights.length-1],span=result.daysBetween;
  if(span<21||calorieEntries.length<14)return result;
  const firstWeek=weights.filter(w=>w.date<=shiftDate(first.date,6));
  const lastWeek=weights.filter(w=>w.date>=shiftDate(last.date,-6));
  const firstMean=mean(firstWeek.map(w=>w.data.weight)),lastMean=mean(lastWeek.map(w=>w.data.weight));
  const firstMid=Date.parse(firstWeek[Math.floor(firstWeek.length/2)].date+'T12:00:00Z');
  const lastMid=Date.parse(lastWeek[Math.floor(lastWeek.length/2)].date+'T12:00:00Z');
  const trend=firstMean==null||lastMean==null?null:(lastMean-firstMean)/((lastMid-firstMid)/86400000)*7;
  const intake=result.averageIntake;
  if(trend==null||intake==null||!Number.isFinite(trend)||!Number.isFinite(intake))return result;
  result.weightChangePerWeek=trend;
  result.averageIntake=intake;
  const coverage=calorieEntries.length/(span+1);
  if(span>=21&&coverage>=.7)result.confidence='steady';
  else if(span>=21||coverage>=.7)result.confidence='building';
  else result.confidence='early trend';
  const estimate=intake-trend*7700/7;
  if(estimate<1000||estimate>7000){result.maintenance=null;result.confidence='early trend';return result;}
  result.maintenance=Math.round(estimate/50)*50;
  return result;
}
export function calculateFFMI(weight:number,heightCm:number,bodyFat:number){if(!Number.isFinite(weight)||!Number.isFinite(heightCm)||!Number.isFinite(bodyFat)||weight<=0||heightCm<=0||bodyFat<0||bodyFat>=100)return null;return weight*(1-bodyFat/100)/(heightCm/100)**2;}
export function projectBodyComposition(weight:number,heightCm:number,bodyFat:number,dailyDeficit:number,days:number,fatLossFraction=.9){if(!Number.isFinite(weight)||!Number.isFinite(heightCm)||!Number.isFinite(bodyFat)||!Number.isFinite(dailyDeficit)||!Number.isFinite(days)||weight<=0||heightCm<=0||bodyFat<0||bodyFat>=100||dailyDeficit<0||days<0)return null;const totalLoss=days*dailyDeficit/7700,projectedWeight=Math.max(.1,weight-totalLoss),fatMass=Math.max(.1,weight*bodyFat/100-totalLoss*Math.min(1,Math.max(0,fatLossFraction)));return {weight:projectedWeight,bodyFat:Math.min(70,100*fatMass/projectedWeight),ffmi:calculateFFMI(projectedWeight,heightCm,100*fatMass/projectedWeight)};}
export function canRead(c:{owner:string;member:string|null},uid:string){return c.owner===uid||c.member===uid;}
export function canCoach(c:{owner:string},uid:string){return c.owner===uid;}
export function volume(plan:Plan,workouts:Workout[],mode:'planned'|'completed',start:string,end:string,contribution:'weighted'|'direct'|'indirect'='weighted'){
 const out=Object.fromEntries(muscles.map(m=>[m,0]));
 const add=(exercise:Parameters<typeof muscleAssignment>[0],sets:number)=>{const a=muscleAssignment(exercise);if(contribution!=='indirect')a.direct.forEach(m=>out[m]+=sets);if(contribution!=='direct')a.indirect.forEach(m=>out[m]+=(contribution==='indirect'?1:.5)*sets)};
 if(mode==='planned')plan.forEach(d=>d.exercises.filter(e=>!e.optional).forEach(e=>add(e,e.sets)));
 else workouts.filter(w=>w.date>=start&&w.date<=end).forEach(w=>normaliseUnilateralSets(w.sets).filter(s=>s.completed&&!s.warmup).forEach(s=>add(s,1)));
 return out;
}
export function progression(workouts:Workout[],id:string,max=12,sets=2,unilateral?:boolean,rule?:{repCeiling?:number;loadJump?:number;repeatSessions?:number}){const required=Math.max(1,Math.min(20,Math.round(rule?.repeatSessions??3)));max=rule?.repCeiling??max;const ws=workouts.map(w=>({...w,sets:normaliseUnilateralSets(w.sets)})).filter(w=>w.sets.some(s=>s.exerciseId===id&&s.completed&&!s.warmup&&(unilateral===undefined||!!s.unilateral===unilateral))).sort((a,b)=>b.date.localeCompare(a.date)||(b.created||'').localeCompare(a.created||''));let count=0;let load:number|null=null;let signature:string|null=null;const loadKey=(s:Workout['sets'][number])=>JSON.stringify([!!s.unilateral,s.weight,s.gymPinAdded?s.gymPinWeight||0:0,s.equipment==='banded'?[...(s.bandColors||[])].sort():[],s.unilateral&&s.sides?(['right','left'] as const).map(side=>[s.sides![side].weight,s.sides![side].gymPinAdded?s.sides![side].gymPinWeight||0:0,[...s.sides![side].bandColors||[]].sort()]):null]);for(const w of ws){const ss=w.sets.filter(s=>s.exerciseId===id&&s.completed&&!s.warmup&&(unilateral===undefined||!!s.unilateral===unilateral));if(ss.length<sets||ss.some(s=>s.reps<max||s.unilateral&&s.sides&&(s.sides.right.reps<max||s.sides.left.reps<max)))break;if(load===null){load=ss[0].weight;signature=loadKey(ss[0]);}if(ss.some(s=>loadKey(s)!==signature))break;count++;if(count===required)break;}return {count,load,ready:count>=required};}
