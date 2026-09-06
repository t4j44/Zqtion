"use client";

import { useEffect, useRef } from "react";
import type {
  BufferGeometry,
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Points,
  PointsMaterial,
  PointLight,
} from "three";
import type { HeroRenderMode } from "@/lib/hero-mode";

type WebGLMode = Extract<HeroRenderMode, "desktop-webgl">;

function disposeScene(root: Object3D) {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  root.traverse((object) => {
    const disposable = object as Object3D & { geometry?: BufferGeometry; material?: Material | Material[] };
    if (disposable.geometry) geometries.add(disposable.geometry);
    const objectMaterials = Array.isArray(disposable.material)
      ? disposable.material
      : disposable.material ? [disposable.material] : [];
    objectMaterials.forEach((material) => materials.add(material));
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}

export default function HeroWebGLScene({
  mode,
  onReady,
  onError,
}: {
  mode: WebGLMode;
  onReady: () => void;
  onError: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let animationFrame = 0;
    let startupTimer = 0;
    let decorationTimer = 0;
    let idleCallback = 0;
    let sceneCleanup = () => undefined;

    const mountScene = async () => {
      try {
        const THREE = await import("three");
        if (disposed) return;
        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: window.devicePixelRatio <= 1.5,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: true,
        });
        const scene = new THREE.Scene();
        sceneCleanup = () => {
          disposeScene(scene);
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.remove();
        };
        renderer.setClearColor(0x050608, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.domElement.className = "hero-3d-webgl-canvas";
        renderer.domElement.setAttribute("aria-hidden", "true");
        host.appendChild(renderer.domElement);

        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
        camera.position.set(0, 0.05, 8.5);
        const world = new THREE.Group();
        scene.add(world);
        const markGroup = new THREE.Group();
        markGroup.rotation.set(-0.1, -0.16, -0.06);
        world.add(markGroup);

        const zShape = new THREE.Shape();
        zShape.moveTo(-1.45, 1.18);
        zShape.lineTo(1.45, 1.18);
        zShape.lineTo(1.45, 0.66);
        zShape.lineTo(-0.55, -0.72);
        zShape.lineTo(1.45, -0.72);
        zShape.lineTo(1.45, -1.18);
        zShape.lineTo(-1.45, -1.18);
        zShape.lineTo(-1.45, -0.66);
        zShape.lineTo(0.56, 0.72);
        zShape.lineTo(-1.45, 0.72);
        zShape.closePath();
        const markGeometry = new THREE.ExtrudeGeometry(zShape, {
          depth: 0.44,
          steps: 1,
          bevelEnabled: true,
          bevelThickness: 0.11,
          bevelSize: 0.09,
          bevelSegments: 3,
          curveSegments: 3,
        });
        markGeometry.center();
        const markMaterial = new THREE.MeshStandardMaterial({ color: 0x0b0d11, metalness: 0.9, roughness: 0.4 });
        markGroup.add(new THREE.Mesh(markGeometry, markMaterial));

        const panelWidth = 0.62;
        const panelHeight = 0.36;
        const panelRadius = 0.065;
        const panelShape = new THREE.Shape();
        panelShape.moveTo(-panelWidth / 2 + panelRadius, -panelHeight / 2);
        panelShape.lineTo(panelWidth / 2 - panelRadius, -panelHeight / 2);
        panelShape.quadraticCurveTo(panelWidth / 2, -panelHeight / 2, panelWidth / 2, -panelHeight / 2 + panelRadius);
        panelShape.lineTo(panelWidth / 2, panelHeight / 2 - panelRadius);
        panelShape.quadraticCurveTo(panelWidth / 2, panelHeight / 2, panelWidth / 2 - panelRadius, panelHeight / 2);
        panelShape.lineTo(-panelWidth / 2 + panelRadius, panelHeight / 2);
        panelShape.quadraticCurveTo(-panelWidth / 2, panelHeight / 2, -panelWidth / 2, panelHeight / 2 - panelRadius);
        panelShape.lineTo(-panelWidth / 2, -panelHeight / 2 + panelRadius);
        panelShape.quadraticCurveTo(-panelWidth / 2, -panelHeight / 2, -panelWidth / 2 + panelRadius, -panelHeight / 2);
        const panelGeometry = new THREE.ExtrudeGeometry(panelShape, {
          depth: 0.15,
          steps: 1,
          bevelEnabled: true,
          bevelThickness: 0.028,
          bevelSize: 0.022,
          bevelSegments: 1,
          curveSegments: 2,
        });
        panelGeometry.center();
        const panelMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.86, roughness: 0.36, vertexColors: true });
        const armorLayout = [
          [-1.08, 0.93, 0, 0], [-0.36, 0.93, 0, 2], [0.36, 0.93, 0, 1], [1.08, 0.93, 0, 0],
          [-1.08, -0.93, 0, 1], [-0.36, -0.93, 0, 0], [0.36, -0.93, 0, 2], [1.08, -0.93, 0, 1],
          [1.02, 0.53, -0.49, 2], [0.51, 0.27, -0.49, 0], [0, 0, -0.49, 3], [-0.51, -0.27, -0.49, 1], [-1.02, -0.53, -0.49, 0],
        ] as const;
        const panelColors = [0x090b0e, 0x11151a, 0x1c2027, 0x252b33].map((color) => new THREE.Color(color));
        const armor = new THREE.InstancedMesh(panelGeometry, panelMaterial, armorLayout.length);
        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const rotation = new THREE.Quaternion();
        const scale = new THREE.Vector3(1, 1, 1);
        const zAxis = new THREE.Vector3(0, 0, 1);
        armorLayout.forEach(([x, y, angle, colorIndex], index) => {
          position.set(x, y, 0.3);
          rotation.setFromAxisAngle(zAxis, angle);
          matrix.compose(position, rotation, scale);
          armor.setMatrixAt(index, matrix);
          armor.setColorAt(index, panelColors[colorIndex]);
        });
        armor.instanceMatrix.needsUpdate = true;
        if (armor.instanceColor) armor.instanceColor.needsUpdate = true;
        markGroup.add(armor);

        const markEdgeMaterial = new THREE.LineBasicMaterial({ color: 0x66717b, transparent: true, opacity: 0.13 });
        const markEdges = new THREE.LineSegments(new THREE.EdgesGeometry(markGeometry, 30), markEdgeMaterial);
        markEdges.scale.setScalar(1.008);
        markGroup.add(markEdges);
        scene.add(new THREE.HemisphereLight(0x2b3444, 0x010203, 0.38));
        const keyLight = new THREE.DirectionalLight(0xffffff, 8.2);
        keyLight.position.set(-3.4, 4.8, 7.2);
        scene.add(keyLight);
        const fillLight = new THREE.PointLight(0x49627e, 1.8, 14, 2);
        fillLight.position.set(0, 0.4, 5.2);
        scene.add(fillLight);
        const rimLight = new THREE.PointLight(0x49c7e8, 5, 9, 2);
        rimLight.position.set(3.8, 0.8, -1.8);
        scene.add(rimLight);

        let orbitOne: Mesh | null = null;
        let orbitTwo: Mesh | null = null;
        let orbitMaterial: MeshBasicMaterial | null = null;
        let orbitTwoMaterial: MeshBasicMaterial | null = null;
        let shell: Mesh | null = null;
        let shellMaterial: MeshBasicMaterial | null = null;
        let planet: Mesh | null = null;
        let planetMaterial: MeshBasicMaterial | null = null;
        let atmosphereMaterial: MeshBasicMaterial | null = null;
        let satellites: Group | null = null;
        let particles: Points<BufferGeometry, PointsMaterial> | null = null;
        let cyanLight: PointLight | null = null;
        let blueLight: PointLight | null = null;

        const createDecorations = () => {
          if (disposed) return;
          planetMaterial = new THREE.MeshBasicMaterial({ color: 0x132550, transparent: true, opacity: 0.018, depthWrite: false, side: THREE.BackSide });
          planet = new THREE.Mesh(new THREE.SphereGeometry(2.05, 28, 18), planetMaterial);
          planet.scale.z = 0.94;
          world.add(planet);
          atmosphereMaterial = new THREE.MeshBasicMaterial({ color: 0x5de7ff, transparent: true, opacity: 0.015, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending });
          const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(2.2, 24, 16), atmosphereMaterial);
          atmosphere.scale.z = 0.94;
          world.add(atmosphere);
          shellMaterial = new THREE.MeshBasicMaterial({ color: 0x7194bd, wireframe: true, transparent: true, opacity: 0.035, blending: THREE.AdditiveBlending });
          shell = new THREE.Mesh(new THREE.IcosahedronGeometry(2.12, 2), shellMaterial);
          world.add(shell);
          orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x70e7ff, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending });
          const orbitSegments = 80;
          orbitOne = new THREE.Mesh(new THREE.TorusGeometry(2.38, 0.018, 6, orbitSegments), orbitMaterial);
          orbitOne.rotation.set(1.08, 0.16, 0.18);
          world.add(orbitOne);
          orbitTwoMaterial = orbitMaterial.clone();
          orbitTwo = new THREE.Mesh(new THREE.TorusGeometry(2.72, 0.012, 6, orbitSegments), orbitTwoMaterial);
          orbitTwo.rotation.set(0.34, 0.92, -0.45);
          world.add(orbitTwo);
          const satelliteGeometry = new THREE.IcosahedronGeometry(0.085, 1);
          const satelliteMaterial = new THREE.MeshStandardMaterial({ color: 0xc6f7ff, emissive: 0x1685a6, emissiveIntensity: 0.8, metalness: 0.4, roughness: 0.24 });
          satellites = new THREE.Group();
          [[-2.26, 0.34, 0.3], [1.7, 1.74, -0.25], [2.18, -1.16, 0.46], [-0.7, -2.36, -0.18]].forEach(([x, y, z], index) => {
            const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
            satellite.position.set(x, y, z);
            satellite.scale.setScalar(index === 1 ? 1.35 : 1);
            satellites?.add(satellite);
          });
          world.add(satellites);
          let randomState = 28411;
          const random = () => {
            randomState = (randomState * 16807) % 2147483647;
            return (randomState - 1) / 2147483646;
          };
          const particleCount = 140;
          const particlePositions = new Float32Array(particleCount * 3);
          for (let index = 0; index < particleCount; index += 1) {
            const radius = 3.2 + random() * 5.8;
            const angle = random() * Math.PI * 2;
            particlePositions[index * 3] = Math.cos(angle) * radius;
            particlePositions[index * 3 + 1] = (random() - 0.5) * 5.5;
            particlePositions[index * 3 + 2] = Math.sin(angle) * radius - 1.5;
          }
          const particleGeometry = new THREE.BufferGeometry();
          particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
          particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0x9ceeff, size: 0.022, transparent: true, opacity: 0.24, sizeAttenuation: true, blending: THREE.AdditiveBlending }));
          scene.add(particles);
          cyanLight = new THREE.PointLight(0x53e3ff, 2, 12, 2);
          cyanLight.position.set(-3.4, -0.8, 4.2);
          scene.add(cyanLight);
          blueLight = new THREE.PointLight(0x5878c8, 1.5, 12, 2);
          blueLight.position.set(3.2, 1.4, 2.2);
          scene.add(blueLight);
        };

        const pointer = { x: 0, y: 0 };
        const target = { x: 0, y: 0 };
        let spotlight = 0;
        let inView = true;
        let pageVisible = !document.hidden;
        let lastRender = 0;
        let activeUntil = performance.now() + 1200;
        const timer = new THREE.Timer();
        timer.connect(document);
        const resize = () => {
          const { width, height } = host.getBoundingClientRect();
          if (width <= 0 || height <= 0) return false;
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
          return true;
        };
        const animate = (timestamp: number) => {
          animationFrame = 0;
          if (!inView || !pageVisible || disposed) return;
          const moving = Math.abs(target.x - pointer.x) + Math.abs(target.y - pointer.y) > 0.008;
          const frameInterval = timestamp < activeUntil || moving || spotlight > 0.02 ? 1000 / 60 : 1000 / 30;
          if (timestamp - lastRender < frameInterval) {
            animationFrame = requestAnimationFrame(animate);
            return;
          }
          lastRender = timestamp;
          timer.update(timestamp);
          const elapsed = timer.getElapsed();
          pointer.x += (target.x - pointer.x) * 0.075;
          pointer.y += (target.y - pointer.y) * 0.075;
          spotlight *= 0.84;
          world.rotation.y = -0.06 + Math.sin(elapsed * 0.34) * 0.1 + pointer.x * 0.34;
          world.rotation.x = -0.025 + Math.sin(elapsed * 0.42) * 0.028 - pointer.y * 0.23;
          world.position.x = pointer.x * 0.18;
          world.position.y = -pointer.y * 0.12;
          markGroup.rotation.y = -0.16 + pointer.x * 0.12;
          markGroup.rotation.z = -0.06 + Math.sin(elapsed * 0.7) * 0.018 - pointer.y * 0.05;
          markEdgeMaterial.opacity = 0.13 + spotlight * 0.08;
          if (orbitOne) orbitOne.rotation.z = 0.18 + elapsed * 0.08;
          if (orbitTwo) orbitTwo.rotation.z = -0.45 - elapsed * 0.055;
          if (shell) { shell.rotation.y = -elapsed * 0.035; shell.rotation.x = elapsed * 0.02; }
          if (planet) planet.rotation.y = elapsed * 0.018;
          if (orbitMaterial) orbitMaterial.opacity = 0.14 + spotlight * 0.04;
          if (orbitTwoMaterial) orbitTwoMaterial.opacity = 0.11 + spotlight * 0.04;
          if (shellMaterial) shellMaterial.opacity = 0.035 + spotlight * 0.015;
          if (planetMaterial) planetMaterial.opacity = 0.018 + spotlight * 0.02;
          if (atmosphereMaterial) atmosphereMaterial.opacity = 0.015 + spotlight * 0.025;
          const reflectionSweep = elapsed * 0.28;
          keyLight.position.x = -3.8 + Math.sin(reflectionSweep) * 0.65 + pointer.x * 2.6;
          keyLight.position.y = 5 + Math.cos(reflectionSweep * 0.7) * 0.45 - pointer.y * 1.4;
          keyLight.intensity = 8.2 + spotlight * 6.8;
          fillLight.intensity = 1.8 + spotlight * 1.2;
          rimLight.position.x = 3.8 + pointer.x * 0.55;
          rimLight.position.y = 0.8 - pointer.y * 0.5;
          rimLight.intensity = 5 + spotlight * 5;
          if (cyanLight) cyanLight.intensity = 2 + spotlight * 2;
          if (blueLight) blueLight.intensity = 1.5 + spotlight;
          if (satellites) satellites.rotation.z = elapsed * 0.065;
          if (particles) particles.rotation.y = elapsed * 0.012;
          renderer.render(scene, camera);
          animationFrame = requestAnimationFrame(animate);
        };
        const startAnimation = () => {
          if (!animationFrame && inView && pageVisible && !disposed) animationFrame = requestAnimationFrame(animate);
        };
        const noteActivity = () => { activeUntil = performance.now() + 850; startAnimation(); };
        const handlePointer = (event: PointerEvent) => {
          const bounds = host.getBoundingClientRect();
          const clamp = (value: number) => Math.min(1, Math.max(-1, value));
          target.x = clamp(((event.clientX - bounds.left) / bounds.width - 0.5) * 2);
          target.y = clamp(((event.clientY - bounds.top) / bounds.height - 0.5) * 2);
          noteActivity();
        };
        const resetPointer = () => { target.x = 0; target.y = 0; noteActivity(); };
        const illuminate = () => { spotlight = 1; noteActivity(); };
        const handleVisibility = () => {
          pageVisible = !document.hidden;
          if (pageVisible) startAnimation();
          else if (animationFrame) cancelAnimationFrame(animationFrame);
          if (!pageVisible) animationFrame = 0;
        };
        const handleContextLoss = (event: Event) => { event.preventDefault(); onError(); };
        const resizeObserver = new ResizeObserver(() => { resize(); noteActivity(); });
        resizeObserver.observe(host);
        const intersectionObserver = new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting;
          if (inView) startAnimation();
          else if (animationFrame) { cancelAnimationFrame(animationFrame); animationFrame = 0; }
        }, { rootMargin: "120px" });
        intersectionObserver.observe(host);
        const interactionSurface = host.parentElement || host;
        interactionSurface.addEventListener("pointermove", handlePointer, { passive: true });
        interactionSurface.addEventListener("click", illuminate);
        interactionSurface.addEventListener("pointerleave", resetPointer, { passive: true });
        interactionSurface.addEventListener("pointercancel", resetPointer, { passive: true });
        document.addEventListener("visibilitychange", handleVisibility);
        renderer.domElement.addEventListener("webglcontextlost", handleContextLoss);
        sceneCleanup = () => {
          if (animationFrame) cancelAnimationFrame(animationFrame);
          if (idleCallback && "cancelIdleCallback" in window) window.cancelIdleCallback(idleCallback);
          window.clearTimeout(decorationTimer);
          resizeObserver.disconnect();
          intersectionObserver.disconnect();
          interactionSurface.removeEventListener("pointermove", handlePointer);
          interactionSurface.removeEventListener("click", illuminate);
          interactionSurface.removeEventListener("pointerleave", resetPointer);
          interactionSurface.removeEventListener("pointercancel", resetPointer);
          document.removeEventListener("visibilitychange", handleVisibility);
          renderer.domElement.removeEventListener("webglcontextlost", handleContextLoss);
          timer.dispose();
          disposeScene(scene);
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.remove();
        };

        if (!resize() || renderer.getContext().isContextLost()) throw new Error("WebGL first frame failed");
        animationFrame = requestAnimationFrame(() => {
          animationFrame = 0;
          if (disposed || renderer.getContext().isContextLost()) return;
          onReady();
          const requestIdle = window.requestIdleCallback?.bind(window);
          if (requestIdle) idleCallback = requestIdle(createDecorations, { timeout: 700 });
          else decorationTimer = window.setTimeout(createDecorations, 180);
          startAnimation();
        });
      } catch {
        sceneCleanup();
        sceneCleanup = () => undefined;
        if (!disposed) onError();
      }
    };

    startupTimer = window.setTimeout(mountScene, 80);
    return () => {
      disposed = true;
      window.clearTimeout(startupTimer);
      sceneCleanup();
    };
  }, [mode, onError, onReady]);

  return <div ref={hostRef} className="absolute inset-0 z-10" />;
}
