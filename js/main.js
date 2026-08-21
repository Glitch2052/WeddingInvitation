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

/* ---------- Boot ---------- */
window.addEventListener('invitation:opened', () => {
  initReveals();
  initCountdown();
}, { once: true });

initSound();
