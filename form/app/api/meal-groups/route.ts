import {identity,originCheck,clientAccess,database,readJsonLimited,json,fail,HttpError,hash} from '@/lib/server';
import {mealGroupsRequest,resolveMealGroups} from '@/lib/meal-groups';
export const dynamic='force-dynamic';

export async function POST(req:Request){
  try {
    originCheck(req);const {uid}=await identity(req),body=mealGroupsRequest.parse(await readJsonLimited(req,15000));
    await clientAccess(body.client,uid);
    const db=database(),key='meal-groups:'+await hash(uid+':'+body.client);
    const old=await db.prepare('SELECT * FROM workspace_records WHERE id=? AND owner=? AND client=?').bind(key,uid,body.client).first<any>();
    if((old?.version||0)!==body.version)throw new HttpError(409,'Meal groups changed on another device. Reopen this editor before saving.');
    const records=await db.prepare("SELECT kind,data FROM workspace_records WHERE owner=? AND client=? AND kind IN ('meal-category','meal-group-settings') AND deleted=0 ORDER BY updated DESC LIMIT 500").bind(uid,body.client).all<any>();
    const categories=await db.prepare("SELECT DISTINCT json_extract(data,'$.category') AS category FROM meals WHERE client=?").bind(body.client).all<any>();
    const existing=resolveMealGroups(records.results.map(r=>({...r,data:JSON.parse(r.data)})),categories.results.map(row=>({data:{category:row.category}})));
    const names=new Map(body.renames.map(r=>[r.from,r.to]));
    if(body.renames.some(r=>!existing.includes(r.from))||existing.some(name=>!body.groups.includes(names.get(name)||name)))throw new HttpError(400,'Keep every existing group, or rename it. Groups with history cannot be silently removed.');
    const now=new Date().toISOString(),version=body.version+1,data=JSON.stringify({groups:body.groups,mutationId:crypto.randomUUID()});
    const write=old?db.prepare('UPDATE workspace_records SET data=?,version=version+1,updated=? WHERE id=? AND owner=? AND version=?').bind(data,now,key,uid,body.version):db.prepare("INSERT INTO workspace_records(id,owner,client,kind,data,version,created,updated,deleted) VALUES(?,?,?,'meal-group-settings',?,1,?,?,0) ON CONFLICT(id) DO NOTHING").bind(key,uid,body.client,data,now,now);
    // Every following statement is gated on this exact successful CAS write. D1 batch is transactional.
    const gate='EXISTS (SELECT 1 FROM workspace_records WHERE id=? AND owner=? AND version=? AND data=?)';
    const gateArgs=[key,uid,version,data];
    const statements=[write,db.prepare('INSERT INTO workspace_record_history(record,owner,version,data,deleted,created) SELECT id,owner,version,data,deleted,updated FROM workspace_records WHERE '+gate+' AND id=? ON CONFLICT(record,version) DO NOTHING').bind(...gateArgs,key)];
    if(body.renames.length){
      const cases=body.renames.map(()=> 'WHEN ? THEN ?').join(' '),renameArgs=body.renames.flatMap(r=>[r.from,r.to]);
      const updated=`json_set(data,'$.category',CASE json_extract(data,'$.category') ${cases} ELSE json_extract(data,'$.category') END,'$.revision',coalesce(json_extract(data,'$.revision'),0)+1)`;
      const where=`client=? AND json_extract(data,'$.category') IN (${body.renames.map(()=>'?').join(',')}) AND ${gate}`;
      const whereArgs=[body.client,...body.renames.map(r=>r.from),...gateArgs];
      statements.push(db.prepare(`INSERT INTO entry_history(id,client,kind,entry_key,before_data,after_data,actor,created) SELECT lower(hex(randomblob(16))),client,'meal',id,data,${updated},?,? FROM meals WHERE ${where}`).bind(...renameArgs,uid,now,...whereArgs));
      statements.push(db.prepare(`UPDATE meals SET data=${updated} WHERE ${where}`).bind(...renameArgs,...whereArgs));
      // Stop legacy custom-group records from reintroducing the original names.
      statements.push(db.prepare(`UPDATE workspace_records SET data=json_set(data,'$.name',CASE json_extract(data,'$.name') ${cases} ELSE json_extract(data,'$.name') END),version=version+1,updated=? WHERE owner=? AND client=? AND kind='meal-category' AND json_extract(data,'$.name') IN (${body.renames.map(()=>'?').join(',')}) AND ${gate}`).bind(...renameArgs,now,uid,body.client,...body.renames.map(r=>r.from),...gateArgs));
    }
    const result=await db.batch(statements);
    if(!result[0].meta.changes)throw new HttpError(409,'Meal groups changed elsewhere. Reopen the editor before saving.');
    return json({ok:true,version,groups:body.groups,renamed:body.renames.length?result[3].meta.changes:0});
  }catch(error){return fail(error)}
}
