"use client";

import React, { useEffect, useRef } from "react";

const PARTICLE_COUNT = 6;
const LAG = [0.32, 0.22, 0.16, 0.12, 0.09, 0.07];
const SIZE = [70, 100, 128, 152, 172, 188];
// Reduced roughly by half from before — trail is now a faint hint of color
// rather than a strong wash across the page.
const BLUR = [20, 27, 34, 41, 48, 55];
const OPACITY = [0.16, 0.13, 0.1, 0.08, 0.06, 0.04];

/**
 * Rainbow smoke trail that follows the cursor. Each particle is a blurred
 * conic-gradient ring whose hue continuously rotates via a CSS animation, and
 * whose position lerps toward the particle ahead of it, creating a soft
 * multi-colored trail. Pure refs + rAF — no React state, no re-renders.
 * Desktop-only (hidden on touch devices, where there's no cursor to follow).
 */
export function CursorGlow() {
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const positions = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => ({ x: 0, y: 0 })),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // skip on touch

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    positions.current.forEach((p) => {
      p.x = mouse.x;
      p.y = mouse.y;
    });

    const handleMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMove);

    let frame = 0;
    const animate = () => {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const followTarget = i === 0 ? mouse : positions.current[i - 1];
        const p = positions.current[i];
        p.x += (followTarget.x - p.x) * LAG[i];
        p.y += (followTarget.y - p.y) * LAG[i];

        const el = particleRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
        }
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            particleRefs.current[i] = el;
          }}
          className="mm-glow-particle absolute left-0 top-0"
          style={{
            width: SIZE[i],
            height: SIZE[i],
            borderRadius: "9999px",
            background:
              "conic-gradient(from 0deg, #FF6B6B, #FFD166, #06D6A0, #4ECDC4, #6A8EFF, #C77DFF, #FF6B6B)",
            filter: `blur(${BLUR[i]}px)`,
            opacity: OPACITY[i],
            mixBlendMode: "multiply",
            animationDelay: `${i * -0.6}s`,
          }}
        />
      ))}

      <style jsx>{`
        .mm-glow-particle {
          animation: mm-hue-cycle 6s linear infinite;
        }
        @keyframes mm-hue-cycle {
          from {
            filter: hue-rotate(0deg) blur(30px);
          }
          to {
            filter: hue-rotate(360deg) blur(30px);
          }
        }
      `}</style>
    </div>
  );
}
