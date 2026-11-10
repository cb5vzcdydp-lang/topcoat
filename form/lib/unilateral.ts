export type SideValues={weight:number;reps:number;completed:boolean;rir?:number|null;failure?:boolean;bandColors?:string[];gymPinAdded?:boolean;gymPinWeight?:number;setType?:'straight'|'drop'|'back-off'|'tempo'|'assisted';tempo?:string;group?:string;targetMin?:number;targetMax?:number;unrecorded?:boolean};
export type PairedSides={right:SideValues;left:SideValues;origin?:'shared'|'separate'|'new'};
export type PairableSet=SideValues&{exerciseId:string;name:string;unilateral?:boolean;side?:'both'|'left'|'right';warmup?:boolean;sides?:PairedSides};
export type Side='right'|'left';
export function sideValues(s:SideValues):SideValues{return {weight:s.weight,reps:s.reps,completed:s.completed,rir:s.rir??null,failure:!!s.failure,bandColors:[...(s.bandColors||[])],gymPinAdded:!!s.gymPinAdded,gymPinWeight:s.gymPinWeight||0,...(s.setType?{setType:s.setType}:{}),...(s.tempo?{tempo:s.tempo}:{}),...(s.group?{group:s.group}:{}),...(s.targetMin!=null?{targetMin:s.targetMin}:{}),...(s.targetMax!=null?{targetMax:s.targetMax}:{}),...(s.unrecorded?{unrecorded:true}:{})}}
export function pairSet<T extends PairableSet>(s:T,origin:PairedSides['origin']='shared'):T{
 const sides=s.sides||{right:sideValues(s),left:sideValues(s),origin};
 const load=(v:SideValues)=>v.weight+(v.gymPinAdded?v.gymPinWeight||0:0),a=sides.right,b=sides.left;
 // Summary uses an actual side's values, never a fabricated min-load/min-rep combination.
 const representative=load(a)<load(b)||load(a)===load(b)&&a.reps<=b.reps?a:b;
 const {unrecorded,...values}=sideValues(representative);
 return {...s,...values,unilateral:true,side:'both',completed:a.completed&&b.completed,sides} as T;
}
export function editSide<T extends PairableSet>(s:T,side:Side,patch:Partial<SideValues>):T{
 const paired=pairSet(s);return pairSet({...paired,sides:{...paired.sides!,[side]:{...paired.sides![side],...patch,unrecorded:false}}});
}
/** Read migration: shared flags become paired rows; explicit side rows pair by ordinal and setup. */
export function normaliseUnilateralSets<T extends PairableSet>(sets:T[]):T[]{
 const result:T[]=[],pending=new Map<string,number[]>();
 for(const set of sets){
  if(set.sides){result.push(set.unilateral?pairSet(set):set);continue}
  if(set.side==='left'||set.side==='right'){
   const side=set.side,other=side==='left'?'right':'left',key=JSON.stringify([set.exerciseId,!!set.warmup,set.group||'',set.setType||'straight',set.tempo||'']);
   const candidates=pending.get(key)||[],index=candidates.find(i=>result[i].sides?.[side].unrecorded);
   if(index!==undefined){const target=result[index],sides={...target.sides!,[side]:sideValues(set)};result[index]=pairSet({...target,sides});}
   else {const source=sideValues(set),missing={...sideValues(set),completed:false,unrecorded:true};result.push(pairSet({...set,sides:{[side]:source,[other]:missing,origin:'separate'} as PairedSides}));candidates.push(result.length-1);pending.set(key,candidates)}
  }else result.push(set.unilateral?pairSet(set):set);
 }
 return result;
}
export function freshSet<T extends PairableSet>(s:T,patch:Partial<T>={}):T{
 const next={...s,...patch,completed:false,rir:null,failure:false};
 if(!s.unilateral&&!s.sides)return next;
 const source=pairSet(s).sides!,reset=(v:SideValues)=>({...sideValues(v),...(patch.weight!==undefined?{weight:patch.weight}:{}),...(patch.reps!==undefined?{reps:patch.reps}:{}),completed:false,rir:null,failure:false,unrecorded:false});
 const result={...next,sides:{right:reset(source.right),left:reset(source.left),origin:'new' as const}};return s.unilateral?pairSet(result):result;
}
