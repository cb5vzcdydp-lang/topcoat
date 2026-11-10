import {logSchema,workoutSchema,targetsSchema,planSchema} from './domain';
import {toolSchema} from './workspace-tools';
/** Local, read-only structural check. This is not a restore or a guarantee of recovery. */
export function reviewBackup(value:unknown,selectedClient?:string){
 const errors:string[]=[],warnings:string[]=[],counts:Record<string,number>={};
 if(!value||typeof value!=='object'||Array.isArray(value))return {valid:false,errors:['Choose a Form JSON export object.'],warnings,counts};
 const data=value as any;if(data.formatVersion!==2)errors.push('This validator supports Form export version 2.');
 if(!Array.isArray(data.clients)||!data.clients.length)errors.push('The export needs at least one profile.');
 const clients=Array.isArray(data.clients)?data.clients:[],ids=new Set(clients.map((row:any)=>row?.id));
 if(selectedClient&&!ids.has(selectedClient))errors.push('This backup does not contain the profile currently selected.');
 for(const row of clients){if(!row||typeof row.id!=='string'||!row.name||!targetsSchema.safeParse(row.targets).success||!planSchema.safeParse(row.plan).success)errors.push('A profile has missing or invalid targets / workout plan.');}
 const collections=['logs','workouts','meals','workspaceRecords','healthMetrics','workoutTemplates','cardioSessions','recipes','mealPlan','groceries','photos','exerciseVideos'];
 for(const name of collections){const rows=data[name];if(!Array.isArray(rows)){errors.push('Missing collection: '+name);continue}counts[name]=rows.length;if(rows.length>100000){errors.push(name+' exceeds the safe validation limit.');continue}const seen=new Set<string>();for(const row of rows){if(!row||typeof row!=='object'){errors.push(name+' contains a non-record.');break}if(typeof row.id!=='string'||seen.has(row.id)){errors.push(name+' has a missing or duplicate ID.');break}seen.add(row.id);if(row.client&&!ids.has(row.client)){errors.push(name+' references a profile missing from this export.');break}if(name==='logs'&&!logSchema.safeParse(row.data).success){errors.push('A daily log has invalid values.');break}if(name==='workouts'&&!workoutSchema.safeParse(row).success){errors.push('A workout has invalid values.');break}if(name==='workspaceRecords'){try{if(!toolSchema(row.kind).safeParse(row.data).success)errors.push('A '+row.kind+' record needs review.')}catch{warnings.push('Unrecognised private record type: '+String(row.kind));}}if(name==='meals'&&(!row.data||!['calories','protein','carbs','fat'].every(key=>typeof row.data[key]==='number'&&Number.isFinite(row.data[key])&&row.data[key]>=0))){errors.push('A food entry has missing or invalid macros.');break}}}
 warnings.push('Photos and exercise videos are metadata only. Download originals separately.','This checks structure and references locally; it does not restore data or test a disaster-recovery process.');
 return {valid:errors.length===0,errors:[...new Set(errors)].slice(0,30),warnings:[...new Set(warnings)].slice(0,30),counts};
}
