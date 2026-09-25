import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Mail, CheckCircle2, RefreshCw, X, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

const OtpVerificationModal = ({ isOpen, onClose, formData, otpMeta: initialOtpMeta }) => {
  const { showToast } = useNotifications();
  const [currentOtpMeta, setCurrentOtpMeta] = useState(initialOtpMeta || {});

  useEffect(() => {
    if (initialOtpMeta) {
      setCurrentOtpMeta(initialOtpMeta);
    }
  }, [initialOtpMeta]);

  // Masking Utilities
  const maskEmail = (str) => {
    if (!str || !str.includes('@')) return str;
    const [name, domain] = str.split('@');
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
  };

  const email = formData?.email || '';

  // Email OTP States
  const [emailOtpDigits, setEmailOtpDigits] = useState(['', '', '', '', '', '']);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(60);
  const [emailAttemptsLeft, setEmailAttemptsLeft] = useState(3);
  const emailInputRefs = useRef([]);

  const [completing, setCompleting] = useState(false);

  // Email Cooldown Timer
  useEffect(() => {
    let timer;
    if (emailCooldown > 0) {
      timer = setInterval(() => setEmailCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [emailCooldown]);

  if (!isOpen) return null;

  // Handle Email OTP Digit Input Auto-Focus
  const handleEmailDigitChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newDigits = [...emailOtpDigits];
    newDigits[index] = value;
    setEmailOtpDigits(newDigits);

    if (value && index < 5) {
      emailInputRefs.current[index + 1]?.focus();
    }
  };

  const handleEmailKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !emailOtpDigits[index] && index > 0) {
      emailInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify Email OTP
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    const fullOtp = emailOtpDigits.join('');
    if (fullOtp.length < 6) {
      showToast('Please enter the complete 6-digit Email OTP code', 'error');
      return;
    }

    setEmailLoading(true);
    try {
      const res = await api.post('/auth/verify-email-otp', {
        email,
        otp: fullOtp,
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

  // Resend Email OTP
  const handleResendEmail = async () => {
    if (emailCooldown > 0 || emailAttemptsLeft <= 0) return;
    try {
      const res = await api.post('/auth/resend-email-otp', { email });
      if (res.success) {
        setEmailCooldown(60);
        setEmailAttemptsLeft((prev) => Math.max(0, prev - 1));
        setEmailOtpDigits(['', '', '', '', '', '']);
        showToast('New 6-digit Email OTP code dispatched! Check your inbox & spam folder.', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to resend Email OTP.', 'error');
    }
  };

  // Final Action: Create Student Account & Log In
  const handleCreateAccount = async () => {
    if (!emailVerified) {
      showToast('Please verify your University Email OTP to complete signup.', 'error');
      return;
    }

    setCompleting(true);
    try {
      const res = await api.post('/auth/complete-signup', { email });
      if (res.success) {
        const { user: userData, token: jwtToken } = res.data;
        localStorage.setItem('campusride_token', jwtToken);
        localStorage.setItem('campusride_user', JSON.stringify(userData));
        showToast('🎉 Student Account created & verified successfully!', 'success');
        setTimeout(() => {
          window.location.href = '/find-ride';
        }, 1200);
      }
    } catch (err) {
      const msg = err.message || 'Signup session expired. Please sign up again.';
      showToast(msg, 'error');
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('not found')) {
        setTimeout(() => {
          onClose();
          window.location.href = '/register';
        }, 1500);
      }
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="relative w-full max-w-md p-6 md:p-8 rounded-2xl space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]"
        style={{ background: '#1e1e1e', border: '1px solid rgba(255, 255, 255, 0.06)' }}
      >

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-[#666] hover:text-white transition-all cursor-pointer"
          style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'rgba(163, 230, 53, 0.08)', border: '1px solid rgba(163, 230, 53, 0.15)' }}
          >
            <ShieldCheck className="w-6 h-6 text-[#a3e635]" />
          </div>
          <h3 className="font-archivo font-extrabold text-[20px] tracking-[-0.03em] text-white">Student Email Verification</h3>
          <p className="text-[13px] text-[#666]">
            Verify your <strong className="text-white font-medium">University Email OTP</strong> to activate your student account.
          </p>
        </div>

        {/* ✉️ University Email OTP Card */}
        <div
          className="p-5 rounded-xl transition-all space-y-4 text-xs"
          style={{
            background: emailVerified ? 'rgba(163, 230, 53, 0.04)' : '#171717',
            border: emailVerified ? '1px solid rgba(163, 230, 53, 0.2)' : '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white flex items-center gap-1.5 text-[13px]">
              <Mail className="w-4 h-4 text-[#a3e635]" />
              University Email ({maskEmail(email)})
            </span>
            {emailVerified ? (
              <span
                className="px-2.5 py-1 rounded-full font-bold text-[10px] flex items-center gap-1"
                style={{ background: 'rgba(163, 230, 53, 0.12)', color: '#a3e635', border: '1px solid rgba(163, 230, 53, 0.25)' }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
              </span>
            ) : (
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#666' }}
              >
                Pending
              </span>
            )}
          </div>

          {!emailVerified ? (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              {/* 6 OTP Input Boxes */}
              <div className="flex justify-between gap-2 pt-1">
                {emailOtpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (emailInputRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleEmailDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleEmailKeyDown(idx, e)}
                    className="w-10 h-12 rounded-xl text-center font-mono font-bold text-lg focus:outline-none transition-all"
                    style={{
                      background: '#1e1e1e',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#a3e635',
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={emailCooldown > 0 || emailAttemptsLeft <= 0}
                  className="text-[12px] text-[#666] hover:text-[#a3e635] font-medium flex items-center gap-1 disabled:opacity-40 cursor-pointer transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  {emailCooldown > 0 ? `Resend in ${emailCooldown}s` : `Resend Email OTP (${emailAttemptsLeft}/3)`}
                </button>

                <button
                  type="submit"
                  disabled={emailLoading}
                  className="btn-primary !py-2.5 !px-5 !text-[12px] !rounded-xl"
                >
                  {emailLoading ? 'Verifying...' : 'Verify Email OTP'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-[#a3e635] text-xs font-semibold">✅ Email address verified successfully.</p>
          )}
        </div>

        {/* Final Button: Create Student Account */}
        <button
          onClick={handleCreateAccount}
          disabled={!emailVerified || completing}
          className={`w-full py-3.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all ${
            emailVerified
              ? 'btn-primary'
              : 'text-[#525252] cursor-not-allowed'
          }`}
          style={!emailVerified ? { background: '#171717', border: '1px solid rgba(255, 255, 255, 0.04)' } : {}}
        >
          {completing ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              {emailVerified ? 'Complete Signup & Create Account' : 'Verify Email OTP to Continue'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </div>
    </div>
  );
};

export default OtpVerificationModal;
