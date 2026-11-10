import {env} from 'cloudflare:workers';
import {HttpError} from './server';
export function aiConfigured(){return !!(env.GEMINI_API_KEY||env.OPENAI_API_KEY)}
export function aiProviderInfo(){return {configured:aiConfigured(),provider:env.GEMINI_API_KEY?'Gemini':env.OPENAI_API_KEY?'OpenAI':null,model:env.GEMINI_API_KEY?(env.GEMINI_MODEL||'gemini-3.8-flash'):(env.OPENAI_MODEL||'gpt-4.1-mini'),imageGeneration:!!env.OPENAI_API_KEY};}
/** Food estimation uses the lighter free-tier-capable model; explicit model settings win. */
export function foodEstimateModel(){return env.GEMINI_API_KEY?(env.GEMINI_MODEL||'gemini-3.1-flash-lite'):(env.OPENAI_MODEL||'gpt-4.1-mini');}
/** One server-only adapter for text and vision. Never switch to a billed provider on failure. */
export async function completeAI({messages,json=false,maxTokens=1800,temperature=.3,timeoutMs=45000,model}:{messages:any[];model?:string;json?:boolean;maxTokens?:number;temperature?:number;timeoutMs?:number}){
 const gemini=!!env.GEMINI_API_KEY,key=gemini?env.GEMINI_API_KEY:env.OPENAI_API_KEY;
 if(!key)throw new HttpError(503,'AI is unavailable. You can still log and edit everything manually.');
 const info=aiProviderInfo();let response:Response;
 try{response=await fetch(gemini?'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions':'https://api.openai.com/v1/chat/completions',{method:'POST',signal:AbortSignal.timeout(timeoutMs),headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:model||info.model,messages,max_tokens:maxTokens,temperature,...(gemini?{reasoning_effort:'low'}:{}),...(json?{response_format:{type:'json_object'}}:{})})});}catch(error){throw new HttpError(502,error instanceof Error && ['TimeoutError','AbortError'].includes(error.name)?'The AI took too long to respond. Your entries are unchanged; please try again.':'AI could not connect. Your entries have not changed; please retry.');}
 if(!response.ok){await response.text();const status=response.status;throw new HttpError(status===429?429:502,status===429?'AI request limit reached. Try again later; your entries are unchanged.':status===401||status===403?'The app’s AI connection needs attention from the app owner. You can still log food manually.':status===503?'The AI provider is busy right now. Please retry in a moment; your entries are unchanged.':status===404?'The configured AI model is unavailable. The app owner needs to update the AI configuration.':'AI is temporarily unavailable. Please retry or enter the details manually.');}
 const payload=await response.json() as any,choice=payload.choices?.[0],text=String(choice?.message?.content||'').trim();
 if(choice?.finish_reason==='length')throw new HttpError(502,'The AI response was incomplete. Try a shorter request.');
 if(!text)throw new HttpError(502,'AI returned no answer. Try a clearer image or question.');return text;
}
