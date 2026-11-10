import {z} from 'zod';
import {healthMetricNames} from './health-import';
import {normaliseMetric} from './health-units';
import {HttpError} from './errors';
export const importedReadingSchema=z.object({id:z.string().min(1).max(180),client:z.string().uuid(),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),metric:z.enum(healthMetricNames),value:z.number().finite().min(0).max(100000),unit:z.string().max(30),source:z.string().trim().min(1).max(120)}).refine(row=>{const date=new Date(row.date+'T12:00Z');return Number.isFinite(+date)&&date.toISOString().slice(0,10)===row.date},'Use a valid calendar date.');
const fields=['id','client','date','metric','value','unit','source','created'] as const;
const snapshot=(row:any)=>JSON.stringify(Object.fromEntries(fields.map(field=>[field,row[field]])));
const predicate="id=? AND client=? AND date=? AND metric=? AND value=? AND unit=? AND source=? AND created=?";
const values=(row:any)=>fields.map(field=>row[field]);

export async function saveHealthImportBatch(db:any,b:{id:string;client:string;policy:string;rows?:unknown[]}){
 if(b.policy==='keep-both')throw new HttpError(400,'For health readings, choose skip or merge. Use a corrected source/date mapping to make a distinct reading.');
 const rows=z.array(importedReadingSchema).max(20).parse(b.rows);let saved=0,skipped=0;
 for(const parsed of rows){
  if(parsed.client!==b.client||!parsed.id.startsWith(b.client+':'))throw new HttpError(400,'Health reading belongs to a different profile.');
  const row={...parsed,...normaliseMetric(parsed.metric,parsed.value,parsed.unit)};
  if(await db.prepare('SELECT 1 AS ok FROM import_items WHERE batch=? AND entry_key=?').bind(b.id,row.id).first()){skipped++;continue;}
  const before=await db.prepare('SELECT * FROM health_metrics WHERE id=?').bind(row.id).first();
  if(before&&before.client!==b.client)throw new HttpError(404,'Health reading not found.');
  if(before&&b.policy==='skip'){skipped++;continue;}
  const after={...row,created:new Date().toISOString()};
  const write=before?db.prepare('UPDATE health_metrics SET date=?,metric=?,value=?,unit=?,source=?,created=? WHERE '+predicate).bind(after.date,after.metric,after.value,after.unit,after.source,after.created,...values(before)):db.prepare('INSERT INTO health_metrics(id,client,date,metric,value,unit,source,created) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(...values(after));
  const results=await db.batch([write,db.prepare("INSERT INTO import_items(batch,entry_key,table_name,before_data,after_data) SELECT ?,?,'health_metrics',?,? WHERE EXISTS(SELECT 1 FROM health_metrics WHERE "+predicate+") ON CONFLICT(batch,entry_key) DO NOTHING").bind(b.id,row.id,before?snapshot(before):null,snapshot(after),...values(after))]);
  if(!results[0].meta.changes)throw new HttpError(409,'A health reading changed during import. Review it before retrying.');saved++;
 }
 return {saved,skipped};
}
export async function rollbackHealthImport(db:any,batch:string,client:string,item:any){
 const after=JSON.parse(item.after_data);if(after.client!==client)throw new HttpError(404,'Health reading not found.');
 const before=item.before_data?JSON.parse(item.before_data):null;
 const write=before?db.prepare('UPDATE health_metrics SET date=?,metric=?,value=?,unit=?,source=?,created=? WHERE '+predicate).bind(before.date,before.metric,before.value,before.unit,before.source,before.created,...values(after)):db.prepare('DELETE FROM health_metrics WHERE '+predicate).bind(...values(after));
 const result=await write.run(),restored=!!result.meta.changes;
 await db.prepare('UPDATE import_items SET status=? WHERE batch=? AND entry_key=?').bind(restored?'rolled-back':'modified',batch,item.entry_key).run();return restored;
}
