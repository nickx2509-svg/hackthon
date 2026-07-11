"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Search, Check } from "lucide-react";

interface SearchableComboboxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  allowCreate?: boolean;
  error?: string;
}

function SearchableCombobox({
  label,
  value,
  onChange,
  options,
  placeholder,
  allowCreate = true,
  error,
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [value]);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const exactMatch = options.some(
    (opt) => opt.toLowerCase() === query.trim().toLowerCase(),
  );
  const canCreate = allowCreate && query.trim().length > 0 && !exactMatch;

  function selectOption(opt: string) {
    onChange(opt);
    setQuery(opt);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0) {
        selectOption(filtered[0]);
      } else if (canCreate) {
        selectOption(query.trim());
      }
    }
    if (e.key === "Escape") {
      setOpen(false);
      setQuery(value);
      (e.target as HTMLInputElement).blur();
    }
  }

  return (
    <div
      ref={rootRef}
      className="relative combo-root"
      style={
        {
          "--combo-border": error ? "#C7714F" : "#E9E8E6",
          "--combo-border-hover": error ? "#C7714F" : "#B9D6D2",
        } as React.CSSProperties
      }
    >
      <label
        className="block text-sm font-medium mb-1.5"
        style={{ color: "#0B0B0B" }}
      >
        {label}
      </label>

      <div className="relative combo-shell rounded-lg">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#9A9A94" }}
        />
        <input
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-lg pl-9 pr-9 py-2.5 text-sm outline-none bg-transparent"
          style={{ color: "#0B0B0B" }}
        />
        <ChevronDown
          size={15}
          className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          style={{ color: "#9A9A94" }}
        />
      </div>

      {open && (
        <div
          className="absolute z-20 mt-1.5 w-full rounded-lg overflow-hidden shadow-lg max-h-56 overflow-y-auto"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E9E8E6",
            boxShadow: "0 16px 34px -18px rgba(11,11,11,0.28)",
          }}
        >
          {filtered.length === 0 && !canCreate && (
            <p className="px-3.5 py-2.5 text-xs" style={{ color: "#9A9A94" }}>
              No matches found
            </p>
          )}

          {filtered.map((opt) => {
            const selected = opt === value;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => selectOption(opt)}
                className="w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between gap-2 transition-colors duration-150 combo-option"
                style={{
                  color: selected ? "#2F5D5A" : "#0B0B0B",
                  backgroundColor: selected ? "#EEF3F2" : "transparent",
                }}
              >
                <span className="truncate">{opt}</span>
                {selected && (
                  <Check
                    size={14}
                    className="flex-shrink-0"
                    style={{ color: "#2F5D5A" }}
                  />
                )}
              </button>
            );
          })}

          {canCreate && (
            <button
              type="button"
              onClick={() => selectOption(query.trim())}
              className="w-full text-left px-3.5 py-2.5 text-sm flex items-center gap-2 transition-colors duration-150 combo-option"
              style={{
                color: "#2F5D5A",
                borderTop: filtered.length ? "1px solid #E9E8E6" : "none",
              }}
            >
              <Plus size={14} />
              Create &ldquo;{query.trim()}&rdquo;
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs" style={{ color: "#B5502E" }}>
          {error}
        </p>
      )}

      <style jsx>{`
        .combo-shell {
          border: 1px solid var(--combo-border);
          background-color: #ffffff;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }
        .combo-shell:hover {
          border-color: var(--combo-border-hover);
        }
        .combo-shell:focus-within {
          border-color: #2f5d5a;
          box-shadow: 0 0 0 3px #2f5d5a22;
        }
        .combo-option:hover {
          background-color: #f3f8f7 !important;
          color: #2f5d5a !important;
        }
      `}</style>
    </div>
  );
}

export default SearchableCombobox;
