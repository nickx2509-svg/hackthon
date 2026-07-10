"use client";

import React, { useEffect, useRef } from "react";

/**
 * Vertical stripe rails pinned to the far left/right edges of the viewport.
 * `position: fixed` means they always cover the full viewport height
 * regardless of scroll position or page length — they were previously
 * invisible past the Macbook section because every section below it painted
 * a solid background on top of them (z-index was lower than the section
 * content). Bumped above section content here, and made higher-contrast so
 * they actually read as stripes instead of disappearing into the page bg.
 */
export function ScrollStripes() {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      if (leftRef.current) {
        leftRef.current.style.backgroundPosition = `0px ${-(y * 0.5) % 64}px`;
      }
      if (rightRef.current) {
        rightRef.current.style.backgroundPosition = `0px ${(y * 0.35) % 64}px`;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const stripeStyle = (reverse?: boolean): React.CSSProperties => ({
    backgroundImage: `repeating-linear-gradient(${reverse ? "-45deg" : "45deg"}, #C9C7C2 0px, #C9C7C2 3px, transparent 3px, transparent 15px)`,
    backgroundSize: "64px 64px",
  });

  return (
    <>
      <div
        ref={leftRef}
        className="pointer-events-none fixed left-0 top-0 hidden h-screen w-[18px] lg:block"
        style={{ ...stripeStyle(false), opacity: 0.9, zIndex: 40 }}
      />
      <div
        ref={rightRef}
        className="pointer-events-none fixed right-0 top-0 hidden h-screen w-[18px] lg:block"
        style={{ ...stripeStyle(true), opacity: 0.9, zIndex: 40 }}
      />
    </>
  );
}
