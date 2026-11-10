import {readFile,writeFile} from 'node:fs/promises';
const args=Object.fromEntries(process.argv.slice(2).reduce((out,x,i,all)=>x.startsWith('--')?[...out,[x.slice(2),all[i+1]]]:out,[]));
if(!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(args.domain||'')||!/^[a-f0-9-]{36}$/i.test(args['database-id']||'')||!/^[a-z0-9-]{3,63}$/.test(args.bucket||'')){
 console.error('Usage: node scripts/configure-domain.mjs --domain app.example.com --database-id <D1 UUID> --bucket <R2 bucket name>');process.exit(1);
}
const path=new URL('../dist/server/wrangler.domain.json',import.meta.url),config=JSON.parse(await readFile(new URL('../dist/server/wrangler.json',import.meta.url),'utf8'));
config.name='form-coaching';delete config.services;
config.routes=[{pattern:args.domain,custom_domain:true}];
config.d1_databases=[{binding:'DB',database_name:'form-coaching',database_id:args['database-id'],migrations_dir:'../../drizzle'}];
config.r2_buckets=[{binding:'BUCKET',bucket_name:args.bucket}];
config.vars={...(config.vars||{}),AUTH_MODE:'supabase'};
await writeFile(path,JSON.stringify(config,null,2)+'\n');
console.log('Created dist/server/wrangler.domain.json. Configure Supabase and integration secrets, apply D1 migrations, then deploy with this config. Re-run after every build.');
