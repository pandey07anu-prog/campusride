import React, { useState, useEffect } from 'react';
import { Palette, Sparkles, Check } from 'lucide-react';

const themes = [
  { id: 'emerald', name: 'Emerald Cyber', color: '#10b981', class: '' },
  { id: 'cyan', name: 'Electric Cyan', color: '#06b6d4', class: 'theme-cyan' },
  { id: 'violet', name: 'Ultra Violet', color: '#8b5cf6', class: 'theme-violet' },
  { id: 'amber', name: 'Amber Gold', color: '#f59e0b', class: 'theme-amber' },
  { id: 'rose', name: 'Crimson Rose', color: '#f43f5e', class: 'theme-rose' },
  { id: 'blue', name: 'Sapphire Blue', color: '#3b82f6', class: 'theme-blue' },
];

const ThemeGlowSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState('emerald');
  const [open, setOpen] = useState(false);

  const applyTheme = (theme) => {
    setCurrentTheme(theme.id);
    localStorage.setItem('campusride_glow_theme', theme.id);
    const root = document.documentElement;
    root.classList.remove('theme-cyan', 'theme-violet', 'theme-amber', 'theme-rose', 'theme-blue');
    if (theme.class) {
      root.classList.add(theme.class);
    }
  };

  useEffect(() => {
    const savedThemeId = localStorage.getItem('campusride_glow_theme');
    if (savedThemeId) {
      const found = themes.find((t) => t.id === savedThemeId);
      if (found) {
        applyTheme(found);
      }
    }
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="mb-3 p-3 rounded-2xl glass-panel border border-slate-800 shadow-2xl space-y-2 animate-fade-in text-xs w-52">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Accent Glow Theme</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTheme(t)}
                className={`w-full p-2 rounded-xl flex items-center justify-between font-semibold transition ${
                  currentTheme === t.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shadow" style={{ backgroundColor: t.color }} />
                  <span>{t.name}</span>
                </div>
                {currentTheme === t.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-emerald-500 text-slate-200 flex items-center justify-center shadow-2xl hover:scale-105 transition-all group"
        title="Customize Glow Theme"
      >
        <Palette className="w-5 h-5 group-hover:rotate-12 transition-transform text-emerald-400" />
      </button>
    </div>
  );
};

export default ThemeGlowSwitcher;
