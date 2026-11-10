const target=process.argv[2];
if(!target||!/^https:\/\//.test(target)){console.error('Usage: node scripts/check-domain.mjs https://app.example.com');process.exit(1)}
let failures=0;
for(const [path,expected]of [['/api/health',200],['/api/data',401],['/signin',200],['/manifest.webmanifest',200],['/favicon.svg',200],['/sw.js',200]]){
 try{const r=await fetch(new URL(path,target),{redirect:'manual',signal:AbortSignal.timeout(15000)});const pass=r.status===expected;console.log(`${pass?'PASS':'FAIL'} ${path}: ${r.status}`);if(!pass)failures++;if(path==='/api/health')console.log(JSON.stringify(await r.json()));}
 catch(e){failures++;console.log(`FAIL ${path}: ${e.message}`)}
}
process.exitCode=failures?1:0;
