/* Main invitation behaviour */
gsap.registerPlugin(ScrollTrigger);

const PETAL_IMAGE_CANDIDATES = [
  'images/particles/flower.webp',
  'images/particles/flower-2.webp',
  'images/particles/flower-3.webp',
  'images/particles/flower-4.webp',
  'images/particles/flower-5.webp',
  'images/particles/flower-6.webp',
  'images/particles/flower-7.webp'
];
const failedPetalImages = new Set();

function initCoupleOverlay(){
  const overlay=document.getElementById('couple-overlay');
  const bride=document.getElementById('bride-figure');
  const groom=document.getElementById('groom-figure');
  const burstHost=document.getElementById('couple-burst');
  if(!overlay||!bride||!groom)return;

  // How far off-screen (in vw, from center) each figure starts, and how close
  // (in vw, from center) they end up once they've met near the end of Page 5.
  // END_VW is kept large enough that the two figures visibly approach each
  // other without their images overlapping/touching at the end.
  const START_VW=68;
  const END_VW=14;
  const MEET_AT=0.985; // scroll progress (0-1) at which the burst fires, once

  // All 5 pages are equal height (100vh each), so one page = exactly 0.25 of
  // the scrollable range. EARLY_SHIFT controls how much sooner the approach
  // becomes noticeable — see the rescaling in update() below, which stretches
  // the whole 0→1 curve back over the full scroll range so the figures still
  // only reach their final (closest) position exactly at the very end of the
  // last page, rather than arriving early and then sitting static.
  const EARLY_SHIFT=0.25;

  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function place(progress){
    // Smoothstep easing so the approach feels gradual rather than linear.
    const t=progress*progress*(3-2*progress);
    const offset=START_VW-(START_VW-END_VW)*t;
    bride.style.transform=`translateX(-50%) translateX(-${offset}vw)`;
    groom.style.transform=`translateX(-50%) translateX(${offset}vw)`;
    return t;
  }

  if(reduced){
    // Show them already together, no scroll-linked motion.
    place(1);
    return;
  }

  let burstFired=false;
  let ticking=false;

  function update(){
    ticking=false;
    const max=document.documentElement.scrollHeight-window.innerHeight;
    const rawProgress=max>0?Math.min(1,Math.max(0,window.scrollY/max)):0;
    // Rescale (not clamp) the shifted value back onto [0,1]: raw=0 still maps
    // to a bit above 0, but raw=1 always maps to exactly 1, so the figures
    // keep gradually closing the gap all the way through and only reach their
    // final resting position right as the last page finishes scrolling into
    // view — never before.
    const progress=Math.min(1,(rawProgress+EARLY_SHIFT)/(1+EARLY_SHIFT));
    const t=place(progress);
    if(!burstFired && t>=MEET_AT){
      burstFired=true;
      triggerCoupleBurst(burstHost);
    }
  }
  function onScroll(){
    if(!ticking){ ticking=true; requestAnimationFrame(update); }
  }

  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
  update();
}

function triggerCoupleBurst(host){
  if(!host)return;
  const count=14;
  for(let i=0;i<count;i++){
    const particle=document.createElement('span');
    particle.className='couple-burst-particle';
    const size=5+Math.random()*7;
    particle.style.width=size+'px';
    particle.style.height=size+'px';
    host.appendChild(particle);
    const angle=Math.random()*Math.PI*2;
    const dist=26+Math.random()*54;
    // Alpha stays at 1 for the particle's whole life; it exits via scale, not fade.
    gsap.fromTo(particle,{x:0,y:0,scale:0,opacity:1},{
      x:Math.cos(angle)*dist,y:-Math.abs(Math.sin(angle))*dist*.8-10,scale:1,opacity:1,
      duration:.55+Math.random()*.3,delay:Math.random()*.12,ease:'power2.out',
      onComplete:()=>gsap.to(particle,{scale:0,duration:.4,ease:'power1.in',onComplete:()=>particle.remove()})
    });
  }
}

function initReveals(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.utils.toArray('.reveal').forEach((el)=>{
    if(reduced){ gsap.set(el,{opacity:1,y:0}); return; }
    gsap.to(el,{
      opacity:1,y:0,duration:.75,ease:'power2.out',
      scrollTrigger:{trigger:el,start:'top 88%',toggleActions:'play none none reverse'}
    });
  });
}

function initScrollCue(){
  const cue = document.querySelector('.scroll-cue');
  if(!cue || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Visible immediately at the start of the invitation, then fades out as soon as
  // the person starts scrolling, rather than only disappearing because the section
  // has scrolled off screen.
  gsap.set(cue,{opacity:1});
  gsap.to(cue,{
    opacity:0,
    ease:'none',
    scrollTrigger:{start:0,end:130,scrub:.2}
  });
}

function initSound(){
  const btn=document.getElementById('sound-toggle');
  const audio=document.getElementById('bg-music');
  if(!btn||!audio)return;
  let playing=false;
  // Tracks whether music was actually playing right before the tab/browser was hidden,
  // so we only auto-resume for someone who had it on, not someone who'd muted it.
  let resumeOnReturn=false;
  const update=()=>{
    btn.classList.toggle('paused',!playing);
    btn.setAttribute('aria-pressed',String(playing));
  };
  const play=()=>audio.play().then(()=>{playing=true;update()}).catch(()=>{playing=false;update()});
  const pause=()=>{audio.pause();playing=false;update()};
  window.addEventListener('music:start',play,{once:true});
  btn.addEventListener('click',()=>{ if(playing){pause()} else play(); });

  // Auto-mute when the tab/app is backgrounded, the browser is minimized, or the user
  // navigates away or closes the tab. There's no JS event that fires reliably "on browser
  // close" specifically, so Page Visibility (fires on tab switch, app backgrounding, screen
  // lock, and just before close/navigation on mobile) plus pagehide (back/forward-cache and
  // actual unload) together cover every case that matters in practice.
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){
      if(playing){ resumeOnReturn=true; pause(); }
    } else if(resumeOnReturn){
      resumeOnReturn=false;
      play();
    }
  });
  window.addEventListener('pagehide',()=>{ if(playing) pause(); });

  update();
}

