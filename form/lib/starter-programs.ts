import {emptyPlan,type Exercise,type Plan} from './domain';
type Item=[string,Exercise['muscle'],Exercise['equipment']];
export function starterProgram(days:number,goal='Build muscle',equipment='Full gym',structure?:string):Plan{
 const schedule:Record<number,string[]>={2:['Full body','Rest','Rest','Full body','Rest','Rest','Rest'],3:['Full body','Rest','Full body','Rest','Full body','Rest','Rest'],4:['Upper','Lower','Rest','Upper','Lower','Rest','Rest'],5:['Push','Pull','Legs','Rest','Upper','Lower','Rest'],6:['Push','Pull','Legs','Push','Pull','Legs','Rest']};
 const names=structure==='Full body'?schedule[3]:structure==='Upper / Lower'?schedule[4]:structure==='Push / Pull / Legs'?schedule[6]:schedule[days]||schedule[3];
 const movements:Record<string,Item[]>={
  'Full gym':[['Leg press','Quads','machine'],['Romanian deadlift','Hamstrings','free-weight'],['Chest press','Chest','machine'],['Lat pulldown','Lats','cable'],['Seated row','Upper back','cable'],['Lateral raise','Side delts','cable'],['Cable curl','Biceps','cable'],['Triceps pushdown','Triceps','cable'],['Calf raise','Calves','machine'],['Cable crunch','Abs','cable']],
  Dumbbells:[['Goblet squat','Quads','free-weight'],['Dumbbell Romanian deadlift','Hamstrings','free-weight'],['Dumbbell floor press','Chest','free-weight'],['Dumbbell pullover','Lats','free-weight'],['Dumbbell row','Upper back','free-weight'],['Dumbbell lateral raise','Side delts','free-weight'],['Dumbbell curl','Biceps','free-weight'],['Dumbbell triceps extension','Triceps','free-weight'],['Dumbbell calf raise','Calves','free-weight'],['Crunch','Abs','bodyweight']],
  Bodyweight:[['Split squat','Quads','bodyweight'],['Single-leg glute bridge','Glutes','bodyweight'],['Incline push-up','Chest','bodyweight'],['Floor lat press','Lats','bodyweight'],['Prone W raise','Upper back','bodyweight'],['Pike push-up','Front delts','bodyweight'],['Self-resisted curl','Biceps','bodyweight'],['Close-grip incline push-up','Triceps','bodyweight'],['Standing calf raise','Calves','bodyweight'],['Reverse crunch','Abs','bodyweight']],
  'Resistance bands':[['Banded squat','Quads','banded'],['Banded Romanian deadlift','Hamstrings','banded'],['Band chest press','Chest','banded'],['Band pulldown','Lats','banded'],['Band row','Upper back','banded'],['Band lateral raise','Side delts','banded'],['Band curl','Biceps','banded'],['Band triceps extension','Triceps','banded'],['Standing calf raise','Calves','bodyweight'],['Reverse crunch','Abs','bodyweight']]
 };
 const indices:Record<string,number[]>={'Full body':[0,1,2,3,4,9],Upper:[2,3,4,5,6,7],Lower:[0,1,8,9],Push:[2,5,7],Pull:[3,4,6],Legs:[0,1,8,9],Rest:[]};
 const options=movements[equipment]||movements['Full gym'];
 return emptyPlan.map((d,i)=>({...d,name:names[i],exercises:indices[names[i]].map(index=>{
  const [name,muscle,type]=options[index];
  return {id:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),name,muscle,equipment:type,gymPin:false,optional:false,sets:goal==='Get stronger'?3:2,min:goal==='Get stronger'?5:goal==='Improve fitness'?10:6,max:goal==='Get stronger'?8:goal==='Improve fitness'?15:12,note:type==='banded'?'Secure the band and anchor before use. Build repetitions with the same band combination.':'Choose a manageable load and use controlled, comfortable repetitions.'};
 })}));
}
