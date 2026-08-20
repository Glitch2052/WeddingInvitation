/* =========================================================
   WEDDING INVITATION — INTERACTIONS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const opening = document.getElementById("opening");
  const invitation = document.getElementById("invitation");
  const openButton = document.getElementById("openInvitation");
  const music = document.getElementById("bgMusic");
  const musicButton = document.getElementById("musicButton");
  const musicControl = document.querySelector(".music-control");

  let musicStarted = false;

  document.body.classList.add("is-locked");

  async function startMusic() {
    try {
      await music.play();
      musicStarted = true;
      musicControl.classList.add("is-playing");
      musicButton.setAttribute("aria-pressed", "true");
    } catch (error) {
      // Browser may still block audio. The music button remains available.
      musicStarted = false;
    }
  }

  openButton.addEventListener("click", async () => {
    invitation.setAttribute("aria-hidden", "false");
    opening.classList.add("is-closing");

    await startMusic();

    window.setTimeout(() => {
      opening.remove();
      document.body.classList.remove("is-locked");
      window.scrollTo(0, 0);
    }, 1050);
  });

  musicButton.addEventListener("click", async () => {
    if (music.paused) {
      await startMusic();
    } else {
      music.pause();
      musicControl.classList.remove("is-playing");
      musicButton.setAttribute("aria-pressed", "false");
    }
  });

  music.addEventListener("play", () => {
    musicControl.classList.add("is-playing");
    musicButton.setAttribute("aria-pressed", "true");
  });

  music.addEventListener("pause", () => {
    musicControl.classList.remove("is-playing");
    musicButton.setAttribute("aria-pressed", "false");
  });
});


/* =========================================================
   SCROLL-DRIVEN COUPLE SCENE
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("coupleStory");
  if (!section) return;

  const bride = section.querySelector(".bride-placeholder");
  const groom = section.querySelector(".groom-placeholder");
  const heart = section.querySelector(".couple-heart");
  const togetherText = section.querySelector(".couple-together-text");

  let ticking = false;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function updateCoupleScene() {
    const rect = section.getBoundingClientRect();
    const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
    const progress = clamp(-rect.top / travel, 0, 1);

    // Start far apart and meet at the center as the user scrolls.
    const distance = 270 * (1 - progress);
    const scale = 0.88 + progress * 0.12;
    const rotation = (1 - progress) * 2.5;

    bride.style.transform =
      `translate3d(${-distance}px, 0, 0) rotate(${-rotation}deg) scale(${scale})`;

    groom.style.transform =
      `translate3d(${distance}px, 0, 0) rotate(${rotation}deg) scale(${scale})`;

    heart.style.opacity = clamp((progress - 0.55) / 0.35, 0, 1);
    heart.style.transform =
      `translate(-50%, -50%) scale(${0.6 + clamp((progress - 0.55) / 0.45, 0, 1) * 0.4})`;

    togetherText.style.opacity = clamp((progress - 0.72) / 0.28, 0, 1);
    togetherText.style.transform =
      `translateX(-50%) translateY(${20 - clamp((progress - 0.72) / 0.28, 0, 1) * 20}px)`;

    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updateCoupleScene);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  updateCoupleScene();
});
