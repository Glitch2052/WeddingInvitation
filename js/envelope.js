/* =========================================================
   Envelope open sequence
   Tap the wax seal -> seal breaks -> flap folds open ->
   card slides up and out -> envelope screen fades away ->
   main invitation is revealed.
   ========================================================= */
(function () {
  const seal = document.getElementById('seal');
  const envelopeScreen = document.getElementById('envelope-screen');
  const envelope = document.getElementById('envelope');
  const flap = envelope.querySelector('.env-flap');
  const card = envelope.querySelector('.env-card');
  const tapHint = document.getElementById('tap-hint');
  const invite = document.getElementById('invite');

  let opened = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;

    seal.disabled = true;
    tapHint.style.opacity = '0';

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: revealInvite
    });

    // seal cracks and drops away
    tl.to(seal, {
      scale: 1.15,
      duration: 0.15,
      ease: 'power1.out'
    })
    .to(seal, {
      y: 40,
      opacity: 0,
      rotate: 25,
      scale: 0.6,
      duration: 0.45,
      ease: 'power2.in'
    }, '-=0.05')
    // flap folds backward like a real envelope
    .to(flap, {
      rotateX: -178,
      duration: 0.9,
      ease: 'power2.inOut'
    }, '-=0.15')
    // card rises out of the envelope
    .to(card, {
      y: '-92%',
      duration: 0.9,
      ease: 'power3.out'
    }, '-=0.55')
    // whole scene fades to reveal the site beneath
    .to(envelope.parentElement, {
      scale: 1.08,
      duration: 0.6,
      ease: 'power1.in'
    }, '-=0.3')
    .to(envelopeScreen, {
      opacity: 0,
      duration: 0.7,
      ease: 'power1.inOut',
      onStart: () => envelopeScreen.classList.add('hide')
    }, '-=0.2');
  }

  function revealInvite() {
    invite.classList.add('show');
    invite.setAttribute('aria-hidden', 'false');
    envelopeScreen.remove();
    document.body.style.overflow = '';
    window.dispatchEvent(new CustomEvent('invitation:opened'));
  }

  // lock scroll while envelope is showing
  document.body.style.overflow = 'hidden';

  // Subtle pointer/gyroscope-style tilt on the closed envelope —
  // purely decorative, gives it a "reach out and touch it" feel.
  const stage = document.getElementById('envelope-stage');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches === false) {
    stage.addEventListener('pointermove', (e) => {
      if (opened) return;
      const rect = stage.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(envelope, {
        rotateY: px * 14,
        rotateX: -py * 10,
        duration: 0.6,
        ease: 'power2.out'
      });
    });
    stage.addEventListener('pointerleave', () => {
      if (opened) return;
      gsap.to(envelope, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'power3.out' });
    });
  }

  seal.addEventListener('click', openEnvelope);
  seal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openEnvelope();
    }
  });
})();
