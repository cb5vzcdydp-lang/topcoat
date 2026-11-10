'use client';
import React from 'react';
import {Activity,Heart,Scale,Utensils,Moon} from 'lucide-react';
const groups=[
 {name:'Body measurements',description:'Your measurements for this date.',Icon:Scale,fields:[['weight','Weight','kg',500],['waist','Waist','cm',300],['bodyFat','Body fat estimate','%',75]]},
 {name:'Nutrition & hydration',description:'Daily totals. Leave fields blank when you have not tracked them.',Icon:Utensils,fields:[['calories','Calories','kcal',15000],['protein','Protein','g',1000],['carbs','Carbs','g',3000],['fat','Fat','g',1000],['water','Water','L',20]]},
 {name:'Movement',description:'Your steps and cardio for the day.',Icon:Activity,fields:[['steps','Steps','steps',100000],['cardio','Incline cardio','min',1440]]},
 {name:'Sleep',description:'Total time asleep, in hours.',Icon:Moon,fields:[['sleep','Sleep','hours',24]]},
 {name:'Recovery & wellbeing',description:'Choose a score from 1 (low) to 5 (high). Leave blank if untracked.',Icon:Heart,fields:[['energy','Energy','/ 5',5],['hunger','Hunger','/ 5',5],['stress','Stress','/ 5',5],['soreness','Soreness','/ 5',5]]}
] as const;
export function TrackingEditor({value,onChange}:{value:any;onChange:(v:any)=>void}){
 return <div className="tracking-editor">{groups.map(({name,description,Icon,fields},index)=><section className="tracking-card" key={name}><header><span className={'tracking-icon tracking-tone-'+index}><Icon size={20}/></span><div><h3>{name}</h3><p>{description}</p></div></header>{fields.map(([key,label,unit,max])=>{const score=max===5,accessible=score?`${label} (1–5)`:`${label} (${unit})`;return <label className="tracking-value-row" key={key}><span><b>{label}</b><small>{score?'Daily check-in':key==='bodyFat'?'Estimate':key==='weight'?'Body weight':unit==='kcal'?'Total energy':'Daily measurement'}</small></span><span className="tracking-value-control"><input aria-label={accessible} inputMode={score||key==='steps'?'numeric':'decimal'} type="number" min={score?1:0} max={max} step={score||key==='steps'?1:'any'} value={value[key]??''} placeholder="—" onChange={e=>onChange({...value,[key]:e.target.value===''?null:Number(e.target.value)})}/><span>{unit}</span></span></label>})}<footer>{fields.filter(([key])=>value[key]!=null).length} of {fields.length} recorded</footer></section>)}</div>
}
