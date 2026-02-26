const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  uploadId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chatId: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['image', 'pdf'],
    required: true
  },
  // For images - Cloudinary URL
  imageUrl: {
    type: String,
    default: null
  },
  cloudinaryPublicId: {
    type: String,
    default: null
  },
  // For PDFs - extracted text and storage
  pdfText: {
    type: String,
    default: null
  },
  pdfBuffer: {
    type: Buffer,
    default: null
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  // For embedding management
  embeddingId: {
    type: String,
    default: null
  },
  isEmbedded: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
uploadSchema.index({ userId: 1, createdAt: -1 });
uploadSchema.index({ chatId: 1 });

module.exports = mongoose.model('Upload', uploadSchema);
