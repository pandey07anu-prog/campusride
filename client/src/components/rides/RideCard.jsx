import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MatchScoreBadge from './MatchScoreBadge';
import UserAvatar from '../common/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import AuthRequiredModal from '../auth/AuthRequiredModal';
import { ShieldCheck, Clock, Users, Car, ChevronRight, Star, Settings, Calendar } from 'lucide-react';

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return 'Today';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    }
  } catch (e) {}
  return dateStr;
};

const RideCard = ({ ride, onRequest }) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const driver = (ride && typeof ride.driverId === 'object' && ride.driverId) ? ride.driverId : {};
  const vehicle = (ride && typeof ride.vehicleId === 'object' && ride.vehicleId) ? ride.vehicleId : {};
  const isDriver = user?._id && (user._id === driver._id || user._id === ride?.driverId);

  const handleRequestClick = (e) => {
    if (!user) {
      e.preventDefault();
      showToast('Please sign in to book carpool seats.', 'warning');
      setAuthModalOpen(true);
      return;
    }
    if (ride.isGirlsOnly && user?.gender === 'male') {
      e.preventDefault();
      showToast('This ride is exclusively for verified female students.', 'error');
      return;
    }
    if (onRequest) onRequest(ride);
  };

  return (
    <div className="lift-card glare-hover rounded-xl p-5 hover:border-white/10 transition-all flex flex-col justify-between space-y-4" style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Top: Driver + Match Score */}
      <div className="flex items-center justify-between gap-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <UserAvatar user={driver} className="w-11 h-11 rounded-xl border border-white/10 text-xs font-semibold" />
            {driver.verificationStatus === 'verified' && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-md bg-[#a3e635] flex items-center justify-center">
                <ShieldCheck className="w-2.5 h-2.5 text-[#171717]" />
              </div>
            )}
          </div>
          <div>
            <h4 className="font-archivo font-extrabold text-[15px] tracking-[-0.03em] leading-tight">{driver.fullName || 'Verified Driver'}</h4>
            <div className="flex items-center gap-1.5 mt-1">
              {driver.rating && (
                <>
                  <span className="flex items-center font-archivo font-bold text-[#fbbf24] gap-0.5 text-[12px]">
                    <Star className="w-3 h-3 fill-[#fbbf24]" />
                    {driver.rating}
                  </span>
                  <span className="text-[10px] text-[#525252]">({driver.ratingCount || 0})</span>
                  <span className="text-[10px] text-[#333]">·</span>
                </>
              )}
              <span className="text-[11px] text-[#525252] truncate max-w-[120px]">{driver.university || 'Verified Campus'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {ride.isGirlsOnly && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 shrink-0">
              🌸 Girls Only
            </span>
          )}
          {ride.matchScore !== undefined && (
            <MatchScoreBadge score={ride.matchScore} />
          )}
        </div>
      </div>

      {/* Route */}
      <div className="py-1">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center pt-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#a3e635]" />
            <div className="w-px h-6 bg-white/10 my-0.5" />
            <div className="w-2.5 h-2.5 rounded-full border-2 border-[#a3e635]" />
          </div>
          <div className="space-y-2.5 flex-1">
            <div>
              <p className="text-[9px] uppercase font-semibold text-[#525252] tracking-[0.12em] mb-0.5">Pickup</p>
              <p className="font-archivo font-bold text-[14px] tracking-[-0.02em] leading-snug">{ride.source}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase font-semibold text-[#525252] tracking-[0.12em] mb-0.5">Destination</p>
              <p className="font-archivo font-bold text-[14px] tracking-[-0.02em] leading-snug">{ride.destination}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex flex-col items-center justify-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <span className="text-[8px] uppercase font-bold text-[#525252] flex items-center gap-1 tracking-[0.1em]">
            <Calendar className="w-3 h-3 text-[#a3e635]" /> Date
          </span>
          <span className="font-archivo font-extrabold text-[12px] tracking-[-0.02em] mt-1 text-center truncate max-w-[95px]">
            {formatDateDisplay(ride.date)}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <span className="text-[8px] uppercase font-bold text-[#525252] flex items-center gap-1 tracking-[0.1em]">
            <Clock className="w-3 h-3 text-[#a3e635]" /> Time
          </span>
          <span className="font-archivo font-extrabold text-[12px] tracking-[-0.02em] mt-1 text-center truncate max-w-[95px]">
            {ride.departureTime}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <span className="text-[8px] uppercase font-bold text-[#525252] flex items-center gap-1 tracking-[0.1em]">
            <Users className="w-3 h-3 text-[#a3e635]" /> Seats
          </span>
          <span className={`font-archivo font-extrabold text-[12px] tracking-[-0.02em] mt-1 ${ride.availableSeats > 0 ? 'text-[#a3e635]' : 'text-red-400'}`}>
            {ride.availableSeats}/{ride.totalSeats || ride.availableSeats}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <span className="text-[8px] uppercase font-bold text-[#525252] flex items-center gap-1 tracking-[0.1em]">
            <Car className="w-3 h-3 text-[#a3e635]" /> Vehicle
          </span>
          <span className="font-archivo font-extrabold text-[12px] tracking-[-0.02em] mt-1 truncate max-w-[95px] text-center">
            {vehicle.model || 'Car'}
          </span>
        </div>
      </div>

      {/* Bottom: Price + Actions */}
      <div className="pt-1 flex items-center justify-between">
        <div>
          <span className="text-[9px] text-[#525252] font-semibold uppercase tracking-[0.1em]">Contribution</span>
          <div className="font-archivo font-extrabold text-[20px] tracking-[-0.04em] leading-none mt-1 flex items-baseline gap-1">
            ₹{ride.contribution}
            <span className="text-[10px] font-medium text-[#525252] tracking-normal">/ seat</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDriver ? (
            <Link
              to="/manage-requests"
              className="btn-primary !text-[11px] px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition"
            >
              <Settings className="w-3 h-3" />
              Manage
            </Link>
          ) : (
            <button
              onClick={handleRequestClick}
              disabled={ride.availableSeats === 0}
              className={`px-4 py-2 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all ${
                ride.availableSeats > 0
                  ? 'btn-primary'
                  : 'text-[#525252] cursor-not-allowed'
              }`}
              style={ride.availableSeats === 0 ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' } : {}}
            >
              {ride.availableSeats > 0 ? 'Request' : 'Full'}
              {ride.availableSeats > 0 && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      <AuthRequiredModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default RideCard;
