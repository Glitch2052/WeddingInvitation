/* =========================================================
   Three.js envelope — a genuine lit 3D scene instead of CSS
   transforms. Same visual language and same opening choreography
   as js/envelope.js, but with real geometry, PBR materials, and
   physically-plausible shading/depth.

   Photoreal upgrade path: exactly like the CSS version, dropping
   images into images/envelope/ (back.jpg, front.jpg, flap-outer.jpg,
   flap-inner.jpg) will automatically texture these panels instead
   of the flat colors — see the loadTexture() calls below.
   ========================================================= */
import * as THREE from 'three';

const canvas = document.getElementById('three-canvas');
const screenEl = document.getElementById('envelope-screen');
const sealHit = document.getElementById('seal-hit');
const tapHint = document.getElementById('tap-hint');
const invite = document.getElementById('invite');

let opened = false;

/* ---------- renderer / scene / camera ---------- */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(0, 0, 6.4);
camera.lookAt(0, 0, 0);

function resize() {
  const w = screenEl.clientWidth;
  const h = screenEl.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

/* ---------- lighting ---------- */
const hemi = new THREE.HemisphereLight(0xf4ecd8, 0x1c2314, 0.75);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xfff4de, 1.1);
key.position.set(2.4, 3.2, 4);
scene.add(key);

const fill = new THREE.DirectionalLight(0x8fa06b, 0.35);
fill.position.set(-3, -1.5, 2);
scene.add(fill);

/* ---------- optional photoreal textures ---------- */
const texLoader = new THREE.TextureLoader();
function loadTexture(url, onLoad) {
  texLoader.load(
    url,
    (tex) => { tex.colorSpace = THREE.SRGBColorSpace; onLoad(tex); },
    undefined,
    () => { /* file not found — flat color stays as-is */ }
  );
}

/* ---------- envelope group ---------- */
const envelope = new THREE.Group();
scene.add(envelope);

const W = 3.6, H = 2.4; // envelope footprint

// Back panel
const backMat = new THREE.MeshStandardMaterial({ color: 0x3c4a2c, roughness: 0.85 });
const back = new THREE.Mesh(new THREE.PlaneGeometry(W, H), backMat);
back.position.z = -0.05;
envelope.add(back);
loadTexture('images/envelope/back.jpg', (tex) => { backMat.map = tex; backMat.color.set(0xffffff); backMat.needsUpdate = true; });

// Front pocket (bottom triangle)
function triangleShape(points) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
  shape.closePath();
  return shape;
}
const frontMat = new THREE.MeshStandardMaterial({ color: 0x4e5e3a, roughness: 0.85, side: THREE.FrontSide });
const frontShape = triangleShape([[-W/2, -H/2], [W/2, -H/2], [0, 0.08]]);
const front = new THREE.Mesh(new THREE.ShapeGeometry(frontShape), frontMat);
front.position.z = 0.05;
envelope.add(front);
loadTexture('images/envelope/front.jpg', (tex) => { frontMat.map = tex; frontMat.color.set(0xffffff); frontMat.needsUpdate = true; });

/* ---------- the card (canvas-texture, drawn text) ---------- */
function makeCardTexture(font = 'Georgia, serif') {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 400;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#F6F1E4';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.textAlign = 'center';

  ctx.fillStyle = '#8B9A6E';
  ctx.font = `13px ${font}`;
  ctx.save();
  ctx.letterSpacing = '4px';
  ctx.fillText('TOGETHER WITH THEIR FAMILIES', c.width / 2, 150);
  ctx.restore();

  ctx.fillStyle = '#37432B';
  ctx.font = `italic 600 58px ${font}`;
  ctx.fillText('Girl & Boy', c.width / 2, 225);

  ctx.fillStyle = '#4A5A3A';
  ctx.font = `26px ${font}`;
  ctx.save();
  ctx.letterSpacing = '3px';
  ctx.fillText('24 · NOVEMBER', c.width / 2, 270);
  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const cardMat = new THREE.MeshStandardMaterial({ map: makeCardTexture(), roughness: 0.95 });
const card = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.86, H * 0.8), cardMat);
card.position.set(0, -0.55, 0.02);
envelope.add(card);

// Re-draw the card once the real webfont is ready, for a crisper match
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    cardMat.map = makeCardTexture("'Cormorant Garamond', Georgia, serif");
    cardMat.needsUpdate = true;
  });
}

/* ---------- the flap: genuinely two-sided via backface culling ---------- */
/* Front-facing winding (visible from +z, i.e. closed) and a mirrored
   back winding (visible once folded past 90°, i.e. open) — the exact
   3D equivalent of the CSS backface-visibility trick used before. */
