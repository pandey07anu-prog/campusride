import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import LocationAutocompleteInput from '../components/common/LocationAutocompleteInput';
import api from '../services/api';
import { Users, Plus, MapPin, Clock, X, UserMinus, ArrowRight } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const CommuteGroupsPage = () => {
  const revealRef = useScrollReveal();
  const { showToast } = useNotifications();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinedGroupIds, setJoinedGroupIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', source: '', destination: '', scheduleTime: '08:00 AM', maxMembers: 4 });

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/features/commute-groups');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setGroups(res.data);
        return;
      }
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  useEffect(() => { fetchGroups(); }, []);

  const handleJoin = async (group) => {
    if (joinedGroupIds.includes(group._id)) { showToast('Already a member!', 'info'); return; }
    try {
      if (group._id && !group._id.startsWith('grp_')) await api.post(`/features/commute-groups/${group._id}/join`);
      setJoinedGroupIds((prev) => [...prev, group._id]);
      setGroups((prev) => prev.map((g) => g._id === group._id ? { ...g, membersCount: (g.members?.length || g.membersCount || 2) + 1 } : g));
      showToast(`Joined ${group.name}!`, 'success');
    } catch (err) { setJoinedGroupIds((prev) => [...prev, group._id]); showToast(`Joined ${group.name}!`, 'success'); }
  };

  const handleLeave = async (group) => {
    try {
      if (group._id && !group._id.startsWith('grp_')) await api.post(`/features/commute-groups/${group._id}/leave`);
      setJoinedGroupIds((prev) => prev.filter((id) => id !== group._id));
      setGroups((prev) => prev.map((g) => g._id === group._id ? { ...g, membersCount: Math.max(0, (g.members?.length || g.membersCount || 2) - 1) } : g));
      showToast(`Left ${group.name}.`, 'info');
    } catch (err) { setJoinedGroupIds((prev) => prev.filter((id) => id !== group._id)); showToast(`Left ${group.name}.`, 'info'); }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.source.trim() || !formData.destination.trim()) { showToast('Fill all fields.', 'error'); return; }
    setSubmitting(true);

    const localGroup = {
      _id: 'grp_' + Date.now(),
      name: formData.name,
      route: { source: formData.source, destination: formData.destination },
      scheduleTime: formData.scheduleTime,
      maxMembers: Number(formData.maxMembers) || 4,
      members: [],
      membersCount: 1,
    };

    setGroups((prev) => [localGroup, ...prev]);
    setIsModalOpen(false);
    setFormData({ name: '', source: '', destination: '', scheduleTime: '08:00 AM', maxMembers: 4 });

    try {
      const res = await api.post('/features/commute-groups', formData);
      if (res.success && res.data) {
        setGroups((prev) => prev.map((g) => g._id === localGroup._id ? res.data : g));
      }
    } catch (err) {}

    showToast(`"${formData.name}" created!`, 'success');
    setSubmitting(false);
  };

  return (
    <MainLayout>
      <div ref={revealRef} className="max-w-4xl mx-auto pb-16">

        {/* Header */}
        <section className="sr sr-up mb-10 flex items-end justify-between">
          <div>
            <p className="uppercase tracking-[0.2em] text-[10px] font-semibold text-[#a3e635] mb-3">Groups</p>
            <h1 className="font-archivo font-black text-[36px] sm:text-[44px] tracking-[-0.05em] leading-[0.95]">
              Daily commute<br />groups
            </h1>
            <p className="text-[13px] text-[#525252] mt-3 max-w-sm">
              Join or create recurring student cohorts on daily routes.
            </p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary !px-5 shrink-0 hidden sm:flex">
            <Plus className="w-4 h-4" /> New Group
          </button>
        </section>

        {/* Mobile create button */}
        <button onClick={() => setIsModalOpen(true)} className="btn-primary w-full justify-center mb-6 sm:hidden">
          <Plus className="w-4 h-4" /> Create Group
        </button>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-[#a3e635] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[12px] text-[#525252] mt-3">Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          /* Empty state — full page, not a card */
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.1)' }}>
              <Users className="w-7 h-7 text-[#a3e635]" />
            </div>
            <h3 className="font-archivo font-bold text-[20px] tracking-[-0.03em]">No groups yet</h3>
            <p className="text-[13px] text-[#525252] mt-2 max-w-xs mx-auto">
              Create the first commute group for your route and invite classmates.
            </p>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary mt-6">
              <Plus className="w-4 h-4" /> Create First Group
            </button>
          </div>
        ) : (
          <section className="space-y-3">
            {groups.map((g) => {
              const currentMembers = g.members?.length || g.membersCount || 2;
              const isJoined = joinedGroupIds.includes(g._id);
              const spotsLeft = (g.maxMembers || 4) - currentMembers;
              return (
                <div key={g._id} className="group" style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px 24px' }}>
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: route info */}
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-nowrap">
                        <h3 className="font-archivo font-bold text-[15px] tracking-[-0.02em] whitespace-nowrap shrink-0">{g.name}</h3>
                        <span className="badge-verified text-[10px] shrink-0 whitespace-nowrap">
                          <Clock className="w-3 h-3" /> {g.scheduleTime || '08:00 AM'}
                        </span>
                      </div>
                      {/* Route visualization */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-[#a3e635]" />
                          <span className="text-[13px] text-[#a3a3a3] truncate max-w-[140px]">{g.route?.source || 'Campus'}</span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-[#525252] shrink-0" />
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full border border-[#a3e635]" />
                          <span className="text-[13px] text-[#a3a3a3] truncate max-w-[140px]">{g.route?.destination || 'University'}</span>
                        </div>
                      </div>
                      {/* Members bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-1.5">
                          {Array.from({ length: Math.min(currentMembers, 4) }).map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-[#1e1e1e] flex items-center justify-center text-[9px] font-bold" style={{ background: `hsl(${i * 70}, 40%, 20%)`, color: `hsl(${i * 70}, 50%, 60%)` }}>
                              {String.fromCharCode(65 + i)}
                            </div>
                          ))}
                        </div>
                        <span className="text-[12px] text-[#525252]">
                          {currentMembers}/{g.maxMembers || 4} members{spotsLeft > 0 && <span className="text-[#a3e635]"> · {spotsLeft} spot{spotsLeft > 1 ? 's' : ''} left</span>}
                        </span>
                      </div>
                    </div>

                    {/* Right: action */}
                    <div className="shrink-0">
                      {isJoined ? (
                        <button onClick={() => handleLeave(g)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-red-400" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
                          <UserMinus className="w-3.5 h-3.5" /> Leave
                        </button>
                      ) : (
                        <button onClick={() => handleJoin(g)} className="btn-primary !text-[11px] !px-4 !py-2">
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Create Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
            <div style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', boxShadow: '0 0 80px rgba(0,0,0,0.5)' }} className="max-w-md w-full p-6 space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-archivo font-bold text-[18px] tracking-[-0.03em]">New Commute Group</h3>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors">
                  <X className="w-4 h-4 text-[#666]" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#888] uppercase tracking-[0.08em] mb-1.5">Group Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Campus Morning Express"
                    className="!text-[13px]"
                    required
                  />
                </div>

                <div className="space-y-0">
                  <label className="block text-[10px] font-semibold text-[#888] uppercase tracking-[0.08em] mb-1.5">Route</label>
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-3">
                      <div className="w-2 h-2 rounded-full bg-[#a3e635]" />
                      <div className="w-px h-6 bg-white/10" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <LocationAutocompleteInput
                        value={formData.source}
                        onChange={(val) => setFormData({ ...formData, source: val })}
                        placeholder="Departure hub"
                      />
                      <LocationAutocompleteInput
                        value={formData.destination}
                        onChange={(val) => setFormData({ ...formData, destination: val })}
                        placeholder="Destination"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#888] uppercase tracking-[0.08em] mb-1.5">Schedule Time</label>
                    <input
                      type="text"
                      value={formData.scheduleTime}
                      onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                      placeholder="08:00 AM"
                      className="!text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#888] uppercase tracking-[0.08em] mb-1.5">Max Members</label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={formData.maxMembers}
                      onChange={(e) => setFormData({ ...formData, maxMembers: Number(e.target.value) })}
                      className="!text-[13px] text-center"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-[#666] hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 btn-primary justify-center !rounded-xl !py-2.5">
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-[#171717]/30 border-t-[#171717] rounded-full animate-spin" />
                    ) : 'Create Group'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CommuteGroupsPage;
