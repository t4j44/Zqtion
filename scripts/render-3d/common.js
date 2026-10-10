// Shared helpers for the offline 3D renders (see README.md). Every scene is a pure function of loop time t in [0, 1)
// so the output loops seamlessly.
import * as THREE from "three";

export const TAU = Math.PI * 2;

export function createRenderer(size, alpha = false) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(1);
  renderer.setSize(size, size, false);
  renderer.setClearColor(alpha ? 0x000000 : 0x050608, alpha ? 0 : 1); // opaque frames match the site background (#050608)
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  document.body.appendChild(renderer.domElement);
  return renderer;
}

export function roundedRectShape(width, height, radius) {
  const shape = new THREE.Shape();
  const w = width / 2;
  const h = height / 2;
  shape.moveTo(-w + radius, -h);
  shape.lineTo(w - radius, -h);
  shape.quadraticCurveTo(w, -h, w, -h + radius);
  shape.lineTo(w, h - radius);
  shape.quadraticCurveTo(w, h, w - radius, h);
  shape.lineTo(-w + radius, h);
  shape.quadraticCurveTo(-w, h, -w, h - radius);
  shape.lineTo(-w, -h + radius);
  shape.quadraticCurveTo(-w, -h, -w + radius, -h);
  return shape;
}

export function slab(width, height, depth, radius = 0.06, bevel = 0.025) {
  const geometry = new THREE.ExtrudeGeometry(roundedRectShape(width, height, radius), {
    depth,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.8,
    bevelSegments: 2,
    curveSegments: 4,
  });
  geometry.center();
  return geometry;
}

export function metal(color, roughness = 0.38, metalness = 0.88) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

/** Same lighting rig as the live desktop hero, so the renders match the site. */
export function studioLights(scene) {
  scene.add(new THREE.HemisphereLight(0x2b3444, 0x010203, 0.38));
  const key = new THREE.DirectionalLight(0xffffff, 8.2);
  key.position.set(-3.4, 4.8, 7.2);
  scene.add(key);
  const fill = new THREE.PointLight(0x49627e, 1.8, 14, 2);
  fill.position.set(0, 0.4, 5.2);
  scene.add(fill);
  const rim = new THREE.PointLight(0x49c7e8, 5, 9, 2);
  rim.position.set(3.8, 0.8, -1.8);
  scene.add(rim);
  const cyan = new THREE.PointLight(0x53e3ff, 2, 12, 2);
  cyan.position.set(-3.4, -0.8, 4.2);
  scene.add(cyan);
  const blue = new THREE.PointLight(0x5878c8, 1.5, 12, 2);
  blue.position.set(3.2, 1.4, 2.2);
  scene.add(blue);
  return { key, fill, rim, cyan, blue };
}

export function glowRing(radius, tube, opacity = 0.2, color = 0x70e7ff) {
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
  return new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, 160), material);
}

export function satelliteMesh(scale = 1) {
  return new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.085 * scale, 2),
    new THREE.MeshStandardMaterial({ color: 0xc6f7ff, emissive: 0x1ab4de, emissiveIntensity: 1.1, metalness: 0.4, roughness: 0.24 }),
  );
}

export function particleField(count = 160, seed = 28411, inner = 2.6, spread = 4.5) {
  let state = seed;
  const random = () => { state = (state * 16807) % 2147483647; return (state - 1) / 2147483646; };
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const radius = inner + random() * spread;
    const angle = random() * TAU;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (random() - 0.5) * 5.2;
    positions[i * 3 + 2] = Math.sin(angle) * radius - 1.5;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x9ceeff, size: 0.03, transparent: true, opacity: 0.32, sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false }));
}

/** Point on a ring that has been tilted like the torus mesh it belongs to. */
export function pointOnRing(ring, angle, radius) {
  const v = new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
  return v.applyEuler(ring.rotation).add(ring.position);
}

/** Dark studio: a gradient backdrop plus narrow soft boxes behind the camera. The sweep strips cross the mirror
 *  direction as the environment rotates, so a glint travels across the panels one after another. */
export function studioEnvironment(renderer) {
  const room = new THREE.Scene();
  room.add(new THREE.Mesh(new THREE.BoxGeometry(40, 40, 40), new THREE.MeshBasicMaterial({ color: 0x03050a, side: THREE.BackSide })));
  const gradient = document.createElement("canvas");
  gradient.width = 4;
  gradient.height = 256;
  const g = gradient.getContext("2d");
  const fill = g.createLinearGradient(0, 0, 0, 256);
  fill.addColorStop(0, "#56677d");
  fill.addColorStop(0.45, "#1c2530");
  fill.addColorStop(1, "#05070b");
  g.fillStyle = fill;
  g.fillRect(0, 0, 4, 256);
  const gradientTexture = new THREE.CanvasTexture(gradient);
  gradientTexture.colorSpace = THREE.SRGBColorSpace;
  const place = (mesh, x, y, z) => { mesh.position.set(x, y, z); mesh.lookAt(0, 0, 0); room.add(mesh); };
  place(new THREE.Mesh(new THREE.PlaneGeometry(30, 18), new THREE.MeshBasicMaterial({ map: gradientTexture, color: 0x6c7684, side: THREE.DoubleSide })), 0, 1, 13);
  const strip = (w, h, x, y, z, color, intensity) => place(new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide })), x, y, z);
  strip(0.9, 16, -4.5, 1, 12, 0xffffff, 6);
  strip(0.7, 16, 4.0, 1, 12, 0xbfeaff, 4);
  strip(14, 0.9, 0, 7, 11, 0xffffff, 3);
  strip(6, 3, -9, 6, 6, 0xffffff, 2.5);
  const generator = new THREE.PMREMGenerator(renderer);
  const texture = generator.fromScene(room, 0.02).texture;
  generator.dispose();
  return texture;
}

/** Soft blue glow on the site background colour, matching the hero stage glow behind the Z. */
export function glowBackground() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const g = canvas.getContext("2d");
  const fill = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  fill.addColorStop(0, "rgb(10, 14, 26)");
  fill.addColorStop(0.7, "rgb(5, 6, 8)");
  fill.addColorStop(1, "rgb(5, 6, 8)");
  g.fillStyle = fill;
  g.fillRect(0, 0, 512, 512);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
