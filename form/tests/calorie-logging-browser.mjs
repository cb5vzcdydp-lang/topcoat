import './browser-fixture.mjs';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const {samplePlan,defaultTargets,defaultPreferences}=await import('../.test-output/browser-fixture.mjs');
const client='61c70339-898b-4999-9dc5-dcd6be139ff9',uid='calorie-qa',date=new Date().toISOString().slice(0,10),data={uid,selectedClient:client,clients:[{id:client,owner:uid,personal:true,demo:false,name:'Calories QA',email:'',version:1,targets:defaultTargets,plan:samplePlan}],meals:[],logs:[],workouts:[],workspaceRecords:[]},attempts=[];
let failReadback=false,readbacks=0;
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']}),page=await browser.newPage({viewport:{width:390,height:844}});
try{
 await page.route('**/api/**',async route=>{const request=route.request(),path=new URL(request.url()).pathname;let json={records:[],items:[]};if(path==='/api/data'){if(request.method()==='GET'){readbacks++;if(failReadback){failReadback=false;return route.abort('failed');}json=data;}else{const body=request.postDataJSON();attempts.push(body);if(body.action==='meal'){data.meals=data.meals.filter(m=>m.data.id!==body.value.id);data.meals.push({id:client+':'+body.value.id,client,date:body.value.date,data:body.value});}json={ok:true};}}if(path==='/api/preferences')json={preferences:defaultPreferences,version:0};if(path==='/api/food-search')json={foods:[],remoteAvailable:false};await route.fulfill({json});});
 await page.goto('http://127.0.0.1:5173',{waitUntil:'domcontentloaded',timeout:120000});
 await page.getByRole('button',{name:'Food',exact:true}).click({timeout:120000});
 await page.getByRole('button',{name:'Add food',exact:true}).first().click();
 
 await page.getByRole('textbox',{name:'Search all foods',exact:true}).fill('Chicken breast, cooked');
 await page.getByRole('button',{name:/Chicken breast, cooked/}).first().click();
 await page.getByRole('button',{name:'Log food',exact:true}).waitFor();
 await page.getByLabel('Amount eaten',{exact:true}).fill('50');
 await page.getByRole('button',{name:'Log food',exact:true}).evaluate(button=>{button.click();button.click();});
 await page.waitForTimeout(1000);


 assert.equal(attempts.filter(x=>x.action==='meal').length,1,'food submits');
 assert.equal(attempts[0].value.calories,82.5);
 await page.locator('.meal-item-main').filter({hasText:'Chicken breast, cooked'}).waitFor();
 // A real long-provenance menu entry previously failed before any POST.
 await page.getByRole('button',{name:'Add food',exact:true}).first().click();
 await page.getByRole('textbox',{name:'Search all foods',exact:true}).fill('Burrito Chicken Chipotle Mild Salsa');
 await page.getByRole('button',{name:/Burrito · Chicken Chipotle · Mild Salsa/}).first().click();
 const readsBeforeSave=readbacks;failReadback=true;
 await page.getByRole('button',{name:'Log food',exact:true}).click();
 await page.locator('.meal-item-main').filter({hasText:'Burrito · Chicken Chipotle'}).waitFor();
 assert.equal(attempts.filter(x=>x.action==='meal').length,2);
 assert.ok(attempts[1].value.nutrition.reference.source.length>120);
 assert.equal(await page.locator('.sync-status').getByText(/pending save/).count(),0,'successful writes never queued after refresh failure');
 assert.equal(readbacks,readsBeforeSave,'saving does not reload the full account');failReadback=false;
 await page.reload();await page.getByRole('button',{name:'Food',exact:true}).click({timeout:120000});
 await page.locator('.meal-item-main').filter({hasText:'Burrito · Chicken Chipotle'}).waitFor();
 // Manual label entry is directly below the amount controls, ahead of long nutrient lists.
 await page.getByRole('button',{name:'Add food',exact:true}).first().click();
 await page.getByRole('button',{name:'Create a food manually',exact:true}).click();
 const dialog=page.getByRole('dialog');await dialog.getByLabel('Meal / food name',{exact:true}).fill('My lunch');
 await dialog.getByLabel('Energy (kcal)',{exact:true}).fill('450');
 await dialog.getByLabel('Protein (g)',{exact:true}).fill('30');
 await dialog.getByLabel('Carbs (g)',{exact:true}).fill('50');
 await dialog.getByLabel('Fat (g)',{exact:true}).fill('14');
 await page.getByRole('button',{name:'Save meal',exact:true}).click();
 await page.locator('.meal-item-main').filter({hasText:'My lunch'}).waitFor();
 assert.equal(attempts[2].value.calories,450);assert.equal(attempts[2].value.protein,30);
 for(const width of [320,390,430]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 console.log('PASS search portion scaling, real long-source menu save, immediate totals after failed read-back, no duplicate queue, refresh persistence, manual calories/macros and mobile widths');
}finally{await browser.close();}
