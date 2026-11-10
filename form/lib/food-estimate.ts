import {z} from 'zod';
export const estimatedMacrosSchema=z.object({calories:z.number().finite().min(0).max(10000),protein:z.number().finite().min(0).max(1000),carbs:z.number().finite().min(0).max(2000),fat:z.number().finite().min(0).max(1000)});
export const foodEstimateSchema=z.object({name:z.string().trim().min(1).max(120),portion:z.string().trim().min(1).max(60),estimated:estimatedMacrosSchema,assumptions:z.array(z.string().trim().min(1).max(180)).max(6),notes:z.string().max(400)});
export type FoodEstimate=z.infer<typeof foodEstimateSchema>;
export function estimatedDiaryMeal(estimate:FoodEstimate,{id,date,category,time,servings}:{id:string;date:string;category:string;time:string;servings:number}){
 const macros=estimatedMacrosSchema.parse(Object.fromEntries(Object.entries(estimate.estimated).map(([key,value])=>[key,value*servings])));
 return {id,date,category,time,name:estimate.name,...macros,notes:`AI estimate · ${estimate.assumptions.join('; ')}. ${estimate.notes}`.slice(0,500),nutrition:{amount:servings,unit:'serving' as const,reference:{servingSize:estimate.portion,...estimate.estimated,nutrients:{},source:'AI estimate · written food description'}}};
}

/** Preserve valid nutrition when the provider adds formatting or verbose descriptions.
 * Never invent, coerce or clamp missing/invalid calorie or macro values. */
export function normalizeFoodEstimate(value:unknown):unknown {
 if(!value||typeof value!=='object'||Array.isArray(value))return value;
 const v=value as Record<string,unknown>;
 const short=(x:unknown,max:number)=>typeof x==='string'?x.trim().slice(0,max):x;
 return {...v,name:short(v.name,120),portion:short(v.portion,60),
  assumptions:v.assumptions==null?[]:Array.isArray(v.assumptions)?v.assumptions.map(x=>short(x,180)).filter(x=>x!=='').slice(0,6):v.assumptions,
  notes:v.notes==null?'':short(v.notes,400)};
}
