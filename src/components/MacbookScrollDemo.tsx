"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { MacbookScroll } from "./ui/macbook-scroll";
import SetupForm from "./Setupform";
import { CursorGlow } from "./CursorGlow";
import { ScrollStripes } from "./ScrollStripes";
import { LiveActivityStrip } from "./LiveActivityStrip";
import { Navbar } from "./Navbar";
import { HowItWork } from "./HowItsWork";

const SCREEN_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="500" fill="#F9F9F6"/>
  <rect x="0" y="0" width="800" height="56" fill="#FFFFFF"/>
  <rect x="0" y="55" width="800" height="1" fill="#E9E8E6"/>
  <circle cx="40" cy="28" r="9" fill="#2F5D5A"/>
  <rect x="62" y="21" width="130" height="8" rx="4" fill="#0B0B0B" opacity="0.75"/>
  <rect x="62" y="33" width="90" height="6" rx="3" fill="#9A9A94"/>
  <circle cx="330" cy="235" r="98" fill="#E7EFEE" stroke="#D3E3E1" stroke-width="2"/>
  <rect x="298" y="208" width="7" height="54" rx="3.5" fill="#2F5D5A" opacity="0.5"/>
  <rect x="314" y="196" width="7" height="78" rx="3.5" fill="#2F5D5A" opacity="0.75"/>
  <rect x="330" y="186" width="7" height="98" rx="3.5" fill="#2F5D5A"/>
  <rect x="346" y="196" width="7" height="78" rx="3.5" fill="#2F5D5A" opacity="0.75"/>
  <rect x="362" y="208" width="7" height="54" rx="3.5" fill="#2F5D5A" opacity="0.5"/>
  <rect x="616" y="86" width="152" height="330" rx="18" fill="#FFFFFF" stroke="#E9E8E6" stroke-width="2"/>
  <rect x="634" y="110" width="120" height="34" rx="12" fill="#EEF3F2"/>
  <rect x="634" y="154" width="88" height="34" rx="12" fill="#F3F1EC"/>
  <rect x="634" y="198" width="120" height="34" rx="12" fill="#EEF3F2"/>
  <rect x="634" y="242" width="70" height="34" rx="12" fill="#F3F1EC"/>
  <rect x="634" y="286" width="105" height="34" rx="12" fill="#EEF3F2"/>
  <rect x="634" y="376" width="120" height="30" rx="10" fill="#F9F9F6" stroke="#E9E8E6"/>
</svg>
`)}`;

// One shared spacing scale so every section breathes the same amount —
// tighter than before so the page doesn't feel like it's mostly empty space.
const SECTION_PADDING = "py-14 md:py-20";

export function MainPage() {
  return (
    <div className="relative w-full overflow-hidden bg-white">
      <CursorGlow />
      <ScrollStripes />

      {/* Small breathing room above the navbar so it isn't flush against the
          very top edge of the viewport */}
      <div className="pt-3 sm:pt-4">
        <Navbar />
      </div>

      {/* Hero — trimmed top padding (was py-20/py-28) so the laptop below
          doesn't sit a full screen-height down the page */}
      <section
        id="home"
        className={`scroll-mt-24 relative z-[2] w-full px-4 ${SECTION_PADDING} flex flex-col items-center text-center`}
      >
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium mb-7 mm-fade-in"
          style={{
            backgroundColor: "#EEF3F2",
            color: "#2F5D5A",
            border: "1px solid #DCE9E7",
          }}
        >
          <Sparkles size={13} />
          Powered by Mesh API &amp; Next.js · A hackathon build
        </div>

        {/* Heading — heavier weight, tighter tracking, and the payoff phrase
            picked out in the brand teal instead of one flat block of black */}
        <h1
          className="text-[2.75rem] sm:text-6xl md:text-7xl font-bold tracking-tight max-w-3xl leading-[1.05] mm-fade-in"
          style={{ color: "#131211", animationDelay: "120ms" }}
        >
          Practice interviews that{" "}
          <span style={{ color: "#2F5D5A" }}>actually feel real</span>
        </h1>

        {/* Subtitle — larger, warmer gray, more line-height so it reads as a
            calm supporting line rather than more flat black text */}
        <p
          className="mt-6 text-lg sm:text-xl max-w-xl leading-relaxed mm-fade-in"
          style={{ color: "#6B6B66", animationDelay: "260ms" }}
        >
          MockMate AI listens, adapts, and follows up like a real interviewer —
          driven by Claude Sonnet through Mesh API.
        </p>

        <div className="mm-divider mt-9" style={{ animationDelay: "0.55s" }} />
      </section>

      {/* Laptop showcase */}
      <div className={`relative z-[2] ${SECTION_PADDING}`}>
        <MacbookScroll src={SCREEN_PLACEHOLDER} showGradient />
      </div>

      {/* Setup form */}
      <div className="relative z-[2]">
        <SetupForm />
      </div>

      {/* How it works */}
      <div className={`relative z-[2] ${SECTION_PADDING}`}>
        <HowItWork />
      </div>

      {/* Unique closer strip */}
      <div className={`relative z-[2] ${SECTION_PADDING}`}>
        <LiveActivityStrip />
      </div>

      <style jsx>{`
        .mm-fade-in {
          opacity: 0;
          transform: translateY(16px) scale(0.99);
          animation: mm-fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes mm-fade-up {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .mm-divider {
          width: 0%;
          height: 2px;
          border-radius: 9999px;
          background: linear-gradient(90deg, transparent, #2f5d5a, transparent);
          animation: mm-divider-grow 1s ease-out forwards;
        }
        @keyframes mm-divider-grow {
          from {
            width: 0%;
            opacity: 0;
          }
          to {
            width: 220px;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
