const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    name: {
      type: String,
      default: 'Verified Student',
      trim: true,
    },
    university: {
      type: String,
      default: 'Indian University',
      trim: true,
    },
    rating: {
      type: Number,
      default: 5,
    },
    category: {
      type: String,
      default: 'Carpool Experience',
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
