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

  function play(){
    if(opened)return;
    opened=true;
    screenEl.classList.add('playing');
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
