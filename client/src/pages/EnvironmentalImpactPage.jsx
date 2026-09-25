import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { Leaf, Car, Award, BarChart3, Info } from 'lucide-react';

const EnvironmentalImpactPage = () => {
  const [stats, setStats] = useState({
    totalSharedRides: 0,
    totalKilometersShared: 0,
    estimatedFuelSavedLiters: 0,
    estimatedMoneySavedINR: 0,
    estimatedCO2ReducedKg: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/features/environmental-impact');
        if (res.success) setStats(res.data);
      } catch (err) {}
    };
    fetchStats();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(163,230,53,0.15)', color: '#a3e635' }}>
            <Leaf className="w-4 h-4" /> Eco Metrics
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-archivo tracking-[-0.03em]">Campus Environmental Impact</h1>
          <p className="text-[#888] text-xs sm:text-sm">
            Tracking reduced carbon footprints, fuel conservation, and student commute savings.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-xl p-7 space-y-2" style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Leaf className="w-6 h-6" style={{ color: '#a3e635' }} />
            <span className="text-[#888] text-[11px] font-semibold uppercase tracking-[0.08em] block">CO₂ Emissions Reduced</span>
            <span className="text-2xl font-black block" style={{ color: '#a3e635' }}>{stats.estimatedCO2ReducedKg} kg</span>
          </div>

          <div className="rounded-xl p-7 space-y-2" style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Car className="w-6 h-6" style={{ color: '#a3e635' }} />
            <span className="text-[#888] text-[11px] font-semibold uppercase tracking-[0.08em] block">Shared Kilometers</span>
            <span className="text-2xl font-black text-white block">{stats.totalKilometersShared.toLocaleString()} km</span>
          </div>

          <div className="rounded-xl p-7 space-y-2" style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)' }}>
            <BarChart3 className="w-6 h-6" style={{ color: '#a3e635' }} />
            <span className="text-[#888] text-[11px] font-semibold uppercase tracking-[0.08em] block">Fuel Conserved</span>
            <span className="text-2xl font-black block" style={{ color: '#a3e635' }}>{stats.estimatedFuelSavedLiters.toLocaleString()} Liters</span>
          </div>
        </div>

        {/* Formula Explanations */}
        <div className="rounded-xl p-7 space-y-3 text-xs" style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-archivo tracking-[-0.03em]">
            <Info className="w-4 h-4" style={{ color: '#a3e635' }} /> Dynamic Impact Assumptions & Formulas
          </h3>
          <p className="leading-relaxed text-[#888]">
            • <b>CO₂ Reduction:</b> Calculated at 2.3 kg CO₂ saved per liter of petrol saved by avoiding solo vehicle trips.<br />
            • <b>Fuel Calculation:</b> Based on an average student vehicle efficiency of 12 km/L across campus carpools.
          </p>
        </div>

      </div>
    </MainLayout>
  );
};

export default EnvironmentalImpactPage;
