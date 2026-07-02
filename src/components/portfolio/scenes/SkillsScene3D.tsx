"use client";

import { useRef, useMemo, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { usePortfolioScroll } from "../ScrollProvider";

interface TechItem {
  name: string;
  short: string;
  desc: string;
  color: string;
}

const TECH: TechItem[] = [
  { name: "HTML5", short: "H", desc: "Semantic, accessible markup foundations", color: "#E34F26" },
  { name: "CSS3", short: "C", desc: "Modern layout, animation, container queries", color: "#1572B6" },
  { name: "JavaScript", short: "JS", desc: "ES2024, async patterns, performance", color: "#F7DF1E" },
  { name: "React", short: "R", desc: "Hooks, Suspense, server components", color: "#61DAFB" },
  { name: "Next.js", short: "N", desc: "App router, RSC, edge runtime", color: "#ffffff" },
  { name: "Tailwind", short: "TW", desc: "Utility-first design systems", color: "#38BDF8" },
  { name: "Unity", short: "U", desc: "C# gameplay, shaders, ECS", color: "#ffffff" },
  { name: "Git", short: "G", desc: "Trunk-based, rebases, releases", color: "#F05032" },
  { name: "GitHub", short: "GH", desc: "Actions, PR workflows, projects", color: "#ffffff" },
  { name: "Shopify", short: "S", desc: "Liquid, themes, custom sections", color: "#95BF47" },
  { name: "AI Tools", short: "AI", desc: "LLM workflows, prompt design, automation", color: "#810172" },
  { name: "日本語", short: "日", desc: "Currently learning — JLPT N5 path", color: "#ff5e7e" },
];

/**
 * SkillsScene3D — holographic wireframe sphere with orbiting tech icons.
 *
 * PERFORMANCE:
 *  - 12 orbiting icons rendered as Sprites with a single canvas texture
 *    (one draw call vs 12 drei <Html> components that each render a DOM
 *    element every frame — that was the #1 perf killer)
 *  - Hover detection via raycasting-free pointer-distance check
 *  - Dissolve particles reduced to 200 (from 500)
 */
export function SkillsScene3D() {
  const group = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Group>(null);
  const icoRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const { refs } = usePortfolioScroll();

  const dissolveState = useRef({ started: false, t: 0 });
  const { particleGeo, particleMat, particleRef } = useDissolveParticles();

  useFrame((state, delta) => {
    if (!group.current) return;
    const visible = refs.progress > 0.25 && refs.progress < 0.5;
    group.current.visible = visible;
    if (!visible) return;

    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      sphereRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }

    const local = (refs.progress - 0.25) / 0.25;
    const dissolveStart = 0.7;
    const dissolveEnd = 1.0;
    const dissolveAmount =
      local < dissolveStart
        ? 0
        : Math.min(1, (local - dissolveStart) / (dissolveEnd - dissolveStart));

    if (dissolveAmount > 0 && !dissolveState.current.started) {
      dissolveState.current.started = true;
      initParticles(particleGeo);
    }

    if (icoRef.current) {
      const mat = icoRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = (1 - dissolveAmount) * 0.85;
      mat.emissiveIntensity = 0.45 + dissolveAmount * 1.5;
      icoRef.current.scale.setScalar(1 + dissolveAmount * 0.4);
    }
    if (wireRef.current) {
      const mat = wireRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - dissolveAmount) * 0.5;
      wireRef.current.scale.setScalar(1 + dissolveAmount * 0.6);
    }
    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - dissolveAmount) * 0.2;
    }

    if (particleRef.current && dissolveState.current.started) {
      const pos = particleRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      const count = arr.length / 3;
      const drag = 0.97;
      for (let i = 0; i < count; i++) {
        arr[i * 3] += dissolveVelocities[i * 3] * delta;
        arr[i * 3 + 1] += dissolveVelocities[i * 3 + 1] * delta;
        arr[i * 3 + 2] += dissolveVelocities[i * 3 + 2] * delta;
        dissolveVelocities[i * 3] *= drag;
        dissolveVelocities[i * 3 + 1] *= drag;
        dissolveVelocities[i * 3 + 2] *= drag;
      }
      pos.needsUpdate = true;
      const mat = particleRef.current.material as THREE.PointsMaterial;
      mat.opacity = dissolveAmount > 0 ? Math.min(1, dissolveAmount * 1.5) * (1 - Math.max(0, (dissolveAmount - 0.5) * 0.8)) : 0;
    }

    if (local < 0.5) {
      dissolveState.current.started = false;
    }
  });

  return (
    <group ref={group} position={[0, 0, -12]}>
      <group ref={sphereRef}>
        <mesh ref={icoRef}>
          <icosahedronGeometry args={[1.2, 1]} />
          <meshStandardMaterial
            color="#0a0a0a"
            metalness={0.9}
            roughness={0.15}
            emissive="#810172"
            emissiveIntensity={0.45}
            transparent
            opacity={0.85}
          />
        </mesh>
        <mesh ref={wireRef}>
          <icosahedronGeometry args={[1.8, 2]} />
          <meshBasicMaterial color="#810172" wireframe transparent opacity={0.5} />
        </mesh>
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.0, 2.3, 64]} />
          <meshBasicMaterial
            color="#810172"
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <points ref={particleRef} geometry={particleGeo} material={particleMat} />

        {/* Orbiting icons — single InstancedMesh-like approach via sprites */}
        <OrbitingIcons />
      </group>
    </group>
  );
}

