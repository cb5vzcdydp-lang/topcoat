import {env} from 'cloudflare:workers';
import {database,hash,HttpError} from './server';
import {managedFeatures} from './site-feature-names';
export {managedFeatures} from './site-feature-names';
export async function isSiteOwner(uid:string){return !!await database().prepare('SELECT uid FROM site_owner WHERE id=1 AND uid=?').bind(uid).first();}
export async function ownerSetupEligible(email:string){const configured=(env as any).FORM_OWNER_SETUP_EMAIL;return !!(configured&&(env as any).FORM_OWNER_SETUP_TOKEN&&Date.parse((env as any).FORM_OWNER_SETUP_EXPIRES||'')>Date.now()&&email&&email.trim().toLowerCase()===configured.trim().toLowerCase()&&!await database().prepare('SELECT uid FROM site_owner WHERE id=1').first());}
export async function claimSiteOwner(uid:string,email:string,token:string){if(!await ownerSetupEligible(email)||await hash(token)!==await hash(String((env as any).FORM_OWNER_SETUP_TOKEN||'')))throw new HttpError(403,'Owner activation is unavailable for this signed-in account or code.');await database().prepare('INSERT INTO site_owner(id,uid,claimed) VALUES(1,?,?) ON CONFLICT(id) DO NOTHING').bind(uid,new Date().toISOString()).run();if(!await isSiteOwner(uid))throw new HttpError(409,'Owner access is already bound to another account.');}
export function featureDecisions(rows:any[],uid:string){return Object.fromEntries(managedFeatures.map(name=>{const row=rows.find(row=>row.name===name);return [name,!row||row.mode==='on'||row.mode==='test'&&JSON.parse(row.testers).includes(uid)];}));}
