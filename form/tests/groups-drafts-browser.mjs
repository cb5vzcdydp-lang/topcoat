import './browser-fixture.mjs';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright'),{samplePlan,defaultTargets,defaultPreferences}=await import('../.test-output/browser-fixture.mjs');
const client='61c70339-898b-4999-9dc5-dcd6be139ff9';let uid='draft-owner',failSave=false,groupPosts=0;
const records=[],savedMeals=[],date=new Date().toISOString().slice(0,10),data=()=>({uid,selectedClient:client,clients:[{id:client,owner:uid,personal:true,name:'Draft QA',version:1,targets:defaultTargets,plan:samplePlan}],workouts:[],logs:[],meals:[],workspaceRecords:records,savedMeals});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']}),page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
page.setDefaultTimeout(30000);page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>void dialog.accept());
async function drafts(){return page.evaluate(()=>new Promise((resolve,reject)=>{const open=indexedDB.open('form-private-device-v1',1);open.onsuccess=()=>{const db=open.result,read=db.transaction('records').objectStore('records').getAll();read.onsuccess=()=>{resolve(read.result.filter(row=>row.key.startsWith('food-task:')));db.close()};read.onerror=()=>reject(read.error)};open.onerror=()=>reject(open.error)}));}
try{
 await page.route('**/api/**',async route=>{const request=route.request(),path=new URL(request.url()).pathname;let json={records:[],items:[]};
  if(path==='/api/data'){if(request.method()==='GET')json=data();else{const body=request.postDataJSON();if(body.action==='saveMeal'){if(failSave)return route.fulfill({status:503,json:{error:'Test save unavailable'}});savedMeals.push({...body.value,version:1});}json={ok:true};}}
  if(path==='/api/preferences')json={preferences:defaultPreferences,version:0};
  if(path==='/api/food-search')json={foods:[],remoteAvailable:false};
  if(path==='/api/meal-groups'){groupPosts++;const body=request.postDataJSON();records.splice(0,records.length,{id:'group-config',kind:'meal-group-settings',data:{groups:body.groups},version:1});json={ok:true,version:1,groups:body.groups};}
  await route.fulfill({json});
 });
 await page.goto('http://127.0.0.1:5173',{waitUntil:'domcontentloaded',timeout:120000});
 await page.getByRole('button',{name:'Food',exact:true}).click({timeout:120000});
 await page.getByRole('button',{name:'Manage meal groups',exact:true}).click();
 for(const width of [320,390,430,1280]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'meal group editor fits '+width+'px');}
 await page.setViewportSize({width:390,height:844});
 await page.getByLabel('Meal group 2',{exact:true}).fill('Morning');
 await page.getByRole('button',{name:'Move group 2 up',exact:true}).click();
 await page.getByRole('button',{name:'Add meal group',exact:true}).click();
 await page.getByLabel('Meal group 6',{exact:true}).fill('After gym');
 await page.getByRole('button',{name:'Save meal groups',exact:true}).evaluate(button=>{button.click();button.click()});
 await page.getByRole('dialog').waitFor({state:'hidden'});assert.equal(groupPosts,1);
 assert.ok((await page.locator('.meal-section-toggle').allTextContents())[0].includes('Morning'));
 assert.ok(!(await page.locator('.meal-section-toggle').allTextContents()).some(text=>text.includes('Breakfast')));
 await page.getByRole('button',{name:'Create recipe',exact:true}).click();
 await page.getByLabel('Creation name',{exact:true}).fill('Dinner prep');
 await page.getByLabel('Creation servings',{exact:true}).fill('2');
 await page.getByRole('button',{name:'Add ingredients',exact:true}).click();
 await page.getByRole('textbox',{name:'Search all foods',exact:true}).fill('Chicken breast, cooked');
 await page.getByRole('button',{name:/Chicken breast, cooked/}).first().click();
 await page.getByLabel('Ingredient 1 amount',{exact:true}).fill('200');
 await page.getByLabel('Creation diary group',{exact:true}).selectOption('After gym');
 await page.getByText('Draft saved on this device',{exact:true}).waitFor();
 // Wait for this exact latest snapshot, rather than an earlier successful keystroke save.
 await page.waitForFunction(async()=>{const rows=await new Promise(resolve=>{const r=indexedDB.open('form-private-device-v1',1);r.onsuccess=()=>{const q=r.result.transaction('records').objectStore('records').getAll();q.onsuccess=()=>{resolve(q.result);r.result.close()}}});return rows.some(row=>row.key.startsWith('food-task:')&&row.data.items[0]?.amount===200&&row.data.category==='After gym')});
 const first=(await drafts())[0];assert.equal(first.data.date,await page.getByLabel('Food diary date',{exact:true}).inputValue());
 await page.reload();
 await page.getByRole('button',{name:'Home',exact:true}).click({timeout:120000});
 await page.getByRole('button',{name:'Resume Dinner prep',exact:true}).waitFor();
 uid='another-owner';await page.reload();await page.getByRole('button',{name:'Home',exact:true}).click({timeout:120000});
 assert.equal(await page.getByRole('button',{name:'Resume Dinner prep',exact:true}).count(),0);
 uid='draft-owner';await page.reload();await page.getByRole('button',{name:'Home',exact:true}).click({timeout:120000});
 await page.getByRole('button',{name:'Resume Dinner prep',exact:true}).click();
 await page.getByRole('button',{name:'Resume saved draft',exact:true}).click();
 assert.equal(await page.getByLabel('Creation name',{exact:true}).inputValue(),'Dinner prep');
 assert.equal(await page.getByLabel('Ingredient 1 amount',{exact:true}).inputValue(),'200');
 assert.equal(await page.getByLabel('Creation servings',{exact:true}).inputValue(),'2');
 assert.equal(await page.getByLabel('Creation diary group',{exact:true}).inputValue(),'After gym');
 assert.equal((await drafts())[0].data.logId,first.data.logId);
 failSave=true;await page.getByRole('button',{name:'Save recipe',exact:true}).click();
 await page.getByText(/Could not save. Your ingredients are still here/).waitFor();assert.equal((await drafts()).length,1);
 failSave=false;await page.getByRole('button',{name:'Save recipe',exact:true}).click();
 await page.getByText('Your recipe is saved. Editing it later won’t change previously logged servings.',{exact:true}).waitFor();
 await page.waitForFunction(async()=>{const rows=await new Promise(resolve=>{const r=indexedDB.open('form-private-device-v1',1);r.onsuccess=()=>{const q=r.result.transaction('records').objectStore('records').getAll();q.onsuccess=()=>{resolve(q.result);r.result.close()}}});return !rows.some(row=>row.key.startsWith('food-task:'))});
 assert.equal(savedMeals.length,1);assert.deepEqual(errors,[]);
 console.log('PASS mobile group rename/add/order and rapid-save guard; recipe draft survives refresh, restores original ingredient/portion/group/identity from Home, stays account-scoped, survives failed save and clears only after success');
}catch(error){await page.screenshot({path:'/workspace/groups-drafts-failure.png',fullPage:true});console.log((await page.locator('body').innerText()).slice(-5000));throw error}finally{await browser.close()}
