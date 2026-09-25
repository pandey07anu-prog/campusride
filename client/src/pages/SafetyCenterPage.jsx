import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ShieldCheck, PhoneCall, EyeOff, FileWarning, AlertOctagon, CheckCircle2 } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const SafetyCenterPage = () => {
  const revealRef = useScrollReveal();
  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [reportedUserId, setReportedUserId] = useState('');
  const [category, setCategory] = useState('harassment');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.gender !== 'female') {
      showToast('Access Restricted: Campus Safety Center is strictly for female commuters.', 'error');
      navigate('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await api.get('/users/all');
        if (res?.data && Array.isArray(res.data)) {
          setUsersList(res.data.filter(u => u._id !== user?._id));
        }
      } catch (e) {
        // Fallback default list
        setUsersList([
          { _id: 'u2', fullName: 'Yashit Mittal', email: 'yashit3075.beai24@chitkara.edu.in' },
          { _id: 'u3', fullName: 'Shubham Thakur', email: 'shubham1278.becse25@chitkara.edu.in' },
          { _id: 'u4', fullName: 'Parth', email: 'parth3302.beai24@chitkara.edu.in' },
          { _id: 'u6', fullName: 'Harjot Singh', email: 'harjot0093.becse25@chitkara.edu.in' },
        ]);
      }
    };
    fetchUsers();
  }, [user, navigate]);

  if (!user || user.gender !== 'female') {
    return null;
  }

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportedUserId) {
      showToast('Please select the user you wish to report.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/features/report', {
        reportedUserId,
        category,
        description,
      });
      showToast(res.message || 'Safety report submitted to campus moderation team.', 'success');
      setDescription('');
      setReportedUserId('');
    } catch (err) {
      showToast(err.message || 'Failed to submit report.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div ref={revealRef} className="max-w-3xl mx-auto pb-16 space-y-8">

        {/* Header */}
        <section className="sr sr-up">
          <p className="uppercase tracking-[0.2em] text-[10px] font-semibold text-[#a3e635] mb-3">Safety & Trust</p>
          <h1 className="font-archivo font-black text-[36px] sm:text-[44px] tracking-[-0.05em] leading-[0.95]">
            Campus Safety<br />Center
          </h1>
          <p className="text-[13px] text-[#a6a6a6] mt-3 max-w-md">
            Multi-layer student auditing, female commuter safety protection, and emergency escalation.
          </p>
        </section>

        {/* Female Protection Policy Highlight */}
        <section className="p-5 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-300 space-y-2">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-pink-400 shrink-0" />
            <h3 className="font-archivo font-bold text-[14px] text-white">Strict Female Commuter Safety Protocol</h3>
          </div>
          <p className="text-[12px] leading-relaxed text-pink-200/90">
            If any registered user receives <strong>5 or more safety reports from female commuters</strong>, their CampusRide account is <strong>automatically suspended</strong> by system audit and barred from offering or booking rides across all campuses.
          </p>
        </section>

        {/* Safety Pillars */}
        <section className="sr sr-up sr-d1 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: ShieldCheck, title: 'Verified Network', desc: 'Strict institutional email and ID auditing before ride privileges.' },
            { icon: EyeOff, title: 'Privacy & Hubs', desc: 'Exact home addresses never exposed. Designated campus pickup hubs only.' },
            { icon: PhoneCall, title: '24/7 Helpline', desc: 'Single-tap access to campus safety control room and emergency hotlines.' },
          ].map(({ icon: Ic, title, desc }, i) => (
            <div key={i} style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }} className="p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(163,230,53,0.06)' }}>
                <Ic className="w-5 h-5 text-[#a3e635]" />
              </div>
              <h4 className="font-archivo font-bold text-[14px] tracking-[-0.02em] mb-1 text-white">{title}</h4>
              <p className="text-[12px] text-[#a6a6a6] leading-[1.6]">{desc}</p>
            </div>
          ))}
        </section>

        {/* Incident Report Form */}
        <section style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }} className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileWarning className="w-4 h-4 text-[#fbbf24]" />
            <h3 className="font-archivo font-bold text-[16px] text-white">File Official Safety Incident Report</h3>
          </div>

          {user?.gender !== 'female' ? (
            <div className="p-5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-300 text-[12px] space-y-2">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-pink-400 shrink-0" />
                <span className="font-bold text-white text-[13px]">Female-Only Safety Reporting Protocol</span>
              </div>
              <p className="text-pink-200/90 leading-relaxed">
                Incident reporting privileges are strictly authorized for verified female commuters to maintain female safety standards and trigger automatic account suspensions upon receiving 5 female safety flags.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReport} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-[0.08em] mb-1.5">Select User to Report</label>
                <select
                  value={reportedUserId}
                  onChange={(e) => setReportedUserId(e.target.value)}
                  className="w-full !py-3 !px-4 !text-[13px] !rounded-xl text-white bg-[#141414] border border-white/10"
                  required
                >
                  <option value="">-- Choose User / Commuter --</option>
                  {usersList.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.fullName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-[0.08em] mb-1.5">Report Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full !py-3 !px-4 !text-[13px] !rounded-xl text-white bg-[#141414] border border-white/10"
                >
                  <option value="harassment">Harassment / Inappropriate Behavior (Female Protection Flag)</option>
                  <option value="unsafe_driving">Unsafe / Reckless Driving</option>
                  <option value="no_show">No-Show / Abandoned Passengers</option>
                  <option value="fraud">Fare Abuse / Misconduct</option>
                  <option value="other">Other Incident</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-[0.08em] mb-1.5">Detailed Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe what occurred, time, vehicle plate, or behavior..."
                  className="w-full resize-none !text-[13px] !rounded-xl bg-[#141414] border border-white/10 text-white p-3"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <FileWarning className="w-4 h-4" />
                {submitting ? 'Submitting Safety Report...' : 'File Official Safety Report'}
              </button>
            </form>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default SafetyCenterPage;
