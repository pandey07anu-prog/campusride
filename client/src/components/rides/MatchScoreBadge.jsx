import React from 'react';
import { Sparkles } from 'lucide-react';

const MatchScoreBadge = ({ score = 90 }) => {
  const getStyles = () => {
    if (score >= 80) {
      return {
        background: 'linear-gradient(135deg, rgba(163,230,53,0.15) 0%, rgba(163,230,53,0.05) 100%)',
        border: '1px solid rgba(163,230,53,0.25)',
        color: '#a3e635',
        iconBg: 'rgba(163,230,53,0.2)',
      };
    }
    if (score >= 60) {
      return {
        background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(251,191,36,0.05) 100%)',
        border: '1px solid rgba(251,191,36,0.25)',
        color: '#fbbf24',
        iconBg: 'rgba(251,191,36,0.2)',
      };
    }
    return {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      color: '#a3a3a3',
      iconBg: 'rgba(255,255,255,0.06)',
    };
  };

  const s = getStyles();

  return (
    <div
      className="inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full font-bold text-[11px] tracking-wide"
      style={{ background: s.background, border: s.border, color: s.color }}
    >
      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: s.iconBg }}>
        <Sparkles className="w-2.5 h-2.5" />
      </div>
      <span>{score}% Match</span>
    </div>
  );
};

export default MatchScoreBadge;
