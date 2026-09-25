import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

// Web Audio API Synthesized Audio Chime Player
const playNotificationChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (err) {}
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  // Request Desktop Web Push Notification Permission on Mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data.slice(0, 5));
      } else {
        setNotifications([]);
      }
    } catch (err) {
      setNotifications([]);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const showToast = (message, type = 'info') => {
    playNotificationChime();

    // Native Desktop Push Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('CampusRide Alert 🚗', {
          body: message,
          icon: '/favicon.ico',
        });
      } catch (e) {}
    }

    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const addNotification = (newNotif) => {
    setNotifications((prev) => [newNotif, ...prev].slice(0, 5));
    showToast(newNotif.title || newNotif.message, 'success');
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {}
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toast,
        showToast,
        addNotification,
        markAllRead,
        refetchNotifications: fetchNotifs,
        unreadCount: (Array.isArray(notifications) ? notifications : []).filter((n) => n && !n.isRead).length,
      }}
    >
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50" style={{ animation: 'toast-in 0.3s ease-out' }}>
          <div
            className="px-5 py-3.5 rounded-xl shadow-2xl text-[13px] font-semibold flex items-center gap-3 max-w-sm"
            style={{
              background: '#1e1e1e',
              border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.3)' : toast.type === 'success' ? 'rgba(163,230,53,0.3)' : 'rgba(255,255,255,0.08)'}`,
              color: toast.type === 'error' ? '#fca5a5' : toast.type === 'success' ? '#a3e635' : '#a3a3a3',
            }}
          >
            <span className="text-sm shrink-0">
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'i'}
            </span>
            <span className="leading-snug">{toast.message}</span>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
