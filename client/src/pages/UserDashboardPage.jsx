import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import useScrollReveal from '../hooks/useScrollReveal';
import UserAvatar from '../components/common/UserAvatar';
import {
  Navigation,
  Search,
  PlusCircle,
  ShieldCheck,
  Award,
  Users,
  ArrowRight,
  Wallet,
  Clock,
  CreditCard,
  Car,
  Zap,
  Inbox,
} from 'lucide-react';

const UserDashboardPage = () => {
  const { user } = useAuth();
  const revealRef = useScrollReveal();
  const [stats, setStats] = useState({
    walletBalance: user?.walletBalance ?? 0,
    campusPoints: user?.campusPoints ?? 0,
    ridesTaken: user?.ridesTakenCount || 0,
    ridesOffered: user?.ridesOfferedCount || 0,
  });

  const [recentRides, setRecentRides] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [meRes, walletRes, bookedRes, offeredRes] = await Promise.all([
        api.get('/auth/me').catch(() => ({ success: false })),
        api.get('/payments/wallet').catch(() => ({ success: false })),
        api.get('/my-rides/booked').catch(() => ({ success: false, data: [] })),
        api.get('/my-rides/offered').catch(() => ({ success: false, data: [] })),
      ]);

      if (meRes.success && meRes.data?.user) {
        const u = meRes.data.user;
        setStats((prev) => ({
          ...prev,
          campusPoints: u.campusPoints || 0,
          ridesTaken: u.ridesTakenCount || 0,
          ridesOffered: u.ridesOfferedCount || 0,
        }));
      }

      if (walletRes.success && walletRes.data) {
        setStats((prev) => ({
          ...prev,
          walletBalance: walletRes.data.walletBalance,
        }));
      }

      if (bookedRes.success && bookedRes.data) {
        setRecentRides(bookedRes.data.slice(0, 3));
      }

      if (offeredRes.success && offeredRes.data) {
        const requests = [];
        offeredRes.data.forEach((ride) => {
          if (ride.incomingRequests) {
            ride.incomingRequests.forEach((req) => {
              if (req.status === 'pending') {
                requests.push({ ...req, ride });
              }
            });
          }
        });
        setPendingRequests(requests);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  return (
    <MainLayout>
      <div ref={revealRef} className="max-w-6xl mx-auto space-y-10 pb-16">

        {/* 1. WELCOME HERO */}
        <section className="sr sr-up space-y-4">
          <p className="uppercase tracking-[0.15em] text-[11px] font-semibold text-[#525252]">Dashboard</p>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <UserAvatar user={user} className="w-14 h-14 rounded-lg border border-white/10" />
                {user?.verificationStatus === 'verified' && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-[#a3e635] flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#171717]" />
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-archivo font-extrabold text-[22px] tracking-[-0.04em] leading-none">
                    Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}
                  </h1>
                  {user?.gender && user.gender !== 'unspecified' && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      user.gender === 'female'
                        ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                        : user.gender === 'male'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : 'bg-white/10 text-white/70 border-white/20'
                    }`}>
                      {user.gender === 'female' ? 'Female 👧' : user.gender === 'male' ? 'Male 👦' : user.gender}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-[#a6a6a6] font-medium mt-1">
                  {user?.university || 'University Campus'} • {user?.department || 'General'} Student
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <Link to="/find-ride" className="btn-primary shimmer flex-1 md:flex-initial">
                <Search className="w-4 h-4" /> Find a Ride
              </Link>
              <Link to="/offer-ride" className="flex-1 md:flex-initial px-4 py-2 rounded-md text-[12px] font-medium text-white flex items-center justify-center gap-2 transition-all magnetic" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <PlusCircle className="w-4 h-4 text-[#a3e635]" /> Offer Ride
              </Link>
            </div>
          </div>
        </section>

        {/* 2. STATS ROW */}
        <section className="sr sr-up sr-d1 grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="p-5 block" style={{ background: '#171717' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#525252]">CampusPoints</span>
              <Award className="w-4 h-4 text-[#a3e635]" />
            </div>
            <div className="font-archivo font-extrabold text-[22px] tracking-[-0.04em] text-[#a3e635]">{stats.campusPoints} pts</div>
            <span className="text-[11px] text-[#525252] font-medium mt-1 block">
              {stats.campusPoints >= 300
                ? 'Platinum Campus Legend'
                : stats.campusPoints >= 150
                ? 'Gold Eco Commuter'
                : stats.campusPoints >= 50
                ? 'Silver Commuter'
                : 'Bronze Commuter'}
            </span>
          </div>

          <div className="p-5 block" style={{ background: '#171717' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#525252]">Rides Taken</span>
              <Car className="w-4 h-4 text-[#a3e635]" />
            </div>
            <div className="font-archivo font-extrabold text-[22px] tracking-[-0.04em]">{stats.ridesTaken}</div>
            <span className="text-[11px] text-[#525252] font-medium mt-1 block flex items-center gap-1"><Zap className="w-3 h-3" /> 60% Fuel Saved</span>
          </div>

          <div className="p-5 block" style={{ background: '#171717' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#525252]">Safety Rating</span>
              <ShieldCheck className={`w-4 h-4 ${user?.verificationStatus === 'verified' ? 'text-[#a3e635]' : 'text-white/40'}`} />
            </div>
            <div className="font-archivo font-extrabold text-[22px] tracking-[-0.04em] text-[#a3e635]">
              {user?.rating ? `${Number(user.rating).toFixed(1)} ★` : '5.0 ★'}
            </div>
            <span className="text-[11px] text-[#525252] font-medium mt-1 block">
              {user?.ratingCount ? `${user.ratingCount} Reviews Verified` : (user?.verificationStatus === 'verified' ? 'Verified Student Profile' : 'Verified Campus Member')}
            </span>
          </div>
        </section>

        {/* 2.5 PENDING REQUESTS — link to full page */}
        {pendingRequests.length > 0 && (
          <Link to="/manage-requests" className="block" style={{ background: '#1e1e1e', border: '1px solid rgba(163,230,53,0.12)', borderRadius: '12px' }}>
            <div className="p-5 flex items-center justify-between gap-4 hover:bg-white/[0.01] transition">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(163,230,53,0.08)' }}>
                  <Inbox className="w-5 h-5 text-[#a3e635]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-archivo font-bold text-[15px] tracking-[-0.02em]">Passenger Requests</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#a3e635] text-[#171717]">{pendingRequests.length}</span>
                  </div>
                  <p className="text-[12px] text-[#525252] mt-0.5">Review and accept passengers for your offered rides.</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#525252] shrink-0" />
            </div>
          </Link>
        )}

        {/* 3. QUICK ACTIONS — Bento Grid */}
        <section className="sr sr-up sr-d2 space-y-4">
          <p className="uppercase tracking-[0.15em] text-[11px] font-semibold text-[#525252]">Quick Actions</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/my-rides" className="glass-card p-6 group block transition-all hover:border-white/15">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: 'rgba(163,230,53,0.08)' }}>
                    <Car className="w-4 h-4 text-[#a3e635]" />
                  </div>
                  <h3 className="font-archivo font-bold text-[15px] tracking-[-0.03em]">My Rides & Bookings</h3>
                  <p className="text-[12px] text-[#525252] leading-[1.6]">Track active bookings, passenger requests, and boarding passes.</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#333] group-hover:text-[#a3e635] transition-colors mt-1" />
              </div>
            </Link>



            {user?.gender === 'female' && (
              <Link to="/safety-center" className="glass-card p-6 group block transition-all hover:border-white/15">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: 'rgba(163,230,53,0.08)' }}>
                      <ShieldCheck className="w-4 h-4 text-[#a3e635]" />
                    </div>
                    <h3 className="font-archivo font-bold text-[15px] tracking-[-0.03em]">Safety Center</h3>
                    <p className="text-[12px] text-[#525252] leading-[1.6]">View emergency contacts, live trip sharing, and ride history audit.</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#333] group-hover:text-[#a3e635] transition-colors mt-1" />
                </div>
              </Link>
            )}
          </div>
        </section>

        {/* 4. RECENT RIDE BOOKINGS */}
        <section className="sr sr-up sr-d3 space-y-4">
          <div className="flex items-center justify-between">
            <p className="uppercase tracking-[0.15em] text-[11px] font-semibold text-[#525252]">Recent Bookings</p>
            <Link to="/my-rides" className="text-[12px] font-medium text-[#a3e635] hover:underline">View All</Link>
          </div>

          <div className="glass-card divide-y divide-white/[0.04]">
            {recentRides.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-[13px] text-[#525252]">No recent carpool bookings found.</p>
                <p className="text-[12px] text-[#333] mt-1">Find a ride or offer one to get started!</p>
              </div>
            ) : (
              recentRides.map((b) => (
                <div key={b._id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <Navigation className="w-4 h-4 text-[#a3e635]" />
                    </div>
                    <div>
                      <h4 className="font-archivo font-bold text-[13px] tracking-[-0.02em]">{b.rideId?.source} → {b.rideId?.destination}</h4>
                      <span className="text-[11px] text-[#525252]">{b.rideId?.date} at {b.rideId?.departureTime}</span>
                    </div>
                  </div>
                  <span className="badge-verified">{b.status}</span>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </MainLayout>
  );
};

export default UserDashboardPage;
