import './browser-fixture.mjs';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),{samplePlan,defaultTargets,defaultPreferences}=await import('../.test-output/browser-fixture.mjs');
const client='61c70339-898b-4999-9dc5-dcd6be139ff9',uid='workout-template-qa',template='81c70339-898b-4999-9dc5-dcd6be139ff9';
const exercise={id:'custom-bench',name:'Barbell Bench Press',muscle:'Chest',equipment:'free-weight',sets:1,min:6,max:12,optional:false,gymPin:false,note:''};
const previous={id:'previous',client,name:'Previous upper',date:'2026-10-20',templateId:template,templateVersion:1,sets:[{exerciseId:exercise.id,name:exercise.name,muscle:'Chest',equipment:'free-weight',weight:40,reps:8,completed:true,warmup:false,targetMin:6,targetMax:12}]};
const data={uid,selectedClient:client,coach:true,clients:[{id:client,owner:uid,personal:true,name:'Template QA',version:1,targets:defaultTargets,plan:samplePlan}],workoutTemplates:[{id:template,client,name:'QA Upper',exercises:[exercise],version:1,folder:'Upper',tags:['Strength'],favourite:true}],workouts:[previous],logs:[],meals:[],workspaceRecords:[]};
let failCopy=true;const attempts=[],workoutSaves=[];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']}),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
page.setDefaultTimeout(30000);page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>void dialog.accept());
try{
 await page.route('**/api/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;let json={records:[],items:[]};
  if(path==='/api/data'){if(req.method()==='GET')json=data;else{const body=req.postDataJSON();
   if(body.action==='workoutTemplate'){attempts.push(body);if(!body.version&&failCopy)return route.fulfill({status:503,json:{error:'Test save unavailable'}});const old=data.workoutTemplates.find(t=>t.id===body.value.id);data.workoutTemplates=data.workoutTemplates.filter(t=>t.id!==body.value.id);data.workoutTemplates.push({...body.value,client,version:(old?.version||0)+1});}
   if(body.action==='plan'){data.clients[0].plan=body.value;data.clients[0].version++;}
   if(body.action==='workout'){workoutSaves.push(body.value);data.workouts.push({...body.value,client});}
   json={ok:true};
  }}
  if(path==='/api/preferences')json={preferences:defaultPreferences,version:0};
  if(path==='/api/workout-lease')json={ok:true,version:1,expires:Date.now()+120000};
  await route.fulfill({json});
 });
 await page.goto('http://127.0.0.1:5173',{waitUntil:'domcontentloaded',timeout:120000});
 await page.getByRole('button',{name:'Train',exact:true}).click({timeout:120000});
 const past=page.locator('details').filter({has:page.getByRole('heading',{name:'Past workouts → templates',exact:true})});
 await past.locator('summary').click();
 await past.getByRole('button',{name:'Save Previous upper 2026-10-20 as template',exact:true}).click();
 assert.equal(await page.getByLabel('Template action',{exact:true}).inputValue(),'copy');
 await page.getByLabel('Template name',{exact:true}).fill('Previous upper template');
 await page.getByRole('button',{name:'Save new template',exact:true}).click();
 await page.getByText(/Could not save the template. Your completed workout is still saved/).waitFor();
 assert.deepEqual(data.workouts,[previous]);failCopy=false;
 await page.getByRole('button',{name:'Save new template',exact:true}).evaluate(button=>{button.click();button.click()});
 await page.getByText(/New template saved./).waitFor();assert.equal(attempts.length,2);assert.equal(attempts[0].value.id,attempts[1].value.id);
 assert.equal(data.workoutTemplates.length,2);assert.deepEqual(data.workouts,[previous]);
 await page.getByRole('button',{name:'View workout templates',exact:true}).click();
 await page.locator('.workout-reference-card').filter({has:page.getByRole('heading',{name:'QA Upper',exact:true})}).getByRole('button',{name:/Start workout/}).click();
 await page.getByRole('button',{name:'Add working set',exact:true}).first().click();
 await page.getByRole('button',{name:'Add Warmup',exact:true}).click();
 await page.getByRole('button',{name:'Complete set 1',exact:true}).click();
 await page.getByRole('button',{name:'Finish',exact:true}).click();
 await page.getByRole('button',{name:'Confirm & save workout',exact:true}).evaluate(button=>{button.click();button.click()});
 await page.getByRole('region',{name:'Workout template review',exact:true}).waitFor();
 assert.equal(workoutSaves.length,1);assert.equal(workoutSaves[0].templateVersion,1);
 assert.equal(await page.getByLabel('Template action',{exact:true}).inputValue(),'update');
 const savedHistory=JSON.stringify(data.workouts);
 for(const width of [320,390,430,1280]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Update original template',exact:true}).click();
 await page.getByText(/Original template updated./).waitFor();
 const updated=data.workoutTemplates.find(t=>t.id===template);assert.equal(updated.version,2);assert.equal(updated.exercises[0].sets,2);assert.equal(updated.folder,'Upper');assert.deepEqual(updated.tags,['Strength']);assert.equal(JSON.stringify(data.workouts),savedHistory);
 await page.getByRole('button',{name:'View workout templates',exact:true}).click();
 await past.getByRole('button',{name:'Save Previous upper 2026-10-20 as template',exact:true}).click();
 await page.getByLabel('Template action',{exact:true}).selectOption('update');
 await page.getByText(/The source template changed/).waitFor();
 assert.equal(await page.getByRole('button',{name:'Update original template',exact:true}).isDisabled(),true);
 await page.getByRole('button',{name:'Cancel',exact:true}).click();
 const planBefore=structuredClone(data.clients[0].plan),dayIndex=planBefore.findIndex(day=>day.exercises.length),day=planBefore[dayIndex];
 await page.locator('.workout-reference-card').filter({has:page.getByRole('heading',{name:day.name,exact:true})}).first().getByRole('button',{name:/Start workout/}).click();
 await page.getByRole('button',{name:'Add working set',exact:true}).first().click();
 await page.getByRole('button',{name:'Complete set 1',exact:true}).click();
 await page.getByRole('button',{name:'Finish',exact:true}).click();
 await page.getByRole('button',{name:'Confirm & save workout',exact:true}).click();
 await page.getByRole('region',{name:'Workout template review',exact:true}).waitFor();
 await page.getByRole('button',{name:'Update original template',exact:true}).click();
 await page.getByText(/Original template updated./).waitFor();
 assert.equal(data.clients[0].version,2);assert.equal(data.clients[0].plan[dayIndex].exercises[0].sets,day.exercises[0].sets+1);
 for(let index=0;index<planBefore.length;index++)if(index!==dayIndex)assert.deepEqual(data.clients[0].plan[index],planBefore[index]);
 assert.equal(workoutSaves.length,2);
 assert.deepEqual(errors,[]);
 console.log('PASS past workout copy, failed-save retry with stable identity, rapid-save guard, session finish then review, original template update with changed working-set count, warm-up exclusion, metadata/history preservation, four viewport widths, stale-source warning and weekly-source update without changing other days');
}catch(error){await page.screenshot({path:'/workspace/workout-template-failure.png',fullPage:true});console.log((await page.locator('body').innerText()).slice(-5500));throw error}finally{await browser.close()}
