import './browser-fixture.mjs';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),{samplePlan,defaultTargets,defaultPreferences}=await import('../.test-output/browser-fixture.mjs');
const client='61c70339-898b-4999-9dc5-dcd6be139ff9',uid='lease-browser',template='81c70339-898b-4999-9dc5-dcd6be139ff9';
const data={uid,selectedClient:client,clients:[{id:client,owner:uid,personal:true,name:'Workout lock QA',version:1,targets:defaultTargets,plan:samplePlan}],workoutTemplates:[{id:template,client,name:'Lease test',version:1,exercises:[{id:'bench',name:'Bench Press',muscle:'Chest',equipment:'free-weight',sets:1,min:6,max:12,optional:false,gymPin:false,note:''}]}],workouts:[],logs:[],meals:[],workspaceRecords:[]};
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']}),context=await browser.newContext({viewport:{width:390,height:844}}),errors=[],requests=[];
let lease=null;
context.on('page',page=>{page.setDefaultTimeout(30000);page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>void dialog.accept())});
await context.route('**/api/**',async route=>{
 const req=route.request(),path=new URL(req.url()).pathname;let json={records:[],items:[]},status=200;
 if(path==='/api/data')json=data;
 if(path==='/api/preferences')json={preferences:defaultPreferences,version:0};
 if(path==='/api/workout-lease'){
  const body=req.postDataJSON();requests.push(body);const conflict=()=>{status=409;json={error:'Another tab or device currently holds editing access.',version:lease?.version||0,expires:lease?.expires||0,sameTab:lease?.token===body.token}};
  if(body.action==='release'){if(lease?.token===body.token&&lease?.session===body.session&&(!body.version||body.version===lease.version)){lease.expires=0;lease.version++;}json={ok:true};}
  else if(lease?.token===body.token&&(body.action!=='renew'||lease.session===body.session&&lease.expires>0)){lease={...lease,session:body.session,expires:Date.now()+60000,version:lease.version+(body.action==='renew'?0:1)};json={ok:true,...lease};}
  else if(body.action==='renew'||lease?.expires>Date.now()&&body.action!=='takeover'||body.action==='takeover'&&body.version!==lease?.version)conflict();
  else{lease={token:body.token,session:body.session,version:(lease?.version||0)+1,expires:Date.now()+60000};json={ok:true,...lease};}
 }
 await route.fulfill({status,json});
});
const page=await context.newPage();
try{
 await page.goto('http://127.0.0.1:5173',{waitUntil:'domcontentloaded',timeout:120000});
 await page.getByRole('button',{name:'Train',exact:true}).click({timeout:120000});
 await page.locator('.workout-reference-card').filter({hasText:'Lease test'}).getByRole('button',{name:/Start workout/}).click();
 await page.getByRole('dialog',{name:'Workout logger',exact:true}).waitFor();
 await page.getByLabel('Reps for set 1',{exact:true}).fill('9');
 await page.waitForFunction(({uid,client})=>JSON.parse(localStorage.getItem('form-draft-'+uid+'-'+client)||'null')?.sets[0]?.reps===9,{uid,client});
 const originalToken=lease.token,originalSession=lease.session;
 await page.reload();
 await page.getByRole('button',{name:'Resume workout',exact:true}).click({timeout:120000});
 await page.getByRole('dialog',{name:'Workout logger',exact:true}).waitFor();
 assert.equal(lease.token,originalToken,'refresh reuses this tab identity');assert.equal(lease.session,originalSession);
 assert.equal(await page.getByLabel('Reps for set 1',{exact:true}).inputValue(),'9');
 assert.ok(!requests.some(body=>body.action==='takeover'),'refresh never needs takeover');
 lease.expires=Date.now()-1000;
 const resumed=page.waitForResponse(response=>response.url().includes('/api/workout-lease')&&response.request().postDataJSON().action==='acquire');
 await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
 assert.equal((await resumed).status(),200);assert.ok(lease.expires>Date.now());assert.equal(lease.token,originalToken);
 assert.equal(await page.getByRole('dialog',{name:'Active workout editing access',exact:true}).count(),0);
 // window.open clones sessionStorage: the duplicate must detect the live original and rotate.
 const popup=context.waitForEvent('page');await page.evaluate(()=>window.open(location.href,'_blank'));const second=await popup;
 await second.getByRole('button',{name:'Resume workout',exact:true}).click({timeout:120000});
 await second.getByRole('button',{name:'Continue workout on this device',exact:true}).waitFor();
 const newToken=await second.evaluate(({uid,client})=>sessionStorage.getItem('form-workout-tab:'+encodeURIComponent(uid)+':'+client),{uid,client});
 assert.notEqual(newToken,originalToken,'duplicate tabs cannot share editing identity');
 await second.getByRole('button',{name:'Continue workout on this device',exact:true}).click();
 await second.getByRole('dialog',{name:'Workout logger',exact:true}).waitFor();assert.equal(lease.token,newToken);
 await page.bringToFront();await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
 await page.getByRole('button',{name:'Continue workout on this device',exact:true}).waitFor();
 assert.equal(await page.getByRole('dialog',{name:'Workout logger',exact:true}).count(),0,'real takeover stops stale editor');
 await second.close();lease.expires=Date.now()-1000;
 const recovered=page.waitForResponse(response=>response.url().includes('/api/workout-lease')&&response.request().postDataJSON().action==='acquire');
 await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));assert.equal((await recovered).status(),200);
 await page.getByRole('dialog',{name:'Workout logger',exact:true}).waitFor();
 assert.equal(await page.getByLabel('Reps for set 1',{exact:true}).inputValue(),'9');
 assert.deepEqual(errors,[]);
 console.log('PASS mobile refresh retains identity/sets without takeover; foreground resumes expired ownership; real duplicate tab rotates cloned identity, explicit takeover blocks stale tab, and expired conflict recovers without losing draft');
}catch(error){await page.screenshot({path:'/workspace/workout-lease-failure.png',fullPage:true});console.log((await page.locator('body').innerText()).slice(-4500));throw error}finally{await browser.close()}
