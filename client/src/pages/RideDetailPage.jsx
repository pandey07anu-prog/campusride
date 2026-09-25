import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import MatchScoreBadge from '../components/rides/MatchScoreBadge';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import UserAvatar from '../components/common/UserAvatar';
import { MapPin, ShieldCheck, Star, Send, ArrowLeft, Share2, Phone, Trash2, Clock, Users, Car, ArrowRight, AlertTriangle } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const RideDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const revealRef = useScrollReveal();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestedSeats, setRequestedSeats] = useState(1);

  const handleDeleteRide = async () => {
    if (!window.confirm('Cancel & delete this ride offer?')) return;
    try {
      const res = await api.delete(`/rides/${id}`);
      if (res.success) { showToast('Ride deleted.', 'success'); navigate('/my-rides'); }
    } catch (err) { showToast(err.message || 'Failed.', 'error'); }
  };

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    if (!user) { showToast('Please sign in.', 'warning'); navigate('/login'); return; }
    const fetchRide = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/rides/${id}`);
        if (res.success) setRide(res.data);
      } catch (err) {} finally { setLoading(false); }
    };
    fetchRide();
  }, [id, user]);

  const handleRequestRide = async () => {
    if (!user) { showToast('Please log in.', 'error'); navigate('/login'); return; }
    try {
      const res = await api.post(`/requests/ride/${id}`, { requestedSeats: Number(requestedSeats), pickupPoint: ride?.source });
      if (res.success) { showToast('Ride request sent!', 'success'); navigate('/my-rides'); }
    } catch (err) { showToast(err.message || 'Failed.', 'error'); }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages((prev) => [...prev, { senderName: user?.fullName || 'Student', content: chatInput, createdAt: 'Just now' }]);
    setChatInput('');
  };

  const [showSosModal, setShowSosModal] = useState(false);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied!', 'success');
  };

  const handleShareLiveTracking = () => {
    const text = `I am currently carpooling on CampusRide from ${ride?.source} to ${ride?.destination} with driver ${driver?.fullName || 'Student'} (${vehicle?.model || 'Car'} - ${vehicle?.registrationNumber || 'Vehicle'}). Track my live ride status here: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: 'Live Ride Tracking - CampusRide', text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      showToast('Live tracking details copied to clipboard!', 'success');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#a3e635] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </MainLayout>
    );
  }

  const driver = ride?.driverId || {};
  const vehicle = ride?.vehicleId || {};
  const isDriver = user?._id && ride?.driverId && String(user._id) === String(ride.driverId._id || ride.driverId);

  return (
    <MainLayout>
      <div ref={revealRef} className="max-w-4xl mx-auto pb-12">

        {/* Top bar */}
        <div className="sr sr-up flex flex-wrap items-center justify-between gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[12px] text-[#a6a6a6] hover:text-white transition font-semibold cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to Rides
          </button>
          <div className="flex items-center gap-2">
            <button onClick={handleShareLiveTracking} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-bold text-[#a3e635] hover:bg-[#a3e635]/10 transition cursor-pointer" style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.2)' }}>
              <MapPin className="w-3.5 h-3.5 text-[#a3e635]" /> Track Live Ride 📍
            </button>
            <button onClick={copyShareLink} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#888] hover:text-white transition cursor-pointer" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Share2 className="w-3.5 h-3.5 text-[#a3e635]" /> Share
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left — Route + Chat */}
          <div className="lg:col-span-2 space-y-5">

            {/* Route Card */}
            <div className="sr sr-up sr-d1 beam p-6" style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
              {/* Date & Girls-Only badge */}
              <div className="flex items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="badge-verified">{ride?.date} · Departing {ride?.departureTime}</span>
                  {ride?.isGirlsOnly && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                      🌸 Girls-Only Ride
                    </span>
                  )}
                </div>
                {ride?.matchScore !== undefined && <MatchScoreBadge score={ride.matchScore} />}
              </div>

              {/* Route timeline */}
              <div className="space-y-0">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center pt-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#a3e635]" />
                    <div className="w-px h-10 bg-white/10" />
                  </div>
                  <div className="pb-4">
                    <span className="text-[9px] uppercase font-bold text-[#525252] tracking-[0.12em]">Pickup Location</span>
                    <h3 className="font-archivo font-bold text-[16px] tracking-[-0.02em] mt-0.5">{ride?.source}</h3>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full border-2 border-[#a3e635]" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#525252] tracking-[0.12em]">Drop-off</span>
                    <h3 className="font-archivo font-bold text-[16px] tracking-[-0.02em] mt-0.5">{ride?.destination}</h3>
                  </div>
                </div>
              </div>

              {/* Travel time */}
              <div className="mt-4 ml-3.5 pl-4" style={{ borderLeft: '2px dashed rgba(255,255,255,0.06)' }}>
                <span className="text-[11px] text-[#525252] flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Est. travel time: {ride?.estimatedArrival || '30 mins'}
                </span>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-[8px] uppercase font-bold text-[#525252] flex items-center gap-1 tracking-[0.1em]"><Car className="w-3 h-3 text-[#a3e635]" /> Vehicle</span>
                  <span className="font-archivo font-bold text-[13px] mt-1 block">{vehicle?.model || 'Car'}</span>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-[8px] uppercase font-bold text-[#525252] flex items-center gap-1 tracking-[0.1em]">Plate</span>
                  <span className="font-mono font-bold text-[13px] text-[#a3e635] mt-1 block">{vehicle?.registrationNumber || '—'}</span>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-[8px] uppercase font-bold text-[#525252] flex items-center gap-1 tracking-[0.1em]"><Users className="w-3 h-3 text-[#a3e635]" /> Seats</span>
                  <span className="font-archivo font-bold text-[13px] text-[#a3e635] mt-1 block">{ride?.availableSeats}/{ride?.totalSeats}</span>
                </div>
              </div>

              {/* Notes */}
              {ride?.notes && (
                <div className="mt-4 p-3.5 rounded-xl text-[12px]" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="text-[10px] font-bold text-[#525252] uppercase tracking-[0.1em] block mb-1">Driver Notes</span>
                  <p className="text-[#a3a3a3]">{ride.notes}</p>
                </div>
              )}
            </div>

            {/* Chat */}
            <div className="p-5 space-y-3" style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
              <p className="text-[10px] font-bold text-[#666] uppercase tracking-[0.1em]">Ride Group Chat</p>
              <div className="h-40 overflow-y-auto space-y-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                {messages.length === 0 ? (
                  <p className="text-[#525252] text-center py-6 text-[11px]">No messages yet. Ask the driver anything.</p>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="font-bold text-[#a3e635]">{m.senderName}</span>
                        <span className="text-[#525252]">{m.createdAt}</span>
                      </div>
                      <p className="text-[12px] text-[#ccc]">{m.content}</p>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask driver about pickup..."
                  className="flex-1 !text-[12px] !py-2.5"
                />
                <button type="submit" className="btn-primary !py-2.5 !px-4 !text-[12px]">
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </form>
            </div>

          </div>

          {/* Right — Driver + Booking */}
          <div className="space-y-5">

            {/* Driver Profile */}
            <div className="p-5 space-y-4" style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
              <p className="text-[10px] font-bold text-[#525252] uppercase tracking-[0.1em]">Driver</p>
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <UserAvatar user={driver} className="w-12 h-12 rounded-xl border border-white/10 text-sm" />
                  {driver.verificationStatus === 'verified' && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-[#a3e635] flex items-center justify-center">
                      <ShieldCheck className="w-3 h-3 text-[#171717]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-archivo font-bold text-[14px] tracking-[-0.02em] truncate">{driver.fullName || 'Verified Driver'}</h3>
                  <p className="text-[11px] text-[#525252] truncate">{driver.university || 'Verified Campus'}</p>
                </div>
                {driver.rating && (
                  <span className="ml-auto shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold" style={{ background: 'rgba(251,191,36,0.08)', color: '#fbbf24' }}>
                    <Star className="w-3 h-3 fill-[#fbbf24]" /> {driver.rating}
                  </span>
                )}
              </div>
              <div className="pt-3 flex items-center justify-between gap-2 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                {driver.phone ? (
                  <a href={`tel:${driver.phone}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-mono font-bold text-[#a3e635]" style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.1)' }}>
                    <Phone className="w-3 h-3" /> {driver.phone}
                  </a>
                ) : (
                  <span className="text-[11px] text-[#525252]">Verified Driver</span>
                )}
                {!isDriver && (
                  <button
                    onClick={() => navigate('/safety-center')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Report Driver 🚩
                  </button>
                )}
              </div>
            </div>

            {/* Booking Box */}
            <div className="beam p-5 space-y-4" style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] text-[#525252] uppercase font-bold tracking-[0.1em]">Contribution</span>
                <span className="font-archivo font-extrabold text-[24px] tracking-[-0.04em]">₹{ride?.contribution}<span className="text-[10px] font-medium text-[#525252] tracking-normal"> / seat</span></span>
              </div>

              {isDriver ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl text-[12px] font-semibold text-center" style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.1)', color: '#a3e635' }}>
                    You are the driver for this ride
                  </div>
                  <button onClick={handleDeleteRide} className="w-full py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171' }}>
                    <Trash2 className="w-4 h-4" /> Cancel Ride
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-[#888] uppercase tracking-[0.08em] mb-1.5">Seats to Request</label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRequestedSeats(n)}
                          className="flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all"
                          style={{
                            background: requestedSeats === n ? '#a3e635' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${requestedSeats === n ? '#a3e635' : 'rgba(255,255,255,0.06)'}`,
                            color: requestedSeats === n ? '#171717' : '#888',
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  {ride?.isGirlsOnly && user?.gender === 'male' ? (
                    <div className="p-3.5 rounded-xl text-[12px] font-bold text-center bg-pink-500/10 border border-pink-500/25 text-pink-400">
                      🌸 This ride is exclusively for verified female students.
                    </div>
                  ) : (
                    <button
                      onClick={handleRequestRide}
                      disabled={ride?.availableSeats === 0}
                      className="btn-primary shimmer w-full !py-3 !text-[13px] !rounded-xl disabled:opacity-40 cursor-pointer"
                    >
                      {ride?.availableSeats > 0 ? `Request ${requestedSeats} Seat${requestedSeats > 1 ? 's' : ''}` : 'Ride Full'}
                    </button>
                  )}
                </>
              )}
            </div>

          </div>

        </div>

        {/* Floating Emergency SOS Button */}
        <div className="fixed bottom-6 right-6 z-[9990]">
          <button
            type="button"
            onClick={() => setShowSosModal(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-extrabold text-[13px] shadow-2xl shadow-red-600/50 transition-all hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
          >
            <ShieldCheck className="w-5 h-5 text-white" />
            <span>Emergency SOS 🚨</span>
          </button>
        </div>

        {/* Emergency SOS Modal */}
        {showSosModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
            <div className="max-w-md w-full p-6 rounded-2xl space-y-5" style={{ background: '#1c1917', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 0 50px rgba(239,68,68,0.2)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-500">
                  <ShieldCheck className="w-6 h-6 animate-bounce" />
                  <h3 className="font-archivo font-extrabold text-[20px] text-white tracking-[-0.03em]">Emergency Assistance 🚨</h3>
                </div>
                <button onClick={() => setShowSosModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                  ✕
                </button>
              </div>

              <div className="p-4 rounded-xl space-y-1.5" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-[13px] font-bold text-red-400">Current Trip Active Details:</p>
                <p className="text-[12px] text-white font-medium">Driver: {driver?.fullName || 'Student'} ({vehicle?.model || 'Car'} - {vehicle?.registrationNumber || 'Plate Number'})</p>
                <p className="text-[11px] text-[#a6a6a6]">{ride?.source} ➔ {ride?.destination}</p>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href="tel:112"
                  className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-[14px] flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Phone className="w-4 h-4 fill-current" />
                  <span>Call 112 Emergency Services</span>
                </a>

                <button
                  type="button"
                  onClick={handleShareLiveTracking}
                  className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-[13px] flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#a3e635]" />
                  <span>Dispatch Live Route & SOS to Contacts</span>
                </button>

                {driver?.phone && (
                  <a
                    href={`tel:${driver.phone}`}
                    className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-[13px] flex items-center justify-center gap-2 border border-white/10 transition-all"
                  >
                    <Phone className="w-4 h-4 text-[#a3e635]" />
                    <span>Call Driver ({driver.fullName})</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="w-full text-center text-[12px] text-[#888] font-medium hover:text-white pt-2"
              >
                Close Assistance Window
              </button>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default RideDetailPage;
