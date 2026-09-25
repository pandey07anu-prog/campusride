import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { MailCheck, Phone, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

const EmailVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const state = location.state || {};
  const email = state.email || '';
  const phone = state.phone || '';

  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [whatsAppUrl, setWhatsAppUrl] = useState(state.whatsAppUrl || '');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!emailOtp && !phoneOtp) {
      showToast('Please enter the 6-digit OTP code', 'error');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/auth/verify-otps', {
        email,
        emailOtp: emailOtp || phoneOtp,
        phoneOtp: phoneOtp || emailOtp,
      });

      if (res.success) {
        if (res.data?.token) {
          localStorage.setItem('campusride_token', res.data.token);
          localStorage.setItem('campusride_user', JSON.stringify(res.data.user));
        }
        setVerified(true);
        showToast('✅ Identity & Mobile Phone verified successfully!', 'success');
        setTimeout(() => {
          window.location.href = '/find-ride';
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'OTP verification failed. Please check the codes entered.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await api.post('/auth/resend-otps', { email });
      if (res.success) {
        if (res.data?.whatsAppUrl) {
          setWhatsAppUrl(res.data.whatsAppUrl);
        }
        showToast('New OTP codes sent to your Email and WhatsApp!', 'info');
      }
    } catch (err) {
      showToast('Failed to resend OTPs', 'error');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-12">
        <div className="rounded-xl p-7 space-y-6" style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)' }}>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.3)' }}>
              <ShieldCheck className="w-6 h-6" style={{ color: '#a3e635' }} />
            </div>
            <h2 className="text-2xl font-extrabold text-white font-archivo tracking-[-0.03em]">Security & Identity OTP Verification</h2>
            <p className="text-xs text-[#888]">
              Check your email inbox, Spam/Junk folder & mobile phone to enter your 6-digit verification codes.
            </p>
          </div>

          {!verified ? (
            <form onSubmit={handleVerify} className="space-y-5 text-xs">
              
              {/* Email OTP Field */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#888] text-[11px] uppercase tracking-[0.08em] flex items-center gap-1.5">
                  <MailCheck className="w-4 h-4" style={{ color: '#a3e635' }} />
                  University Email OTP (Check inbox & Spam folder)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  placeholder="Enter 6-digit code sent to email"
                  className="rounded-lg text-[13px] text-white focus:outline-none w-full px-4 py-3 text-center text-lg font-bold font-mono tracking-widest"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  required
                />
                <span className="text-[10px] text-[#525252] block text-center">
                  Sent to {email || 'your university email'}
                </span>
              </div>

              {/* Mobile Phone SMS OTP Field */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#888] text-[11px] uppercase tracking-[0.08em] flex items-center gap-1.5">
                  <Phone className="w-4 h-4" style={{ color: '#a3e635' }} />
                  Mobile Phone SMS OTP (Check mobile messages)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value)}
                  placeholder="Enter 6-digit code sent to phone"
                  className="rounded-lg text-[13px] text-white focus:outline-none w-full px-4 py-3 text-center text-lg font-bold font-mono tracking-widest"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  required
                />
                <span className="text-[10px] text-[#525252] block text-center">
                  Sent via SMS to {phone || 'your mobile number'}
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-3.5 !rounded-xl !font-extrabold !text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  'VERIFY STUDENT BADGE & CONTINUE'
                )}
              </button>

              {whatsAppUrl && (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition text-center shadow-md"
                  style={{ background: 'rgba(163,230,53,0.12)', border: '1px solid rgba(163,230,53,0.25)', color: '#a3e635' }}
                >
                  💬 Receive / Open OTP in WhatsApp
                </a>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-xs text-[#888] hover:text-[#a3e635] flex items-center justify-center gap-1 mx-auto transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resend OTP Codes
                </button>
              </div>

            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <ShieldCheck className="w-16 h-16 mx-auto animate-bounce" style={{ color: '#a3e635' }} />
              <h4 className="text-xl font-extrabold text-white font-archivo tracking-[-0.03em]">Student Account Verified!</h4>
              <p className="text-xs text-[#888]">
                Your Email and Mobile Phone have been authenticated. Verified Student Badge unlocked!
              </p>
              <Link
                to="/find-ride"
                className="btn-primary px-6 py-3 !text-xs inline-block"
              >
                Browse Campus Rides Now
              </Link>
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
};

export default EmailVerificationPage;
