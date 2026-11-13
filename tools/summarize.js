// Summary per style, split by whether a crash hit in retirement before 70. Usage: node tools/summarize.js out.json
const d=require(require('path').resolve(process.argv[2]));const by={};d.forEach(r=>(by[r.name]=by[r.name]||[]).push(r));
const med=a=>{a=[...a].sort((x,y)=>x-y);return a[a.length>>1]};
for(const [n,a] of Object.entries(by)){const cr=a.filter(r=>r.crashRet&&r.crashRet<70),nc=a.filter(r=>!(r.crashRet&&r.crashRet<70));
 const f=x=>x.length?`n${x.length} broke ${x.filter(r=>r.broke).length} medNW ${med(x.map(r=>r.nw))} p10 ${[...x.map(r=>r.nw)].sort((p,q)=>p-q)[Math.floor(x.length*0.1)]} H ${(x.reduce((s,r)=>s+r.H,0)/x.length).toFixed(1)}`:'-';
 console.log(n.padEnd(10),'ALL',f(a),'| crash<70',f(cr),'| none',f(nc));}
