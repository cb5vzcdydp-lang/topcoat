import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{build}=createRequire(require.resolve('wrangler/package.json'))('esbuild');
globalThis.__testFoodEnv={AUTH_MODE:'sites'};
await build({entryPoints:['app/api/food-search/route.ts'],outfile:'.test-output/food-search-api.mjs',bundle:true,format:'esm',platform:'node',plugins:[{name:'env',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'env'}));b.onLoad({filter:/.*/,namespace:'env'},()=>({contents:'export const env=globalThis.__testFoodEnv;',loader:'js'}))}}]});
const {GET}=await import('../.test-output/food-search-api.mjs');
const original=globalThis.fetch;let calls=0;
globalThis.fetch=async()=>{calls++;return Response.json({products:[{product_name:'Verified catalogue milk',code:'9300000000012',brands:'Test label',nutriments:{'energy-kcal_100g':34,proteins_100g:3.4,carbohydrates_100g:5,fat_100g:.1}},{product_name:'Incomplete unknown label',code:'9300000000033',nutriments:{'energy-kcal_100g':100,fat_100g:2}},{product_name:'Known zero label',code:'9300000000044',nutriments:{'energy-kcal_100g':0,proteins_100g:0,carbohydrates_100g:0,fat_100g:0}}]});};
try{
 const read=async q=>{const response=await GET(new Request('https://form.test/api/food-search?q='+encodeURIComponent(q),{headers:{'oai-authenticated-user-id':'owner'}}));assert.equal(response.status,200);return response.json()};
 const first=await read('milk');assert.ok(first.foods.some(food=>food.barcode==='9300000000012'),'remote results survive a full local match list');assert.ok(first.foods.some(food=>food.source.includes('Built-in')));assert.ok(first.foods.length<=25);
 assert.ok(!first.foods.some(food=>food.name==='Incomplete unknown label'));assert.ok(first.foods.some(food=>food.name==='Known zero label'&&food.calories===0));const fastLocal=await GET(new Request('https://form.test/api/food-search?q=milk&scope=local',{headers:{'oai-authenticated-user-id':'owner'}}));assert.equal(fastLocal.status,200);assert.equal(calls,1,'stored matches do not wait for or call the remote provider');assert.ok((await fastLocal.json()).foods.some(food=>food.name.toLowerCase().includes('milk')));
 await read('milk');assert.equal(calls,1,'repeat queries use permitted result cache');
 for(let i=0;i<9;i++)await read('food query '+i);assert.equal(calls,8,'community searches are throttled per worker');
 const menu=await read('Big Mac');assert.ok(menu.foods.some(f=>f.brand==="McDonald's"&&f.calories===621));const alias=await read('maccas Big Mac');assert.ok(alias.foods.some(f=>f.brand==="McDonald's"));const spud=await read('Spudshed');assert.equal(spud.foods.filter(f=>f.source.startsWith('Spudshed')).length,3);
 const denied=await GET(new Request('https://form.test/api/food-search?q=milk'));assert.equal(denied.status,401);
 console.log('PASS food search source balance, cache, remote request limit and authentication');
}finally{globalThis.fetch=original}
