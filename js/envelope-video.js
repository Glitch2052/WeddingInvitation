/* =========================================================
   Video envelope intro.
   No animated fold/tilt — the envelope-opening motion lives
   entirely in video/envelope-open.mp4. This script only handles:
   tap seal -> play video -> on end, fade the screen out and
   reveal the invitation underneath.
   ========================================================= */
(function () {
  const screenEl = document.getElementById('envelope-screen');
  const video = document.getElementById('envelope-video');
  const sealHit = document.getElementById('seal-hit');
  const tapHint = document.getElementById('tap-hint');
  const invite = document.getElementById('invite');

  let opened = false;

  function playVideo() {
    if (opened) return;
    opened = true;

    screenEl.classList.add('playing'); // hides seal + hint
    video.currentTime = 0;
    video.muted = false; // user gesture just happened, sound is allowed
    video.play().catch(() => {
      // Autoplay-with-sound blocked for some reason — retry muted
      // so the visual at least plays.
      video.muted = true;
      video.play();
    });
  }

  function revealInvite() {
    screenEl.classList.add('hide');
    screenEl.addEventListener('transitionend', () => {
      invite.classList.add('show');
      invite.setAttribute('aria-hidden', 'false');
      screenEl.remove();
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('invitation:opened'));
    }, { once: true });
  }

  video.addEventListener('ended', revealInvite);

  document.body.style.overflow = 'hidden';

  sealHit.addEventListener('click', playVideo);
  sealHit.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playVideo(); }
  });
})();
