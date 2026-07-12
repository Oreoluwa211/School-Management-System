import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomSelect({ value, onChange, options, placeholder = "Select", error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => (typeof o === "string" ? o === value : o.value === value));
  const selectedLabel = selected ? (typeof selected === "string" ? selected : selected.label) : "";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full px-4 py-2.5 rounded-xl2 border bg-white text-sm text-left flex items-center justify-between gap-2 transition-all duration-200 focus:outline-none ${
          error
            ? "border-red-400 ring-2 ring-red-100"
            : open
            ? "border-gold ring-2 ring-gold/20"
            : "border-navy/15 hover:border-gold/40"
        } ${selectedLabel ? "text-navy" : "text-navy/40"}`}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-gold-dark shrink-0" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-30 mt-2 w-full bg-white border border-gold/20 rounded-xl2 shadow-card max-h-60 overflow-auto py-1"
          >
            {options.map((opt) => {
              const optValue = typeof opt === "string" ? opt : opt.value;
              const optLabel = typeof opt === "string" ? opt : opt.label;
              const isSelected = optValue === value;
              return (
                <button
                  key={optValue}
                  type="button"
                  onClick={() => { onChange(optValue); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-2 text-sm text-left transition-colors duration-150 ${
                    isSelected ? "bg-gold/10 text-navy font-medium" : "text-navy/70 hover:bg-gold/5 hover:text-navy"
                  }`}
                >
                  {optLabel}
                  {isSelected && <Check size={14} className="text-gold-dark" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}