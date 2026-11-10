'use client';
import React from 'react';
import {toolPages,toolPageLabels} from '@/lib/app-navigation';
export function UtilityHub({context,onContext,onBack,children}:{context:string;onContext:(page:string)=>void;onBack:()=>void;children?:React.ReactNode}){
 return <section className="utility-hub"><div className="page-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h1>Tools</h1><p>Choose an area. Daily logging stays on its own page.</p></div><button className="btn" onClick={onBack}>Back to {toolPageLabels[context]||context}</button></div><label className="field utility-context"><span>Tools for</span><select aria-label="Tools for" value={context} onChange={event=>onContext(event.target.value)}>{toolPages.map(page=><option key={page} value={page}>{toolPageLabels[page]||page}</option>)}</select></label>{children}</section>;
}
