import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import React from 'react';
import {renderToString} from 'react-dom/server';
const require=createRequire(import.meta.url),r=createRequire(require.resolve('wrangler/package.json')),{build}=r('esbuild');
await mkdir('.test-output',{recursive:true});
const reactPath=require.resolve('react');
await build({entryPoints:['app/page.tsx'],outfile:'.test-output/render-app.mjs',bundle:true,format:'esm',platform:'node',packages:'external',plugins:[{name:'render-state',setup(b){
 b.onResolve({filter:/^\//,namespace:'fixture'},args=>({path:args.path,external:true}));
 b.onResolve({filter:/^react$/},()=>({path:'react-fixture',namespace:'fixture'}));
 b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:`import actual from ${JSON.stringify(reactPath)};export * from ${JSON.stringify(reactPath)};export function useState(initial){let v=initial;if(v==='Home')v=globalThis.__renderTab;if(v==='Connecting…')v='Cloud connected';if(v==='science')v=globalThis.__renderMode;if(v&&typeof v==='object'&&v.uid==='preview'&&Array.isArray(v.clients)&&globalThis.__renderEmpty)v={...v,uid:'new-account',email:'new@example.com',clients:[]};return actual.useState(v)};export default {...actual,useState};`,loader:'js'}));
}}]});
const App=(await import('../.test-output/render-app.mjs')).default;
const {CASUAL_FEATURE_TABS}=await import('../lib/experience-mode.ts');
let n=0;globalThis.__FORM_DEMO_ONLY__=true;globalThis.__renderMode='science';
const tabs=['Home','Clients','Training','Cardio','Create workout','Workout from video','Exercise library','Training tools','Calories','Calorie calculator','Recipes & meals','Strain','Import','Check-ins','Progress','Body comp','Sleep & recovery','Metrics','Beginner guide','AI coach','Social','Messages','Connections'];
for(const tab of tabs){globalThis.__renderTab=tab;const html=renderToString(React.createElement(App));assert.ok(html.length>1000,tab+' renders');assert.ok(!html.includes('NaN'),tab+' contains no invalid numbers');if(tab==='Calories')assert.equal((html.match(/Reuse a meal without/g)||[]).length,1,'Saved meals is not duplicated');console.log('PASS',++n,tab+' renders without an exception');}
globalThis.__FORM_DEMO_ONLY__=false;globalThis.__renderEmpty=true;const empty=renderToString(React.createElement(App));assert.ok(empty.includes('Create my training profile'));console.log('PASS',++n,'First-time account renders onboarding');
globalThis.__renderEmpty=false;globalThis.__FORM_DEMO_ONLY__=true;globalThis.__renderMode='casual';globalThis.__renderTab='Training';assert.ok(renderToString(React.createElement(App)).includes('Start today'));console.log('PASS',++n,'Casual mode renders the workout view');
for(const tab of CASUAL_FEATURE_TABS){globalThis.__renderMode='casual';globalThis.__renderTab=tab;const casual=renderToString(React.createElement(App));assert.ok(casual.length>1000&&!casual.includes('NaN'),tab+' must work in Casual mode');globalThis.__renderMode='science';const science=renderToString(React.createElement(App));assert.ok(science.length>1000&&!science.includes('NaN'),tab+' must also work in Science-Based mode');console.log('PASS',++n,tab+' works in both experience modes');}
console.log(`${n} page render smoke checks passed (no browser interaction simulated)`);
