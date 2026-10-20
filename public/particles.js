/* Viral Vision — original, procedural particle-ribbon animation.
   Runs in Canvas: no stock video, exported PNG, or external animation library. */
(() => {
  'use strict';
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let w = 0, h = 0, dpr = 1, frame = 0, raf = 0, last = 0;
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    w = Math.max(1, rect.width); h = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(frame);
  };
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const smooth = (t) => { t = clamp(t,0,1); return t*t*(3-2*t); };

  function waveField(x, y, time) {
    // Two intersecting wave fields create a silky moiré/ribbon instead of flat dots.
    return Math.sin((x*7.4 + y*3.6 + time*.35) * Math.PI) * 33
         + Math.sin((x*4.0 - y*5.4 - time*.18) * Math.PI) * 20
         + Math.sin((x*2.0 + y*1.4 + time*.10) * Math.PI) * 19;
  }

  function draw(t) {
    ctx.fillStyle = '#02050a';
    ctx.fillRect(0, 0, w, h);
    const bg = ctx.createRadialGradient(w*.83,h*.14,0,w*.83,h*.14,w*.7);
    bg.addColorStop(0,'rgba(0,68,87,.15)'); bg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);
    pointer.x += (pointer.targetX - pointer.x)*.04;
    pointer.y += (pointer.targetY - pointer.y)*.04;
    const spacing = w < 580 ? 10.6 : 10;
    const cols = Math.ceil(w/spacing)+5;
    const rows = Math.ceil(h/spacing)+12;
    for (let r = -6; r < rows; r++) {
      const v = r/(rows-12);
      const fadeV = .12 + .83*smooth((v+.06)*1.12);
      for (let c = -2; c < cols; c++) {
        const x = (c-.5)*spacing;
        const nx = x/w;
        const ripple = waveField(nx,v,t);
        const bottomSweep = -100*Math.exp(-Math.pow((nx-.31)/.36,2)) * Math.sin(v*3.15+nx*.9+t*.12);
        const y = (r+.1)*spacing + ripple * (.25+.4*fadeV) + bottomSweep*.50;
        if(y < 0 || y > h) continue;
        const rippleEdge = .32 + .40*smooth(v);
        const rightGlow = smooth((nx-.50)*2);
        const leftGlow = smooth((.45-nx)*1.55);
        const bright = .18 + .7*(.55*rightGlow+.35*leftGlow) + .20*Math.sin(nx*8-v*5+t*.3)**2;
        const valley = 1 - .61*Math.exp(-Math.pow((v-.51)/.29,2));
        let alpha = clamp((.15 + bright*.40) * fadeV * valley * rippleEdge*2, .015, .72);
        // Behind the headings, diminish particles for legibility.
        if(v>.14 && v<.77 && nx>.12 && nx<.88) alpha*=.26;
        ctx.fillStyle = `rgba(${Math.floor(15+rightGlow*12)},${Math.floor(99+rightGlow*91)},${Math.floor(150+rightGlow*45)},${alpha.toFixed(3)})`;
        const radius = .65 + .32*fadeV + .19*rightGlow;
        ctx.beginPath(); ctx.arc(x + pointer.x*(v-.4)*7, y + pointer.y*(nx-.5)*6, radius, 0, Math.PI*2); ctx.fill();
      }
    }
    // Illuminated turquoise ribbon high on the right, sweeping as reference animation does.
    const lineCount=37, dotCount=Math.max(38,Math.round(w/14));
    for(let row=0;row<lineCount;row++){
      const v=row/(lineCount-1);
      for(let i=0;i<dotCount;i++){
        const u=i/(dotCount-1);
        const nx=.47 + u*.58;
        const x=nx*w;
        const y=h*(.035 + v*.24) + 39*Math.sin((u*1.85 + v*.45 + t*.032)*Math.PI*2) + 37*Math.sin(u*3.1-v*1.7+t*.018);
        if(y<0||y>h) continue;
        const alpha = (.09 + .41*smooth(u) * (1-.47*v)) * (1-.25*Math.sin(u*15 + t*.08));
        ctx.fillStyle=`rgba(20,218,224,${clamp(alpha,0,.57).toFixed(3)})`;
        ctx.beginPath();ctx.arc(x,y,.62+.25*smooth(u),0,Math.PI*2);ctx.fill();
      }
    }
  }
  function tick(ms){
    raf = requestAnimationFrame(tick);
    if(document.hidden || ms-last<32) return;
    last=ms; frame=ms*.001; draw(frame);
  }
  window.addEventListener('resize', resize, {passive:true});
  window.addEventListener('pointermove', e=>{
    pointer.targetX=clamp((e.clientX/innerWidth-.5)*2,-1,1);
    pointer.targetY=clamp((e.clientY/innerHeight-.5)*2,-1,1);
  },{passive:true});
  const observer=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting && !reduced.matches && !raf){raf=requestAnimationFrame(tick);}
    else if(!entries[0].isIntersecting && raf){cancelAnimationFrame(raf);raf=0;}
  });
  resize(); observer.observe(canvas);
  reduced.addEventListener?.('change',()=>{if(reduced.matches){cancelAnimationFrame(raf);raf=0;draw(0);}else if(!raf)raf=requestAnimationFrame(tick);});
  // Testable flag; verify that the background is drawn procedurally, not a media file.
  canvas.dataset.rendering='canvas-particles';
})();
