/* Main invitation behaviour */
gsap.registerPlugin(ScrollTrigger);

const PETAL_IMAGE_CANDIDATES = [
  'images/particles/flower.png',
  'images/particles/flower-2.png',
  'images/particles/flower-3.png'
];
const failedPetalImages = new Set();

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

function initSound(){
  const btn=document.getElementById('sound-toggle');
  const audio=document.getElementById('bg-music');
  if(!btn||!audio)return;
  let playing=false;
  const update=()=>{
    btn.classList.toggle('paused',!playing);
    btn.setAttribute('aria-pressed',String(playing));
  };
  const play=()=>audio.play().then(()=>{playing=true;update()}).catch(()=>{playing=false;update()});
  window.addEventListener('music:start',play,{once:true});
  btn.addEventListener('click',()=>{ if(playing){audio.pause();playing=false;update()} else play(); });
  update();
}

function initPetals(){
  const container=document.getElementById('petal-field-site');
  if(!container||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const spawn=()=>{
    if(container.childElementCount>=18)return;
    const petal=document.createElement('div');
    const useImage=Math.random()>.32;
    petal.className='petal'+(Math.random()>.5?' petal--alt':'');
    const size=useImage?14+Math.random()*16:9+Math.random()*10;
    const fall=10+Math.random()*7;
    const sway=3.2+Math.random()*2.2;
    petal.style.left=Math.random()*100+'%';
    petal.style.width=size+'px';
    petal.style.height=(useImage?size:size*.78)+'px';
    petal.style.opacity=(.38+Math.random()*.4).toFixed(2);
    petal.style.animationDuration=`${fall}s, ${sway}s`;
    petal.style.animationDelay=`0s, ${Math.random()*sway}s`;
    if(useImage){
      const available=PETAL_IMAGE_CANDIDATES.filter(x=>!failedPetalImages.has(x));
      if(available.length){
        const src=available[Math.floor(Math.random()*available.length)];
        const img=document.createElement('img');img.src=src;img.alt='';petal.classList.add('petal--img');
        img.onerror=()=>{failedPetalImages.add(src);petal.classList.remove('petal--img');img.remove();petal.classList.add('petal--shape')};
        petal.appendChild(img);
      } else petal.classList.add('petal--shape');
    } else petal.classList.add('petal--shape');
    container.appendChild(petal);
    setTimeout(()=>petal.remove(),fall*1000);
  };
  for(let i=0;i<6;i++)setTimeout(spawn,i*260);
  setInterval(spawn,1150);
}

function initDateSparkle(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const section=document.getElementById('page-date');
  if(!section)return;
  ScrollTrigger.create({trigger:section,start:'top 70%',once:true,onEnter:()=>{
    for(let i=0;i<9;i++){
      const s=document.createElement('span');
      s.style.position='absolute';s.style.width='5px';s.style.height='5px';s.style.borderRadius='50%';s.style.background='#d9bb7b';s.style.boxShadow='0 0 8px #f1dfb1';s.style.left='50%';s.style.top='45%';s.style.zIndex='4';
      section.appendChild(s);
      const angle=Math.random()*Math.PI*2,dist=70+Math.random()*110;
      gsap.fromTo(s,{x:0,y:0,scale:0,opacity:0},{x:Math.cos(angle)*dist,y:Math.sin(angle)*dist,scale:1,opacity:1,duration:.5,delay:Math.random()*.3,ease:'power2.out',onComplete:()=>gsap.to(s,{opacity:0,duration:.6,onComplete:()=>s.remove()})});
    }
  }});
}

function initTimeline(){
  const line=document.querySelector('.event-line span');
  const list=document.getElementById('wedding-timeline');
  if(!line||!list||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  gsap.to(line,{height:'100%',ease:'none',scrollTrigger:{trigger:list,start:'top 78%',end:'bottom 48%',scrub:.5}});
}

window.addEventListener('invitation:opened',()=>{
  document.documentElement.classList.add('invitation-ready');
  initReveals();
  initPetals();
  initDateSparkle();
  initTimeline();
  ScrollTrigger.refresh();
},{once:true});

initSound();
