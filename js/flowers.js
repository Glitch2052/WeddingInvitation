/* =========================================================
   WEDDING INVITATION — CONSTANT FALLING FLOWERS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const layer = document.getElementById("flowerLayer");
  if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const mobile = window.matchMedia("(max-width: 700px)").matches;
  const count = mobile ? 22 : 34;

  const flowerTypes = [
    { type: "petal", color: "#efb5c1" },
    { type: "petal", color: "#f6cfd7" },
    { type: "petal", color: "#e7a7b4" },
    { type: "petal", color: "#f3d2c7" },
    { type: "daisy", color: "#fffdf8", center: "#e7a94b" },
    { type: "daisy", color: "#f9d7df", center: "#e7a94b" },
    { type: "daisy", color: "#ffdca0", center: "#d89539" },
    { type: "daisy", color: "#e8f3e8", center: "#d89539" }
  ];

  for (let i = 0; i < count; i++) {
    const config = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
    const flower = document.createElement("span");

    flower.className = `falling-flower ${config.type}`;
    flower.style.left = `${Math.random() * 100}%`;
    flower.style.setProperty("--size", `${8 + Math.random() * (config.type === "daisy" ? 14 : 12)}px`);
    flower.style.setProperty("--duration", `${8 + Math.random() * 10}s`);
    flower.style.setProperty("--delay", `${-(Math.random() * 12)}s`);
    flower.style.setProperty("--drift", `${-100 + Math.random() * 200}px`);
    flower.style.setProperty("--sway", `${15 + Math.random() * 45}px`);
    flower.style.setProperty("--rotation", `${Math.random() * 360}deg`);
    flower.style.setProperty("--opacity", `${0.45 + Math.random() * 0.42}`);
    flower.style.setProperty("--flower-color", config.color);

    if (config.center) {
      flower.style.setProperty("--flower-center", config.center);
    }

    layer.appendChild(flower);
  }
});
