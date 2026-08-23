/* =========================================================
   Main site behaviour — runs once the invitation is revealed
   ========================================================= */

/* ---------- Scroll reveals ---------- */
function initReveals() {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray('.reveal').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  });
}

/* ---------- Countdown ---------- */
/* EDIT THIS LINE if your ceremony start time differs.
   Currently set to 24 November 2026, 9:00 AM IST. */
const WEDDING_DATE = new Date('2026-11-24T09:00:00+05:30');

function initCountdown() {
  const els = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs')
  };
  if (!els.days) return;

  function tick() {
    const diff = WEDDING_DATE.getTime() - Date.now();
    if (diff <= 0) {
      els.days.textContent = '00';
      els.hours.textContent = '00';
      els.mins.textContent = '00';
      els.secs.textContent = '00';
      clearInterval(timer);
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    els.days.textContent = String(d).padStart(2, '0');
    els.hours.textContent = String(h).padStart(2, '0');
    els.mins.textContent = String(m).padStart(2, '0');
    els.secs.textContent = String(s).padStart(2, '0');
  }

  tick();
  const timer = setInterval(tick, 1000);
}

/* ---------- Background music toggle ---------- */
function initSound() {
  const btn = document.getElementById('sound-toggle');
  const audio = document.getElementById('bg-music');
  if (!btn || !audio) return;

  let playing = false;

  function play() {
    audio.play().then(() => {
      playing = true;
      btn.classList.remove('paused');
    }).catch(() => {
      /* Autoplay blocked or no audio file provided — that's fine,
         the visitor can still use the button to try again. */
      btn.classList.add('paused');
    });
  }

  // Music starts the moment the reveal transition begins (dispatched
  // by js/envelope-video.js right as the glow starts growing) —
  // that click/tap gesture is what makes browser autoplay allowed.
  window.addEventListener('music:start', play, { once: true });

  btn.addEventListener('click', () => {
    if (playing) {
      audio.pause();
      playing = false;
      btn.classList.add('paused');
    } else {
      play();
    }
  });
}

/* ---------- Petals & flowers ---------- */
/* Spawns a slow, continuous drift of small petal/flower shapes
   inside a given container, starting only once the invitation has
   been reached (see the 'invitation:opened' listener below).
   To use your own art: drop any of these files into
   images/particles/  —  petal.png, petal-2.png, flower.png,
   flower-2.png, flower-3.png. Any subset works; each spawned piece
   randomly picks one of the files that actually loads, and falls
   back to a small CSS-drawn shape for the rest. No code changes
   needed. */
const PETAL_IMAGE_CANDIDATES = [
  'images/particles/petal.png',
  'images/particles/petal-2.png',
  'images/particles/flower.png',
  'images/particles/flower-2.png',
  'images/particles/flower-3.png'
];
const failedPetalImages = new Set();

function initPetalShapes(containerId, { rate = 1050, max = 10 } = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function spawn() {
    const shapeCount = container.querySelectorAll('.petal--shape').length;
    if (shapeCount >= max) return;

    const petal = document.createElement('div');
    petal.className = 'petal petal--shape' + (Math.random() > 0.5 ? ' petal--alt' : '');
    const size = 9 + Math.random() * 13;
    const fallDuration = 10 + Math.random() * 8;
    const swayDuration = 3.5 + Math.random() * 2.5;

    petal.style.left = Math.random() * 100 + '%';
    petal.style.width = size + 'px';
    petal.style.height = size * (0.72 + Math.random() * 0.28) + 'px';
    petal.style.opacity = (0.46 + Math.random() * 0.34).toFixed(2);
    petal.style.animationDuration = `${fallDuration}s, ${swayDuration}s`;
    petal.style.animationDelay = `0s, ${Math.random() * swayDuration}s`;

    container.appendChild(petal);
    setTimeout(() => petal.remove(), fallDuration * 1000);
  }

  for (let i = 0; i < 4; i++) setTimeout(spawn, i * 420);
  setInterval(spawn, rate);
}

