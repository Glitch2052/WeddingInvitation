/* =========================================================
   Video envelope intro.
   No animated fold/tilt — the envelope-opening motion lives
   entirely in video/envelope-open.mp4. This script only handles:
   tap seal -> play video -> on end, fade the screen out and
   reveal the invitation underneath.

   The manual poster-image layer (rather than relying solely on the
   <video poster> attribute) fixes a flicker some mobile browsers
   show on first tap: they drop the poster the instant play() is
   called, before a real decoded frame is ready, producing a black
   flash. We keep our own poster image on top and only hide it once
   the 'playing' event confirms a frame is actually being rendered.
   ========================================================= */
(function () {
  const screenEl = document.getElementById('envelope-screen');
  const video = document.getElementById('envelope-video');
  const posterImg = document.getElementById('envelope-poster-img');
  const sealHit = document.getElementById('seal-hit');
  const tapHint = document.getElementById('tap-hint');
  const invite = document.getElementById('invite');

  let opened = false;

  // Warm up decoding ahead of the tap so the first frame is ready
  // the instant play() is called, rather than the browser needing
  // to start decoding from cold at that moment.
  video.load();

  function hidePoster() {
    posterImg.classList.add('hide');
  }
  video.addEventListener('playing', hidePoster, { once: true });

  function playVideo() {
    if (opened) return;
    opened = true;

    screenEl.classList.add('playing'); // hides seal + hint
    // Do NOT touch currentTime here — the video is already at 0,
    // and forcing a seek right before play() is itself a common
    // source of a visible flicker on mobile.

    const tryUnmutedPlay = () => {
      video.muted = false;
      return video.play();
    };

    tryUnmutedPlay().catch(() => {
      // Some browsers refuse unmuted autoplay even after a gesture
      // in edge cases — fall back to muted so playback still starts.
      video.muted = true;
      video.play().catch(() => { /* nothing more we can do */ });
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
