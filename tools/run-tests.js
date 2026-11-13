// Runs tests.html in headless Chromium. Usage: node tools/run-tests.js (serve the repo on :8765 first)
// Loads Playwright from the usual places; set PW_CHROMIUM to a Chromium binary if needed.
let pw;try{pw=require('playwright');}catch(e){pw=require('/opt/node-tools/node_modules/playwright');}
const launch=()=>pw.chromium.launch(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:require('fs').existsSync('/opt/pw-browsers/chromium')?{executablePath:'/opt/pw-browsers/chromium'}:{});
const BASE=process.env.LH_BASE||'http://127.0.0.1:8765/';
(async()=>{const b=await launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(BASE+'tests.html');await p.waitForFunction(()=>window.__TEST_RESULTS,null,{timeout:200000});
const r=await p.evaluate(()=>window.__TEST_RESULTS);r.filter(t=>!t.ok).forEach(t=>console.log('FAIL '+t.name+'\n   '+t.err));console.log(r.filter(t=>t.ok).length+'/'+r.length,'errors:',errs);await b.close();process.exit(r.every(t=>t.ok)&&!errs.length?0:1);})();
