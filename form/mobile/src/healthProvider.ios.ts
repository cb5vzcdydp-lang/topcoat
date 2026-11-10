import {isHealthDataAvailable,queryCategorySamples,queryQuantitySamples,queryStatisticsForQuantity,requestAuthorization} from '@kingstinct/react-native-healthkit';
import {localDay,sleepHours} from './health-math';
import type {Provider,Reading} from './types';
const types={steps:'HKQuantityTypeIdentifierStepCount',weight:'HKQuantityTypeIdentifierBodyMass',vo2:'HKQuantityTypeIdentifierVO2Max',hrv:'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',rhr:'HKQuantityTypeIdentifierRestingHeartRate',active_calories:'HKQuantityTypeIdentifierActiveEnergyBurned',basal:'HKQuantityTypeIdentifierBasalEnergyBurned'} as const;
const units={weight:'kg',vo2:'ml/(kg*min)',hrv:'ms',rhr:'count/min'} as const;
const provider:Provider={
 async requestPermissions(){if(!isHealthDataAvailable())throw new Error('Apple Health is unavailable on this device. Use manual logging or a physical iPhone with HealthKit enabled.');await requestAuthorization({toRead:[...Object.values(types),'HKCategoryTypeIdentifierSleepAnalysis']});},
 async readRecent(){const end=new Date(),start=new Date(end.getFullYear(),end.getMonth(),end.getDate()-13),out:Reading[]=[];
  for(const metric of ['weight','vo2','hrv','rhr'] as const){const samples=await queryQuantitySamples(types[metric],{limit:1000,ascending:false,unit:units[metric] as any,filter:{date:{startDate:start,endDate:end}}}),seen=new Set<string>();for(const sample of samples){const date=localDay(sample.startDate);if(seen.has(date)||!Number.isFinite(sample.quantity)||sample.quantity<0)continue;seen.add(date);out.push({id:`healthkit:${metric}:${date}`,date,metric,value:sample.quantity,unit:metric==='vo2'?'mL/kg/min':units[metric],source:'Apple Health'});}}
  for(let i=13;i>=0;i--){const day=new Date(end.getFullYear(),end.getMonth(),end.getDate()-i),next=new Date(day.getFullYear(),day.getMonth(),day.getDate()+1),date=localDay(day),options={filter:{date:{startDate:day,endDate:next}}};
   const steps=await queryStatisticsForQuantity(types.steps,['cumulativeSum'],{...options,unit:'count'});if(steps.sumQuantity)out.push({id:`healthkit:steps:${date}`,date,metric:'steps',value:steps.sumQuantity.quantity,unit:'count',source:'Apple Health'});
   const active=await queryStatisticsForQuantity(types.active_calories,['cumulativeSum'],{...options,unit:'kcal'}),basal=await queryStatisticsForQuantity(types.basal,['cumulativeSum'],{...options,unit:'kcal'});if(active.sumQuantity)out.push({id:`healthkit:active:${date}`,date,metric:'active_calories',value:active.sumQuantity.quantity,unit:'kcal',source:'Apple Health'});if(active.sumQuantity&&basal.sumQuantity)out.push({id:`healthkit:total:${date}`,date,metric:'total_calories',value:active.sumQuantity.quantity+basal.sumQuantity.quantity,unit:'kcal',source:'Apple Health'});
  }
  const samples=await queryCategorySamples('HKCategoryTypeIdentifierSleepAnalysis',{limit:5000,filter:{date:{startDate:start,endDate:end}}});for(const row of sleepHours([...samples]))out.push({id:`healthkit:sleep:${row.date}`,metric:'sleep_duration',...row,unit:'hours',source:'Apple Health'});
  return out.filter(row=>Number.isFinite(row.value)&&row.value>=0);
 }
};export default provider;
