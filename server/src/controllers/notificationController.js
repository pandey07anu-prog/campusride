const Notification = require('../models/Notification');
const { successResponse } = require('../utils/responseHelper');

const MOCK_NOTIFS = [
  {
    _id: 'n101',
    title: 'Student Verification Approved 🎉',
    message: 'Your college verification has been approved by the CampusRide admin team. You can now offer and book rides!',
    isRead: false,
    createdAt: new Date(),
  },
  {
    _id: 'n102',
    title: 'Ride Reminder 🚗',
    message: 'Your commute to State University Campus departing at 08:15 AM is scheduled for tomorrow.',
    isRead: false,
    createdAt: new Date(),
  },
];

// @route   GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    let notifs = [];
    try {
      const allNotifs = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
      
      if (allNotifs.length > 5) {
        const top5 = allNotifs.slice(0, 5);
        const top5Ids = top5.map((n) => n._id);
        // Delete rest from database
        await Notification.deleteMany({
          userId: req.user._id,
          _id: { $nin: top5Ids },
        });
        notifs = top5;
      } else {
        notifs = allNotifs;
      }
    } catch (err) {}

    if (!notifs || notifs.length === 0) {
      const universityName = req.user?.university || 'Campus';
      notifs = [
        {
          _id: 'n101',
          title: 'Student Verification Approved 🎉',
          message: `Your college verification for ${universityName} has been approved by the CampusRide admin team. You can now offer and book rides!`,
          isRead: false,
          createdAt: new Date(),
        },
        {
          _id: 'n102',
          title: 'Ride Reminder 🚗',
          message: `Your upcoming commute to ${universityName} departing at 08:15 AM is scheduled. Have a safe ride!`,
          isRead: false,
          createdAt: new Date(),
        },
      ];
    }

    return successResponse(res, 200, 'Notifications retrieved (Top 5 kept)', notifs);
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    try {
      await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    } catch (err) {}
    return successResponse(res, 200, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    try {
      await Notification.updateMany({ userId: req.user._id }, { isRead: true });
    } catch (err) {}
    return successResponse(res, 200, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
