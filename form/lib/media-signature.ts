import {HttpError} from './errors';
const ascii=(bytes:Uint8Array,start:number,length:number)=>String.fromCharCode(...bytes.slice(start,start+length));
/** Header validation rejects a renamed HTML/SVG/file; it is not a full media decoder. */
export function mediaType(bytes:Uint8Array):string|null{
 if(bytes.length>=12&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
 if(bytes.length>=24&&[137,80,78,71,13,10,26,10].every((value,i)=>bytes[i]===value)&&ascii(bytes,12,4)==='IHDR')return 'image/png';
 if(bytes.length>=20&&ascii(bytes,0,4)==='RIFF'&&ascii(bytes,8,4)==='WEBP')return 'image/webp';
 if(bytes.length>=16&&ascii(bytes,4,4)==='ftyp')return ascii(bytes,8,4).trim()==='qt'?'video/quicktime':'video/mp4';
 if(bytes.length>=12&&[26,69,223,163].every((value,i)=>bytes[i]===value))return 'video/webm';
 return null;
}
export async function checkedMedia(file:unknown,allowed:string[],max:number){if(!(file instanceof File)||!file.size||file.size>max||!allowed.includes(file.type))throw new HttpError(400,'Choose a supported media file within the stated size limit.');const bytes=await file.arrayBuffer(),detected=mediaType(new Uint8Array(bytes));if(!detected||detected!==file.type)throw new HttpError(400,'The file contents do not match its media type. Export a fresh JPEG, PNG, WebP, MP4, MOV or WebM as supported by this upload.');return bytes}
export function checkedImageData(value:string,max=5*1024*1024){const match=/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);if(!match||value.length>max*1.4+100)throw new HttpError(400,'Use a supported image within the upload limit.');let binary:string;try{binary=atob(match[2])}catch{throw new HttpError(400,'Invalid image encoding.')}const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));if(bytes.length>max||mediaType(bytes)!==match[1])throw new HttpError(400,'The image contents do not match its media type.');return value}
