import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile,readdir} from 'node:fs/promises';
const require=createRequire(import.meta.url),runtime=createRequire(require.resolve('wrangler/package.json')),{build}=runtime('esbuild'),{Miniflare}=runtime('miniflare');
await mkdir('.test-output',{recursive:true});
await build({entryPoints:['lib/water.ts'],outfile:'.test-output/water.mjs',bundle:true,format:'esm',platform:'node'});
const {applyWaterAction,waterEntriesForLog}=await import('../.test-output/water.mjs');
assert.equal(waterEntriesForLog({water:1.25})[0].ml,1250);
const added=applyWaterAction({water:1.25},{operation:'add',entry:{id:'glass-1',ml:250,time:'10:00'}});
assert.equal(added.water,1.5);assert.equal(added.waterEntries.length,2);
assert.equal(applyWaterAction(added,{operation:'add',entry:{id:'glass-1',ml:250,time:'10:00'}}).water,1.5);
assert.equal(applyWaterAction(added,{operation:'delete',id:'glass-1'}).water,1.25);
assert.throws(()=>applyWaterAction(added,{operation:'add',entry:{id:'large',ml:20000,time:''}}));
assert.throws(()=>applyWaterAction(added,{operation:'edit',entry:{id:'missing',ml:100,time:''}}));

const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("test")}}',d1Databases:['DB'],r2Buckets:['BUCKET'],compatibilityDate:'2026-01-01'});
try{
 const DB=await mf.getD1Database('DB');globalThis.__waterEnv={DB,AUTH_MODE:'sites',BUCKET:await mf.getR2Bucket('BUCKET')};
 for(const file of (await readdir('drizzle')).filter(file=>file.endsWith('.sql')).sort())for(const statement of (await readFile('drizzle/'+file,'utf8')).split('--> statement-breakpoint').filter(value=>value.trim()))await DB.prepare(statement.trim()).run();
 await build({entryPoints:['app/api/data/route.ts'],outfile:'.test-output/water-api.mjs',bundle:true,format:'esm',platform:'node',plugins:[{name:'water-env',setup(builder){builder.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'water-test'}));builder.onLoad({filter:/.*/,namespace:'water-test'},()=>({contents:'export const env=globalThis.__waterEnv;',loader:'js'}))}}]});
 const api=await import('../.test-output/water-api.mjs');
 async function call(user,body){const response=await api.POST(new Request('https://form.test/api/data',{method:'POST',headers:{Origin:'https://form.test','Content-Type':'application/json',...(user?{'oai-authenticated-user-id':user}:{})},body:JSON.stringify(body)}));return {status:response.status,body:await response.json()}}
 const client=(await call('water-a',{action:'personal',name:'Water A'})).body.id;
 const value={action:'water',client,date:'2026-10-21',operation:'add',entry:{id:'glass-1',ml:250,time:'10:00'}};
 assert.equal((await call(null,value)).status,401);assert.equal((await call('water-b',value)).status,404);
 let result=await call('water-a',value);assert.equal(result.status,200);assert.equal(result.body.log.data.water,.25);
 result=await call('water-a',value);assert.equal(result.body.log.data.water,.25);assert.equal(result.body.log.data.waterEntries.length,1);
 result=await call('water-a',{...value,entry:{id:'glass-2',ml:500,time:'11:00'}});assert.equal(result.body.log.data.water,.75);
 result=await call('water-a',{...value,operation:'edit',entry:{id:'glass-1',ml:300,time:'10:30'}});assert.equal(result.body.log.data.water,.8);
 result=await call('water-a',{...value,operation:'delete',id:'glass-2'});assert.equal(result.body.log.data.water,.3);
 result=await call('water-a',{...value,operation:'restore',entry:{id:'glass-2',ml:500,time:'11:00'}});assert.equal(result.body.log.data.water,.8);
 const checkin={...result.body.log.data,water:1.2,weight:80};
 assert.equal((await call('water-a',{action:'log',client,date:value.date,value:checkin,expectedUpdated:result.body.log.updated})).status,200);
 result=await call('water-a',{...value,entry:{id:'glass-3',ml:250,time:'12:00'}});assert.equal(result.body.log.data.water,1.45);assert.equal(result.body.log.data.weight,80);assert.equal(result.body.log.data.waterEntries.filter(entry=>entry.label==='Daily check-in adjustment').length,1);
 assert.equal((await call('water-a',{...value,date:'2026-02-31'})).status,400);
 assert.equal((await call('water-a',{...value,entry:{id:'invalid',ml:0,time:''}})).status,400);
 assert.equal((await call('water-a',{...value,entry:{id:'invalid',ml:20000,time:''}})).status,400);
 assert.equal((await call('water-a',{...value,entry:{id:'invalid',ml:100,time:'99:99'}})).status,400);
 console.log('PASS water legacy totals, add/edit/delete/undo, duplicate-safe retries, check-in reconciliation, preserved fields, account isolation and validation');
}finally{await mf.dispose()}
