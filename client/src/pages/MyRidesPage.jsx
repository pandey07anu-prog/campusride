import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PaymentModal from '../components/PaymentModal';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { Navigation, Car, MapPin, Check, AlertCircle, RefreshCw, ShieldCheck, Phone, Trash2, ArrowRight, AlertTriangle, X } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const MyRidesPage = () => {
  const { showToast, refetchNotifications } = useNotifications();
  const [activeTab, setActiveTab] = useState('booked');
  const [loading, setLoading] = useState(true);
  const [offeredRides, setOfferedRides] = useState([]);
  const [bookedRides, setBookedRides] = useState([]);
  const [backupSuggestions, setBackupSuggestions] = useState([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedReqForPayment, setSelectedReqForPayment] = useState(null);

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingUser, setReportingUser] = useState(null);
  const [reportCategory, setReportCategory] = useState('harassment');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const handleOpenReport = (reportedUserId, name) => {
    setReportingUser({ id: reportedUserId, name });
    setReportModalOpen(true);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportingUser?.id) return;
    setSubmittingReport(true);
    try {
      const res = await api.post('/features/report', {
        reportedUserId: reportingUser.id,
        category: reportCategory,
        description: reportDetails,
      });
      showToast(res.message || 'Safety report submitted to campus moderation team.', 'success');
      setReportModalOpen(false);
      setReportDetails('');
    } catch (err) {
      showToast(err.message || 'Failed to submit safety report', 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookedRes, offeredRes] = await Promise.all([
        api.get('/my-rides/booked').catch(() => ({ success: false, data: [] })),
        api.get('/my-rides/offered').catch(() => ({ success: false, data: [] })),
      ]);
      if (bookedRes.success && bookedRes.data) setBookedRides(bookedRes.data);
      if (offeredRes.success && offeredRes.data) {
        setOfferedRides(offeredRes.data);
        if (offeredRes.data.length > 0 && (!bookedRes.data || bookedRes.data.length === 0)) setActiveTab('offered');
      }
    } catch (err) {
      showToast('Failed to load rides', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRide = async (rideId) => {
    if (!window.confirm('Cancel & delete this ride offer?')) return;
    try {
      const res = await api.delete(`/rides/${rideId}`);
      if (res.success) { showToast('Ride deleted.', 'success'); loadData(); }
    } catch (err) { showToast(err.message || 'Failed to delete.', 'error'); }
  };

  const pendingRequestsCount = offeredRides.reduce(
    (acc, ride) => acc + (ride.incomingRequests ? ride.incomingRequests.filter((r) => r.status === 'pending').length : 0), 0
  );

  useEffect(() => { loadData(); }, []);

  const handleAcceptRequest = async (reqId) => {
    try { await api.put(`/requests/${reqId}/accept`); showToast('Request accepted!', 'success'); loadData(); refetchNotifications(); }
    catch (err) { showToast(err.message || 'Failed', 'error'); }
  };

  const handleRejectRequest = async (reqId) => {
    try { await api.put(`/requests/${reqId}/reject`); showToast('Request rejected.', 'info'); loadData(); refetchNotifications(); }
    catch (err) {}
  };

  const fetchBackups = async (rideId) => {
    try {
      const res = await api.get(`/my-rides/backup-suggestions/${rideId}`);
      if (res.success) { setBackupSuggestions(res.data); showToast('Backup matches loaded!', 'info'); }
    } catch (err) {}
  };

  const revealRef = useScrollReveal();

  return (
    <MainLayout>
      <div ref={revealRef} className="max-w-3xl mx-auto pb-16">

        {/* Header */}
        <section className="sr sr-up mb-10 flex items-end justify-between">
          <div>
            <p className="uppercase tracking-[0.2em] text-[10px] font-semibold text-[#a3e635] mb-3">My Rides</p>
            <h1 className="font-archivo font-black text-[36px] sm:text-[44px] tracking-[-0.05em] leading-[0.95]">
              Your rides
            </h1>
            <p className="text-[13px] text-[#525252] mt-3">
              {bookedRides.length + offeredRides.length} total ride{bookedRides.length + offeredRides.length !== 1 ? 's' : ''}
            </p>
          </div>
        </section>

        {/* Tab switcher — clean segmented control */}
        <div className="sr sr-up sr-d1 flex gap-px mb-8" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '3px' }}>
          {[
            { id: 'booked', label: 'Booked' },
            { id: 'offered', label: 'Offered', badge: pendingRequestsCount },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-semibold transition-all cursor-pointer"
              style={activeTab === t.id ? { background: '#a3e635', color: '#171717' } : { color: '#666' }}
            >
              {t.label}
              {t.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500 text-white">{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-[#a3e635] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[12px] text-[#525252] mt-3">Loading rides...</p>
          </div>
        ) : (
          <>
            {/* Booked Tab */}
            {activeTab === 'booked' && (
              <section className="space-y-3">
                {bookedRides.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.1)' }}>
                      <Car className="w-7 h-7 text-[#a3e635]" />
                    </div>
                    <h3 className="font-archivo font-bold text-[20px] tracking-[-0.03em]">No booked rides</h3>
                    <p className="text-[13px] text-[#525252] mt-2 max-w-xs mx-auto">
                      Search for available rides on your campus route.
                    </p>
                    <Link to="/find-ride" className="btn-primary mt-6 inline-flex">Find a Ride</Link>
                  </div>
                ) : (
                  bookedRides.slice(0, 3).map((b) => {
                    const rObj = b.rideId || {};
                    const dObj = rObj.driverId || b.driverId || {};
                    const vObj = rObj.vehicleId || b.vehicleId || {};

                    const source = rObj.source || b.pickupPoint || b.source || 'Campus Pickup';
                    const destination = rObj.destination || b.destination || 'Campus Destination';
                    const dateStr = rObj.date || (b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Scheduled');
                    const timeStr = rObj.departureTime || '08:00 AM';
                    const driverName = typeof dObj === 'string' ? dObj : (dObj.fullName || b.driverName || 'Verified Driver');
                    const driverPhone = dObj.phone || b.driverPhone;
                    const vehicleModel = typeof vObj === 'string' ? vObj : (vObj.model || b.vehicleModel || 'Campus Swift');
                    const registrationNumber = typeof vObj === 'object' && vObj.registrationNumber ? vObj.registrationNumber : (rObj.registrationNumber || b.registrationNumber || 'Verified Plate');

                    return (
                      <div key={b._id} style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }} className="p-5">
                        {/* Top row: route + status */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(163,230,53,0.08)' }}>
                              <Navigation className="w-5 h-5 text-[#a3e635]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[14px] font-bold text-white">{source}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-[#a3e635]" />
                                <span className="text-[14px] font-bold text-white">{destination}</span>
                              </div>
                              <span className="text-[11px] text-[#a6a6a6]">{dateStr} · {timeStr}</span>
                            </div>
                          </div>
                          <span className={`badge-verified uppercase text-[10px] font-bold ${
                            b.status === 'cancelled' || b.status === 'rejected' ? '!bg-red-500/10 !text-red-400 !border-red-500/20' : ''
                          }`}>
                            {b.status}
                          </span>
                        </div>

                        {/* Info grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '10px 12px' }}>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[9px] uppercase font-semibold text-[#888]">Driver</span>
                              <button
                                onClick={() => handleOpenReport(dObj._id || b.rideId?.driverId?._id || b.rideId?.driverId, driverName)}
                                className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-0.5 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 transition cursor-pointer"
                              >
                                <AlertTriangle className="w-3 h-3" /> Report 🚩
                              </button>
                            </div>
                            <span className="text-[12px] font-bold text-white block">{driverName}</span>
                            {(b.status === 'accepted' || b.status === 'completed') && driverPhone && (
                              <a href={`tel:${driverPhone}`} className="inline-flex items-center gap-1 mt-1 text-[11px] font-mono font-semibold text-[#a3e635]" style={{ background: 'rgba(163,230,53,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                                <Phone className="w-3 h-3" /> {driverPhone}
                              </a>
                            )}
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '10px 12px' }}>
                            <span className="text-[9px] uppercase font-semibold text-[#888] block mb-1">Vehicle</span>
                            <span className="font-mono text-[12px] font-bold text-[#a3e635] block">{registrationNumber}</span>
                            <span className="text-[10px] text-[#888] block">{vehicleModel}</span>
                          </div>
                        </div>

                        {/* Cancelled / Rejected backup */}
                        {(b.status === 'cancelled' || b.status === 'rejected') && (
                          <div className="mt-3 p-3 rounded-lg flex items-center justify-between gap-2 flex-wrap" style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)' }}>
                            <div className="flex items-center gap-2 text-[#fbbf24] text-[12px] font-semibold">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{b.status === 'rejected' ? 'Driver was unavailable for this time' : 'Driver cancelled ride'}</span>
                            </div>
                            <Link to="/find-ride" className="px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                              <RefreshCw className="w-3.5 h-3.5" /> Find Backup Ride
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </section>
            )}

            {/* Offered Tab */}
            {activeTab === 'offered' && (
              <section className="space-y-3">
                {offeredRides.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.1)' }}>
                      <Car className="w-7 h-7 text-[#a3e635]" />
                    </div>
                    <h3 className="font-archivo font-bold text-[20px] tracking-[-0.03em]">No offered rides</h3>
                    <p className="text-[13px] text-[#525252] mt-2 max-w-xs mx-auto">
                      Share your commute and earn CampusPoints.
                    </p>
                    <Link to="/offer-ride" className="btn-primary mt-6 inline-flex">Offer a Ride</Link>
                  </div>
                ) : (
                  offeredRides.slice(0, 3).map((ride) => (
                    <div key={ride._id} style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }} className="p-5">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(163,230,53,0.08)' }}>
                            <Navigation className="w-5 h-5 text-[#a3e635]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-semibold">{ride.source}</span>
                              <ArrowRight className="w-3 h-3 text-[#525252]" />
                              <span className="text-[14px] font-semibold">{ride.destination}</span>
                            </div>
                            <span className="text-[11px] text-[#525252]">{ride.date} · {ride.departureTime} · {ride.availableSeats} seats · ₹{ride.contribution}/seat</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="badge-verified">ACTIVE</span>
                          <button
                            onClick={() => handleDeleteRide(ride._id)}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5 transition cursor-pointer"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                            title="Cancel and delete this ride offer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Ride
                          </button>
                        </div>
                      </div>

                      {/* Passenger requests */}
                      <div>
                        <p className="text-[10px] font-semibold text-[#666] uppercase tracking-[0.1em] mb-2">Passenger Requests</p>
                        {!ride.incomingRequests || ride.incomingRequests.length === 0 ? (
                          <p className="text-[12px] text-[#525252] py-3">No requests yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {ride.incomingRequests.map((req) => (
                              <div key={req._id} className="flex items-center justify-between py-2.5 px-3 rounded-lg flex-wrap gap-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-[12px] text-white">{req.passengerId?.fullName}</span>
                                  <span className="text-[11px] text-[#888]">{req.requestedSeats} seat(s)</span>
                                  <button
                                    onClick={() => handleOpenReport(req.passengerId?._id, req.passengerId?.fullName || 'Passenger')}
                                    className="text-[9px] font-bold text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 cursor-pointer"
                                  >
                                    Report 🚩
                                  </button>
                                </div>
                                {req.status === 'pending' ? (
                                  <div className="flex items-center gap-2">
                                    <button onClick={() => handleAcceptRequest(req._id)} className="btn-primary !text-[10px] !px-3 !py-1.5">
                                      <Check className="w-3 h-3" /> Accept
                                    </button>
                                    <button onClick={() => handleRejectRequest(req._id)} className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-[#666] hover:text-white transition" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className="badge-verified">ACCEPTED</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </section>
            )}
          </>
        )}

        <PaymentModal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} rideRequest={selectedReqForPayment} onPaymentSuccess={() => { showToast('Payment successful!', 'success'); loadData(); }} />

        {/* Report Modal */}
        {reportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 rounded-2xl bg-[#1e1e1e] border border-white/10 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-red-400 font-archivo font-bold text-[16px]">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Report User Safety Incident</span>
                </div>
                <button onClick={() => setReportModalOpen(false)} className="text-[#888] hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-300 text-[11px]">
                🛡️ <strong>Female Safety Protection Protocol:</strong> Accounts receiving 5+ reports from female commuters are automatically suspended by system audit.
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#888] uppercase tracking-wider mb-1">Reporting User</label>
                  <input
                    type="text"
                    disabled
                    value={reportingUser?.name || 'User Account'}
                    className="w-full p-3 rounded-xl bg-[#141414] border border-white/10 text-white font-bold text-[13px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#888] uppercase tracking-wider mb-1">Incident Category</label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#141414] border border-white/10 text-white text-[13px]"
                  >
                    <option value="harassment">Harassment / Inappropriate Behavior (Female Safety Flag)</option>
                    <option value="unsafe_driving">Unsafe / Reckless Driving</option>
                    <option value="no_show">No-Show / Abandonment</option>
                    <option value="fraud">Fare Abuse / Misconduct</option>
                    <option value="other">Other Incident</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#888] uppercase tracking-wider mb-1">Detailed Description</label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    rows={3}
                    placeholder="Provide details about the incident or behavior..."
                    className="w-full p-3 rounded-xl bg-[#141414] border border-white/10 text-white text-[13px] resize-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="flex-1 py-3 rounded-xl text-[12px] font-bold text-[#888] hover:text-white bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="flex-1 py-3 rounded-xl text-[12px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                  >
                    {submittingReport ? 'Submitting...' : 'Submit Report 🚩'}
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

export default MyRidesPage;
