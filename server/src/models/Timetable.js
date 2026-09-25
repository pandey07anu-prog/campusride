const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    campus: {
      type: String,
      default: 'Main Campus',
    },
    schedule: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          required: true,
        },
        firstClassStart: { type: String, required: true }, // e.g. "09:00"
        lastClassEnd: { type: String, required: true },   // e.g. "17:00"
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Timetable', timetableSchema);
