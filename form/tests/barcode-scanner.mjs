// Actual ZXing decoding of generated EAN/UPC video frames, plus camera lifecycle tests.
// Run with PLAYWRIGHT_MODULE=/path/to/playwright node tests/barcode-scanner.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('wrangler/package.json'))('esbuild');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
await mkdir('.test-output', { recursive: true });
await build({ entryPoints: ['lib/browser-barcode-scanner.ts'], outfile: '.test-output/scanner.js', bundle: true, format: 'iife', globalName: 'FormScanner', platform: 'browser' });

// Independent EAN encoding: no decoder stubs. A canvas stream stands in for camera hardware.
function cameraFixture({ code = '4006381333931', vertical = false, native = 'absent', permission = 'allow' } = {}) {
  const L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
  const G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'];
  const parity = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];
  const right = digit => L[Number(digit)].replace(/./g, x => x === '0' ? '1' : '0');
  if (code.length === 12) code = '0' + code;
  const bits = code.length === 8
    ? '101' + [...code.slice(0,4)].map(d => L[Number(d)]).join('') + '01010' + [...code.slice(4)].map(right).join('') + '101'
    : '101' + [...code.slice(1,7)].map((d,i) => (parity[Number(code[0])][i] === 'L' ? L : G)[Number(d)]).join('') + '01010' + [...code.slice(7)].map(right).join('') + '101';
  const canvas = document.createElement('canvas'); canvas.width = 960; canvas.height = 720;
  const ctx = canvas.getContext('2d');
  window.testCamera = { codes: [], errors: [], ready: 0, nativeCalls: 0, show: false };
  const state = window.testCamera;
  function draw() {
    ctx.fillStyle = 'white'; ctx.fillRect(0,0,960,720);
    if (state.show) {
      ctx.save(); ctx.translate(480,360); if (vertical) ctx.rotate(Math.PI/2);
      ctx.fillStyle = 'black';
      [...bits].forEach((bit,i) => { if (bit === '1') ctx.fillRect((i-bits.length/2)*4,-100,4,200); });
      ctx.restore();
    }
  }
  draw(); state.drawTimer = setInterval(draw, 33);
  if (native === 'absent') Object.defineProperty(window,'BarcodeDetector',{value:undefined,configurable:true});
  else Object.defineProperty(window,'BarcodeDetector',{value:class {
    static async getSupportedFormats() { return ['ean_13']; }
    async detect() { state.nativeCalls++; if (native === 'throw') throw Error('Native decoder failed'); if (native === 'hang') return new Promise(()=>{}); return []; }
  },configurable:true});
  Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async () => {
    if (permission === 'deny') throw new DOMException('Denied','NotAllowedError');
    if (permission === 'delay') await new Promise(resolve => { state.allow = resolve; });
    state.stream = canvas.captureStream(30); return state.stream;
  }});
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
try {
  async function setup(options) {
    const page = await browser.newPage({ viewport: { width:390,height:844 } });
    await page.route('http://localhost/scanner-test', route => route.fulfill({ contentType:'text/html', body:'<video muted playsinline></video>' }));
    await page.goto('http://localhost/scanner-test');
    await page.addScriptTag({ path: '.test-output/scanner.js' });
    await page.evaluate(cameraFixture,options);
    await page.evaluate(() => { window.stopScan = FormScanner.startBarcodeScanner({ video:document.querySelector('video'),onCode:code=>testCamera.codes.push(code),onReady:()=>testCamera.ready++,onError:error=>testCamera.errors.push(error) }); });
    return page;
  }
  for (const options of [
    { code:'4006381333931',native:'absent' },
    { code:'96385074',vertical:true,native:'absent' },
    { code:'036000291452',native:'throw' },
    { code:'4006381333931',native:'hang' },
  ]) {
    const page = await setup(options);
    await page.waitForFunction(()=>testCamera.ready === 1);
    // Start on blank frames to exercise the retry/fallback path.
    if (options.native !== 'absent') await page.waitForFunction(()=>testCamera.nativeCalls > 0);
    await page.evaluate(()=>{testCamera.show=true;});
    await page.waitForFunction(()=>testCamera.codes.length === 1, { timeout:10000 });
    await page.waitForTimeout(350);
    const result = await page.evaluate(()=>({ codes:testCamera.codes,errors:testCamera.errors,ended:testCamera.stream.getTracks().every(t=>t.readyState==='ended'),detached:document.querySelector('video').srcObject===null }));
    assert.deepEqual(result,{codes:[options.code],errors:[],ended:true,detached:true});
    await page.close();
  }
  const denied = await setup({permission:'deny'});
  await denied.waitForFunction(()=>testCamera.errors.length === 1);
  assert.match(await denied.evaluate(()=>testCamera.errors[0]),/denied/);
  await denied.close();
  const late = await setup({permission:'delay'});
  await late.evaluate(()=>{stopScan();testCamera.allow();});
  await late.waitForFunction(()=>testCamera.stream?.getTracks().every(t=>t.readyState==='ended'));
  assert.deepEqual(await late.evaluate(()=>testCamera.codes),[]);
  await late.close();
  const cancelled = await setup();
  await cancelled.waitForFunction(()=>testCamera.ready === 1);
  await cancelled.evaluate(()=>{stopScan();testCamera.show=true;});
  await cancelled.waitForTimeout(400);
  assert.deepEqual(await cancelled.evaluate(()=>testCamera.codes),[]);
  assert.equal(await cancelled.evaluate(()=>testCamera.stream.getTracks()[0].readyState),'ended');
  await cancelled.close();
  console.log('PASS actual EAN-13, vertical EAN-8 and UPC-A decoding; native absent/error/timeout fallbacks; single result; camera cleanup; denied and cancelled permissions.');

  if (process.env.SCANNER_APP_URL) {
    const origin = process.env.SCANNER_APP_URL;
    const context = await browser.newContext({viewport:{width:390,height:844}});
    await context.addCookies([{name:'__sites_local_auth',value:'1',url:origin}]);
    const page = await context.newPage();
    const errors = []; page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin);
    await page.evaluate(cameraFixture,{code:'9317466312624'});
    let lookups = 0;
    page.on('request', request => { if (request.url().includes('/api/food-lookup?code=9317466312624')) lookups++; });
    await page.getByRole('button',{name:'Food',exact:true}).click();
    await page.getByRole('button',{name:'Scan food',exact:true}).click();
    await page.getByRole('button',{name:'Scan with camera',exact:true}).click();
    const cameraBox = await page.getByLabel('Food code camera preview').boundingBox();
    assert.ok(cameraBox && cameraBox.width >= 350 && cameraBox.height >= 320, `camera viewport was ${JSON.stringify(cameraBox)}`);
    await page.screenshot({path:'.test-output/scanner-active-phone.png',fullPage:false});
    await page.evaluate(()=>{testCamera.show=true;});
    await page.waitForFunction(()=>[...document.querySelectorAll('input')].some(i=>i.value==='Asian Greens'));
    assert.equal(await page.getByLabel('Barcode number',{exact:true}).inputValue(),'9317466312624');
    assert.equal(await page.getByLabel('Food name',{exact:true}).inputValue(),'Asian Greens');
    assert.equal(await page.evaluate(()=>testCamera.stream.getTracks()[0].readyState),'ended');
    assert.equal(lookups,1); assert.deepEqual(errors,[]);
    await page.screenshot({path:'.test-output/scanner-phone.png',fullPage:true});
    await context.close();
    console.log('PASS mobile app camera → real decode → one actual catalogue lookup → populated Woolworths food form; no browser errors.');
  }
} finally { await browser.close(); }
