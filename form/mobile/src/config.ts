export const DEFAULT_ORIGIN='https://form-coaching-training.declanleonard8.chatgpt.site';
export function appOrigin(value=DEFAULT_ORIGIN){const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw new Error('Use a trusted HTTPS Form origin, without a path, query or password.');return url.origin;}
export function isInternal(url:string,origin:string){try{return new URL(url).origin===origin&&new URL(url).protocol==='https:'}catch{return false}}
export function externalUrl(url:string){try{const parsed=new URL(url);return ['https:','mailto:','tel:'].includes(parsed.protocol)&&!parsed.username&&!parsed.password?parsed.href:null}catch{return null}}
export function safeFilename(value:string){return value.replace(/[^a-zA-Z0-9._ -]/g,'_').replace(/^\.+/,'').slice(0,100)||'Form-export.json';}

export function connectionKey(origin:string){return 'form.mobile.connection.v1.'+Array.from(origin).map(c=>c.charCodeAt(0).toString(16).padStart(2,'0')).join('');}
