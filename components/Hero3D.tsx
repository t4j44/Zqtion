"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type MutableRefObject, type Ref } from "react";
import type { BufferGeometry, Material, Object3D } from "three";
import CapabilityArtifacts from "@/components/CapabilityArtifacts";
import Reveal from "@/components/Reveal";
import SectionIntro from "@/components/SectionIntro";

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation;
};

type JourneyState = {
  phase: number;
  exit: number;
};

function disposeScene(root: Object3D) {
  root.traverse((object) => {
    const disposable = object as Object3D & {
      geometry?: BufferGeometry;
      material?: Material | Material[];
    };

    disposable.geometry?.dispose();
    const materials = Array.isArray(disposable.material)
      ? disposable.material
      : disposable.material
        ? [disposable.material]
        : [];
    materials.forEach((material) => material.dispose());
  });
}

function StaticScene() {
  return (
    <div className="hero-3d-static" aria-hidden="true">
      <div className="hero-3d-static-planet" />
      <div className="hero-3d-static-orbit hero-3d-static-orbit-one" />
      <div className="hero-3d-static-orbit hero-3d-static-orbit-two" />
      <div className="hero-3d-static-mark">
        <div className="hero-3d-static-modules">
          {Array.from({ length: 13 }, (_, index) => (
            <span className="hero-3d-static-module" key={index} />
          ))}
        </div>
      </div>
      <span className="hero-3d-static-node hero-3d-static-node-one" />
      <span className="hero-3d-static-node hero-3d-static-node-two" />
      <span className="hero-3d-static-node hero-3d-static-node-three" />
    </div>
  );
}