function initPetals(){
  const container=document.getElementById('petal-field-site');
  if(!container||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const spawn=()=>{
    if(container.childElementCount>=18)return;
    // Flower-image particles only — no CSS-drawn shape fallback. If every
    // candidate image has failed to load, just skip this spawn.
    const available=PETAL_IMAGE_CANDIDATES.filter(x=>!failedPetalImages.has(x));
    if(!available.length)return;
    const petal=document.createElement('div');
    petal.className='petal petal--img';
    const size=14+Math.random()*16;
    const fall=10+Math.random()*7;
    const sway=3.2+Math.random()*2.2;
    petal.style.left=Math.random()*100+'%';
    petal.style.width=size+'px';
    petal.style.height=size+'px';
    // Random alpha per petal so the fall feels less uniform/mechanical.
    petal.style.opacity=(0.4+Math.random()*0.6).toFixed(2);
    petal.style.animationDuration=`${fall}s, ${sway}s`;
    petal.style.animationDelay=`0s, ${Math.random()*sway}s`;
    const src=available[Math.floor(Math.random()*available.length)];
    const img=document.createElement('img');
    img.src=src;img.alt='';
    img.onerror=()=>{failedPetalImages.add(src);petal.remove()};
    petal.appendChild(img);
    container.appendChild(petal);
    setTimeout(()=>petal.remove(),fall*1000);
  };
  for(let i=0;i<6;i++)setTimeout(spawn,i*260);
  setInterval(spawn,1150);
}

function initDateBurst(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const section=document.getElementById('page-date');
  if(!section)return;
  ScrollTrigger.create({trigger:section,start:'center center',once:true,onEnter:()=>{
    const count=16;
    for(let i=0;i<count;i++){
      const petal=document.createElement('img');
      petal.src=PETAL_IMAGE_CANDIDATES[i%PETAL_IMAGE_CANDIDATES.length];
      petal.alt='';
      petal.style.position='absolute';petal.style.left='50%';petal.style.top='46%';
      const size=16+Math.random()*16;
      petal.style.width=size+'px';petal.style.height=size+'px';
      petal.style.objectFit='contain';petal.style.zIndex='4';petal.style.pointerEvents='none';
      petal.onerror=()=>petal.remove();
      section.appendChild(petal);
      const angle=Math.random()*Math.PI*2,dist=90+Math.random()*160,rot=(Math.random()-.5)*300;
      gsap.fromTo(petal,{x:0,y:0,scale:0,opacity:1,rotate:0},{
        x:Math.cos(angle)*dist,y:Math.sin(angle)*dist,scale:1,opacity:1,rotate:rot,
        duration:.7+Math.random()*.35,delay:Math.random()*.25,ease:'power2.out',
        onComplete:()=>gsap.to(petal,{y:'+=36',scale:0,duration:.65,ease:'power1.in',onComplete:()=>petal.remove()})
      });
    }
  }});
}

function initTimeline(){
  const line=document.querySelector('.event-line span');
  const list=document.getElementById('wedding-timeline');
  if(!line||!list||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  gsap.to(line,{height:'100%',ease:'none',scrollTrigger:{trigger:list,start:'top 78%',end:'bottom 48%',scrub:.5}});
}

function initCalendarButton(){
  const btn=document.getElementById('add-to-calendar');
  if(!btn)return;
  btn.addEventListener('click',(e)=>{
    e.preventDefault();
    const ics=[
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Wedding Invitation//EN','CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:nikita-kamlesh-wedding-24112026@invitation',
      'DTSTAMP:20261124T000000Z',
      'DTSTART;VALUE=DATE:20261124',
      'DTEND;VALUE=DATE:20261125',
      "SUMMARY:Nikita & Kamlesh's Wedding",
      'DESCRIPTION:Join us as we celebrate the wedding of Nikita and Kamlesh.',
      'LOCATION:Shree Saurashtra Kadva Patidar Seva Samaj\\, Ankleshwar GIDC\\, Ankleshwar\\, Gujarat 393002',
      'END:VEVENT','END:VCALENDAR'
    ].join('\r\n');
    const blob=new Blob([ics],{type:'text/calendar'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='Nikita-Kamlesh-Wedding.ics';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),4000);
  });
}

window.addEventListener('invitation:opened',()=>{
  document.documentElement.classList.add('invitation-ready');
  initReveals();
  initPetals();
  initDateBurst();
  initTimeline();
  initScrollCue();
  initCoupleOverlay();
  ScrollTrigger.refresh();
},{once:true});

initSound();
initCalendarButton();
