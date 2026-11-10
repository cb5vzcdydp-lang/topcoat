import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile,readdir} from 'node:fs/promises';
const require=createRequire(import.meta.url),r=createRequire(require.resolve('wrangler/package.json'));
const {build}=r('esbuild'),{Miniflare}=r('miniflare');
await mkdir('.test-output',{recursive:true});
const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("test")}}',d1Databases:['DB'],r2Buckets:['BUCKET'],compatibilityDate:'2026-01-01'});
try{
 const DB=await mf.getD1Database('DB'),BUCKET=await mf.getR2Bucket('BUCKET');globalThis.__testEnv={DB,BUCKET,AUTH_MODE:'sites'};
 for(const file of (await readdir('drizzle')).filter(file=>file.endsWith('.sql')).sort()){const sql=await readFile('drizzle/'+file,'utf8');for(const statement of sql.split('--> statement-breakpoint').filter(value=>value.trim()))await DB.prepare(statement.trim()).run()}
 await build({entryPoints:['app/api/social/route.ts'],outfile:'.test-output/social-api-focused.mjs',bundle:true,format:'esm',platform:'node',plugins:[{name:'mock-env',setup(build){build.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'test'}));build.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const env=globalThis.__testEnv;',loader:'js'}))}}]});
 const social=await import('../.test-output/social-api-focused.mjs');
 async function call(user,body){const response=await social.POST(new Request('https://form.test/api/social',{method:'POST',headers:{Origin:'https://form.test','Content-Type':'application/json','oai-authenticated-user-id':user},body:JSON.stringify(body)}));return {status:response.status,data:await response.json()}}
 async function get(user,query=''){const response=await social.GET(new Request('https://form.test/api/social'+(query?'?q='+encodeURIComponent(query):''),{headers:{'oai-authenticated-user-id':user}}));return {status:response.status,data:await response.json()}}
 for(const [user,handle,name] of [['a','alex_lifts','Alex'],['b','bailey_trains','Bailey'],['c','casey_moves','Casey']])assert.equal((await call(user,{action:'profile',handle,displayName:name})).status,200);
 await call('a',{action:'friend_request',handle:'bailey_trains'});let request=(await get('b')).data.incoming[0];assert.equal((await call('b',{action:'friend_accept',id:request.id})).status,200);
 await call('b',{action:'friend_request',handle:'casey_moves'});request=(await get('c')).data.incoming[0];assert.equal((await call('c',{action:'friend_accept',id:request.id})).status,200);
 const suggestions=(await get('a','casey')).data.suggestions;assert.equal(suggestions[0].handle,'casey_moves');assert.equal(suggestions[0].mutual_count,1);assert.deepEqual(suggestions[0].mutual_names,['Bailey']);
 await call('a',{action:'friend_request',handle:'casey_moves'});const outgoing=(await get('a')).data.outgoing[0];assert.equal((await call('a',{action:'friend_cancel',id:outgoing.id})).status,200);assert.equal((await get('a')).data.outgoing.length,0);
 await call('c',{action:'friend_request',handle:'alex_lifts'});const incoming=(await get('a')).data.incoming[0];assert.equal((await call('a',{action:'friend_decline',id:incoming.id})).status,200);assert.equal((await get('a')).data.incoming.length,0);
 const post=await call('a',{action:'post',kind:'text',audience:'private',body:'Temporary'});assert.equal(post.status,200);await call('a',{action:'like',postId:post.data.id,liked:false});await call('a',{action:'comment',postId:post.data.id,body:'Temporary comment'});assert.equal((await call('a',{action:'delete_post',postId:post.data.id})).status,200);assert.ok(!(await get('a')).data.feed.some(item=>item.id===post.data.id));assert.equal((await DB.prepare('SELECT COUNT(*) AS count FROM social_likes WHERE post_id=?').bind(post.data.id).first()).count,0);assert.equal((await DB.prepare('SELECT COUNT(*) AS count FROM social_comments WHERE post_id=?').bind(post.data.id).first()).count,0);
 const start=new Date().toISOString().slice(0,10),end=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
 const challenge=await call('a',{action:'challenge_create',title:'Push-up sprint',metric:'pushup_relative_gain',starts:start,ends:end,baseline:10,friends:['b']});assert.equal(challenge.status,200,JSON.stringify(challenge.data));
 assert.equal((await get('b')).data.challenges[0].metric,'pushup_relative_gain');
 assert.equal((await call('b',{action:'challenge_join',challengeId:challenge.data.id,baseline:5})).status,200);
 assert.equal((await call('a',{action:'challenge_update',challengeId:challenge.data.id,current:15})).status,200);
 const board=(await get('a')).data.challenges[0];assert.equal(board.leaderboard.find(row=>row.uid==='a').score,50);
 await call('b',{action:'challenge_update',challengeId:challenge.data.id,current:6});
 const friend=(await get('a')).data.friends.find(row=>row.uid==='b');assert.equal(friend.label,'Diamond');assert.equal(friend.rankCount,1);assert.equal(friend.slacking,true);
 const nudge=await call('a',{action:'friend_nudge',uid:'b'});assert.equal(nudge.status,200,JSON.stringify(nudge.data));assert.equal((await call('a',{action:'friend_nudge',uid:'b'})).status,429);assert.ok((await get('b')).data.feed.some(item=>item.body.includes('Training nudge')));
 // Valid logger sessions must remain shareable above the old 100-set / 100-rep cap.
 const sharedWorkout=await call('b',{action:'post',kind:'workout',audience:'friends',body:'Long session',workout:{name:'Bodyweight endurance',date:start,sets:Array.from({length:101},()=>({name:'Calf raise',weight:0,reps:150,completed:true}))}});assert.equal(sharedWorkout.status,200,JSON.stringify(sharedWorkout.data));
 // Feed pagination and private posts must not cause false inactivity warnings.
 for(let i=0;i<55;i++)await DB.prepare("INSERT INTO social_posts(id,author,kind,body,created,audience,allowed_uids) VALUES(?,?,'text','A later update',?,'friends','[]')").bind(crypto.randomUUID(),'b',new Date(Date.now()+1000+i).toISOString()).run();
 for(let i=0;i<35;i++)await DB.prepare("INSERT INTO social_posts(id,author,kind,body,workout,created,audience,allowed_uids) VALUES(?,?,'workout','Private workout',?,?,'private','[]')").bind(crypto.randomUUID(),'b',JSON.stringify({name:'Private',sets:[]}),new Date(Date.now()+2000+i).toISOString()).run();
 const afterFlood=(await get('a')).data;assert.ok(!afterFlood.feed.some(post=>post.id===sharedWorkout.data.id));assert.equal(afterFlood.friends.find(person=>person.uid==='b').slacking,false);assert.equal((await call('a',{action:'friend_nudge',uid:'b'})).status,409);
 await DB.prepare('DELETE FROM social_posts WHERE id=?').bind(sharedWorkout.data.id).run();
 assert.equal((await get('a')).data.friends.find(person=>person.uid==='b').slacking,true,'Private workouts must not affect shared activity');
 assert.equal((await call('a',{action:'challenge_create',title:'Invalid dates',metric:'pushup_relative_gain',starts:'2027-02-30',ends:'2027-03-05',baseline:10,friends:['b']})).status,400);
 assert.equal((await call('c',{action:'challenge_exit',challengeId:challenge.data.id})).status,404,'Only participants can leave');
 assert.equal((await call('b',{action:'challenge_exit',challengeId:challenge.data.id})).status,200);
 assert.equal((await call('b',{action:'challenge_exit',challengeId:challenge.data.id})).status,200,'Leaving is retry safe');
 const afterLeaving=(await get('a')).data.challenges.find(item=>item.id===challenge.data.id);assert.equal(afterLeaving.leaderboard.find(row=>row.uid==='b').status,'left');assert.equal(afterLeaving.leaderboard.find(row=>row.uid==='b').score,null);
 assert.equal((await call('b',{action:'challenge_update',challengeId:challenge.data.id,current:7})).status,404,'Former participants cannot update progress');
 const invited=await call('a',{action:'challenge_create',title:'Optional invitation',metric:'pushup_relative_gain',starts:start,ends:end,baseline:10,friends:['b']});assert.equal(invited.status,200);assert.equal((await call('b',{action:'challenge_exit',challengeId:invited.data.id})).status,200,'Invitations may be declined');assert.equal((await get('b')).data.challenges.find(item=>item.id===invited.data.id).status,'left');
 console.log('social discovery, privacy-aware activity, valid workout sharing, challenge lifecycle, request management and post deletion tests passed');
}finally{await mf.dispose()}
