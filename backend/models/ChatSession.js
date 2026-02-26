const mongoose = require('mongoose');

// Flexible message schema — stores any message shape (text, schemes, comparisonData, file refs)
const ChatSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'New Chat',
      maxlength: 120,
    },
    // Full message array stored as raw JSON (supports nested comparisonData, schemes, etc.)
    messages: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

// Index for fast per-user listing sorted by most-recently-updated
ChatSessionSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