function WebGLScene({
  onReady,
  onError,
  journeyStateRef,
}: {
  onReady: () => void;
  onError: () => void;
  journeyStateRef?: MutableRefObject<JourneyState>;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let animationFrame = 0;
    let startTimer = 0;
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
        renderer.setClearColor(0x050608, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.domElement.className = "hero-3d-webgl-canvas";
        renderer.domElement.setAttribute("aria-hidden", "true");
        host.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x050608, 0.075);

        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
        camera.position.set(0, 0.05, 8.5);
        const compactScene = window.matchMedia("(max-width: 767px)").matches;

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
          bevelSegments: 4,
          curveSegments: 4,
        });
        markGeometry.center();

        const markMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x111318,
          metalness: 0.62,
          roughness: 0.3,
          clearcoat: 0.95,
          clearcoatRoughness: 0.2,
          iridescence: 0.08,
          iridescenceIOR: 1.22,
          iridescenceThicknessRange: [110, 240],
        });
        const heroMarkColor = new THREE.Color(0x111318);
        const orbitMarkColor = new THREE.Color(0x718098);
        const mark = new THREE.Mesh(markGeometry, markMaterial);
        markGroup.add(mark);

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
          bevelSegments: 2,
          curveSegments: 3,
        });
        panelGeometry.center();

        const panelMaterials = [
          new THREE.MeshPhysicalMaterial({ color: 0x090a0d, metalness: 0.72, roughness: 0.23, clearcoat: 1, clearcoatRoughness: 0.16 }),
          new THREE.MeshPhysicalMaterial({ color: 0x17191e, metalness: 0.55, roughness: 0.36, clearcoat: 0.72, clearcoatRoughness: 0.26 }),
          new THREE.MeshPhysicalMaterial({ color: 0x22252b, metalness: 0.66, roughness: 0.29, clearcoat: 0.82, clearcoatRoughness: 0.22 }),
          new THREE.MeshPhysicalMaterial({ color: 0x0c161b, emissive: 0x0a3340, emissiveIntensity: 0.12, metalness: 0.6, roughness: 0.32, clearcoat: 0.88, clearcoatRoughness: 0.2 }),
        ];
        const panelHeroColors = panelMaterials.map((material) => material.color.clone());
        const panelOrbitColors = [0x323945, 0x4b5564, 0x627083, 0x234f5b].map((color) => new THREE.Color(color));
        const armorGroup = new THREE.Group();
        const armorLayout = [
          [-1.08, 0.93, 0, 0], [-0.36, 0.93, 0, 2], [0.36, 0.93, 0, 1], [1.08, 0.93, 0, 0],
          [-1.08, -0.93, 0, 1], [-0.36, -0.93, 0, 0], [0.36, -0.93, 0, 2], [1.08, -0.93, 0, 1],
          [1.02, 0.53, -0.49, 2], [0.51, 0.27, -0.49, 0], [0, 0, -0.49, 3], [-0.51, -0.27, -0.49, 1], [-1.02, -0.53, -0.49, 0],
        ] as const;
        armorLayout.forEach(([x, y, rotation, materialIndex]) => {
          const panel = new THREE.Mesh(panelGeometry, panelMaterials[materialIndex]);
          panel.position.set(x, y, 0.3);
          panel.rotation.z = rotation;
          armorGroup.add(panel);
        });
        markGroup.add(armorGroup);

        const markEdgeMaterial = new THREE.LineBasicMaterial({
          color: 0xb5d5df,
          transparent: true,
          opacity: 0.16,
          blending: THREE.AdditiveBlending,
        });
        const markEdges = new THREE.LineSegments(
          new THREE.EdgesGeometry(markGeometry, 28),
          markEdgeMaterial,
        );
        markEdges.scale.setScalar(1.008);
        markGroup.add(markEdges);

        const planetMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x132550,
          transparent: true,
          opacity: 0.012,
          depthWrite: false,
          side: THREE.BackSide,
          metalness: 0.2,
          roughness: 0.48,
          clearcoat: 0.8,
          clearcoatRoughness: 0.34,
        });
        const planet = new THREE.Mesh(new THREE.SphereGeometry(2.05, 36, 24), planetMaterial);
        planet.scale.z = 0.94;
        world.add(planet);

        const atmosphereMaterial = new THREE.MeshBasicMaterial({
          color: 0x5de7ff,
          transparent: true,
          opacity: 0.01,
          depthWrite: false,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
        });
        const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(2.2, 32, 20), atmosphereMaterial);
        atmosphere.scale.z = 0.94;
        world.add(atmosphere);

        const shellMaterial = new THREE.MeshBasicMaterial({
          color: 0x7194bd,
          wireframe: true,
          transparent: true,
          opacity: 0.028,
          blending: THREE.AdditiveBlending,
        });
        const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(2.12, 2), shellMaterial);
        world.add(shell);

        const orbitMaterial = new THREE.MeshBasicMaterial({
          color: 0x70e7ff,
          transparent: true,
          opacity: 0.14,
          blending: THREE.AdditiveBlending,
        });

        const orbitOne = new THREE.Mesh(new THREE.TorusGeometry(2.38, 0.018, 8, 128), orbitMaterial);
        orbitOne.rotation.set(1.08, 0.16, 0.18);
        world.add(orbitOne);

        const orbitTwo = new THREE.Mesh(
          new THREE.TorusGeometry(2.72, 0.012, 8, 128),
          orbitMaterial.clone(),
        );
        const orbitTwoMaterial = orbitTwo.material as InstanceType<typeof THREE.MeshBasicMaterial>;
        orbitTwo.rotation.set(0.34, 0.92, -0.45);
        world.add(orbitTwo);

        const satelliteGeometry = new THREE.IcosahedronGeometry(0.085, 1);
        const satelliteMaterial = new THREE.MeshStandardMaterial({
          color: 0xc6f7ff,
          emissive: 0x1685a6,
          emissiveIntensity: 0.9,
          metalness: 0.45,
          roughness: 0.2,
        });
        const satellites = new THREE.Group();
        [
          [-2.26, 0.34, 0.3],
          [1.7, 1.74, -0.25],
          [2.18, -1.16, 0.46],
          [-0.7, -2.36, -0.18],
        ].forEach(([x, y, z], index) => {
          const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
          satellite.position.set(x, y, z);
          satellite.scale.setScalar(index === 1 ? 1.35 : 1);
          satellites.add(satellite);
        });
        world.add(satellites);

        let randomState = 28411;
        const random = () => {
          randomState = (randomState * 16807) % 2147483647;
          return (randomState - 1) / 2147483646;
        };
        const particleCount = compactScene ? 84 : (navigator.hardwareConcurrency || 4) >= 8 ? 260 : 140;
        const particlePositions = new Float32Array(particleCount * 3);
        for (let index = 0; index < particleCount; index += 1) {
          const radius = 3.2 + random() * 5.8;
          const angle = random() * Math.PI * 2;
          const elevation = (random() - 0.5) * 5.5;
          particlePositions[index * 3] = Math.cos(angle) * radius;
          particlePositions[index * 3 + 1] = elevation;
          particlePositions[index * 3 + 2] = Math.sin(angle) * radius - 1.5;
        }
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
        const particles = new THREE.Points(
          particleGeometry,
          new THREE.PointsMaterial({
            color: 0x9ceeff,
            size: 0.022,
            transparent: true,
            opacity: 0.24,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
          }),
        );
        scene.add(particles);

        const groundShadowMaterial = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: { uOpacity: { value: 0.42 } },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec2 vUv;
            uniform float uOpacity;
            void main() {
              vec2 centered = (vUv - 0.5) * vec2(1.0, 2.35);
              float alpha = smoothstep(0.52, 0.02, length(centered));
              gl_FragColor = vec4(0.0, 0.0, 0.0, alpha * uOpacity);
            }
          `,
        });
        const groundShadow = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 1.45), groundShadowMaterial);
        groundShadow.position.set(0, -1.78, -0.72);
        scene.add(groundShadow);

        scene.add(new THREE.HemisphereLight(0x95a5bd, 0x020304, 0.88));
        const keyLight = new THREE.DirectionalLight(0xffffff, 5.4);
        keyLight.position.set(4, 5, 6);
        scene.add(keyLight);
        const rimLight = new THREE.PointLight(0xc9e6ff, 22, 11, 2);
        rimLight.position.set(-3.8, 2.6, 3.2);
        scene.add(rimLight);
        const cyanLight = new THREE.PointLight(0x53e3ff, 8, 12, 2);
        cyanLight.position.set(-3.4, -0.8, 4.2);
        scene.add(cyanLight);
        const blueLight = new THREE.PointLight(0x5878c8, 11, 12, 2);
        blueLight.position.set(3.2, 1.4, 2.2);
        scene.add(blueLight);

        const pointer = { x: 0, y: 0 };
        const target = { x: 0, y: 0 };
        const timer = new THREE.Timer();
        timer.connect(document);
        let inView = true;
        let pageVisible = !document.hidden;
        let journeyPhase = 0;
        let journeyExit = 0;

        const resize = () => {
          const { width, height } = host.getBoundingClientRect();
          if (width <= 0 || height <= 0) return;
          const mobile = width < 700;
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.05 : 1.5));
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.fov = mobile ? 39 : 34;
          camera.position.z = mobile ? 9.1 : 8.5;
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        };

        const animate = (timestamp: number) => {
          animationFrame = 0;
          if (!inView || !pageVisible || disposed) return;

          timer.update(timestamp);
          const elapsed = timer.getElapsed();
          pointer.x += (target.x - pointer.x) * 0.075;
          pointer.y += (target.y - pointer.y) * 0.075;

          const journeyTarget = journeyStateRef?.current ?? { phase: 0, exit: 0 };
          journeyPhase += (journeyTarget.phase - journeyPhase) * 0.085;
          journeyExit += (journeyTarget.exit - journeyExit) * 0.1;

          world.rotation.y = -0.06 + Math.sin(elapsed * 0.34) * 0.1 + pointer.x * 0.34 + journeyPhase * 0.42;
          world.rotation.x = -0.025 + Math.sin(elapsed * 0.42) * 0.028 - pointer.y * 0.23 + journeyPhase * 0.08;
          world.position.x = pointer.x * 0.18;
          world.position.y = -journeyPhase * 0.08 - pointer.y * 0.12;
          markGroup.rotation.y = -0.16 + journeyPhase * 0.56 + pointer.x * 0.12;
          markGroup.rotation.z = -0.06 + Math.sin(elapsed * 0.7) * 0.018 - journeyPhase * 0.12 - pointer.y * 0.05;
          armorGroup.position.z = 0.01 + journeyPhase * 0.045;
          armorGroup.rotation.y = Math.sin(elapsed * 0.24) * 0.012 + pointer.x * 0.035;
          markMaterial.color.lerpColors(heroMarkColor, orbitMarkColor, journeyPhase * 0.94);
          markMaterial.roughness = 0.3 - journeyPhase * 0.055;
          panelMaterials.forEach((material, index) => {
            material.color.lerpColors(panelHeroColors[index], panelOrbitColors[index], journeyPhase * 0.9);
          });
          orbitOne.rotation.z = 0.18 + elapsed * 0.08;
          orbitTwo.rotation.z = -0.45 - elapsed * 0.055;
          orbitOne.scale.setScalar(1 + journeyPhase * 0.22);
          orbitTwo.scale.setScalar(1 + journeyPhase * 0.13);
          orbitMaterial.opacity = 0.14 + journeyPhase * 0.28;
          orbitTwoMaterial.opacity = 0.11 + journeyPhase * 0.27;
          markEdgeMaterial.opacity = 0.16 + journeyPhase * 0.2;
          shell.rotation.y = -elapsed * 0.035;
          shell.rotation.x = elapsed * 0.02;
          shell.scale.setScalar(1 + journeyPhase * 0.1);
          shellMaterial.opacity = 0.028 + journeyPhase * 0.1;
          planet.rotation.y = elapsed * 0.018;
          planetMaterial.opacity = 0.012 + journeyPhase * 0.17;
          atmosphereMaterial.opacity = 0.01 + journeyPhase * 0.115;
          groundShadow.position.x = pointer.x * 0.08;
          groundShadowMaterial.uniforms.uOpacity.value = 0.42 * (1 - journeyPhase * 0.94) * (1 - journeyExit);
          const reflectionSweep = elapsed * 0.38;
          rimLight.position.x = Math.sin(reflectionSweep) * 4.15;
          rimLight.position.y = 2.15 + Math.cos(reflectionSweep * 0.72) * 1.25;
          rimLight.position.z = 3.5 + Math.cos(reflectionSweep) * 0.55;
          rimLight.intensity = (compactScene ? 25 : 28) + journeyPhase * 24;
          cyanLight.position.x = -3.15 + Math.sin(elapsed * 0.24) * 0.7;
          cyanLight.position.y = -0.7 + Math.cos(elapsed * 0.31) * 0.42;
          cyanLight.intensity = 8 + journeyPhase * 14;
          blueLight.intensity = 11 + journeyPhase * 14;
          satellites.rotation.z = elapsed * 0.065;
          satellites.scale.setScalar(1 + journeyPhase * 0.08);
          particles.rotation.y = elapsed * 0.012;
          particles.material.opacity = (0.24 + journeyPhase * 0.18) * (1 - journeyExit * 0.72);

          renderer.render(scene, camera);
          animationFrame = requestAnimationFrame(animate);
        };

        const startAnimation = () => {
          if (!animationFrame && inView && pageVisible && !disposed) {
            animationFrame = requestAnimationFrame(animate);
          }
        };

        const handlePointer = (event: PointerEvent) => {
          const bounds = host.getBoundingClientRect();
          const strength = event.pointerType === "touch" ? 1.18 : 1;
          const clamp = (value: number) => Math.min(1, Math.max(-1, value));
          target.x = clamp(((event.clientX - bounds.left) / bounds.width - 0.5) * 2) * strength;
          target.y = clamp(((event.clientY - bounds.top) / bounds.height - 0.5) * 2) * strength;
        };

        const resetPointer = () => {
          target.x = 0;
          target.y = 0;
        };

        const handleVisibility = () => {
          pageVisible = !document.hidden;
          if (pageVisible) startAnimation();
          else if (animationFrame) cancelAnimationFrame(animationFrame);
          if (!pageVisible) animationFrame = 0;
        };

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);

        const intersectionObserver = new IntersectionObserver(
          ([entry]) => {
            inView = entry.isIntersecting;
            if (inView) startAnimation();
            else if (animationFrame) {
              cancelAnimationFrame(animationFrame);
              animationFrame = 0;
            }
          },
          { rootMargin: "120px" },
        );
        intersectionObserver.observe(host);

        host.addEventListener("pointermove", handlePointer, { passive: true });
        host.addEventListener("pointerdown", handlePointer, { passive: true });
        host.addEventListener("pointerleave", resetPointer, { passive: true });
        host.addEventListener("pointercancel", resetPointer, { passive: true });
        document.addEventListener("visibilitychange", handleVisibility);

        resize();
        startAnimation();
        onReady();

        sceneCleanup = () => {
          if (animationFrame) cancelAnimationFrame(animationFrame);
          resizeObserver.disconnect();
          intersectionObserver.disconnect();
          host.removeEventListener("pointermove", handlePointer);
          host.removeEventListener("pointerdown", handlePointer);
          host.removeEventListener("pointerleave", resetPointer);
          host.removeEventListener("pointercancel", resetPointer);
          document.removeEventListener("visibilitychange", handleVisibility);
          disposeScene(scene);
          timer.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.remove();
        };
      } catch {
        if (!disposed) onError();
      }
    };

    startTimer = window.setTimeout(mountScene, 120);

    return () => {
      disposed = true;
      window.clearTimeout(startTimer);
      sceneCleanup();
    };
  }, [journeyStateRef, onError, onReady]);

  return <div ref={hostRef} className="absolute inset-0 z-10" />;
}

function SceneStage({
  className = "",
  stageRef,
  webglEnabled,
  sceneReady,
  sceneFailed,
  onReady,
  onError,
  journeyStateRef,
}: {
  className?: string;
  stageRef?: Ref<HTMLDivElement>;
  webglEnabled: boolean;
  sceneReady: boolean;
  sceneFailed: boolean;
  onReady: () => void;
  onError: () => void;
  journeyStateRef?: MutableRefObject<JourneyState>;
}) {
  return (
    <div ref={stageRef} className={`hero-3d-stage ${sceneReady ? "hero-3d-scene-ready" : ""} ${className}`}>
      <div className="hero-3d-stage-grid" aria-hidden="true" />
      <StaticScene />
      {webglEnabled && !sceneFailed ? (
        <WebGLScene onReady={onReady} onError={onError} journeyStateRef={journeyStateRef} />
      ) : null}
      <div className={`hero-3d-vignette ${sceneReady ? "opacity-100" : "opacity-70"}`} aria-hidden="true" />
      <div className="hero-3d-label hero-3d-label-create"><span />Create</div>
      <div className="hero-3d-label hero-3d-label-build"><span />Build</div>
      <div className="hero-3d-label hero-3d-label-automate"><span />Automate</div>
    </div>
  );
}

export default function Hero3D() {
  const reducedMotion = useReducedMotion();
  const [webglEnabled, setWebglEnabled] = useState(false);
  const [persistentJourney, setPersistentJourney] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const operatingRef = useRef<HTMLElement>(null);
  const persistentStageRef = useRef<HTMLDivElement>(null);
  const journeyStateRef = useRef<JourneyState>({ phase: 0, exit: 0 });

  useEffect(() => {
    const connection = (navigator as NavigatorWithConnection).connection;
    const saveData = Boolean(connection?.saveData);
    const slowNetwork = connection?.effectiveType === "2g" || connection?.effectiveType === "slow-2g";
    const compactQuery = window.matchMedia("(max-width: 639px)");

    const updateMode = () => {
      const veryLowPowerMobile = compactQuery.matches && (navigator.hardwareConcurrency || 4) <= 2;
      const motionAllowed = !reducedMotion && !saveData && !slowNetwork && !veryLowPowerMobile;
      setWebglEnabled(motionAllowed);
      setPersistentJourney(motionAllowed);
    };

    const frame = requestAnimationFrame(updateMode);
    compactQuery.addEventListener("change", updateMode);

    return () => {
      cancelAnimationFrame(frame);
      compactQuery.removeEventListener("change", updateMode);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const stage = persistentStageRef.current;
    const operatingSection = operatingRef.current;
    if (!persistentJourney || !stage || !operatingSection) {
      journeyStateRef.current = { phase: 0, exit: 0 };
      return;
    }

    let frame = 0;
    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const smoothstep = (value: number) => value * value * (3 - 2 * value);

    const updateJourney = () => {
      frame = 0;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const compactJourney = viewportWidth < 1024;
      const bounds = operatingSection.getBoundingClientRect();
      const entering = clamp((viewportHeight * 0.92 - bounds.top) / (viewportHeight * 0.76));
      const phase = smoothstep(entering);
      const leaving = clamp((viewportHeight * 0.88 - bounds.bottom) / (viewportHeight * 0.62));
      const exit = smoothstep(leaving);
      const compactLift = Math.min(
        viewportHeight * 0.48,
        420,
        246 + Math.max(0, viewportWidth - 390) * 0.7,
      );
      const x = phase * (compactJourney ? Math.min(viewportWidth * 0.18, 72) : Math.min(viewportWidth * 0.045, 58));
      const y = phase * (compactJourney ? -compactLift : Math.min(viewportHeight * 0.13, 96));
      const scale = 1 - phase * (compactJourney ? 0.46 : 0.42);
      const opacity = Math.max(0, (1 - exit) * (1 - phase * (compactJourney ? 0.38 : 0.28)));

      journeyStateRef.current = { phase, exit };
      stage.style.setProperty("--journey-phase", phase.toFixed(4));
      stage.style.setProperty("--journey-exit", exit.toFixed(4));
      stage.style.setProperty("--journey-grid-opacity", (1 - phase).toFixed(4));
      stage.style.setProperty("--journey-vignette-opacity", (1 - phase * 0.9).toFixed(4));
      stage.style.setProperty("--journey-label-opacity", (1 - phase).toFixed(4));
      stage.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      stage.style.opacity = opacity.toFixed(4);
      stage.style.filter = exit > 0 ? `blur(${(exit * 5).toFixed(2)}px)` : "none";
      stage.style.visibility = exit > 0.995 ? "hidden" : "visible";
      stage.classList.toggle("journey-interactive", exit < 0.85);
    };

    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(updateJourney);
    };

    updateJourney();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      journeyStateRef.current = { phase: 0, exit: 0 };
    };
  }, [persistentJourney]);

  const handleReady = useCallback(() => setSceneReady(true), []);
  const handleError = useCallback(() => setSceneFailed(true), []);

  return (
    <div className="hero-journey relative isolate bg-[#050608]">
      {persistentJourney ? (
        <div className="hero-journey-visual absolute inset-0 z-10" aria-hidden="true">
          <div className="hero-journey-pin sticky top-0 h-svh overflow-hidden">
            <SceneStage
              className="hero-journey-stage"
              stageRef={persistentStageRef}
              webglEnabled={webglEnabled}
              sceneReady={sceneReady}
              sceneFailed={sceneFailed}
              onReady={handleReady}
              onError={handleError}
              journeyStateRef={journeyStateRef}
            />
          </div>
        </div>
      ) : null}

      <section className="hero-3d relative min-h-svh overflow-hidden border-b border-white/10" aria-label="Zqtion introduction">
        <div className="signal-grid absolute inset-0 opacity-35" aria-hidden="true" />
        <div className="hero-3d-glow hero-3d-glow-blue" aria-hidden="true" />
        <div className="hero-3d-glow hero-3d-glow-cyan" aria-hidden="true" />

        <div className="section-shell grid min-h-svh items-center gap-8 pb-12 pt-28 lg:grid-cols-[1.04fr_0.96fr] lg:gap-4 lg:pb-16 lg:pt-28">
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-30"
          >
            <p className="eyebrow hero-eyebrow"><span>AI execution company · Working globally</span></p>
            <h1 className="hero-headline mt-6 max-w-5xl text-balance text-white">
              <span className="hero-headline-primary">Create what gets noticed.</span>
              <span className="font-editorial hero-headline-accent">Build what gets used.</span>
            </h1>
            <p className="hero-description mt-7 max-w-2xl text-pretty text-base leading-7 text-white/62 sm:text-lg sm:leading-8">
              Zqtion turns ambitious ideas into campaign-ready creative, focused digital products, and practical AI systems.
            </p>
            <div className="hero-actions mt-8 flex flex-wrap gap-3">
              <Link href="/work" className="button-primary">Explore the work <ArrowUpRight className="h-4 w-4" /></Link>
              <Link href="/contact" className="button-secondary">Start a project</Link>
            </div>
            <div className="hero-capability-list mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[0.67rem] font-semibold uppercase tracking-[0.16em] text-white/35">
              <span>Creative systems</span>
              <span>Digital products</span>
              <span>AI automation</span>
            </div>
          </motion.div>

          {persistentJourney ? (
            <div className="hero-3d-placeholder" aria-hidden="true" />
          ) : (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-20 mx-auto w-full max-w-[46rem]"
            >
              <SceneStage
                className="hero-3d-local-stage"
                webglEnabled={webglEnabled}
                sceneReady={sceneReady}
                sceneFailed={sceneFailed}
                onReady={handleReady}
                onError={handleError}
              />
            </motion.div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 hidden justify-center lg:flex" aria-hidden="true">
          <span className="flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-white/28">
            Scroll to explore <ArrowDown className="h-3.5 w-3.5" />
          </span>
        </div>
      </section>

      <section className="relative z-20 border-y border-white/10 bg-[#050608]/92 backdrop-blur-sm">
        <div className="section-shell flex flex-col gap-4 py-6 text-xs font-semibold uppercase tracking-[0.16em] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <span>Founder-led</span><span>Creative production</span><span>Web products</span><span>AI automation</span><span>Remote collaboration</span>
        </div>
      </section>

      <section ref={operatingRef} className="hero-operating-section section-shell section-pad relative z-20">
        <Reveal>
          <SectionIntro
            eyebrow="The operating model"
            title={<>One company across the gap between <span className="font-editorial font-normal italic text-white/90">idea and execution.</span></>}
            description="Most teams do not need another strategy deck or a disconnected production vendor. They need a small, senior execution loop that can create the signal, build the experience, and automate what repeats."
          />
        </Reveal>
        <CapabilityArtifacts />
      </section>
    </div>
  );
}
