'use client';

import {MacroTargets} from './macro-targets';
import React, { useMemo, useState } from 'react';
import { ArrowRight, Calculator, Save } from 'lucide-react';
import { estimateCaloriesAndMacros } from '@/lib/calorie-estimate';

function addDays(iso: string, count: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + count);
  return d.toISOString().slice(0, 10);
}

export function CalorieMacroCalculator({
  clientName,
  initialTargets,
  startWeight,
  maintenance,
  today,
  goalDate,
  readOnly,
  onApply,
}: {
  clientName: string;
  initialTargets?: {calories:number;protein:number;carbs:number;fat:number};
  startWeight: number;
  maintenance: number;
  today: string;
  goalDate?: string;
  readOnly: boolean;
  onApply: (values: { calories: number; protein: number; fat: number; carbs: number }) => void;
}) {
  const initialDeadline = goalDate && goalDate > today ? goalDate : addDays(today, 84);
  const [weight, setWeight] = useState(String(startWeight || ''));
  const [loss, setLoss] = useState('5');
  const [maint, setMaint] = useState(String(maintenance || ''));
  const [deadline, setDeadline] = useState(initialDeadline);
  const [macroMode,setMacroMode]=useState<'ratios'|'fixed'|'keto'>('fixed');
  const [energy,setEnergy]=useState(1800),[fixed,setFixed]=useState({protein:160,carbs:200,fat:40}),[ratios,setRatios]=useState({protein:30,carbs:40,fat:30});
  const estimate = useMemo(() => {
    const days = Math.round((Date.parse(`${deadline}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / 86400000);
    return estimateCaloriesAndMacros({ weightKg: Number(weight), weightToLoseKg: Number(loss), maintenanceKcal: Number(maint), days });
  }, [weight, loss, maint, deadline, today]);
  const chosen=useMemo(()=>{if(macroMode==='fixed')return {...fixed,calories:Math.round(fixed.protein*4+fixed.carbs*4+fixed.fat*9)};const r=macroMode==='keto'?{protein:25,carbs:5,fat:70}:ratios,total=(macroMode==='keto'?100:r.protein+r.carbs+r.fat)||1;return {calories:energy,protein:Math.round(energy*(r.protein/total)/4),carbs:Math.round(energy*(r.carbs/total)/4),fat:Math.round(energy*(r.fat/total)/9)}} ,[macroMode,fixed,ratios,energy]);

  const [targetValues,setTargetValues]=useState(initialTargets||{calories:1800,protein:160,carbs:200,fat:40});
  return <section className="panel calorie-estimator">
    <MacroTargets value={targetValues} onChange={setTargetValues}/><button className="btn primary" disabled={readOnly} onClick={()=>onApply(targetValues)}>Save macro targets</button>
    <div className="panel-head"><div><span className="eyebrow">PLANNING TOOL</span><h2>Calorie &amp; macro estimate</h2><p>Build a daily target from the goal, timeline and maintenance estimate for {clientName}.</p></div><Calculator size={20}/></div>
    <div className="form-grid">
      <label className="field"><span>Current body weight (kg)</span><input type="number" min="25" max="400" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)}/></label>
      <label className="field"><span>Weight to lose (kg)</span><input type="number" min="0.1" step="0.1" value={loss} onChange={e=>setLoss(e.target.value)}/></label>
      <label className="field"><span>Estimated maintenance (kcal/day)</span><input type="number" min="1" max="15000" step="25" value={maint} onChange={e=>setMaint(e.target.value)}/></label>
      <label className="field"><span>Target date</span><input type="date" min={today} value={deadline} onChange={e=>setDeadline(e.target.value)}/></label>
    </div>
    {estimate ? <>
      <div className={'notice '+(estimate.feasible?'':'estimate-warning')} role="status"><b>{estimate.feasible?'This timeline looks achievable as a planning estimate.':estimate.calories<=0?'This timeline is unachievable with the stated maintenance and deadline.':estimate.carbs<0?'These macro targets do not fit the calorie target.':'This deadline is unachievable at a gradual pace.'}</b><p>{estimate.reason}</p></div>
      <div className="forecast-summary macro-estimate-summary">
        <div><span>Daily calories</span><b>{estimate.calories.toLocaleString()} kcal</b></div>
        <div><span>Protein · 0.6 g/lb</span><b>{estimate.protein} g</b></div>
        <div><span>Fat · 0.3 g/lb</span><b>{estimate.fat} g</b></div>
        <div><span>Carbs · remaining calories</span><b>{estimate.carbs} g</b></div>
      </div>
      <p className="tiny muted">Required deficit: about {estimate.dailyDeficit.toLocaleString()} kcal/day · Planned pace: {estimate.weeklyLossKg.toFixed(2)} kg/week. Protein and fat are calculated from current weight in pounds; carbohydrate fills the remaining calories using 4 kcal/g for protein and carbs and 9 kcal/g for fat. This is a rough estimate, not a promise.</p>
      {estimate.weeklyLossKg>Math.min(0.9,Number(weight)*0.01)&&<p className="tiny muted">Suggested review date at the calculator’s gradual planning pace: {addDays(today, estimate.estimatedDaysAtRecommendedPace)}.</p>}
      <div className="row wrap"><button className="btn" disabled={!estimate.feasible} onClick={()=>{setTargetValues({calories:estimate.calories,protein:estimate.protein,carbs:estimate.carbs,fat:estimate.fat})}}>Use planning estimate</button></div>
      {readOnly&&<p className="tiny muted" style={{marginTop:10}}>This sample workspace is read-only; sign in to save targets.</p>}
    </> : <div className="notice">Enter a current weight, a smaller amount of weight to lose, a maintenance estimate and a future target date.</div>}
  </section>;
}
