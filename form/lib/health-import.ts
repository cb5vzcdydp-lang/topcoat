import {normaliseMetric} from './health-units';
export const healthMetricNames=['vo2','hrv','rhr','steps','weight','sleep_duration','sleep_deep','sleep_rem','sleep_light','sleep_awake','sleep_score','readiness_score','activity_score','active_calories','total_calories','exercise_minutes','stand_hours','respiratory_rate','skin_temperature'] as const;
export type ImportedHealth={id:string;client:string;date:string;metric:typeof healthMetricNames[number];value:number;unit:string;source:string};
export async function parseHealthCSV(text:string,client:string):Promise<ImportedHealth[]>{
 const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){row.push(cell.trim());cell=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell.trim());if(row.some(Boolean))rows.push(row);row=[];cell=''}else cell+=c}
 row.push(cell.trim());if(row.some(Boolean))rows.push(row);if(quoted)throw new Error('CSV has an unfinished quoted field.');const headers=(rows.shift()||[]).map(s=>s.toLowerCase().replace(/^\uFEFF/,''));
 if(!['date','metric','value','unit','source'].every(s=>headers.includes(s)))throw new Error('Use the health CSV sample: date,metric,value,unit,source. Convert other exports to these columns first.');
 if(rows.length>10000)throw new Error('Import at most 10,000 daily health readings at a time.');
 const result=new Map<string,ImportedHealth>();
 for(let i=0;i<rows.length;i++){const r=Object.fromEntries(headers.map((h,j)=>[h,rows[i][j]||'']));const value=Number(r.value),day=new Date(r.date+'T12:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||Number.isNaN(+day)||day.toISOString().slice(0,10)!==r.date||!healthMetricNames.includes(r.metric as ImportedHealth['metric'])||!r.value||!Number.isFinite(value)||value<0||value>100000||!r.source||r.source.length>120||r.unit.length>30)throw new Error('Invalid health CSV data on row '+(i+2)+'. Use a supported metric, valid date, unit, source and non-negative value.');
  const normalised=normaliseMetric(r.metric,value,r.unit);
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([r.metric,r.date,r.source]))),hash=Array.from(new Uint8Array(bytes)).map(n=>n.toString(16).padStart(2,'0')).join('');const id=client+':csv:'+hash;
  result.set(id,{id,client,date:r.date,metric:r.metric as ImportedHealth['metric'],value:normalised.value,unit:normalised.unit,source:r.source});
 }
 return [...result.values()];
}
const types:Record<string,[ImportedHealth['metric'],string]>={HKQuantityTypeIdentifierVO2Max:['vo2','mL/kg/min'],HKQuantityTypeIdentifierHeartRateVariabilitySDNN:['hrv','ms'],HKQuantityTypeIdentifierRestingHeartRate:['rhr','bpm'],HKQuantityTypeIdentifierStepCount:['steps','steps'],HKQuantityTypeIdentifierBodyMass:['weight','kg'],HKQuantityTypeIdentifierActiveEnergyBurned:['active_calories','kcal'],HKQuantityTypeIdentifierBasalEnergyBurned:['total_calories','kcal'],HKQuantityTypeIdentifierRespiratoryRate:['respiratory_rate','breaths/min']};
const unescape=(v:string)=>v.replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const dateMs=(s:string)=>Date.parse(s.replace(/^(\d{4}-\d\d-\d\d) (\d\d:\d\d:\d\d) ([+-]\d\d)(\d\d)$/,'$1T$2$3:$4'));
const unionHours=(intervals:[number,number][])=>{let start=0,end=0,ms=0;for(const [a,b] of intervals.sort((x,y)=>x[0]-y[0])){if(a>end){ms+=Math.max(0,end-start);start=a;end=b}else end=Math.max(end,b)}return (ms+Math.max(0,end-start))/3600000};

