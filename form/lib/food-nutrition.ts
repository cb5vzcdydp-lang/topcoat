import {z} from 'zod';
export const nutrientGroups = {
 'General': [['fibre','Fibre','g',28,'fiber'],['sugars','Sugars','g',0,'sugars'],['starch','Starch','g',0,'starch'],['water','Water','g',0,'water'],['alcohol','Alcohol','g',0,'alcohol'],['caffeine','Caffeine','mg',0,'caffeine'],['oxalate','Oxalate','mg',0,'oxalate'],['phytate','Phytate','mg',0,'phytate']],
 'Vitamins': [['vitaminA','Vitamin A','µg',900,'vitamin-a'],['b1','B1 (Thiamine)','mg',1.2,'vitamin-b1'],['b2','B2 (Riboflavin)','mg',1.3,'vitamin-b2'],['b3','B3 (Niacin)','mg',16,'vitamin-pp'],['b5','B5 (Pantothenic acid)','mg',5,'pantothenic-acid'],['b6','B6 (Pyridoxine)','mg',1.7,'vitamin-b6'],['biotin','B7 (Biotin)','µg',30,'biotin'],['folate','B9 (Folate)','µg',400,'folates'],['b12','B12 (Cobalamin)','µg',2.4,'vitamin-b12'],['vitaminC','Vitamin C','mg',90,'vitamin-c'],['vitaminD','Vitamin D','µg',20,'vitamin-d'],['vitaminE','Vitamin E','mg',15,'vitamin-e'],['vitaminK','Vitamin K','µg',120,'vitamin-k'],['choline','Choline','mg',550,'choline']],
 'Minerals': [['calcium','Calcium','mg',1300,'calcium'],['iron','Iron','mg',18,'iron'],['magnesium','Magnesium','mg',420,'magnesium'],['phosphorus','Phosphorus','mg',1250,'phosphorus'],['potassium','Potassium','mg',4700,'potassium'],['sodium','Sodium','mg',2300,'sodium'],['zinc','Zinc','mg',11,'zinc'],['copper','Copper','mg',0.9,'copper'],['manganese','Manganese','mg',2.3,'manganese'],['selenium','Selenium','µg',55,'selenium'],['iodine','Iodine','µg',150,'iodine'],['chromium','Chromium','µg',35,'chromium'],['molybdenum','Molybdenum','µg',45,'molybdenum'],['chloride','Chloride','mg',2300,'chloride'],['fluoride','Fluoride','mg',0,'fluoride']],
 'Fats': [['saturatedFat','Saturated fat','g',20,'saturated-fat'],['monounsaturatedFat','Monounsaturated fat','g',0,'monounsaturated-fat'],['polyunsaturatedFat','Polyunsaturated fat','g',0,'polyunsaturated-fat'],['transFat','Trans fat','g',0,'trans-fat'],['omega3','Omega-3','g',0,'omega-3-fat'],['omega6','Omega-6','g',0,'omega-6-fat'],['cholesterol','Cholesterol','mg',300,'cholesterol']],
 'Amino acids': [['alanine','Alanine','g',0,'alanine'],['arginine','Arginine','g',0,'arginine'],['asparticAcid','Aspartic acid','g',0,'aspartic-acid'],['cystine','Cystine','g',0,'cystine'],['glutamicAcid','Glutamic acid','g',0,'glutamic-acid'],['glycine','Glycine','g',0,'glycine'],['histidine','Histidine','g',0,'histidine'],['isoleucine','Isoleucine','g',0,'isoleucine'],['leucine','Leucine','g',0,'leucine'],['lysine','Lysine','g',0,'lysine'],['methionine','Methionine','g',0,'methionine'],['phenylalanine','Phenylalanine','g',0,'phenylalanine'],['proline','Proline','g',0,'proline'],['serine','Serine','g',0,'serine'],['threonine','Threonine','g',0,'threonine'],['tryptophan','Tryptophan','g',0,'tryptophan'],['tyrosine','Tyrosine','g',0,'tyrosine'],['valine','Valine','g',0,'valine']]
} as const;
export const nutrientList=Object.values(nutrientGroups).flat();
export const nutrientSchema=z.record(z.enum(nutrientList.map(n=>n[0]) as [string,...string[]]),z.number().finite().min(0).max(1e7));
const nutrientKeySchema=z.enum(nutrientList.map(n=>n[0]) as [string,...string[]]);
export const nutrientEstimateSchema=z.object({sourceName:z.string().max(160),sourceBrand:z.string().max(120).optional(),source:z.string().max(500),confidence:z.enum(['high','medium','low']),score:z.number().min(0).max(1),method:z.enum(['serving weight','energy ratio','ingredient sum']),keys:z.array(nutrientKeySchema).max(nutrientList.length)});
export const foodReferenceSchema=z.object({servingSize:z.string().max(60).default('1 serving'),servingGrams:z.number().positive().max(100000).nullable().optional(),servingMl:z.number().positive().max(100000).optional(),gramsPerMl:z.number().positive().max(100).optional(),householdUnit:z.string().max(30).optional(),gramsPerHousehold:z.number().positive().max(100000).optional(),calories:z.number().min(0).max(10000),protein:z.number().min(0).max(1000),carbs:z.number().min(0).max(2000),fat:z.number().min(0).max(1000),nutrients:nutrientSchema.default({}),nutrientEstimate:nutrientEstimateSchema.optional(),source:z.string().max(500).default('Manual entry')});
export const portionUnits=['g','kg','oz','serving','ml','L','tsp','tbsp','cup','household'] as const;
export type PortionUnit=typeof portionUnits[number];
export const foodCompositionSchema=z.object({kind:z.enum(['meal','recipe']),servings:z.number().finite().positive().max(1000),items:z.array(z.object({id:z.string().uuid(),name:z.string().trim().min(1).max(120),amount:z.number().finite().positive().max(100000),unit:z.enum(portionUnits),reference:foodReferenceSchema})).min(1).max(40)});
export const portionSchema=z.object({amount:z.number().finite().positive().max(100000),unit:z.enum(portionUnits),reference:foodReferenceSchema,composition:foodCompositionSchema.optional()});
export function servingGrams(food:any):number|null{
 if(typeof food.servingGrams==='number'&&food.servingGrams>0)return food.servingGrams;
 const m=String(food.servingSize||food.serving_size||'').match(/(\d+(?:\.\d+)?)\s*(kg|mg|g)\b/i);
 return m?Number(m[1])*({kg:1000,mg:.001,g:1}[m[2].toLowerCase()]||1):null;
}
export function editorPortion(value:any,scanned=false){
 const reference=value.nutrition?.reference|| (scanned?{...value.food,servingSize:value.food?.servingSize||value.food?.serving_size||'1 serving'}:{...value,servingSize:'1 serving'});
 const grams=servingGrams(reference);
 return {...value.nutrition,reference,amount:value.nutrition?.amount??(grams||1),unit:(value.nutrition?.unit||(grams?'g':'serving')) as PortionUnit};
}
const massGrams:Partial<Record<PortionUnit,number>>={g:1,kg:1000,oz:28.349523125};
const volumeMl:Partial<Record<PortionUnit,number>>={ml:1,L:1000,tsp:4.92892159375,tbsp:14.78676478125,cup:236.5882365};
export function portionFactor(food:any,amount:number,unit:PortionUnit){
 const grams=servingGrams(food)||(food.servingMl&&food.gramsPerMl?food.servingMl*food.gramsPerMl:null);
 if(!Number.isFinite(amount)||amount<=0)throw new Error('Enter an amount greater than zero.');
 if(unit in massGrams){if(!grams)throw new Error('Enter the label serving weight before logging by weight.');return amount*massGrams[unit]!/grams;}
 if(unit in volumeMl){const ml=amount*volumeMl[unit]!;if(food.servingMl)return ml/food.servingMl;if(grams&&food.gramsPerMl)return ml*food.gramsPerMl/grams;throw new Error('Enter the label serving volume or product density before logging liquids.');}
 if(unit==='household'){if(!(grams&&food.gramsPerHousehold))throw new Error('Enter the label weight and household-unit weight first.');return amount*food.gramsPerHousehold/grams;}
 return amount;
}
export function scaleFood(food:any,amount:number,unit:PortionUnit){
 const factor=portionFactor(food,amount,unit);
 const scaled:any={nutrients:{}};
 for(const key of ['calories','protein','carbs','fat']){if(typeof food[key]!=='number'||!Number.isFinite(food[key])||food[key]<0)throw new Error('Enter every macro from the label; use 0 only when it reports zero.');scaled[key]=Math.round(food[key]*factor*10000)/10000;}
 for(const [key,value] of Object.entries(food.nutrients||{}))if(typeof value==='number'&&Number.isFinite(value))scaled.nutrients[key]=Math.round(value*factor*1e6)/1e6;
 return scaled;
}
export function prepareMeal(value:any,scanned=false){
 const p=editorPortion(value,scanned);if(['calories','protein','carbs','fat'].some(key=>typeof p.reference[key]!=='number'||!Number.isFinite(p.reference[key])))throw new Error('Enter calories, protein, carbohydrates and fat from the label. Use 0 only for a known zero.');const reference=foodReferenceSchema.parse({...p.reference,servingSize:String(p.reference.servingSize||'1 serving').slice(0,60),servingGrams:servingGrams(p.reference)}),nutrition=portionSchema.parse({...p,reference}),scaled=scaleFood(reference,p.amount,p.unit);
 return {...value,...scaled,name:String(scanned?value.food?.name||'':value.name||'').trim().slice(0,120),nutrition};
}
// Open Food Facts reports mass nutrients in grams even when their display unit is mg/µg.
export function lookupNutrients(n:Record<string,unknown>,suffix:string){
 const out:Record<string,number>={};
 for(const [key,,unit,,off] of nutrientList){const raw=n[off+suffix];if(raw===null||raw===undefined||raw==='')continue;const v=Number(raw);if(Number.isFinite(v)&&v>=0)out[key]=v*(unit==='mg'?1000:unit==='µg'?1e6:1);}
 return out;
}

