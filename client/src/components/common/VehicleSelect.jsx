import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Car, Check } from 'lucide-react';

export default function VehicleSelect({ vehicles, selectedId, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = vehicles.find((v) => v._id === selectedId);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between !text-[12px] !py-2.5 !px-3 text-left"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: open ? '1px solid rgba(163,230,53,0.25)' : '1px solid rgba(255,255,255,0.06)',
          borderRadius: '10px',
          color: selected ? '#fff' : '#525252',
        }}
      >
        <div className="flex items-center gap-2.5">
          <Car className="w-4 h-4 text-[#525252] shrink-0" />
          {selected ? (
            <span>
              <span className="font-semibold">{selected.model}</span>
              <span className="text-[#525252] ml-1.5 font-mono text-[10px]">{selected.registrationNumber}</span>
            </span>
          ) : (
            <span>Select your vehicle</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-[#525252] transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute z-50 left-0 right-0 mt-1 overflow-hidden"
          style={{
            background: '#252525',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          {vehicles.length === 0 ? (
            <div className="px-4 py-3 text-[12px] text-[#525252]">No vehicles registered</div>
          ) : (
            vehicles.map((v) => {
              const isSelected = v._id === selectedId;
              return (
                <button
                  key={v._id}
                  type="button"
                  onClick={() => { onSelect(v._id); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: isSelected ? 'rgba(163,230,53,0.06)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Car className="w-4 h-4 text-[#525252] shrink-0" />
                  <div className="flex-1 text-left">
                    <span className="font-semibold text-[12px] block">{v.model}</span>
                    <span className="text-[10px] text-[#525252] font-mono">{v.registrationNumber} · {v.color || '—'} · {v.capacity || 4} seats</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#a3e635] shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
