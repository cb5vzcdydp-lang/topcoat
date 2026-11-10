'use client';
import React,{useEffect,useRef} from 'react';
/** Label each mobile cell with its actual column header, including async rows. */
export function ResponsiveTable({children,className=''}:{children:React.ReactNode;className?:string}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=ref.current;if(!el)return;const label=()=>el.querySelectorAll('table').forEach(table=>{const headers=Array.from(table.querySelectorAll('thead th')).map(h=>h.textContent?.trim()||'');table.querySelectorAll('tbody tr').forEach(row=>{let col=0;row.querySelectorAll(':scope > td').forEach(cell=>{(cell as HTMLElement).dataset.label=headers[col]||'';col+=(cell as HTMLTableCellElement).colSpan||1})})});label();const observer=new MutationObserver(label);observer.observe(el,{childList:true,subtree:true,characterData:true});return()=>observer.disconnect()},[]);
 return <div className={'table-wrap responsive-table '+className} ref={ref}>{children}</div>;
}
