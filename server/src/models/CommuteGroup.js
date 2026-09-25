const mongoose = require('mongoose');

const commuteGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    route: {
      source: { type: String, required: true },
      destination: { type: String, required: true },
    },
    scheduleTime: {
      type: String,
      default: '08:00 AM',
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    maxMembers: {
      type: Number,
      default: 4,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CommuteGroup', commuteGroupSchema);
