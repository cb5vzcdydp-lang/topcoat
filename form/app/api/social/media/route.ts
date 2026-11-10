import {canSeePost} from '@/lib/social-access';
import {env} from 'cloudflare:workers';
import {database,identity,json,fail,HttpError} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{const {uid}=await identity(req),id=new URL(req.url).searchParams.get('id');if(!id)throw new HttpError(400,'Post ID required.');const db=database();const p=await db.prepare('SELECT author,media_key,media_type FROM social_posts WHERE id=? AND kind=\'photo\'').bind(id).first<any>();if(!p||!p.media_key)throw new HttpError(404,'Photo not found.');await canSeePost(db,id,uid);const object=await env.BUCKET?.get(p.media_key);if(!object)throw new HttpError(404,'Photo unavailable.');return new Response(object.body,{headers:{'Content-Type':p.media_type||'image/jpeg','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}catch(e){return fail(e);}}
