import {GET as dataGET} from '../data/route';
import {identity,clientAccess,database,json,fail,HttpError} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{
 const {uid}=await identity(req),client=new URL(req.url).searchParams.get('client');
 if(!client)throw new HttpError(400,'Select a profile to export.');
 await clientAccess(client,uid);
 const response=await dataGET(req);if(!response.ok)return response;
 const data=await response.json() as any,db=database();
 const [cardio,recipes,mealPlan,groceries,workspaceRecords,preferences,consistencyMemberships,consistencyProofs,coachingWorkflows]=await Promise.all([
  db.prepare('SELECT * FROM cardio_sessions WHERE client=? ORDER BY date,created').bind(client).all(),
  db.prepare('SELECT * FROM recipes WHERE owner=?').bind(uid).all(),
  db.prepare('SELECT * FROM meal_plan_entries WHERE owner=?').bind(uid).all(),
  db.prepare('SELECT * FROM grocery_items WHERE owner=?').bind(uid).all(),
  db.prepare("SELECT * FROM workspace_records WHERE owner=? AND client=? AND deleted=0 AND kind NOT LIKE 'native-%'").bind(uid,client).all<any>(),
  db.prepare('SELECT data,version FROM user_preferences WHERE owner=?').bind(uid).first<any>(),
  db.prepare('SELECT c.id,c.creator,c.title,c.starts,c.weeks,c.mode,c.team_metric,c.team_target,c.status,c.created,m.status AS member_status,m.metric,m.target,m.reviewer,m.joined FROM consistency_challenges c JOIN consistency_members m ON m.challenge=c.id WHERE m.uid=? AND m.client=?').bind(uid,client).all<any>(),
  db.prepare('SELECT p.* FROM consistency_proofs p JOIN consistency_members m ON m.challenge=p.challenge AND m.uid=p.author WHERE p.author=? AND m.client=?').bind(uid,client).all<any>(),
  db.prepare('SELECT * FROM coach_workflows WHERE client=? ORDER BY created').bind(client).all<any>()
 ]);
 return json({...data,formatVersion:2,consistencyMemberships:consistencyMemberships.results,consistencyProofs:consistencyProofs.results.map((row:any)=>({...row,reviewers:JSON.parse(row.reviewers)})),coachingWorkflows:coachingWorkflows.results.map((row:any)=>({...row,data:JSON.parse(row.data)})),workspaceRecords:workspaceRecords.results.map((r:any)=>({...r,data:JSON.parse(r.data)})),preferences:preferences?JSON.parse(preferences.data):null,exportedAt:new Date().toISOString(),clients:data.clients.filter((c:any)=>c.id===client),cardioSessions:cardio.results,recipes:recipes.results.map((r:any)=>({...r,ingredients:JSON.parse(r.ingredients)})),mealPlan:mealPlan.results,groceries:groceries.results,mediaNotice:'Photos and form videos are listed as metadata. Download the original files separately from their private pages.'});
}catch(e){return fail(e)}}
