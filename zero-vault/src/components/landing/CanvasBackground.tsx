'use client';

import React, { useEffect, useRef } from 'react';

export const CanvasBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let mouseX = width / 2;
    let mouseY = height / 2;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();

    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      hue: number;
      pulse: number;
      pulseSpeed: number;
    }[] = [];

    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 0.6 - 0.3,
        speedY: Math.random() * 0.6 - 0.3,
        opacity: Math.random() * 0.6 + 0.2,
        hue: Math.random() > 0.5 ? 348 : 280,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01
      });
    }

    const orbs: {
      x: number;
      y: number;
      radius: number;
      hue: number;
      speed: number;
      angle: number;
      orbitRadius: number;
    }[] = [];

    for (let i = 0; i < 5; i++) {
      orbs.push({
        x: width * (0.2 + Math.random() * 0.6),
        y: height * (0.2 + Math.random() * 0.6),
        radius: 100 + Math.random() * 200,
        hue: [348, 280, 320, 260, 340][i],
        speed: 0.002 + Math.random() * 0.003,
        angle: Math.random() * Math.PI * 2,
        orbitRadius: 50 + Math.random() * 100
      });
    }

    const gridSize = 60;
    let offset = 0;
    let time = 0;

    const draw = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0a0012');
      bgGrad.addColorStop(0.3, '#120018');
      bgGrad.addColorStop(0.6, '#0d0015');
      bgGrad.addColorStop(1, '#08000f');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      orbs.forEach(orb => {
        orb.angle += orb.speed;
        const orbX = orb.x + Math.cos(orb.angle) * orb.orbitRadius;
        const orbY = orb.y + Math.sin(orb.angle) * orb.orbitRadius;

        const glow = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orb.radius);
        glow.addColorStop(0, `hsla(${orb.hue}, 90%, 60%, 0.15)`);
        glow.addColorStop(0.4, `hsla(${orb.hue}, 85%, 50%, 0.06)`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(orbX - orb.radius, orbY - orb.radius, orb.radius * 2, orb.radius * 2);
      });

      const mouseGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 400);
      mouseGlow.addColorStop(0, 'rgba(244, 63, 94, 0.25)');
      mouseGlow.addColorStop(0.2, 'rgba(244, 63, 94, 0.15)');
      mouseGlow.addColorStop(0.5, 'rgba(168, 85, 247, 0.08)');
      mouseGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = mouseGlow;
      ctx.fillRect(0, 0, width, height);

      const mouseInner = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 80);
      mouseInner.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      mouseInner.addColorStop(0.5, 'rgba(244, 63, 94, 0.15)');
      mouseInner.addColorStop(1, 'transparent');
      ctx.fillStyle = mouseInner;
      ctx.fillRect(mouseX - 80, mouseY - 80, 160, 160);

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.arc(mouseX, mouseY, 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
      ctx.arc(mouseX, mouseY, 15 + Math.sin(time * 5) * 3, 0, Math.PI * 2);
      ctx.stroke();

      const perspectiveX = width / 2;
      const perspectiveY = height * 0.35;

      ctx.lineWidth = 1;

      for (let x = -width; x <= width * 2; x += gridSize) {
        const distFromCenter = Math.abs(x - perspectiveX) / width;
        const distFromMouse = Math.abs(x - mouseX) / 200;
        const mouseMod = Math.max(0, 1 - distFromMouse);
        const alpha = (0.08 - distFromCenter * 0.05) + (mouseMod * 0.15);
        if (alpha <= 0) continue;

        const gradient = ctx.createLinearGradient(x, height, perspectiveX, perspectiveY);
        gradient.addColorStop(0, `rgba(244, 63, 94, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(168, 85, 247, ${alpha * 0.7})`);
        gradient.addColorStop(1, 'transparent');
        ctx.strokeStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(perspectiveX, perspectiveY);
        ctx.stroke();
      }

      offset = (offset + 0.8) % gridSize;
      for (let i = 0; i < 25; i++) {
        const yPos = height - (i * gridSize + offset);
        if (yPos < perspectiveY) continue;

        const distFromMouseY = Math.abs(yPos - mouseY) / 100;
        const mouseModY = Math.max(0, 1 - distFromMouseY);
        const progress = 1 - (yPos - perspectiveY) / (height - perspectiveY);
        const alpha = (0.06 * (1 - progress)) + (mouseModY * 0.1);
        if (alpha <= 0) continue;

        const lineGrad = ctx.createLinearGradient(0, yPos, width, yPos);
        lineGrad.addColorStop(0, 'transparent');
        const centerAlpha = (mouseModY * 0.2 + 0.1) * (1 - progress);
        lineGrad.addColorStop(0.3, `rgba(244, 63, 94, ${alpha})`);
        lineGrad.addColorStop(0.5, `rgba(168, 85, 247, ${alpha * 1.5})`);
        lineGrad.addColorStop(0.7, `rgba(244, 63, 94, ${alpha})`);
        lineGrad.addColorStop(1, 'transparent');
        ctx.strokeStyle = lineGrad;

        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(width, yPos);
        ctx.stroke();
      }

      const horizonGlow = ctx.createRadialGradient(perspectiveX, perspectiveY, 0, perspectiveX, perspectiveY, width * 0.4);
      horizonGlow.addColorStop(0, 'rgba(244, 63, 94, 0.12)');
      horizonGlow.addColorStop(0.3, 'rgba(168, 85, 247, 0.06)');
      horizonGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = horizonGlow;
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += p.pulseSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const pulseOpacity = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);
        const pulseSize = p.size * (0.8 + Math.sin(p.pulse) * 0.3);

        const particleGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseSize * 4);
        particleGlow.addColorStop(0, `hsla(${p.hue}, 90%, 70%, ${pulseOpacity * 0.4})`);
        particleGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = particleGlow;
        ctx.fillRect(p.x - pulseSize * 4, p.y - pulseSize * 4, pulseSize * 8, pulseSize * 8);

        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${pulseOpacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      });

      const connectionDist = 150;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.12;
            ctx.strokeStyle = `rgba(244, 63, 94, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      for (let i = 0; i < height; i += 4) {
        ctx.fillRect(0, i, width, 2);
      }

      const edgeTop = ctx.createLinearGradient(0, 0, 0, height * 0.15);
      edgeTop.addColorStop(0, 'rgba(244, 63, 94, 0.05)');
      edgeTop.addColorStop(1, 'transparent');
      ctx.fillStyle = edgeTop;
      ctx.fillRect(0, 0, width, height * 0.15);

      const edgeBottom = ctx.createLinearGradient(0, height * 0.85, 0, height);
      edgeBottom.addColorStop(0, 'transparent');
      edgeBottom.addColorStop(1, 'rgba(168, 85, 247, 0.05)');
      ctx.fillStyle = edgeBottom;
      ctx.fillRect(0, height * 0.85, width, height * 0.15);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: '#0a0012' }}
    />
  );
};
