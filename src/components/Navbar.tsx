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
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <div
        className="w-full max-w-6xl rounded-full backdrop-blur-xl shadow-lg"
        style={{
          background: "rgba(255,255,255,0.88)",
          border: "1px solid #E7E6E3",
        }}
      >
        <div className="flex items-center justify-between px-6 py-3">
          {/* Wordmark */}
          <button
            onClick={() => scrollToSection("home")}
            className="flex items-center gap-2"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold"
              style={{
                backgroundColor: "#2F5D5A",
                color: "#FFFFFF",
              }}
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

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 sm:flex">
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

          {/* CTA */}
          <button
            onClick={() => scrollToSection("setup-form")}
            className="hidden rounded-full px-5 py-2 text-sm font-medium transition hover:opacity-90 sm:block"
            style={{
              background: "#2F5D5A",
              color: "#fff",
            }}
          >
            Get Started
          </button>

          {/* Mobile */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full sm:hidden"
            style={{
              border: "1px solid #E7E6E3",
              color: "#4A4640",
            }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {mobileOpen && (
          <nav
            className="border-t px-4 pb-4 pt-3 sm:hidden"
            style={{
              borderColor: "#E7E6E3",
            }}
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium"
                  style={{
                    background: "#F8F8F6",
                    color: "#4A4640",
                  }}
                >
                  <Icon
                    size={16}
                    style={{
                      color: "#2F5D5A",
                    }}
                  />

                  {item.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
