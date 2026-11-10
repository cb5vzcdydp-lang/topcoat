'use client';
import React from 'react';
import {importPresets} from '@/lib/import-presets';

export function ImportPresetGuide({kind,source,value,onChange,disabled=false}:{kind:'workouts'|'nutrition';source:string;value:string;onChange:(id:string)=>void;disabled?:boolean}) {
  const provider=source==='Heavy'?'Hevy':source;
  const presets=importPresets.filter(p=>p.kind===kind&&(p.provider===provider||source.startsWith('Other')));
  const preset=presets.find(p=>p.id===value);
  return <div className="notice">
    <label className="field"><span>Export layout</span><select aria-label="Export layout" value={preset?.id||''} disabled={disabled} onChange={event=>onChange(event.target.value)}><option value="">Automatic CSV / JSON detection</option>{presets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    {preset?<><p className="tiny">Required columns: {preset.required.map(field=>preset.headers[field]).join(', ')}. Dates: YYYY-MM-DD. {preset.kind==='workouts'?'Loads: kilograms.':''} Values must describe the logged quantity.</p><p className="tiny muted">This specific layout is tested. Other export versions can use automatic detection or manual column mapping below. The example file contains sample data; do not import it as your history.</p><button type="button" className="btn" disabled={disabled} onClick={()=>{const url=URL.createObjectURL(new Blob([preset.sample],{type:'text/csv'})),link=document.createElement('a');link.href=url;link.download=preset.id+'-example.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}}>Download example layout</button></>:<p className="tiny muted">Choose a tested layout for explicit column and unit checks, or leave automatic detection on. Every import still requires preview and confirmation.</p>}
  </div>;
}
