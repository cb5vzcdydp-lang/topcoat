import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,readdir,mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url),r=createRequire(require.resolve('wrangler/package.json')),{build}=r('esbuild'),{Miniflare}=r('miniflare');await mkdir('.test-output',{recursive:true});
const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("test")}}',d1Databases:['DB'],r2Buckets:['BUCKET'],compatibilityDate:'2026-01-01'});
try{const DB=await mf.getD1Database('DB');globalThis.__roadmapEnv={DB,AUTH_MODE:'sites',BUCKET:await mf.getR2Bucket('BUCKET')};for(const file of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort())for(const s of (await readFile('drizzle/'+file,'utf8')).split('--> statement-breakpoint').filter(v=>v.trim()))await DB.prepare(s.trim()).run();
const plugin={name:'env',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const env=globalThis.__roadmapEnv;',loader:'js'}))}};
for(const name of ['data','preferences','records','social','social/media','import-batches','export'])await build({entryPoints:['app/api/'+name+'/route.ts'],outfile:'.test-output/roadmap-'+name.replace('/','-')+'.mjs',bundle:true,format:'esm',platform:'node',plugins:[plugin]});
const importApi=await import('../.test-output/roadmap-import-batches.mjs');
const exportApi=await import('../.test-output/roadmap-export.mjs');
const data=await import('../.test-output/roadmap-data.mjs'),prefs=await import('../.test-output/roadmap-preferences.mjs'),records=await import('../.test-output/roadmap-records.mjs'),social=await import('../.test-output/roadmap-social.mjs');
const request=(user,path,body)=>new Request('https://form.test/api/'+path,{method:body?'POST':'GET',headers:{Origin:'https://form.test','Content-Type':'application/json',...(user?{'oai-authenticated-user-id':user}:{})},...(body?{body:JSON.stringify(body)}:{})});
async function call(api,user,body){const res=await api[body?'POST':'GET'](request(user,'test',body));return {status:res.status,data:await res.json()}}
assert.equal((await call(prefs,null)).status,401);
const defaults=await call(prefs,'a');assert.equal(defaults.data.version,0);const custom={...defaults.data.preferences,accent:'#c1a0ff',largeText:true};assert.equal((await call(prefs,'a',{preferences:custom,version:0})).status,200);assert.equal((await call(prefs,'a',{preferences:custom,version:0})).status,409);assert.equal((await call(prefs,'b')).data.preferences.largeText,false);assert.equal((await call(prefs,'a')).data.preferences.accent,'#c1a0ff');
const ranges=[{min:2,max:7},{min:8,max:14}];assert.equal((await call(prefs,'a',{preferences:{...custom,repRecordRanges:ranges},version:1})).status,200);assert.deepEqual((await call(prefs,'a')).data.preferences.repRecordRanges,ranges);assert.notDeepEqual((await call(prefs,'b')).data.preferences.repRecordRanges,ranges);assert.equal((await call(prefs,'a',{preferences:{...custom,repRecordRanges:[{min:8,max:2}]},version:2})).status,400);assert.equal((await call(prefs,'a',{preferences:custom,version:1})).status,409);assert.deepEqual((await call(prefs,'a')).data.preferences.repRecordRanges,ranges);
const profile=await call(data,'a',{action:'personal',name:'A'}),client=profile.data.id;const other=await call(data,'b',{action:'personal',name:'B'}),otherClient=other.data.id;
// Renaming keeps the same personal profile and cannot change another account.
assert.equal((await call(data,'a',{action:'renamePersonal',client,name:'My own name',version:1})).status,200);
assert.equal((await call(data,'b',{action:'renamePersonal',client,name:'Wrong account',version:2})).status,404);
assert.equal((await call(data,'a',{action:'renamePersonal',client,name:'Stale update',version:1})).status,409);
assert.equal((await call(data,'a')).data.clients.find(c=>c.id===client).name,'My own name');
const skipRecord={action:'save',id:`leg-skip:${client}:2026-10-23`,client,kind:'leg-skip',version:0,data:{date:'2026-10-23',name:'Leg skip bonus'}};
assert.equal((await call(records,'a',skipRecord)).status,200);assert.equal((await call(records,'a',skipRecord)).status,200);assert.equal((await call(records,'b',skipRecord)).status,404);
assert.equal((await DB.prepare('SELECT COUNT(*) AS n FROM workspace_records WHERE id=?').bind(skipRecord.id).first()).n,1);
assert.equal((await call(records,'a',{...skipRecord,id:'bad-bonus',data:{...skipRecord.data,points:999999}})).status,400);
const importedWorkout={id:'hevy-upper-2026-10-20',date:'2026-10-20',name:'Hevy Upper',notes:'Imported from Hevy',sets:[{exerciseId:'bench-press-barbell',name:'Bench Press (Barbell)',muscle:'Chest',equipment:'free-weight',weight:80,bandColors:[],gymPinAdded:false,gymPinWeight:0,reps:8,completed:true,warmup:false},{exerciseId:'bench-press-barbell',name:'Bench Press (Barbell)',muscle:'Chest',equipment:'free-weight',weight:80,bandColors:[],gymPinAdded:false,gymPinWeight:0,reps:7,completed:true,warmup:false}]};
const importedResult=await call(data,'a',{action:'importWorkouts',client,value:[importedWorkout]});assert.equal(importedResult.status,200);assert.equal(importedResult.data.templatesCreated,1);const importedState=await call(data,'a');assert.equal(importedState.data.workoutTemplates.find(t=>t.name==='Hevy Upper').exercises[0].sets,2);assert.equal(importedState.data.workouts.find(w=>w.name==='Hevy Upper').templateId,importedState.data.workoutTemplates.find(t=>t.name==='Hevy Upper').id);
// Private grocery labels validate complete macros/prices, persist exact values, and reject stale/cross-account writes.
const seed=JSON.parse(await readFile('lib/supermarket-products.json','utf8'))[0],{id:productId,portionAmounts,provenance,...groceryData}=seed,groceryId=crypto.randomUUID(),grocery={action:'save',id:groceryId,client,kind:'supermarket-product',version:0,data:{...groceryData,productId,portions:portionAmounts.join(',')}};
assert.equal((await call(records,'a',grocery)).status,200);assert.equal((await call(records,'a',grocery)).status,200);assert.equal((await call(records,'b',grocery)).status,404);
assert.equal((await call(records,'a',{...grocery,data:{...grocery.data,protein:undefined}})).status,400);
assert.equal((await call(records,'a',{...grocery,version:1,data:{...grocery.data,priceCents:199}})).status,200);
assert.equal((await call(records,'a',{...grocery,version:1,data:{...grocery.data,priceCents:299}})).status,409);
assert.equal((await DB.prepare('SELECT COUNT(*) AS n FROM workspace_records WHERE id=?').bind(groceryId).first()).n,1);
const onboarding={action:'save',id:crypto.randomUUID(),client,kind:'onboarding',version:0,data:{name:'My first week',backupChecked:true,backupDate:'2026-10-25',hidden:true}};
assert.equal((await call(records,'a',onboarding)).status,200);assert.equal((await call(records,'b',onboarding)).status,404);

const id=crypto.randomUUID(),record={action:'save',id,client,kind:'habit',version:0,data:{name:'Walk',weeklyTarget:3}};
assert.equal((await call(records,'a',record)).status,200);assert.equal((await call(records,'a',record)).status,200);assert.equal((await call(records,'b',record)).status,404);assert.equal((await call(records,'b',{...record,client:otherClient})).status,404);
assert.equal((await call(records,'a',{...record,version:1,data:{name:'Walk',weeklyTarget:4}})).status,200);
const conflict=await call(records,'a',{...record,version:1,data:{name:'Walk',weeklyTarget:5}});assert.equal(conflict.status,409);assert.equal(conflict.data.server.data.weeklyTarget,4);
const history=await call(records,'a',{...record,action:'history',version:2});assert.equal(history.data.history.length,2);
assert.equal((await call(records,'a',{...record,action:'delete',version:2})).status,200);
assert.equal((await call(records,'a',{...record,action:'restore',version:3,historyVersion:1})).status,200);
const rows=await records.GET(new Request('https://form.test/api/records?client='+client,{headers:{'oai-authenticated-user-id':'a'}}));assert.equal((await rows.json()).records.find(r=>r.kind==='habit').data.weeklyTarget,3);
assert.equal((await call(records,'a',{...record,id:crypto.randomUUID(),data:{name:'Bad',weeklyTarget:99}})).status,400);
for(const user of ['a','b'])assert.equal((await call(social,user,{action:'profile',handle:'profile_'+user,displayName:user})).status,200);
await call(social,'a',{action:'friend_request',handle:'profile_b'});await call(social,'b',{action:'friend_request',handle:'profile_a'});
const privatePost=await call(social,'a',{action:'post',kind:'text',body:'Only me'});assert.equal(privatePost.status,200);assert.equal((await call(social,'b')).data.feed.some(p=>p.id===privatePost.data.id),false);
const shared=await call(social,'a',{action:'post',kind:'text',body:'Shared',audience:'selected',allowedUids:['b']});assert.equal(shared.status,200);assert.ok((await call(social,'b')).data.feed.some(p=>p.id===shared.data.id));
assert.equal((await call(social,'b',{action:'edit_post',postId:shared.data.id,body:'No',version:1})).status,404);
assert.equal((await call(social,'a',{action:'comments_open',postId:shared.data.id,open:false})).status,200);assert.equal((await call(social,'b',{action:'comment',postId:shared.data.id,body:'No'})).status,403);
assert.equal((await call(social,'b',{action:'control',uid:'a',kind:'block',enabled:true})).status,200);assert.equal((await call(social,'b',{action:'like',postId:shared.data.id,liked:false})).status,404);assert.equal((await call(social,'a',{action:'friend_request',handle:'profile_b'})).status,404);

const batch=crypto.randomUUID(),importRow={id:'imp-test',date:'2026-10-19',name:'Imported meal',calories:100,protein:5,carbs:10,fat:4};
const importBody={action:'save',id:batch,client,kind:'meals',policy:'skip',source:'Fixture',rows:[importRow]};
assert.equal((await call(importApi,'a',importBody)).data.saved,1);assert.equal((await call(importApi,'a',importBody)).data.skipped,1);
assert.equal((await call(importApi,'b',{action:'rollback',id:batch,client})).status,404);
assert.equal((await call(importApi,'a',{action:'rollback',id:batch,client})).data.restored,1);
assert.equal(await DB.prepare('SELECT id FROM meals WHERE id=?').bind(client+':imp-test').first(),null);
const batch2=crypto.randomUUID();assert.equal((await call(importApi,'a',{...importBody,id:batch2,policy:'keep-both'})).data.saved,1);
const imported=await DB.prepare('SELECT * FROM meals WHERE client=?').bind(client).first();assert.ok(JSON.parse(imported.data).id.startsWith(batch2));
const edited=JSON.stringify({...JSON.parse(imported.data),calories:110});await DB.prepare('UPDATE meals SET data=? WHERE id=?').bind(edited,imported.id).run();assert.equal((await call(importApi,'a',{action:'rollback',id:batch2,client})).data.modified,1);
assert.equal(JSON.parse((await DB.prepare('SELECT data FROM meals WHERE id=?').bind(imported.id).first()).data).calories,110);
// The reviewed mapper must create templates just like the simple uploader, and undo them safely.
const mappedBatch=crypto.randomUUID(),mappedWorkout={...importedWorkout,id:'mapped-upper',name:'Mapped Upper'};
const mappedBody={action:'save',id:mappedBatch,client,kind:'workouts',policy:'skip',source:'Mapped Hevy',rows:[mappedWorkout]};
const mappedResult=await call(importApi,'a',mappedBody);assert.equal(mappedResult.status,200);assert.equal(mappedResult.data.saved,1);assert.equal(mappedResult.data.templatesCreated,1);
const mappedState=await call(data,'a'),mappedTemplate=mappedState.data.workoutTemplates.find(t=>t.name==='Mapped Upper');assert.equal(mappedTemplate.exercises[0].sets,2);assert.equal(mappedState.data.workouts.find(w=>w.name==='Mapped Upper').templateId,mappedTemplate.id);
assert.equal((await call(importApi,'a',mappedBody)).data.templatesCreated,0);
assert.equal((await call(importApi,'a',{action:'rollback',id:mappedBatch,client})).data.restored,2);
assert.equal(await DB.prepare('SELECT id FROM workout_templates WHERE id=?').bind(mappedTemplate.id).first(),null);
assert.equal(await DB.prepare('SELECT id FROM workouts WHERE id=?').bind(client+':mapped-upper').first(),null);
const editedBatch=crypto.randomUUID(),editedWorkout={...importedWorkout,id:'mapped-edited',name:'Keep my template edit'};
await call(importApi,'a',{...mappedBody,id:editedBatch,rows:[editedWorkout]});
let editable=(await call(data,'a')).data.workoutTemplates.find(t=>t.name==='Keep my template edit');
assert.equal((await call(data,'a',{action:'workoutTemplate',client,version:editable.version,value:{...editable,name:'My renamed template'}})).status,200);
const undoEdited=await call(importApi,'a',{action:'rollback',id:editedBatch,client});assert.equal(undoEdited.data.modified,1);assert.equal(undoEdited.data.restored,1);
assert.equal((await DB.prepare('SELECT name FROM workout_templates WHERE id=?').bind(editable.id).first()).name,'My renamed template');
// A single import can span chunks; rollback retains the template that existed before the batch.
const updateBatch=crypto.randomUUID();const updateWorkout={...importedWorkout,id:'mapped-newer',date:'2026-10-21'};
const updateResult=await call(importApi,'a',{...mappedBody,id:updateBatch,rows:[updateWorkout]});assert.equal(updateResult.data.templatesUpdated,1);
const updatedTemplate=(await call(data,'a')).data.workoutTemplates.find(t=>t.name==='Hevy Upper');assert.equal(updatedTemplate.importedDate,'2026-10-21');
const rollbackUpdate=await call(importApi,'a',{action:'rollback',id:updateBatch,client});assert.equal(rollbackUpdate.data.restored,2);
const restoredTemplate=(await call(data,'a')).data.workoutTemplates.find(t=>t.name==='Hevy Upper');assert.equal(restoredTemplate.importedDate,'2026-10-20');assert.ok(restoredTemplate.version>updatedTemplate.version);
const chunkBatch=crypto.randomUUID(),firstChunk={...importedWorkout,id:'chunk-old',name:'Chunked history',date:'2026-10-19'},secondChunk={...firstChunk,id:'chunk-new',date:'2026-10-20'};
assert.equal((await call(importApi,'a',{...mappedBody,id:chunkBatch,rows:[firstChunk]})).data.templatesCreated,1);
assert.equal((await call(importApi,'a',{...mappedBody,id:chunkBatch,rows:[secondChunk]})).data.templatesUpdated,1);
assert.equal((await call(importApi,'a',{...mappedBody,id:chunkBatch,rows:[secondChunk]})).data.saved,0);
assert.equal((await call(importApi,'a',{action:'rollback',id:chunkBatch,client})).data.restored,3);
assert.equal((await call(data,'a')).data.workoutTemplates.some(t=>t.name==='Chunked history'),false);
console.log('PASS mapped workout templates, retry safety, full batch rollback and manual template edit preservation');
console.log('PASS synced appearance, imported workout templates, preferences conflict handling, private records, idempotent record saves, history/restore, validation, private/selected audiences, comment permissions, blocking and cross-account isolation');

await build({entryPoints:['lib/backup-review.ts'],outfile:'.test-output/backup-review.mjs',bundle:true,format:'esm',platform:'node'});
const {reviewBackup}=await import('../.test-output/backup-review.mjs');
const backupResponse=await exportApi.GET(new Request('https://form.test/api/export?client='+client,{headers:{'oai-authenticated-user-id':'a'}}));assert.equal(backupResponse.status,200);const backup=await backupResponse.json();assert.equal(backup.clients.length,1);assert.equal(backup.clients[0].id,client);const reviewed=reviewBackup(backup,client);assert.deepEqual(reviewed.errors,[]);assert.equal(reviewed.valid,true);assert.equal(reviewBackup(backup,otherClient).valid,false);assert.equal(reviewBackup({...backup,formatVersion:999},client).valid,false);assert.equal(reviewBackup({...backup,workouts:undefined},client).valid,false);assert.equal(reviewBackup({...backup,logs:[{id:'bad',client:otherClient,data:{}}]},client).valid,false);
assert.equal((await exportApi.GET(new Request('https://form.test/api/export?client='+client,{headers:{'oai-authenticated-user-id':'b'}}))).status,404);
console.log('PASS private supermarket labels and onboarding, complete-field validation, duplicate retries, version conflicts and read-only validation of a real account export');

// Reviewed health imports retain originals and undo only unchanged readings.
const healthId=client+':csv:health-review',healthRow={id:healthId,client,date:'2026-10-20',metric:'steps',value:100,unit:'steps',source:'Reviewed Watch'};
assert.equal((await call(data,'a',{action:'healthMetrics',client,value:[healthRow]})).status,200);
const healthBatch=crypto.randomUUID();
const healthSaved=await call(importApi,'a',{action:'save',id:healthBatch,client,kind:'health',source:'Health CSV',policy:'merge',rows:[{...healthRow,value:200}]});assert.equal(healthSaved.status,200,JSON.stringify(healthSaved.data));
assert.equal((await DB.prepare('SELECT value FROM health_metrics WHERE id=?').bind(healthId).first()).value,200);
assert.equal((await call(importApi,'a',{action:'save',id:healthBatch,client,kind:'health',policy:'merge',rows:[{...healthRow,value:200}]})).data.skipped,1);
assert.equal((await call(importApi,'b',{action:'rollback',id:healthBatch,client})).status,404);
assert.equal((await call(importApi,'a',{action:'rollback',id:healthBatch,client})).data.restored,1);
assert.equal((await DB.prepare('SELECT value FROM health_metrics WHERE id=?').bind(healthId).first()).value,100);
const modifiedBatch=crypto.randomUUID();await call(importApi,'a',{action:'save',id:modifiedBatch,client,kind:'health',policy:'merge',rows:[{...healthRow,value:300}]});
await call(data,'a',{action:'healthMetrics',client,value:[{...healthRow,value:400}]});
assert.equal((await call(importApi,'a',{action:'rollback',id:modifiedBatch,client})).data.modified,1);assert.equal((await DB.prepare('SELECT value FROM health_metrics WHERE id=?').bind(healthId).first()).value,400);
const newBatch=crypto.randomUUID(),newHealth={...healthRow,id:client+':csv:new-health'};await call(importApi,'a',{action:'save',id:newBatch,client,kind:'health',rows:[newHealth]});await call(importApi,'a',{action:'rollback',id:newBatch,client});assert.equal(await DB.prepare('SELECT id FROM health_metrics WHERE id=?').bind(newHealth.id).first(),null);
console.log('PASS reviewed health import merge/retry, original restoration, later-edit preservation, new-reading removal and account isolation');
}finally{await mf.dispose()}
