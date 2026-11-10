import {z} from 'zod';
import {identity,clientAccess,database,json,fail} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{const {uid}=await identity(req),u=new URL(req.url),client=z.string().uuid().parse(u.searchParams.get('client'));await clientAccess(client,uid);const rows=await database().prepare('SELECT id,kind,entry_key,before_data,after_data,created FROM entry_history WHERE client=? ORDER BY created DESC LIMIT 50').bind(client).all<any>();return json({history:rows.results.map(r=>({...r,before:r.before_data?JSON.parse(r.before_data):null,after:JSON.parse(r.after_data),before_data:undefined,after_data:undefined}))})}catch(e){return fail(e)}}
