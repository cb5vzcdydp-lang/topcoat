export type WidgetSize='s'|'m'|'l';
export type WidgetSetting={id:string;size:WidgetSize;visible:boolean;view:string};
export const homeWidgets=[
 {id:'training',name:'Training',group:'Core',size:'l',views:[]},
 {id:'calories',name:'Calories',group:'Core',size:'s',views:['Ring','Week','Number']},
 {id:'macros',name:'Macros',group:'Core',size:'s',views:['Bars','Rings']},
 {id:'grass',name:'Touch Grass body',group:'Life',size:'l',views:[]},
 {id:'weight',name:'Bodyweight',group:'Core',size:'l',views:['Chart','Number']},
 {id:'steps',name:'Steps',group:'Core',size:'l',views:['Bars','Heatmap']},
 {id:'physique',name:'Physique',group:'Core',size:'s',views:[]},
 {id:'volume',name:'Volume',group:'Training',size:'m',views:[]},
 {id:'consistency',name:'Consistency',group:'Training',size:'m',views:[]},
 {id:'sleep',name:'Sleep & recovery',group:'Health',size:'m',views:[]},
 {id:'maintenance',name:'Maintenance calories',group:'Nutrition',size:'l',views:[]},
 {id:'checkin',name:'Daily check-in',group:'Progress',size:'m',views:[]},
 {id:'recap',name:'Weekly recap',group:'Progress',size:'l',views:[]},
 {id:'history',name:'Food & training history',group:'Progress',size:'l',views:[]}
] as const;
export function defaultWidgets(casual=false):WidgetSetting[]{return homeWidgets.map(w=>({id:w.id,size:w.size,visible:!casual||['training','calories','grass','weight','checkin'].includes(w.id),view:w.views[0]||''}));}
/** Keep saved order, reject unknown values and append newly introduced cards. */
export function normalizeWidgets(value:unknown,casual=false):WidgetSetting[]{
 const defaults=defaultWidgets(casual);if(!Array.isArray(value))return defaults;
 const seen=new Set<string>(),out:WidgetSetting[]=[];
 for(const v of value){if(!v||typeof v!=='object'||typeof v.id!=='string'||seen.has(v.id))continue;const def=defaults.find(x=>x.id===v.id),spec=homeWidgets.find(x=>x.id===v.id);if(!def||!spec)continue;seen.add(v.id);out.push({...def,size:['s','m','l'].includes(v.size)?v.size:def.size,visible:typeof v.visible==='boolean'?v.visible:def.visible,view:(spec.views as readonly string[]).includes(v.view)?v.view:def.view});}
 return [...out,...defaults.filter(x=>!seen.has(x.id))];
}
export function moveWidget(items:WidgetSetting[],from:string,to:string){const a=items.findIndex(x=>x.id===from),b=items.findIndex(x=>x.id===to);if(a<0||b<0||a===b)return items;const out=[...items];const [item]=out.splice(a,1);out.splice(b,0,item);return out;}
export function selectedWeek(date:string){return Array.from({length:7},(_,i)=>{const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+i-3);return d.toISOString().slice(0,10)});}
export function planDayFor(date:string){return (new Date(date+'T12:00:00Z').getUTCDay()+6)%7;}
