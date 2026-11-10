'use client';
import {useEffect,useRef,useState} from 'react';
import {deviceDelete,deviceGet,devicePut} from '@/lib/device-store';
import {foodDraftSchema,hasFoodDraftContent,type FoodDraft} from '@/lib/food-drafts';

export function useFoodDraft(key:string|undefined,value:FoodDraft,active:boolean,onResume:(draft:FoodDraft)=>void){
  const [ready,setReady]=useState(!key),[candidate,setCandidate]=useState<FoodDraft|null>(null),[status,setStatus]=useState('');
  const resume=useRef(onResume);resume.current=onResume;
  useEffect(()=>{if(!key)return;let alive=true;void deviceGet(key).then(record=>{if(!alive)return;const parsed=foodDraftSchema.safeParse(record?.data);if(parsed.success)setCandidate(parsed.data);setReady(true)}).catch(()=>{if(alive){setReady(true);setStatus('Device draft storage is unavailable. Keep this form open until saved.')}});return()=>{alive=false}},[key]);
  useEffect(()=>{
    if(!key||!ready||candidate)return;let alive=true;
    // Small form-only writes use IndexedDB; the account history is never serialized here.
    const operation=active&&hasFoodDraftContent(value)?devicePut(key,value):deviceDelete(key);
    void operation.then(()=>{window.dispatchEvent(new Event('form-food-drafts-change'));if(alive)setStatus(active&&hasFoodDraftContent(value)?'Draft saved on this device':'')}).catch(()=>{if(alive)setStatus('Could not save this draft on your device. Keep the form open until saved.')});
    return()=>{alive=false};
  },[key,ready,candidate,value,active]);
  function restore(){if(candidate){resume.current(candidate);setCandidate(null)}}
  async function discard(){if(key)try{await deviceDelete(key);window.dispatchEvent(new Event('form-food-drafts-change'));setCandidate(null)}catch{setStatus('Could not discard the saved draft. Try again.')}}
  return {ready,candidate,status,restore,discard};
}
