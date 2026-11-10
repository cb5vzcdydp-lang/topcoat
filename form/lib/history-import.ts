import {delimitedRows} from './import-mapping';
export type WorkoutImport={id:string;date:string;name:string;notes:string;sets:{exerciseId:string;name:string;muscle:string;equipment:string;weight:number;bandColors:string[];gymPinAdded:boolean;gymPinWeight:number;reps:number;rir:number|null;completed:boolean;warmup:boolean;failure:boolean;setType?:'straight'|'drop'}[]};
export type MealImport={id:string;date:string;name:string;category:string;calories:number;protein:number;carbs:number;fat:number;notes:string};
export type DailyNutritionImport={date:string;calories:number;protein:number;carbs:number;fat:number;notes:string};
const key=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
function detectDelimiter(text:string){
 const counts=new Map([[',',0],['\t',0],[';',0]]);let quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"')i++;else quoted=!quoted}else if(!quoted){if(c==='\n'||c==='\r')break;if(counts.has(c))counts.set(c,counts.get(c)!+1)}}
 return [...counts].sort((a,b)=>b[1]-a[1])[0][0];
}
function parseCsv(text:string){
 const delimiter=detectDelimiter(text),parsed=delimitedRows(text,delimiter);
 if(!parsed.rows.length)throw new Error('The file needs a header row and at least one data row.');
 const headers=parsed.headers.map(key);
 if(headers.some(h=>!h)||new Set(headers).size!==headers.length)throw new Error('Use unique non-empty column headings.');
 return {records:parsed.rows.map(cells=>Object.fromEntries(headers.map((h,i)=>[h,cells[i]||'']))),decimalComma:delimiter!==','};
}
function flattenJson(node:any,inherited:Record<string,any>={},out:Record<string,any>[]=[]){
 if(Array.isArray(node)){for(const item of node)flattenJson(item,inherited,out);return out}
 if(!node||typeof node!=='object')return out;
 const scalar:Record<string,any>={},nested:[string,any][]=[];
 for(const [k,v]of Object.entries(node)){if(v&&typeof v==='object')nested.push([k,v]);else scalar[key(k)]=v}
 const merged={...inherited,...scalar};
 if(!nested.length)out.push(merged);
 else for(const [childKey,v]of nested){
  const child=key(childKey),context={...merged};
  if(child==='exercises')context.workoutname=merged.workoutname||scalar.workout||scalar.sessionname||scalar.session||scalar.title||scalar.name;
  if(child==='sets')context.exercisename=merged.exercisename||scalar.exercisetitle||scalar.exercise||scalar.movement||scalar.title||scalar.name;
  if(child==='sets'&&Array.isArray(v)&&v.every(x=>x==null||typeof x!=='object'))v.forEach((reps:number,i:number)=>flattenJson({reps,setnumber:i+1},context,out));
  else flattenJson(v,context,out);
 }
 return out;
}
const get=(row:Record<string,any>,names:string[])=>{for(const n of names){const v=row[key(n)];if(v!==undefined&&v!==null&&String(v).trim()!=='')return v;}return undefined;};
function dateValue(v:any,source=''){
 if(v==null)return null;const s=String(v).trim();
 const validate=(iso:string)=>{const date=new Date(iso+'T12:00:00Z');return !Number.isNaN(+date)&&date.toISOString().slice(0,10)===iso?iso:null};
 let m=s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
 if(m)return validate(`${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`);
 m=s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})/);
 if(m){const first=Number(m[1]),second=Number(m[2]),mdy=first<=12&&(second>12||/myfitnesspal|macrofactor|strong|hevy/i.test(source));return validate(`${m[3]}-${(mdy?m[1]:m[2]).padStart(2,'0')}-${(mdy?m[2]:m[1]).padStart(2,'0')}`)}
 const d=/^\d{10}(?:\d{3})?$/.test(s)?new Date(Number(s)*(s.length===10?1000:1)):new Date(s);
 return Number.isNaN(+d)?null:d.toISOString().slice(0,10);
}
const num=(v:any,decimalComma=false)=>{
 if(typeof v==='number')return Number.isFinite(v)?v:0;if(v==null)return 0;
 let value=String(v).trim();
 if(decimalComma&&value.includes(','))value=value.replace(/\./g,'').replace(',','.');else value=value.replace(/,/g,'');
 const n=Number(value.replace(/[^\d.+-]/g,''));return Number.isFinite(n)?n:0;
};
const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)||'exercise';
function stableId(s:string){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return (h>>>0).toString(36);}
function muscle(name:string){const n=name.toLowerCase();if(/lateral raise|side delt/.test(n))return 'Side delts';if(/rear delt|reverse fly/.test(n))return 'Rear delts';if(/wrist|forearm|reverse curl/.test(n))return 'Forearms';if(/shoulder press|overhead press|front raise|front delt/.test(n))return 'Front delts';if(/squat|leg extension|lunge|leg press|step.?up/.test(n))return 'Quads';if(/hamstring|leg curl|stiff|romanian|rdl|deadlift/.test(n))return 'Hamstrings';if(/hip thrust|glute|kickback/.test(n))return 'Glutes';if(/calf/.test(n))return 'Calves';if(/tibialis/.test(n))return 'Tibialis';if(/chest|bench|pec|fly|press/.test(n))return 'Chest';if(/lat|pulldown|pull.?up|chin.?up/.test(n))return 'Lats';if(/row|kelso|shrug/.test(n))return 'Upper back';if(/lateral raise|side delt/.test(n))return 'Side delts';if(/rear delt|reverse fly/.test(n))return 'Rear delts';if(/front raise|front delt/.test(n))return 'Front delts';if(/curl|bicep/.test(n))return 'Biceps';if(/tricep|pushdown|skull.?crusher/.test(n))return 'Triceps';if(/wrist|forearm|reverse curl/.test(n))return 'Forearms';if(/ab|crunch|sit.?up/.test(n))return 'Abs';return 'Other';}
export function parseHistoryFile(text:string,kind:'workouts'|'nutrition',source='Imported app'){
 let records:Record<string,any>[],decimalComma=false;const trimmed=text.trim();if(!trimmed)throw new Error('The selected file is empty.');try{records=flattenJson(JSON.parse(trimmed));}catch(e){if(e instanceof SyntaxError){const parsed=parseCsv(text);records=parsed.records;decimalComma=parsed.decimalComma}else throw e;}if(records.length>25000)throw new Error('This file contains more than 25,000 rows. Export a smaller date range and try again.');
 const number=(value:any)=>num(value,decimalComma);
 const workouts:WorkoutImport[]=[],meals:MealImport[]=[],daily:DailyNutritionImport[]=[];const dates=['date','entry date','workout date','workout datetime','logged date','start date','start time','started at','timestamp','datetime','date time','day'];
 const recordDate=(row:Record<string,any>,index:number)=>{const raw=get(row,dates),date=dateValue(raw,source);if(raw!==undefined&&!date)throw new Error(`Invalid calendar date on source row ${index+2}. Check the date in your export.`);return date};
 if(kind==='workouts'){
  const groups=new Map<string,WorkoutImport>();for(const [rowIndex,r] of records.entries()){const date=recordDate(r,rowIndex),exercise=String(get(r,['exercise','exercise name','movement','lift','exercise title','name'])||'').trim();if(!date||!exercise)continue;const session=String(get(r,['workout name','workout','session','session name','title'])||'Workout').trim().slice(0,80);const reps=number(get(r,['reps','rep','repetitions','rep count']));const setCount=Math.max(1,Math.min(50,Math.floor(number(get(r,['set count','number of sets','sets count']))||1)));if(!reps)continue;const weightRaw=get(r,['weight kg','load kg','weight lbs','weight lb','load','weight','load kg']);let weight=number(weightRaw);const unit=String(get(r,['weight unit','unit'])||'').toLowerCase();if(/lb/.test(unit)||/lbs|lb/.test(String(weightRaw||''))||get(r,['weight lbs','weight lb'])!==undefined)weight*=0.45359237;const groupKey=`${date}|${session}`;let w=groups.get(groupKey);if(!w){w={id:`imp-${stableId(groupKey)}`,date,name:session,notes:`Imported from ${source}`,sets:[]};groups.set(groupKey,w);}const setIndex=String(get(r,['set number','set #','set index','set'])||'');const rows=setIndex?1:setCount,type=String(get(r,['set type','type'])||'').toLowerCase(),warmup=/warm.?up/.test(type),failure=/failure/.test(type);for(let i=0;i<rows;i++)w.sets.push({exerciseId:slug(exercise),name:exercise.slice(0,100),muscle:muscle(exercise),equipment:'free-weight',weight,bandColors:[],gymPinAdded:false,gymPinWeight:0,reps,rir:failure?0:null,completed:true,warmup,failure,...(/drop/.test(type)?{setType:'drop' as const}:{})});}workouts.push(...groups.values());
 }else{
  const dailyByDate=new Map<string,DailyNutritionImport>();for(const [rowIndex,r] of records.entries()){const date=recordDate(r,rowIndex),name=String(get(r,['food name','food','item','description','food description','recipe name','meal name','name'])||'').trim(),cal=number(get(r,['calories','calories kcal','energy kcal','kcal','energy'])),protein=number(get(r,['protein','protein g','protein grams'])),carbs=number(get(r,['carbs','carbohydrates','total carbs','carbohydrate g','carbohydrates g'])),fat=number(get(r,['fat','total fat','fat g','lipids']));if(!date||!(cal||protein||carbs||fat))continue;if(name){const cat=String(get(r,['category','meal type','meal'])||'Imported');meals.push({id:`imp-${stableId(`${date}|${name}|${cal}|${protein}|${carbs}|${fat}`)}`,date,name:name.slice(0,120),category:['Breakfast','Lunch','Dinner','Snacks'].includes(cat)?cat:'Uncategorized',calories:cal,protein,carbs,fat,notes:`Imported from ${source}`});}else{const old=dailyByDate.get(date)||{date,calories:0,protein:0,carbs:0,fat:0,notes:`Imported from ${source}`};old.calories=cal||old.calories;old.protein=protein||old.protein;old.carbs=carbs||old.carbs;old.fat=fat||old.fat;dailyByDate.set(date,old);}}daily.push(...dailyByDate.values());
 }
 if(kind==='workouts'&&!workouts.length)throw new Error('No workout rows found. Include date, exercise, reps, and an optional weight column in a CSV, or use a compatible JSON export.');if(kind==='nutrition'&&!meals.length&&!daily.length)throw new Error('No food or daily nutrition rows found. Include a date and food name or calorie/macro values.');return {workouts,meals,daily};
}
