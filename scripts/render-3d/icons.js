// Section icon tiles: a glossy graphite tile with an embossed glyph. Rendered on a transparent background (alpha=1)
// as single stills, shown above section headings. Same lighting as the hero so they belong together.
import * as THREE from "three";
import { TAU, metal, slab, studioLights, studioEnvironment } from "./common.js";

const glyphMaterial = (glow = 0x2bb7e0, intensity = 0.8) => new THREE.MeshStandardMaterial({ color: 0xe9fbff, emissive: glow, emissiveIntensity: intensity, metalness: 0.35, roughness: 0.28 });

function extrude(shape, depth = 0.1, bevel = 0.025) {
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 12 });
  geometry.center();
  return geometry;
}

function tile(renderer, buildGlyph, { sweep = 0.35, yaw = 0.42, pitch = -0.26 } = {}) {
  const scene = new THREE.Scene();
  scene.environment = studioEnvironment(renderer);
  scene.environmentIntensity = 1.35;
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  camera.position.set(0, 0, 8.4);
  const lights = studioLights(scene);
  const group = new THREE.Group();
  scene.add(group);
  group.add(new THREE.Mesh(slab(2.1, 2.1, 0.5, 0.42, 0.06), metal(0x151a21, 0.24, 0.92)));
  const plate = new THREE.Mesh(slab(1.78, 1.78, 0.06, 0.34, 0.02), metal(0x232b35, 0.22, 0.9));
  plate.position.z = 0.27;
  group.add(plate);
  const glyph = new THREE.Group();
  glyph.position.z = 0.34;
  buildGlyph(glyph);
  group.add(glyph);
  group.rotation.set(pitch, yaw, 0);
  const a = sweep * TAU;
  scene.environmentRotation.y = Math.sin(a) * 0.55;
  lights.key.position.x = -3.8 + Math.sin(a) * 1.6;
  return { scene, camera, update() {} };
}

export function iconWorkScene(renderer) {
  return tile(renderer, (g) => {
    const triangle = new THREE.Shape();
    triangle.moveTo(-0.3, -0.5); triangle.lineTo(0.55, 0); triangle.lineTo(-0.3, 0.5); triangle.closePath();
    const play = new THREE.Mesh(extrude(triangle, 0.14, 0.05), glyphMaterial());
    play.position.set(0.04, 0, 0.1);
    g.add(play);
    const frame = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.028, 12, 96), glyphMaterial(0x2bb7e0, 0.5));
    frame.position.z = 0.02;
    g.add(frame);
  });
}

export function iconServicesScene(renderer) {
  return tile(renderer, (g) => {
    const diamond = new THREE.Shape();
    diamond.moveTo(0, 0.34); diamond.lineTo(0.62, 0); diamond.lineTo(0, -0.34); diamond.lineTo(-0.62, 0); diamond.closePath();
    [-0.42, 0, 0.42].forEach((y, i) => {
      const layer = new THREE.Mesh(extrude(diamond, 0.07, 0.025), i === 2 ? glyphMaterial() : metal(i === 1 ? 0x7e93a4 : 0x46525f, 0.3, 0.9));
      layer.position.set(0, y - 0.04, 0.05 + i * 0.03);
      g.add(layer);
    });
  });
}

export function iconProcessScene(renderer) {
  return tile(renderer, (g) => {
    [0, Math.PI].forEach((rot) => {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.075, 16, 64, Math.PI * 1.35), glyphMaterial());
      arc.rotation.z = rot + 0.3;
      arc.position.z = 0.06;
      g.add(arc);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.3, 24), glyphMaterial());
      const end = rot + 0.3 + Math.PI * 1.35;
      tip.position.set(Math.cos(end) * 0.5, Math.sin(end) * 0.5, 0.06);
      tip.rotation.z = end;
      g.add(tip);
    });
  });
}

export function iconFaqScene(renderer) {
  return tile(renderer, (g) => {
    const bubble = new THREE.Shape();
    const w = 0.7; const h = 0.5; const r = 0.22;
    bubble.moveTo(-w + r, -h); bubble.lineTo(w - r, -h); bubble.quadraticCurveTo(w, -h, w, -h + r); bubble.lineTo(w, h - r);
    bubble.quadraticCurveTo(w, h, w - r, h); bubble.lineTo(-w + r, h); bubble.quadraticCurveTo(-w, h, -w, h - r);
    bubble.lineTo(-w, -h + r); bubble.quadraticCurveTo(-w, -h, -0.45, -h); bubble.lineTo(-0.45, -h); bubble.lineTo(-0.5, -0.78); bubble.lineTo(-0.15, -h); bubble.closePath();
    const shape = new THREE.Mesh(extrude(bubble, 0.1, 0.03), metal(0x8ea2b3, 0.3, 0.9));
    shape.position.set(0, 0.06, 0.06);
    g.add(shape);
    [-0.32, 0, 0.32].forEach((x) => {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 14), glyphMaterial());
      dot.position.set(x, 0.06, 0.2);
      g.add(dot);
    });
  });
}

export function iconEngagementsScene(renderer) {
  return tile(renderer, (g) => {
    [[-0.5, 0.5], [0, 0.9], [0.5, 1.3]].forEach(([x, height], i) => {
      const bar = new THREE.Mesh(slab(0.34, height, 0.14, 0.12, 0.03), i === 2 ? glyphMaterial() : metal(i === 1 ? 0x7e93a4 : 0x46525f, 0.3, 0.9));
      bar.position.set(x, -0.62 + height / 2 - 0.04, 0.08);
      g.add(bar);
    });
  });
}

export const iconScenes = {
  "icon-work": iconWorkScene,
  "icon-services": iconServicesScene,
  "icon-process": iconProcessScene,
  "icon-faq": iconFaqScene,
  "icon-engagements": iconEngagementsScene,
};
