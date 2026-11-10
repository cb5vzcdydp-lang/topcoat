import {muscleAssignment} from './muscle-assignments';
import {exerciseEntries as entries,type CatalogEntry} from './exercise-catalogue';
import type {Exercise,Workout} from './domain';
import type {WorkoutTemplate} from './workout-templates';

type ExerciseMatch={entry:CatalogEntry;score:number;exact:boolean;reviewed?:boolean};
type WorkoutInput=Omit<Workout,'client'>&{client?:string};
export type ImportedTemplate=WorkoutTemplate&{importedDate:string;importedSource:string;matches:Array<{from:string;to:string;score:number;exact:boolean}>};

const replacements:Record<string,string>={
  bb:'barbell',db:'dumbbell',ohp:'overhead press',rdl:'romanian deadlift',
  pulldowns:'pulldown',pullups:'pullup',chinups:'chinup',presses:'press',
};
function words(value:string){
  return value.toLowerCase().replace(/&/g,' and ').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean).map(word=>replacements[word]||word);
}
export function importExerciseKey(value:string){return words(value).join(' ')}
function editSimilarity(a:string,b:string){
  if(a===b)return 1;
  const previous=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
    let diagonal=previous[0];previous[0]=i;
    for(let j=1;j<=b.length;j++){
      const above=previous[j],left=previous[j-1];
      previous[j]=Math.min(above+1,left+1,diagonal+(a[i-1]===b[j-1]?0:1));diagonal=above;
    }
  }
  return 1-previous[b.length]/Math.max(a.length,b.length,1);
}
function tokenScore(a:string[],b:string[]){
  const aa=new Set(a),bb=new Set(b),shared=[...aa].filter(x=>bb.has(x)).length;
  return shared?2*shared/(aa.size+bb.size):0;
}
function muscleFor(entry:CatalogEntry):Exercise['muscle']{
  return muscleAssignment(entry).direct[0];
}
function equipmentFor(entry:CatalogEntry):Exercise['equipment']{
  const value=entry.equipment.join(' ').toLowerCase();
  if(/band/.test(value))return 'banded';
  if(/cable/.test(value))return 'cable';
  if(/machine|smith/.test(value))return 'machine';
  if(/barbell|dumbbell|kettlebell|ez bar/.test(value))return 'free-weight';
  if(entry.bodyweight||/none|bodyweight/.test(value))return 'bodyweight';
  return 'other';
}
export function closestExercise(name:string,muscle?:Exercise['muscle']):ExerciseMatch{
  const literal=entries.find(entry=>entry.name.trim().toLowerCase()===name.trim().toLowerCase());if(literal)return {entry:literal,score:1,exact:true};
  const source=importExerciseKey(name),sourceWords=words(name);
  let best:ExerciseMatch|null=null;
  for(const entry of entries){
    const target=importExerciseKey(entry.name),exact=source===target;
    let score=tokenScore(sourceWords,words(entry.name))*.62+editSimilarity(source,target)*.28;
    if(source.includes(target)||target.includes(source))score+=.08;
    if(muscle&&muscle!=='Other'&&muscleFor(entry)===muscle)score+=.08;
    if(exact)score=1;
    if(!best||score>best.score||(score===best.score&&entry.name.length<best.entry.name.length))best={entry,score:Math.min(1,score),exact};
  }
  return best!;
}
function stableUuid(value:string){
  const hash=(seed:number)=>{let h=seed;for(let i=0;i<value.length;i++)h=Math.imul(h^value.charCodeAt(i),16777619);return (h>>>0).toString(16).padStart(8,'0')};
  const hex=hash(2166136261)+hash(2166136261^0x9e3779b9)+hash(2166136261^0x85ebca6b)+hash(2166136261^0xc2b2ae35);
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-${((parseInt(hex[16],16)&3)|8).toString(16)}${hex.slice(17,20)}-${hex.slice(20,32)}`;
}
function sourceOf(workout:WorkoutInput){return workout.notes.match(/Imported from ([^.]+)/i)?.[1]?.trim().slice(0,80)||'Workout import'}

export function prepareImportedWorkouts(input:WorkoutInput[],clientId:string,overrides:Record<string,string>={}){
  const matchByName=new Map<string,ExerciseMatch>();
  for(const set of input.flatMap(workout=>workout.sets)){
    const key=importExerciseKey(set.name);
    if(!matchByName.has(key)){const chosen=entries.find(entry=>entry.id===overrides[key]);matchByName.set(key,chosen?{entry:chosen,score:1,exact:importExerciseKey(chosen.name)===key,reviewed:true}:closestExercise(set.name,set.muscle));}
  }
  const templateId=(name:string)=>stableUuid(`${clientId}|imported workout|${importExerciseKey(name)}`);
  const workouts=input.map(workout=>({
    ...workout,
    templateId:templateId(workout.name),
    sets:workout.sets.map(set=>{
      const match=matchByName.get(importExerciseKey(set.name))!;
      return {...set,exerciseId:match.entry.id,name:match.entry.name,muscle:muscleFor(match.entry),equipment:equipmentFor(match.entry)};
    }),
  }));
  const latest=new Map<string,WorkoutInput>();
  for(const workout of workouts){const key=importExerciseKey(workout.name),old=latest.get(key);if(!old||workout.date>old.date)latest.set(key,workout)}
  const templates:ImportedTemplate[]=[];
  for(const workout of latest.values()){
    const grouped=new Map<string,typeof workout.sets>();
    for(const set of workout.sets){const sets=grouped.get(set.exerciseId)||[];sets.push(set);grouped.set(set.exerciseId,sets)}
    const matches:Array<{from:string;to:string;score:number;exact:boolean}>=[];
    const exercises:Exercise[]=[...grouped.values()].slice(0,30).map(sets=>{
      const first=sets[0],original=input.flatMap(w=>w.sets).find(s=>importExerciseKey(s.name)===importExerciseKey([...matchByName.entries()].find(([,m])=>m.entry.id===first.exerciseId)?.[0]||''))?.name||first.name;
      const match=matchByName.get(importExerciseKey(original))||closestExercise(original,first.muscle);
      matches.push({from:original,to:first.name,score:Number(match.score.toFixed(3)),exact:match.exact});
      const working=sets.filter(s=>!s.warmup),prescribed=working.length?working:sets;const reps=prescribed.filter(s=>s.reps>0).map(s=>s.reps),min=Math.max(1,Math.min(100,reps.length?Math.min(...reps):6)),max=Math.max(min,Math.min(100,reps.length?Math.max(...reps):12));
      return {id:first.exerciseId,name:first.name,muscle:first.muscle,equipment:first.equipment,sets:Math.max(1,Math.min(12,prescribed.length)),min,max,gymPin:false,optional:false,note:match.reviewed?`Reviewed import match from “${original}”`:match.exact?'Imported exercise':`Imported as “${original}” · closest library match`,restSeconds:90};
    });
    templates.push({id:templateId(workout.name),name:workout.name,exercises,folder:'Imported workouts',tags:['Imported',sourceOf(workout).slice(0,30)].slice(0,12),favourite:false,loadScale:1,importedDate:workout.date,importedSource:sourceOf(workout),matches});
  }
  return {workouts,templates,matches:[...matchByName.entries()].map(([from,match])=>({from,to:match.entry.name,score:match.score,exact:match.exact}))};
}
