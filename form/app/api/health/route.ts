import {aiConfigured,aiProviderInfo} from '@/lib/ai-provider';
import {env} from 'cloudflare:workers';
import {authConfig,authMode} from '@/lib/auth';
import {json} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(){
 let auth=authMode()==='sites',database=false,storage=false;
 try{authConfig();auth=true}catch{}
 try{const rows=await env.DB?.prepare("SELECT name FROM sqlite_master WHERE type='table'").all<{name:string}>();const names=new Set(rows?.results.map(r=>r.name));database=['clients','logs','workouts','saved_meals','saved_foods','health_metrics','exercise_videos','progress_plans','social_profiles','social_avatars','recipes','push_subscriptions','cardio_sessions','progression_targets','coach_notes','workout_templates','user_preferences','workspace_records','workspace_record_history','workout_template_history','entry_history','import_batches','import_items','social_controls','social_post_history','social_reports'].every(n=>names.has(n));if(database){const cols=await env.DB?.prepare('PRAGMA table_info(social_profiles)').all<{name:string}>();database=!!cols?.results.some(c=>c.name==='avatar_id');}}catch{}
 try{if(env.BUCKET){await env.BUCKET.head('__form_readiness_check__');storage=true}}catch{}
 const ready=auth&&database&&storage;
 return json({ready,core:{authentication:auth,database,storage},features:{aiConfigured:aiConfigured(),aiProvider:aiProviderInfo().provider,ouraConfigured:!!(env.OURA_CLIENT_ID&&env.OURA_CLIENT_SECRET&&env.OURA_REDIRECT_URI&&env.OURA_TOKEN_ENCRYPTION_KEY),pushKeyConfigured:!!env.PUSH_PUBLIC_KEY},release:'roadmap-2026-10-19'},ready?200:503);
}
