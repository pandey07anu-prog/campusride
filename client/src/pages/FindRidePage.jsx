import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import RideCard from '../components/rides/RideCard';
import { useNotifications } from '../context/NotificationContext';
import useScrollReveal from '../hooks/useScrollReveal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LocationAutocompleteInput from '../components/common/LocationAutocompleteInput';
import CustomDatePicker from '../components/common/CustomDatePicker';
import CustomTimePicker from '../components/common/CustomTimePicker';
import { Search, Navigation, ArrowRight, PlusCircle, MapPin } from 'lucide-react';

import { isRideExpired, getTodayDateString } from '../utils/dateHelper';

const FindRidePage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [searchParams] = useSearchParams();
  const revealRef = useScrollReveal();

  const [source, setSource] = useState(searchParams.get('source') || '');
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [date, setDate] = useState(searchParams.get('date') || getTodayDateString());
  const [time, setTime] = useState(searchParams.get('time') || '');
  const [seats, setSeats] = useState(searchParams.get('seats') || 1);
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [isGirlsOnlyFilter, setIsGirlsOnlyFilter] = useState(searchParams.get('isGirlsOnly') === 'true');

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchRides = async (overrideGirlsOnly) => {
    setLoading(true);
    setHasSearched(true);
    const activeGirlsOnly = overrideGirlsOnly !== undefined ? overrideGirlsOnly : isGirlsOnlyFilter;
    try {
      const params = new URLSearchParams({
        source,
        destination,
        date,
        time,
        seats,
        maxPrice: maxPrice || '',
        isGirlsOnly: activeGirlsOnly ? 'true' : 'false',
      });
      const res = await api.get(`/rides/search?${params.toString()}`);
      if (res.success && Array.isArray(res.data)) {
        const validRides = res.data.filter((r) => !isRideExpired(r.date, r.departureTime));
        setRides(validRides);
      } else {
        setRides([]);
      }
    } catch (err) {
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRides();
  };

  const handleRequestRide = async (ride) => {
    if (!user) {
      showToast('Please log in to request ride seats.', 'error');
      return;
    }
    try {
      const res = await api.post(`/requests/ride/${ride._id}`, {
        requestedSeats: Number(seats),
        pickupPoint: ride.source,
      });
      if (res.success) {
        showToast('Ride request sent!', 'success');
        fetchRides();
      }
    } catch (err) {
      showToast(err.message || 'Request failed.', 'error');
    }
  };

  return (
    <MainLayout>
      <div ref={revealRef} className="max-w-5xl mx-auto pb-16">

        {/* Hero Search Area */}
        <section className="sr sr-up mb-10">
          <div className="mb-8">
            <p className="uppercase tracking-[0.2em] text-[10px] font-semibold text-[#a3e635] mb-3">Find a Ride</p>
            <h1 className="font-archivo font-black text-[36px] sm:text-[44px] tracking-[-0.05em] leading-[0.95]">
              Where are you<br />heading?
            </h1>
          </div>

          {/* Search Card */}
          <form onSubmit={handleSearchSubmit}>
            <div className="relative" style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>

              {/* Route inputs — stacked vertically, prominent */}
              <div className="p-6 pb-0">
                <div className="space-y-0">
                  {/* Source */}
                  <div className="flex items-start gap-4 relative z-20">
                    <div className="flex flex-col items-center pt-4">
                      <div className="w-3 h-3 rounded-full bg-[#a3e635]" />
                      <div className="w-px h-10 bg-white/10" />
                    </div>
                    <div className="flex-1 pb-4">
                      <LocationAutocompleteInput
                        label="Pickup"
                        value={source}
                        onChange={setSource}
                        placeholder="Search pickup location"
                      />
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="flex flex-col items-center pt-4">
                      <div className="w-3 h-3 rounded-full border-2 border-[#a3e635]" />
                    </div>
                    <div className="flex-1">
                      <LocationAutocompleteInput
                        label="Drop-off"
                        value={destination}
                        onChange={setDestination}
                        placeholder="Where to?"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom bar — date, time, seats, price */}
              <div className="px-6 py-5 flex flex-wrap items-end gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex-1 min-w-[130px]">
                  <CustomDatePicker
                    label="Date"
                    value={date}
                    onChange={(val) => setDate(val)}
                  />
                </div>
                <div className="flex-1 min-w-[130px]">
                  <CustomTimePicker
                    label="Time"
                    value={time}
                    onChange={(val) => setTime(val)}
                  />
                </div>
                <div className="w-[90px]">
                  <label className="block text-[10px] font-semibold text-[#666] uppercase tracking-[0.1em] mb-1.5">Seats</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    className="!text-[13px] !py-2.5 text-center"
                  />
                </div>
                <div className="w-[110px]">
                  <label className="block text-[10px] font-semibold text-[#666] uppercase tracking-[0.1em] mb-1.5">Max ₹</label>
                  <input
                    type="number"
                    min="0"
                    max="5000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Any"
                    className="!text-[13px] !py-2.5 text-center"
                  />
                </div>
                <button type="submit" className="btn-primary !py-3 !px-8 !text-[14px] shrink-0">
                  <Search className="w-4 h-4" /> Search
                </button>
              </div>

              {/* Option: Travel with Girls Only — Exclusive to female students */}
              {user?.gender !== 'male' && (
                <div className="px-6 py-3.5 flex items-center justify-between gap-4 bg-pink-500/[0.07] border-t border-pink-500/20 rounded-b-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-pink-500/20 text-pink-400 shrink-0">
                      🌸
                    </div>
                    <div>
                      <span className="text-[13px] font-bold text-white block">Travel Only with Girls</span>
                      <span className="text-[11px] text-[#d4d4d4] font-medium">Show rides offered exclusively by verified female student drivers</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isGirlsOnlyFilter;
                      setIsGirlsOnlyFilter(next);
                      fetchRides(next);
                    }}
                    className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${isGirlsOnlyFilter ? 'bg-pink-500' : 'bg-white/15'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${isGirlsOnlyFilter ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              )}
            </div>
          </form>
        </section>

        {/* Results */}
        <section>
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-[#a3e635] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[12px] text-[#525252] mt-4">Searching routes...</p>
            </div>
          ) : rides.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <p className="text-[12px] text-[#a6a6a6] font-medium">
                  <strong className="text-white">{rides.length}</strong> ride{rides.length !== 1 ? 's' : ''} available
                </p>
                {user?.gender !== 'male' && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isGirlsOnlyFilter;
                      setIsGirlsOnlyFilter(next);
                      fetchRides(next);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isGirlsOnlyFilter
                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                        : 'bg-white/5 text-[#a6a6a6] hover:text-white border border-white/10 hover:bg-pink-500/10 hover:border-pink-500/30'
                    }`}
                  >
                    <span>🌸</span>
                    <span>Girls-Only Rides</span>
                    {isGirlsOnlyFilter && <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">ACTIVE</span>}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rides.map((ride) => (
                  <RideCard key={ride._id} ride={ride} onRequest={handleRequestRide} />
                ))}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="py-16 text-center space-y-6">
              {/* Visual element */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-2xl" style={{ background: 'rgba(163,230,53,0.04)', border: '1px solid rgba(163,230,53,0.08)' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Navigation className="w-8 h-8 text-[#a3e635]" style={{ opacity: 0.4 }} />
                </div>
                {/* Decorative dots */}
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#a3e635]" style={{ opacity: 0.2 }} />
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-[#a3e635]" style={{ opacity: 0.15 }} />
              </div>

              <div className="space-y-2">
                <h3 className="font-archivo font-bold text-[17px] tracking-[-0.03em]">No rides on this route yet</h3>
                <p className="text-[13px] text-[#525252] max-w-sm mx-auto leading-relaxed">
                  {hasSearched
                    ? 'Try different dates or nearby locations. You can also be the first to offer a ride on this route.'
                    : 'Search for a route above to find available student carpools.'}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                {hasSearched && (
                  <button
                    onClick={fetchRides}
                    className="px-5 py-2.5 rounded-lg text-[12px] font-medium text-[#a6a6a6] hover:text-white transition"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    Refresh results
                  </button>
                )}
                <Link
                  to="/offer-ride"
                  className="btn-primary"
                >
                  <PlusCircle className="w-4 h-4" /> Offer a ride
                </Link>
              </div>

              {/* Popular routes hint */}
              {!hasSearched && (
                <div className="pt-6 max-w-md mx-auto">
                  <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#333] mb-3">Popular routes</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Noida → Delhi University', 'Electronic City → IISc Bengaluru', 'Mohali → Chandigarh Campus', 'Kothrud → COEP Pune', 'Powai → IIT Bombay'].map((r) => {
                      const [s, d] = r.split(' → ');
                      return (
                        <button
                          key={r}
                          onClick={() => { setSource(s); setDestination(d); }}
                          className="px-3 py-1.5 rounded-md text-[11px] font-medium text-[#666] hover:text-white transition flex items-center gap-1.5"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
                        >
                          <MapPin className="w-3 h-3 text-[#a3e635]" />
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default FindRidePage;
