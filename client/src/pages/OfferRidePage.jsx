import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import useScrollReveal from '../hooks/useScrollReveal';
import api from '../services/api';
import LocationAutocompleteInput from '../components/common/LocationAutocompleteInput';
import CustomDatePicker from '../components/common/CustomDatePicker';
import CustomTimePicker from '../components/common/CustomTimePicker';
import ContributionInput from '../components/common/ContributionInput';
import { ArrowRight, Bookmark, ChevronDown, X, Save } from 'lucide-react';

const STORAGE_KEY = 'campusride_ride_preferences';

const OfferRidePage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const revealRef = useScrollReveal();

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const emptyForm = {
    source: '',
    destination: '',
    date: getTodayDateString(),
    departureTime: '',
    availableSeats: '',
    contribution: '',
    vehicleId: '',
    registrationNumber: '',
    vehicleModel: '',
    notes: '',
    isGirlsOnly: false,
  };

  const [formData, setFormData] = useState(emptyForm);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedPrefs, setSavedPrefs] = useState([]);
  const [showPrefDropdown, setShowPrefDropdown] = useState(false);
  const [prefName, setPrefName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [editingPrefId, setEditingPrefId] = useState(null);

  useEffect(() => {
    if (!user) {
      showToast('Please sign in to offer a ride.', 'warning');
      navigate('/login');
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setSavedPrefs(JSON.parse(saved)); } catch (e) {}
    }

    const fetchVehicles = async () => {
      try {
        const vRes = await api.get('/vehicles');
        if (vRes.success && vRes.data.length > 0) {
          setVehicles(vRes.data);
        }
      } catch (err) {}
    };
    fetchVehicles();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { showToast('Please log in.', 'error'); navigate('/login'); return; }
    if (user.verificationStatus !== 'verified') { showToast('Student verification required before offering rides.', 'error'); navigate('/student-verification'); return; }

    // Validate all fields are filled
    if (!formData.source?.trim()) {
      showToast('Please enter pickup location.', 'error');
      return;
    }
    if (!formData.destination?.trim()) {
      showToast('Please enter drop-off destination.', 'error');
      return;
    }
    if (formData.source.trim().toLowerCase() === formData.destination.trim().toLowerCase()) {
      showToast('Pickup and drop-off locations cannot be the same.', 'error');
      return;
    }
    if (!formData.date?.trim()) {
      showToast('Please select a ride date.', 'error');
      return;
    }
    if (!formData.departureTime?.trim()) {
      showToast('Please select a departure time.', 'error');
      return;
    }
    if (!formData.availableSeats || Number(formData.availableSeats) < 1 || Number(formData.availableSeats) > 6) {
      showToast('Please enter available seats (between 1 and 6).', 'error');
      return;
    }
    if (formData.contribution === '' || formData.contribution === null || formData.contribution === undefined) {
      showToast('Please enter contribution per seat (enter ₹0 for free ride).', 'error');
      return;
    }
    if (!formData.registrationNumber?.trim()) {
      showToast('Please enter your vehicle plate number.', 'error');
      return;
    }
    if (!formData.vehicleModel?.trim()) {
      showToast('Please enter your vehicle model name.', 'error');
      return;
    }

    if (formData.date && formData.departureTime) {
      const [year, month, day] = formData.date.split('-').map(Number);
      let hours = 0, minutes = 0;
      const timeMatch = formData.departureTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
        const ampm = timeMatch[3];
        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
      }
      const rideTime = new Date(year, month - 1, day, hours, minutes);
      const cutoff = new Date(Date.now() - 15 * 60 * 1000);
      if (rideTime < cutoff) {
        showToast('Departure time cannot be in the past.', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await api.post('/rides', formData);
      if (res.success) {
        showToast('Ride posted! +20 CampusPoints earned.', 'success');
        navigate('/my-rides');
      }
    } catch (err) {
      showToast(err.message || 'Failed to offer ride.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const update = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  const handleSavePref = () => {
    if (!prefName.trim()) { showToast('Enter a name for this preference.', 'error'); return; }
    const pref = {
      id: editingPrefId || Date.now().toString(),
      name: prefName.trim(),
      source: formData.source,
      destination: formData.destination,
      departureTime: formData.departureTime,
      availableSeats: formData.availableSeats,
      contribution: formData.contribution,
      vehicleId: formData.vehicleId,
      registrationNumber: formData.registrationNumber,
      vehicleModel: formData.vehicleModel,
      notes: formData.notes,
    };
    let updated;
    if (editingPrefId) {
      updated = savedPrefs.map((p) => p.id === editingPrefId ? pref : p);
      showToast(`"${pref.name}" updated!`, 'success');
    } else {
      updated = [...savedPrefs.filter((p) => p.name !== pref.name), pref];
      showToast(`"${pref.name}" saved!`, 'success');
    }
    setSavedPrefs(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setShowSaveModal(false);
    setPrefName('');
    setEditingPrefId(null);
  };

  const handleEditPref = (pref) => {
    setEditingPrefId(pref.id);
    setPrefName(pref.name);
    setShowSaveModal(true);
    setShowPrefDropdown(false);
  };

  const handleLoadPref = (pref) => {
    setFormData((prev) => ({
      ...prev,
      source: pref.source || '',
      destination: pref.destination || '',
      departureTime: pref.departureTime || '',
      availableSeats: pref.availableSeats || '',
      contribution: pref.contribution || '',
      vehicleId: pref.vehicleId || '',
      registrationNumber: pref.registrationNumber || '',
      vehicleModel: pref.vehicleModel || '',
      notes: pref.notes || '',
    }));
    setShowPrefDropdown(false);
    showToast(`Loaded "${pref.name}"`, 'success');
  };

  const handleDeletePref = (id) => {
    const updated = savedPrefs.filter((p) => p.id !== id);
    setSavedPrefs(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    showToast('Preference deleted.', 'info');
  };

  return (
    <MainLayout>
      <div ref={revealRef} className="max-w-2xl mx-auto pb-16">

        {/* Header */}
        <section className="mb-8">
          <p className="uppercase tracking-[0.2em] text-[10px] font-semibold text-[#a3e635] mb-3">Offer a Ride</p>
          <h1 className="font-archivo font-black text-[36px] sm:text-[44px] tracking-[-0.05em] leading-[0.95]">
            Share your<br />commute
          </h1>
          <p className="text-[13px] text-[#525252] mt-3 max-w-sm">
            Fill empty seats, split fuel costs, and earn CampusPoints.
          </p>
        </section>

        {/* Saved Preferences Bar */}
        {savedPrefs.length > 0 && (
          <div className="mb-6 relative">
            <button
              type="button"
              onClick={() => setShowPrefDropdown(!showPrefDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all w-full"
              style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.12)', color: '#a3e635' }}
            >
              <Bookmark className="w-4 h-4" />
              Load saved preference
              <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${showPrefDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showPrefDropdown && (
              <div className="absolute z-50 left-0 right-0 mt-1 overflow-hidden" style={{ background: '#252525', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                {savedPrefs.map((pref) => (
                  <div key={pref.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <button type="button" onClick={() => handleLoadPref(pref)} className="flex-1 text-left">
                      <span className="font-semibold text-[12px] block">{pref.name}</span>
                      <span className="text-[10px] text-[#525252]">{pref.source || '—'} → {pref.destination || '—'}</span>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleEditPref(pref); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#525252] hover:text-[#a3e635] hover:bg-white/5 transition"
                        title="Update"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeletePref(pref.id); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#525252] hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Delete"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Route Card */}
          <div className="sr sr-up relative z-30" style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
            <div className="p-5 pb-4">
              <p className="text-[10px] font-semibold text-[#666] uppercase tracking-[0.1em] mb-3">Route</p>
              <div className="space-y-0">
                <div className="flex items-start gap-4 relative z-20">
                  <div className="flex flex-col items-center pt-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#a3e635]" />
                    <div className="w-px h-8 bg-white/10" />
                  </div>
                  <div className="flex-1 pb-3">
                    <LocationAutocompleteInput
                      label="Pickup"
                      value={formData.source}
                      onChange={(val) => update('source', val)}
                      placeholder="Where will passengers board?"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-start gap-4 relative z-10">
                  <div className="flex flex-col items-center pt-3">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-[#a3e635]" />
                  </div>
                  <div className="flex-1">
                    <LocationAutocompleteInput
                      label="Drop-off"
                      value={formData.destination}
                      onChange={(val) => update('destination', val)}
                      placeholder="Where are you heading?"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule + Seats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }} className="p-4 space-y-3">
              <p className="text-[10px] font-semibold text-[#666] uppercase tracking-[0.1em]">Schedule</p>
              <div className="space-y-2">
                <CustomDatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(val) => update('date', val)}
                  required
                />
                <CustomTimePicker
                  label="Departure"
                  value={formData.departureTime}
                  onChange={(val) => update('departureTime', val)}
                />
              </div>
            </div>

            <div style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }} className="p-4 space-y-3">
              <p className="text-[10px] font-semibold text-[#666] uppercase tracking-[0.1em]">Seats & Fare</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-[#888] uppercase tracking-[0.08em] mb-1">Available Seats</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.availableSeats}
                    onChange={(e) => update('availableSeats', e.target.value)}
                    placeholder="3"
                    className="!text-[12px] !py-2 text-center"
                    required
                  />
                </div>
                <ContributionInput
                  label="Contribution / Seat"
                  value={formData.contribution}
                  onChange={(val) => update('contribution', val)}
                />
              </div>
            </div>
          </div>

          {/* Vehicle */}
          <div className="sr sr-up p-4 space-y-3" style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
            <p className="text-[10px] font-semibold text-[#666] uppercase tracking-[0.1em]">Vehicle Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-[#888] uppercase tracking-[0.08em] mb-1">Plate Number</label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => update('registrationNumber', e.target.value.toUpperCase())}
                  placeholder="PB-01-AB-1234"
                  className="!text-[12px] !py-2.5 uppercase font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#888] uppercase tracking-[0.08em] mb-1">Car Model</label>
                <input
                  type="text"
                  value={formData.vehicleModel}
                  onChange={(e) => update('vehicleModel', e.target.value)}
                  placeholder="e.g. Maruti Swift"
                  className="!text-[12px] !py-2.5"
                  required
                />
              </div>
            </div>
          </div>

          {/* Women's Safety Preference — Exclusively for female drivers */}
          {user?.gender !== 'male' && (
            <div className="sr sr-up p-4 flex items-center justify-between gap-4" style={{ background: formData.isGirlsOnly ? 'rgba(236,72,153,0.08)' : '#1e1e1e', border: formData.isGirlsOnly ? '1px solid rgba(236,72,153,0.3)' : '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', transition: 'all 0.2s' }}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-archivo font-bold text-[14px] text-white">Girls-Only Ride</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">🌸 Women's Safety</span>
                </div>
                <p className="text-[11px] text-[#a6a6a6] font-medium">Only verified female students can search and request to join this ride pool.</p>
              </div>
              <button
                type="button"
                onClick={() => update('isGirlsOnly', !formData.isGirlsOnly)}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 cursor-pointer ${formData.isGirlsOnly ? 'bg-pink-500' : 'bg-white/10'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${formData.isGirlsOnly ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          )}

          {/* Action row: Save prefs + Submit */}
          <div className="sr sr-up flex gap-3">
            <button
              type="button"
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-[12px] font-semibold shrink-0 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#888' }}
            >
              <Save className="w-4 h-4" /> Save Pref
            </button>
            <button type="submit" disabled={loading} className="btn-primary shimmer flex-1 !py-3 !text-[14px] !rounded-xl">
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#171717]/30 border-t-[#171717] rounded-full animate-spin" />
              ) : (
                <>Publish Ride <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

          <p className="text-center text-[11px] text-[#525252]">
            Posting a ride earns you <span className="text-[#a3e635] font-semibold">+20 CampusPoints</span>
          </p>
        </form>

        {/* Save Preference Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
            <div style={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', boxShadow: '0 0 80px rgba(0,0,0,0.5)' }} className="max-w-sm w-full p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-archivo font-bold text-[18px] tracking-[-0.03em]">{editingPrefId ? 'Update Preference' : 'Save Preference'}</h3>
                <button onClick={() => { setShowSaveModal(false); setEditingPrefId(null); setPrefName(''); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors">
                  <X className="w-4 h-4 text-[#666]" />
                </button>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#888] uppercase tracking-[0.08em] mb-1.5">Preference Name</label>
                <input
                  type="text"
                  value={prefName}
                  onChange={(e) => setPrefName(e.target.value)}
                  placeholder="e.g. Morning Campus Commute"
                  className="!text-[13px]"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSavePref()}
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowSaveModal(false); setEditingPrefId(null); setPrefName(''); }} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-[#666] hover:text-white transition" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  Cancel
                </button>
                <button type="button" onClick={handleSavePref} className="flex-1 btn-primary justify-center !rounded-xl !py-2.5">
                  <Save className="w-4 h-4" /> {editingPrefId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OfferRidePage;