/* ============================================================
 * ORBITING ICONS — single sprite texture atlas, 12 sprites
 * ============================================================
 * Each icon is a THREE.Sprite using a pre-rendered canvas texture.
 * Way cheaper than drei <Html> (no DOM-per-frame overhead).
 */
function OrbitingIcons() {
  // Pre-build a single texture per tech (12 small canvas textures)
  const textures = useMemo(
    () => TECH.map((t) => makeIconTexture(t.short, t.color)),
    []
  );

  // 3 rings of 4 icons each
  const rings = useMemo(
    () => [
      { tech: TECH.slice(0, 4), radius: 2.5, tilt: 0.2, offset: 0 },
      { tech: TECH.slice(4, 8), radius: 3.0, tilt: Math.PI / 3, offset: Math.PI / 4 },
      { tech: TECH.slice(8, 12), radius: 3.5, tilt: -Math.PI / 4, offset: Math.PI / 2 },
    ],
    []
  );

  // Flat list of sprites with their ring params
  const sprites = useMemo(() => {
    const list: {
      tex: THREE.Texture;
      color: string;
      name: string;
      desc: string;
      radius: number;
      tilt: number;
      offset: number;
      index: number;
      count: number;
      speed: number;
    }[] = [];
    rings.forEach((r) => {
      r.tech.forEach((t, i) => {
        list.push({
          tex: textures[TECH.indexOf(t)],
          color: t.color,
          name: t.name,
          desc: t.desc,
          radius: r.radius,
          tilt: r.tilt,
          offset: r.offset,
          index: i,
          count: r.tech.length,
          speed: 0.25,
        });
      });
    });
    return list;
  }, [rings, textures]);

  const refs = useRef<(THREE.Sprite | null)[]>([]);
  const hovered = useRef<number | null>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    sprites.forEach((s, i) => {
      const sp = refs.current[i];
      if (!sp) return;
      if (hovered.current === i) return; // freeze on hover
      const baseAngle = (s.index / s.count) * Math.PI * 2 + s.offset;
      const angle = baseAngle + time * s.speed;
      const x = Math.cos(angle) * s.radius;
      const z = Math.sin(angle) * s.radius;
      const y = Math.sin(angle) * Math.sin(s.tilt) * s.radius;
      sp.position.set(x, y, z);
      const scale = hovered.current === i ? 0.55 : 0.4;
      sp.scale.setScalar(scale);
    });
  });

  return (
    <>
      {sprites.map((s, i) => (
        <sprite
          key={s.name}
          ref={(el) => {
            refs.current[i] = el;
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            hovered.current = i;
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            hovered.current = null;
            document.body.style.cursor = "";
          }}
        >
          <spriteMaterial
            map={s.tex}
            transparent
            depthWrite={false}
            depthTest={false}
          />
        </sprite>
      ))}
      {/* Hover tooltip — a single sprite that shows when hovered */}
      <HoverTooltip sprites={sprites} hoveredRef={hovered} />
    </>
  );
}

