"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ReferenceDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full bg-white border rounded-xl p-3 flex items-center justify-between shadow-sm hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          {selectedOption?.icon ? (
            <img
              src={selectedOption.icon}
              alt={selectedOption.label}
              className="w-7 h-7 rounded-md object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-md bg-gray-200" />
          )}

          <span className="text-sm text-gray-700 font-medium">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border p-2 z-50"
          >
            <div className="max-h-60 overflow-auto pr-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  {opt.icon ? (
                    <img
                      src={opt.icon}
                      alt={opt.label}
                      className="w-9 h-9 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-gray-200" />
                  )}

                  <span className="text-sm text-gray-700 font-medium flex-1 text-left">
                    {opt.label}
                  </span>

                  {value === opt.value && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReferenceDropdown;
