// Service and closing artifacts. Black background so the page can screen-blend them over any card.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { TAU, metal, slab, studioLights, studioEnvironment, glowRing, particleField } from "./common.js";

function stage(renderer, camZ = 8.4) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.environment = studioEnvironment(renderer);
  scene.environmentIntensity = 1.35;
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.1, camZ);
  const lights = studioLights(scene);
  const group = new THREE.Group();
  scene.add(group);
  return { scene, camera, lights, group };
}

const CYAN = 0x6ee7ff;
const bodyMaterial = () => metal(0x161c24, 0.26, 0.92);
const faceMaterial = () => metal(0x2b343f, 0.26, 0.9);
const lineMaterial = () => metal(0x46525f, 0.28, 0.9);
const basic = (color = CYAN) => new THREE.MeshBasicMaterial({ color });
const emissive = (color, glow) => new THREE.MeshStandardMaterial({ color, emissive: glow, emissiveIntensity: 0.9, metalness: 0.5, roughness: 0.32 });

function glowSprite(scale, rgb = "110,225,255", opacity = 0.4) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const f = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  f.addColorStop(0, `rgba(${rgb},1)`);
  f.addColorStop(0.3, `rgba(${rgb},0.4)`);
  f.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = f;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
  sprite.scale.setScalar(scale);
  return sprite;
}

const sweep = (scene, lights, a, amount = 0.55) => {
  scene.environmentRotation.y = Math.sin(a) * amount;
  lights.key.position.x = -3.8 + Math.sin(a) * 1.6;
};

/** Create: a fan of graphite frames and a glossy lens orb. */
export function createScene(renderer) {
  const { scene, camera, lights, group } = stage(renderer, 6.9);
  const cards = [-1, 0, 1].map((i) => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(slab(1.15, 1.75, 0.12, 0.12, 0.03), bodyMaterial()));
    const plate = new THREE.Mesh(slab(0.95, 1.5, 0.03, 0.09, 0.012), faceMaterial());
    plate.position.z = 0.075;
    g.add(plate);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), basic());
    dot.position.set(0.32, 0.62, 0.1);
    g.add(dot);
    for (let k = 0; k < 3; k += 1) {
      const line = new THREE.Mesh(slab(0.55 - k * 0.1, 0.045, 0.02, 0.02, 0.005), lineMaterial());
      line.position.set(-0.12 - k * 0.05, -0.38 - k * 0.14, 0.095);
      g.add(line);
    }
    g.userData.i = i;
    group.add(g);
    return g;
  });
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 40), new THREE.MeshStandardMaterial({ color: 0x1b222b, metalness: 1, roughness: 0.1 }));
  group.add(orb);
  const halo = glowSprite(1.35, "110,225,255", 0.3);
  group.add(halo);
  const ring = glowRing(0.74, 0.008, 0.4);
  ring.rotation.set(1.2, 0.3, 0);
  orb.add(ring);
  function update(t) {
    const a = t * TAU;
    cards.forEach((g) => {
      const i = g.userData.i;
      g.position.set(i * 1.18, Math.sin(a + i * 1.4) * 0.13 + 0.1, -Math.abs(i) * 0.18);
      g.rotation.set(0, -i * 0.34 + Math.sin(a) * 0.1, -i * 0.1);
    });
    orb.position.set(Math.cos(a) * 1.55, -0.85 + Math.sin(a * 2) * 0.08, Math.sin(a) * 1.15 + 0.55);
    orb.rotation.y = a;
    halo.position.copy(orb.position);
    group.rotation.y = Math.sin(a) * 0.16;
    group.rotation.x = -0.05 + Math.sin(a + 1) * 0.04;
    sweep(scene, lights, a);
  }
  return { scene, camera, update };
}

