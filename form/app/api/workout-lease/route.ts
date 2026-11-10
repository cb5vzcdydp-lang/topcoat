import {z} from 'zod';
import {identity,clientAccess,database,originCheck,readJsonLimited,json,fail} from '@/lib/server';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 try{
  originCheck(req);const {uid}=await identity(req),b=z.object({action:z.enum(['acquire','renew','release','takeover']),client:z.string().uuid(),token:z.string().uuid(),session:z.string().min(1).max(100),version:z.number().int().positive().optional()}).parse(await readJsonLimited(req,4000));
  await clientAccess(b.client,uid);const db=database(),now=Date.now(),expires=now+60000;
  const current=()=>db.prepare('SELECT * FROM workout_leases WHERE client=?').bind(b.client).first<any>();
  const conflict=async(error:string)=>{const row=await current();return json({error,version:row?.version||0,expires:row?.expires||0,sameTab:!!row&&row.owner===uid&&row.token===b.token},409)};
  if(b.action==='release'){
   // A delayed release must not clear a newer document or workout.
   await db.prepare('UPDATE workout_leases SET expires=0,version=version+1 WHERE client=? AND owner=? AND token=? AND session=? AND (? IS NULL OR version=?)').bind(b.client,uid,b.token,b.session,b.version??null,b.version??null).run();
   return json({ok:true});
  }
  const old=await current();
  if(old&&old.owner===uid&&old.token===b.token&&(b.action!=='renew'||old.session===b.session&&old.expires>0)){
   // Resume after suspended timers only if nobody else has acquired ownership.
   const bump=b.action==='renew'?0:1;
   const result=await db.prepare('UPDATE workout_leases SET session=?,expires=?,version=version+? WHERE client=? AND owner=? AND token=? AND version=? AND session=?').bind(b.session,expires,bump,b.client,uid,b.token,old.version,old.session).run();
   if(!result.meta.changes)return conflict('Workout access changed while reconnecting. Retry the access check.');
   return json({ok:true,version:old.version+bump,expires});
  }
  if(b.action==='renew')return conflict('This tab no longer owns the active workout.');
  if(old&&old.expires>now&&b.action!=='takeover')return conflict('Another tab or device is currently editing a workout for this profile.');
  if(b.action==='takeover'&&old?.version!==b.version)return conflict('Workout access changed again. Retry the access check.');
  const result=old?await db.prepare('UPDATE workout_leases SET owner=?,token=?,session=?,expires=?,version=version+1 WHERE client=? AND version=? AND (expires<=? OR ?=1)').bind(uid,b.token,b.session,expires,b.client,old.version,now,b.action==='takeover'?1:0).run():await db.prepare('INSERT INTO workout_leases(client,owner,token,session,expires,version) VALUES(?,?,?,?,?,1) ON CONFLICT(client) DO NOTHING').bind(b.client,uid,b.token,b.session,expires).run();
  if(!result.meta.changes)return conflict('Another session arrived while reconnecting. Retry the access check.');
  return json({ok:true,version:(old?.version||0)+1,expires});
 }catch(error){return fail(error)}
}
