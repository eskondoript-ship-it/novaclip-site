import pw from '/opt/node-tools/node_modules/playwright/index.js'; const { chromium } = pw;
const b=await chromium.launch();
console.log('browser args include disable-web-security:', JSON.stringify(b.version?await b.version():'?'));
const p=await (await b.newContext({serviceWorkers:'block'})).newPage();
await p.goto('http://localhost:8731/index.html',{waitUntil:'domcontentloaded'});
const r=await p.evaluate(async()=>{
  try{ const res=await fetch('http://localhost:8799/',{method:'POST',
        headers:{'Content-Type':'application/json','X-NC-Uid':'abc'},body:'{}'});
    return 'ALLOWED status '+res.status; }
  catch(e){ return 'BLOCKED '+String(e).slice(0,60); }
});
console.log('cross-origin POST with a custom header ->', r);
await b.close();
