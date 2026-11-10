import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url),r=createRequire(require.resolve('wrangler/package.json')),{build}=r('esbuild');
await mkdir('.test-output',{recursive:true});
await build({entryPoints:['lib/food-nutrition.ts'],outfile:'.test-output/food-nutrition.mjs',bundle:true,format:'esm',platform:'node'});
const {applyMicronutrientEstimate,estimateMissingMicronutrients,scaleFood,servingGrams,prepareMeal,editorPortion,lookupNutrients,portionSchema}=await import('../.test-output/food-nutrition.mjs');
const reference={servingSize:'1 bar (30 g)',calories:150,protein:6,carbs:20,fat:5,nutrients:{iron:2,vitaminC:10,sodium:0},source:'Nutrition label'};
assert.equal(servingGrams(reference),30);
assert.equal(servingGrams({servingSize:'0.03 kg'}),30);
assert.equal(servingGrams({servingSize:'1 bowl'}),null);
const doubled=scaleFood(reference,60,'g');assert.deepEqual(doubled,{calories:300,protein:12,carbs:40,fat:10,nutrients:{iron:4,vitaminC:20,sodium:0}});
assert.equal(scaleFood(reference,.5,'serving').calories,75);
assert.equal(scaleFood(reference,15,'g').nutrients.iron,1);
assert.equal(scaleFood(reference,30,'g').nutrients.calcium,undefined);
assert.throws(()=>scaleFood(reference,0,'g'));
assert.throws(()=>scaleFood(reference,NaN,'g'));
assert.throws(()=>scaleFood({servingSize:'1 bowl'},20,'g'));
const logged=prepareMeal({name:'Bar',nutrition:{reference,amount:60,unit:'g'}});
const reopened=JSON.parse(JSON.stringify(logged));assert.equal(editorPortion(reopened).amount,60);
assert.equal(prepareMeal({...reopened,nutrition:{...reopened.nutrition,amount:15}}).calories,75);
assert.equal(prepareMeal({...reopened,nutrition:{...reopened.nutrition,amount:30}}).calories,150);
assert.equal(prepareMeal({name:'Old meal',calories:500,protein:20,carbs:50,fat:10}).calories,500);
const micronutrients=lookupNutrients({'iron_100g':.002,'vitamin-c_100g':.01,'vitamin-b12_100g':.0000024,'sodium_100g':0},'_100g');
assert.deepEqual(micronutrients,{vitaminC:10,b12:2.4,iron:2,sodium:0});
assert.equal(portionSchema.safeParse({reference,amount:-30,unit:'g'}).success,false);
assert.equal(portionSchema.safeParse({reference:{...reference,nutrients:{madeUp:1}},amount:1,unit:'serving'}).success,false);
const skim={name:'Coles Skim Milk',servingSize:'100 g',servingGrams:100,calories:34,protein:3.4,carbs:5,fat:.1,nutrients:{sodium:42},source:'Product label'};
const estimate=estimateMissingMicronutrients(skim,[{name:'Woolworths Skim Milk',brand:'Woolworths',servingSize:'250 g',servingGrams:250,calories:85,protein:8.5,carbs:12.5,fat:.25,nutrients:{calcium:300,b12:1,vitaminD:2},source:'Open Food Facts'},{name:'Coles Full Cream Milk',servingSize:'100 g',servingGrams:100,calories:61,protein:3.2,carbs:4.8,fat:3.3,nutrients:{calcium:500},source:'Wrong variant'}]);
assert.ok(estimate);assert.equal(estimate.metadata.sourceName,'Woolworths Skim Milk');assert.equal(estimate.metadata.method,'serving weight');assert.equal(estimate.nutrients.calcium,120);const projected=applyMicronutrientEstimate(skim,estimate);assert.equal(projected.nutrients.sodium,42);assert.equal(projected.nutrients.calcium,120);assert.ok(projected.nutrientEstimate.keys.includes('calcium'));const projectedMeal=prepareMeal({name:'Coles Skim Milk',nutrition:{reference:projected,amount:100,unit:'g'}});assert.equal(projectedMeal.nutrition.reference.nutrientEstimate.sourceName,'Woolworths Skim Milk');assert.equal(projectedMeal.nutrients.calcium,120);assert.equal(estimateMissingMicronutrients({name:'Banana',calories:89,protein:1,carbs:23,fat:.3,nutrients:{}},[{name:'Tuna',calories:116,protein:26,carbs:0,fat:1,nutrients:{selenium:50}}]),null);
console.log('PASS food portion scaling, gram/serving conversion, missing/zero values, micronutrient units, persistence and legacy meals');

// Real published menu provenance must survive logging, not fail a short display limit.
const catalogue=JSON.parse(await (await import('node:fs/promises')).readFile('lib/au-food-catalogue.json','utf8'));
for(const food of catalogue){const saved=prepareMeal({name:food.name,nutrition:{reference:food,amount:1,unit:'serving'}});assert.equal(saved.calories,Math.round(food.calories*10000)/10000,food.name);assert.equal(saved.nutrition.reference.source,food.source);assert.ok(portionSchema.safeParse(saved.nutrition).success);}
const longDescription=prepareMeal({food:{name:'A'.repeat(160),servingSize:'A'.repeat(160),calories:100,protein:2,carbs:20,fat:1}},true);assert.equal(longDescription.name.length,120);assert.equal(longDescription.nutrition.reference.servingSize.length,60);assert.equal(longDescription.calories,100);
console.log(`PASS all ${catalogue.length} published menu foods log with exact calories and preserved provenance; long search descriptions fit diary fields`);
