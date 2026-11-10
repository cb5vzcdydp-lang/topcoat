import {createRequire} from 'node:module';
import {dirname,join} from 'node:path';
import {mkdirSync,copyFileSync} from 'node:fs';
const require=createRequire(import.meta.url),workerRoot=dirname(require.resolve('tesseract.js/package.json')),coreRoot=dirname(createRequire(require.resolve('tesseract.js')).resolve('tesseract.js-core/package.json')),target=new URL('../public/ocr/v6/',import.meta.url);
mkdirSync(target,{recursive:true});
for(const name of ['tesseract-core.wasm.js','tesseract-core-simd.wasm.js','tesseract-core-lstm.wasm.js','tesseract-core-simd-lstm.wasm.js'])copyFileSync(join(coreRoot,name),new URL(name,target));
copyFileSync(join(workerRoot,'dist/worker.min.js'),new URL('worker.min.js',target));
copyFileSync(join(workerRoot,'LICENSE.md'),new URL('TESSERACT-JS-LICENSE',target));
copyFileSync(join(coreRoot,'LICENSE'),new URL('TESSERACT-CORE-LICENSE',target));
