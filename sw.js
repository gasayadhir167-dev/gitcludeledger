/* 离线优先：装好之后断网照常记账。改了文件记得把 C 的版本号加一。 */
const C='ledger-v13';
const FILES=['index.html','./','manifest.webmanifest','apple-touch-icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET') return;
  if(new URL(r.url).origin!==location.origin) return;
  /* iOS Safari 对 navigate 请求较敏感：命中缓存就用，否则回网络，失败再兜首页 */
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r)
    .then(res=>{ if(res.ok&&r.mode==='navigate') caches.open(C).then(c=>c.put(r,res.clone())); return res; })
    .catch(()=>caches.match('index.html'))));
});
