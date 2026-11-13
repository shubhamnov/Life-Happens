// Plays whole lives with scripted styles. Usage: node tools/simulate.js <lives per style> <out.json> [style,style...]
// Styles are defined in STR below; each bot answers cards from its policy, else the card's default.
// Loads Playwright from the usual places; set PW_CHROMIUM to a Chromium binary if needed.
let pw;try{pw=require('playwright');}catch(e){pw=require('/opt/node-tools/node_modules/playwright');}
const launch=()=>pw.chromium.launch(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:require('fs').existsSync('/opt/pw-browsers/chromium')?{executablePath:'/opt/pw-browsers/chromium'}:{});
const BASE=process.env.LH_BASE||'http://127.0.0.1:8765/';
const N=+process.argv[2]||20,only=(process.argv[4]||'').split(',').filter(Boolean);
(async()=>{const b=await launch();const p=await b.newPage();
await p.goto(BASE+'index.html?test=1&seed=1');
const out=await p.evaluate(async({N,only})=>{
 const base={setup:{home:'comfort',food:'balanced',social:'regular',commute:'public',other:'small',health:'yes',travel:'weekend'},sip:0.15,pit:true,
  pol:{marriageQ:'yes',wedding:'big',kidsQ:'k2',schoolQ:'budget',overspend:'trim',tighten:'trim',restore:'back',retire:'retire',lastResort:'basics'}};
 const V=(o)=>Object.assign({},base,o,{pol:Object.assign({},base.pol,o.pol||{}),setup:Object.assign({},base.setup,o.setup||{})});
 const STR={
  base:V({}),mix25:V({mix:[[23,0.25]]}),mix50:V({mix:[[23,0.5]]}),mix75:V({mix:[[23,0.75]]}),glide:V({mix:[[50,0.25],[56,0.5]]}),glide2:V({mix:[[55,0.25],[59,0.5],[68,0.75]]}),late50:V({mix:[[59,0.5]]}),
  mid:V({sip:0.12,pit:false}),midglide:V({sip:0.12,pit:false,mix:[[50,0.25],[56,0.5]]}),midlate:V({sip:0.12,pit:false,mix:[[58,0.5]]}),midlate75:V({sip:0.12,pit:false,mix:[[58,0.75]]}),mid25:V({sip:0.12,pit:false,mix:[[23,0.25]]}),
  ret25:V({mix:[[60,0.25]]}),ret50:V({mix:[[60,0.5]]}),midret25:V({sip:0.12,pit:false,mix:[[60,0.25]]}),midret50:V({sip:0.12,pit:false,mix:[[60,0.5]]}),
  thin:V({sip:0.08,pit:false}),thinglide:V({sip:0.08,pit:false,mix:[[50,0.25],[56,0.5]]}),thin50:V({sip:0.08,pit:false,mix:[[23,0.5]]}),sip0:V({sip:0,pit:false}),sip30:V({sip:0.3}),
  nocover:V({setup:{health:'no'},pol:{insureoffer:'no',adCover:'skip'},pitCover:'lapse'}),
  midnocover:V({sip:0.12,pit:false,setup:{health:'no'},pol:{insureoffer:'no',adCover:'skip'},pitCover:'lapse'}),
  frugalnocover:V({setup:{home:'starter',food:'home',social:'quiet',other:'none',travel:'none',health:'no'},sip:0.3,pol:{wedding:'modest',kidsQ:'k1',schoolQ:'gov',insureoffer:'no',adCover:'skip'},pitCover:'lapse'}),
  home:V({buy:'near'}),society:V({buy:'society'}),villa:V({buy:'villa'}),car:V({car:true}),mpv:V({car:'mpv'}),suv:V({car:'suv'}),
  acts:V({acts:true}),lump:V({lump:true}),
  work70:V({pol:{retire:'work'},retireAt:70}),
  passive:{setup:null,sip:0,pit:false,pol:{},raw:true},
  frugal:V({setup:{home:'starter',food:'home',social:'quiet',other:'none',travel:'none'},sip:0.3,pol:{wedding:'modest',kidsQ:'k1',schoolQ:'gov'}}),
  loner:V({setup:{home:'starter',food:'home',social:'quiet',other:'none',travel:'none'},sip:0.4,pol:{marriageQ:'no'}}),
  lavish:V({setup:{home:'premium',food:'foodie',social:'big',travel:'india',other:'regular'},sip:0.05,pol:{wedding:'lavish',schoolQ:'private',overspend:'school',creep:'up'}}),
 };
 const res=[];
 for(const [name,st] of Object.entries(STR).filter(([n])=>!only.length||only.includes(n))) for(let k=1;k<=N;k++){
  const f=document.createElement('iframe');f.src='index.html?test=1&seed='+(k*13+5);document.body.appendChild(f);await new Promise(r=>f.onload=r);
  const L=f.contentWindow.LifeHappens;L.goToSetup();const prof=Object.assign({},L.state.profile);L.beginLife(Object.assign({},prof,st.setup||{}));
  const s=L.state;let probe={},crashRet=null,sipSet=false,stops=0,bought=null,carB=false,startSal=s.salary;const types={};
  for(let i=0;i<1000&&s.status==='playing';i++){
   let g=0;while(s.event&&g++<5){const e=s.event;stops++;types[e.type]=(types[e.type]||0)+1;
    if(e.type==='pitstop'){L.resolveEvent(e.id,'go',{pit:{cover:st.pitCover||'renew',sip:st.pit&&e.sipBoost?'boost':'keep'}});continue;}
    const ch=L.EVENTS[e.type].choices(e,s).map(c=>c.id);let want=st.pol[e.type];
    if(e.type==='wedding'&&!st.raw&&e.canWait&&s.cash+s.invested<(e[want]||0)*1.2)want='wait';
    if(e.type==='retire'&&st.retireAt)want=L.preciseAge(s)>=st.retireAt?'retire':'work';
    if(!want||!ch.includes(want))want=(L.CARD_DEFAULTS[e.type]&&ch.includes(L.CARD_DEFAULTS[e.type]))?L.CARD_DEFAULTS[e.type]:ch[0];
    L.resolveEvent(e.id,want);}
   if(s.status!=='playing')break;
   if(st.retireAt&&s.employment==='employed'&&L.preciseAge(s)>=st.retireAt&&!s.event){L.requestRetirement&&L.requestRetirement();continue;}
   if(st.sip&&!sipSet&&s.month>2){L.setSip(Math.round(s.salary*st.sip/1000)*1000);sipSet=true;}
   if(st.mix&&!s.event){const a=L.preciseAge(s);let want=0;for(const [ag,sh] of st.mix)if(a>=ag)want=sh;if(want!==s.mix)L.setMix(want);}
   if(s.mkt.cr&&s.employment==='retired'&&crashRet===null)crashRet=Math.round(L.preciseAge(s));
   if(!s.event){
    if(st.buy&&!bought&&!s.ownsHome){const v=L.OPTIONAL.buyHouse.variants(s).find(x=>x.id===st.buy);const bb=L.monthlyBudget(s);if(v&&!v.block&&s.cash-v.upfront>3*bb.total&&bb.leftover-L.OPTIONAL.buyHouse.monthly(s,st.buy)>=0.15*bb.income){if(L.chooseOptional('buyHouse',st.buy))bought=L.ageLabel();}}
    if(st.car&&!carB&&s.vehicle==='public'&&L.preciseAge(s)>=28&&(()=>{const bb=L.monthlyBudget(s),m=st.car===true?'hatch':st.car;return s.cash>=3*bb.total&&bb.leftover-L.OPTIONAL.buyCar.monthly(s,m)>=0.15*bb.income;})()){if(L.chooseOptional('buyCar',st.car===true?'hatch':st.car))carB=true;}
    if(st.acts){for(const a of ['familyDay','volunteer','donate']){if(L.chooseOptional(a))break;}}
    if(st.lump&&s.cash>9*L.monthlyBudget(s).total&&s.employment==='employed')L.chooseOptional('investLump','idle');
   }
   {const a=Math.floor(L.preciseAge(s));if(!s.event&&(a===40||a===55||a===70)&&!probe[a]){const f=Math.pow(1.06,Math.floor(s.month/12));probe[a]={hp:Math.round(L.healthPremium(s)/f),fam:s.coverFamily,par:s.parentsCovered,term:!!s.termCover,cost:Math.round(L.monthlyBudget(s).total/f),inc:Math.round(L.monthlyIncome(s)/f),cash:Math.round(s.cash/f/1000),inv:Math.round(s.invested/f/1000)};}}
   L.advanceMonth();}
  const end=L.lifeEnding(s);
  res.push({probe,brokeAt:s.status!=='playing'&&s.finalReason==='insolvent'?L.ageLabel():null,prem:Math.round(s.stats.insurancePaid/1e5),claims:Math.round(s.stats.claims/1e5),crashRet,name,k,end:end.key,H:L.lifeHappiness(s),nw:Math.round(L.realNetWorth(s)/1e5),age:+L.ageLabel(),broke:s.finalReason==='insolvent',stops,startSal,bought,ret:s.retiredAtAge||null,types,avg:end.avg});
  f.remove();}
 return res;},{N,only});
require('fs').writeFileSync(process.argv[3],JSON.stringify(out));await b.close();})();
