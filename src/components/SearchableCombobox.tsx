"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Search } from "lucide-react";

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

  return (
    <div ref={rootRef} className="relative">
      <label
        className="block text-sm font-medium mb-1.5"
        style={{ color: "#0B0B0B" }}
      >
        {label}
      </label>

      <div className="relative">
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
          placeholder={placeholder}
          className="w-full rounded-lg pl-9 pr-9 py-2.5 text-sm outline-none transition-colors focus:ring-2"
          style={{
            backgroundColor: "#FFFFFF",
            border: `1px solid ${error ? "#C7714F" : "#E9E8E6"}`,
            color: "#0B0B0B",
            ["--tw-ring-color" as any]: "#2F5D5A33",
          }}
        />
        <ChevronDown
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#9A9A94" }}
        />
      </div>

      {open && (
        <div
          className="absolute z-20 mt-1.5 w-full rounded-lg overflow-hidden shadow-lg max-h-56 overflow-y-auto"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E9E8E6" }}
        >
          {filtered.length === 0 && !canCreate && (
            <p className="px-3.5 py-2.5 text-xs" style={{ color: "#9A9A94" }}>
              No matches found
            </p>
          )}

          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => selectOption(opt)}
              className="w-full text-left px-3.5 py-2.5 text-sm transition-colors hover:bg-black/[0.03]"
              style={{
                color: "#0B0B0B",
                backgroundColor: opt === value ? "#F3F1EC" : "transparent",
              }}
            >
              {opt}
            </button>
          ))}

          {canCreate && (
            <button
              type="button"
              onClick={() => selectOption(query.trim())}
              className="w-full text-left px-3.5 py-2.5 text-sm flex items-center gap-2 transition-colors hover:bg-black/[0.03]"
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
    </div>
  );
}

export default SearchableCombobox;
