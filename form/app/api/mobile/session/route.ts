import {z} from 'zod';
import {database,readJsonLimited,originCheck,json,fail,HttpError} from '@/lib/server';
import {cookie} from '@/lib/auth';
import {nativeHash,nativeSecret,nativeRecord,pairedDevice,nativeCookie,nativeCookieName,NATIVE_SESSION_SECONDS} from '@/lib/native-auth';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{
 const db=database(),now=new Date().toISOString(),bearer=req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
 if(bearer){
  const device=await pairedDevice(db,bearer,true),live=await db.prepare("SELECT COUNT(*) AS n FROM workspace_records WHERE owner=? AND client=? AND kind='native-ticket' AND deleted=0 AND json_extract(data,'$.device')=? AND json_extract(data,'$.expires')>?").bind(device.uid,device.client,device.id,now).first<any>();
  if(live.n>=10)throw new HttpError(429,'Too many reconnect attempts. Wait one minute and retry.');
  await db.prepare("DELETE FROM workspace_records WHERE id IN (SELECT id FROM workspace_records WHERE owner=? AND client=? AND kind IN ('native-ticket','native-session') AND json_extract(data,'$.expires')<=? LIMIT 100)").bind(device.uid,device.client,now).run();
  const ticket=nativeSecret(),expiresAt=new Date(Date.now()+60000).toISOString();await nativeRecord(db,'native-ticket:'+await nativeHash(ticket),device.uid,device.client,'native-ticket',{device:device.id,expires:expiresAt});return json({ticket,expiresAt});
 }
 const {ticket}=z.object({ticket:z.string().regex(/^[a-f0-9]{64}$/)}).parse(await readJsonLimited(req,4096)),id='native-ticket:'+await nativeHash(ticket),row=await db.prepare("SELECT owner,client,data FROM workspace_records WHERE id=? AND kind='native-ticket' AND deleted=0 AND json_extract(data,'$.expires')>?").bind(id,now).first<any>();
 if(!row)throw new HttpError(401,'This connection ticket expired or was used. Retry in the iOS app.');
 const device=await db.prepare('SELECT id,uid,client,expires_at,revoked_at FROM mobile_devices WHERE id=? AND uid=? AND client=?').bind(JSON.parse(row.data).device,row.owner,row.client).first<any>();
 if(!device||device.revoked_at||device.expires_at<=now)throw new HttpError(401,'Phone connection was revoked.');
 const consumed=await db.prepare("DELETE FROM workspace_records WHERE id=? AND kind='native-ticket' AND json_extract(data,'$.expires')>?").bind(id,now).run();if(!consumed.meta.changes)throw new HttpError(401,'Connection ticket already used.');
 const secret=nativeSecret(),sessionId='native-session:'+await nativeHash(secret),expires=new Date(Math.min(Date.now()+NATIVE_SESSION_SECONDS*1000,Date.parse(device.expires_at))).toISOString();await nativeRecord(db,sessionId,device.uid,device.client,'native-session',{device:device.id,expires});
 await db.prepare("DELETE FROM workspace_records WHERE id IN (SELECT id FROM workspace_records WHERE owner=? AND client=? AND kind='native-session' AND json_extract(data,'$.device')=? AND id<>? ORDER BY created DESC,id DESC LIMIT 100 OFFSET 4)").bind(device.uid,device.client,device.id,sessionId).run();
 return nativeCookie(req,new Response(null,{status:303,headers:{Location:'/', 'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}}),secret);
 }catch(e){return fail(e)}}
export async function DELETE(req:Request){try{originCheck(req);const secret=cookie(req,nativeCookieName(req));if(secret)await database().prepare("DELETE FROM workspace_records WHERE id=? AND kind='native-session'").bind('native-session:'+await nativeHash(secret)).run();return nativeCookie(req,json({ok:true}));}catch(e){return fail(e)}}
