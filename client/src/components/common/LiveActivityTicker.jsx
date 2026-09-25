import React, { useState, useEffect } from 'react';
import { Sparkles, Car, ShieldCheck, Crown, Leaf, X } from 'lucide-react';

const activities = [
  {
    id: 1,
    icon: ShieldCheck,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/30',
    title: 'Verified Student Network',
    text: 'Only verified college ID holders can offer & book carpool seats.',
    time: 'System',
  },
  {
    id: 2,
    icon: Leaf,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/30',
    title: 'Eco Commute Goal',
    text: 'Every shared carpool reduces carbon footprint and daily fuel expense.',
    time: 'System',
  },
  {
    id: 3,
    icon: Car,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    title: 'Post Your Ride',
    text: 'Have extra seats in your car or bike? Offer a ride to campus mates.',
    time: 'System',
  },
];

const LiveActivityTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activities.length);
        setVisible(true);
      }, 500);
    }, 6000);

    return () => clearInterval(interval);
  }, [dismissed]);

  if (dismissed) return null;

  const current = activities[currentIndex];
  const IconComponent = current.icon;

  return (
    <div
      className={`fixed bottom-6 left-6 z-40 max-w-sm w-full transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
      }`}
    >
      <div className={`p-4 rounded-2xl glass-panel border ${current.bg} shadow-2xl flex items-start gap-3 relative group`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-slate-950/80 ${current.color}`}>
          <IconComponent className="w-5 h-5" />
        </div>

        <div className="flex-1 pr-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {current.title}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">{current.time}</span>
          </div>
          <p className="text-xs text-white font-semibold mt-1 leading-snug">{current.text}</p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-slate-500 hover:text-slate-300 p-1 rounded-lg transition absolute top-2 right-2 opacity-0 group-hover:opacity-100"
          title="Dismiss Ticker"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default LiveActivityTicker;