/** Build: a layered interface window with a floating button and a cursor that presses it. */
export function buildScene(renderer) {
  const { scene, camera, lights, group } = stage(renderer, 7.4);
  const win = new THREE.Group();
  group.add(win);
  win.add(new THREE.Mesh(slab(2.8, 1.8, 0.12, 0.13, 0.03), bodyMaterial()));
  const bar = new THREE.Mesh(slab(2.6, 0.22, 0.04, 0.06, 0.012), faceMaterial());
  bar.position.set(0, 0.7, 0.085);
  win.add(bar);
  [CYAN, 0xffffff, 0x7b8794].forEach((color, i) => {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), basic(color));
    dot.position.set(-1.12 + i * 0.13, 0.7, 0.12);
    win.add(dot);
  });
  const hero = new THREE.Mesh(slab(1.25, 0.95, 0.06, 0.08, 0.016), emissive(0x16344f, 0x0b3050));
  hero.position.set(-0.65, -0.05, 0.1);
  win.add(hero);
  const sideBlock = new THREE.Mesh(slab(0.85, 0.5, 0.05, 0.06, 0.012), faceMaterial());
  sideBlock.position.set(0.78, 0.2, 0.095);
  win.add(sideBlock);
  [0.62, 0.5, 0.38].forEach((w, i) => {
    const line = new THREE.Mesh(slab(w, 0.05, 0.02, 0.02, 0.005), lineMaterial());
    line.position.set(0.58 + (w - 0.62) / 2, -0.2 - i * 0.12, 0.09);
    win.add(line);
  });
  const button = new THREE.Mesh(slab(0.85, 0.3, 0.1, 0.15, 0.03), emissive(0xdff7ff, 0x3fc8ee));
  group.add(button);
  const arrow = new THREE.Shape();
  arrow.moveTo(0, 0); arrow.lineTo(0, -0.34); arrow.lineTo(0.09, -0.26); arrow.lineTo(0.17, -0.4); arrow.lineTo(0.23, -0.37); arrow.lineTo(0.15, -0.23); arrow.lineTo(0.26, -0.22); arrow.closePath();
  const cursor = new THREE.Mesh(new THREE.ExtrudeGeometry(arrow, { depth: 0.03, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 1 }), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x9fe9ff, emissiveIntensity: 0.5, metalness: 0.2, roughness: 0.3 }));
  group.add(cursor);
  const ripple = glowRing(0.3, 0.012, 0.6);
  group.add(ripple);
  const halo = glowSprite(1.4, "110,225,255", 0.3);
  halo.position.set(0.5, -0.55, 0.5);
  group.add(halo);
  function update(t) {
    const a = t * TAU;
    group.rotation.y = Math.sin(a) * 0.3;
    group.rotation.x = -0.1 + Math.sin(a + 1) * 0.04;
    button.position.set(0.5, -0.62 + Math.sin(a * 2) * 0.05, 0.7);
    button.rotation.set(-0.15, Math.sin(a) * 0.08, 0);
    // The cursor drifts in a small loop and presses the button once per loop (t near 0.5).
    const press = Math.max(0, 1 - Math.abs(t - 0.5) * 9);
    cursor.position.set(0.75 + Math.cos(a) * 0.32, -0.5 + Math.sin(a) * 0.18 - press * 0.06, 0.95 - press * 0.1);
    cursor.rotation.set(0, 0, -0.12);
    const k = Math.max(0, 1 - Math.abs(t - 0.52) * 5);
    ripple.position.set(0.5, -0.62, 0.72);
    ripple.scale.setScalar(0.4 + (1 - k) * 1.2);
    ripple.material.opacity = k * 0.5;
    ripple.visible = k > 0.01;
    sweep(scene, lights, a);
  }
  return { scene, camera, update };
}