function buildFlapMesh() {
  const A = [-W/2, 0, 0];
  const B = [W/2, 0, 0];
  const C = [0, -H/2 - 0.08, 0];

  const outerMat = new THREE.MeshStandardMaterial({ color: 0x4f5f3a, roughness: 0.85 });
  const innerMat = new THREE.MeshStandardMaterial({ color: 0xd8cfb4, roughness: 0.9 });
  loadTexture('images/envelope/flap-outer.jpg', (tex) => { outerMat.map = tex; outerMat.color.set(0xffffff); outerMat.needsUpdate = true; });
  loadTexture('images/envelope/flap-inner.jpg', (tex) => { innerMat.map = tex; innerMat.color.set(0xffffff); innerMat.needsUpdate = true; });

  // Front face: CCW as seen from +z -> visible when closed, culled once folded away.
  const frontPos = new Float32Array([...A, ...C, ...B]);
  const frontGeo = new THREE.BufferGeometry();
  frontGeo.setAttribute('position', new THREE.BufferAttribute(frontPos, 3));
  frontGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0,1, 0.5,0, 1,1]), 2));
  frontGeo.computeVertexNormals();

  // Back face: reversed winding -> culled when closed, visible once folded open.
  const backPos = new Float32Array([...A, ...B, ...C]);
  const backGeo = new THREE.BufferGeometry();
  backGeo.setAttribute('position', new THREE.BufferAttribute(backPos, 3));
  backGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0,1, 1,1, 0.5,0]), 2));
  backGeo.computeVertexNormals();

  const group = new THREE.Group();
  const frontMesh = new THREE.Mesh(frontGeo, outerMat);
  frontMesh.position.z = 0.001;
  const backMesh = new THREE.Mesh(backGeo, innerMat);
  backMesh.position.z = -0.001;
  group.add(frontMesh, backMesh);
  return group;
}

const flapPivot = new THREE.Group();
flapPivot.position.set(0, H/2, 0.08);
const flapMesh = buildFlapMesh();
flapPivot.add(flapMesh);
envelope.add(flapPivot);

/* ---------- wax seal (canvas-texture disc) ---------- */
function makeSealTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(90, 80, 10, 128, 128, 130);
  grad.addColorStop(0, '#fbf8f0');
  grad.addColorStop(0.55, '#f1ecdf');
  grad.addColorStop(1, '#ddd4bd');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(128, 128, 124, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(74,90,58,0.35)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.arc(128, 128, 104, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#37432B';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = "600 46px Georgia, serif";
  ctx.fillText('G B', 128, 132);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const sealMat = new THREE.MeshStandardMaterial({
  map: makeSealTexture(),
  roughness: 0.5,
  transparent: true
});
loadTexture('images/envelope/seal.png', (tex) => { sealMat.map = tex; sealMat.needsUpdate = true; });
const seal = new THREE.Mesh(new THREE.CircleGeometry(0.34, 40), sealMat);
seal.position.set(0, H/2 - 0.35, 0.12);
envelope.add(seal);

// soft glow behind the seal
const glowMat = new THREE.SpriteMaterial({
  map: (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(211,184,136,0.65)');
    g.addColorStop(1, 'rgba(211,184,136,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })(),
  transparent: true,
  depthWrite: false
});
const glow = new THREE.Sprite(glowMat);
glow.scale.set(1.1, 1.1, 1);
glow.position.copy(seal.position);
glow.position.z -= 0.02;
envelope.add(glow);

/* ---------- idle motion: gentle auto sway + pointer parallax ---------- */
let pointerX = 0, pointerY = 0;
let targetRotX = 0, targetRotY = 0;

screenEl.addEventListener('pointermove', (e) => {
  if (opened) return;
  const r = screenEl.getBoundingClientRect();
  pointerX = (e.clientX - r.left) / r.width - 0.5;
  pointerY = (e.clientY - r.top) / r.height - 0.5;
});
screenEl.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  if (!opened) {
    targetRotY = pointerX * 0.28 + Math.sin(t * 0.6) * 0.03;
    targetRotX = -pointerY * 0.2 + Math.sin(t * 0.4) * 0.015;
    envelope.rotation.y += (targetRotY - envelope.rotation.y) * 0.06;
    envelope.rotation.x += (targetRotX - envelope.rotation.x) * 0.06;
    glow.material.opacity = 0.7 + Math.sin(t * 2.4) * 0.25;
  }

  renderer.render(scene, camera);
}
animate();

/* ---------- open sequence ---------- */
function openEnvelope() {
  if (opened) return;
  opened = true;

  sealHit.disabled = true;
  tapHint.style.opacity = '0';

  const tl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onComplete: revealInvite
  });

  tl.to(envelope.rotation, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' })
    .to(seal.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.15, ease: 'power1.out' })
    .to([seal.position, glow.position], {
      y: '+=0.9', z: '+=0.6', duration: 0.5, ease: 'power2.in'
    }, '-=0.05')
    .to(seal.rotation, { z: 0.9, duration: 0.5 }, '<')
    .to(seal.material, { opacity: 0, duration: 0.4 }, '<0.1')
    .to(glow.material, { opacity: 0, duration: 0.4 }, '<')
    .to(flapPivot.rotation, { x: -Math.PI, duration: 0.95, ease: 'power2.inOut' }, '-=0.2')
    .to(card.position, { y: 1.0, duration: 0.9, ease: 'power3.out' }, '-=0.55')
    .to(camera.position, { z: 7.4, duration: 0.6, ease: 'power1.in' }, '-=0.35')
    .to(screenEl, {
      opacity: 0,
      duration: 0.6,
      ease: 'power1.inOut',
      onStart: () => screenEl.classList.add('hide')
    }, '-=0.15');
}

function revealInvite() {
  invite.classList.add('show');
  invite.setAttribute('aria-hidden', 'false');
  screenEl.remove();
  document.body.style.overflow = '';
  window.dispatchEvent(new CustomEvent('invitation:opened'));
}

document.body.style.overflow = 'hidden';

sealHit.addEventListener('click', openEnvelope);
sealHit.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); }
});
