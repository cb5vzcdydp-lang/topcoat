import {shiftDate} from './domain';

export type TouchGrassRecord={
 id:string;
 kind:string;
 version:number;
 data:{
  name:string;
  cadence:'daily'|'once';
  category:'outdoors'|'social'|'recovery'|'life';
  createdDate:string;
  lastCompleted?:string;
  completionDates?:string[];
  completed:boolean;
  notes?:string;
 };
};

export function completedDates(task:TouchGrassRecord){
 const dates=new Set((task.data.completionDates||[]).filter(Boolean));
 if(task.data.lastCompleted)dates.add(task.data.lastCompleted);
 return dates;
}

export function completedOn(task:TouchGrassRecord,date:string){return completedDates(task).has(date)}

export function touchGrassStats(records:TouchGrassRecord[],date:string,gymDates:string[]=[]){
 const grassWeight=.5,gymWeight=1;
 const tasks=records.filter(record=>record.kind==='outdoor-task');
 const activeDaily=tasks.filter(task=>task.data.cadence==='daily'&&task.data.createdDate<=date);
 const goal=Math.max(3,activeDaily.length);
 const days=Array.from({length:7},(_,index)=>shiftDate(date,index-6)).map(day=>{
  const grass=tasks.filter(task=>completedOn(task,day)).length;
  const gym=gymDates.filter(workoutDate=>workoutDate===day).length;
  const grassPoints=grass*grassWeight,gymPoints=gym*gymWeight;
  return {date:day,grass,gym,count:grass+gym,grassPoints,gymPoints,points:grassPoints+gymPoints};
 });
 const current=days.at(-1),grassActivities=current?.grass||0,gymActivities=current?.gym||0,totalActivities=grassActivities+gymActivities;
 // Three points of evidence are required before the balance can reach an extreme.
 // Unfilled points are neutral, so one action moves the meter without deciding it.
 const grassPoints=grassActivities*grassWeight,gymPoints=gymActivities*gymWeight,balancePoints=grassPoints+gymPoints;
 const evidenceFloor=3,neutralPoints=Math.max(0,evidenceFloor-balancePoints),balancedTotal=Math.max(evidenceFloor,balancePoints);
 const progress=Math.max(0,Math.min(1,(grassPoints+neutralPoints/2)/balancedTotal));
 return {tasks,days,completed:grassActivities,goal,grassActivities,gymActivities,totalActivities,grassWeight,gymWeight,grassPoints,gymPoints,balancePoints,progress};
}
