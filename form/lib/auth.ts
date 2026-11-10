import {nativeIdentity,nativeCookieName} from './native-auth';
import {env} from 'cloudflare:workers';
import {HttpError} from './errors';

export function authMode(){return env.AUTH_MODE==='sites'?'sites':'supabase';}
export function authConfig(){
  const url=env.SUPABASE_URL?.replace(/\/$/,'');
  const key=env.SUPABASE_ANON_KEY;
  if(!url||!key||!url.startsWith('https://'))throw new HttpError(503,'Account sign-in is not configured. The site owner must finish the hosting setup.');
  return {url,key};
}
export function cookie(req:Request,name:string){
  const value=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1);
  try{return value?decodeURIComponent(value):undefined}catch{return undefined}
}
export async function authRequest(path:string,body?:unknown,token?:string){
  const {url,key}=authConfig();
  try{return await fetch(url+'/auth/v1/'+path,{method:body===undefined?'GET':'POST',headers:{apikey:key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(10000)})}
  catch{throw new HttpError(503,'The sign-in service is unavailable. Please try again.');}
}
export async function verifiedIdentity(req:Request){
  const native=cookie(req,nativeCookieName(req));if(native){const user=await nativeIdentity(native),siteUser=req.headers.get('oai-authenticated-user-id');if(siteUser&&siteUser!==user.uid)throw new HttpError(401,'Different accounts are signed in. Disconnect this phone and pair your own account.');return user;}

  if(authMode()==='sites'){
    const uid=req.headers.get('oai-authenticated-user-id');
    if(!uid)throw new HttpError(401,'Sign in to continue.');
    return {uid,email:req.headers.get('oai-authenticated-user-email')||''};
  }
  const token=req.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]||cookie(req,'form_access');
  if(!token)throw new HttpError(401,'Sign in to continue.');
  const r=await authRequest('user',undefined,token);
  if(!r.ok)throw new HttpError(r.status>=500?503:401,'Your session has expired. Sign in again.');
  const user=await r.json() as any;
  if(!user.id||!user.email_confirmed_at)throw new HttpError(401,'Confirm your email before signing in.');
  return {uid:String(user.id),email:String(user.email||'')};
}
export function sessionCookies(req:Request,response:Response,session?:any){
  const secure=new URL(req.url).protocol==='https:'?'; Secure':'';
  for(const [name,value] of [['form_access',session?.access_token],['form_refresh',session?.refresh_token]]){
    response.headers.append('Set-Cookie',`${name}=${encodeURIComponent(value||'')}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${value?2592000:0}${secure}`);
  }
  return response;
}
