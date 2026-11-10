import {contrast,inkFor,mix,type Preferences} from './preferences';
/** Derived display tones only: never write back or migrate the saved colours. */
export function readableTone(color:string,surfaces:string[],minimum=4.5){
 if(surfaces.every(bg=>contrast(color,bg)>=minimum))return color;
 const target=['#000000','#ffffff'].sort((a,b)=>Math.min(...surfaces.map(bg=>contrast(b,bg)))-Math.min(...surfaces.map(bg=>contrast(a,bg))))[0];
 for(let step=1;step<=100;step++){const tone=mix(color,target,step/100);if(surfaces.every(bg=>contrast(tone,bg)>=minimum))return tone;}
 return target;
}
export function themeTokens(p:Preferences,systemLight=false){
 const light=p.theme==='light'||p.theme==='system'&&systemLight;
 const bg=light?'#f4f6fa':p.background,text=inkFor(bg);
 const surface=(amount:number)=>{const proposed=mix(bg,text,amount);return contrast(proposed,text)>=4.5?proposed:readableTone(proposed,[text],4.5)};
 const panel=surface(light?.02:.065),panel2=surface(light?.055:.105),nav=surface(.025),hover=surface(light?.075:.135),pressed=surface(light?.09:.15);
 const green=contrast(p.accent,bg)>=3?p.accent:mix(p.accent,text,.55);
 const accentSoft=readableTone(mix(panel,green,.1),[text]);
 const surfaces=[bg,panel,panel2,nav,hover,pressed,accentSoft];
 const muted=readableTone(mix(bg,text,p.highContrast?.8:.66),surfaces,p.highContrast?7:4.5);
 return {'--bg':bg,'--panel':panel,'--panel2':panel2,'--nav':nav,'--line':mix(bg,text,p.highContrast?.55:.23),'--text':text,'--muted':muted,'--green':green,'--accent':green,'--ink':inkFor(green),'--accent-text':readableTone(green,surfaces),'--focus':readableTone(green,surfaces,3),'--control-line':readableTone(mix(bg,text,p.highContrast?.55:.38),surfaces,3),'--surface-hover':hover,'--surface-pressed':pressed,'--accent-soft':accentSoft,'--chart-secondary':readableTone(mix(panel,green,.58),surfaces,3)};
}
