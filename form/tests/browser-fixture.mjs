import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),r=createRequire(require.resolve('wrangler/package.json'));
await r('esbuild').build({stdin:{contents:"export {samplePlan,defaultTargets} from './lib/domain';export {defaultPreferences} from './lib/preferences';",resolveDir:process.cwd(),loader:'ts'},outfile:'.test-output/browser-fixture.mjs',bundle:true,platform:'node',format:'esm'});
