import rawCatalogue from './au-food-catalogue.json';
import {prepareMeal} from './food-nutrition';
import {normaliseFoodQuery} from './food-search-tools';
export type Macros={calories:number;protein:number;carbs:number;fat:number};
export type MenuFood=Macros&{id:string;name:string;brand:string;servingSize:string;servingGrams:number|null;nutrients:Record<string,number>;source:string;sourceUrl:string;retrieved:string;type:string;category:string;mealRole?:string;verification?:string;deal?:MenuDeal};
const catalogue=rawCatalogue as MenuFood[];
export const fastFoodCatalogue=catalogue.filter(food=>food.type==='menu');
export const foodCatalogue=catalogue;
export const fastFoodBrands=Array.from(new Set(fastFoodCatalogue.map(food=>food.brand))).sort();
export const catalogueCoverage=[
 {brand:"Hungry Jack's",status:'Published nutrition PDF entries',url:'https://www.hungryjacks.com.au/nutrition-info'},
 {brand:"McDonald's",status:'Published AU item nutrition, with 54 configured McSmart Meal/Saver combinations; other bundles may lack data',url:'https://www.mcdonalds.com/au/en-au/menu.html'},
 {brand:'Zambrero',status:'101 readable main-meal variants; ambiguous/add-on tables excluded',url:'https://www.zambrero.com.au/allergens'},
 {brand:'Spudshed',status:'3 verified Waterford products; full catalogue import blocked by source access',url:'https://waterford.spudshed.com.au/'},
 {brand:'KFC',status:'5 older imported AU estimates; opt in to community estimates. Current official macros unavailable',url:'https://www.kfc.com.au/nutrition-allergen'},
 {brand:'Oporto',status:'2 older imported AU estimates; opt in to community estimates. Current official macros unavailable',url:'https://www.oporto.com.au/nutrition-and-allergens/'},
 {brand:'Subway',status:'171 published portions and components · May 2026 guide',url:'https://www.subway.com/en-au/menunutrition/nutrition'},
 {brand:'Guzman y Gomez',status:'293 published portions · October 2026 guide',url:'https://www.guzmanygomez.com.au/nutrition/'},
 {brand:"Domino's",status:'242 published crust/size portions; pizza values are per listed portion, not a whole pizza',url:'https://www.dominos.com.au/menu/nutritional-information/'},
 {brand:"Nando's",status:'17 published menu items; one inconsistent source table excluded',url:'https://www.nandos.com.au/menu-item'},
 {brand:"Grill'd",status:'Menu found; no complete readable macro tables retrieved',url:'https://grilld.com.au/nutrition'},
 {brand:'Red Rooster',status:'Menu found; no complete readable macro tables retrieved',url:'https://www.redrooster.com.au/nutritions/'},
 {brand:'Mad Mex',status:'Published calculator components and explicit default-base recipes with filling/salsa choices; inconsistent ingredient excluded',url:'https://www.madmex.com.au/nutritioncalculator/'},
 {brand:'Soul Origin',status:'277 complete published size portions · September 2026; one inconsistent row excluded',url:'https://www.soulorigin.com.au/collections'},
 {brand:"Betty's Burgers",status:'80 published portions · September 2026; inconsistent source rows excluded',url:'https://www.bettysburgers.com.au/nutritional-and-allergens'},
 {brand:"Roll'd",status:'73 published portions · September 2026; cup/bowl sizes separate; ambiguous salad fat columns excluded',url:'https://rolld.com.au/pages/nutritional-dietary-allergen-information'},
 {brand:'Sushi Hub',status:'93 distinct published item/platter panels; reference weight unspecified',url:'https://www.sushihub.com.au/our-products/'},
 {brand:'Taco Bell',status:'AU FAQ states nutrition data is not available; US/NZ values are not substituted',url:'https://tacobell.com.au/faq/'},
 {brand:'Pizza Hut',status:'Official AU nutrition page retrieved without a complete readable macro table',url:'https://www.pizzahut.com.au/nutrition-information'},
 {brand:'Chicken Treat',status:'Official AU allergen guide found; no complete nutrition table retrieved',url:'https://www.chickentreat.com.au/nutrition-and-allergen/'},
 {brand:'Schnitz',status:'Official AU menu retrieved; no complete numeric macro tables available in retrieved page',url:'https://schnitz.com.au/our-menu/'},
 {brand:'TGI Fridays',status:'AU menu found; no full macro table published on the retrieved menu',url:'https://www.tgifridays.com.au/menu/food/'}
];
export function remainingMacros(targets:Macros,consumed:Macros):Macros{return Object.fromEntries(Object.keys(targets).filter(k=>['calories','protein','carbs','fat'].includes(k)).map(key=>[key,Math.max(0,targets[key as keyof Macros]-consumed[key as keyof Macros])])) as Macros;}
export type FastFoodChoice={id:string;items:typeof catalogue;totals:Macros;fits:boolean;score:number};
export function menuPortion(food:typeof catalogue[number],quantity:number){
 if(!Number.isFinite(quantity)||quantity<=0||quantity>20)throw new Error('Choose between 0 and 20 portions.');
 if(quantity===1)return food;
 return {...food,id:food.id+'@'+quantity,name:`${quantity} × ${food.name}`.slice(0,120),servingSize:`${quantity} × ${food.servingSize}`.slice(0,60),servingGrams:food.servingGrams==null?null:food.servingGrams*quantity,calories:food.calories*quantity,protein:food.protein*quantity,carbs:food.carbs*quantity,fat:food.fat*quantity,nutrients:Object.fromEntries(Object.entries(food.nutrients).filter(([,value])=>typeof value==='number').map(([key,value])=>[key,(value as number)*quantity]))} as typeof food;
}
export function fastFoodChoice(items:typeof catalogue,remaining:Macros):FastFoodChoice{
 const totals=items.reduce((a,f)=>({calories:a.calories+f.calories,protein:a.protein+f.protein,carbs:a.carbs+f.carbs,fat:a.fat+f.fat}),{calories:0,protein:0,carbs:0,fat:0});
 const keys=['calories','protein','carbs','fat'] as const,fits=keys.every(k=>totals[k]<=remaining[k]+.01);
 const score=keys.reduce((s,k)=>s+Math.abs((totals[k]-remaining[k])/Math.max(remaining[k],k==='calories'?100:10))*(k==='calories'?2:1),0);
 return {id:items.map(f=>f.id).join('+'),items,totals,fits,score};
}
export function browseFastFood(brand='All',query='',includeCommunity=false){
 const tokens=normaliseFoodQuery(query).toLocaleLowerCase('en-AU').trim().split(/\s+/).filter(Boolean);
 return fastFoodCatalogue.filter(food=>(includeCommunity||food.verification!=='community')&&(brand==='All'||food.brand===brand)&&tokens.every(token=>`${food.brand} ${food.name} ${food.servingSize}`.toLocaleLowerCase('en-AU').includes(token))).sort((a,b)=>a.brand.localeCompare(b.brand)||a.name.localeCompare(b.name)||a.id.localeCompare(b.id));
}
export function recommendFastFood(remaining:Macros,brand='All',strict=false,includeCommunity=false):FastFoodChoice[]{
 if(remaining.calories<=0)return [];
 const foods=browseFastFood(brand,'',includeCommunity);
 const mains=foods.filter(food=>food.calories>0&&food.calories<=1800&&(food.mealRole==='main'||food.mealRole==='combo'||/burger|whopper|wrap|burrito|bowl|muffin|nuggets|taco|quesadilla|big mac|quarter pounder|mcchicken|mcspicy|mccrispy|mcfeast|mcplant|royale/i.test(food.name))&&!(food.mealRole&&food.mealRole!=='main'&&food.mealRole!=='combo')&&!/family|bundle|feast|party|vegan patty|add on/i.test(food.name));
 const sides=foods.filter(food=>food.calories>0&&food.calories<500&&(food.mealRole==='side'||/^(chips|fries|hash brown)|small fries|garden salad/i.test(food.name))&&!/family|bundle|box|pack|meal/i.test(food.name));
 const options=mains.flatMap(food=>{
  const amounts=food.calories<=400&&(/Pizza ·/.test(food.name)||['Sushi Hub',"Roll'd"].includes(food.brand))?[1,2,3,4]:[1];
  return amounts.flatMap(amount=>{const main=menuPortion(food,amount);return main.calories<150||main.calories>1800?[]:main.mealRole==='combo'?[[main]]:[[main],...sides.filter(side=>side.brand===main.brand).map(side=>[main,side])];});
 });
 return options.map(items=>fastFoodChoice(items,remaining)).filter(c=>!strict||c.fits).sort((a,b)=>a.score-b.score||a.id.localeCompare(b.id)).slice(0,12);
}
export function fastFoodDiaryMeal(choice:FastFoodChoice,{id,date,category}:{id:string;date:string;category:string}){
 const nutrients:Record<string,number>={};for(const key of Object.keys(choice.items[0].nutrients)){if(choice.items.every(f=>key in f.nutrients))nutrients[key]=choice.items.reduce((n,f)=>n+(f.nutrients as Record<string,number>)[key],0);}
 return prepareMeal({id,date,category,name:choice.items.map(f=>`${f.brand} ${f.name}`).join(' + ').slice(0,120),...choice.totals,notes:((choice.items.some(food=>food.verification==='community')?'Older community estimate, not verified current menu nutrition · ':'Menu nutrition · ')+choice.items.map(f=>`${f.name}: ${f.servingSize}${'deal' in f&&f.deal?' ['+f.source+']':''}`).join(' + ')+'. Check portions and allergens with the restaurant.').slice(0,500),nutrition:{amount:1,unit:'serving',reference:{servingSize:choice.items.length===1?choice.items[0].servingSize:'1 suggested meal',...choice.totals,nutrients,source:choice.items.some(food=>food.verification==='community')?'Older community AU estimate · user import':`Official Australian menu nutrition · retrieved ${choice.items.map(f=>f.retrieved).sort().at(-1)}`}}});
}

export type MenuDeal={key:string;title:string;selection:{main:string;extra:string;drink:string};contents:string[]};
export const mealDeals=fastFoodCatalogue.filter(food=>'deal' in food&&!!food.deal) as (MenuFood&{deal:MenuDeal})[];
export function selectedMealDeal(key:string,selection:MenuDeal['selection']){return mealDeals.find(food=>food.deal.key===key&&(['main','extra','drink'] as const).every(slot=>food.deal.selection[slot]===selection[slot]));}
