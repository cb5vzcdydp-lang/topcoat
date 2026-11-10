'use client';
import React,{useEffect,useRef,useState} from 'react';
import './touch-grass-balance.css';
import {ArrowUpRight,Dumbbell,Leaf} from 'lucide-react';
import {legDayStatus,legSkipBonus} from '@/lib/leg-day';
import type {Workout} from '@/lib/domain';
import {usePreferences} from './appearance';
import {touchGrassStats,type TouchGrassRecord} from '@/lib/touch-grass-balance';

export function TouchGrassBalance({records,gymDates,date,onOpen,onOpenGym,workouts=[]}:{workouts?:Workout[];records:TouchGrassRecord[];gymDates:string[];date:string;onOpen:()=>void;onOpenGym:()=>void}){
 const {preferences}=usePreferences();
 const skips=records.filter(r=>r.kind==='leg-skip'&&!(r as any).deleted),skipDates=Array.from(new Set(skips.map(r=>(r.data as any).date as string)));
 const bonus=legSkipBonus(records,date),legStatus=legDayStatus(workouts,date,skipDates);
 const stats=touchGrassStats(records,date,gymDates),effectiveProgress=legStatus.ultimateGym?0:bonus?stats.grassPoints/(stats.balancePoints+bonus):stats.progress,percent=Math.round(effectiveProgress*100),grassCell=effectiveProgress>.5,targetBlend=effectiveProgress;
 // Start at the saved balance; animate only a subsequent activity change.
 const [blend,setBlend]=useState(targetBlend),renderedBlend=useRef(targetBlend);
 useEffect(()=>{
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0;
  const show=(value:number)=>{renderedBlend.current=value;setBlend(value)};
  const finish=()=>{cancelAnimationFrame(frame);show(targetBlend)};
  const from=renderedBlend.current,start=performance.now(),distance=Math.abs(targetBlend-from),duration=500+distance*450;
  const tick=(now:number)=>{const t=Math.min(1,(now-start)/duration),eased=t*t*(3-2*t);show(from+(targetBlend-from)*eased);if(t<1)frame=requestAnimationFrame(tick)};
  if(preferences.reducedMotion||preference.matches||distance<.0001)finish();else frame=requestAnimationFrame(tick);
  const motionChanged=()=>{if(preferences.reducedMotion||preference.matches)finish()};
  preference.addEventListener?.('change',motionChanged);
  return()=>{cancelAnimationFrame(frame);preference.removeEventListener?.('change',motionChanged)};
 },[targetBlend,preferences.reducedMotion]);
 const level=legStatus.ultimateGym?'Ultimate gym cell':grassCell?'Grass cell':'Gym cell',gymPercent=100-percent;
 // Both original cutouts share one canvas and one baseline. Moving the reveal
 // rather than scaling either person keeps their shoulders, hips and feet aligned.
 const boundary=(1-blend)*100,feather=12*Math.sin(Math.PI*blend);
 const visualStyle={'--grass-blend':blend,'--blend-start':(boundary-feather)+'%','--blend-line':boundary+'%','--blend-end':(boundary+feather)+'%'} as React.CSSProperties;
 const totalPoints=stats.balancePoints+bonus,points=Number.isInteger(totalPoints)?totalPoints.toFixed(0):totalPoints.toFixed(1);
 return <article className="touch-balance-card" aria-label={`Touch Grass balance: ${stats.completed} of ${stats.goal} activities completed`}>
  <div className="touch-balance-copy"><span className="eyebrow">TODAY'S BALANCE</span><div className="home-card-heading"><h2>Touch Grass body</h2><span className={'cell-badge '+(grassCell?'grass-cell':'gym-cell')}>{grassCell?<Leaf size={13}/>:<Dumbbell size={13}/>} {level}</span></div><div className="touch-balance-score"><b>{points}</b><span>balance points<small>{stats.grassActivities} grass × 0.5 · {stats.gymActivities} gym × 1{bonus?` + ${bonus} skip bonus`:""}</small></span></div><div className="cell-balance-track" aria-label={`${gymPercent}% gym and ${percent}% grass`}><i style={{width:percent+'%'}}/></div><div className="cell-balance-labels"><span><Dumbbell size={12}/>{gymPercent}% gym</span><span><Leaf size={12}/>{percent}% grass</span></div><details className="touch-balance-explainer"><summary>How balance works</summary><p className="home-muted">Finished workouts earn 1 Gym point; Grass tasks earn 0.5. Skipping legs earns a 1,000-point game bonus once per day.</p><p className="tiny muted">{legStatus.ultimateGym?"No completed leg working sets logged in the last 7 days. Log leg training to clear Ultimate gym cell.":legStatus.lastLegDate?`Last logged leg training: ${legStatus.lastLegDate}`:"Log leg training to start the seven-day check. Missing history is not proof of skipped training."}</p></details>{legStatus.ultimateGym&&<p className="tiny muted">No leg working sets logged in the last 7 days.</p>}<div className="touch-balance-actions"><button className="home-card-link" onClick={onOpen}>Open checklist <ArrowUpRight size={14}/></button><button className="home-card-link" onClick={onOpenGym}>Open workouts <Dumbbell size={14}/></button></div></div>
  <div className={'touch-balance-visual '+(grassCell?'is-grass':'is-gym')} style={visualStyle}><div className={'cell-identity '+(grassCell?'grass-cell':'gym-cell')}>{grassCell?<Leaf size={15}/>:<Dumbbell size={15}/>}<span><small>YOU ARE A</small><b>{level}</b></span></div><div className="cell-character" role="img" aria-label={`${level}, ${percent}% grass and ${gymPercent}% gym`}><img className="gymcel-character" src="/touch-grass-gymcel-v3.webp" width={700} height={1100} decoding="async" alt=""/><img className="grasscel-character" src="/touch-grass-grasscel-v3.webp" width={700} height={1100} decoding="async" alt=""/></div><div className="touch-balance-percent"><Leaf size={14}/><b>{percent}% grass</b></div></div>
  <div className="touch-balance-week" aria-label="Gym and Touch Grass points over seven days">{stats.days.map(({date:day,count,grass,gym,grassPoints,gymPoints,points:dayPoints})=>{const skipBonus=legSkipBonus(records,day),scoredPoints=dayPoints+skipBonus,height=Math.max(scoredPoints?12:4,Math.min(100,scoredPoints/3*100)),grassShare=scoredPoints?grassPoints/scoredPoints*100:0;return <div key={day} title={`${day}: ${grass} grass (${grassPoints} points), ${gym} gym (${gymPoints} points)${skipBonus?`, ${skipBonus} leg skip bonus`:""}`}><span><i style={{height:height+'%',background:`linear-gradient(to top,#64d98f 0 ${grassShare}%,#fb8e6c ${grassShare}% 100%)`}}/></span><small>{new Date(day+'T12:00Z').toLocaleDateString('en-AU',{weekday:'short',timeZone:'UTC'}).slice(0,2)}</small><b>{count}</b></div>})}</div>
 </article>
}
