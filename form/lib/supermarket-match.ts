import {z} from 'zod';
import type {Macros} from './fast-food';
export const supermarkets=['Woolworths','Coles','ALDI','Spudshed','IGA','Other'] as const;
export const supermarketProductSchema=z.object({id:z.string().min(1).max(150),name:z.string().trim().min(1).max(120),retailer:z.enum(supermarkets),packLabel:z.string().trim().min(1).max(100),unit:z.enum(['g','ml','item']),packAmount:z.number().finite().positive().max(100000),referenceAmount:z.number().finite().positive().max(100000),priceCents:z.number().int().min(1).max(1000000),calories:z.number().finite().min(0).max(10000),protein:z.number().finite().min(0).max(1000),carbs:z.number().finite().min(0).max(2000),fat:z.number().finite().min(0).max(1000),portionAmounts:z.array(z.number().finite().positive().max(100000)).min(1).max(8),readyToEat:z.boolean(),basis:z.string().max(120),checkedDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value=>{try{return new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value}catch{return false}},'Use a real calendar date'),sourceUrl:z.union([z.literal(''),z.string().url().refine(url=>url.startsWith('https://'))]),priceSourceUrl:z.union([z.literal(''),z.string().url().refine(url=>url.startsWith('https://'))]),provenance:z.enum(['official','user']),notes:z.string().max(500).default('')}).refine(product=>product.provenance!=='official'||!!product.sourceUrl&&!!product.priceSourceUrl,'Published products need nutrition and price sources');
export type SupermarketProduct=z.infer<typeof supermarketProductSchema>;
export type GroceryPortion={product:SupermarketProduct;amount:number;packs:number;costCents:number;leftover:number;macros:Macros};
export type BudgetMeal={id:string;retailer:string;items:GroceryPortion[];totals:Macros;costCents:number;score:number;withinTargets:boolean};
export function moneyCents(value:number){if(!Number.isFinite(value)||value<0||value>10000)throw new Error('Enter an AUD amount from $0 to $10,000.');return Math.round((value+Number.EPSILON)*100)}
export function groceryPortion(product:SupermarketProduct,amount:number):GroceryPortion{
 if(!Number.isFinite(amount)||amount<=0||amount>product.packAmount*4)throw new Error('Use a portion of up to four edible packs.');
 const packs=Math.max(1,Math.ceil((amount-1e-8)/product.packAmount)),factor=amount/product.referenceAmount;
 return {product,amount,packs,costCents:packs*product.priceCents,leftover:Math.max(0,packs*product.packAmount-amount),macros:{calories:product.calories*factor,protein:product.protein*factor,carbs:product.carbs*factor,fat:product.fat*factor}};
}
export function budgetMeal(items:GroceryPortion[],target:Macros):BudgetMeal{
 if(new Set(items.map(item=>item.product.id)).size!==items.length)throw new Error('Combine quantities of the same product first.');
 if(new Set(items.map(item=>item.product.retailer)).size>1)throw new Error('Choose products from one supermarket per meal.');
 const totals=items.reduce((sum,item)=>({calories:sum.calories+item.macros.calories,protein:sum.protein+item.macros.protein,carbs:sum.carbs+item.macros.carbs,fat:sum.fat+item.macros.fat}),{calories:0,protein:0,carbs:0,fat:0}),costCents=items.reduce((sum,item)=>sum+item.costCents,0),keys=['calories','protein','carbs','fat'] as const;
 const score=keys.reduce((sum,key)=>sum+Math.abs(totals[key]-target[key])/Math.max(target[key],key==='calories'?100:10)*(key==='calories'?2:1),0);
 return {id:items.map(item=>item.product.id+'@'+item.amount).sort().join('+'),retailer:items[0]?.product.retailer||'',items,totals,costCents,score,withinTargets:keys.every(key=>totals[key]<=target[key]+.01)};
}
/** Bounded beam search. Exact macro gaps rank checked combinations; not a claim of global mathematical optimality. */
export function matchSupermarketMeals(products:SupermarketProduct[],{budgetCents,target,retailer='Any',readyOnly=false,maxItems=3}:{budgetCents:number;target:Macros;retailer?:string;readyOnly?:boolean;maxItems?:number}):BudgetMeal[]{
 if(!Number.isInteger(budgetCents)||budgetCents<=0||budgetCents>1000000||!Number.isFinite(target.calories)||target.calories<=0||Object.values(target).some(value=>!Number.isFinite(value)||value<0))return [];
 const parsed=products.map(product=>supermarketProductSchema.safeParse(product)).filter(result=>result.success).map(result=>result.data!),unique=[...new Map(parsed.map(product=>[product.id,product])).values()].filter(product=>(retailer==='Any'||product.retailer===retailer)&&(!readyOnly||product.readyToEat)&&product.priceCents<=budgetCents),results:BudgetMeal[]=[];
 const compare=(a:BudgetMeal,b:BudgetMeal)=>a.score-b.score||a.costCents-b.costCents||a.id.localeCompare(b.id);
 for(const store of new Set(unique.map(product=>product.retailer))){
  const options=unique.filter(product=>product.retailer===store).flatMap(product=>Array.from(new Set(product.portionAmounts)).filter(amount=>amount<=product.packAmount*4).map(amount=>groceryPortion(product,amount))).filter(item=>item.costCents<=budgetCents),singles=options.map(item=>budgetMeal([item],target)).sort(compare),candidates=singles.slice(0,160).flatMap(meal=>meal.items);
  let beam=singles.slice(0,40);results.push(...singles);
  for(let depth=2;depth<=Math.min(4,Math.max(1,Number.isFinite(maxItems)?Math.floor(maxItems):3));depth++){
   const next=new Map<string,BudgetMeal>();for(const meal of beam)for(const item of candidates){if(meal.costCents+item.costCents>budgetCents||meal.items.some(existing=>existing.product.id===item.product.id))continue;const choice=budgetMeal([...meal.items,item],target);if(!next.has(choice.id))next.set(choice.id,choice)}
   beam=[...next.values()].sort(compare).slice(0,40);results.push(...beam);if(!beam.length)break;
  }
 }
 return [...new Map(results.map(meal=>[meal.id,meal])).values()].sort(compare).slice(0,12);
}
export function supermarketDiaryMeal(choice:BudgetMeal,{id,date,category}:{id:string;date:string;category:string}){return {id,date,category,name:(choice.retailer+' · '+choice.items.map(item=>item.product.name).join(' + ')).slice(0,120),...choice.totals,notes:(`AUD $${(choice.costCents/100).toFixed(2)} to buy whole packs. `+choice.items.map(item=>`${item.amount} ${item.product.unit} ${item.product.name}; buy ${item.packs} × ${item.product.packLabel}; price checked ${item.product.checkedDate}`).join(' + ')).slice(0,500),nutrition:{amount:1,unit:'serving',reference:{servingSize:'1 reviewed supermarket meal',...choice.totals,nutrients:{},source:choice.items.some(item=>item.product.provenance==='user')?'Supermarket meal · includes user-entered labels/prices':'Supermarket meal · published label portions; dated price snapshots'}}}}
