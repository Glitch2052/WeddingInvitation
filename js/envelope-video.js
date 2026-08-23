/* =========================================================
   Video envelope intro.

   Sequence:
   1. Tap seal -> video plays (audio included).
   2. In the video's final 10%, its own audio fades out.
   3. On 'ended': a glowing circle grows from the seal's position
      to cover the whole screen — background music starts at the
      same moment the glow begins growing.
   4. Once fully covered, the whole overlay fades away, revealing
      the invitation underneath.
   5. Only once that fade finishes (i.e. once we've "landed" on the
      invitation) do the falling petals/flowers begin.
   ========================================================= */
(function () {
  const screenEl = document.getElementById('envelope-screen');
  const video = document.getElementById('envelope-video');
  const posterImg = document.getElementById('envelope-poster-img');
  const glow = document.getElementById('reveal-glow');
  const sealHit = document.getElementById('seal-hit');
  const tapHint = document.getElementById('tap-hint');
  const invite = document.getElementById('invite');

  let opened = false;
  let audioFadeStarted = false;

  // Warm up decoding ahead of the tap so the first frame is ready
  // the instant play() is called (prevents a black-flash flicker).
  video.load();

  function hidePoster() {
    posterImg.classList.add('hide');
  }
  video.addEventListener('playing', hidePoster, { once: true });

  // Fade the video's own audio out across its final 10%.
  video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    const progress = video.currentTime / video.duration;
    if (progress >= 0.9) {
      audioFadeStarted = true;
      const fade = (progress - 0.9) / 0.1; // 0 -> 1 across the last 10%
      video.volume = Math.max(0, 1 - fade);
    } else if (audioFadeStarted) {
      // (only relevant if the video were seeked backward — safe no-op otherwise)
      video.volume = 1;
      audioFadeStarted = false;
    }
  });

  function playVideo() {
    if (opened) return;
    opened = true;

    screenEl.classList.add('playing'); // hides seal + hint + invited text
    video.volume = 1;

    const tryUnmutedPlay = () => {
      video.muted = false;
      return video.play();
    };

    tryUnmutedPlay().catch(() => {
      video.muted = true;
      video.play().catch(() => { /* nothing more we can do */ });
    });
  }

  function runRevealSequence() {
    // Invitation content becomes visible now, positioned behind the
    // still-opaque overlay — it'll be revealed as that overlay fades.
    invite.classList.add('show');
    invite.setAttribute('aria-hidden', 'false');

    // Music starts the moment the glow begins growing.
    window.dispatchEvent(new CustomEvent('music:start'));

    const glowCoverScale = (Math.max(window.innerWidth, window.innerHeight) * 2.4) / 140;

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => {
        screenEl.remove();
        unlockScroll();
        // Falling petals/flowers only start once we've actually
        // landed on the invitation.
        window.dispatchEvent(new CustomEvent('invitation:opened'));
      }
    });

    tl.to(glow, { opacity: 1, duration: 0.35, ease: 'power1.out' })
      .to(glow, { scale: glowCoverScale, duration: 0.85, ease: 'power2.inOut' }, '<')
      .to(screenEl, { opacity: 0, duration: 0.4, ease: 'power1.inOut' }, '-=0.2');
  }

  video.addEventListener('ended', runRevealSequence);

  // overflow:hidden alone doesn't reliably stop scrolling on every
  // mobile browser (some still allow rubber-band/touch scroll under
  // it) — block touchmove directly for the whole time the envelope
  // is on screen, including during video playback, as a hard guarantee.
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';

  function blockTouchScroll(e) { e.preventDefault(); }
  document.addEventListener('touchmove', blockTouchScroll, { passive: false });

  function unlockScroll() {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.removeEventListener('touchmove', blockTouchScroll);
  }

  sealHit.addEventListener('click', playVideo);
  sealHit.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playVideo(); }
  });
})();
