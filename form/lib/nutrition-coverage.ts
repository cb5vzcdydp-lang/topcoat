import {nutrientList} from './food-nutrition';
const upperLimitKeys=new Set(['sodium','saturatedFat','cholesterol']);
const vitaminKeys=nutrientList.filter(([,label])=>/^Vitamin|^B\d|^Choline/.test(label)).map(([key])=>key);
const mineralKeys=['calcium','iron','magnesium','phosphorus','potassium','zinc','copper','manganese','selenium','iodine','chromium','molybdenum','chloride'];
const groups:Record<string,string[]>={
 'All targets':nutrientList.filter(([key,,,target])=>target>0&&!upperLimitKeys.has(key)).map(([key])=>key),
 Vitamins:vitaminKeys,Minerals:mineralKeys,Electrolytes:['potassium','magnesium','calcium','chloride'],
 'Immune support':['vitaminA','vitaminC','vitaminD','b6','b12','folate','zinc','selenium','iron','copper'],
 Antioxidants:['vitaminC','vitaminE','selenium','manganese'],
 'Bone health':['calcium','vitaminD','vitaminK','magnesium','phosphorus'],
 'Metabolism support':['b1','b2','b3','b5','b6','biotin','b12','iron','magnesium'],
};
/** Average target coverage of known nutrients only; missing information is never zero intake. */
export function nutritionCoverage(nutrients:Record<string,number>={}){
 const targets=new Map<string,number>(nutrientList.map(([key,,,target])=>[key,target]));
 return Object.entries(groups).map(([label,keys])=>{const values=keys.filter(key=>Number.isFinite(nutrients[key])&&nutrients[key]>=0&&(targets.get(key)||0)>0).map(key=>Math.min(1,nutrients[key]/targets.get(key)!));return {label,known:values.length,total:keys.length,percent:values.length?Math.round(values.reduce((sum,value)=>sum+value,0)/values.length*100):null};});
}
