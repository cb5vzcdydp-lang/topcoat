import {muscleAssignment} from './muscle-assignments';
import {normaliseUnilateralSets} from './unilateral';
import {shiftDate,type Workout} from './domain';
const legMuscles=new Set(['Quads','Hamstrings','Glutes','Calves','Adductors','Abductors','Tibialis','Hip flexors']);
export function isLegExercise(set:Workout['sets'][number]){return muscleAssignment(set).direct.some(m=>legMuscles.has(m));}
export function skipPendingLegSets<T extends {sets:Workout['sets']}>(session:T):T{return {...session,sets:session.sets.filter(set=>!isLegExercise(set)||set.completed||set.sides?.left.completed||set.sides?.right.completed)};}
export function legDayStatus(workouts:Workout[],date:string,skipDates:string[]=[]){
 const start=shiftDate(date,-6),knownDates=[...workouts.map(w=>w.date),...skipDates].filter(d=>d<=date).sort();
 const legDates=workouts.filter(w=>w.date<=date&&normaliseUnilateralSets(w.sets).some(s=>isLegExercise(s)&&!s.warmup&&((s.completed&&s.reps>0)||(s.sides&&Object.values({left:s.sides.left,right:s.sides.right}).some(side=>side.completed&&!side.unrecorded&&side.reps>0))))).map(w=>w.date).sort();
 const lastLegDate=legDates.at(-1)||null,hasWeekOfHistory=!!knownDates.length&&knownDates[0]<=start,ultimateGym=hasWeekOfHistory&&!legDates.some(d=>d>=start);
 return {lastLegDate,ultimateGym,start,end:date,hasWeekOfHistory};
}

export function legSkipBonus(records:{kind:string;data:any;deleted?:number|boolean}[],date:string){return records.some(r=>r.kind==='leg-skip'&&!r.deleted&&r.data?.date===date)?1000:0;}
