"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

const ACTIVITY = [
  { name: "Aarav", role: "Frontend Developer", score: "8.6" },
  { name: "Priya", role: "Data Analyst", score: "9.1" },
  { name: "Rohan", role: "Backend Developer", score: "7.9" },
  { name: "Meera", role: "Product Manager", score: "8.3" },
  { name: "Karan", role: "DevOps Engineer", score: "8.8" },
  { name: "Ishita", role: "UI/UX Designer", score: "9.0" },
];

// Doubled so the marquee can loop seamlessly at -50%.
const LOOP = [...ACTIVITY, ...ACTIVITY];

/**
 * A quiet, product-y closer for the page — an infinitely scrolling strip of
 * recent mock interview completions. Not real data (no DB per spec), just a
 * believable illustrative ticker that gives the page a "live product" feel
 * instead of ending abruptly after the form.
 */
export function LiveActivityStrip() {
  return (
    <section
      className="w-full overflow-hidden py-10"
      style={{ backgroundColor: "#FFFFFF", borderTop: "1px solid #E9E8E6" }}
    >
      <p
        className="mb-5 text-center text-xs font-semibold tracking-[0.2em] uppercase"
        style={{ color: "#9A9A94" }}
      >
        Recently on MockMate AI
      </p>

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24"
          style={{ background: "linear-gradient(90deg, #FFFFFF, transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24"
          style={{
            background: "linear-gradient(270deg, #FFFFFF, transparent)",
          }}
        />

        <div className="mm-marquee flex w-max gap-4 px-4">
          {LOOP.map((item, i) => (
            <div
              key={i}
              className="flex flex-shrink-0 items-center gap-3 rounded-full px-4 py-2.5"
              style={{
                backgroundColor: "#F9F9F6",
                border: "1px solid #E9E8E6",
              }}
            >
              <CheckCircle2 size={15} style={{ color: "#2F5D5A" }} />
              <span className="text-xs" style={{ color: "#4A4640" }}>
                <span className="font-semibold" style={{ color: "#0B0B0B" }}>
                  {item.name}
                </span>{" "}
                completed a {item.role} interview
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{ backgroundColor: "#EEF3F2", color: "#2F5D5A" }}
              >
                {item.score}/10
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .mm-marquee {
          animation: mm-scroll-left 32s linear infinite;
        }
        @keyframes mm-scroll-left {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
