import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import { Bell, CheckCheck, Check, X, Settings } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const NotificationsPage = () => {
  const { notifications, markAllRead, refetchNotifications } = useNotifications();
  const revealRef = useScrollReveal();
  const [processing, setProcessing] = useState({});

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleAccept = async (notif) => {
    const reqId = notif.relatedEntity?.entityId;
    if (!reqId) return;
    setProcessing((p) => ({ ...p, [notif._id]: 'accepting' }));
    try {
      await api.put(`/requests/${reqId}/accept`);
      setProcessing((p) => ({ ...p, [notif._id]: 'accepted' }));
      refetchNotifications();
    } catch (err) {
      setProcessing((p) => ({ ...p, [notif._id]: null }));
    }
  };

  const handleReject = async (notif) => {
    const reqId = notif.relatedEntity?.entityId;
    if (!reqId) return;
    setProcessing((p) => ({ ...p, [notif._id]: 'rejecting' }));
    try {
      await api.put(`/requests/${reqId}/reject`);
      setProcessing((p) => ({ ...p, [notif._id]: 'rejected' }));
      refetchNotifications();
    } catch (err) {
      setProcessing((p) => ({ ...p, [notif._id]: null }));
    }
  };

  return (
    <MainLayout>
      <div ref={revealRef} className="max-w-3xl mx-auto pb-16">

        {/* Header */}
        <section className="sr sr-up mb-10 flex items-end justify-between">
          <div>
            <p className="uppercase tracking-[0.2em] text-[10px] font-semibold text-[#a3e635] mb-3">Notifications</p>
            <h1 className="font-archivo font-black text-[36px] sm:text-[44px] tracking-[-0.05em] leading-[0.95]">
              Updates &<br />alerts
            </h1>
            {unreadCount > 0 && (
              <p className="text-[13px] text-[#525252] mt-3">{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg font-medium text-[#666] hover:text-white transition shrink-0" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
            </button>
          )}
        </section>

        {notifications.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(163,230,53,0.06)', border: '1px solid rgba(163,230,53,0.1)' }}>
              <Bell className="w-7 h-7 text-[#a3e635]" />
            </div>
            <h3 className="font-archivo font-bold text-[20px] tracking-[-0.03em]">All caught up</h3>
            <p className="text-[13px] text-[#525252] mt-2">No notifications to show right now.</p>
          </div>
        ) : (
          <section className="space-y-2">
            {notifications.map((n) => {
              const isRideRequest = n.type === 'RIDE_REQUEST';
              const reqState = processing[n._id];

              return (
                <div
                  key={n._id}
                  style={{
                    background: '#1e1e1e',
                    border: `1px solid ${!n.isRead ? 'rgba(163,230,53,0.15)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '10px',
                  }}
                  className="p-4 flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: !n.isRead ? 'rgba(163,230,53,0.08)' : 'rgba(255,255,255,0.04)' }}>
                    {isRideRequest ? (
                      <Settings className="w-4 h-4" style={{ color: !n.isRead ? '#a3e635' : '#525252' }} />
                    ) : (
                      <Bell className="w-4 h-4" style={{ color: !n.isRead ? '#a3e635' : '#525252' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-archivo font-bold text-[13px] tracking-[-0.02em]">{n.title}</h4>
                    <p className="text-[12px] text-[#525252] mt-0.5">{n.message}</p>

                    {/* Accept/Reject buttons for ride requests */}
                    {isRideRequest && (
                      <div className="mt-3">
                        {reqState === 'accepted' ? (
                          <span className="badge-verified">ACCEPTED</span>
                        ) : reqState === 'rejected' ? (
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.12)' }}>Rejected</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAccept(n)}
                              disabled={!!reqState}
                              className="btn-primary shimmer !text-[11px] !px-3 !py-1.5"
                            >
                              <Check className="w-3 h-3" /> Accept
                            </button>
                            <button
                              onClick={() => handleReject(n)}
                              disabled={!!reqState}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#666] hover:text-white transition disabled:opacity-50"
                              style={{ background: 'rgba(255,255,255,0.04)' }}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {!n.isRead && (
                    <div data-pulse className="w-2 h-2 rounded-full bg-[#a3e635] shrink-0 mt-2" />
                  )}
                </div>
              );
            })}
          </section>
        )}
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;
