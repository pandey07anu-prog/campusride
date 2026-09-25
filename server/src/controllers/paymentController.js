const Transaction = require('../models/Transaction');
const RideRequest = require('../models/RideRequest');
const Ride = require('../models/Ride');
const User = require('../models/User');
const Notification = require('../models/Notification');
const crypto = require('crypto');

// Commission Rate Configuration (0% platform fee - Free launch phase)
const PLATFORM_COMMISSION_RATE = 0;
const VIP_PASS_PRICE = 199; // ₹199 per month

/**
 * @desc Create Payment Order (Razorpay / Sandbox)
 * @route POST /api/payments/create-order
 * @access Private
 */
const createOrder = async (req, res, next) => {
  try {
    const { rideRequestId } = req.body;
    const passengerId = req.user.id;

    const rideRequest = await RideRequest.findById(rideRequestId).populate('rideId');
    if (!rideRequest) {
      return res.status(404).json({ success: false, message: 'Ride request not found' });
    }

    if (rideRequest.passengerId.toString() !== passengerId) {
      return res.status(403).json({ success: false, message: 'Not authorized for this payment' });
    }

    const ride = rideRequest.rideId;
    const user = await User.findById(passengerId);

    const baseFare = (ride.contribution || 0) * (rideRequest.requestedSeats || 1);
    
    // Check if user has active VIP pass (0 platform fee)
    const isVipActive = user.isVipPass && user.vipPassExpiresAt && new Date(user.vipPassExpiresAt) > new Date();
    const platformFee = isVipActive ? 0 : Math.round(baseFare * PLATFORM_COMMISSION_RATE);
    const totalAmount = baseFare + platformFee;

    // Check if Razorpay keys are configured in process.env
    let orderDetails = {};
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      // Lazy load Razorpay if credentials exist
      const Razorpay = require('razorpay');
      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: totalAmount * 100, // Razorpay works in paise
        currency: 'INR',
        receipt: `receipt_${rideRequestId}_${Date.now()}`,
      };

      const razorpayOrder = await instance.orders.create(options);
      orderDetails = {
        orderId: razorpayOrder.id,
        gateway: 'razorpay',
        key: process.env.RAZORPAY_KEY_ID,
      };
    } else {
      // Sandbox fallback order creation
      const sandboxOrderId = `order_sandbox_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      orderDetails = {
        orderId: sandboxOrderId,
        gateway: 'sandbox',
        key: 'sandbox_test_key',
      };
    }

    // Create pending transaction log
    const transaction = await Transaction.create({
      userId: passengerId,
      rideRequestId: rideRequest._id,
      rideId: ride._id,
      type: 'ride_payment',
      amount: totalAmount,
      baseFare,
      platformFee,
      paymentGateway: orderDetails.gateway,
      gatewayOrderId: orderDetails.orderId,
      status: 'created',
      description: `Ride fare from ${ride.source} to ${ride.destination}`,
    });

    res.status(200).json({
      success: true,
      data: {
        transactionId: transaction._id,
        orderId: orderDetails.orderId,
        gateway: orderDetails.gateway,
        key: orderDetails.key,
        amount: totalAmount,
        baseFare,
        platformFee,
        currency: 'INR',
        isVipActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Verify & Complete Payment (Razorpay / Sandbox)
 * @route POST /api/payments/verify
 * @access Private
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { rideRequestId, orderId, paymentId, signature, gateway } = req.body;
    const passengerId = req.user.id;

    const rideRequest = await RideRequest.findById(rideRequestId).populate('rideId');
    if (!rideRequest) {
      return res.status(404).json({ success: false, message: 'Ride request not found' });
    }

    // Verify signature if Razorpay
    if (gateway === 'razorpay' && process.env.RAZORPAY_KEY_SECRET) {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(orderId + '|' + paymentId)
        .digest('hex');

      if (generatedSignature !== signature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature' });
      }
    }

    // Update Transaction
    const transaction = await Transaction.findOne({ gatewayOrderId: orderId });
    if (transaction) {
      transaction.status = 'paid';
      transaction.gatewayPaymentId = paymentId || `pay_sandbox_${Date.now()}`;
      await transaction.save();

      // Credit Driver's Wallet balance with base fare
      const ride = await Ride.findById(rideRequest.rideId);
      if (ride) {
        await User.findByIdAndUpdate(ride.driverId, {
          $inc: { walletBalance: transaction.baseFare },
        });

        // Driver transaction log
        await Transaction.create({
          userId: ride.driverId,
          rideRequestId: rideRequest._id,
          rideId: ride._id,
          type: 'driver_payout',
          amount: transaction.baseFare,
          baseFare: transaction.baseFare,
          platformFee: 0,
          paymentGateway: transaction.paymentGateway,
          gatewayOrderId: orderId,
          gatewayPaymentId: paymentId || `pay_sandbox_${Date.now()}`,
          status: 'paid',
          description: `Ride earnings for ${ride.source} -> ${ride.destination}`,
        });

        // Notify Driver
        await Notification.create({
          userId: ride.driverId,
          type: 'payment_received',
          title: '💰 Payment Received!',
          message: `Received ₹${transaction.baseFare} in wallet for ride from ${ride.source} to ${ride.destination}.`,
          relatedRideId: ride._id,
        });
      }
    }

    // Update RideRequest Payment Status
    rideRequest.paymentStatus = 'paid';
    await rideRequest.save();

    // Notify Passenger
    await Notification.create({
      userId: passengerId,
      type: 'payment_completed',
      title: '✅ Ride Payment Successful!',
      message: `Payment of ₹${transaction ? transaction.amount : 0} completed successfully.`,
      relatedRideId: rideRequest.rideId,
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and completed successfully',
      data: {
        rideRequestId: rideRequest._id,
        paymentStatus: 'paid',
        boardingOtp: rideRequest.boardingOtp,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Pay via Campus Wallet directly
 * @route POST /api/payments/pay-wallet
 * @access Private
 */
const payWithWallet = async (req, res, next) => {
  try {
    const { rideRequestId } = req.body;
    const passengerId = req.user.id;

    const rideRequest = await RideRequest.findById(rideRequestId).populate('rideId');
    if (!rideRequest) {
      return res.status(404).json({ success: false, message: 'Ride request not found' });
    }

    const ride = rideRequest.rideId;
    const passenger = await User.findById(passengerId);

    const baseFare = (ride.contribution || 0) * (rideRequest.requestedSeats || 1);
    const isVipActive = passenger.isVipPass && passenger.vipPassExpiresAt && new Date(passenger.vipPassExpiresAt) > new Date();
    const platformFee = isVipActive ? 0 : Math.round(baseFare * PLATFORM_COMMISSION_RATE);
    const totalAmount = baseFare + platformFee;

    if (passenger.walletBalance < totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Total required: ₹${totalAmount}, Current balance: ₹${passenger.walletBalance}`,
      });
    }

    // Deduct passenger wallet balance
    passenger.walletBalance -= totalAmount;
    await passenger.save();

    // Credit driver wallet balance
    await User.findByIdAndUpdate(ride.driverId, {
      $inc: { walletBalance: baseFare },
    });

    // Create transaction records
    const txnId = `txn_wallet_${Date.now()}`;
    await Transaction.create({
      userId: passengerId,
      rideRequestId: rideRequest._id,
      rideId: ride._id,
      type: 'ride_payment',
      amount: totalAmount,
      baseFare,
      platformFee,
      paymentGateway: 'campus_wallet',
      gatewayOrderId: txnId,
      gatewayPaymentId: txnId,
      status: 'paid',
      description: `Wallet payment for ride to ${ride.destination}`,
    });

    await Transaction.create({
      userId: ride.driverId,
      rideRequestId: rideRequest._id,
      rideId: ride._id,
      type: 'driver_payout',
      amount: baseFare,
      baseFare,
      platformFee: 0,
      paymentGateway: 'campus_wallet',
      gatewayOrderId: txnId,
      gatewayPaymentId: txnId,
      status: 'paid',
      description: `Wallet earning from ride to ${ride.destination}`,
    });

    // Update ride request
    rideRequest.paymentStatus = 'paid';
    await rideRequest.save();

    // Send Notifications
    await Notification.create({
      userId: passengerId,
      type: 'payment_completed',
      title: '✅ Wallet Payment Complete!',
      message: `Paid ₹${totalAmount} via Campus Wallet.`,
      relatedRideId: ride._id,
    });

    await Notification.create({
      userId: ride.driverId,
      type: 'payment_received',
      title: '💰 Wallet Earnings Added!',
      message: `₹${baseFare} credited to your wallet for upcoming ride to ${ride.destination}.`,
      relatedRideId: ride._id,
    });

    res.status(200).json({
      success: true,
      message: 'Payment completed via Campus Wallet',
      data: {
        newWalletBalance: passenger.walletBalance,
        paymentStatus: 'paid',
        boardingOtp: rideRequest.boardingOtp,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Buy CampusRide VIP Pass (Subscription)
 * @route POST /api/payments/subscribe-vip
 * @access Private
 */
const subscribeVipPass = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: '0% platform fee is standard for all users. VIP Pass is no longer required.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get User Transactions & Wallet Details
 * @route GET /api/payments/wallet
 * @access Private
 */
const getWalletAndTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('walletBalance fullName email');
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30);

    let realBalance = 0;
    transactions.forEach((t) => {
      if (t.status === 'paid' || t.status === 'completed') {
        if (t.type === 'wallet_topup' || t.type === 'driver_payout') {
          realBalance += t.amount || 0;
        } else if (t.type === 'ride_payment' && t.paymentGateway === 'campus_wallet') {
          realBalance -= t.amount || 0;
        }
      }
    });

    const walletBalance = transactions.length > 0 ? Math.max(0, realBalance) : (user?.walletBalance || 0);

    res.status(200).json({
      success: true,
      data: {
        walletBalance,
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get Overall Platform Earnings (Admin Revenue Dashboard)
 * @route GET /api/payments/admin/platform-earnings
 * @access Private (Admin only)
 */
const getPlatformEarnings = async (req, res, next) => {
  try {
    const totalTransactions = await Transaction.countDocuments({ status: 'paid' });
    
    // Aggregate platform fees collected
    const revenueAggregation = await Transaction.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, totalCommission: { $sum: '$platformFee' }, totalVolume: { $sum: '$amount' } } },
    ]);

    const stats = revenueAggregation[0] || { totalCommission: 0, totalVolume: 0 };

    const recentPlatformTransactions = await Transaction.find({ status: 'paid' })
      .populate('userId', 'fullName email university')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        totalPlatformCommission: stats.totalCommission,
        totalTransactionVolume: stats.totalVolume,
        totalPaidTransactions: totalTransactions,
        recentTransactions: recentPlatformTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Top Up Campus Wallet via UPI QR Scan
 * @route POST /api/payments/topup-upi
 * @access Private
 */
const topupViaUPI = async (req, res, next) => {
  try {
    const { amount, upiId, upiApp } = req.body;
    const userId = req.user.id;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid top-up amount' });
    }

    const topUpAmount = Number(amount);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.walletBalance += topUpAmount;
    await user.save();

    const cleanUpiId = (upiId || '').trim();
    const appLabel = upiApp ? upiApp.toUpperCase() : 'UPI App';
    const txnId = `topup_upi_${Date.now()}`;

    const transaction = await Transaction.create({
      userId,
      type: 'wallet_topup',
      amount: topUpAmount,
      baseFare: topUpAmount,
      platformFee: 0,
      paymentGateway: cleanUpiId ? `UPI (${cleanUpiId})` : 'UPI QR',
      gatewayOrderId: txnId,
      gatewayPaymentId: txnId,
      status: 'paid',
      description: `Campus Wallet Top-Up via ${appLabel} ${cleanUpiId ? '(' + cleanUpiId + ')' : ''}`,
    });

    await Notification.create({
      userId,
      type: 'general',
      title: '💳 Wallet Top-Up Successful!',
      message: `₹${topUpAmount} credited to your Campus Wallet via ${cleanUpiId || 'UPI'}. New balance: ₹${user.walletBalance}.`,
    });

    res.status(200).json({
      success: true,
      message: `₹${topUpAmount} credited to wallet via UPI!`,
      data: {
        newWalletBalance: user.walletBalance,
        transaction,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Generate Dynamic UPI Payment Intent Parameters
 * @route POST /api/payments/generate-upi-qr
 * @access Private
 */
const generateUPIIntent = async (req, res, next) => {
  try {
    const { amount, note } = req.body;
    const vpa = 'campusride@upi';
    const upiUri = `upi://pay?pa=${vpa}&pn=CampusRide%20Carpool&am=${amount || 50}&cu=INR&tn=${encodeURIComponent(note || 'CampusRide Payment')}`;

    res.status(200).json({
      success: true,
      data: {
        vpa,
        payeeName: 'CampusRide Carpool',
        amount: amount || 50,
        currency: 'INR',
        upiUri,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  payWithWallet,
  subscribeVipPass,
  getWalletAndTransactions,
  getPlatformEarnings,
  topupViaUPI,
  generateUPIIntent,
};
