import React, { useEffect, useRef } from 'react';
import { SentimentType } from '../types';

interface WaterCanvasProps {
  sentiment: SentimentType;
  coherence: number; // 0 to 100
  isListening: boolean;
  onCanvasClick?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  baseRadius: number;
  radius: number;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
  fractureAngle: number;
  jaggedSeeds: number[];
  crystallinity: number; // 0: brown distortion, 0.5: light-blue fluid, 1: blue snowflake
  targetCrystallinity: number;
  sparklePhase: number;
}

interface SnowFlurryParticle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  opacity: number;
  rotation: number;
  rotSpeed: number;
  twinkle: number;
}

export const WaterCanvas: React.FC<WaterCanvasProps> = ({
  sentiment,
  coherence,
  isListening,
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const flurryRef = useRef<SnowFlurryParticle[]>([]);
  const ripplesRef = useRef<{ x: number; y: number; r: number; maxR: number; alpha: number }[]>([]);
  const targetCrystallinityRef = useRef<number>(sentiment === 'positive' ? 1.0 : sentiment === 'neutral' ? 0.5 : 0.0);
  const sentimentRef = useRef<SentimentType>(sentiment);
  const isListeningRef = useRef<boolean>(isListening);
  const coherenceRef = useRef<number>(coherence);

  useEffect(() => {
    sentimentRef.current = sentiment;
    isListeningRef.current = isListening;
    coherenceRef.current = coherence;

    if (sentiment === 'positive') {
      targetCrystallinityRef.current = 1.0;
    } else if (sentiment === 'neutral') {
      targetCrystallinityRef.current = 0.5;
    } else {
      targetCrystallinityRef.current = 0.0;
    }
  }, [sentiment, isListening, coherence]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const PARTICLE_COUNT = 44;
    const FLURRY_COUNT = 36;

    function initParticles() {
      const parts: Particle[] = [];
      const initTarget = targetCrystallinityRef.current;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        parts.push({
          id: i,
          x: Math.random() * width,
          y: Math.random() * height,
          baseRadius: 16 + Math.random() * 26,
          radius: 16 + Math.random() * 26,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -0.25 - Math.random() * 0.45,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.007,
          opacity: 0.35 + Math.random() * 0.55,
          fractureAngle: (Math.random() - 0.5) * 1.6,
          jaggedSeeds: Array.from({ length: 9 }, () => Math.random() * 0.7 + 0.65),
          crystallinity: initTarget,
          targetCrystallinity: initTarget,
          sparklePhase: Math.random() * Math.PI * 2,
        });
      }
      particlesRef.current = parts;

      // Ambient snow flurry micro-particles for the snowflake effect
      const flurries: SnowFlurryParticle[] = [];
      for (let i = 0; i < FLURRY_COUNT; i++) {
        flurries.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: 2 + Math.random() * 5.5,
          vx: (Math.random() - 0.5) * 0.4,
          vy: 0.3 + Math.random() * 0.6,
          opacity: 0.2 + Math.random() * 0.6,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.015,
          twinkle: Math.random() * Math.PI * 2,
        });
      }
      flurryRef.current = flurries;
    }

    function handleResize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', handleResize);
    initParticles();

    let lastTime = performance.now();

    function render(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      // Ripple effects from user touch/tap
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const rip = ripplesRef.current[i];
        rip.r += 65 * dt;
        rip.alpha -= 0.6 * dt;
        if (rip.alpha <= 0 || rip.r >= rip.maxR) {
          ripplesRef.current.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        // Ripple tint matching current mode
        const ripCol =
          targetCrystallinityRef.current >= 0.75
            ? '59, 130, 246' // Blue ripple
            : targetCrystallinityRef.current >= 0.35
            ? '56, 189, 248' // Light blue ripple
            : '146, 64, 14'; // Brown ripple
        ctx.strokeStyle = `rgba(${ripCol}, ${Math.max(0, rip.alpha * 0.4)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      const currentTarget = targetCrystallinityRef.current;
      const listening = isListeningRef.current;
      const pulseSpeed = listening ? 4.2 : 1.2;

      // Render Ambient Snow Flurry Effect when in Positive (or transitioning to Positive)
      // Snowflakes gently falling and drifting with crystalline sparkles
      const flurryWeight = Math.max(0, (currentTarget - 0.3) / 0.7);
      if (flurryWeight > 0.05) {
        const flurries = flurryRef.current;
        for (let i = 0; i < flurries.length; i++) {
          const fl = flurries[i];
          fl.y += fl.vy * (1 + (listening ? 0.8 : 0));
          fl.x += fl.vx + Math.sin(now * 0.0015 + i) * 0.4;
          fl.rotation += fl.rotSpeed;
          fl.twinkle += dt * 3.5;

          if (fl.y > height + 20) {
            fl.y = -20;
            fl.x = Math.random() * width;
          }

          const currentAlpha = fl.opacity * flurryWeight * (0.6 + 0.4 * Math.sin(fl.twinkle));
          ctx.save();
          ctx.translate(fl.x, fl.y);
          ctx.rotate(fl.rotation);

          // Draw delicate miniature snowflake / ice crystal star
          ctx.strokeStyle = `rgba(59, 130, 246, ${currentAlpha * 0.85})`;
          ctx.fillStyle = `rgba(191, 219, 254, ${currentAlpha * 0.4})`;
          ctx.lineWidth = 0.8;

          const s = fl.size;
          ctx.beginPath();
          for (let arm = 0; arm < 6; arm++) {
            const angle = (Math.PI / 3) * arm;
            const ax = Math.cos(angle) * s;
            const ay = Math.sin(angle) * s;
            ctx.moveTo(0, 0);
            ctx.lineTo(ax, ay);

            // Miniature dendrite tick
            const hx = ax * 0.6;
            const hy = ay * 0.6;
            const tickL = s * 0.3;
            ctx.moveTo(hx, hy);
            ctx.lineTo(hx + Math.cos(angle + Math.PI / 4) * tickL, hy + Math.sin(angle + Math.PI / 4) * tickL);
            ctx.moveTo(hx, hy);
            ctx.lineTo(hx + Math.cos(angle - Math.PI / 4) * tickL, hy + Math.sin(angle - Math.PI / 4) * tickL);
          }
          ctx.stroke();

          // Core stardust point
          ctx.beginPath();
          ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
          ctx.fill();

          ctx.restore();
        }
      }

      // Render floating Emoto water crystals / molecules
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Smooth transition of crystallinity toward target
        p.crystallinity += (currentTarget - p.crystallinity) * Math.min(1, dt * 2.8);

        // Fluid motion: floating buoyancy or turbulent agitation
        const acousticAgitation = listening ? Math.sin(now * 0.008 + p.id) * 0.6 : 0;
        p.y += (p.vy + (currentTarget === 0 ? -0.1 : 0)) * (listening ? 1.4 : 1);
        p.x += p.vx + Math.sin(now * 0.001 * pulseSpeed + p.id) * 0.3 + acousticAgitation;
        p.rotation += p.rotSpeed * (currentTarget === 0 ? 1.8 : 1);
        p.sparklePhase += dt * 3.2;

        // Wrap around top screen smoothly
        if (p.y < -70) {
          p.y = height + 40;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        // Morphing drawing based on crystallinity:
        // 1.0 = Blue Snow Flaky Crystal (Positive)
        // 0.5 = Light Blue Fluid Molecular Cluster (Neutral)
        // 0.0 = Brown Distorted Ugly Structure (Negative)
        const c = p.crystallinity;

        if (c >= 0.75) {
          // Dominant Positive: Blue Snow Flaky Crystal
          drawBlueSnowflakeCrystal(ctx, p, (c - 0.75) / 0.25, now);
        } else if (c <= 0.25) {
          // Dominant Negative: Brown Distorted Ugly Structure
          drawBrownDistortedFragment(ctx, p, 1 - c / 0.25, now);
        } else {
          // Neutral: Light Blue Fluid H2O Molecular Cluster (blend)
          drawLightBlueFluidLattice(ctx, p, now);
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    }

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // POSITIVE: Blue color and intricate snowflake effect with multi-tier dendrites and stardust sparkles
  function drawBlueSnowflakeCrystal(
    ctx: CanvasRenderingContext2D,
    p: Particle,
    symmetryStrength: number,
    time: number
  ) {
    const r = p.radius;
    const arms = 6;
    const opacity = p.opacity;

    // Glowing crystalline blue aura
    ctx.strokeStyle = `rgba(37, 99, 235, ${opacity * 0.88 * symmetryStrength})`; // Vibrant royal crystal blue
    ctx.lineWidth = 1.35;
    ctx.fillStyle = `rgba(219, 234, 254, ${opacity * 0.28 * symmetryStrength})`; // Soft icy blue fill

    // Hexagonal crystal arms with delicate, intricate snowflake dendrites
    ctx.beginPath();
    for (let i = 0; i < arms; i++) {
      const angle = (Math.PI / 3) * i;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;

      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);

      // Primary snowflake dendrite branches (fern-like stellar dendrite)
      const mid1 = 0.45;
      const bx1 = Math.cos(angle) * (r * mid1);
      const by1 = Math.sin(angle) * (r * mid1);
      const bLen1 = r * 0.32;
      const bAngL1 = angle + Math.PI / 3.4;
      const bAngR1 = angle - Math.PI / 3.4;

      ctx.moveTo(bx1, by1);
      ctx.lineTo(bx1 + Math.cos(bAngL1) * bLen1, by1 + Math.sin(bAngL1) * bLen1);
      ctx.moveTo(bx1, by1);
      ctx.lineTo(bx1 + Math.cos(bAngR1) * bLen1, by1 + Math.sin(bAngR1) * bLen1);

      // Sub-needles on primary dendrites for high-detail snowflake effect
      const subMid = 0.55;
      const subBxL = bx1 + Math.cos(bAngL1) * (bLen1 * subMid);
      const subByL = by1 + Math.sin(bAngL1) * (bLen1 * subMid);
      const subBxR = bx1 + Math.cos(bAngR1) * (bLen1 * subMid);
      const subByR = by1 + Math.sin(bAngR1) * (bLen1 * subMid);
      const subNeedleLen = r * 0.12;

      ctx.moveTo(subBxL, subByL);
      ctx.lineTo(subBxL + Math.cos(angle) * subNeedleLen, subByL + Math.sin(angle) * subNeedleLen);
      ctx.moveTo(subBxR, subByR);
      ctx.lineTo(subBxR + Math.cos(angle) * subNeedleLen, subByR + Math.sin(angle) * subNeedleLen);

      // Secondary outer tip snowflake dendrite
      const mid2 = 0.78;
      const bx2 = Math.cos(angle) * (r * mid2);
      const by2 = Math.sin(angle) * (r * mid2);
      const bLen2 = r * 0.22;

      ctx.moveTo(bx2, by2);
      ctx.lineTo(bx2 + Math.cos(bAngL1) * bLen2, by2 + Math.sin(bAngL1) * bLen2);
      ctx.moveTo(bx2, by2);
      ctx.lineTo(bx2 + Math.cos(bAngR1) * bLen2, by2 + Math.sin(bAngR1) * bLen2);

      // Outer diamond arrow cap on branch tip
      const tipL = r * 0.12;
      ctx.moveTo(x, y);
      ctx.lineTo(x - Math.cos(angle - Math.PI / 4) * tipL, y - Math.sin(angle - Math.PI / 4) * tipL);
      ctx.moveTo(x, y);
      ctx.lineTo(x - Math.cos(angle + Math.PI / 4) * tipL, y - Math.sin(angle + Math.PI / 4) * tipL);
    }
    ctx.stroke();

    // Inner sacred hexagonal faceted diamond nucleus (ice plate crystal)
    ctx.beginPath();
    for (let i = 0; i < arms; i++) {
      const angle = (Math.PI / 3) * i;
      const nx = Math.cos(angle) * (r * 0.34);
      const ny = Math.sin(angle) * (r * 0.34);
      if (i === 0) ctx.moveTo(nx, ny);
      else ctx.lineTo(nx, ny);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.95})`;
    ctx.stroke();
    ctx.fill();

    // Second concentric internal diamond ring
    ctx.beginPath();
    for (let i = 0; i < arms; i++) {
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      const nx = Math.cos(angle) * (r * 0.18);
      const ny = Math.sin(angle) * (r * 0.18);
      if (i === 0) ctx.moveTo(nx, ny);
      else ctx.lineTo(nx, ny);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(147, 197, 253, ${opacity * 0.5})`;
    ctx.fill();

    // Radiant core ice nucleus
    ctx.beginPath();
    ctx.arc(0, 0, 2.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(29, 78, 216, ${opacity * 0.95})`;
    ctx.fill();

    // Sparkling frost stardust on outer snowflake branch tips
    const sparkle = Math.sin(p.sparklePhase + p.id) * 0.5 + 0.5;
    if (sparkle > 0.45) {
      const tipAngle = (Math.PI / 3) * (p.id % 6);
      const tipX = Math.cos(tipAngle) * r;
      const tipY = Math.sin(tipAngle) * r;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 2.2 * sparkle, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * sparkle * 1.1})`;
      ctx.shadowColor = 'rgba(96, 165, 250, 0.8)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // NEUTRAL: Light blue fluid droplets and gentle flowing H2O molecular clusters
  function drawLightBlueFluidLattice(ctx: CanvasRenderingContext2D, p: Particle, time: number) {
    const opacity = p.opacity;
    const r = p.radius * 0.74;

    // Delicate light blue fluid contours
    ctx.strokeStyle = `rgba(56, 189, 248, ${opacity * 0.7})`; // Light blue / sky blue
    ctx.fillStyle = `rgba(224, 242, 254, ${opacity * 0.25})`; // Translucent soft light cyan
    ctx.lineWidth = 1.1;

    // Central Oxygen sphere with soft water ripple
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();

    // Inner orbital water ring
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(125, 211, 252, ${opacity * 0.5})`;
    ctx.stroke();

    // Two paired Hydrogen nodes in light blue (104.5 degree molecular water bond angle)
    const bondDist = r * 0.86;
    const angle1 = Math.PI * 0.68;
    const angle2 = Math.PI * 0.32;

    const hx1 = Math.cos(angle1) * bondDist;
    const hy1 = Math.sin(angle1) * bondDist;
    const hx2 = Math.cos(angle2) * bondDist;
    const hy2 = Math.sin(angle2) * bondDist;

    // Hydrogen bond bridges
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(hx1, hy1);
    ctx.moveTo(0, 0);
    ctx.lineTo(hx2, hy2);
    ctx.strokeStyle = `rgba(56, 189, 248, ${opacity * 0.55})`;
    ctx.stroke();

    // Hydrogen sphere nodes
    ctx.fillStyle = `rgba(2, 132, 199, ${opacity * 0.75})`;
    ctx.beginPath();
    ctx.arc(hx1, hy1, 3.4, 0, Math.PI * 2);
    ctx.arc(hx2, hy2, 3.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // NEGATIVE: Brown color distortions - murky earthy brown jagged fractured structures with distorted cracks
  function drawBrownDistortedFragment(
    ctx: CanvasRenderingContext2D,
    p: Particle,
    discordStrength: number,
    time: number
  ) {
    const opacity = p.opacity;
    const r = p.radius * 0.88;
    const points = 7;

    // Murky brown earthy tones
    ctx.strokeStyle = `rgba(120, 53, 15, ${opacity * 0.85 * discordStrength})`; // Dark earthy brown
    ctx.fillStyle = `rgba(180, 83, 9, ${opacity * 0.22 * discordStrength})`; // Turbid muddy brown fill
    ctx.lineWidth = 1.6;

    // Chaotic distorted asymmetrical polygon with irregular spike angles
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const angle = ((Math.PI * 2) / points) * i + p.fractureAngle;
      const seed = p.jaggedSeeds[i % p.jaggedSeeds.length];
      const variance = seed * (1.25 + Math.sin(time * 0.005 + i) * 0.2);
      const px = Math.cos(angle) * (r * variance);
      const py = Math.sin(angle) * (r * (1.45 - variance));
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    // Chaotic internal fracture lines in dark brown
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, -r * 0.35);
    ctx.lineTo(r * 0.4, 0.1);
    ctx.lineTo(-r * 0.25, r * 0.7);
    ctx.strokeStyle = `rgba(146, 64, 14, ${opacity * 0.9 * discordStrength})`;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Secondary jagged cross-crack
    ctx.beginPath();
    ctx.moveTo(r * 0.1, -r * 0.55);
    ctx.lineTo(-r * 0.45, 0.2);
    ctx.strokeStyle = `rgba(180, 83, 9, ${opacity * 0.75 * discordStrength})`;
    ctx.stroke();

    // Broken distorted satellite shard floating disconnected
    ctx.beginPath();
    ctx.arc(r * 0.95, -r * 0.75, 2.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(120, 53, 15, ${opacity * 0.75})`;
    ctx.fill();
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ripplesRef.current.push({
      x,
      y,
      r: 8,
      maxR: 90,
      alpha: 0.9,
    });

    if (onCanvasClick) {
      onCanvasClick();
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-auto z-0 overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        className="w-full h-full block cursor-pointer"
        aria-label="Masaru Emoto water molecular consciousness simulation"
      />
    </div>
  );
};