function initPetals(containerId, { rate = 900, max = 18 } = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function spawn() {
    if (container.childElementCount >= max) return;

    const available = PETAL_IMAGE_CANDIDATES.filter(p => !failedPetalImages.has(p));
    const alt = Math.random() > 0.5;
    const petal = document.createElement('div');
    petal.className = 'petal' + (alt ? ' petal--alt' : '');

    if (available.length) {
      const src = available[Math.floor(Math.random() * available.length)];
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.onerror = () => {
        failedPetalImages.add(src);
        petal.classList.remove('petal--img');
        img.remove();
      };
      petal.classList.add('petal--img');
      petal.appendChild(img);
    }

    const size = 14 + Math.random() * 20;
    const fallDuration = 9 + Math.random() * 7;
    const swayDuration = 3 + Math.random() * 2;

    petal.style.left = Math.random() * 100 + '%';
    petal.style.width = size + 'px';
    petal.style.height = size + 'px';
    petal.style.animationDuration = `${fallDuration}s, ${swayDuration}s`;
    petal.style.animationDelay = `0s, ${Math.random() * swayDuration}s`;

    container.appendChild(petal);
    setTimeout(() => petal.remove(), fallDuration * 1000);
  }

  for (let i = 0; i < 5; i++) setTimeout(spawn, i * 300);
  setInterval(spawn, rate);
}

/* ---------- Hero leaf + flower-layer parallax ---------- */
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const leaves = gsap.utils.toArray('.leaf');
  leaves.forEach((leaf, i) => {
    gsap.to(leaf, {
      y: i % 2 === 0 ? 80 : -80,
      ease: 'none',
      scrollTrigger: { trigger: '#page-welcome', start: 'top top', end: 'bottom top', scrub: true }
    });
  });

  // Different speed multipliers per depth layer is what sells the
  // parallax illusion — back barely moves, front moves noticeably
  // more, so they appear to sit at different distances as you scroll.
  const back = document.querySelector('.parallax-layer--back');
  const front = document.querySelector('.parallax-layer--front');

  if (back) {
    gsap.to(back, {
      y: 40,
      ease: 'none',
      scrollTrigger: { trigger: '#page-welcome', start: 'top top', end: 'bottom top', scrub: true }
    });
  }
  if (front) {
    gsap.to(front, {
      y: 140,
      ease: 'none',
      scrollTrigger: { trigger: '#page-welcome', start: 'top top', end: 'bottom top', scrub: true }
    });
  }
}

/* ---------- Date page celebration ---------- */
/* A brief, refined burst of small golden sparkles the first time
   the date page scrolls into view — not confetti, just a soft
   flicker of light around the date. */
function initDateSparkle() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const section = document.getElementById('page-date');
  if (!section) return;

  ScrollTrigger.create({
    trigger: section,
    start: 'top 65%',
    once: true,
    onEnter: () => {
      for (let i = 0; i < 10; i++) {
        const s = document.createElement('span');
        s.className = 'sparkle';
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 90;
        s.style.left = '50%';
        s.style.top = '46%';
        section.appendChild(s);
        gsap.fromTo(s,
          { x: 0, y: 0, scale: 0, opacity: 0 },
          {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            scale: 1,
            opacity: 1,
            duration: 0.5 + Math.random() * 0.3,
            delay: Math.random() * 0.4,
            ease: 'power2.out',
            onComplete: () => {
              gsap.to(s, {
                opacity: 0,
                duration: 0.6,
                onComplete: () => s.remove()
              });
            }
          }
        );
      }
    }
  });
}


/* ---------- Wedding events timeline ---------- */
function initWeddingTimeline() {
  const timeline = document.getElementById('wedding-timeline');
  if (!timeline || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const line = timeline.querySelector('.wedding-timeline__line span');
  const rows = gsap.utils.toArray('.event-row');
  if (!line || !rows.length) return;

  gsap.to(line, {
    height: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: timeline,
      start: 'top 72%',
      end: 'bottom 55%',
      scrub: 0.5
    }
  });

  rows.forEach((row) => {
    ScrollTrigger.create({
      trigger: row,
      start: 'top 68%',
      end: 'bottom 38%',
      onEnter: () => row.classList.add('is-active'),
      onEnterBack: () => row.classList.add('is-active'),
      onLeave: () => row.classList.remove('is-active'),
      onLeaveBack: () => row.classList.remove('is-active')
    });
  });
}

/* ---------- Boot ---------- */
window.addEventListener('invitation:opened', () => {
  initReveals();
  initCountdown();
  initParallax();
  initDateSparkle();
  initWeddingTimeline();
  // Falling petals/flowers start only now — once we've actually
  // landed on the invitation, per the requested sequence.
  initPetals('petal-field-site', { rate: 950, max: 14 });
  initPetalShapes('petal-field-site', { rate: 1050, max: 10 });
}, { once: true });

initSound();
