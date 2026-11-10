import {env} from 'cloudflare:workers';
import {HttpError} from './errors';
export const NATIVE_SESSION_SECONDS=12*60*60;
export const nativeHash=async(value:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),n=>n.toString(16).padStart(2,'0')).join('');
export const nativeSecret=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');
export async function nativeRecord(db:any,id:string,owner:string,client:string,kind:string,data:any){const now=new Date().toISOString();await db.prepare('INSERT INTO workspace_records(id,owner,client,kind,data,version,created,updated,deleted) VALUES(?,?,?,?,?,1,?,?,0)').bind(id,owner,client,kind,JSON.stringify(data),now,now).run();}
export async function pairedDevice(db:any,bearer:string,app=false){
 if(!/^[a-f0-9]{64}$/.test(bearer))throw new HttpError(401,'Reconnect your iPhone in Form Connections.');
 const row=await db.prepare("SELECT d.*,g.data AS grant_data FROM mobile_devices d JOIN clients c ON c.id=d.client LEFT JOIN workspace_records g ON g.id='native-access:'||d.id AND g.owner=d.uid AND g.client=d.client AND g.kind='native-device-access' AND g.deleted=0 WHERE d.token_hash=? AND d.revoked_at IS NULL AND d.expires_at>? AND (c.member=d.uid OR (c.owner=d.uid AND c.personal=1))").bind(await nativeHash(bearer),new Date().toISOString()).first();
 if(!row)throw new HttpError(401,'Your phone connection expired or was revoked. Pair again.');
 if(app&&(!row.grant_data||JSON.parse(row.grant_data).scope!=='app'))throw new HttpError(403,'This code allowed health sync only. Create a Form iOS app code in Connections to open your account.');
 return row;
}
export async function nativeIdentity(secret:string){
 if(!/^[a-f0-9]{64}$/.test(secret)||!env.DB)throw new HttpError(401,'Reconnect the Form iOS app.');
 const row=await env.DB.prepare("SELECT d.uid,g.data FROM workspace_records s JOIN mobile_devices d ON d.id=json_extract(s.data,'$.device') JOIN workspace_records g ON g.id='native-access:'||d.id AND g.owner=d.uid AND g.client=d.client AND g.kind='native-device-access' AND g.deleted=0 JOIN clients c ON c.id=d.client WHERE s.id=? AND s.kind='native-session' AND s.owner=d.uid AND s.client=d.client AND s.deleted=0 AND json_extract(s.data,'$.expires')>? AND d.revoked_at IS NULL AND d.expires_at>? AND (c.member=d.uid OR (c.owner=d.uid AND c.personal=1))").bind('native-session:'+await nativeHash(secret),new Date().toISOString(),new Date().toISOString()).first<any>();
 if(!row||JSON.parse(row.data).scope!=='app')throw new HttpError(401,'Your iPhone session expired. Reopen or reconnect Form.');
 return {uid:row.uid,email:JSON.parse(row.data).email||'',native:true};
}
export function nativeCookieName(req:Request){return new URL(req.url).protocol==='https:'?'__Host-form_native':'form_native_dev';}
export function nativeCookie(req:Request,response:Response,value=''){response.headers.append('Set-Cookie',`${nativeCookieName(req)}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${value?NATIVE_SESSION_SECONDS:0}${new URL(req.url).protocol==='https:'?'; Secure':''}`);return response;}
