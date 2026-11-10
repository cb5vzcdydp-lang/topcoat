const documentTokens=new Map<string,string>();
const validToken=(value:string|null)=>!!value&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

/** Reuse this tab's identity on refresh without sharing it with a live duplicate tab. */
export async function workoutTabIdentity(client:string,uid:string,signal:AbortSignal){
 const key='form-workout-tab:'+encodeURIComponent(uid)+':'+client;
 const navigation=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined;
 let token=documentTokens.get(key)||crypto.randomUUID();
 // A new tab must not inherit a frozen tab's identity, even if it cannot answer a probe.
 if(!documentTokens.has(key)&&navigation?.type==='reload')try{const stored=sessionStorage.getItem(key);if(validToken(stored))token=stored!;}catch{}
 const instance=crypto.randomUUID();let channel:BroadcastChannel|undefined,occupied=false,ready=false;
 const dispose=()=>channel?.close();
 try{if(typeof BroadcastChannel==='function')channel=new BroadcastChannel(key)}catch{}
 if(channel){
  channel.onmessage=event=>{
   const data=event.data;if(!data||data.instance===instance||data.token!==token)return;
   if(data.kind==='probe'&&(ready||instance<data.instance))channel?.postMessage({kind:'occupied',token,instance,to:data.instance});
   if(data.kind==='occupied'&&data.to===instance)occupied=true;
  };
  await new Promise<void>((resolve,reject)=>{
   const finish=()=>{signal.removeEventListener('abort',abort);resolve()};
   const timeout=setTimeout(finish,120);
   const abort=()=>{clearTimeout(timeout);dispose();reject(new DOMException('Cancelled','AbortError'))};
   if(signal.aborted){abort();return;}signal.addEventListener('abort',abort,{once:true});
   channel!.postMessage({kind:'probe',token,instance});
  });
  if(occupied)token=crypto.randomUUID();
 }
 if(signal.aborted){dispose();throw new DOMException('Cancelled','AbortError');}
 ready=true;documentTokens.set(key,token);try{sessionStorage.setItem(key,token)}catch{}
 return {token,dispose};
}
