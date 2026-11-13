// Same seeds, two styles, life by life. Usage: node tools/compare.js out.json styleA styleB
const d=require(require('path').resolve(process.argv[2])),[a,b]=process.argv.slice(3);const A={},B={};d.forEach(r=>{if(r.name===a)A[r.k]=r;if(r.name===b)B[r.k]=r;});
let hw=0,nw=0,n=0,dh=0,bw=0,bl=0;for(const k in A){if(!B[k])continue;n++;const x=A[k],y=B[k];if(y.H>x.H+0.05)hw++;if(y.nw>x.nw)nw++;dh+=y.H-x.H;if(x.broke&&!y.broke)bw++;if(!x.broke&&y.broke)bl++;}
console.log(`${b} vs ${a}: n${n} happier in ${hw}, richer in ${nw}, avg dH ${(dh/n).toFixed(2)}, saved from broke ${bw}, made broke ${bl}`);
