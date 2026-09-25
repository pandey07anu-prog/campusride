import React, { useState } from 'react';
import { CreditCard, Wallet, ShieldCheck, Sparkles, AlertCircle, CheckCircle2, X } from 'lucide-react';
import axios from 'axios';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocal
  ? 'http://localhost:5000/api'
  : (import.meta.env.VITE_API_BASE_URL || 'https://campusride-backend-03ea.onrender.com/api');

const PaymentModal = ({ isOpen, onClose, rideRequest, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wallet'); // 'wallet' or 'online'

  if (!isOpen || !rideRequest) return null;

  const ride = rideRequest.rideId || {};
  const requestedSeats = rideRequest.requestedSeats || 1;
  const platformFee = 0;
  const totalAmount = baseFare + platformFee;

  const handleWalletPayment = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('campusride_token');
      const res = await axios.post(
        `${API_BASE_URL}/payments/pay-wallet`,
        { rideRequestId: rideRequest._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setSuccessMsg('Payment completed successfully! 🎉');
        setTimeout(() => {
          onPaymentSuccess(res.data.data);
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please check your wallet balance.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('campusride_token');
      // Step 1: Create Order
      const orderRes = await axios.post(
        `${API_BASE_URL}/payments/create-order`,
        { rideRequestId: rideRequest._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orderData = orderRes.data.data;

      // Step 2: Simulated Interactive Sandbox or Razorpay SDK
      if (orderData.gateway === 'sandbox') {
        // Instant Sandbox Payment Simulation
        const verifyRes = await axios.post(
          `${API_BASE_URL}/payments/verify`,
          {
            rideRequestId: rideRequest._id,
            orderId: orderData.orderId,
            paymentId: `pay_sandbox_${Date.now()}`,
            gateway: 'sandbox',
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (verifyRes.data.success) {
          setSuccessMsg(`Sandbox Checkout Successful! Boarding OTP: ${verifyRes.data.data.boardingOtp}`);
          setTimeout(() => {
            onPaymentSuccess(verifyRes.data.data);
            onClose();
          }, 2000);
        }
      } else {
        // Razorpay Live Checkout SDK
        const options = {
          key: orderData.key,
          amount: orderData.amount * 100,
          currency: 'INR',
          name: 'CampusRide Platform',
          description: `Ride payment from ${ride.source} to ${ride.destination}`,
          order_id: orderData.orderId,
          handler: async function (response) {
            const verifyRes = await axios.post(
              `${API_BASE_URL}/payments/verify`,
              {
                rideRequestId: rideRequest._id,
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                gateway: 'razorpay',
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.success) {
              setSuccessMsg('Payment verified! Enjoy your ride.');
              setTimeout(() => {
                onPaymentSuccess(verifyRes.data.data);
                onClose();
              }, 1500);
            }
          },
          theme: { color: '#4f46e5' },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize online payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">CampusRide Checkout</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Price Breakdown */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm text-slate-300">
              <span>Driver Ride Contribution ({requestedSeats} seat)</span>
              <span className="font-semibold text-white">₹{baseFare}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-300">
              <span className="flex items-center gap-1.5">
                Platform Commission (0%)
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-semibold">
                  FREE Launch Offer
                </span>
              </span>
              <span className="font-semibold text-emerald-400">₹0</span>
            </div>
            <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
              <span className="font-semibold text-slate-200">Total Payable</span>
              <span className="text-xl font-bold text-emerald-400">₹{totalAmount}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-semibold transition ${
                  paymentMethod === 'wallet'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Wallet className="w-5 h-5 text-indigo-400" />
                Campus Wallet
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-semibold transition ${
                  paymentMethod === 'online'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Online / UPI Sandbox
              </button>
            </div>
          </div>

          {/* Status Alerts */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={paymentMethod === 'wallet' ? handleWalletPayment : handleOnlinePayment}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Pay ₹{totalAmount} Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
