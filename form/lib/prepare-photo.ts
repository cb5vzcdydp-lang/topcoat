/** Decode using the browser image element for Safari compatibility; re-encode to remove metadata. */
export async function preparePhoto(file:File):Promise<File>{
 if(!file.size||file.size>20*1024*1024)throw new Error('Choose a photo smaller than 20 MB.');
 const url=URL.createObjectURL(file);
 try{
  const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('This photo format could not be opened. Export it as JPEG or PNG, then try again.'));img.src=url;});
  const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Photo processing is unavailable in this browser.');
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Could not prepare this photo.')),'image/jpeg',.88));
  return new File([blob],'profile-photo.jpg',{type:'image/jpeg'});
 }finally{URL.revokeObjectURL(url)}
}
