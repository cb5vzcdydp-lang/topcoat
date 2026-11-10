'use client';
import {useEffect,useRef,useState,type SetStateAction} from 'react';
import {readViewState,writeViewState} from '@/lib/view-state';
export function useViewState<T>(key:string|undefined,fallback:T):[T,(value:SetStateAction<T>)=>void]{
 const [record,setRecord]=useState(()=>({key,value:readViewState(key,fallback)}));
 const value=record.key===key?record.value:readViewState(key,fallback);
 useEffect(()=>{if(record.key!==key)setRecord({key,value:readViewState(key,fallback)});else writeViewState(key,record.value)},[key,record]);
 return [value,next=>setRecord(current=>{const previous=current.key===key?current.value:readViewState(key,fallback),value=typeof next==='function'?(next as (v:T)=>T)(previous):next;writeViewState(key,value);return {key,value}})];
}
export function useAppNavigation(key:string,allowed:string[],onBack:()=>void){
 const [tab,rawSetTab]=useState('Home'),[depth,setDepth]=useState(0),position=useRef<Record<string,number>>({}),current=useRef(tab),allow=useRef(allowed),back=useRef(onBack);allow.current=allowed;back.current=onBack;
 const navigate=(next:string)=>{
  if(!allow.current.includes(next)||next===current.current)return;
  position.current[current.current]=window.scrollY;current.current=next;rawSetTab(next);setDepth(value=>value+1);
  const previous=history.state?.formNavigation;
  history.pushState({...history.state,formNavigation:{key,tab:next,depth:(previous?.key===key?previous.depth||0:0)+1}},'',location.href);
 };
 useEffect(()=>{
  position.current={};const existing=history.state?.formNavigation;
  if(existing?.key===key&&allow.current.includes(existing.tab)){current.current=existing.tab;rawSetTab(existing.tab);setDepth(existing.depth||0);}else {current.current='Home';rawSetTab('Home');setDepth(0);history.replaceState({...history.state,formNavigation:{key,tab:'Home',depth:0}},'',location.href);}
  const pop=(event:PopStateEvent)=>{const value=event.state?.formNavigation;if(value?.key!==key)return;position.current[current.current]=window.scrollY;current.current=allow.current.includes(value.tab)?value.tab:'Home';rawSetTab(current.current);setDepth(value.depth||0);back.current();};
  window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop);
 },[key]);
 useEffect(()=>{const frame=requestAnimationFrame(()=>window.scrollTo({top:position.current[tab]||0,behavior:'auto'}));return()=>cancelAnimationFrame(frame)},[tab]);
 return {tab,setTab:navigate,back:()=>depth>0?history.back():navigate('Home'),canGoBack:depth>0};
}
