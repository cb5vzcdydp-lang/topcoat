import {putBudgetedMedia} from '@/lib/media-budget';
import {checkedMedia} from '@/lib/media-signature';
import {env} from 'cloudflare:workers';
import {z} from 'zod';
import {database,identity,originCheck,json,fail,HttpError} from '@/lib/server';
export const dynamic='force-dynamic';
const allowed=['image/jpeg','image/png','image/webp'];
const maxPhoto=5*1024*1024;
async function friendship(db:any,uid:string,other:string){return !!await db.prepare("SELECT 1 AS ok FROM friendships WHERE status='accepted' AND ((requester=? AND addressee=?) OR (requester=? AND addressee=?))").bind(uid,other,other,uid).first() as any;}
async function createImage(files:File[],prompt:string){
 if(!env.OPENAI_API_KEY)throw new HttpError(503,'Avatar generation is not configured. Add the OPENAI_API_KEY secret to the app deployment.');
 for(const file of files)await checkedMedia(file,allowed,maxPhoto);
 const form=new FormData();form.set('model',(env as any).OPENAI_IMAGE_MODEL||'gpt-image-1');form.set('prompt',prompt);form.set('size','1024x1024');form.set('n','1');
 for(const file of files)form.append('image[]',file,file.name||'reference.png');
 let response:Response;try{response=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{Authorization:`Bearer ${env.OPENAI_API_KEY}`},body:form,signal:AbortSignal.timeout(180000)});}catch{throw new HttpError(502,'Avatar generation could not connect. Try again shortly.');}
 if(!response.ok){await response.text();throw new HttpError(response.status===429?429:502,response.status===401?'The image service rejected the server API key. Ask the app owner to update it.':response.status===403?'The AI account does not have access to image generation. Ask the app owner to check model permissions.':response.status===429?'The image service has reached its usage or rate limit. The app owner should check billing and limits before trying again.':'Avatar generation is temporarily unavailable. Try again shortly.');}
 const result=await response.json() as any,encoded=result.data?.[0]?.b64_json;if(typeof encoded!=='string'||!encoded)throw new HttpError(502,'The image service returned no avatar. Try another photo.');
 const binary=atob(encoded),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes;
}
function validateFiles(files:FormDataEntryValue[]){if(!files.length||files.length>4)throw new HttpError(400,'Choose 1–4 reference photos.');for(const f of files){if(!(f instanceof File)||!allowed.includes(f.type)||f.size>maxPhoto)throw new HttpError(400,'Choose JPEG, PNG or WebP photos up to 5 MB each.');}if(files.reduce((n,f)=>n+(f as File).size,0)>12*1024*1024)throw new HttpError(413,'The selected photos are too large. Choose a smaller set.');return files as File[];}
export async function POST(req:Request){try{originCheck(req);const {uid}=await identity(req);if(!env.BUCKET)throw new HttpError(503,'Private avatar storage is not configured.');if(Number(req.headers.get('content-length')||0)>13_000_000)throw new HttpError(413,'The upload is too large.');const form=await req.formData(),action=String(form.get('action')||''),db=database(),now=new Date().toISOString();if(['base','variant'].includes(action)&&form.get('consent')!=='true')throw new HttpError(400,'Confirm that these are your photos and that you want them sent to the configured AI image service.');
 if(!await db.prepare('SELECT uid FROM social_profiles WHERE uid=?').bind(uid).first())throw new HttpError(409,'Create your social profile before adding an avatar.');
 if(action==='upload'){
  const files=validateFiles(form.getAll('photos'));if(files.length!==1)throw new HttpError(400,'Choose one profile photo.');
  const file=files[0],bytes=new Uint8Array(await checkedMedia(file,allowed,maxPhoto));
  const valid=file.type==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:file.type==='image/png'?bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71:String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
  if(!valid)throw new HttpError(400,'The file is not a supported photo. Export it as JPEG or PNG.');
  const label=z.string().trim().min(1).max(40).parse(String(form.get('label')||'Profile photo')),id=crypto.randomUUID(),key=`social-avatars/${uid}/${id}`;
  await putBudgetedMedia(env.BUCKET,database(),uid,key,bytes,{httpMetadata:{contentType:file.type}});
  try{await db.batch([db.prepare('INSERT INTO social_avatars(id,uid,label,key,content_type,face_anchor,created) VALUES(?,?,?,?,?,?,?)').bind(id,uid,label,key,file.type,id,now),db.prepare('UPDATE social_profiles SET avatar_id=? WHERE uid=?').bind(id,uid)]);}catch(e){await env.BUCKET.delete(key);throw e;}
  return json({ok:true,id});
 }
 if(action==='base'){
  const files=validateFiles(form.getAll('photos')),label=z.string().trim().min(1).max(40).default('My look').parse(String(form.get('label')||'My look'));
  const bytes=await createImage(files,`Create a polished, friendly 3D illustrated profile avatar based on the supplied photos of the same consenting adult. Preserve their recognizable facial features, skin tone, face shape, hair style and hair colour as faithfully as possible while clearly making a stylized, non-photorealistic avatar. Show head and shoulders, simple neutral background, flattering even light, tasteful modern fitness-app aesthetic. Wear the outfit visible in the clearest reference photo. Do not add text, logos, accessories absent from the reference, or alter age or identity. The result is an approximation, not a biometric identity match.`);
  const id=crypto.randomUUID(),key=`social-avatars/${uid}/${id}.png`;await putBudgetedMedia(env.BUCKET,database(),uid,key,bytes,{httpMetadata:{contentType:'image/png'}});await db.prepare('INSERT INTO social_avatars(id,uid,label,key,content_type,face_anchor,created) VALUES(?,?,?,?,?,?,?)').bind(id,uid,label,key,'image/png',id,now).run();await db.prepare('UPDATE social_profiles SET avatar_id=? WHERE uid=?').bind(id,uid).run();return json({ok:true,id});
 }
 if(action==='variant'){
  const anchorId=z.string().uuid().parse(String(form.get('anchorId')||'')),label=z.string().trim().min(1).max(40).parse(String(form.get('label')||'')),anchor=await db.prepare('SELECT id,key,content_type FROM social_avatars WHERE id=? AND uid=?').bind(anchorId,uid).first<any>();if(!anchor)throw new HttpError(404,'Base avatar not found.');
  const outfitValues=form.getAll('photos');if(outfitValues.length>1)throw new HttpError(400,'Choose one outfit reference photo for each variant.');const outfit=outfitValues.length?validateFiles(outfitValues)[0]:null;const anchorObject=await env.BUCKET.get(anchor.key);if(!anchorObject)throw new HttpError(404,'Base avatar image is unavailable.');const refs=[new File([await anchorObject.arrayBuffer()],'face-anchor',{type:anchor.content_type||'image/png'}),...(outfit?[outfit]:[])];
  const bytes=await createImage(refs,`Create a new 3D illustrated profile avatar outfit variant for the SAME person shown in reference image 1. Image 1 is the approved face and identity anchor: preserve the same recognizable face shape, facial features, skin tone, hair style and hair colour. Do not redesign or replace the face. ${outfit?'Use image 2 only as a guide to the clothing and pose; do not copy its face or identity.':'Choose a different tasteful gym outfit in a fitness-app style.'} Show head and shoulders on a simple neutral background, match image 1's polished 3D illustration style and framing. No text or logos. This is an approximate illustration, not a biometric identity match.`);
  const id=crypto.randomUUID(),key=`social-avatars/${uid}/${id}.png`;await putBudgetedMedia(env.BUCKET,database(),uid,key,bytes,{httpMetadata:{contentType:'image/png'}});await db.prepare('INSERT INTO social_avatars(id,uid,label,key,content_type,face_anchor,created) VALUES(?,?,?,?,?,?,?)').bind(id,uid,label,key,'image/png',anchorId,now).run();await db.prepare('UPDATE social_profiles SET avatar_id=? WHERE uid=?').bind(id,uid).run();return json({ok:true,id});
 }
 if(action==='select'){const id=z.string().uuid().parse(String(form.get('id')||''));if(!await db.prepare('SELECT id FROM social_avatars WHERE id=? AND uid=?').bind(id,uid).first<any>())throw new HttpError(404,'Avatar not found.');await db.prepare('UPDATE social_profiles SET avatar_id=? WHERE uid=?').bind(id,uid).run();return json({ok:true});}
 throw new HttpError(400,'Unknown avatar action.');
}catch(e){return fail(e);}}
export async function GET(req:Request){try{const {uid}=await identity(req),id=new URL(req.url).searchParams.get('id');if(!id)throw new HttpError(400,'Avatar ID required.');const db=database(),avatar=await db.prepare('SELECT uid,key,content_type FROM social_avatars WHERE id=?').bind(id).first<any>();if(!avatar)throw new HttpError(404,'Avatar not found.');if(avatar.uid!==uid&&!await friendship(db,uid,avatar.uid))throw new HttpError(404,'Avatar not found.');const object=await env.BUCKET?.get(avatar.key);if(!object)throw new HttpError(404,'Avatar unavailable.');return new Response(object.body,{headers:{'Content-Type':avatar.content_type||'image/png','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}catch(e){return fail(e);}}
