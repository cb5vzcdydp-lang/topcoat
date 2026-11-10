import {nutrientList,scaleFood} from './food-nutrition';

export type MealNutritionSummary={calories:number;protein:number;carbs:number;fat:number;nutrients:Record<string,number>;knownMicros:number;estimatedNutrients:string[]};

export function summarizeMealNutrition(entries:any[]):MealNutritionSummary{
 const result:MealNutritionSummary={calories:0,protein:0,carbs:0,fat:0,nutrients:{},knownMicros:0,estimatedNutrients:[]};const estimated=new Set<string>();
 for(const entry of entries){
  result.calories+=Number(entry?.calories||0);result.protein+=Number(entry?.protein||0);result.carbs+=Number(entry?.carbs||0);result.fat+=Number(entry?.fat||0);
  let nutrients=entry?.nutrients;
  if(!nutrients&&entry?.nutrition?.reference)try{nutrients=scaleFood(entry.nutrition.reference,Number(entry.nutrition.amount),entry.nutrition.unit).nutrients}catch{}
  for(const key of entry?.nutrition?.reference?.nutrientEstimate?.keys||[])estimated.add(key);
  for(const [key,value] of Object.entries(nutrients||{}))if(typeof value==='number'&&Number.isFinite(value)&&value>=0)result.nutrients[key]=(result.nutrients[key]||0)+value;
 }
 for(const [key] of nutrientList)if(typeof result.nutrients[key]==='number')result.knownMicros++;
 result.estimatedNutrients=[...estimated].filter(key=>typeof result.nutrients[key]==='number');return result;
}
