import {env} from 'cloudflare:workers';
import {verifiedIdentity} from './auth';
import {HttpError} from './errors';
export {HttpError} from './errors';
import {canRead,canCoach} from './domain';
export function database(){if(!env.DB)throw new Error('Database is not configured.');return env.DB;}
export const identity=verifiedIdentity;
export function originCheck(req:Request){const o=req.headers.get('origin');if(!o||o!==new URL(req.url).origin)throw new HttpError(403,'Request origin not allowed.');}
export async function clientAccess(id:string,uid:string,coach=false){const c=await database().prepare('SELECT * FROM clients WHERE id=?').bind(id).first<any>();if(!c||!(coach?canCoach(c,uid):canRead(c,uid)))throw new HttpError(404,'Client not found or access unavailable.');return c;}
export async function hash(s:string){const h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(h),b=>b.toString(16).padStart(2,'0')).join('');}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
export function fail(e:any){if(e instanceof SyntaxError)return json({error:'The request could not be read. Check the entered data.'},400);if(e.name==='ZodError')return json({error:e.issues?.[0]?.message||'Invalid input'},400);return json({error:e instanceof HttpError?e.message:'Could not complete this request. Please try again.'},e instanceof HttpError?e.status:500);}
export function record(client:string,actor:string,action:string,data:unknown){return database().prepare('INSERT INTO audit(id,client,actor,action,data,created) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),client,actor,action,JSON.stringify(data),new Date().toISOString());}

export async function readJsonLimited(req:Request,max=1000000){const reader=req.body?.getReader();if(!reader)throw new HttpError(400,'Request body required.');let size=0,text='',decoder=new TextDecoder();try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw new HttpError(413,'Request too large.')}text+=decoder.decode(value,{stream:true})}text+=decoder.decode();return JSON.parse(text)}finally{reader.releaseLock()}}
