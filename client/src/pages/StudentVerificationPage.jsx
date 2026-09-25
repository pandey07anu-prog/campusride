import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { ShieldCheck, Upload, CheckCircle2, ArrowRight } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const StudentVerificationPage = () => {
  const revealRef = useScrollReveal();
  const { user, updateUser } = useAuth();
  const { showToast } = useNotifications();
  const [documentUrl, setDocumentUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/verification/student', {
        verificationType: 'id_card',
        documentUrl: documentUrl || 'https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?auto=format&fit=crop&q=80&w=400',
      });
      if (res.success) {
        showToast('Verification complete! You can now offer rides.', 'success');
        setSubmitted(true);
        if (user) {
          updateUser({ ...user, verificationStatus: 'verified' });
        }
      }
    } catch (err) { showToast(err.message || 'Failed', 'error'); } finally { setLoading(false); }
  };

  const isVerified = user?.verificationStatus === 'verified';

  return (
    <MainLayout>
      <div ref={revealRef} className="max-w-lg mx-auto pb-16">

        {/* Header */}
        <section className="sr sr-up mb-10 text-center">
          <p className="uppercase tracking-[0.2em] text-[10px] font-semibold text-[#a3e635] mb-3">Verification</p>
          <h1 className="font-archivo font-black text-[36px] sm:text-[44px] tracking-[-0.05em] leading-[0.95]">
            Student<br />verification
          </h1>
          <p className="text-[13px] text-[#525252] mt-3 max-w-sm mx-auto">
            Verify your identity to unlock full platform capabilities.
          </p>
        </section>

        {/* Status bar */}
        <div style={{ background: '#1e1e1e', border: `1px solid ${isVerified ? 'rgba(163,230,53,0.15)' : 'rgba(251,191,36,0.15)'}`, borderRadius: '12px' }} className="p-4 flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#666] block mb-0.5">Current Status</span>
            <span className="font-archivo font-bold text-[14px] capitalize">{user?.verificationStatus || 'unverified'}</span>
          </div>
          {isVerified ? (
            <span className="badge-verified flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified</span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: 'rgba(251,191,36,0.08)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.12)' }}>Action Required</span>
          )}
        </div>

        {/* Form / Success */}
        <div style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }} className="p-6">
          {!submitted && !isVerified ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#888] uppercase tracking-[0.08em] mb-1.5">Student ID Document URL</label>
                <input
                  type="url"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://example.com/student-id.jpg"
                  className="!text-[13px]"
                />
                <span className="text-[10px] text-[#525252] mt-1.5 block">Supports JPG, PNG of university roll card or library ID.</span>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center !rounded-xl !py-3 disabled:opacity-50">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-[#171717]/30 border-t-[#171717] rounded-full animate-spin" />
                ) : (
                  <>Submit ID for Approval <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.1)' }}>
                <CheckCircle2 className="w-8 h-8 text-[#a3e635]" />
              </div>
              <h4 className="font-archivo font-bold text-[18px] tracking-[-0.03em]">
                {isVerified ? 'You are verified' : 'Under review'}
              </h4>
              <p className="text-[12px] text-[#525252] max-w-xs mx-auto">
                {isVerified
                  ? 'Your student identity has been verified. You have full platform access.'
                  : 'Your ID is being reviewed by campus admins. You will get an alert upon approval.'}
              </p>
              {isVerified && (
                <div className="pt-2">
                  <Link to="/offer-ride" className="btn-primary shimmer inline-flex items-center justify-center gap-2 !py-2.5 !px-6 !text-[13px] !rounded-xl">
                    Offer a Ride Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default StudentVerificationPage;
