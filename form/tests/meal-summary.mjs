import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const r=createRequire(createRequire(import.meta.url).resolve('wrangler/package.json'));const {build}=r('esbuild');
await build({entryPoints:['lib/meal-summary.ts'],outfile:'.test-output/meal-summary.mjs',bundle:true,platform:'node',format:'esm'});
const {summarizeMealNutrition}=await import('../.test-output/meal-summary.mjs');
const total=summarizeMealNutrition([{calories:200,protein:10,carbs:25,fat:5,nutrients:{iron:2,vitaminC:15}},{calories:100,protein:5,carbs:10,fat:2,nutrition:{amount:50,unit:'g',reference:{servingSize:'100 g',servingGrams:100,calories:200,protein:10,carbs:20,fat:4,nutrients:{iron:4,potassium:200},nutrientEstimate:{sourceName:'Similar food',source:'Test',confidence:'high',score:.8,method:'serving weight',keys:['potassium']},source:'Test'}}}]);
assert.deepEqual({calories:total.calories,protein:total.protein,carbs:total.carbs,fat:total.fat},{calories:300,protein:15,carbs:35,fat:7});
assert.equal(total.nutrients.iron,4);assert.equal(total.nutrients.vitaminC,15);assert.equal(total.nutrients.potassium,100);assert.equal(total.knownMicros,3);assert.deepEqual(total.estimatedNutrients,['potassium']);
console.log('meal summary tests passed');
