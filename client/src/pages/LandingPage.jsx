import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import useScrollReveal from '../hooks/useScrollReveal';
import useCountUp from '../hooks/useCountUp';
import api from '../services/api';
import GenderSelectionModal from '../components/common/GenderSelectionModal';
import {
  ShieldCheck, MailCheck, BadgeCheck, Search,
  ArrowUpRight, ArrowRight, Star, Instagram, Linkedin,
  Send, ArrowUp, MapPin, Users, Car, Route,
  CircleDot, Eye, Leaf, Navigation, MessageSquare, Plus, X
} from 'lucide-react';

const Icon = ({ icon: I, className = '', ...p }) => <I strokeWidth={1.5} className={className} {...p} />;

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const go = (u) => navigate(u ? '/dashboard' : '/login');
  const revealRef = useScrollReveal();
  const countRef = useCountUp();
  const [searchDestination, setSearchDestination] = useState('');
  const [locating, setLocating] = useState(false);

  // Dynamic Real Data States
  const [testimonials, setTestimonials] = useState([]);
  const [platformStats, setPlatformStats] = useState({
    totalStudents: 16,
    totalRides: 5,
    totalFaresSplit: 1500,
  });
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newMessage, setNewMessage] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchRealData = async () => {
    try {
      setLoadingReviews(true);
      const [fRes, statsRes] = await Promise.all([
        api.get('/features/feedback/public').catch(() => api.get('/features/feedback').catch(() => ({ success: false }))),
        api.get('/features/platform-stats').catch(() => ({ success: false })),
      ]);
      if (fRes && fRes.success && Array.isArray(fRes.data)) {
        setTestimonials(fRes.data);
      }
      if (statsRes && statsRes.success && statsRes.data) {
        setPlatformStats(statsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to share your experience.', 'warning');
      navigate('/login');
      return;
    }
    if (!newMessage.trim()) {
      showToast('Please enter your review message.', 'warning');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.post('/features/feedback', {
        name: user.fullName || 'Verified Student',
        university: user.university || 'Verified Campus',
        rating: newRating,
        message: newMessage.trim(),
        category: 'Carpool Experience',
      });
      if (res.success) {
        showToast('Thank you! Your review has been posted.', 'success');
        setShowReviewModal(false);
        setNewMessage('');
        if (res.data) {
          setTestimonials((prev) => [res.data, ...prev]);
        }
        fetchRealData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (!searchDestination.trim()) return;
    setLocating(true);
    if (!navigator.geolocation) {
      navigate(`/find-ride?destination=${encodeURIComponent(searchDestination.trim())}`);
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&countrycodes=in&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
          const state = data.address?.state || '';
          const source = [city, state].filter(Boolean).join(', ');
          navigate(`/find-ride?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(searchDestination.trim())}`);
        } catch {
          navigate(`/find-ride?destination=${encodeURIComponent(searchDestination.trim())}`);
        }
        setLocating(false);
      },
      () => {
        navigate(`/find-ride?destination=${encodeURIComponent(searchDestination.trim())}`);
        setLocating(false);
      },
      { timeout: 5000 }
    );
  };

  return (
    <div ref={revealRef} className="bg-[#171717] text-white font-sans antialiased min-h-screen relative overflow-x-hidden">

      {/* ===== HEADER ===== */}
      <header className="relative z-50 max-w-[1400px] mx-auto px-6 lg:px-10 pt-6 pb-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Icon icon={Navigation} className="w-4 h-4 text-[#a3e635]" />
            </div>
            <span className="font-archivo font-extrabold text-[17px] tracking-[-0.02em]">CampusRide</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              <Link to="/find-ride" className="text-[14px] font-semibold text-[#d4d4d4] hover:text-[#a3e635] transition-colors duration-150">Find Ride</Link>
              <Link to="/offer-ride" className="text-[14px] font-semibold text-[#d4d4d4] hover:text-[#a3e635] transition-colors duration-150">Offer Ride</Link>
              <Link to="/safety-center" className="text-[14px] font-semibold text-[#d4d4d4] hover:text-[#a3e635] transition-colors duration-150">Safety</Link>
            </div>
            <button onClick={() => go(user)} className="star-border h-9 px-5 rounded-md text-[13px] font-extrabold transition-all duration-150 cursor-pointer" style={{ background: 'white', color: '#171717' }}>
              {user ? 'Dashboard' : 'Log In'}
            </button>
          </div>
        </nav>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 pt-12 md:pt-20 pb-10">
        <div className="max-w-3xl">
          <p className="hero-sub text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#a3e635] mb-5 inline-block px-3.5 py-1 rounded-full border border-[#a3e635]/30" style={{ background: 'rgba(163,230,53,0.1)' }}>
            Pan-India College & University Carpooling
          </p>
          <h1 className="hero-title font-archivo font-black text-[clamp(3rem,7.5vw,6.75rem)] leading-[0.92] tracking-[-0.05em]">
            SAME ROAD.<br />
            <span className="text-[#a3e635]">SPLIT RIDE.</span>
          </h1>
          <p className="hero-sub mt-6 text-[#d4d4d4] font-medium text-[16px] md:text-[18px] max-w-xl leading-[1.6]">
            Ride-share with verified college students across India. Split the fare, cut your daily commute cost, and your personal information stays hidden until a driver accepts.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleHeroSearch} className="hero-sub mt-10 max-w-xl p-2 rounded-2xl border transition-all" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-2 pl-2">
            <div className="flex items-center gap-2.5 flex-1">
              <Navigation className="w-4 h-4 text-[#a3e635] shrink-0" />
              <input
                type="text"
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
                placeholder="Search college or destination in India..."
                className="w-full bg-transparent text-[15px] font-semibold text-white placeholder:text-[#888] focus:outline-none py-2"
              />
            </div>
            <button
              type="submit"
              disabled={locating}
              className="h-11 px-5 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 shrink-0 transition-all hover:scale-105 cursor-pointer"
              style={{ background: '#a3e635', color: '#171717' }}
            >
              {locating ? (
                <div className="w-4 h-4 border-2 border-[#171717]/30 border-t-[#171717] rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 text-[#171717]" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick badges */}
        <div className="flex flex-wrap gap-3 mt-8">
          {[
            { icon: MailCheck, label: 'Campus .edu Verified' },
            { icon: Eye, label: 'Number Hidden Until Match' },
            { icon: BadgeCheck, label: 'Vehicle on Record' },
          ].map(({ icon: Ic, label }) => (
            <div key={label} className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-semibold text-[#f5f5f5]" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(163,230,53,0.2)' }}>
              <Icon icon={Ic} className="w-4 h-4 text-[#a3e635]" />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ===== DUAL MARQUEE ===== */}
      <div className="relative z-10 my-4">
        <div className="relative" style={{ transform: 'rotate(-1deg)' }}>
          <div className="py-3.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex whitespace-nowrap" style={{ animation: 'marquee 35s linear infinite' }}>
              {[0, 1].map((i) => (
                <span key={i} className="font-archivo font-bold text-white text-[28px] md:text-[40px] uppercase tracking-[-0.03em] px-5 flex items-center gap-4 shrink-0">
                  <span>Pan-India Routes</span><CircleDot className="w-3 h-3 text-[#a3e635] shrink-0" />
                  <span>College Students Only</span><CircleDot className="w-3 h-3 text-[#a3e635] shrink-0" />
                  <span>Instant Fare Split</span><CircleDot className="w-3 h-3 text-[#a3e635] shrink-0" />
                  <span>All Campus Hubs</span><CircleDot className="w-3 h-3 text-[#a3e635] shrink-0" />
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="relative -mt-1" style={{ transform: 'rotate(1deg)' }}>
          <div className="py-3.5 overflow-hidden" style={{ background: '#a3e635' }}>
            <div className="flex whitespace-nowrap" style={{ animation: 'marquee 28s linear infinite reverse' }}>
              {[0, 1].map((i) => (
                <span key={i} className="font-archivo font-bold text-[#171717] text-[28px] md:text-[40px] uppercase tracking-[-0.03em] px-5 flex items-center gap-4 shrink-0">
                  <span>Indian Universities</span><CircleDot className="w-3 h-3 text-[#171717] shrink-0" />
                  <span>Safety First</span><CircleDot className="w-3 h-3 text-[#171717] shrink-0" />
                  <span>Hassle Free Commute</span><CircleDot className="w-3 h-3 text-[#171717] shrink-0" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== FEATURES — BENTO LAYOUT ===== */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 py-20">
        <p className="sr sr-up text-[11px] font-semibold uppercase tracking-[0.15em] text-[#a3e635] mb-3">Features</p>
        <h2 className="sr sr-up sr-d1 gradient-text font-archivo font-semibold text-[clamp(1.75rem,4vw,3rem)] tracking-[-0.04em] mb-12">WHY CAMPUSRIDE</h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Big feature — spans 7 cols */}
          <div className="sr sr-up sr-d2 lift-card glare-hover md:col-span-7 rounded-xl p-8 flex flex-col justify-between min-h-[280px]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5" style={{ background: 'rgba(163,230,53,0.12)' }}>
                <Icon icon={ShieldCheck} className="w-5 h-5 text-[#a3e635]" />
              </div>
              <h3 className="font-archivo font-semibold text-[22px] tracking-[-0.02em] mb-3">Verified Students Only</h3>
              <p className="text-[#a6a6a6] text-[14px] leading-[1.6] max-w-md">Every account is authenticated through a verified college/university email. Your ride pool is students who share your campus and route, not the open internet.</p>
            </div>
            <div className="flex items-center gap-2 mt-6 text-[12px] text-[#525252]">
              <Icon icon={MailCheck} className="w-3.5 h-3.5" />
              <span>Campus email verification required</span>
            </div>
          </div>

          {/* Right stack — 5 cols */}
          <div className="sr sr-up sr-d3 md:col-span-5 grid grid-rows-2 gap-3">
            <div className="lift-card glare-hover rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-9 h-9 rounded-md flex items-center justify-center mb-3" style={{ background: 'rgba(163,230,53,0.12)' }}>
                <Icon icon={Eye} className="w-4 h-4 text-[#a3e635]" />
              </div>
              <h3 className="font-archivo font-bold text-[16px] tracking-[-0.01em] mb-1.5">Privacy First</h3>
              <p className="text-[#d4d4d4] font-medium text-[13px] leading-[1.5]">Your number stays hidden and is only shared once a driver accepts your request.</p>
            </div>
            <div className="lift-card glare-hover rounded-xl p-6" style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.15)' }}>
              <div className="w-9 h-9 rounded-md flex items-center justify-center mb-3" style={{ background: 'rgba(163,230,53,0.15)' }}>
                <Icon icon={Leaf} className="w-4 h-4 text-[#a3e635]" />
              </div>
              <h3 className="font-archivo font-bold text-[16px] tracking-[-0.01em] mb-1.5">Eco-Friendly</h3>
              <p className="text-[#d4d4d4] font-medium text-[13px] leading-[1.5]">Fewer cars on the same road means less traffic and a smaller footprint for every trip you share.</p>
            </div>
          </div>

          {/* Bottom row — 3 equal cols */}
          <div className="sr sr-up sr-d4 lift-card glare-hover md:col-span-4 rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-9 h-9 rounded-md flex items-center justify-center mb-3" style={{ background: 'rgba(163,230,53,0.12)' }}>
              <Icon icon={Car} className="w-4 h-4 text-[#a3e635]" />
            </div>
            <h3 className="font-archivo font-bold text-[16px] tracking-[-0.01em] mb-1.5">Easy Carpooling</h3>
            <p className="text-[#d4d4d4] font-medium text-[13px] leading-[1.5]">Set your route once. CampusRide matches you with students already driving it.</p>
          </div>
          <div className="sr sr-up sr-d5 lift-card glare-hover md:col-span-4 rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-9 h-9 rounded-md flex items-center justify-center mb-3" style={{ background: 'rgba(163,230,53,0.12)' }}>
              <Icon icon={Users} className="w-4 h-4 text-[#a3e635]" />
            </div>
            <h3 className="font-archivo font-bold text-[16px] tracking-[-0.01em] mb-1.5">Commute Groups</h3>
            <p className="text-[#d4d4d4] font-medium text-[13px] leading-[1.5]">Find the same faces on your route and turn a one-off ride into a regular carpool.</p>
          </div>
          <div className="sr sr-up sr-d6 lift-card glare-hover md:col-span-4 rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-9 h-9 rounded-md flex items-center justify-center mb-3" style={{ background: 'rgba(163,230,53,0.12)' }}>
              <Icon icon={BadgeCheck} className="w-4 h-4 text-[#a3e635]" />
            </div>
            <h3 className="font-archivo font-bold text-[16px] tracking-[-0.01em] mb-1.5">Affordable Travel</h3>
            <p className="text-[#d4d4d4] font-medium text-[13px] leading-[1.5]">Fares split automatically in-app. No cash, no "so how much do I owe you."</p>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS — HORIZONTAL STEPS ===== */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="sr sr-up text-[12px] font-bold uppercase tracking-[0.15em] text-[#a3e635] mb-3">Process</p>
            <h2 className="sr sr-up sr-d1 gradient-text font-archivo font-extrabold text-[clamp(1.75rem,4vw,3rem)] tracking-[-0.04em]">HOW IT WORKS</h2>
          </div>
          <p className="sr sr-up sr-d2 text-[#d4d4d4] font-bold text-[14px] hidden md:block">Three steps. That's it.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: 'rgba(255,255,255,0.08)' }}>
          {[
            { num: '01', icon: MailCheck, title: 'Sign Up', desc: 'Join with your .edu email. Verified in under 2 minutes.' },
            { num: '02', icon: Route, title: 'Post or Find', desc: 'Set your daily route, or find someone already driving yours.' },
            { num: '03', icon: Car, title: 'Ride & Split', desc: 'Match with a verified rider. Fare splits instantly in-app.' },
          ].map(({ num, icon: Ic, title, desc }, i) => (
            <div key={i} className={`sr sr-up sr-d${i + 2} lift-card glare-hover group p-8 relative`} style={{ background: '#171717' }}>
              <span className="font-archivo font-extrabold text-[52px] leading-none tracking-[-0.05em]" style={{ color: 'rgba(255,255,255,0.22)' }}>{num}</span>
              <div className="w-10 h-10 rounded-md flex items-center justify-center mt-6 mb-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <Icon icon={Ic} className="w-5 h-5 text-[#a3e635] group-hover:scale-110 transition-transform duration-150" />
              </div>
              <h3 className="font-archivo font-bold text-[17px] text-white mb-2">{title}</h3>
              <p className="text-[#d4d4d4] font-medium text-[14px] leading-[1.6]">{desc}</p>
            </div>
          ))}
        </div>
      </section>



      {/* ===== STATS (LIVE DATABASE METRICS) ===== */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        <div className="sr sr-scale beam rounded-xl p-10 md:px-16 md:py-12 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="absolute top-0 right-0 w-[400px] h-[300px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(163,230,53,0.04), transparent)' }} />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            {[
              { num: platformStats.totalStudents || 16, prefix: '', suffix: '+', label: 'Registered Students' },
              { num: platformStats.totalRides || 5, prefix: '', suffix: '+', label: 'Campus Routes Posted' },
              { num: platformStats.totalFaresSplit || 1500, prefix: '₹', suffix: '', label: 'Fares Split Across Campus' },
            ].map(({ num, prefix, suffix, label }, i) => (
              <div key={i}>
                <p className="font-archivo font-bold text-[clamp(1.75rem,3vw,2.75rem)] tracking-[-0.04em] text-[#a3e635]">
                  <span>
                    {prefix}{Number(num).toLocaleString()}{suffix}
                  </span>
                </p>
                <p className="text-[#525252] text-[13px] mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS (DYNAMIC REAL DATABASE REVIEWS) ===== */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#a3e635] mb-3">Student Reviews</p>
            <h2 className="gradient-text font-archivo font-semibold text-[clamp(1.75rem,4vw,3rem)] tracking-[-0.04em]">WHAT STUDENTS SAY</h2>
          </div>
          <button
            onClick={() => {
              if (!user) {
                showToast('Please sign in to share your experience.', 'warning');
                navigate('/login');
                return;
              }
              setShowReviewModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all shrink-0 cursor-pointer"
            style={{ background: 'rgba(163,230,53,0.12)', color: '#a3e635', border: '1px solid rgba(163,230,53,0.25)' }}
          >
            <Plus className="w-4 h-4" /> Share Your Review
          </button>
        </div>

        {loadingReviews ? (
          <div className="py-12 text-center text-[#525252] text-xs">Loading verified student reviews from database...</div>
        ) : testimonials.length > 0 ? (
          <div className="space-y-4">
            {/* Featured testimonial — latest real review */}
            {testimonials[0] && (
              <div className="lift-card glare-hover rounded-xl p-8 flex flex-col justify-between" style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.15)' }}>
                <div>
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: testimonials[0].rating || 5 }).map((_, s) => (
                      <Star key={s} className="w-4 h-4 text-[#fbbf24] fill-current" />
                    ))}
                  </div>
                  <p className="text-[17px] leading-[1.6] text-[#d4d4d4]">"{testimonials[0].message}"</p>
                </div>
                <div className="flex items-center gap-3 mt-8">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0" style={{ background: '#a3e635', color: '#171717' }}>
                    {testimonials[0].name ? testimonials[0].name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-white">{testimonials[0].name}</p>
                    <p className="text-[#525252] text-[12px]">{testimonials[0].university || 'Verified Campus'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* All additional real database reviews in responsive grid */}
            {testimonials.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                {testimonials.slice(1).map((item) => (
                  <div key={item._id || item.createdAt} className="rounded-xl p-6 flex flex-col justify-between" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div className="flex gap-1 mb-3">
                        {Array.from({ length: item.rating || 5 }).map((_, s) => (
                          <Star key={s} className="w-3.5 h-3.5 text-[#fbbf24] fill-current" />
                        ))}
                      </div>
                      <p className="text-[13px] leading-[1.6] text-[#a6a6a6] mb-4">"{item.message}"</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: 'rgba(255,255,255,0.08)', color: 'white' }}>
                        {item.name ? item.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white">{item.name}</p>
                        <p className="text-[#525252] text-[11px]">{item.university || 'Verified Campus'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-[#525252] text-xs">No reviews submitted yet. Be the first to share your experience!</div>
        )}
      </section>

      {/* ===== SUBMIT REVIEW MODAL ===== */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-card max-w-md w-full p-6 space-y-5 relative">
            <button onClick={() => setShowReviewModal(false)} className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-white/5 text-[#525252] hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <div>
              <p className="text-[10px] uppercase font-semibold text-[#a3e635] tracking-[0.15em] mb-1">Feedback</p>
              <h3 className="font-archivo font-bold text-[18px] tracking-[-0.03em]">Share Your CampusRide Experience</h3>
              <p className="text-[12px] text-[#525252] mt-1">Your review will be saved to MongoDB and featured on the home page.</p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#888] uppercase tracking-[0.1em] mb-1.5">Star Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-slate-400 hover:text-[#fbbf24] transition"
                    >
                      <Star className={`w-6 h-6 ${star <= newRating ? 'text-[#fbbf24] fill-current' : 'text-[#333]'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#888] uppercase tracking-[0.1em] mb-1.5">Your Experience Review</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tell fellow students how carpooling saved your commute time or money..."
                  rows={4}
                  className="w-full text-[13px] bg-[#171717] border border-white/10 rounded-lg p-3 text-white placeholder:text-[#444] focus:outline-none focus:border-[#a3e635]"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-2.5 rounded-lg text-[13px] font-medium text-[#888] hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-primary flex-1 !py-2.5 !text-[13px]"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== CTA ===== */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        <div className="sr sr-scale rounded-xl p-10 md:p-16 relative overflow-hidden text-left" style={{ background: '#a3e635' }}>
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.08), transparent)' }} />
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#171717] mb-4">Get Started</p>
          <h2 className="font-archivo font-extrabold text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] tracking-[-0.04em] text-[#171717] max-w-2xl">
            THE NEXT RIDE<br />LEAVES SOON.
          </h2>
          <p className="text-[#171717] font-semibold text-[15px] mt-4 max-w-md leading-[1.6]">Set your route once. CampusRide does the matching from here.</p>
          <button onClick={() => go(user)} className="magnetic shimmer mt-8 h-11 px-7 rounded-lg font-bold text-[14px] transition-all duration-150 hover:scale-[1.02] cursor-pointer" style={{ background: '#171717', color: 'white' }}>
            Get started
          </button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 pb-8">
        <div className="pt-10" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8 mb-10">
            <div className="md:col-span-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <Icon icon={Car} className="w-3.5 h-3.5 text-[#a3e635]" />
                </div>
                <span className="font-archivo font-bold text-[14px]">CampusRide</span>
              </div>
              <p className="text-[#a6a6a6] font-medium text-[13px] leading-[1.6] max-w-[240px]">Verified campus carpooling that saves you money and time.</p>
            </div>
            <div className="md:col-span-2">
              <h4 className="font-bold text-[12px] text-white mb-3">Rides</h4>
              <ul className="space-y-2">
                <li><Link to="/offer-ride" className="text-[#a6a6a6] font-medium text-[13px] hover:text-[#a3e635] transition-colors">Offer a Ride</Link></li>
                <li><Link to="/find-ride" className="text-[#a6a6a6] font-medium text-[13px] hover:text-[#a3e635] transition-colors">Find a Ride</Link></li>
                <li><Link to="/my-rides" className="text-[#a6a6a6] font-medium text-[13px] hover:text-[#a3e635] transition-colors">My Rides</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="font-bold text-[12px] text-white mb-3">Account</h4>
              <ul className="space-y-2">
                <li><Link to="/profile" className="text-[#a6a6a6] font-medium text-[13px] hover:text-[#a3e635] transition-colors">Profile</Link></li>
                <li><Link to="/notifications" className="text-[#a6a6a6] font-medium text-[13px] hover:text-[#a3e635] transition-colors">Notifications</Link></li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <h4 className="font-bold text-[12px] text-white mb-3">Connect</h4>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.instagram.com/camp_usride?igsi=MTBtdDN5a2F1bmUyeg=="
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-7 h-7 rounded-md flex items-center justify-center text-[#a6a6a6] hover:text-[#a3e635] transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <Icon icon={Instagram} className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[#a6a6a6] font-medium text-[12px]">&copy; 2026 CampusRide. All rights reserved.</p>
            <p className="text-[#a6a6a6] font-medium text-[12px]">Pan-India College Carpooling Platform</p>
          </div>
        </div>
      </footer>

      <GenderSelectionModal />
    </div>
  );
}