/** Automate: a rounded core inside a rotating gear ring, with nodes orbiting on glowing rails. */
export function automateScene(renderer) {
  const { scene, camera, lights, group } = stage(renderer, 7.9);
  const core = new THREE.Mesh(new RoundedBoxGeometry(1.15, 1.15, 1.15, 6, 0.22), bodyMaterial());
  group.add(core);
  const diamondMaterial = basic();
  [[0, 0, 0.585, 0, 0], [0, 0, -0.585, 0, 0], [0.585, 0, 0, 0, Math.PI / 2], [-0.585, 0, 0, 0, Math.PI / 2], [0, 0.585, 0, Math.PI / 2, 0], [0, -0.585, 0, Math.PI / 2, 0]].forEach(([x, y, z, rx, ry]) => {
    const d = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.02), diamondMaterial);
    d.position.set(x, y, z);
    d.rotation.set(rx, ry, Math.PI / 4);
    core.add(d);
  });
  core.add(glowSprite(2.6, "110,225,255", 0.35));
  const gear = new THREE.Group();
  const toothGeometry = new RoundedBoxGeometry(0.22, 0.2, 0.3, 2, 0.04);
  const toothMaterial = bodyMaterial();
  const teeth = 24;
  for (let i = 0; i < teeth; i += 1) {
    const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
    const angle = (i / teeth) * TAU;
    tooth.position.set(Math.cos(angle) * 1.78, Math.sin(angle) * 1.78, 0);
    tooth.rotation.z = angle;
    gear.add(tooth);
  }
  gear.add(new THREE.Mesh(new THREE.TorusGeometry(1.66, 0.045, 16, 160), faceMaterial()));
  gear.rotation.x = 1.15;
  gear.rotation.y = 0.2;
  group.add(gear);
  const rails = [
    { radius: 2.35, tilt: [0.4, 0.9, 0.2], phase: 0.1, turns: 1 },
    { radius: 2.6, tilt: [1.2, -0.5, 0.5], phase: 0.6, turns: -1 },
  ].map((spec) => {
    const ring = glowRing(spec.radius, 0.007, 0.28);
    ring.rotation.set(...spec.tilt);
    group.add(ring);
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 16), emissive(0xbff3ff, 0x2bb7e0));
    group.add(node);
    const halo = glowSprite(0.7, "110,225,255", 0.8);
    group.add(halo);
    return { ...spec, ring, node, halo };
  });
  const tmp = new THREE.Vector3();
  function update(t) {
    const a = t * TAU;
    core.rotation.set(0.45, (t * Math.PI) / 2, 0);
    gear.rotation.z = t * TAU * (2 / teeth);
    group.rotation.y = Math.sin(a) * 0.18;
    group.rotation.x = Math.sin(a + 0.8) * 0.05;
    rails.forEach((rail) => {
      const angle = rail.phase * TAU + a * rail.turns;
      tmp.set(Math.cos(angle) * rail.radius, Math.sin(angle) * rail.radius, 0).applyEuler(rail.ring.rotation);
      rail.node.position.copy(tmp);
      rail.halo.position.copy(tmp);
    });
    sweep(scene, lights, a, 0.5);
  }
  return { scene, camera, update };
}

/** Closing: a luminous core inside three precessing rings. */
export function closingScene(renderer) {
  const { scene, camera, lights, group } = stage(renderer, 7.6);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.42, 64, 40), new THREE.MeshStandardMaterial({ color: 0xdff7ff, emissive: 0x4fd8ff, emissiveIntensity: 1.6, metalness: 0.2, roughness: 0.3 }));
  group.add(core);
  core.add(glowSprite(3.4, "110,225,255", 0.8));
  const specs = [
    { radius: 1.2, tube: 0.02, tilt: 1.15, dir: 1, opacity: 0.55 },
    { radius: 1.65, tube: 0.016, tilt: 0.7, dir: -1, opacity: 0.4 },
    { radius: 2.15, tube: 0.012, tilt: 1.45, dir: 1, opacity: 0.28 },
  ];
  const rings = specs.map((spec) => {
    const pivot = new THREE.Group();
    const ring = glowRing(spec.radius, spec.tube, spec.opacity);
    ring.rotation.x = spec.tilt;
    pivot.add(ring);
    const sat = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 14), emissive(0xdff7ff, 0x2bb7e0));
    pivot.add(sat);
    group.add(pivot);
    return { ...spec, pivot, ring, sat };
  });
  const particles = particleField(90, 9101, 1.6, 2.2);
  group.add(particles);
  const tmp = new THREE.Vector3();
  function update(t) {
    const a = t * TAU;
    rings.forEach((r, i) => {
      r.pivot.rotation.y = a * r.dir;
      tmp.set(Math.cos(a + i * 2) * r.radius, Math.sin(a + i * 2) * r.radius, 0).applyEuler(r.ring.rotation);
      r.sat.position.copy(tmp);
    });
    particles.rotation.y = a;
    group.rotation.x = Math.sin(a) * 0.08;
    core.scale.setScalar(1 + Math.sin(a * 2) * 0.05);
    sweep(scene, lights, a, 0.4);
  }
  return { scene, camera, update };
}