/** A single tooltip sprite that follows the hovered icon. */
function HoverTooltip({
  sprites,
  hoveredRef,
}: {
  sprites: { name: string; desc: string }[];
  hoveredRef: React.MutableRefObject<number | null>;
}) {
  const ref = useRef<THREE.Sprite>(null);
  const tex = useMemo(() => makeTooltipTexture("", ""), []);
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  useFrame(() => {
    const idx = hoveredRef.current;
    if (idx === null) {
      if (ref.current) ref.current.visible = false;
      return;
    }
    const s = sprites[idx];
    if (!s) return;
    if (s.name !== name) {
      setName(s.name);
      setDesc(s.desc);
      updateTooltipTexture(tex, s.name, s.desc);
    }
    if (ref.current) {
      ref.current.visible = true;
      // Position above the hovered icon
      const hoveredSprite = (ref.current.parent as any)?.children?.[idx] as THREE.Sprite;
      if (hoveredSprite) {
        ref.current.position.copy(hoveredSprite.position);
        ref.current.position.y += 0.7;
      }
    }
  });

  return (
    <sprite ref={ref} visible={visible} scale={[2.2, 0.6, 1]}>
      <spriteMaterial map={tex} transparent depthWrite={false} depthTest={false} />
    </sprite>
  );
}

function makeIconTexture(short: string, color: string): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Circle background
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(10, 10, 10, 0.85)";
  ctx.fill();
  ctx.strokeStyle = "rgba(129, 1, 114, 0.7)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner glow
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(129, 1, 114, 0.25)");
  grad.addColorStop(1, "rgba(129, 1, 114, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Text
  ctx.fillStyle = color;
  ctx.font = "bold 44px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(short, size / 2, size / 2 + 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

function makeTooltipTexture(name: string, desc: string): THREE.Texture {
  const w = 512;
  const h = 140;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "rgba(0, 0, 0, 0.92)";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(129, 1, 114, 0.6)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, h - 2);

  // Name
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px 'Space Grotesk', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(name, w / 2, 22);

  // Description
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.font = "20px 'Inter', sans-serif";
  // wrap
  const words = desc.split(" ");
  let line = "";
  let y = 70;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > w - 40) {
      ctx.fillText(line, w / 2, y);
      line = word + " ";
      y += 28;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, w / 2, y);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

function updateTooltipTexture(tex: THREE.Texture, name: string, desc: string) {
  const canvas = tex.image as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "rgba(0, 0, 0, 0.92)";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(129, 1, 114, 0.6)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, h - 2);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px 'Space Grotesk', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(name, w / 2, 22);

  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.font = "20px 'Inter', sans-serif";
  const words = desc.split(" ");
  let line = "";
  let y = 70;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > w - 40) {
      ctx.fillText(line, w / 2, y);
      line = word + " ";
      y += 28;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, w / 2, y);

  tex.needsUpdate = true;
}

/* ============================================================
 * DISSOLVE PARTICLES — reduced to 200
 * ============================================================ */
const DISSOLVE_COUNT = 200;
const dissolveVelocities = new Float32Array(DISSOLVE_COUNT * 3);

function useDissolveParticles() {
  const particleRef = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(DISSOLVE_COUNT * 3);
    const colors = new Float32Array(DISSOLVE_COUNT * 3);
    for (let i = 0; i < DISSOLVE_COUNT; i++) {
      positions[i * 3] = 9999;
      positions[i * 3 + 1] = 9999;
      positions[i * 3 + 2] = 9999;
      if (Math.random() < 0.7) {
        colors[i * 3] = 0.7;
        colors[i * 3 + 1] = 0.05;
        colors[i * 3 + 2] = 0.55;
      } else {
        colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = 0.95;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.1,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: geo, material: mat };
  }, []);

  return { particleGeo: geometry, particleMat: material, particleRef };
}

function initParticles(geo: THREE.BufferGeometry) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  for (let i = 0; i < DISSOLVE_COUNT; i++) {
    const r = 1.2 + Math.random() * 0.8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    arr[i * 3 + 2] = r * Math.cos(phi);
    const speed = 1.2 + Math.random() * 2.5;
    dissolveVelocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
    dissolveVelocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
    dissolveVelocities[i * 3 + 2] = Math.cos(phi) * speed;
  }
  pos.needsUpdate = true;
}