const foodStopWords=new Set(['a','an','and','the','with','per','serving','serve','brand','product','fresh','australian','australia']);
const normaliseFoodName=(name:string)=>name.toLowerCase().replace(/fat[ -]?free|non[ -]?fat|skimmed/g,'skim').replace(/full[ -]?cream/g,'whole').replace(/lactose[ -]?free/g,'lactosefree').replace(/[^a-z0-9]+/g,' ').trim();
const foodTokens=(food:any)=>new Set(normaliseFoodName(`${food?.name||''} ${food?.brand||''}`).split(/\s+/).filter(x=>x.length>1&&!foodStopWords.has(x)&&!/^\d+$/.test(x)));
const variantGroups=[['skim','whole'],['skim','reduced'],['sweetened','unsweetened'],['lactosefree','regular'],['powder','liquid']];
function incompatibleVariants(a:Set<string>,b:Set<string>){return a.has('powder')!==b.has('powder')||variantGroups.some(group=>group.some(x=>a.has(x))&&group.some(x=>b.has(x))&&!group.some(x=>a.has(x)&&b.has(x)))}
function macroProfile(food:any){const total=Math.max(1,Number(food?.protein||0)*4+Number(food?.carbs||0)*4+Number(food?.fat||0)*9);return [Number(food?.protein||0)*4/total,Number(food?.carbs||0)*4/total,Number(food?.fat||0)*9/total]}
export type MicronutrientEstimate={nutrients:Record<string,number>;metadata:z.infer<typeof nutrientEstimateSchema>;donor:any};
/** Project only missing micronutrients from the closest compatible food. Existing values always win. */
export function estimateMissingMicronutrients(target:any,candidates:any[]):MicronutrientEstimate|null{
 const targetNutrients=target?.nutrients||{},missing=nutrientList.map(n=>n[0]).filter(key=>typeof targetNutrients[key]!=='number');if(!missing.length)return null;
 const a=foodTokens(target),targetProfile=macroProfile(target),targetGrams=servingGrams(target);let best:{food:any;score:number}|null=null;
 for(const food of candidates){if(!food||food===target)continue;const known=Object.entries(food.nutrients||{}).filter(([key,value])=>missing.includes(key as any)&&typeof value==='number'&&Number.isFinite(value as number));if(!known.length)continue;const b=foodTokens(food);if(!a.size||!b.size||incompatibleVariants(a,b))continue;const shared=[...a].filter(x=>b.has(x)).length;if(!shared)continue;const nameScore=2*shared/(a.size+b.size),profile=macroProfile(food),macroScore=Math.max(0,1-(Math.abs(targetProfile[0]-profile[0])+Math.abs(targetProfile[1]-profile[1])+Math.abs(targetProfile[2]-profile[2]))/2),score=nameScore*.72+macroScore*.28;if(score<.42||best&&score<=best.score)continue;best={food,score};
 }
 if(!best)return null;const donor=best.food,donorGrams=servingGrams(donor);let factor=1,method:'serving weight'|'energy ratio'='energy ratio';if(targetGrams&&donorGrams){factor=targetGrams/donorGrams;method='serving weight'}else if(Number(target.calories)>0&&Number(donor.calories)>0)factor=Number(target.calories)/Number(donor.calories);factor=Math.max(.05,Math.min(20,factor));
 const nutrients:Record<string,number>={};for(const key of missing){const value=Number(donor.nutrients?.[key]);if(Number.isFinite(value)&&value>=0)nutrients[key]=Math.round(value*factor*1e6)/1e6}if(!Object.keys(nutrients).length)return null;
 const score=Math.round(best.score*100)/100,confidence=score>=.72?'high':score>=.56?'medium':'low';return {nutrients,donor,metadata:{sourceName:String(donor.name||'Similar food').slice(0,160),sourceBrand:String(donor.brand||'').slice(0,120)||undefined,source:String(donor.source||'Food database').slice(0,120),confidence,score,method,keys:Object.keys(nutrients) as any}};
}
export function applyMicronutrientEstimate(target:any,estimate:MicronutrientEstimate){return {...target,nutrients:{...(target.nutrients||{}),...estimate.nutrients},nutrientEstimate:estimate.metadata}}
