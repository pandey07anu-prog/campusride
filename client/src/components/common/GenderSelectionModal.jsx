import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../services/api';
import { UserCheck } from 'lucide-react';

const GenderSelectionModal = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [selectedGender, setSelectedGender] = useState('female');

  // Only show if user is logged in and gender is unspecified
  if (!user || (user.gender && user.gender !== 'unspecified')) {
    return null;
  }

  const handleSaveGender = async () => {
    setLoading(true);
    try {
      const res = await api.put('/users/me', { gender: selectedGender });
      const updatedUser = { ...user, gender: selectedGender };
      if (updateUser) {
        updateUser(updatedUser);
      }
      localStorage.setItem('campusride_user', JSON.stringify(updatedUser));
      showToast(`Gender saved as ${selectedGender === 'female' ? 'Female 👧' : 'Male 👦'}!`, 'success');
    } catch (err) {
      // Still update local session even if offline
      const updatedUser = { ...user, gender: selectedGender };
      if (updateUser) {
        updateUser(updatedUser);
      }
      localStorage.setItem('campusride_user', JSON.stringify(updatedUser));
      showToast(`Gender saved as ${selectedGender === 'female' ? 'Female 👧' : 'Male 👦'}!`, 'success');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="max-w-sm w-full p-6 rounded-2xl space-y-5 text-center" style={{ background: '#1c1917', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}>
        <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-[#a3e635]/10 border border-[#a3e635]/30 text-[#a3e635]">
          <UserCheck className="w-6 h-6" />
        </div>

        <div>
          <h3 className="font-archivo font-extrabold text-[20px] text-white tracking-[-0.03em]">Complete Your Profile</h3>
          <p className="text-[12px] text-[#a6a6a6] mt-1.5 leading-relaxed">
            Please select your gender identity to personalize your campus carpooling experience and enable Girls-Only safety features.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {[
            { id: 'female', label: 'Female 👧' },
            { id: 'male', label: 'Male 👦' },
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedGender(g.id)}
              className={`py-3 px-4 rounded-xl text-[14px] font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedGender === g.id
                  ? g.id === 'female'
                    ? 'bg-pink-500 text-white border-2 border-pink-400 shadow-lg shadow-pink-500/20'
                    : 'bg-[#a3e635] text-[#171717] border-2 border-[#a3e635]'
                  : 'bg-white/5 text-[#a6a6a6] border border-white/10 hover:border-white/20'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSaveGender}
          disabled={loading}
          className="btn-primary w-full !py-3 !text-[13px] !rounded-xl"
        >
          {loading ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
};

export default GenderSelectionModal;
