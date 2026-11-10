export type EnergyInputs={calories:number;protein:number;carbs:number;fat:number;activeCalories?:number|null;totalCalories?:number|null;observedMaintenance?:number|null;profileMaintenance?:number|null;weightKg?:number|null;bodyFatPercent?:number|null};
const valid=(value:number|null|undefined)=>typeof value==='number'&&Number.isFinite(value)&&value>0?value:null;
/** Transparent daily energy model. TEE and TDEE describe the same total. */
export function calculateEnergyExpenditure(input:EnergyInputs){
 const active=Math.round(valid(input.activeCalories)||0),macroEnergy=Math.max(0,input.protein*4+input.carbs*4+input.fat*9);
 const tef=Math.round(macroEnergy>0?input.protein*4*.25+input.carbs*4*.075+input.fat*9*.025:Math.max(0,input.calories)*.1);
 const weight=valid(input.weightKg),bodyFat=valid(input.bodyFatPercent),bmr=weight&&bodyFat&&bodyFat<75?Math.round(370+21.6*weight*(1-bodyFat/100)):null;
 const device=valid(input.totalCalories),observed=valid(input.observedMaintenance),profile=valid(input.profileMaintenance);
 let tdee=0,source:'device'|'observed'|'profile'|'formula'|'unavailable'='unavailable';
 if(device){tdee=Math.round(device);source='device'}else if(observed){tdee=Math.round(observed);source='observed'}else if(profile){tdee=Math.round(profile);source='profile'}else if(bmr){tdee=Math.round(bmr+active+tef);source='formula'}
 const remaining=Math.max(0,tdee-active-tef-(bmr||0));
 return {tdee,tee:tdee,activeCalories:active,tef,bmr,dailyMovement:bmr?remaining:Math.max(0,tdee-active-tef),source};
}
export function adaptiveCalorieTarget(baseTarget:number,model:ReturnType<typeof calculateEnergyExpenditure>,baselineMaintenance?:number|null){const baseline=valid(baselineMaintenance);if(model.source!=='device'||!baseline||baseTarget<=0)return Math.round(Math.max(0,baseTarget));const adjustment=Math.max(-750,Math.min(750,model.tdee-baseline));return Math.round(Math.max(0,baseTarget+adjustment))}
