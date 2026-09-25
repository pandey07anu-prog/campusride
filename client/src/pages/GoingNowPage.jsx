import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import RideCard from '../components/rides/RideCard';
import api from '../services/api';
import { isRideExpired } from '../utils/dateHelper';
import { Zap, Clock } from 'lucide-react';

const GoingNowPage = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoingNow = async () => {
      try {
        const res = await api.get('/rides/going-now');
        if (res.success && Array.isArray(res.data)) {
          const activeRides = res.data.filter((r) => !isRideExpired(r.date, r.departureTime));
          setRides(activeRides);
        }
      } catch (err) {} finally {
        setLoading(false);
      }
    };
    fetchGoingNow();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold animate-pulse" style={{ background: 'rgba(163,230,53,0.15)', color: '#a3e635' }}>
            <Zap className="w-4 h-4" /> Live Boarding Board
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-archivo tracking-[-0.03em]">Going Now — Departing in &lt;60 Mins</h1>
          <p className="text-[#888] text-xs sm:text-sm">Quickly request seats on carpools departing immediately.</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#888] text-xs">Loading active immediate rides...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rides.map((r) => (
              <RideCard key={r._id} ride={r} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default GoingNowPage;
