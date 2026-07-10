"use client";

import React, { useState } from "react";
import { Home, ClipboardEdit, Sparkles, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "setup-form", label: "Start Interview", icon: ClipboardEdit },
  { id: "how-it-works", label: "How It Works", icon: Sparkles },
];

/**
 * Sticky top nav — stays pinned at the top of the viewport at all times
 * (`sticky top-0`), sits above the cursor glow's decorative layers but the
 * glow still passes over/under it visually since the glow is a fixed
 * full-page overlay; no separate import is needed here for that effect to
 * reach the navbar — it's already global.
 */
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  function scrollToSection(id: string) {
    setMobileOpen(false);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur-md"
      style={{
        backgroundColor: "rgba(255,255,255,0.85)",
        borderBottom: "1px solid #E9E8E6",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-8">
        {/* Wordmark */}
        <button
          onClick={() => scrollToSection("home")}
          className="flex items-center gap-2"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold"
            style={{ backgroundColor: "#2F5D5A", color: "#FFFFFF" }}
          >
            M
          </span>
          <span
            className="text-base font-semibold tracking-tight"
            style={{ color: "#0B0B0B" }}
          >
            MockMate <span style={{ color: "#2F5D5A" }}>AI</span>
          </span>
        </button>

        {/* Desktop nav — the 3 buttons */}
        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 hover:opacity-80"
                style={{
                  color: "#4A4640",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#EEF3F2";
                  e.currentTarget.style.color = "#2F5D5A";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#4A4640";
                }}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* CTA on desktop */}
        <button
          onClick={() => scrollToSection("setup-form")}
          className="hidden rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 sm:block"
          style={{ backgroundColor: "#2F5D5A", color: "#FFFFFF" }}
        >
          Get Started
        </button>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg sm:hidden"
          style={{ border: "1px solid #E9E8E6", color: "#4A4640" }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <nav
          className="flex flex-col gap-1 px-4 pb-4 sm:hidden"
          style={{ borderTop: "1px solid #E9E8E6" }}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium mt-1"
                style={{ backgroundColor: "#F9F9F6", color: "#4A4640" }}
              >
                <Icon size={16} style={{ color: "#2F5D5A" }} />
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}
