import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Smartphone, Sparkles } from 'lucide-react';

const IosInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detect iOS (iPhone/iPad/iPod)
    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    
    // Check if app is NOT already running standalone (installed PWA)
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

    // Check if user previously dismissed the prompt
    const isDismissed = localStorage.getItem('campusride_ios_prompt_dismissed');

    if (isIos && !isStandalone && !isDismissed) {
      // Delay prompt slightly for great UX
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('campusride_ios_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
      <div className="bg-[#0F172A]/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 shadow-2xl text-slate-100 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="flex-1 pr-6">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="text-sm font-bold text-white">Install CampusRide App</h3>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Add CampusRide to your iPhone Home Screen for a fast, full-screen native app experience!
            </p>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                <span className="flex items-center gap-1.5">
                  Tap the <span className="font-semibold text-white inline-flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">Share <Share className="w-3 h-3 text-emerald-400 inline" /></span> button in Safari
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                <span className="flex items-center gap-1.5">
                  Scroll down & select <span className="font-semibold text-white inline-flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">Add to Home Screen <PlusSquare className="w-3 h-3 text-emerald-400 inline" /></span>
                </span>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="mt-3 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              Got It!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IosInstallPrompt;
