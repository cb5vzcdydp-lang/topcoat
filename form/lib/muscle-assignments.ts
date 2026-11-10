import assignments from './exercise-muscles.json';
import rules from './muscle-rules.json';
export const muscles=['Quads','Hamstrings','Glutes','Adductors','Abductors','Calves','Tibialis','Chest','Lats','Upper back','Lower back','Side delts','Front delts','Rear delts','Biceps','Triceps','Forearms','Abs','Obliques','Neck','Hip flexors','Rotator cuff','Serratus','Other'] as const;
export type Muscle=typeof muscles[number];
export type MuscleAssignment={direct:Muscle[];indirect:Muscle[];basis:string;reference:string};
export const normaliseExerciseName=(name:string)=>name.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const data=assignments as Record<string,MuscleAssignment>;
export function muscleAssignment(exercise:{name?:string;muscle?:string;primaryMuscles?:string[];secondaryMuscles?:string[];muscleOverride?:boolean}):MuscleAssignment {
 const known=data[normaliseExerciseName(exercise.name||'')];
 const valid=(xs:string[])=>[...new Set(xs.filter((m):m is Muscle=>(muscles as readonly string[]).includes(m)))];
 // Explicit user assignments win. Legacy primary-only guesses are upgraded by name.
 if(exercise.muscleOverride||exercise.primaryMuscles?.length){
  const direct=valid(exercise.primaryMuscles?.length?exercise.primaryMuscles:[exercise.muscle||'Other']);
  return {direct:direct.length?direct:['Other'],indirect:valid(exercise.secondaryMuscles||[]).filter(m=>!direct.includes(m)),basis:'custom',reference:''};
 }
 if(known)return known;
 const n=normaliseExerciseName(exercise.name||'');
 const rule=rules.find(r=>new RegExp(r.pattern).test(n));
 if(rule){const direct=valid(rule.direct),indirect=valid(rule.indirect).filter(m=>!direct.includes(m));if(direct[0]==='Hamstrings'&&/romanian|rdl|sldl|stiff.?leg|straight leg deadlift|good morning/.test(n))return {...rule,direct,indirect:['Glutes','Lower back']};return {direct,indirect,basis:rule.basis,reference:rule.reference}}
 const direct=valid([exercise.muscle||'Other']);
 return {direct:direct.length?direct:['Other'],indirect:[],basis:'custom',reference:''};
}
export function muscleReference(assignment:MuscleAssignment){
 if(assignment.reference.startsWith('https://'))return assignment.reference;
 return assignment.reference?'https://github.com/yuhonas/free-exercise-db/blob/main/exercises/'+encodeURIComponent(assignment.reference)+'.json':'https://exrx.net/Lists/Directory';
}
export const muscleCoverage={total:Object.keys(data).length,needsReview:Object.values(data).filter(a=>a.direct.includes('Other')).length};
