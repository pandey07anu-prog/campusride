import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, UserPlus, X } from 'lucide-react';

const AuthRequiredModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex: 9999, background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div className="flex items-center justify-center w-full h-full p-4">
        <div
          className="w-full max-w-[400px] relative"
          style={{
            background: '#1e1e1e',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            boxShadow: '0 0 80px rgba(0,0,0,0.5)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition"
          style={{ zIndex: 10 }}
        >
          <X className="w-4 h-4 text-[#666]" />
        </button>

        {/* Content */}
        <div className="p-8 text-center space-y-6">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'rgba(163,230,53,0.08)', border: '1px solid rgba(163,230,53,0.1)' }}
          >
            <Lock className="w-6 h-6 text-[#a3e635]" />
          </div>

          {/* Text */}
          <div>
            <h3 className="font-archivo font-extrabold text-[20px] tracking-[-0.03em] text-white">
              Sign in required
            </h3>
            <p className="text-[13px] text-[#666] mt-2 leading-[1.6] max-w-[280px] mx-auto">
              You need a verified student account to book rides and view driver contacts.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => { onClose(); navigate('/login'); }}
              className="btn-primary w-full !py-3 !text-[14px] !rounded-xl flex items-center justify-center gap-2"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => { onClose(); navigate('/register'); }}
              className="w-full py-3 rounded-xl text-[13px] font-semibold text-[#888] hover:text-white flex items-center justify-center gap-2 transition"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <UserPlus className="w-4 h-4" /> Create account
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredModal;
