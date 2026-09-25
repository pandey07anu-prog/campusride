import React from 'react';
import { Minus, Plus, IndianRupee } from 'lucide-react';

const PRESETS = [30, 50, 80, 100, 150];

export default function ContributionInput({ value, onChange, label }) {
  const amount = Number(value) || 0;

  const increment = () => onChange(String(amount + 10));
  const decrement = () => onChange(String(Math.max(0, amount - 10)));

  return (
    <div>
      {label && (
        <label className="block text-[10px] font-semibold text-[#888] uppercase tracking-[0.08em] mb-1.5">{label}</label>
      )}

      <div className="flex items-stretch gap-2.5">
        {/* Minus */}
        <button
          type="button"
          onClick={decrement}
          disabled={amount <= 0}
          className="w-12 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-20"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Minus className="w-4 h-4 text-[#888]" />
        </button>

        {/* Display */}
        <div
          className="flex-1 relative flex items-center overflow-hidden"
          style={{
            background: amount > 0 ? 'rgba(163,230,53,0.04)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${amount > 0 ? 'rgba(163,230,53,0.15)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: '12px',
            transition: 'all 0.2s ease',
          }}
        >
          <div className="flex items-center gap-1.5 pl-3.5 shrink-0">
            <IndianRupee className="w-4 h-4 text-[#a3e635]" />
          </div>
          <input
            type="number"
            min="0"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 font-archivo font-extrabold text-[22px] tracking-[-0.04em] text-center min-w-0"
            style={{ background: 'transparent', border: 'none', color: amount > 0 ? '#fff' : '#525252', outline: 'none', padding: '0 8px' }}
          />
        </div>

        {/* Plus */}
        <button
          type="button"
          onClick={increment}
          className="w-12 rounded-xl flex items-center justify-center shrink-0 transition-all"
          style={{ background: 'rgba(163,230,53,0.08)', border: '1px solid rgba(163,230,53,0.15)' }}
        >
          <Plus className="w-4 h-4 text-[#a3e635]" />
        </button>
      </div>

      {/* Preset chips */}
      <div className="grid grid-cols-5 gap-2 mt-3">
        {PRESETS.map((preset) => {
          const isActive = amount === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(String(preset))}
              className="py-2 rounded-xl text-[12px] font-bold transition-all text-center"
              style={{
                background: isActive ? 'rgba(163,230,53,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? 'rgba(163,230,53,0.25)' : 'rgba(255,255,255,0.04)'}`,
                color: isActive ? '#a3e635' : '#525252',
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              ₹{preset}
            </button>
          );
        })}
      </div>
    </div>
  );
}
