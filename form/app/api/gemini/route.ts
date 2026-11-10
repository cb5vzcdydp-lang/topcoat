import {readJsonLimited} from '@/lib/server';
import {completeAI} from '@/lib/ai-provider';
import {env} from 'cloudflare:workers';
import {z} from 'zod';
import {identity,originCheck,json,fail,HttpError} from '@/lib/server';
export const dynamic='force-dynamic';
const bodySchema=z.object({prompt:z.string().trim().min(1).max(8000)});
export async function POST(req:Request){try{originCheck(req);await identity(req);if(!env.GEMINI_API_KEY)throw new HttpError(503,'Gemini is not configured. Add GEMINI_API_KEY as a private deployment secret.');const {prompt}=bodySchema.parse(await readJsonLimited(req,1000000));const answer=await completeAI({messages:[{role:'user',content:prompt}],maxTokens:1800});return json({answer});}catch(e){return fail(e)}}
