(function(){
  const screenEl=document.getElementById('envelope-screen');
  const video=document.getElementById('envelope-video');
  const poster=document.getElementById('envelope-poster-img');
  const glow=document.getElementById('reveal-glow');
  const seal=document.getElementById('seal-hit');
  const invite=document.getElementById('invite');
  if(!screenEl||!video||!poster||!glow||!seal||!invite)return;

  let opened=false;
  video.load();
  video.addEventListener('playing',()=>poster.classList.add('hide'),{once:true});

  const lock=()=>{
    document.documentElement.style.overflow='hidden';
    document.body.style.overflow='hidden';
    document.addEventListener('touchmove',preventTouch,{passive:false});
  };
  const unlock=()=>{
    document.documentElement.style.overflow='';
    document.body.style.overflow='';
    document.removeEventListener('touchmove',preventTouch);
  };
  const preventTouch=e=>e.preventDefault();
  lock();

  // Everything except the envelope video + poster is held back until the seal is tapped, so it
  // never competes with the video for bandwidth on first paint. Arming here (rather than on a
  // video event like 'playing') starts the downloads at the earliest possible moment — the full
  // duration of the video playback becomes the head start these assets get to finish loading
  // before reveal() runs.
  let assetsArmed=false;
  function armDeferredAssets(){
    if(assetsArmed)return;
    assetsArmed=true;
    document.body.classList.add('assets-armed'); // unlocks the 5 section background-image url()s in CSS
    document.querySelectorAll('.deferred-img').forEach((img)=>{
      const src=img.getAttribute('data-src');
      if(src){ img.src=src; img.removeAttribute('data-src'); }
    });
    const bgMusic=document.getElementById('bg-music');
    if(bgMusic) bgMusic.load(); // preload stays "none" in HTML; this explicitly starts the fetch now
  }

  function play(){
    if(opened)return;
    opened=true;
    screenEl.classList.add('playing');
    armDeferredAssets();
    video.volume=1;
    video.muted=false;
    video.play().catch(()=>{video.muted=true;video.play().catch(()=>{})});
  }

  video.addEventListener('timeupdate',()=>{
    if(!video.duration)return;
    const p=video.currentTime/video.duration;
    if(p>.9)video.volume=Math.max(0,1-(p-.9)/.1);
  });

  function reveal(){
    invite.classList.add('show');
    invite.setAttribute('aria-hidden','false');
    window.dispatchEvent(new CustomEvent('music:start'));
    const scale=(Math.max(innerWidth,innerHeight)*2.5)/140;
    const tl=gsap.timeline({onComplete:()=>{
      screenEl.remove();
      unlock();
      window.dispatchEvent(new CustomEvent('invitation:opened'));
    }});
    tl.to(glow,{opacity:1,duration:.25,ease:'power1.out'})
      .to(glow,{scale,duration:.9,ease:'power2.inOut'},'<')
      .to(screenEl,{opacity:0,duration:.45,ease:'power1.inOut'},'-=.15');
  }

  video.addEventListener('ended',reveal);
  seal.addEventListener('click',play);
  seal.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();play()}});
})();
