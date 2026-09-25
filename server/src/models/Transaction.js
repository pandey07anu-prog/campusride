const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rideRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RideRequest',
    },
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
    },
    type: {
      type: String,
      enum: ['ride_payment', 'platform_commission', 'driver_payout', 'vip_subscription', 'wallet_recharge'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    baseFare: {
      type: Number,
      default: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    paymentGateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'campus_wallet', 'sandbox'],
      default: 'sandbox',
    },
    gatewayOrderId: {
      type: String,
    },
    gatewayPaymentId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded'],
      default: 'created',
    },
    description: {
      type: String,
      default: 'CampusRide Transaction',
    },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
