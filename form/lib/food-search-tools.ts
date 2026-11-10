import {prepareMeal,servingGrams,type PortionUnit} from './food-nutrition';

export const foodCategories=['All','Favourites','Custom','Common','Supplements','Brands','Restaurant','Beverages'] as const;
export type FoodCategory=typeof foodCategories[number];
export type FoodSort='best'|'az'|'za'|'recent'|'frequent';
export type FoodSelection={key:string;id:string;food:any;amount:number;unit:PortionUnit;category:string};
export const foodKey=(food:any)=>food.barcode?`barcode:${food.barcode}`:`name:${String(food.name||'').trim().toLowerCase()}|${String(food.brand||'').trim().toLowerCase()}`;
export function normaliseSavedFood(food:any){return {...food,...(food.nutrition?.reference||{}),servingSize:food.serving_size||food.servingSize||food.nutrition?.reference?.servingSize||'1 serving',source:food.nutrition?.reference?.source||'My custom foods',saved:true};}
export function uniqueFoods(foods:any[]){const seen=new Set<string>();return foods.filter(f=>{if(!f?.name)return false;const key=foodKey(f);if(seen.has(key))return false;seen.add(key);return true});}
export function normaliseFoodQuery(query:string){return query.replace(/\bmcdonalds\b/ig,"McDonald's").replace(/\bbettys(?: burgers)?\b/ig,"Betty's Burgers").replace(/\brolld\b/ig,"Roll'd").replace(/\bsubways\b/ig,'Subway').replace(/\bgyg\b/ig,'Guzman y Gomez').replace(/\bdominos\b/ig,"Domino's").replace(/\bnandos\b/ig,"Nando's").replace(/\bmacca'?s?\b/ig,"McDonald's").replace(/\bzambreros\b/ig,'Zambrero').replace(/\bhungry jacks\b/ig,"Hungry Jack's");}
export function filterFoods(foods:any[],{query='',category='All',sort='best',savedFoods=[],meals=[]}:{query?:string;category?:FoodCategory;sort?:FoodSort;savedFoods?:any[];meals?:any[]}){
 const savedKeys=new Set(savedFoods.map(f=>foodKey(normaliseSavedFood(f)))),words=normaliseFoodQuery(query).trim().toLowerCase().split(/\s+/).filter(Boolean),usage=new Map<string,{count:number;date:string}>();
 for(const row of meals){const meal=row.data||row,name=String(meal.name||'').trim().toLowerCase(),old=usage.get(name);usage.set(name,{count:(old?.count||0)+1,date:(old?.date||'')>(row.date||meal.date||'')?old!.date:row.date||meal.date||''});}
 const results=uniqueFoods(foods).filter(food=>{
  const text=`${food.name} ${food.brand||''} ${food.barcode||''}`.toLowerCase();if(!words.every(word=>text.includes(word)))return false;
  const declared=String(food.category||food.categories||'').toLowerCase(),source=String(food.source||'').toLowerCase(),name=String(food.name).toLowerCase();
  switch(category){
   case 'Favourites':return savedKeys.has(foodKey(food));
   case 'Custom':return !!food.custom||!!food.saved&&(source.includes('manual')||source.includes('custom')||source.includes('my saved'));
   case 'Common':return source.includes('common')||food.brand==='Common food';
   case 'Supplements':return /supplement|protein powder|whey|casein|creatine|multivitamin|pre.workout/.test(text+' '+declared);
   case 'Brands':return !!food.brand&&!['Common food','MyFitnessPal community dataset'].includes(food.brand);
   case 'Restaurant':return /restaurant|tgi fridays|mcdonald|kfc|subway|domino|pizza hut|nando|hungry jack|grill.d|red rooster|guzman|zambrero|sushi hub|cici|burger king|taco bell/.test(text+' '+declared);
   case 'Beverages':return /beverage|drink|juice|coffee|tea\b|milk\b|water\b|smoothie|shake\b|cider|beer|wine|cola|kombucha/.test(name+' '+declared);
   default:return true;
  }
 });
 const stat=(food:any)=>usage.get(String(food.name).trim().toLowerCase())||{count:0,date:''};
 const term=query.trim().toLowerCase(),relevance=(food:any)=>{const name=String(food.name).toLowerCase(),brand=String(food.brand||'').toLowerCase();return (term&&String(food.barcode)===term?10000:0)+(term&&name===term?1000:0)+(term&&name.startsWith(term)?300:0)+words.filter(word=>name.split(/[^a-z0-9]+/).includes(word)).length*30+words.filter(word=>brand.includes(word)).length*5;};
 const relevanceScores=sort==='best'&&words.length?new Map(results.map(food=>[food,relevance(food)])):null;
 return results.sort((a,b)=>sort==='az'?a.name.localeCompare(b.name):sort==='za'?b.name.localeCompare(a.name):sort==='recent'?stat(b).date.localeCompare(stat(a).date)||a.name.localeCompare(b.name):sort==='frequent'?stat(b).count-stat(a).count||a.name.localeCompare(b.name):(relevanceScores?.get(b)||0)-(relevanceScores?.get(a)||0)||a.name.localeCompare(b.name));
}
export function createFoodSelection(food:any,category:string):FoodSelection{const grams=servingGrams(food);return {key:foodKey(food),id:crypto.randomUUID(),food,amount:grams||1,unit:grams?'g':'serving',category};}
export function selectionMeal(selection:FoodSelection,date:string){const {food,amount,unit,category,id}=selection;return prepareMeal({id,date,name:String(food.name).slice(0,120),category,nutrition:{amount,unit,reference:{...food,servingSize:String(food.servingSize||'1 serving').slice(0,60),servingGrams:servingGrams(food)}},notes:`${amount} ${unit} · ${food.source||'Manual entry'}`});}
