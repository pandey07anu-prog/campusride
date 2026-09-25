import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { INDIAN_UNIVERSITIES } from '../constants/indianUniversities';
import OtpVerificationModal from '../components/auth/OtpVerificationModal';
import { Navigation, Mail, Lock, User, GraduationCap, CreditCard, Phone, Eye, EyeOff, ArrowRight, X } from 'lucide-react';

const RegisterPage = () => {
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('campusride_signup_draft');
      if (saved) {
        const p = JSON.parse(saved);
        return { fullName: p.fullName || '', email: p.email || '', phone: p.phone || '', password: '', confirmPassword: '', university: p.university || '', customUniversity: p.customUniversity || '', studentId: p.studentId || '' };
      }
    } catch (e) {}
    return { fullName: '', email: '', phone: '', password: '', confirmPassword: '', university: '', customUniversity: '', studentId: '', gender: 'female' };
  });

  useEffect(() => {
    try {
      localStorage.setItem('campusride_signup_draft', JSON.stringify({
        fullName: formData.fullName, email: formData.email, phone: formData.phone,
        university: formData.university, customUniversity: formData.customUniversity, studentId: formData.studentId,
      }));
    } catch (e) {}
  }, [formData.fullName, formData.email, formData.phone, formData.university, formData.customUniversity, formData.studentId]);

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otpMeta, setOtpMeta] = useState(null);

  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
  };

  const isUniversityEmail = (email) => {
    if (!email || !email.includes('@')) return false;
    const domain = email.toLowerCase().split('@')[1] || '';
    const personal = ['gmail.com','yahoo.com','hotmail.com','outlook.com','live.com','icloud.com','aol.com','protonmail.com','proton.me','zoho.com'];
    if (personal.includes(domain)) return false;
    return domain.endsWith('.edu') || domain.endsWith('.ac.in') || domain.endsWith('.edu.in') || domain.includes('.edu.') || domain.includes('.ac.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isUniversityEmail(formData.email)) {
      showToast('Use your university email (@.edu / @.ac.in).', 'error');
      return;
    }
    if (formData.password !== formData.confirmPassword) { showToast('Passwords do not match.', 'error'); return; }
    if (!PASSWORD_REGEX.test(formData.password)) { showToast('Password needs 8+ chars, A-Z, a-z, 0-9, !@#$.', 'error'); return; }
    if (!formData.phone || formData.phone.length < 8) { showToast('Enter a valid phone number.', 'error'); return; }

    const finalUni = (formData.university || '').includes('Other') && formData.customUniversity ? formData.customUniversity.trim() : formData.university;
    setLoading(true);
    try {
      const res = await api.post('/auth/send-email-otp', { ...formData, university: finalUni });
      setLoading(false);
      if (res.data) setOtpMeta(res.data);
      showToast('OTP sent to your university email.', 'success');
      setIsModalOpen(true);
    } catch (err) {
      setLoading(false);
      showToast(err.message || 'Failed to send OTP.', 'error');
    }
  };

  const StepIndicator = ({ current }) => (
    <div className="flex items-center gap-2">
      {[1, 2].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${current >= s ? 'bg-[#a3e635] text-[#171717]' : 'text-[#525252]'}`} style={current < s ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' } : {}}>
            {s}
          </div>
          {s < 2 && <div className="w-8 h-px" style={{ background: current >= s ? '#a3e635' : 'rgba(255,255,255,0.06)' }} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: '#171717' }}>

      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden" style={{ background: '#0a0a0a' }}>
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.06) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Navigation className="w-4 h-4 text-[#a3e635]" />
            </div>
            <span className="font-archivo font-extrabold text-[15px] tracking-[-0.02em]">CampusRide</span>
          </Link>

          <div className="space-y-6 max-w-md">
            <p className="uppercase tracking-[0.2em] text-[10px] font-semibold text-[#525252]">Join the Network</p>
            <h1 className="font-archivo font-black text-[42px] leading-[0.95] tracking-[-0.05em]">
              Your campus.<br />
              <span className="text-[#a3e635]">Your ride.</span>
            </h1>
            <p className="text-[14px] text-[#525252] leading-[1.7] max-w-sm">
              Create a verified student account to find or offer rides across 70+ campus routes.
            </p>
          </div>

          <div className="space-y-4">
            {[
              'University email verification',
              'Verified student badge on profile',
              'Access to all campus routes',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-[12px] text-[#a6a6a6]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#a3e635] shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-[420px] space-y-6">

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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-archivo font-extrabold text-[28px] tracking-[-0.05em] leading-none">Create account</h2>
              <StepIndicator current={step} />
            </div>
            <p className="text-[13px] text-[#525252]">One account for finding and offering campus rides</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Step 1: Identity */}
            {step === 1 && (
              <div className="space-y-4" style={{ animation: 'fade-in 0.2s ease' }}>
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-[0.1em]">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#525252] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="!pl-10" placeholder="Your full name" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-[0.1em]">University Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#525252] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="!pl-10" placeholder="you@university.edu" required />
                  </div>
                  <p className="text-[10px] text-[#fbbf24]">University email required (.edu / .ac.in)</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-[0.1em]">Student ID</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-[#525252] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input type="text" value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} className="!pl-10" placeholder="Roll no." required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-[0.1em]">Phone</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#525252] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="!pl-10" placeholder="+91" required />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-[0.1em]">University / College</label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-[#525252] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input type="text" list="uni-options" value={formData.university} onChange={(e) => setFormData({ ...formData, university: e.target.value })} className="!pl-10" placeholder="Start typing your college name" required />
                    <datalist id="uni-options">{INDIAN_UNIVERSITIES.map((u, i) => <option key={i} value={u} />)}</datalist>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-[0.1em]">Gender</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'female', label: 'Female 👧' },
                      { id: 'male', label: 'Male 👦' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: g.id })}
                        className={`py-2.5 px-4 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          formData.gender === g.id
                            ? g.id === 'female'
                              ? 'bg-pink-500 text-white border-2 border-pink-400 shadow-lg shadow-pink-500/20'
                              : 'bg-[#a3e635] text-[#171717] border-2 border-[#a3e635]'
                            : 'bg-white/5 text-[#a6a6a6] border border-white/10 hover:border-white/20'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="button" onClick={() => setStep(2)} className="btn-primary w-full">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Security */}
            {step === 2 && (
              <div className="space-y-4" style={{ animation: 'fade-in 0.2s ease' }}>
                <button type="button" onClick={() => setStep(1)} className="text-[11px] text-[#525252] hover:text-[#a6a6a6] flex items-center gap-1 transition">
                  ← Back to details
                </button>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-[0.1em]">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#525252] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="!pl-10 !pr-10" placeholder="Min 8 characters" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#525252] hover:text-[#a6a6a6] transition">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-[0.1em]">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#525252] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="!pl-10 !pr-10" placeholder="Re-enter password" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#525252] hover:text-[#a6a6a6] transition">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password strength */}
                {formData.password && (
                  <div className="p-3 rounded-lg space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { ok: passwordChecks.length, label: '8+ characters' },
                        { ok: passwordChecks.uppercase, label: 'Uppercase (A-Z)' },
                        { ok: passwordChecks.lowercase, label: 'Lowercase (a-z)' },
                        { ok: passwordChecks.number, label: 'Number (0-9)' },
                        { ok: passwordChecks.special, label: 'Symbol (!@#$)' },
                      ].map((c, i) => (
                        <span key={i} className={`text-[10px] flex items-center gap-1 ${c.ok ? 'text-[#a3e635] font-semibold' : 'text-[#525252]'}`}>
                          {c.ok ? '✓' : '○'} {c.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-[#171717]/30 border-t-[#171717] rounded-full animate-spin" />
                  ) : (
                    <>Send OTP & Verify</>
                  )}
                </button>
              </div>
            )}
          </form>

          <p className="text-[12px] text-center text-[#525252]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#a3e635] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      <OtpVerificationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} formData={formData} otpMeta={otpMeta} />
    </div>
  );
};

export default RegisterPage;
