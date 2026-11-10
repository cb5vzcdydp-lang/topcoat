const CACHE='form-assets-v3';
const SHELL=['/offline.html','/offline-recovery.js','/favicon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL))));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting()});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('form-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('push',event=>{let data={title:'Form update',body:'Open Form to review your training and check-in.',url:'/'};try{data={...data,...event.data?.json()}}catch{}event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'/favicon.svg',badge:'/favicon.svg',data:{url:data.url||'/'},tag:data.tag||'form-reminder'}))});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{const target=new URL(event.notification.data?.url||'/',self.location.origin);const url=target.origin===self.location.origin?target.href:self.location.origin+'/' ;for(const c of list){if('focus'in c){c.navigate(url);return c.focus()}}return self.clients.openWindow(url)}))});
self.addEventListener('fetch',event=>{
 const r=event.request,url=new URL(r.url);
 // Session, API, media and document requests always go to the server. Never
 // persist health records or serve a cached account response to another user.
 if(r.method==='GET'&&url.origin===self.location.origin&&r.mode==='navigate'){event.respondWith(fetch(r).catch(()=>caches.open(CACHE).then(cache=>cache.match('/offline.html'))));return;}
 if(r.method!=='GET'||url.origin!==self.location.origin||r.mode==='navigate'||url.pathname.startsWith('/api/')||!['script','style','font','image'].includes(r.destination))return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
   const cached=await cache.match(r);if(cached)return cached;
   const response=await fetch(r);
   if(response.ok&&!/no-store|private/i.test(response.headers.get('cache-control')||''))await cache.put(r,response.clone());
   return response;
 }));
});