// Incremental Record parser: do not load a multi-hundred-MB Health export into a DOM.
export async function parseAppleHealth(file:Blob,client:string,today:string):Promise<ImportedHealth[]>{
 const latest=new Map<string,ImportedHealth&{timestamp:string}>(),sums=new Map<string,number>(),sleep=new Map<string,{item:ImportedHealth;intervals:[number,number][]}>();
 const cutoff=new Date(today+'T12:00Z');cutoff.setUTCDate(cutoff.getUTCDate()-89);const minimum=cutoff.toISOString().slice(0,10);
 let health=false,pending='',records=0;const decoder=new TextDecoder(),reader=file.stream().getReader();
 const keyFor=(metric:string,date:string,source:string)=>JSON.stringify([metric,date,source]);
 function record(raw:string){const attrs:Record<string,string>={};for(const match of raw.matchAll(/([\w]+)="([^"]*)"/g))attrs[match[1]]=unescape(match[2]);const type=attrs.type,start=attrs.startDate||'',end=attrs.endDate||start,source=(attrs.sourceName||'Apple Health').slice(0,120),date=(type==='HKCategoryTypeIdentifierSleepAnalysis'?end:start).slice(0,10);if(date<minimum||date>today||!/^\d{4}-\d{2}-\d{2}$/.test(date))return;
  if(type==='HKCategoryTypeIdentifierSleepAnalysis'){
   const mapping:Record<string,ImportedHealth['metric']>={HKCategoryValueSleepAnalysisAsleep:'sleep_duration',HKCategoryValueSleepAnalysisAsleepUnspecified:'sleep_duration',HKCategoryValueSleepAnalysisAsleepCore:'sleep_light',HKCategoryValueSleepAnalysisAsleepDeep:'sleep_deep',HKCategoryValueSleepAnalysisAsleepREM:'sleep_rem',HKCategoryValueSleepAnalysisAwake:'sleep_awake'};
   const stage=mapping[attrs.value],a=dateMs(start),b=dateMs(end);if(!stage||!Number.isFinite(a)||!Number.isFinite(b)||b<=a||b-a>86400000)return;
   for(const metric of stage!=='sleep_awake'&&stage!=='sleep_duration'?[stage,'sleep_duration' as const]:[stage]){const key=keyFor(metric,date,source),old=sleep.get(key);if(old)old.intervals.push([a,b]);else sleep.set(key,{item:{id:key,client,date,metric,value:0,unit:'hours',source},intervals:[[a,b]]})}return;
  }
  const definition=types[type];if(!definition)return;let value=Number(attrs.value);if(!Number.isFinite(value)||value<0)return;const [metric,unit]=definition;
  if(metric==='weight'&&/^(lb|pound)/i.test(attrs.unit))value*=.45359237;
  if((metric==='active_calories'||metric==='total_calories')&&attrs.unit==='kJ')value/=4.184;
  if(metric==='hrv'&&attrs.unit==='s')value*=1000;
  const key=keyFor(metric,date,source),item={id:key,client,date,metric,value,unit,source,timestamp:start};
  if(['steps','active_calories','total_calories'].includes(metric)){sums.set(key,(sums.get(key)||0)+value);latest.set(key,item)}else if(!latest.has(key)||start>latest.get(key)!.timestamp)latest.set(key,item);
 }
 try{for(;;){const chunk=await reader.read();if(chunk.done)break;pending+=decoder.decode(chunk.value,{stream:true});if(pending.includes('<HealthData'))health=true;let consumed=0;const regex=/<Record\b[^>]*>/g;let match;while((match=regex.exec(pending))){record(match[0]);records++;consumed=regex.lastIndex;if(records>5000000)throw new Error('This export contains over five million records. Please use a smaller export.')}if(consumed)pending=pending.slice(consumed);if(pending.length>262144){const last=pending.lastIndexOf('<');pending=last>=pending.length-65536?pending.slice(last):pending.slice(-1024)}}}finally{reader.releaseLock()}
 if(!health)throw new Error('Choose export.xml from Apple Health, not the ZIP file.');
 for(const [key,value]of sums)latest.get(key)!.value=value;
 // Basal + active energy is a total only when both come from the same source/day.
 for(const [key,item]of latest)if(item.metric==='total_calories'){const active=latest.get(keyFor('active_calories',item.date,item.source));if(active)item.value+=active.value;else latest.delete(key)}
 const values:ImportedHealth[]=[...latest.values()].map(({timestamp,...item})=>item).concat([...sleep.values()].map(({item,intervals})=>({...item,value:unionHours(intervals)})));
 const output:ImportedHealth[]=[];
 for(const item of values.sort((a,b)=>b.date.localeCompare(a.date))){if(item.value>100000)continue;const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(item.id));const hash=Array.from(new Uint8Array(bytes)).map(n=>n.toString(16).padStart(2,'0')).join('');output.push({...item,id:client+':health:'+hash,value:Math.round(item.value*1000)/1000})}
 return output;
}
