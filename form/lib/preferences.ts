import {z} from 'zod';
import {hotbarDestinations} from './app-navigation';
import {homeWidgets} from './home-widgets';
const homeWidgetSchema=z.object({id:z.enum(homeWidgets.map(row=>row.id) as [string,...string[]]),size:z.enum(['s','m','l']),visible:z.boolean(),view:z.string().max(30)});

export const repRangeSchema=z.object({min:z.number().int().min(1).max(1000),max:z.number().int().min(1).max(1000)}).refine(r=>r.max>=r.min,'Maximum reps must be at least minimum reps');
export const defaultRepRanges=[{min:1,max:5},{min:6,max:10},{min:11,max:15}];
export const preferencesSchema=z.object({
 hotbarPages:z.array(z.enum(hotbarDestinations)).min(3).max(4).refine(pages=>new Set(pages).size===pages.length,'Choose different hotbar destinations.').default(['Home','Calories','Training','AI coach']),
 homeLayouts:z.object({casual:z.array(homeWidgetSchema).max(30).optional(),science:z.array(homeWidgetSchema).max(30).optional()}).default({}),
 repRecordRanges:z.array(repRangeSchema).min(1).max(8).default(defaultRepRanges),
 theme:z.enum(['dark','light','system']).default('dark'),accent:z.string().regex(/^#[0-9a-f]{6}$/i).default('#58c9da'),background:z.string().regex(/^#[0-9a-f]{6}$/i).default('#0a1320'),
 highContrast:z.boolean().default(false),largeText:z.boolean().default(false),reducedMotion:z.boolean().default(false),leftHanded:z.boolean().default(false),oneHand:z.boolean().default(false),sound:z.boolean().default(false),vibration:z.boolean().default(false),hideComparisons:z.boolean().default(false),
 paceUnit:z.enum(['min/km','min/mi','km/h']).default('min/km'),
 weightUnit:z.enum(['kg','lb']).default('kg'),distanceUnit:z.enum(['km','mi']).default('km'),waterUnit:z.enum(['L','ml','oz']).default('L'),dateFormat:z.enum(['en-AU','en-US','en-GB']).default('en-AU'),
 quickActions:z.array(z.enum(['Start workout','Add food','Log weight','Add cardio','Habits','Import'])).max(6).default(['Start workout','Add food','Log weight']),pinnedPages:z.array(z.string().max(40)).max(8).default([]),
 quietStart:z.string().regex(/^\d{2}:\d{2}$/).default('22:00'),quietEnd:z.string().regex(/^\d{2}:\d{2}$/).default('07:00'),remindersPausedUntil:z.string().max(10).default(''),celebrations:z.boolean().default(true)
});
export type Preferences=z.infer<typeof preferencesSchema>;
export const defaultPreferences=preferencesSchema.parse({});
export const palettePresets=[['Ocean','#58c9da','#0a1320'],['Forest','#7de0a1','#101b17'],['Violet','#c1a0ff','#171225'],['Rose','#ff9eb9','#21131b'],['Amber','#ffd078','#1e1910'],['Slate','#c9d7eb','#161b23']] as const;
export function luminance(hex:string){const c=hex.slice(1).match(/../g)!.map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]}
export function contrast(a:string,b:string){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
export function inkFor(color:string){return contrast(color,'#ffffff')>=contrast(color,'#000000')?'#ffffff':'#000000'}
export function mix(a:string,b:string,amount:number){return '#'+[0,1,2].map(i=>Math.round(parseInt(a.slice(1+i*2,3+i*2),16)*(1-amount)+parseInt(b.slice(1+i*2,3+i*2),16)*amount).toString(16).padStart(2,'0')).join('')}
