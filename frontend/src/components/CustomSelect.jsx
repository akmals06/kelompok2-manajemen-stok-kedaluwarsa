"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomSelect({ value, onChange, options, placeholder, className, dropdownClassName }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative h-full" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={className || "flex items-center justify-between gap-2 w-full h-full bg-transparent px-3 rounded-lg text-xs text-white focus:outline-none hover:bg-white/5 transition-colors cursor-pointer min-w-[130px]"}
      >
        <span className={!selectedOption && !value ? "text-zinc-400" : "text-white"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className={dropdownClassName || "absolute top-full mt-2 right-0 z-50 bg-[#1a1a1d] border border-white/[0.08] rounded-xl shadow-2xl py-1.5 min-w-full w-max flex flex-col animate-fade-in-up"}>
          {/* Placeholder as an option to clear */}
          <button
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`w-full block text-left px-4 py-2 text-xs transition-colors ${
              value === "" ? "bg-[#E1FF01]/10 text-[#E1FF01] font-bold" : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {placeholder}
          </button>
          
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full block text-left px-4 py-2 text-xs transition-colors ${
                value === opt.value
                  ? "bg-[#E1FF01]/10 text-[#E1FF01] font-bold"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
