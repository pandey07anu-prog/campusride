import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { Navigation, Mail, Lock, Smartphone, ShieldCheck, KeyRound, ArrowRight, RefreshCw, Eye, EyeOff, X } from 'lucide-react';

const LoginPage = () => {
  const { loginUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [loginMode, setLoginMode] = useState('otp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    const res = await loginUser(email, password);
    setPasswordLoading(false);
    if (res.success) {
      showToast('Welcome back!', 'success');
      navigate('/find-ride');
    } else {
      showToast(res.message || 'Login failed.', 'error');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!identifier || identifier.trim().length < 4) {
      showToast('Enter a valid email or phone.', 'error');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await api.post('/auth/send-login-otp', { identifier });
      if (res.success) {
        showToast('OTP sent to your email.', 'success');
        setOtpStep(2);
      }
    } catch (err) {
      showToast(err.message || 'Failed to send OTP.', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!emailOtp || emailOtp.trim().length < 6) {
      showToast('Enter the 6-digit OTP.', 'error');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await api.post('/auth/verify-login-otp', {
        identifier,
        emailOtp,
        phoneOtp: emailOtp,
      });
      if (res.success) {
        const { user: userData, token: jwtToken } = res.data;
        localStorage.setItem('campusride_token', jwtToken);
        localStorage.setItem('campusride_user', JSON.stringify(userData));
        showToast('Verified! Welcome back.', 'success');
        window.location.href = '/find-ride';
      }
    } catch (err) {
      showToast(err.message || 'OTP verification failed.', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#171717' }}>

      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden" style={{ background: '#0a0a0a' }}>
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Gradient orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.06) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Navigation className="w-4 h-4 text-[#a3e635]" />
            </div>
            <span className="font-archivo font-extrabold text-[15px] tracking-[-0.02em]">CampusRide</span>
          </Link>

          {/* Center content */}
          <div className="space-y-6 max-w-md">
            <p className="uppercase tracking-[0.2em] text-[10px] font-semibold text-[#525252]">Verified Student Network</p>
            <h1 className="font-archivo font-black text-[42px] leading-[0.95] tracking-[-0.05em]">
              Share the ride.<br />
              <span className="text-[#a3e635]">Split the fare.</span>
            </h1>
            <p className="text-[14px] text-[#525252] leading-[1.7] max-w-sm">
              Join 500+ verified students across 70+ campus routes. Safe, affordable daily commute sharing.
            </p>
          </div>

          {/* Bottom stats */}
          <div className="flex gap-8">
            {[
              { value: '500+', label: 'Students' },
              { value: '70+', label: 'Routes' },
              { value: '₹10K+', label: 'Split' },
            ].map((s, i) => (
              <div key={i}>
                <div className="font-archivo font-extrabold text-[20px] tracking-[-0.04em] text-white">{s.value}</div>
                <div className="text-[10px] text-[#525252] uppercase tracking-[0.1em]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Auth Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-[400px] space-y-8">

          {/* Close button */}
          <Link to="/" className="absolute top-6 right-6 w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <X className="w-4 h-4 text-[#666]" />
          </Link>

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2.5 lg:hidden">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Navigation className="w-4 h-4 text-[#a3e635]" />
            </div>
            <span className="font-archivo font-extrabold text-[15px] tracking-[-0.02em]">CampusRide</span>
          </Link>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="font-archivo font-extrabold text-[28px] tracking-[-0.05em] leading-none">Welcome back</h2>
            <p className="text-[13px] text-[#525252]">Sign in to your verified student account</p>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {[
              { id: 'otp', label: 'Email OTP', icon: Smartphone },
              { id: 'password', label: 'Password', icon: Lock },
            ].map(({ id, label, icon: Ic }) => (
              <button
                key={id}
                onClick={() => setLoginMode(id)}
                className={`flex-1 py-2 rounded-md text-[12px] font-medium flex items-center justify-center gap-1.5 transition-all ${
                  loginMode === id
                    ? 'bg-[#171717] text-white shadow-sm'
                    : 'text-[#525252] hover:text-[#a6a6a6]'
                }`}
                style={loginMode === id ? { border: '1px solid rgba(255,255,255,0.06)' } : {}}
              >
                <Ic className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* OTP Mode */}
          {loginMode === 'otp' && (
            <>
              {otpStep === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-[0.1em]">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#525252] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="you@university.edu"
                        className="!pl-10"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={otpLoading} className="btn-primary w-full">
                    {otpLoading ? (
                      <div className="w-4 h-4 border-2 border-[#171717]/30 border-t-[#171717] rounded-full animate-spin" />
                    ) : (
                      <>Continue with OTP <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-[0.1em]">Enter 6-digit code</label>
                      <button type="button" onClick={() => setOtpStep(1)} className="text-[11px] text-[#a3e635] hover:underline">Change email</button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-[#525252] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        maxLength={6}
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        placeholder="000000"
                        className="!pl-10 !text-center !text-lg !font-mono !tracking-[0.3em]"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-[#525252]">Sent to <span className="text-[#a6a6a6]">{identifier}</span></p>
                  </div>
                  <button type="submit" disabled={otpLoading} className="btn-primary w-full">
                    {otpLoading ? (
                      <div className="w-4 h-4 border-2 border-[#171717]/30 border-t-[#171717] rounded-full animate-spin" />
                    ) : (
                      <>Verify & Sign In <ShieldCheck className="w-4 h-4" /></>
                    )}
                  </button>
                  <button type="button" onClick={handleSendOtp} className="w-full text-center text-[12px] text-[#525252] hover:text-[#a6a6a6] flex items-center justify-center gap-1.5 transition">
                    <RefreshCw className="w-3 h-3" /> Resend code
                  </button>
                </form>
              )}
            </>
          )}

          {/* Password Mode */}
          {loginMode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-[0.1em]">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#525252] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    className="!pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-[0.1em]">Password</label>
                  <Link to="/forgot-password" className="text-[11px] text-[#a3e635] hover:underline">Forgot?</Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#525252] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="!pl-10 !pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#525252] hover:text-[#a6a6a6] transition">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={passwordLoading} className="btn-primary w-full">
                {passwordLoading ? (
                  <div className="w-4 h-4 border-2 border-[#171717]/30 border-t-[#171717] rounded-full animate-spin" />
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <p className="text-[12px] text-center text-[#525252]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#a3e635] font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
