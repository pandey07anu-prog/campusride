import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import UserAvatar from '../components/common/UserAvatar';
import { ShieldCheck, Star, Award, Phone, MapPin, Plus, X, ArrowRight, Car } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const ProfilePage = () => {
  const revealRef = useScrollReveal();
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [emergencyContacts, setEmergencyContacts] = useState(user?.emergencyContacts || []);
  const [savedRoutes, setSavedRoutes] = useState(user?.savedRoutes || []);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: 'Family' });
  const [showAddContact, setShowAddContact] = useState(false);

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/emergency-contacts', newContact);
      setEmergencyContacts((prev) => [...prev, newContact]);
      showToast('Emergency contact added', 'success');
      setShowAddContact(false);
      setNewContact({ name: '', phone: '', relation: 'Family' });
    } catch (err) {}
  };

  return (
    <MainLayout>
      <div ref={revealRef} className="max-w-3xl mx-auto pb-16">

        {/* Header */}
        <section className="sr sr-up mb-10">
          <p className="uppercase tracking-[0.2em] text-[10px] font-semibold text-[#a3e635] mb-3">Profile</p>
          <h1 className="font-archivo font-black text-[36px] sm:text-[44px] tracking-[-0.05em] leading-[0.95]">
            Your profile
          </h1>
        </section>

        {/* Profile Card — wide horizontal layout */}
        <div style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }} className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <UserAvatar user={user} className="w-20 h-20 rounded-2xl border border-white/10 text-xl" />
              {user?.verificationStatus === 'verified' && (
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-[#a3e635] flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-4 h-4 text-[#171717]" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-1">
                <h2 className="font-archivo font-bold text-[20px] tracking-[-0.03em]">
                  {user?.fullName || 'Student User'}
                </h2>
                {user?.verificationStatus === 'verified' && <span className="badge-verified text-[10px]">Verified</span>}
                {user?.gender && user.gender !== 'unspecified' && (
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    user.gender === 'female'
                      ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                      : user.gender === 'male'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : 'bg-white/10 text-white/70 border-white/20'
                  }`}>
                    {user.gender === 'female' ? 'Female 👧' : user.gender === 'male' ? 'Male 👦' : 'Other'}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[#a6a6a6] font-medium">
                {user?.university || 'Verified Campus'} · ID: <span className="font-mono text-[#a3e635]">{user?.studentId || 'STU-2026'}</span>
                {user?.gender && user.gender !== 'unspecified' && (
                  <> · <span className="text-white font-semibold">{user.gender === 'female' ? 'Female' : user.gender === 'male' ? 'Male' : user.gender}</span></>
                )}
              </p>
              <p className="text-[12px] text-[#888] mt-1 italic">"{user?.bio || 'Daily commuter exploring carpools to save fuel & meet fellow students!'}"</p>

              {/* Stats row */}
              <div className="flex items-center gap-4 mt-4 flex-wrap justify-center sm:justify-start">
                {[
                  { icon: Star, label: 'Rating', value: user?.rating ? Number(user.rating).toFixed(1) : '5.0', color: '#fbbf24', fill: true },
                  { icon: Award, label: 'Points', value: `${user?.campusPoints || 0}`, color: '#a3e635' },
                  { icon: Car, label: 'Offered', value: user?.ridesOfferedCount || 0, color: '#fff' },
                  { icon: MapPin, label: 'Taken', value: user?.ridesTakenCount || 0, color: '#a3e635' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[12px]">
                    <s.icon className="w-3.5 h-3.5" style={{ color: s.color, fill: s.fill ? s.color : 'none' }} />
                    <span className="font-archivo font-bold" style={{ color: s.color }}>{s.value}</span>
                    <span className="text-[#525252]">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action */}
            <Link to="/student-verification" className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#666] hover:text-white transition" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              Verification Badge
            </Link>
          </div>
        </div>

        {/* Women's Safety Commute Setting */}
        {user?.gender === 'female' && (
          <div className="mb-4 p-4 rounded-xl flex items-center justify-between gap-4" style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.25)' }}>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-archivo font-bold text-[14px] text-white">Travel Only with Girls</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">🌸 Active Safety Rule</span>
              </div>
              <p className="text-[12px] text-[#d4d4d4] font-medium">Auto-filter and match exclusively with verified female student drivers and riders.</p>
            </div>
            <Link
              to="/find-ride?isGirlsOnly=true"
              className="px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-[12px] font-bold shadow-lg shadow-pink-500/20 transition-all shrink-0 cursor-pointer"
            >
              Search Girls-Only
            </Link>
          </div>
        )}

        {/* Two column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Emergency Contacts */}
          <div style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-semibold text-[#666] uppercase tracking-[0.1em] flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> Emergency Contacts
              </p>
              <button onClick={() => setShowAddContact(true)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#a3e635] hover:bg-white/5 transition" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {emergencyContacts.length === 0 ? (
              <p className="text-[12px] text-[#525252] py-4 text-center">No contacts added yet.</p>
            ) : (
              <div className="space-y-2">
                {emergencyContacts.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div>
                      <span className="font-semibold text-[12px] block">{c.name}</span>
                      <span className="text-[11px] text-[#525252]">{c.relation}</span>
                    </div>
                    <span className="font-mono text-[12px] font-semibold text-[#a3e635]">{c.phone}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Routes */}
          <div style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-semibold text-[#666] uppercase tracking-[0.1em] flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Saved Routes
              </p>
              <Link to="/find-ride" className="text-[11px] font-medium text-[#a3e635] hover:underline">Quick Search</Link>
            </div>
            {savedRoutes.length === 0 ? (
              <p className="text-[12px] text-[#525252] py-4 text-center">No saved routes yet.</p>
            ) : (
              <div className="space-y-2">
                {savedRoutes.map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div>
                      <span className="font-semibold text-[12px] block">{r.title}</span>
                      <span className="text-[11px] text-[#525252]">{r.source} → {r.destination}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-[#525252]" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Contact Modal */}
        {showAddContact && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
            <div style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', boxShadow: '0 0 80px rgba(0,0,0,0.5)' }} className="max-w-md w-full p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-archivo font-bold text-[18px] tracking-[-0.03em]">Add Emergency Contact</h3>
                <button onClick={() => setShowAddContact(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors">
                  <X className="w-4 h-4 text-[#666]" />
                </button>
              </div>
              <form onSubmit={handleAddContact} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#888] uppercase tracking-[0.08em] mb-1.5">Name</label>
                  <input type="text" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} placeholder="Parent / Guardian Name" className="!text-[13px]" required />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#888] uppercase tracking-[0.08em] mb-1.5">Phone</label>
                  <input type="tel" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} placeholder="+91 98765 43210" className="!text-[13px]" required />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#888] uppercase tracking-[0.08em] mb-1.5">Relation</label>
                  <select value={newContact.relation} onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })} className="!text-[13px]">
                    <option>Family</option>
                    <option>Friend</option>
                    <option>Roommate</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddContact(false)} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-[#666] hover:text-white transition" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary justify-center !rounded-xl !py-2.5">Save Contact</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default ProfilePage;
