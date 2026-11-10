// Runs only inside our allowlisted Form origin. No bearer token is injected.
export const WEB_BRIDGE=`(function(){
 if(window.__formNativeBridge)return true;window.__formNativeBridge=true;
 function send(value){window.ReactNativeWebView.postMessage(JSON.stringify(value))}
 function theme(){var s=getComputedStyle(document.body);send({type:'theme',background:s.getPropertyValue('--bg').trim(),text:s.getPropertyValue('--text').trim(),accent:s.getPropertyValue('--green').trim(),muted:s.getPropertyValue('--muted').trim()})}
 if(document.body){theme();new MutationObserver(theme).observe(document.body,{attributes:true,attributeFilter:['style','class']})}
 var click=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){var a=this;if(a.download&&a.href.indexOf('blob:')===0){fetch(a.href).then(function(r){return r.blob()}).then(function(blob){if(blob.size>5*1024*1024)throw Error('This export is larger than 5 MB. Export it using Form in Safari.');var reader=new FileReader();reader.onloadend=function(){send({type:'download',name:a.download,mime:blob.type,data:String(reader.result).split(',')[1]})};reader.readAsDataURL(blob)}).catch(function(e){send({type:'download-error',message:e.message})});return;}return click.call(this)};
 return true;
})();true;`;
