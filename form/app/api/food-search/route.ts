import {normaliseFoodQuery} from '@/lib/food-search-tools';
import {commonFoodRows as basics} from '@/lib/common-foods';
import {lookupNutrients,servingGrams} from '@/lib/food-nutrition';
import {identity,json,fail,HttpError} from '@/lib/server';
import retailerRows from '@/lib/retailer-foods.json';
import auFoods from '@/lib/au-food-catalogue.json';
import mfpFoods from '@/lib/mfp-foods-top50k.json';
export const dynamic='force-dynamic';
const searchCache=new Map<string,{at:number;foods:any[]}>();
let remoteSearchTimes:number[]=[];


function basicMatches(q:string){
 q=normaliseFoodQuery(q);
 const words=q.toLowerCase().split(/\s+/).filter(Boolean);
 const common=basics.filter(([name])=>words.every(w=>name.toLowerCase().includes(w))).map(([name,calories,protein,carbs,fat])=>({name,brand:'Common food',barcode:'',servingSize:'100 g',servingGrams:100,calories,protein,carbs,fat,nutrients:{},image:'',source:'Built-in common foods'}));
 const retailer=retailerRows.filter(row=>words.every(w=>(row[0]+' '+row[1]+' '+row[2]).toLowerCase().includes(w))).map(row=>({name:String(row[0]),brand:String(row[1]),barcode:String(row[2]),servingSize:'100 g',servingGrams:100,calories:Number(row[3]),protein:Number(row[4]),carbs:Number(row[5]),fat:Number(row[6]),nutrients:{},image:'',source:'Open Food Facts (saved catalogue)'}));
 const mfp=mfpFoods.filter(row=>words.every(w=>String(row.name).toLowerCase().includes(w))).slice(0,25).map((row:any)=>({name:String(row.name).slice(0,160),brand:'MyFitnessPal community dataset',barcode:'',servingSize:String(row.name).slice(0,160),servingGrams:null,calories:Number(row.cal)||0,protein:Number(row.protein)||0,carbs:Number(row.carbs)||0,fat:Number(row.fat)||0,nutrients:{},image:'',source:'MyFitnessPal Top 50k import'}));const published=auFoods.filter(food=>words.every(w=>(food.name+' '+food.brand).toLowerCase().includes(w))).map(food=>({...food,barcode:'',image:''}));const sources=[published,common,retailer,mfp];return Array.from({length:Math.max(...sources.map(rows=>rows.length))},(_,index)=>sources.map(rows=>rows[index])).flat().filter(Boolean);
}
function foodFromProduct(p:any){
 const n=p?.nutriments||{},known=(value:any)=>value!==null&&value!==undefined&&!(typeof value==='string'&&!value.trim())&&Number.isFinite(Number(value))&&Number(value)>=0,complete=(suffix:string)=>['proteins','carbohydrates','fat'].every(key=>known(n[key+suffix]))&&(known(n['energy-kcal'+suffix])||known(n['energy'+suffix])),useServing=complete('_serving'),suffix=useServing?'_serving':'_100g';if(!complete(suffix))return null;
 const get=(key:string)=>{const v=Number(n[key+suffix]);return Number.isFinite(v)?Math.max(0,v):0};
 const raw=known(n['energy-kcal'+suffix])?n['energy-kcal'+suffix]:Number(n['energy'+suffix])/4.184,calories=Number(raw);
 return {name:String(p.product_name_en||p.product_name||'').slice(0,120),brand:String(p.brands||'').slice(0,120),barcode:String(p.code||'').replace(/\D/g,'').slice(0,14),servingSize:String(useServing?(p.serving_size||'1 serving'):'100 g').slice(0,60),servingGrams:useServing?servingGrams({servingSize:p.serving_size}):100,calories:Number.isFinite(calories)?Math.max(0,calories):0,protein:get('proteins'),carbs:get('carbohydrates'),fat:get('fat'),image:String(p.image_front_small_url||p.image_front_url||'').slice(0,500),source:'Open Food Facts',nutrients:lookupNutrients(n,suffix)};
}
export async function GET(req:Request){
 try{
  await identity(req);const params=new URL(req.url).searchParams,q=(params.get('q')||'').trim(),scope=params.get('scope')||'all';if(!['local','remote','all'].includes(scope))throw new HttpError(400,'Unknown search scope.');
  if(q.length<2||q.length>80)throw new HttpError(400,'Enter at least 2 characters to search.');
  const local=scope==='remote'?[]:basicMatches(q);if(scope==='local')return json({foods:local.slice(0,25),source:'Stored food catalogues'});const url=new URL('https://world.openfoodfacts.org/cgi/search.pl');
  for(const [key,value] of Object.entries({search_terms:q,search_simple:'1',action:'process',json:'1',page_size:'25',fields:'code,product_name,product_name_en,brands,serving_size,nutriments,image_front_small_url,image_front_url'}))url.searchParams.set(key,value);
  let products:any[]=[];let remoteAvailable=true;const now=Date.now(),cached=searchCache.get(q.toLowerCase());remoteSearchTimes=remoteSearchTimes.filter(time=>now-time<60000);
  if(cached&&now-cached.at<600000)products=cached.foods;
  else if(remoteSearchTimes.length>=8)remoteAvailable=false;
  else {remoteSearchTimes.push(now);const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),6000);
   try{const response=await fetch(url,{headers:{'User-Agent':'FormCoaching/1.0 (food search)'},signal:controller.signal});if(response.ok){const body=await response.json() as any;products=(Array.isArray(body.products)?body.products:[]).map(foodFromProduct).filter((f:any)=>f&&f.name&&f.calories>=0);if(searchCache.size>=50)searchCache.delete(searchCache.keys().next().value!);searchCache.set(q.toLowerCase(),{at:now,foods:products})}else remoteAvailable=false}catch{remoteAvailable=false}finally{clearTimeout(timeout)}
  }
  const combined=Array.from({length:Math.max(local.length,products.length)},(_,index)=>[local[index],products[index]]).flat().filter(Boolean);
  const seen=new Set<string>(),foods=combined.filter((f:any)=>{const key=(f.barcode||f.name).toLowerCase();if(seen.has(key))return false;seen.add(key);return true}).slice(0,25);
  return json({foods,remoteAvailable,source:remoteAvailable?'Published Australian menus, built-in foods and Open Food Facts':'Published Australian menus and built-in foods'});
 }catch(e){return fail(e)}
}
