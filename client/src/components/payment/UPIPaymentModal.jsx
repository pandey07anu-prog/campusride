import React, { useState, useEffect } from 'react';
import { X, QrCode, Copy, CheckCircle2, Smartphone, ExternalLink, ShieldCheck, Zap, CreditCard, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', badge: 'GPay', color: '#4285f4', bg: 'rgba(66, 133, 244, 0.12)' },
  { id: 'phonepe', name: 'PhonePe', badge: 'PhonePe', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)' },
  { id: 'paytm', name: 'Paytm', badge: 'Paytm', color: '#00baf2', bg: 'rgba(0, 186, 242, 0.12)' },
  { id: 'bhim', name: 'BHIM / Cred', badge: 'BHIM', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)' },
];

const PRESET_AMOUNTS = [100, 200, 500, 1000];

const UPIPaymentModal = ({ isOpen, onClose, amount: initialAmount, rideRequestId, note, onPaymentSuccess }) => {
  const { showToast } = useNotifications();
  const [topUpAmount, setTopUpAmount] = useState(initialAmount || 200);
  const [userUpiId, setUserUpiId] = useState('');
  const [selectedApp, setSelectedApp] = useState('gpay');
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' or 'qr'
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (initialAmount) setTopUpAmount(initialAmount);
    setPaid(false);
  }, [initialAmount, isOpen]);

  if (!isOpen) return null;

  const receiverVpa = 'campusride@upi';
  const currentAmount = Number(topUpAmount) || 100;
  const payNote = note || `Campus Wallet Top-Up - ₹${currentAmount}`;
  
  // Standardized UPI Intent URI
  const upiIntentUri = `upi://pay?pa=${receiverVpa}&pn=CampusRide%20Carpool&am=${currentAmount}&cu=INR&tn=${encodeURIComponent(payNote)}`;

  const copyVpa = () => {
    navigator.clipboard.writeText(receiverVpa);
    setCopied(true);
    showToast(`Official UPI VPA (${receiverVpa}) copied to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleProcessUPIPayment = async () => {
    if (!currentAmount || currentAmount <= 0) {
      showToast('Please enter a valid top-up amount', 'warning');
      return;
    }

    setVerifying(true);
    try {
      if (rideRequestId) {
        // Ride fare payment verification
        const res = await api.post('/payments/verify', {
          rideRequestId,
          orderId: `order_upi_${Date.now()}`,
          paymentId: `pay_upi_${Date.now()}`,
          gateway: userUpiId ? `upi_${selectedApp}` : 'upi_qr',
        });
        if (res.success) {
          setPaid(true);
          showToast('UPI Payment verified successfully! Seat confirmed.', 'success');
          if (onPaymentSuccess) onPaymentSuccess(res.data);
        }
      } else {
        // Direct Wallet Top-Up via UPI ID
        const res = await api.post('/payments/topup-upi', {
          amount: currentAmount,
          upiId: userUpiId.trim() || undefined,
          upiApp: selectedApp,
        });
        if (res.success) {
          setPaid(true);
          showToast(`🎉 ₹${currentAmount} successfully credited to your Campus Wallet!`, 'success');
          if (onPaymentSuccess) onPaymentSuccess(res.data);
        }
      }
    } catch (err) {
      showToast(err.message || 'UPI Payment processing failed.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#171717] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5 text-white max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-[#a6a6a6] hover:text-white hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#171717] font-bold shrink-0" style={{ background: '#a3e635' }}>
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-white flex items-center gap-1.5 font-archivo">
              Add Money via UPI
            </h3>
            <p className="text-[12px] text-[#a6a6a6]">Instant top-up with GPay, PhonePe, Paytm & UPI ID</p>
          </div>
        </div>

        {!paid ? (
          <div className="space-y-4">
            
            {/* Top-Up Amount Selection */}
            {!rideRequestId && (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                <label className="text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-wider block">
                  Select Top-Up Amount (₹)
                </label>
                
                {/* Preset Chips */}
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmount(amt)}
                      className={`py-2 rounded-lg text-[13px] font-bold transition cursor-pointer ${
                        currentAmount === amt
                          ? 'bg-[#a3e635] text-[#171717] shadow-sm'
                          : 'bg-white/5 text-[#a6a6a6] hover:text-white hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>

                {/* Custom Amount Input Box */}
                <div className="relative flex items-center mt-2 bg-white/5 border border-white/10 rounded-lg overflow-hidden focus-within:border-[#a3e635]">
                  <div className="pl-3.5 pr-1 text-[16px] font-bold text-[#a3e635] select-none">₹</div>
                  <input
                    type="number"
                    min="10"
                    max="50000"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="Enter custom amount"
                    className="w-full pr-4 py-2.5 bg-transparent text-white font-bold text-[16px] focus:outline-none placeholder-[#666]"
                  />
                </div>
              </div>
            )}

            {/* Total Credit Summary Card */}
            <div className="p-3.5 rounded-xl bg-[#a3e635]/10 border border-[#a3e635]/25 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#a6a6a6] uppercase tracking-wider block">Total Credit</span>
                <span className="text-[12px] text-white/90 font-medium">{payNote}</span>
              </div>
              <div className="text-[26px] font-extrabold text-[#a3e635] font-archivo">₹{currentAmount}</div>
            </div>

            {/* Tab Mode Selection: UPI App/ID vs Scan QR */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setActiveTab('upi')}
                className={`flex-1 py-1.5 rounded-lg text-[12px] font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'upi'
                    ? 'bg-[#a3e635] text-[#171717]'
                    : 'text-[#a6a6a6] hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> UPI App / VPA
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('qr')}
                className={`flex-1 py-1.5 rounded-lg text-[12px] font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'qr'
                    ? 'bg-[#a3e635] text-[#171717]'
                    : 'text-[#a6a6a6] hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" /> Scan QR Code
              </button>
            </div>

            {activeTab === 'upi' ? (
              <div className="space-y-3.5">
                {/* UPI ID Input Field */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-wider block">
                    Your UPI ID / VPA <span className="text-[#666] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={userUpiId}
                    onChange={(e) => setUserUpiId(e.target.value)}
                    placeholder="e.g. 9876543210@ybl, student@okaxis, name@paytm"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-[13px] font-mono focus:outline-none focus:border-[#a3e635] placeholder-[#666]"
                  />
                  <p className="text-[10px] text-[#737373]">Optional: Type your VPA handle for payment reference.</p>
                </div>

                {/* Preferred UPI App Buttons */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#a6a6a6] uppercase tracking-wider block">
                    Choose Payment App
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {UPI_APPS.map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setSelectedApp(app.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                          selectedApp === app.id
                            ? 'border-[#a3e635] bg-[#a3e635]/15 text-white'
                            : 'border-white/5 bg-white/5 text-[#a6a6a6] hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold" style={{ background: app.bg, color: app.color }}>
                          {app.badge}
                        </span>
                        <span className="text-[12px] font-semibold">{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Deep Link Button */}
                <a
                  href={upiIntentUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-[12px] flex items-center justify-center gap-2 border border-white/10 transition"
                >
                  <Smartphone className="w-4 h-4 text-[#a3e635]" />
                  Open in Installed UPI App
                  <ExternalLink className="w-3.5 h-3.5 text-[#666]" />
                </a>
              </div>
            ) : (
              /* QR Code Mode */
              <div className="p-4 rounded-xl bg-white text-[#171717] flex flex-col items-center justify-center space-y-3 shadow-inner">
                <div className="w-44 h-44 bg-[#171717] rounded-xl p-3 flex flex-col items-center justify-center border-4 border-[#a3e635]/50">
                  <div className="w-full h-full bg-[#1e1e1e] rounded-lg p-2 flex flex-col justify-between items-center text-[#a3e635] font-mono text-[9px] text-center border border-white/10">
                    <div className="flex justify-between w-full">
                      <div className="w-7 h-7 bg-[#a3e635] rounded-sm" />
                      <div className="w-7 h-7 bg-[#a3e635] rounded-sm" />
                    </div>
                    <div className="py-1 text-white font-sans text-[11px] font-bold tracking-wider bg-[#171717] px-2 rounded border border-[#a3e635]/40">
                      SCAN TO PAY ₹{currentAmount}
                    </div>
                    <div className="flex justify-between w-full">
                      <div className="w-7 h-7 bg-[#a3e635] rounded-sm" />
                      <span className="text-[8px] text-[#a3e635] font-bold self-end">{receiverVpa}</span>
                    </div>
                  </div>
                </div>
                <div className="text-center text-xs space-y-0.5">
                  <p className="font-bold text-[#171717]">Scan using GPay, PhonePe, Paytm, or BHIM</p>
                  <p className="text-[11px] text-[#666] font-mono">{receiverVpa}</p>
                </div>
              </div>
            )}

            {/* VPA Clipboard Banner */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-[10px] text-[#666] block font-semibold">CampusRide VPA Handle:</span>
                <span className="font-mono font-bold text-[#a3e635] text-[12px]">{receiverVpa}</span>
              </div>
              <button
                type="button"
                onClick={copyVpa}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#d4d4d4] flex items-center gap-1.5 text-[11px] font-semibold border border-white/10 transition cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#a3e635]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy VPA'}
              </button>
            </div>

            {/* Main Action Button */}
            <button
              type="button"
              onClick={handleProcessUPIPayment}
              disabled={verifying}
              className="btn-primary w-full justify-center !rounded-xl !py-3 font-extrabold text-[14px] cursor-pointer"
            >
              {verifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#171717] border-t-transparent rounded-full animate-spin" />
                  Crediting ₹{currentAmount} to Wallet...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4.5 h-4.5" /> Add ₹{currentAmount} to Wallet
                </>
              )}
            </button>

          </div>
        ) : (
          /* Payment Success Confirmation State */
          <div className="space-y-5 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h4 className="text-[20px] font-black text-white font-archivo">UPI Top-Up Complete!</h4>
              <p className="text-[13px] text-[#a6a6a6] mt-1 max-w-sm mx-auto">
                <span className="text-[#a3e635] font-extrabold">₹{currentAmount}</span> has been credited directly to your Campus Wallet.
              </p>
              {userUpiId && (
                <p className="text-[11px] text-[#666] mt-2 font-mono">
                  Paid via: {userUpiId}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-primary w-full justify-center !rounded-xl !py-3 text-[13px] font-bold cursor-pointer"
            >
              Done & View Wallet
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default UPIPaymentModal;
