let refreshing:Promise<boolean>|null=null;
export async function refreshSession(){
  if(!refreshing)refreshing=globalThis.fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'refresh'})}).then(r=>r.ok).catch(()=>false).finally(()=>{refreshing=null});
  return refreshing;
}
export async function authFetch(input:RequestInfo|URL,init?:RequestInit){
  const req=new Request(input instanceof Request?input:new URL(String(input),location.href),init),retry=req.clone();
  const response=await globalThis.fetch(req);
  if(response.status===401&&new URL(req.url).origin===location.origin&&new URL(req.url).pathname.startsWith('/api/')&&new URL(req.url).pathname!=='/api/auth'&&await refreshSession())return globalThis.fetch(retry as unknown as RequestInfo);
  if(response.status===401&&(globalThis as any).ReactNativeWebView)(globalThis as any).ReactNativeWebView.postMessage(JSON.stringify({type:"session-expired"}));
  return response;
}
