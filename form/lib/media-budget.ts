import {HttpError} from './errors';
export const APP_MEDIA_CAP_BYTES=1024*1024*1024;
const budgetId='form:shared-media-budget';
const cache=new WeakMap<object,{at:number;value:any}>();
export async function appMediaUsage(bucket:any,cached=true){
 if(!bucket)throw new HttpError(503,'Private media storage is unavailable.');
 const prior=cache.get(bucket);if(cached&&prior&&Date.now()-prior.at<15000)return prior.value;
 let bytes=0,count=0,cursor:string|undefined;for(let page=0;page<10;page++){
  const result=await bucket.list({limit:1000,...(cursor?{cursor}:{})});for(const object of result.objects){bytes+=object.size;count++;}
  if(!result.truncated){const value={bytes,count,capBytes:APP_MEDIA_CAP_BYTES,checkedAt:new Date().toISOString()};cache.set(bucket,{at:Date.now(),value});return value;}cursor=result.cursor;
 }
 throw new HttpError(503,'The media inventory is too large to verify safely. Ask the app owner to review storage.');
}
async function reserve(db:any,bucket:any,bytes:number){
 const now=Date.now(),id=crypto.randomUUID(),stamp=new Date().toISOString();
 await db.prepare("INSERT INTO workspace_records(id,owner,client,kind,data,version,created,updated,deleted) VALUES(?,'__form_system__',NULL,'media-budget',?,1,?,?,0) ON CONFLICT(id) DO NOTHING").bind(budgetId,JSON.stringify({reservations:{}}),stamp,stamp).run();
 for(let attempt=0;attempt<8;attempt++){
  const row=await db.prepare('SELECT data,version FROM workspace_records WHERE id=?').bind(budgetId).first(),data=JSON.parse(row.data),reservations=Object.fromEntries(Object.entries(data.reservations||{}).filter(([,value]:any)=>value.at>now-300000));
  // Measure after reading the version. A concurrent reservation/release invalidates this CAS and forces a fresh inventory.
  const usage=await appMediaUsage(bucket,false);
  const reserved=Object.values(reservations).reduce<number>((sum,value:any)=>sum+Number(value.bytes||0),0);
  if(usage.bytes+reserved+bytes>APP_MEDIA_CAP_BYTES)throw new HttpError(413,'The shared 1 GB app media budget is full. Remove unused files in Privacy & account tools before uploading.');
  reservations[id]={bytes,at:now};const result=await db.prepare('UPDATE workspace_records SET data=?,version=version+1,updated=? WHERE id=? AND version=?').bind(JSON.stringify({reservations}),stamp,budgetId,row.version).run();
  if(result.meta.changes)return id;
 }
 throw new HttpError(409,'Other uploads are in progress. Try this upload again.');
}
async function release(db:any,id:string){await db.prepare("UPDATE workspace_records SET data=json_remove(data,?),version=version+1 WHERE id=?").bind('$.reservations.'+JSON.stringify(id),budgetId).run();}
export async function putBudgetedMedia(bucket:any,db:any,uid:string,key:string,body:any,options:any={}){
 const bytes=body?.byteLength??body?.size;if(!Number.isFinite(bytes)||bytes<=0)throw new HttpError(400,'Choose a non-empty media file.');
 const old=await bucket.head(key),reservation=await reserve(db,bucket,Math.max(0,bytes-(old?.size||0)));
 try{
  await bucket.put(key,body,options);cache.delete(bucket);
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key)),id='media-upload:'+Array.from(new Uint8Array(digest)).map(n=>n.toString(16).padStart(2,'0')).join(''),now=new Date().toISOString();
  await db.prepare("INSERT INTO workspace_records(id,owner,client,kind,data,version,created,updated,deleted) VALUES(?,?,NULL,'media-upload',?,1,?,?,0) ON CONFLICT(id) DO UPDATE SET data=excluded.data,version=workspace_records.version+1,updated=excluded.updated WHERE workspace_records.owner=excluded.owner").bind(id,uid,JSON.stringify({key,bytes,contentType:options.httpMetadata?.contentType||'application/octet-stream'}),now,now).run();
 }catch(error){if(!old)await bucket.delete(key).catch(()=>{});throw error;}finally{await release(db,reservation).catch(()=>{});}
}
