/** Browser-only, same-origin OCR. No image upload or remote recognition API. */
export async function readHealthScreenshot(file:File,onProgress:(percent:number)=>void){
 const {createWorker}=await import('tesseract.js');
 type Worker=Awaited<ReturnType<typeof createWorker>>;
 let worker:Worker|null=null,timer:ReturnType<typeof setTimeout>|undefined;
 const work=async()=>{worker=await createWorker('eng',1,{workerPath:'/ocr/v6/worker.min.js',corePath:'/ocr/v6',langPath:'/ocr/v6',logger:event=>{if(event.status==='recognizing text')onProgress(Math.round(event.progress*100));}});return (await worker.recognize(await prepare(file))).data.text;};
 try{return await Promise.race([work(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Reading took too long. Retry or enter the values below.')),120000);})]);}
 finally{clearTimeout(timer);await (worker as Worker|null)?.terminate().catch(()=>{});}
}
async function prepare(file:File){
 const image=new Image(),url=URL.createObjectURL(file);
 try{image.src=url;await image.decode();const scale=Math.min(2,2200/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.round(image.naturalWidth*scale);canvas.height=Math.round(image.naturalHeight*scale);const context=canvas.getContext('2d',{willReadFrequently:true});if(!context)throw new Error('Image reading is unavailable.');context.drawImage(image,0,0,canvas.width,canvas.height);const pixels=context.getImageData(0,0,canvas.width,canvas.height);let sum=0;for(let i=0;i<pixels.data.length;i+=4)sum+=pixels.data[i]*.299+pixels.data[i+1]*.587+pixels.data[i+2]*.114;const dark=sum/(pixels.data.length/4)<128;for(let i=0;i<pixels.data.length;i+=4){let grey=pixels.data[i]*.299+pixels.data[i+1]*.587+pixels.data[i+2]*.114;if(dark)grey=255-grey;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=grey;}context.putImageData(pixels,0,0);return canvas;}
 finally{URL.revokeObjectURL(url);}
}
