import * as THREE from "three";
import { TAU, metal, slab, studioLights, studioEnvironment, glowBackground, glowRing, satelliteMesh, particleField, pointOnRing } from "./common.js";

/** Fully procedural Z (kept for experiments; the shipped hero uses the hand-made poster below). */
export function heroCgScene(renderer) {
  const scene = new THREE.Scene();
  scene.environment = studioEnvironment(renderer);
  scene.environmentIntensity = 0.9;
  scene.background = glowBackground();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.05, 8.1);
  const world = new THREE.Group();
  scene.add(world);
  const mark = new THREE.Group();
  mark.rotation.set(-0.1, -0.16, -0.06);
  world.add(mark);

  const z = new THREE.Shape();
  z.moveTo(-1.45, 1.18); z.lineTo(1.45, 1.18); z.lineTo(1.45, 0.66); z.lineTo(-0.55, -0.72); z.lineTo(1.45, -0.72);
  z.lineTo(1.45, -1.18); z.lineTo(-1.45, -1.18); z.lineTo(-1.45, -0.66); z.lineTo(0.56, 0.72); z.lineTo(-1.45, 0.72); z.closePath();
  const markGeometry = new THREE.ExtrudeGeometry(z, { depth: 0.44, steps: 1, bevelEnabled: true, bevelThickness: 0.11, bevelSize: 0.09, bevelSegments: 4, curveSegments: 3 });
  markGeometry.center();
  mark.add(new THREE.Mesh(markGeometry, metal(0x0b0d11, 0.3, 0.92)));

  const panelGeometry = slab(0.62, 0.36, 0.15, 0.065, 0.028);
  const layout = [
    [-1.08, 0.93, 0, 0], [-0.36, 0.93, 0, 2], [0.36, 0.93, 0, 1], [1.08, 0.93, 0, 0],
    [-1.08, -0.93, 0, 1], [-0.36, -0.93, 0, 0], [0.36, -0.93, 0, 2], [1.08, -0.93, 0, 1],
    [1.02, 0.53, -0.49, 2], [0.51, 0.27, -0.49, 0], [0, 0, -0.49, 3], [-0.51, -0.27, -0.49, 1], [-1.02, -0.53, -0.49, 0],
  ];
  const colors = [0x090b0e, 0x11151a, 0x1c2027, 0x252b33].map((c) => new THREE.Color(c));
  const armor = new THREE.InstancedMesh(panelGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.26 }), layout.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3(1, 1, 1);
  const p = new THREE.Vector3();
  const zAxis = new THREE.Vector3(0, 0, 1);
  layout.forEach(([x, y, a, c], i) => {
    p.set(x, y, 0.3);
    q.setFromAxisAngle(zAxis, a);
    m.compose(p, q, s);
    armor.setMatrixAt(i, m);
    armor.setColorAt(i, colors[c]);
  });
  mark.add(armor);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(markGeometry, 30), new THREE.LineBasicMaterial({ color: 0x7e8b97, transparent: true, opacity: 0.2 }));
  edges.scale.setScalar(1.008);
  mark.add(edges);

  const lights = studioLights(scene);

  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(2.0, 1), new THREE.MeshBasicMaterial({ color: 0x8fb4de, wireframe: true, transparent: true, opacity: 0.065, blending: THREE.AdditiveBlending, depthWrite: false }));
  world.add(shell);
  world.add(new THREE.Mesh(new THREE.SphereGeometry(2.1, 32, 20), new THREE.MeshBasicMaterial({ color: 0x5de7ff, transparent: true, opacity: 0.03, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })));

  const ringOne = glowRing(2.22, 0.01, 0.2);
  ringOne.rotation.set(1.08, 0.16, 0.18);
  const ringTwo = glowRing(2.46, 0.008, 0.15);
  ringTwo.rotation.set(0.34, 0.92, -0.45);
  world.add(ringOne, ringTwo);

  const sats = [
    { ring: ringOne, radius: 2.22, phase: 0.1, turns: 1, scale: 1.2 },
    { ring: ringOne, radius: 2.22, phase: 0.62, turns: 1, scale: 0.9 },
    { ring: ringTwo, radius: 2.46, phase: 0.3, turns: -1, scale: 1.4 },
    { ring: ringTwo, radius: 2.46, phase: 0.82, turns: -1, scale: 0.9 },
  ].map((spec) => {
    const mesh = satelliteMesh(spec.scale);
    world.add(mesh);
    return { ...spec, mesh };
  });

  const particles = particleField(150, 28411, 2.4, 3.2);
  scene.add(particles);

  function update(t) {
    const a = t * TAU;
    world.rotation.y = -0.06 + Math.sin(a) * 0.34;
    world.rotation.x = -0.03 + Math.sin(a + 1.1) * 0.09;
    mark.rotation.z = -0.06 + Math.sin(a * 2) * 0.018;
    scene.environmentRotation.y = Math.sin(a) * 0.55;
    shell.rotation.y = a;
    shell.rotation.x = Math.sin(a) * 0.2;
    particles.rotation.y = a;
    lights.key.position.x = -3.8 + Math.sin(a) * 2.6;
    lights.key.position.y = 5 + Math.cos(a) * 0.5;
    lights.key.intensity = 8.2 + Math.cos(a - 0.8) * 1.6;
    lights.rim.position.x = 3.8 + Math.cos(a) * 0.9;
    lights.rim.intensity = 5 + Math.sin(a) * 1.4;
    sats.forEach((sat) => { sat.mesh.position.copy(pointOnRing(sat.ring, sat.phase * TAU + a * sat.turns, sat.radius)); });
  }
  return { scene, camera, update };
}

