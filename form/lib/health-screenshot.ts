export type ScreenshotHealthValues={date:string;sleep_hours:string|number;steps:string|number;active_calories:string|number;total_calories:string|number;exercise_minutes:string|number;stand_hours:string|number};
export const emptyScreenshotValues=(date:string):ScreenshotHealthValues=>({date,sleep_hours:'',steps:'',active_calories:'',total_calories:'',exercise_minutes:'',stand_hours:''});
const validDate=(value:string)=>{const date=new Date(value+'T12:00:00Z');return /^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value;};
const fields=[['sleep_hours','sleep_duration','hours',24],['steps','steps','steps',200000],['active_calories','active_calories','kcal',10000],['total_calories','total_calories','kcal',15000],['exercise_minutes','exercise_minutes','minutes',1440],['stand_hours','stand_hours','hours',24]] as const;
export function screenshotHealthRows(values:ScreenshotHealthValues,client:string,source='Health screenshot'){
 if(!validDate(values.date))throw new Error('Choose a valid date.');
 const rows=fields.filter(([key])=>String(values[key]).trim()!=='').map(([key,metric,unit,max])=>{const value=Number(values[key]);if(!Number.isFinite(value)||value<0||value>max||key==='steps'&&!Number.isInteger(value))throw new Error(`Check the ${key.replaceAll('_',' ')} value.`);return {id:`${client}:manual-health:${values.date}:${metric}`,client,date:values.date,metric,value,unit,source};});
 if(!rows.length)throw new Error('Enter or detect at least one reading before saving.');return rows;
}
const numeric=(text:string)=>Number(text.replace(/,/g,''));
/** Read labelled blocks only. Never interpret the denominator of a ring as intake. */
export function parseHealthScreenshotText(raw:string):Partial<ScreenshotHealthValues>{
 const lines=raw.replace(/[|]/g,'I').split(/\n+/).map(x=>x.trim()).filter(Boolean),out:Partial<ScreenshotHealthValues>={};
 const label=/\b(?:time asleep|time in bed|sleep|asleep|steps?|move|active energy|active calories|total energy|total calories|total burn|energy burned|exercise|stand|deep|rem|core|awake)\b/i;
 const blocks=(match:RegExp)=>lines.flatMap((line,index)=>{const found=match.exec(line);if(!found)return [];let block=line.slice(found.index+found[0].length);if(!/\d/.test(block)&&/\d/.test(line.slice(0,found.index)))block=line.slice(0,found.index);for(let j=index+1;j<Math.min(lines.length,index+4)&&!label.test(lines[j]);j++)block+=' '+lines[j];return [block.trim()];});
 const first=(pattern:RegExp,extract:(text:string)=>number|null)=>{for(const block of blocks(pattern)){const value=extract(block);if(value!==null)return value}return null;};
 const amount=(text:string)=>{const match=text.match(/([\d][\d,]*(?:\.\d+)?)\s*(?:\/\s*[\d,.]+)?\s*(kcal|calories|cal|kj|min(?:ute)?s?|h(?:ou)?rs?|hours?)?\b/i);return match?{value:numeric(match[1]),unit:(match[2]||'').toLowerCase()}:null;};
 const assign=(key:keyof ScreenshotHealthValues,value:number|null,max:number)=>{if(value!==null&&Number.isFinite(value)&&value>=0&&value<=max)(out as Record<string,number>)[key]=Math.round(value*100)/100;};
 const sleep=(text:string)=>{const h=text.match(/(\d{1,2}(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i),m=text.match(/(\d{1,2})\s*(?:minutes?|mins?|m)\b/i);if(h||m)return Number(h?.[1]||0)+Number(m?.[1]||0)/60;return null;};
 assign('sleep_hours',first(/\b(?:time asleep|total sleep|sleep duration|asleep)\b/i,sleep)??first(/^sleep\b/i,sleep),24);
 assign('steps',first(/\bsteps?\b/i,text=>{const value=amount(text);return value?Math.round(value.value):null;}),200000);
 const energy=(text:string)=>{const value=amount(text);return value?value.value/(value.unit==='kj'?4.184:1):null;};
 assign('active_calories',first(/\b(?:active energy|active calories|move)\b/i,energy),10000);
 assign('total_calories',first(/\b(?:total energy(?: burned)?|total calories|total burn(?:ed)?|energy burned|total)\b/i,text=>/kcal|calories|\bcal\b|\bkj\b/i.test(text)?energy(text):null),15000);
 assign('exercise_minutes',first(/\bexercise\b/i,text=>amount(text)?.value??null),1440);
 assign('stand_hours',first(/\bstand\b/i,text=>amount(text)?.value??null),24);
 const date=raw.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);if(date){const value=`${date[1]}-${date[2].padStart(2,'0')}-${date[3].padStart(2,'0')}`;if(validDate(value))out.date=value;}return out;
}
