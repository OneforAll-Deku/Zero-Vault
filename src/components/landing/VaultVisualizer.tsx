'use client';

import React, { useEffect, useRef } from 'react';

export const VaultVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 400;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    let rotation = 0;
    let animationFrameId: number;

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      
      const centerX = width / 2;
      const centerY = height / 2;
      
      rotation += 0.008;
      const pulse = Math.sin(time / 500) * 0.1 + 1.0;

      const outerGlow = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, 180 * pulse);
      outerGlow.addColorStop(0, 'rgba(244, 63, 94, 0.25)');
      outerGlow.addColorStop(0.4, 'rgba(168, 85, 247, 0.12)');
      outerGlow.addColorStop(0.7, 'rgba(244, 63, 94, 0.05)');
      outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, width, height);

      ctx.lineCap = 'round';

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.scale(pulse, pulse);

      for (let i = 0; i < 4; i++) {
        const alpha = 0.6 - i * 0.1;
        const hue = 348 + i * 15;
        ctx.strokeStyle = `hsla(${hue}, 90%, 65%, ${alpha})`;
        ctx.lineWidth = 2.5 - i * 0.3;
        ctx.shadowColor = `hsla(${hue}, 90%, 60%, 0.5)`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 80 + i * 12, i * 0.5, Math.PI * 0.5 + i * 0.5);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 50;
        const y = Math.sin(angle) * 50;
        const dotPulse = Math.sin(time / 300 + i * 0.5) * 0.3 + 0.7;

        const isAlt = i % 2 === 0;
        const dotHue = isAlt ? 348 : 280;

        ctx.shadowColor = `hsla(${dotHue}, 90%, 60%, 0.6)`;
        ctx.shadowBlur = 8;
        ctx.fillStyle = `hsla(${dotHue}, 90%, 65%, ${dotPulse})`;
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        const lineGrad = ctx.createLinearGradient(0, 0, x, y);
        lineGrad.addColorStop(0, `hsla(${dotHue}, 90%, 60%, 0.1)`);
        lineGrad.addColorStop(1, `hsla(${dotHue}, 90%, 60%, ${dotPulse * 0.5})`);
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      ctx.shadowColor = 'rgba(244, 63, 94, 0.6)';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.stroke();

      const coreFill = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
      coreFill.addColorStop(0, 'rgba(244, 63, 94, 0.3)');
      coreFill.addColorStop(0.6, 'rgba(168, 85, 247, 0.15)');
      coreFill.addColorStop(1, 'rgba(244, 63, 94, 0.05)');
      ctx.fillStyle = coreFill;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.restore();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw(0);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-[400px] flex items-center justify-center">
      <canvas ref={canvasRef} className="max-w-full h-auto drop-shadow-[0_0_30px_rgba(244,63,94,0.4)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};
