export function preferredHealthReading<T extends {date:string;metric:string;source:string;created?:string;value:number}>(readings:T[],date:string,metric:string,records:any[]=[]){
 const priority=String(records.find(row=>row.kind==='health-source'&&row.data.name===metric)?.data.priority||'').split(',').map(value=>value.trim()).filter(Boolean);
 const rank=(source:string)=>{const index=priority.indexOf(source);return index<0?Number.MAX_SAFE_INTEGER:index};
 return readings.filter(row=>row.date===date&&row.metric===metric&&Number.isFinite(row.value)).sort((a,b)=>rank(a.source)-rank(b.source)||(b.created||'').localeCompare(a.created||''))[0];
}
export function prioritizedHealthReadings<T extends {date:string;metric:string;source:string;created?:string;value:number}>(readings:T[],records:any[]=[]){
 const groups=new Map<string,T[]>();for(const row of readings){const key=row.date+':'+row.metric,group=groups.get(key)||[];group.push(row);groups.set(key,group)}
 return [...groups.values()].flatMap(group=>{const chosen=preferredHealthReading(group,group[0].date,group[0].metric,records);return chosen?[chosen]:[]});
}
/** Derived display rows only. Raw diary and device readings are never rewritten. */
export function logsWithSourcePriority<T extends {id:string;client:string;date:string;data:any;updated:string}>(logs:T[],readings:any[],records:any[]=[]):T[]{
 const fields:Record<string,string>={weight:'weight',steps:'steps',sleep_duration:'sleep'};
 const configured=Object.keys(fields).filter(metric=>records.some(row=>row.kind==='health-source'&&row.data.name===metric&&row.data.priority));
 if(!configured.length)return logs;
 const byDate=new Map(logs.map(log=>[log.date,log]));
 for(const date of new Set([...logs.map(log=>log.date),...readings.map(row=>row.date)])){
  const original=byDate.get(date);let values=original?.data;
  for(const metric of configured){
   const field=fields[metric],manual=typeof original?.data[field]==='number'?[{date,metric,source:'Manual log',value:original.data[field],created:original.updated}]:[];
   const chosen=preferredHealthReading([...readings.filter(row=>metric!=='weight'||row.value>0),...manual],date,metric,records);
   if(chosen)values={...(values||{notes:'',checkin:false,reviewed:false}),[field]:chosen.value};
  }
  if(values&&values!==original?.data)byDate.set(date,{...(original||{id:'preferred:'+date,client:readings[0]?.client||'',date,updated:''}),data:values} as T);
 }
 return [...byDate.values()].sort((a,b)=>a.date.localeCompare(b.date));
}
