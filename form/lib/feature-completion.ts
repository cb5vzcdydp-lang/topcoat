import {shiftDate} from './domain';

export function progressionRule(records:any[],exercise:{id:string;name:string}){
 const data=records.find(row=>row.kind==='exercise-profile'&&(row.data.exerciseId===exercise.id||row.data.name===exercise.name))?.data;
 if(!data||![data.repCeiling,data.loadJump,data.repeatSessions].some(Number.isFinite))return undefined;
 return {repCeiling:Number.isFinite(data.repCeiling)?data.repCeiling:undefined,loadJump:Number.isFinite(data.loadJump)?data.loadJump:undefined,repeatSessions:Number.isFinite(data.repeatSessions)?data.repeatSessions:undefined};
}
export function techniqueSegments(records:any[],exerciseId:string,name:string){
 const changes=records.filter(row=>!row.deleted&&['exercise-profile','technique-change'].includes(row.kind)&&(row.data.exerciseId===exerciseId||row.data.name===name)&&row.data.annotation&&/^\d{4}-\d{2}-\d{2}$/.test(row.data.date||''));
 const dates=[...new Map(changes.map(row=>[row.data.date,row])).values()].sort((a,b)=>a.data.date.localeCompare(b.data.date));
 return [{id:'baseline',label:'Before first annotation',start:'0001-01-01',end:dates[0]?shiftDate(dates[0].data.date,-1):'9999-12-31'},...dates.map((row,index)=>({id:row.id,label:row.data.date+' · '+row.data.annotation,start:row.data.date,end:dates[index+1]?shiftDate(dates[index+1].data.date,-1):'9999-12-31'}))];
}
export function weightAtTargetRange(weight:number,low:number,high:number,target:number){
 if(![weight,low,high,target].every(Number.isFinite)||weight<=0||low<0||high<low||high>75||target<0||target>=75)throw new Error('Use a positive weight and valid body-fat bounds.');
 return [weight*(1-high/100)/(1-target/100),weight*(1-low/100)/(1-target/100)];
}
export function recipeContentVersion(value:any){
 const text=JSON.stringify({name:value.name,servings:value.servings,ingredients:value.ingredients||value.nutrition?.composition?.items,reference:value.nutrition?.reference||{calories:value.calories,protein:value.protein,carbs:value.carbs,fat:value.fat}});
 let digest=2166136261;for(let index=0;index<text.length;index++){digest^=text.charCodeAt(index);digest=Math.imul(digest,16777619);}return 'content-'+(digest>>>0).toString(16).padStart(8,'0');
}
export function recipeLogSnapshot(value:any){return JSON.stringify({formatVersion:1,id:value.id,name:value.name,version:value.version??recipeContentVersion(value),contentVersion:recipeContentVersion(value),servings:value.servings??value.nutrition?.composition?.servings,ingredients:value.ingredients});}
