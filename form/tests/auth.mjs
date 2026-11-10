import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url),r=createRequire(require.resolve('wrangler/package.json')),{build}=r('esbuild');
await mkdir('.test-output',{recursive:true});
globalThis.__authEnv={SUPABASE_URL:'https://auth.example',SUPABASE_ANON_KEY:'public-test-key'};
const plugin={name:'auth-env',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const env=globalThis.__authEnv;',loader:'js'}));}};
await build({entryPoints:['app/api/auth/route.ts'],outfile:'.test-output/auth-api.mjs',bundle:true,format:'esm',platform:'node',plugins:[plugin]});
await build({entryPoints:['lib/server.ts'],outfile:'.test-output/auth-identity.mjs',bundle:true,format:'esm',platform:'node',plugins:[plugin]});
const auth=await import('../.test-output/auth-api.mjs'),{identity}=await import('../.test-output/auth-identity.mjs');
const originalFetch=globalThis.fetch;let n=0,confirmed=true;const check=(x,label)=>{assert.ok(x,label);console.log('PASS',++n,label)};
const request=(body,cookies='',origin='https://form.example')=>new Request('https://form.example/api/auth',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookies},body:JSON.stringify(body)});
try{
 globalThis.fetch=async(input,init)=>{
  const url=String(input);
  if(url.endsWith('/user'))return init.headers.Authorization==='Bearer good-token'?Response.json({id:'real-user',email:'real@example.com',email_confirmed_at:confirmed?'2026-01-01':null}):Response.json({error:'Invalid token'},{status:401});
  if(url.includes('/token?'))return Response.json({access_token:'good-token',refresh_token:'new-refresh',expires_in:3600});
  if(url.endsWith('/signup'))return Response.json({id:'new-user'});
  if(url.endsWith('/logout'))return new Response(null,{status:204});
  throw new Error('Unexpected external URL');
 };
 await assert.rejects(identity(new Request('https://form.example',{headers:{'oai-authenticated-user-id':'spoofed'}})),e=>e.status===401);check(true,'Public deployment rejects forged ChatGPT identity headers');
 const valid=await identity(new Request('https://form.example',{headers:{Cookie:'form_access=good-token','oai-authenticated-user-id':'spoofed'}}));check(valid.uid==='real-user','Identity comes from the verified provider account');
 await assert.rejects(identity(new Request('https://form.example',{headers:{Cookie:'form_access=bad-token'}})),e=>e.status===401);check(true,'Invalid session is rejected');
 confirmed=false;await assert.rejects(identity(new Request('https://form.example',{headers:{Cookie:'form_access=good-token'}})),e=>e.status===401);confirmed=true;check(true,'Unconfirmed email cannot open a workspace');
 const signin=await auth.POST(request({action:'signin',email:'real@example.com',password:'long-password'}));const cookies=signin.headers.getSetCookie();check(signin.status===200&&cookies.length===2&&cookies.every(c=>c.includes('HttpOnly')&&c.includes('Secure')&&c.includes('SameSite=Lax')),'Sign-in writes protected session cookies');
 check(!JSON.stringify(await signin.json()).includes('good-token'),'Tokens are not returned to browser JavaScript');
 const signup=await auth.POST(request({action:'signup',email:'new@example.com',password:'long-password'}));check((await signup.json()).confirmationRequired,'Signup handles email-confirmation flow');
 const refreshed=await auth.POST(request({action:'refresh'},'form_refresh=old-refresh'));check(refreshed.status===200&&refreshed.headers.getSetCookie().some(c=>c.includes('new-refresh')),'Session refresh rotates the stored refresh cookie');
 check((await auth.POST(request({action:'refresh'}))).status===401,'Refresh without a cookie is rejected');
 const signout=await auth.POST(request({action:'signout'},'form_access=good-token'));check(signout.status===200&&signout.headers.getSetCookie().every(c=>c.includes('Max-Age=0')),'Sign-out clears both cookies');
 check((await auth.POST(request({action:'signin',email:'real@example.com',password:'long-password'},'','https://evil.example'))).status===403,'Cross-origin login is rejected');
 delete globalThis.__authEnv.SUPABASE_URL;check(!(await auth.GET().then(r=>r.json())).configured,'Missing hosting credentials are reported as unconfigured');
 console.log(`${n} authentication assertions passed`);
}finally{globalThis.fetch=originalFetch;delete globalThis.__authEnv;}
