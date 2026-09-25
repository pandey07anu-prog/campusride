import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { ShieldCheck, Mail, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';

const VerifyAccountPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const state = location.state || {};
  const email = state.email || '';

  // Verification States
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // Complete Signup Loading State
  const [completing, setCompleting] = useState(false);

  // Resend Timers & Attempts (60-second cooldowns, max 3 attempts)
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [emailAttemptsLeft, setEmailAttemptsLeft] = useState(3);

  // Mount Check: Ensure pending signup email exists
  useEffect(() => {
    if (!email) {
      showToast('No active pending signup session found. Please sign up again 🎓', 'warning');
      navigate('/register');
    }
  }, [email, navigate]);

  // 60-Second Cooldown Timer effect for Email
  useEffect(() => {
    let timer;
    if (emailCooldown > 0) {
      timer = setInterval(() => setEmailCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [emailCooldown]);

  // Step 1: Verify Email OTP
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!emailOtp || emailOtp.trim().length < 6) {
      showToast('Please enter the 6-digit Email OTP code', 'error');
      return;
    }

    setEmailLoading(true);
    try {
      const res = await api.post('/auth/verify-email-otp', {
        email,
        otp: emailOtp,
      });

      if (res.success) {
        setEmailVerified(true);
        showToast('University Email address verified successfully! ✉️', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Invalid or expired Email OTP code.', 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  // Step 2: Resend Email OTP
  const handleResendEmail = async () => {
    if (emailCooldown > 0 || emailAttemptsLeft <= 0) return;
    try {
      const res = await api.post('/auth/resend-email-otp', { email });
      if (res.success) {
        setEmailCooldown(60);
        if (res.data?.resendsLeft !== undefined) {
          setEmailAttemptsLeft(res.data.resendsLeft);
        } else {
          setEmailAttemptsLeft((prev) => prev - 1);
        }
        showToast('New 6-digit Email OTP code sent to your inbox!', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to resend Email OTP.', 'error');
    }
  };

  // Step 3: Complete Account Registration
  const handleCompleteRegistration = async () => {
    if (!emailVerified) {
      showToast('You must verify your University Email OTP before account creation.', 'error');
      return;
    }

    setCompleting(true);
    try {
      const res = await api.post('/auth/complete-signup', { email });
      if (res.success) {
        const { user: userData, token: jwtToken } = res.data;
        localStorage.setItem('campusride_token', jwtToken);
        localStorage.setItem('campusride_user', JSON.stringify(userData));
        showToast('🎉 Account created & verified successfully! Welcome to CampusRide.', 'success');
        setTimeout(() => {
          window.location.href = '/find-ride';
        }, 1200);
      }
    } catch (err) {
      const msg = err.message || 'Signup session expired. Please sign up again.';
      showToast(msg, 'error');
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('not found')) {
        setTimeout(() => {
          navigate('/register');
        }, 1500);
      }
    } finally {
      setCompleting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto py-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.3)' }}>
            <ShieldCheck className="w-6 h-6" style={{ color: '#a3e635' }} />
          </div>
          <h2 className="text-2xl font-extrabold text-white font-archivo tracking-[-0.03em]">University Email Verification</h2>
          <p className="text-xs text-[#888] max-w-md mx-auto">
            Verify your official <span className="font-bold" style={{ color: '#a3e635' }}>University Email OTP</span> to create your verified student account.
          </p>
        </div>

        {/* Status Tracker Banner */}
        <div className="p-4 rounded-2xl text-xs" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className={`p-3 rounded-xl border flex items-center justify-between ${emailVerified ? '' : ''}`} style={emailVerified ? { background: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.3)', color: '#a3e635' } : { background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', color: '#888' }}>
            <span className="font-bold flex items-center gap-1.5">
              <Mail className="w-4 h-4" /> Email Status ({email || 'Student Email'}):
            </span>
            <span className="font-extrabold text-[11px] uppercase tracking-wider">{emailVerified ? 'VERIFIED' : 'PENDING'}</span>
          </div>
        </div>

        {/* Verification Card: Email Verification */}
        <div className="rounded-xl p-7 space-y-4 text-xs transition" style={emailVerified ? { background: '#1e1e1e', border: '1px solid rgba(163,230,53,0.3)' } : { background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2 font-archivo tracking-[-0.03em]">
              <Mail className="w-4 h-4" style={{ color: '#a3e635' }} />
              Verify University Email ({email || 'student@university.edu'})
            </h3>
            {emailVerified && (
              <span className="px-2.5 py-1 rounded-full font-bold text-[10px] flex items-center gap-1" style={{ background: 'rgba(163,230,53,0.15)', color: '#a3e635', border: '1px solid rgba(163,230,53,0.25)' }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
              </span>
            )}
          </div>

          {!emailVerified ? (
            <form onSubmit={handleVerifyEmail} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  placeholder="Enter 6-digit Email OTP"
                  className="flex-1 rounded-lg text-[13px] text-white focus:outline-none px-4 py-2.5 text-center font-mono font-bold text-sm"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  required
                />
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="btn-primary px-5 !py-2.5 !rounded-xl !text-xs flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                >
                  {emailLoading ? 'Verifying...' : 'Verify Email OTP'}
                </button>
              </div>

              <div className="flex justify-between items-center text-[11px] text-[#888] pt-1">
                <span>Attempts left: {emailAttemptsLeft}/3</span>
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={emailCooldown > 0 || emailAttemptsLeft <= 0}
                  className="font-bold hover:underline disabled:opacity-40 flex items-center gap-1 cursor-pointer transition"
                  style={{ color: '#a3e635' }}
                >
                  <RefreshCw className="w-3 h-3" />
                  {emailCooldown > 0 ? `Resend in ${emailCooldown}s` : 'Resend Email OTP'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs font-semibold" style={{ color: '#a3e635' }}>Email verified! Student domain check complete.</p>
          )}
        </div>

        {/* Final Account Creation Trigger */}
        <button
          onClick={handleCompleteRegistration}
          disabled={!emailVerified || completing}
          className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition shadow-xl ${
            emailVerified
              ? 'btn-primary animate-pulse'
              : 'cursor-not-allowed'
          }`}
          style={!emailVerified ? { background: '#1e1e1e', color: '#525252', border: '1px solid rgba(255,255,255,0.06)' } : {}}
        >
          {completing ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              {emailVerified ? '🎉 CREATE OFFICIAL STUDENT ACCOUNT & LOG IN' : 'VERIFY EMAIL OTP TO CREATE ACCOUNT'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </div>
    </MainLayout>
  );
};

export default VerifyAccountPage;
