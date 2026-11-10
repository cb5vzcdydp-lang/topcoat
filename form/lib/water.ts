import {z} from 'zod';

export const waterEntrySchema=z.object({
 id:z.string().min(1).max(100).regex(/^[A-Za-z0-9:_-]+$/),
 ml:z.number().int().min(-20000).max(20000).refine(value=>value!==0,'Enter a non-zero water amount.'),
 time:z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/).or(z.literal('')).default(''),
 label:z.string().max(80).optional(),
});
export type WaterEntry=z.infer<typeof waterEntrySchema>;
export const waterActionSchema=z.discriminatedUnion('operation',[
 z.object({operation:z.literal('add'),entry:waterEntrySchema.refine(entry=>entry.ml>0,'Enter a positive amount.')}),
 z.object({operation:z.literal('restore'),entry:waterEntrySchema}),
 z.object({operation:z.literal('edit'),entry:waterEntrySchema}),
 z.object({operation:z.literal('delete'),id:z.string().min(1).max(100)}),
]);
export const waterTotalMl=(entries:WaterEntry[])=>entries.reduce((sum,entry)=>sum+entry.ml,0);

/** Older check-ins only stored a total. Keep it as a named entry when a ledger starts. */
export function waterEntriesForLog(log:{water?:number|null;waterEntries?:WaterEntry[]}){
 const entries=(log.waterEntries||[]).map(entry=>({...entry})),total=Math.round((log.water||0)*1000),difference=total-waterTotalMl(entries);
 if(difference)entries.push({id:entries.length?`checkin-adjustment-${crypto.randomUUID()}`:'previous-total',ml:difference,time:'',label:entries.length?'Daily check-in adjustment':'Previous daily total'});
 return entries;
}

export function applyWaterAction(log:{water?:number|null;waterEntries?:WaterEntry[]},input:unknown){
 const action=waterActionSchema.parse(input),entries=waterEntriesForLog(log);
 let next:WaterEntry[];
 if(action.operation==='add'||action.operation==='restore'){
  const duplicate=entries.find(entry=>entry.id===action.entry.id);
  if(duplicate){if(JSON.stringify(duplicate)!==JSON.stringify(action.entry))throw new Error('This water entry already exists with different values. Reload before editing it.');return {water:waterTotalMl(entries)/1000,waterEntries:entries}}
  next=[...entries,action.entry];
 }else if(action.operation==='delete')next=entries.filter(entry=>entry.id!==action.id);
 else {if(!entries.some(entry=>entry.id===action.entry.id))throw new Error('This water entry no longer exists. Reload your diary.');next=entries.map(entry=>entry.id===action.entry.id?action.entry:entry)}
 const ml=waterTotalMl(next);
 if(ml<0||ml>20000)throw new Error('Daily water must stay between 0 and 20,000 ml.');
 if(next.length>200)throw new Error('A day can hold up to 200 water entries. Edit an existing entry instead.');
 return {water:ml/1000,waterEntries:next};
}
