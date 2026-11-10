import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToString} from 'react-dom/server';
const require=createRequire(import.meta.url),r=createRequire(require.resolve('wrangler/package.json'));
await r('esbuild').build({stdin:{contents:"export {ExerciseCatalog,catalogEquipment} from './components/exercise-catalog';export {exerciseSchema} from './lib/domain';export {exerciseEntries,importedWorkoutExerciseNames} from './lib/exercise-catalogue';export {closestExercise} from './lib/import-workout-templates';",resolveDir:process.cwd(),loader:'ts'},outfile:'.test-output/catalog.mjs',bundle:true,platform:'node',format:'esm',packages:'external'});
const {ExerciseCatalog,catalogEquipment,exerciseSchema,exerciseEntries:entries,importedWorkoutExerciseNames,closestExercise}=await import('../.test-output/catalog.mjs');
assert.equal(importedWorkoutExerciseNames.length,178);assert.equal(entries.length,1389);assert.equal(new Set(entries.map(e=>e.id)).size,entries.length);
for(const e of entries){exerciseSchema.parse({id:e.id,name:e.name,sets:2,min:6,max:12,muscle:'Other',equipment:catalogEquipment(e),note:e.cues.join(' ').slice(0,500)});assert.ok(e.cues.every(c=>!c.includes('\n')))}
for(const name of importedWorkoutExerciseNames){const match=closestExercise(name);assert.equal(match.entry.name,name);assert.equal(match.exact,true)}
const html=renderToString(React.createElement(ExerciseCatalog,{onPick(){}}));assert.equal((html.match(/catalog-card/g)||[]).length,24);assert.ok(html.includes('Standing Barbell Curl'));assert.ok(html.includes('Use in workout'));assert.ok(html.includes('1,389'));
console.log('All 1,389 exercises fit the save schema; 178 uploaded names match exactly, IDs are unique, and pagination is verified.');
