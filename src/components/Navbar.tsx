"use client";

import React, { useEffect, useState } from "react";
import { Home, ClipboardEdit, Sparkles, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "setup-form", label: "Start Interview", icon: ClipboardEdit },
  { id: "how-it-works", label: "How It Works", icon: Sparkles },
];

/**
 * Sticky top nav — stays pinned at the top of the viewport at all times
 * (`fixed top-*`), sits above the cursor glow's decorative layers but the
 * glow still passes over/under it visually since the glow is a fixed
 * full-page overlay; no separate import is needed here for that effect to
 * reach the navbar — it's already global.
 *
 * Desktop (md and up): unchanged pill nav, exactly as before.
 * Mobile / tablet (below md): hamburger opens a card-style dropdown with
 * a soft backdrop, active-item highlight, and a smooth open/close animation.
 */
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState("home");

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: any) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function scrollToSection(id: any) {
    setActiveId(id);
    setMobileOpen(false);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header className="fixed top-3 left-0 right-0 z-50 flex justify-center px-3 sm:top-4 sm:px-4">
      <div
        className={`w-full max-w-6xl backdrop-blur-xl shadow-lg transition-[border-radius] duration-300 ${
          mobileOpen ? "rounded-3xl" : "rounded-2xl md:rounded-full"
        }`}
        style={{
          background: "rgba(255,255,255,0.92)",
          border: "1px solid #E7E6E3",
        }}
      >
        <div className="flex items-center justify-between px-4 py-2.5 sm:px-5 md:px-6 md:py-3">
          {/* Wordmark */}
          <button
            onClick={() => scrollToSection("home")}
            className="flex items-center gap-2"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold md:h-9 md:w-9"
              style={{
                backgroundColor: "#2F5D5A",
                color: "#FFFFFF",
              }}
            >
              M
            </span>

            <span
              className="text-[15px] font-semibold tracking-tight sm:text-base"
              style={{ color: "#0B0B0B" }}
            >
              MockMate <span style={{ color: "#2F5D5A" }}>AI</span>
            </span>
          </button>

          {/* Desktop Nav — untouched, just gated behind md instead of sm so
              tablets in portrait get the mobile menu instead of a squeeze */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200"
                  style={{
                    color: "#4A4640",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#EEF3F2";
                    e.currentTarget.style.color = "#2F5D5A";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#4A4640";
                  }}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* CTA — desktop only, unchanged */}
          <button
            onClick={() => scrollToSection("setup-form")}
            className="hidden rounded-full px-5 py-2 text-sm font-medium transition hover:opacity-90 md:block"
            style={{
              background: "#2F5D5A",
              color: "#fff",
            }}
          >
            Get Started
          </button>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 active:scale-95 md:hidden"
            style={{
              border: "1px solid #E7E6E3",
              color: mobileOpen ? "#FFFFFF" : "#4A4640",
              background: mobileOpen ? "#2F5D5A" : "transparent",
            }}
          >
            <span
              className={`absolute transition-all duration-200 ${
                mobileOpen
                  ? "scale-0 opacity-0 rotate-90"
                  : "scale-100 opacity-100 rotate-0"
              }`}
            >
              <Menu size={18} />
            </span>
            <span
              className={`absolute transition-all duration-200 ${
                mobileOpen
                  ? "scale-100 opacity-100 rotate-0"
                  : "scale-0 opacity-0 -rotate-90"
              }`}
            >
              <X size={18} />
            </span>
          </button>
        </div>

        {/* Mobile menu panel — animated height/opacity, no layout jump */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
            mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav
            className="flex flex-col gap-2 border-t px-4 pb-4 pt-3"
            style={{ borderColor: "#E7E6E3" }}
          >
            {NAV_ITEMS.map((item, i) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-[15px] font-medium transition-all duration-200 active:scale-[0.98]"
                  style={{
                    background: isActive ? "#2F5D5A" : "#F8F8F6",
                    color: isActive ? "#FFFFFF" : "#4A4640",
                    transitionDelay: mobileOpen ? `${i * 40}ms` : "0ms",
                  }}
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{
                      background: isActive
                        ? "rgba(255,255,255,0.18)"
                        : "#EEF3F2",
                      color: isActive ? "#FFFFFF" : "#2F5D5A",
                    }}
                  >
                    <Icon size={16} />
                  </span>
                  {item.label}
                </button>
              );
            })}

            {/* CTA inside mobile menu */}
            <button
              onClick={() => scrollToSection("setup-form")}
              className="mt-1 flex w-full items-center justify-center rounded-2xl px-4 py-3.5 text-sm font-semibold shadow-sm transition active:scale-[0.98]"
              style={{
                background: "#2F5D5A",
                color: "#fff",
              }}
            >
              Get Started
            </button>
          </nav>
        </div>
      </div>

      {/* Soft backdrop behind the open mobile menu */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 -z-10 md:hidden"
          style={{ background: "rgba(11,11,11,0.15)" }}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
