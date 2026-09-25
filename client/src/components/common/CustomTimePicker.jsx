import React, { useRef } from 'react';
import { Clock } from 'lucide-react';

export default function CustomTimePicker({ value, onChange, label, required = false }) {
  const inputRef = useRef(null);

  const handleClick = (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        try {
          inputRef.current.showPicker();
        } catch (err) {
          inputRef.current.focus();
        }
      } else {
        inputRef.current.focus();
      }
    }
  };

  const handleInputClick = (e) => {
    if (typeof e.target.showPicker === 'function') {
      try {
        e.target.showPicker();
      } catch (err) {
        // Fallback
      }
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-semibold text-[#666] uppercase tracking-[0.1em] mb-1.5">{label}</label>
      )}
      <div 
        onClick={handleClick}
        className="relative flex items-center bg-[#262626] hover:bg-[#2c2c2c] border border-white/10 focus-within:border-[#a3e635] rounded-xl px-3.5 py-2.5 cursor-pointer transition-all group"
      >
        <input
          ref={inputRef}
          type="time"
          value={value || ''}
          required={required}
          onClick={handleInputClick}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-[13px] text-white font-medium outline-none cursor-pointer border-none p-0 [color-scheme:dark]"
        />
        <Clock className={`w-4 h-4 shrink-0 pointer-events-none transition-all ml-2 group-hover:scale-110 ${value ? 'text-[#a3e635]' : 'text-[#888]'}`} />
      </div>
    </div>
  );
}