/** Hero loop for phones: the art-directed poster Z (artifacts/hero-z-poster-master.png) with a moving light sweep,
 *  a slight parallax and 3D orbit rings and satellites that pass behind and in front of it. */
export function heroScene(renderer) {
  renderer.localClippingEnabled = true;
  const scene = new THREE.Scene();
  scene.background = glowBackground();
  // The poster plane exactly fills the frame, so the video box can match the poster box on the page.
  const size = 3.5;
  const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 100);
  camera.position.set(0, 0, size / (2 * Math.tan(THREE.MathUtils.degToRad(10))));
  const world = new THREE.Group();
  scene.add(world);
  const uniforms = { uMap: { value: null }, uSweep: { value: -1 }, uGlow: { value: 0 } };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `
      uniform sampler2D uMap; uniform float uSweep; varying vec2 vUv;
      void main(){
        vec4 tex = texture2D(uMap, vUv);
        float diag = vUv.x * 0.62 + (1.0 - vUv.y) * 0.38;
        float band = smoothstep(0.05, 0.0, abs(diag - uSweep));
        float soft = smoothstep(0.16, 0.0, abs(diag - uSweep + 0.03));
        float luma = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
        vec3 sheen = vec3(0.85, 0.95, 1.0) * (band * 0.55 + soft * 0.12) * (0.18 + luma * 1.4);
        gl_FragColor = vec4(tex.rgb + sheen * tex.a, tex.a);
        #include <colorspace_fragment>
      }`,
  });
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
  poster.renderOrder = 1;
  world.add(poster);

  const ringSpecs = [
    { radius: 1.62, tube: 0.008, opacity: 0.4, tilt: [1.08, 0.16, 0.18] },
    { radius: 1.72, tube: 0.006, opacity: 0.3, tilt: [0.34, 0.92, -0.45] },
  ];
  const clip = (normalZ) => [new THREE.Plane(new THREE.Vector3(0, 0, normalZ), 0)];
  const makeRing = (spec, layer) => {
    const ring = glowRing(spec.radius, spec.tube, spec.opacity);
    ring.rotation.set(...spec.tilt);
    ring.material.clippingPlanes = layer === "front" ? clip(1) : clip(-1);
    ring.renderOrder = layer === "front" ? 2 : 0;
    world.add(ring);
    return ring;
  };
  const rings = ringSpecs.map((spec) => ({ spec, back: makeRing(spec, "back"), front: makeRing(spec, "front") }));

  // Faint wire globe (latitudes and meridians) so the phone loop carries the same "planet" as the desktop hero.
  const globeTilt = new THREE.Group();
  globeTilt.rotation.set(0.62, 0, -0.18);
  world.add(globeTilt);
  const globe = new THREE.Group();
  globeTilt.add(globe);
  const globeRadius = 1.7;
  const addGlobeRing = (radius, rotation, y = 0) => {
    ["back", "front"].forEach((layer) => {
      const ring = glowRing(radius, 0.0045, 0.17);
      ring.rotation.set(...rotation);
      ring.position.y = y;
      ring.material.clippingPlanes = layer === "front" ? clip(1) : clip(-1);
      ring.renderOrder = layer === "front" ? 2 : 0;
      globe.add(ring);
    });
  };
  [-0.95, 0, 0.95].forEach((y) => addGlobeRing(Math.sqrt(globeRadius * globeRadius - y * y), [Math.PI / 2, 0, 0], y));
  [0, Math.PI / 4, Math.PI / 2, (Math.PI * 3) / 4].forEach((angle) => addGlobeRing(globeRadius, [0, angle, 0]));

  const glowTexture = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const f = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    f.addColorStop(0, "rgba(200,250,255,1)");
    f.addColorStop(0.25, "rgba(110,225,255,0.45)");
    f.addColorStop(1, "rgba(60,180,255,0)");
    g.fillStyle = f;
    g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const satSpecs = [
    { ring: 0, phase: 0.08, turns: 1, scale: 1 },
    { ring: 0, phase: 0.58, turns: 1, scale: 0.7 },
    { ring: 1, phase: 0.3, turns: -1, scale: 1.25 },
    { ring: 1, phase: 0.8, turns: -1, scale: 0.7 },
  ];
  const sats = satSpecs.map((spec) => {
    const make = (layer) => {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0xffffff, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending }));
      sprite.scale.setScalar(0.3 * spec.scale);
      sprite.renderOrder = layer === "front" ? 3 : 0;
      world.add(sprite);
      return sprite;
    };
    return { ...spec, back: make("back"), front: make("front") };
  });

  const ready = new Promise((resolve, reject) => {
    new THREE.TextureLoader().load("/artifacts/hero-z-poster-master.png", (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      uniforms.uMap.value = texture;
      resolve();
    }, undefined, reject);
  });

  const ease = (x) => x * x * (3 - 2 * x);
  function update(t) {
    const a = t * TAU;
    world.rotation.y = Math.sin(a) * 0.06;
    world.rotation.x = Math.sin(a + 1.1) * 0.025;
    // One sheen pass per loop, then rest, so the first and last frames match.
    const sweepT = Math.min(1, Math.max(0, (t - 0.12) / 0.5));
    uniforms.uSweep.value = -0.2 + ease(sweepT) * 1.45;
    uniforms.uGlow.value = 0.5 + 0.5 * Math.sin(a);
    globe.rotation.y = (t * Math.PI) / 4; // the four meridians repeat every 45 degrees, so this loops seamlessly
    const tmp = new THREE.Vector3();
    sats.forEach((sat) => {
      const r = rings[sat.ring];
      const angle = sat.phase * TAU + a * sat.turns;
      tmp.set(Math.cos(angle) * r.spec.radius, Math.sin(angle) * r.spec.radius, 0).applyEuler(r.back.rotation);
      sat.back.position.copy(tmp);
      sat.front.position.copy(tmp);
      sat.front.visible = tmp.z >= 0;
      sat.back.visible = tmp.z < 0;
    });
  }
  return { scene, camera, update, ready };
}

import { createScene, buildScene, automateScene, closingScene } from "./services.js";
import { iconScenes } from "./icons.js";
export const scenes = { hero: heroScene, heroCg: heroCgScene, create: createScene, build: buildScene, automate: automateScene, closing: closingScene, ...iconScenes };
