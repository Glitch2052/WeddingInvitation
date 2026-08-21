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

  // Try to start music the moment the envelope opens (counts as a user gesture)
  window.addEventListener('invitation:opened', play, { once: true });

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

/* ---------- Petals ---------- */
/* Spawns a slow, continuous drift of small petal/flower shapes
   inside a given container.
   To use your own art: drop any of these files into
   images/particles/  —  petal.png, petal-2.png, flower.png,
   flower-2.png. Any subset works; each spawned petal randomly
   picks one of the files that actually loads, and falls back to a
   small CSS-drawn shape for the rest. No code changes needed. */
const PETAL_IMAGE_CANDIDATES = [
  'images/particles/petal.png',
  'images/particles/petal-2.png',
  'images/particles/flower.png',
  'images/particles/flower-2.png'
];
const failedPetalImages = new Set();

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

    const size = 12 + Math.random() * 14;
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

/* ---------- Hero leaf parallax ---------- */
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const leaves = gsap.utils.toArray('.leaf');
  if (!leaves.length) return;

  leaves.forEach((leaf, i) => {
    gsap.to(leaf, {
      y: i % 2 === 0 ? 80 : -80,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  });
}

/* ---------- Boot ---------- */
initPetals('petal-field-intro', { rate: 700, max: 14 });

window.addEventListener('invitation:opened', () => {
  initReveals();
  initCountdown();
  initParallax();
  initPetals('petal-field-site', { rate: 1400, max: 10 });
}, { once: true });

initSound();
