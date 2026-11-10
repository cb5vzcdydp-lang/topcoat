function wait(video:HTMLVideoElement,event:string,start:()=>void){
 return new Promise<void>((resolve,reject)=>{
  const cleanup=()=>{clearTimeout(timeout);video.removeEventListener(event,done);video.removeEventListener('error',error)};
  const done=()=>{cleanup();resolve()};const error=()=>{cleanup();reject(new Error('This video could not be decoded. Try MP4 or a shorter clip.'))};
  const timeout=setTimeout(()=>{cleanup();reject(new Error('Video loading timed out. Try a smaller MP4 clip.'))},12000);
  video.addEventListener(event,done,{once:true});video.addEventListener('error',error,{once:true});start();
 });
}
export async function sampleVideoFrames(file:File){
 const url=URL.createObjectURL(file),video=document.createElement('video');video.muted=true;video.playsInline=true;
 try{
  await wait(video,'loadedmetadata',()=>{video.src=url;video.load()});
  if(!Number.isFinite(video.duration)||video.duration<=0||video.duration>180)throw new Error('Choose a video up to 3 minutes long.');
  const canvas=document.createElement('canvas'),scale=Math.min(1,640/Math.max(video.videoWidth,1));canvas.width=Math.max(1,Math.round(video.videoWidth*scale));canvas.height=Math.max(1,Math.round(video.videoHeight*scale));
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Video frames are unavailable in this browser.');
  const frames:string[]=[],count=Math.min(6,Math.max(1,Math.ceil(video.duration/8)));
  for(let i=0;i<count;i++){
   const target=video.duration*(i+1)/(count+1);
   await wait(video,'seeked',()=>{video.currentTime=target});
   ctx.drawImage(video,0,0,canvas.width,canvas.height);frames.push(canvas.toDataURL('image/jpeg',.65));
  }
  return frames;
 }finally{video.removeAttribute('src');video.load();URL.revokeObjectURL(url)}
}
