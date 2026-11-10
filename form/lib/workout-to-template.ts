import type {SideValues} from './unilateral';
import {workoutSchema,type Exercise,type Workout} from './domain';
import {workoutTemplateSchema,type WorkoutTemplate} from './workout-templates';

export function templateFromWorkout(workout:Workout,options:{id:string;name?:string;source?:WorkoutTemplate;includeUncompleted?:boolean}){
  const parsed=workoutSchema.parse(workout);
  const groups=new Map<string,Workout['sets']>();
  for(const set of parsed.sets){
    if(set.warmup||(!options.includeUncompleted&&!set.completed))continue;
    const rows=groups.get(set.exerciseId)||[];rows.push(set);groups.set(set.exerciseId,rows);
  }
  if(!groups.size)throw new Error('No working sets to copy. Complete a working set, or include uncompleted working sets.');
  if(groups.size>30)throw new Error('Templates support up to 30 exercises. Choose a smaller workout.');
  const exercises:Exercise[]=[...groups].map(([id,sets])=>{
    const first=sets[0],previous=options.source?.exercises.find(exercise=>exercise.id===id);
    if(sets.length>12)throw new Error(`${first.name} has more than 12 working sets. Templates support up to 12 sets per exercise.`);
    if(sets.some(set=>!!set.unilateral!==!!first.unilateral))throw new Error(`${first.name} mixes bilateral and unilateral sets. Use one mode per exercise before copying.`);
    const prescriptions=sets.map((set,index)=>{
      const prior=previous?.prescriptions?.[index];
      const sideTargets:SideValues[]=set.unilateral&&set.sides?[set.sides.right,set.sides.left]:[set];
      const minimum=sideTargets.map(side=>side.targetMin).filter((n):n is number=>n!=null);
      const maximum=sideTargets.map(side=>side.targetMax).filter((n):n is number=>n!=null);
      const reps=sideTargets.filter(side=>!side.unrecorded&&side.reps>0).map(side=>side.reps);
      const min=minimum.length?Math.min(...minimum):set.targetMin??prior?.min??previous?.min??(reps.length?Math.min(...reps):0);
      const max=maximum.length?Math.max(...maximum):set.targetMax??prior?.max??previous?.max??(reps.length?Math.max(...reps):0);
      if(min<1||max<min||max>100)throw new Error(`${first.name} needs a rep target between 1 and 100 to be saved as a template.`);
      return {min,max};
    });
    return {id,name:first.name,sets:sets.length,min:Math.min(...prescriptions.map(p=>p.min)),max:Math.max(...prescriptions.map(p=>p.max)),prescriptions,muscle:first.muscle,primaryMuscles:first.primaryMuscles,secondaryMuscles:first.secondaryMuscles,muscleOverride:first.muscleOverride,equipment:first.equipment,unilateral:!!first.unilateral,gymPin:sets.some(set=>set.gymPinAdded||set.sides?.right.gymPinAdded||set.sides?.left.gymPinAdded),restSeconds:Math.round(parsed.restPresets?.[id]??previous?.restSeconds??90),note:parsed.exerciseNotes?.[id]??previous?.note??'',optional:false};
  });
  return workoutTemplateSchema.parse({id:options.id,name:options.name??parsed.name,exercises,folder:options.source?.folder||'',tags:options.source?.tags||[],favourite:options.source?.favourite||false,loadScale:options.source?.loadScale??1});
}
