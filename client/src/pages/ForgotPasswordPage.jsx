import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { KeyRound, Mail, ArrowRight, ShieldCheck, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const ForgotPasswordPage = () => {
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter your university email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.success) {
        showToast(`Password reset OTP sent to ${email}! Please check your inbox.`, 'success');
        setStep(2);
      }
    } catch (err) {
      showToast(err.message || 'Failed to send password reset code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      showToast('Please enter the 6-digit OTP code received in your email.', 'error');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match. Please check again.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });

      if (res.success) {
        showToast('Password reset successfully! Please sign in with your new password.', 'success');
        navigate('/login');
      }
    } catch (err) {
      showToast(err.message || 'Password reset failed. Please verify your OTP code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="rounded-xl p-7 space-y-6" style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)' }}>

          <div className="text-center space-y-1.5">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto" style={{ background: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.2)' }}>
              <KeyRound className="w-5 h-5 text-[#a3e635]" />
            </div>
            <h2 className="font-archivo font-bold text-[20px] tracking-[-0.03em]">Reset Account Password</h2>
            <p className="text-[12px] text-[#525252]">
              {step === 1
                ? 'Enter your registered university email to receive a 6-digit verification OTP.'
                : `Enter the 6-digit OTP sent to ${email} and set your new password.`}
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-[#888] uppercase tracking-[0.08em]">University Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#525252] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pr-3 py-2.5 rounded-lg text-[13px] text-white focus:outline-none font-medium"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', paddingLeft: '2.75rem' }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-3 !text-[13px] !rounded-xl flex items-center justify-center gap-2"
              >
                {loading ? 'Sending Verification OTP...' : 'Send Reset Code'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-[#888] uppercase tracking-[0.08em]">6-Digit Verification OTP Code</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-[#a3e635] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="e.g. 849201"
                    className="w-full pr-3 py-2.5 rounded-lg text-[13px] text-white font-mono tracking-widest focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', paddingLeft: '2.75rem' }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-[#888] uppercase tracking-[0.08em]">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#525252] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pr-9 py-2.5 rounded-lg text-[13px] text-white focus:outline-none font-medium"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', paddingLeft: '2.75rem' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-[#525252] hover:text-white transition"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-[#888] uppercase tracking-[0.08em]">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#525252] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pr-9 py-2.5 rounded-lg text-[13px] text-white focus:outline-none font-medium"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', paddingLeft: '2.75rem' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-[#525252] hover:text-white transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-3 !text-[13px] !rounded-xl flex items-center justify-center gap-2"
              >
                {loading ? 'Updating Password...' : 'Reset Password Now'}
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-2 text-[12px] text-[#525252] hover:text-white transition text-center"
              >
                &larr; Re-enter Email
              </button>
            </form>
          )}

          <div className="text-center pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Link to="/login" className="text-[12px] text-[#525252] hover:text-[#a3e635] font-medium transition">
              Back to Sign In
            </Link>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default ForgotPasswordPage;
