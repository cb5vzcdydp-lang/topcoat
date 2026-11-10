import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url),r=createRequire(require.resolve('wrangler/package.json')),{build}=r('esbuild');
await mkdir('.test-output',{recursive:true});
await build({entryPoints:['lib/starter-programs.ts'],outfile:'.test-output/starters.mjs',bundle:true,format:'esm',platform:'node'});
const {starterProgram}=await import('../.test-output/starters.mjs');
await build({entryPoints:['lib/domain.ts'],outfile:'.test-output/starter-validation.mjs',bundle:true,format:'esm',platform:'node'});
const {planSchema,progression}=await import('../.test-output/starter-validation.mjs');
let n=0;
for(const equipment of ['Full gym','Dumbbells','Bodyweight','Resistance bands'])for(const days of [2,3,4,5,6]){
 const plan=starterProgram(days,'Build muscle',equipment);assert.ok(planSchema.safeParse(plan).success);assert.equal(plan.filter(d=>d.exercises.length).length,days);assert.ok(plan.filter(d=>d.name==='Rest').every(d=>!d.exercises.length));console.log('PASS',++n,days+' day starter with '+equipment);
}
const stronger=starterProgram(4,'Get stronger','Dumbbells');assert.equal(stronger[0].exercises[0].min,5);assert.equal(stronger[0].exercises[0].sets,3);n++;
const same=[1,2,3].map(i=>({date:'2026-10-0'+i,sets:[{exerciseId:'x',equipment:'machine',weight:30,gymPinAdded:true,gymPinWeight:i===3?10:5,reps:12,completed:true,warmup:false}]}));assert.equal(progression(same,'x',12,1).ready,false);n++;
const bands=same.map((w,i)=>({...w,sets:[{...w.sets[0],equipment:'banded',weight:0,gymPinAdded:false,bandColors:i===2?['Purple']:['Green']}]}));assert.equal(progression(bands,'x',12,1).ready,false);n++;
console.log(`${n} starter/progression scenarios passed`);
