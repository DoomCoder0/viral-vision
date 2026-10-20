/* Viral Vision – procedural dotted fabric waves. */
(() => {
  'use strict';
  const canvas=document.querySelector('#particle-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});
  if(!ctx)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let W=0,H=0,D=1,raf=0,last=0,t=0,visible=true;
  const TWO_PI=Math.PI*2;
  const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
  const bell=x=>Math.exp(-x*x);
  function dot(x,y,size,r,g,b,a){
    if(x<0||y<0||x>W||y>H)return;
    ctx.fillStyle='rgba('+r+','+g+','+b+','+clamp(a,0,1).toFixed(3)+')';
    ctx.fillRect(x,y,size,size);
  }
  function draw(time){
    ctx.fillStyle='#01050c';ctx.fillRect(0,0,W,H);
    const grad=ctx.createRadialGradient(W*.64,H*.4,0,W*.64,H*.4,W*.75);
    grad.addColorStop(0,'rgba(0,31,51,.24)');
    grad.addColorStop(1,'rgba(0,2,7,0)');
    ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
    const sx=W<650?9.2:8.4,sy=W<650?8.7:7.7;
    const cols=Math.ceil(W/sx)+4,rows=Math.ceil(H/sy)+16;
    for(let row=-8;row<rows-8;row++){
      const v=row*sy/H;
      for(let col=-2;col<cols-2;col++){
        const x=col*sx,u=x/W;
        const broad=Math.sin((u*1.12+v*.70)*TWO_PI+time*.20);
        const folds=Math.sin((u*2.12-v*.76)*TWO_PI-time*.15);
        const ridge=Math.sin((u*1.15-v*.48)*TWO_PI+time*.09);
        const bend=38*broad+26*folds+34*ridge*bell((v-.52)/.43);
        const y=row*sy+bend*(.38+v*.27)+41*Math.sin(u*2.9+time*.09)*bell((v-.55)/.30);
        if(y<0||y>H)continue;
        const edge=.45+.55*Math.sin(u*5.4+v*3+time*.19)**2;
        const shade=1-.60*bell((u-.48)/.32)*bell((v-.40)/.32);
        const glow=.46*bell((v-(.43+.13*Math.sin(u*4.1-.8+time*.13)))/.15);
        const a=clamp((.07+.16*edge+glow*.38)*shade,.025,.49);
        const c=clamp(glow*1.6+Math.max(0,u-.53)*.6,0,1);
        dot(x,y,1.1+glow*.40,Math.round(12+c),Math.round(70+c*94),Math.round(116+c*84),a);
      }
    }
    const crest=H*.40,strands=W<650?38:72,segments=Math.ceil(W/(W<650?8.5:7.8));
    for(let row=0;row<strands;row++){
      const n=(row-strands*.48)/strands,fade=bell(n*2);
      for(let col=0;col<=segments;col++){
        const u=col/segments,x=u*W;
        const middle=crest+H*(.31*Math.sin(u*2.60-.93+time*.10)-.06*Math.sin(u*7.2+time*.17));
        const y=middle+n*H*(.30+.13*Math.cos(u*6+time*.07));
        const depth=bell((u-.44)/.38);
        const stripe=Math.pow(Math.max(0,1-Math.abs(n)*2),4);
        const a=clamp((.055+stripe*.53+depth*.16)*fade*(u>.80?(1-u)*3.7:1),0,.78);
        if(a<.04)continue;
        dot(x,y,1.15+stripe*.26,18,Math.round(120+stripe*75),Math.round(152+stripe*46),a);
      }
    }
    const rr=W<650?45:75,rs=W<650?85:135;
    for(let row=0;row<rr;row++){
      const k=(row-rr*.49)/rr,glow=bell(k*2.7);
      for(let col=0;col<=rs;col++){
        const s=col/rs,u=.67+s*.36,x=u*W;
        const lift=H*(.51-.46*s)-H*.07*Math.sin(s*5.6+time*.17);
        const curl=H*.18*Math.sin((s*.85+k*.32)*TWO_PI+time*.09);
        const y=lift+k*H*(.18+.09*s)+curl;
        const alpha=clamp((.07+.60*glow)*(.3+.7*s*s)*(1-.16*Math.abs(k)),.02,.8);
        dot(x,y,1.1+.3*glow,13,Math.round(135+84*glow),Math.round(151+58*glow),alpha);
      }
    }
    canvas.dataset.rendering='dotted-wave';
  }
  function size(){
    const r=canvas.getBoundingClientRect();
    W=Math.max(1,r.width);H=Math.max(1,r.height);
    D=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(W*D);canvas.height=Math.round(H*D);
    ctx.setTransform(D,0,0,D,0,0);
    draw(t);
  }
  function tick(ms){
    raf=0;if(document.hidden||!visible||reduced.matches)return;
    if(ms-last>=32){last=ms;t=ms/1000;draw(t);}
    raf=requestAnimationFrame(tick);
  }
  function update(){
    if(raf)cancelAnimationFrame(raf);
    raf=0;size();
    if(visible&&!document.hidden&&!reduced.matches)raf=requestAnimationFrame(tick);
  }
  if('IntersectionObserver'in window){
    new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting;
      if(visible)update();else if(raf){cancelAnimationFrame(raf);raf=0;}
    },{rootMargin:'20px'}).observe(canvas);
  }
  window.addEventListener('resize',update,{passive:true});
  document.addEventListener('visibilitychange',update);
  reduced.addEventListener?.('change',update);
  update();
})();