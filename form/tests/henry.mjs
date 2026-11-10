import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile,readdir} from 'node:fs/promises';
const r=createRequire(createRequire(import.meta.url).resolve('wrangler/package.json')),{build}=r('esbuild'),{Miniflare}=r('miniflare');
await mkdir('.test-output',{recursive:true});
const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("test")}}',d1Databases:['DB'],compatibilityDate:'2026-01-01'});
try{
 const DB=await mf.getD1Database('DB');globalThis.__henryEnv={DB,AUTH_MODE:'sites',GEMINI_API_KEY:'test-only'};
 for(const f of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort())for(const sql of (await readFile('drizzle/'+f,'utf8')).split('--> statement-breakpoint').filter(s=>s.trim()))await DB.prepare(sql.trim()).run();
 await build({entryPoints:['app/api/henry/route.ts'],outfile:'.test-output/henry-api.mjs',bundle:true,format:'esm',platform:'node',plugins:[{name:'env',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const env=globalThis.__henryEnv',loader:'js'}))}}]});
 const route=await import('../.test-output/henry-api.mjs'),client=crypto.randomUUID();
 await DB.prepare("INSERT INTO clients(id,owner,member,name,email,targets,plan,created) VALUES(?,'alice','bob','Alice','a@test','{}','{}',?)").bind(client,new Date().toISOString()).run();
 const headers=user=>({'oai-authenticated-user-id':user,Origin:'https://form.test','Content-Type':'application/json'});
 async function post(user,body){const res=await route.POST(new Request('https://form.test/api/henry',{method:'POST',headers:headers(user),body:JSON.stringify({client,...body})}));return {status:res.status,data:await res.json()}}
 async function get(user,id){const res=await route.GET(new Request('https://form.test/api/henry?client='+client+(id?'&conversation='+id:''),{headers:headers(user)}));return {status:res.status,data:await res.json()}}
 let calls=0,upstream=200,release=null,hold=false,context='';globalThis.fetch=async(url,init)=>{calls++;context=JSON.parse(init.body).messages[0].content;if(hold)await new Promise(resolve=>release=resolve);return Response.json(upstream===200?{choices:[{finish_reason:'stop',message:{content:'Based on your recorded workouts, take a recovery day.'}}]}:{error:{message:'secret upstream'}},{status:upstream})};
 await DB.prepare("INSERT INTO ai_chat_messages(id,client,role,content,created) VALUES(?,?,'user','Earlier question',?)").bind(crypto.randomUUID(),client,new Date().toISOString()).run();
 let snapshot=(await get('alice')).data;assert.equal(snapshot.conversations.length,1);const legacy=snapshot.conversation.id;
 assert.equal((await get('bob')).data.conversations.length,0,'Members never inherit the owner’s private AI history');
 assert.equal((await get('eve')).status,404);
 await post('alice',{action:'delete',conversationId:legacy});assert.equal((await get('alice')).data.conversations.length,0,'Deleting migrated history does not resurrect it');
 const id='henry-'+crypto.randomUUID();let created=await post('alice',{action:'new',conversationId:id});assert.equal(created.status,200);assert.equal((await post('alice',{action:'new',conversationId:id})).data.conversation.id,id);
 assert.equal((await get('alice')).data.conversations.length,1);assert.equal((await get('bob',id)).status,404);assert.equal((await post('bob',{action:'delete',conversationId:id})).status,404);
 snapshot=(await get('alice')).data;let saved=await post('alice',{action:'memory',memory:'I prefer short workouts.',version:snapshot.memoryVersion});assert.equal(saved.status,200);
 assert.equal((await post('alice',{action:'memory',memory:'stale',version:snapshot.memoryVersion})).status,409);assert.equal((await get('bob')).data.memory,'');assert.equal(calls,0,'Opening chats and editing memory never generates AI requests');
 const requestId=crypto.randomUUID();let response=await post('alice',{action:'message',conversationId:id,requestId,message:'Review my week'});assert.equal(response.status,200);assert.equal(response.data.conversation.messages.length,2);assert.match(context,/I prefer short workouts/);assert.match(context,/Your name is Henry/);
 await post('alice',{action:'message',conversationId:id,requestId,message:'Review my week'});assert.equal(calls,1,'Retrying a saved message does not call the provider twice');assert.equal((await get('alice',id)).data.conversation.messages.length,2);
 upstream=429;response=await post('alice',{action:'message',conversationId:id,requestId:crypto.randomUUID(),message:'Again'});assert.equal(response.status,429);assert.equal((await get('alice',id)).data.conversation.messages.length,2,'Failed generation never leaves half a conversation');upstream=200;
 const pendingId=crypto.randomUUID();hold=true;const pending=post('alice',{action:'message',conversationId:id,requestId:pendingId,message:'Pending'});while(!release)await new Promise(resolve=>setTimeout(resolve,10));const before=calls;assert.equal((await post('alice',{action:'message',conversationId:id,requestId:pendingId,message:'Pending'})).status,409);assert.equal(calls,before);await post('alice',{action:'delete',conversationId:id});release();assert.equal((await pending).status,404);hold=false;assert.equal((await get('alice')).data.conversations.length,0,'Deleting an in-flight chat prevents resurrection');
 saved=await post('alice',{action:'memory',memory:'',version:saved.data.memoryVersion});assert.equal(saved.data.memory,'');assert.equal((await get('alice')).data.memory,'');
 delete globalThis.__henryEnv.GEMINI_API_KEY;const next='henry-'+crypto.randomUUID();await post('alice',{action:'new',conversationId:next});assert.equal((await post('alice',{action:'message',conversationId:next,requestId:crypto.randomUUID(),message:'Hello'})).status,503);assert.equal((await get('alice')).data.configured,false);
 const noOrigin=await route.POST(new Request('https://form.test/api/henry',{method:'POST',headers:{'oai-authenticated-user-id':'alice','Content-Type':'application/json'},body:JSON.stringify({client,action:'new',conversationId:'henry-'+crypto.randomUUID()})}));assert.equal(noOrigin.status,403);
 console.log('PASS Henry persistence, separate accounts, legacy migration, memory conflicts/forgetting, idempotency, no implicit AI calls, limits, errors, concurrent sends, deletion during generation and origin protection');
}finally{await mf.dispose()}
