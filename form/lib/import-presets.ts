import {delimitedRows, mappedDate, mappedNumber} from './import-mapping';
import {parseHistoryFile} from './history-import';

type Preset = {
  id: string; name: string; provider: string; kind: 'workouts'|'nutrition';
  headers: Record<string,string>; required: string[]; order: 'YMD'|'DMY'|'MDY';
  pounds?: boolean; sample: string;
};

/** Versioned, fixture-tested column layouts, not a claim to support every vendor export. */
export const importPresets: Preset[] = [
  {id:'hevy-sets-1',name:'Hevy · set CSV layout 1',provider:'Hevy',kind:'workouts',order:'YMD',
    headers:{date:'start_time',exercise:'exercise_title',reps:'reps',weight:'weight_kg','set type':'set_type','workout name':'title'},
    required:['date','exercise','reps','weight'],
    sample:'title,start_time,exercise_title,set_type,weight_kg,reps\nUpper,2026-10-20 07:30:00,Bench Press (Barbell),normal,60,8\n'},
  {id:'strong-sets-kg-1',name:'Strong · kg set CSV layout 1',provider:'Strong',kind:'workouts',order:'YMD',
    headers:{date:'Date',exercise:'Exercise Name',reps:'Reps',weight:'Weight','workout name':'Workout Name'},
    required:['date','exercise','reps','weight'],
    sample:'Date,Workout Name,Exercise Name,Weight,Reps\n2026-10-20 07:30:00,Upper,Bench Press,60,8\n'},
  {id:'cronometer-foods-1',name:'Cronometer · food CSV layout 1',provider:'Cronometer',kind:'nutrition',order:'YMD',
    headers:{date:'Day','food name':'Food Name',calories:'Energy (kcal)',protein:'Protein (g)',carbs:'Carbs (g)',fat:'Fat (g)',category:'Group'},
    required:['date','food name','calories','protein','carbs','fat'],
    sample:'Day,Group,Food Name,Energy (kcal),Protein (g),Carbs (g),Fat (g)\n2026-10-20,Breakfast,Milk,90,8,12,0\n'},
  {id:'macrofactor-daily-1',name:'MacroFactor · daily macro CSV layout 1',provider:'MacroFactor',kind:'nutrition',order:'YMD',
    headers:{date:'Date',calories:'Calories (kcal)',protein:'Protein (g)',carbs:'Carbs (g)',fat:'Fat (g)'},
    required:['date','calories','protein','carbs','fat'],
    sample:'Date,Calories (kcal),Protein (g),Carbs (g),Fat (g)\n2026-10-20,2100,130,245,62\n'},
];
const normal = (s:string) => s.trim().replace(/^\uFEFF/,'').toLowerCase();
export function presetMapping(preset:Preset, headers:string[]) {
  return Object.fromEntries(Object.entries(preset.headers).flatMap(([field,expected]) => {
    const actual = headers.find(header => normal(header) === normal(expected));
    return actual ? [[field,actual]] : [];
  }));
}
export function parsePresetHistory(text:string, presetId:string) {
  const preset=importPresets.find(p => p.id===presetId);
  if(!preset) throw new Error('Choose an available import preset.');
  const {headers,rows}=delimitedRows(text),mapping=presetMapping(preset,headers);
  const missing=preset.required.filter(field=>!mapping[field]);
  if(missing.length) throw new Error(`This file does not match ${preset.name}. Missing columns: ${missing.map(field=>preset.headers[field]).join(', ')}. Choose another preset or use manual column mapping.`);
  if(!rows.length) throw new Error('This file has headings but no data rows.');
  const canonical=rows.map((row,index)=>{
    try {
      const get=(field:string)=>row[headers.indexOf(mapping[field])]||'';
      const value:Record<string,string|number>={date:mappedDate(get('date'),preset.order)};
      for(const field of Object.keys(mapping).filter(field=>field!=='date')) {
        const raw=get(field);
        if(['weight','reps','calories','protein','carbs','fat'].includes(field)) value[field]=mappedNumber(raw,false);
        else value[field]=raw;
      }
      const name=preset.kind==='workouts'?value.exercise:value['food name'];
      if((preset.kind==='workouts'||mapping['food name'])&&!String(name||'').trim()) throw new Error('Missing exercise or food name');
      if(preset.kind==='workouts') {
        if(!Number.isInteger(value.reps)||Number(value.reps)<=0) throw new Error('Use a positive whole repetition count');
        value['weight kg']=Number(value.weight)*(preset.pounds?0.45359237:1);delete value.weight;
      }
      return value;
    } catch(error:any) {throw new Error(`Row ${index+2}: ${error.message}. Review the source file before importing.`)}
  });
  return {preset, ...parseHistoryFile(JSON.stringify(canonical),preset.kind,`${preset.provider} (${preset.id})`)};
}
