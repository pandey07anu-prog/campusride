import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import UserAvatar from '../components/common/UserAvatar';
import useScrollReveal from '../hooks/useScrollReveal';
import {
  Navigation,
  Car,
  Users,
  Check,
  X,
  Phone,
  ArrowRight,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Inbox,
} from 'lucide-react';

const ManageRequestsPage = () => {
  const { showToast, refetchNotifications } = useNotifications();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [offeredRides, setOfferedRides] = useState([]);
  const [expandedRide, setExpandedRide] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/my-rides/offered');
      if (res.success && res.data) setOfferedRides(res.data);
    } catch (err) {
      showToast('Failed to load rides.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAccept = async (reqId) => {
    try {
      await api.put(`/requests/${reqId}/accept`);
      showToast('Request accepted!', 'success');
      loadData();
      refetchNotifications();
    } catch (err) { showToast(err.message || 'Failed.', 'error'); }
  };

  const handleReject = async (reqId) => {
    try {
      await api.put(`/requests/${reqId}/reject`);
      showToast('Request rejected.', 'info');
      loadData();
      refetchNotifications();
    } catch (err) {}
  };

  const totalPending = offeredRides.reduce(
    (acc, r) => acc + (r.incomingRequests?.filter((q) => q.status === 'pending').length || 0), 0
  );

  const revealRef = useScrollReveal();

  return (
    <MainLayout>
      <div ref={revealRef} className="max-w-4xl mx-auto pb-12">

        {/* Header */}
        <div className="sr sr-up mb-8">
          <p className="uppercase tracking-[0.15em] text-[11px] font-semibold text-[#525252] mb-2">Driver</p>
          <h1 className="font-archivo font-extrabold text-[28px] tracking-[-0.04em] leading-none">
            Manage Requests
          </h1>
          <p className="text-[13px] text-[#525252] mt-2">
            Review and accept passengers for your offered rides.
          </p>
        </div>

        {/* Summary strip */}
        <div className="sr sr-up sr-d1 flex gap-3 mb-8">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-semibold" style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.1)', color: '#a3e635' }}>
            <Car className="w-4 h-4" /> {offeredRides.length} Ride{offeredRides.length !== 1 ? 's' : ''} Offered
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-semibold" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.1)', color: '#fbbf24' }}>
            <Inbox className="w-4 h-4" /> {totalPending} Pending Request{totalPending !== 1 ? 's' : ''}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-[#a3e635] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : offeredRides.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.1)' }}>
              <Car className="w-7 h-7 text-[#a3e635]" />
            </div>
            <h3 className="font-archivo font-bold text-[20px] tracking-[-0.03em]">No offered rides</h3>
            <p className="text-[13px] text-[#525252] mt-2 max-w-xs mx-auto">
              Offer a ride to start receiving passenger requests.
            </p>
            <Link to="/offer-ride" className="btn-primary mt-6 inline-flex">Offer a Ride</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {offeredRides.map((ride) => {
              const requests = ride.incomingRequests || [];
              const pending = requests.filter((r) => r.status === 'pending');
              const accepted = requests.filter((r) => r.status === 'accepted');
              const isExpanded = expandedRide === ride._id;

              return (
                <div key={ride._id} style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }} className="overflow-hidden">

                  {/* Ride header — always visible */}
                  <button
                    onClick={() => setExpandedRide(isExpanded ? null : ride._id)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.01] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(163,230,53,0.08)' }}>
                        <Navigation className="w-5 h-5 text-[#a3e635]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-archivo font-bold text-[15px] tracking-[-0.02em]">{ride.source}</span>
                          <ArrowRight className="w-3 h-3 text-[#525252]" />
                          <span className="font-archivo font-bold text-[15px] tracking-[-0.02em]">{ride.destination}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-[#525252]">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ride.date} · {ride.departureTime}</span>
                          <span>·</span>
                          <span>{ride.totalSeats - ride.availableSeats}/{ride.totalSeats} seats filled</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {pending.length > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#a3e635] text-[#171717]">
                          {pending.length} NEW
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#525252]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#525252]" />
                      )}
                    </div>
                  </button>

                  {/* Expanded: passenger requests */}
                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>

                      {/* Pending */}
                      {pending.length > 0 && (
                        <div className="pt-4">
                          <p className="text-[10px] font-bold text-[#525252] uppercase tracking-[0.1em] mb-2.5">Pending ({pending.length})</p>
                          <div className="space-y-2">
                            {pending.map((req) => (
                              <div key={req._id} className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <UserAvatar user={req.passengerId} className="w-9 h-9 rounded-lg border border-white/10 text-[11px]" />
                                    {req.passengerId?.verificationStatus === 'verified' && (
                                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded bg-[#a3e635] flex items-center justify-center">
                                        <ShieldCheck className="w-2.5 h-2.5 text-[#171717]" />
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-archivo font-bold text-[13px] tracking-[-0.02em]">{req.passengerId?.fullName || 'Student'}</span>
                                      {req.passengerId?.phone && (
                                        <a href={`tel:${req.passengerId.phone}`} className="flex items-center gap-1 text-[10px] font-mono font-semibold text-[#a3e635]" style={{ background: 'rgba(163,230,53,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                                          <Phone className="w-2.5 h-2.5" /> Call
                                        </a>
                                      )}
                                    </div>
                                    <span className="text-[11px] text-[#525252]">
                                      {req.requestedSeats} seat{req.requestedSeats > 1 ? 's' : ''} requested
                                      {req.pickupPoint && <span className="ml-1">· {req.pickupPoint}</span>}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button onClick={() => handleAccept(req._id)} className="btn-primary !text-[11px] !px-4 !py-2">
                                    <Check className="w-3.5 h-3.5" /> Accept
                                  </button>
                                  <button onClick={() => handleReject(req._id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#666] hover:text-white transition" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Accepted */}
                      {accepted.length > 0 && (
                        <div className={pending.length > 0 ? 'pt-2' : 'pt-4'}>
                          <p className="text-[10px] font-bold text-[#525252] uppercase tracking-[0.1em] mb-2.5">Accepted ({accepted.length})</p>
                          <div className="space-y-2">
                            {accepted.map((req) => (
                              <div key={req._id} className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: 'rgba(163,230,53,0.02)', border: '1px solid rgba(163,230,53,0.06)' }}>
                                <div className="flex items-center gap-3">
                                  <UserAvatar user={req.passengerId} className="w-9 h-9 rounded-lg border border-white/10 text-[11px]" />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-archivo font-bold text-[13px] tracking-[-0.02em]">{req.passengerId?.fullName || 'Student'}</span>
                                      {req.passengerId?.phone && (
                                        <a href={`tel:${req.passengerId.phone}`} className="flex items-center gap-1 text-[10px] font-mono font-semibold text-[#a3e635]" style={{ background: 'rgba(163,230,53,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                                          <Phone className="w-2.5 h-2.5" /> {req.passengerId.phone}
                                        </a>
                                      )}
                                    </div>
                                    <span className="text-[11px] text-[#525252]">{req.requestedSeats} seat{req.requestedSeats > 1 ? 's' : ''} · {req.pickupPoint || 'Pickup point TBD'}</span>
                                  </div>
                                </div>
                                <span className="badge-verified">ACCEPTED</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No requests */}
                      {requests.length === 0 && (
                        <div className="py-8 text-center">
                          <p className="text-[13px] text-[#525252]">No requests yet for this ride.</p>
                          <p className="text-[11px] text-[#333] mt-1">Passengers will appear here when they request seats.</p>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default ManageRequestsPage;
