import {readJsonLimited} from '@/lib/server';
import {z} from 'zod';
import {authMode,authConfig,authRequest,cookie,sessionCookies,verifiedIdentity} from '@/lib/auth';
import {originCheck,json,fail,HttpError} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(){let configured=authMode()==='sites';try{authConfig();configured=true}catch{}return json({mode:authMode(),configured})}
export async function POST(req:Request){try{
  originCheck(req);
  if(Number(req.headers.get('content-length')||0)>10000)throw new HttpError(413,'Request too large.');
  const b=z.object({action:z.enum(['signin','signup','refresh','signout']),email:z.string().email().max(254).optional(),password:z.string().min(8).max(200).optional()}).parse(await readJsonLimited(req,1000000));
  if(authMode()==='sites')throw new HttpError(400,'Use ChatGPT sign-in for this deployment.');
  if(b.action==='signout'){
    const token=cookie(req,'form_access');
    if(token)try{await authRequest('logout',{},token)}catch{}
    return sessionCookies(req,json({ok:true}));
  }
  let response:Response;
  if(b.action==='refresh'){
    const token=cookie(req,'form_refresh');
    if(!token)throw new HttpError(401,'Sign in again.');
    response=await authRequest('token?grant_type=refresh_token',{refresh_token:token});
  }else{
    if(!b.email||!b.password)throw new HttpError(400,'Enter an email and a password of at least 8 characters.');
    response=await authRequest(b.action==='signup'?'signup':'token?grant_type=password',{email:b.email,password:b.password});
  }
  const session=await response.json() as any;
  if(!response.ok)return sessionCookies(req,json({error:b.action==='refresh'?'Sign in again.':b.action==='signup'?'Could not create the account. Check your details or try signing in.':'Email or password was not accepted. Confirm your email and try again.'},b.action==='refresh'?401:400));
  if(!session.access_token)return json({ok:true,confirmationRequired:true});
  // Check the session with the provider before attaching trusted cookies.
  await verifiedIdentity(new Request(req.url,{headers:{Authorization:'Bearer '+session.access_token}}));
  return sessionCookies(req,json({ok:true}),session);
}catch(e){return fail(e)}}
