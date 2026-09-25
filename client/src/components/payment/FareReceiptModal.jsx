import React from 'react';
import { X, Printer, Download, ShieldCheck, Car, MapPin, CheckCircle2, Ticket } from 'lucide-react';

const FareReceiptModal = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const isVip = transaction.platformFee === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-6 text-slate-100 print:border-none print:shadow-none print:bg-white print:text-slate-950">
        
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Receipt Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:border-slate-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-lg shrink-0 print:bg-emerald-100">
              🚗
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white print:text-slate-950">CampusRide Official Receipt</h3>
              <p className="text-[11px] text-slate-400 print:text-slate-600">Digital Fare & Payment Voucher</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1 print:bg-emerald-100 print:text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> PAID
          </span>
        </div>

        {/* Transaction ID & Date */}
        <div className="grid grid-cols-2 gap-4 text-xs p-3.5 rounded-2xl bg-slate-950 border border-slate-800 print:bg-slate-50 print:border-slate-200">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Transaction ID</span>
            <span className="font-mono font-bold text-emerald-400 print:text-slate-950">{transaction._id || transaction.gatewayOrderId || 'TXN-CAMPUSRIDE'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Date & Time</span>
            <span className="font-medium text-slate-300 print:text-slate-700">
              {new Date(transaction.createdAt || Date.now()).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Route Details */}
        <div className="space-y-3 text-xs p-4 rounded-2xl bg-slate-950/60 border border-slate-800 print:bg-slate-50 print:border-slate-200">
          <div className="flex items-center justify-between text-slate-400 print:text-slate-700">
            <span className="font-semibold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" /> Route Description
            </span>
            <span className="font-bold text-slate-200 print:text-slate-950">{transaction.description || 'College Carpool Ride'}</span>
          </div>
          {transaction.rideId && (
            <div className="flex items-center justify-between text-slate-400 border-t border-slate-900 pt-2 print:border-slate-200">
              <span>Ride ID:</span>
              <span className="font-mono text-slate-300 font-semibold">{transaction.rideId}</span>
            </div>
          )}
        </div>

        {/* Itemized Financial Breakdown Table */}
        <div className="space-y-2 text-xs">
          <span className="font-extrabold text-slate-300 text-xs block uppercase tracking-wider print:text-slate-800">Fare Itemization</span>
          
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 print:bg-slate-50 print:border-slate-200">
            <div className="flex justify-between text-slate-300 print:text-slate-800">
              <span>Driver Base Contribution Fare:</span>
              <span className="font-bold">₹{transaction.baseFare || transaction.amount}</span>
            </div>

            <div className="flex justify-between text-slate-300 print:text-slate-800">
              <span className="flex items-center gap-1">
                Platform Service Fee (0%):
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  FREE 0% Fee
                </span>
              </span>
              <span className="font-bold">₹0</span>
            </div>

            <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-black text-white print:border-slate-300 print:text-slate-950">
              <span>Total Paid Amount:</span>
              <span className="text-emerald-400 print:text-emerald-700">₹{transaction.amount}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Specs */}
        <div className="flex items-center justify-between text-xs text-slate-400 p-3 rounded-xl bg-slate-950 border border-slate-900 print:bg-slate-50">
          <span>Payment Gateway:</span>
          <span className="font-semibold text-slate-200 uppercase print:text-slate-950">
            {transaction.paymentGateway || 'UPI QR / Campus Wallet'}
          </span>
        </div>

        {/* Printable Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition border border-slate-700"
          >
            <Printer className="w-4 h-4 text-emerald-400" /> Print / Save PDF
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-emerald-500/20"
          >
            Close Receipt
          </button>
        </div>

      </div>
    </div>
  );
};

export default FareReceiptModal;
