const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const pdfParse = require('pdf-parse');
const axios = require('axios');
const Upload = require('../models/Upload');
const ChatSession = require('../models/ChatSession');
const { protect } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dwe7yxmmi',
  api_key: process.env.CLOUDINARY_API_KEY || '389267933434349',
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF allowed.'));
    }
  }
});

// Generate unique upload ID
const generateUploadId = () => {
  return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Upload endpoint
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const { chatId, sessionId, message } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadId = generateUploadId();
    const isImage = file.mimetype.startsWith('image/');
    const isPDF = file.mimetype === 'application/pdf';

    let uploadData = {
      uploadId,
      userId: req.user._id,
      chatId: chatId || `chat_${Date.now()}`,
      sessionId: sessionId || `session_${Date.now()}`,
      fileType: isImage ? 'image' : 'pdf',
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      message: message || ''
    };

    let webhookPayload = {
      chatId: uploadData.chatId,
      sessionId: uploadData.sessionId,
      userId: req.user._id,
      userName: req.user.fullName,
      message: message || '',
      timestamp: new Date().toISOString(),
      uploadId: uploadId,
      fileType: isImage ? 'image' : 'pdf',
      fileName: file.originalname,
      imageUrl: 'No',  // Default to "No", will be updated if image
      pdfText: 'No'    // Default to "No", will be updated if PDF
    };

    // Handle Image Upload to Cloudinary
    if (isImage) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'ssh-2026/complaints',
            resource_type: 'image',
            public_id: uploadId
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });

      uploadData.imageUrl = uploadResult.secure_url;
      uploadData.cloudinaryPublicId = uploadResult.public_id;

      // Update webhook payload with actual image URL
      webhookPayload.imageUrl = uploadResult.secure_url;
    }

    // Handle PDF Upload - Extract text
    if (isPDF) {
      try {
        const pdfData = await pdfParse(file.buffer);
        const extractedText = pdfData.text.trim();

        console.log('📄 PDF extraction successful');
        console.log('📝 Extracted text length:', extractedText.length);
        console.log('📄 First 200 chars:', extractedText.substring(0, 200));

        uploadData.pdfText = extractedText;
        uploadData.pdfBuffer = file.buffer;

        if (extractedText && extractedText.length > 0) {
          // PDF has extractable text
          webhookPayload.pdfText = extractedText;
          webhookPayload.pageCount = pdfData.numpages;
          console.log('✅ PDF text added to webhook payload');
        } else {
          // PDF is image-based, send base64 for OCR processing
          const pdfBase64 = file.buffer.toString('base64');
          webhookPayload.pdfText = 'Image-based PDF - requires OCR';
          webhookPayload.pdfBase64 = `data:application/pdf;base64,${pdfBase64}`;
          webhookPayload.pageCount = pdfData.numpages;
          webhookPayload.requiresOCR = true;
          console.log('⚠️ PDF has no text - sending base64 for OCR');
        }
        
      } catch (pdfError) {
        console.error('❌ PDF parsing error:', pdfError);
        webhookPayload.pdfText = 'Error: Could not extract text from PDF';
      }
    }

    // Save to MongoDB
    const uploadRecord = await Upload.create(uploadData);

    // Send to N8N webhook
    const N8N_WEBHOOK_URL = 'https://synthomind.cloud/webhook/ssh-2026-main-chat-bot';
    let n8nResponseData = null;
    let webhookSuccess = false;
    try {
      console.log('📤 Sending to webhook:', {
        ...webhookPayload,
        pdfText: webhookPayload.pdfText === 'No' ? 'No' : `${webhookPayload.pdfText.substring(0, 100)}...`
      });
      
      const n8nRes = await axios.post(N8N_WEBHOOK_URL, webhookPayload, {
        headers: { 'Content-Type': 'application/json' }
      });
      webhookSuccess = true;
      n8nResponseData = n8nRes?.data ?? null;
      console.log('✅ Data sent to N8N webhook');
    } catch (webhookError) {
      console.error('❌ Webhook error:', webhookError.message);
    }

    // Return response
    res.status(200).json({
      success: true,
      uploadId: uploadId,
      fileType: uploadData.fileType,
      imageUrl: uploadData.imageUrl || null,
      pdfText: uploadData.pdfText || null,
      pdfTextLength: typeof uploadData.pdfText === 'string' ? uploadData.pdfText.length : 0,
      webhookSuccess,
      n8nResponse: n8nResponseData,
      fileName: file.originalname,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete upload endpoint (for cleanup)
router.delete('/upload/:uploadId', protect, async (req, res) => {
  try {
    const { uploadId } = req.params;
    const uploadRecord = await Upload.findOne({ uploadId, userId: req.user._id });

    if (!uploadRecord) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    // Delete from Cloudinary if image
    if (uploadRecord.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(uploadRecord.cloudinaryPublicId);
    }

    // Delete from MongoDB
    await Upload.deleteOne({ uploadId });

    res.status(200).json({
      success: true,
      message: 'Upload deleted successfully',
      uploadId: uploadId
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user uploads
router.get('/uploads', protect, async (req, res) => {
  try {
    const uploads = await Upload.find({ userId: req.user._id })
      .select('-pdfBuffer') // Exclude large binary data
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: uploads.length,
      uploads: uploads
    });

  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Chat Session Routes ───────────────────────────────────────────────────────

// GET /api/ai/sessions — list user's sessions (metadata only, no messages)
router.get('/sessions', protect, async (req, res) => {
  try {
    const sessions = await ChatSession.find(
      { userId: req.user._id },
      { sessionId: 1, title: 1, createdAt: 1, updatedAt: 1 }
    ).sort({ updatedAt: -1 }).limit(100);
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/ai/sessions/:sessionId — get full session (with messages)
router.get('/sessions/:sessionId', protect, async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      sessionId: req.params.sessionId,
      userId: req.user._id,
    });
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/ai/sessions/:sessionId — create or update session
router.put('/sessions/:sessionId', protect, async (req, res) => {
  try {
    const { title, messages } = req.body;
    const session = await ChatSession.findOneAndUpdate(
      { sessionId: req.params.sessionId, userId: req.user._id },
      { $set: { title: title || 'New Chat', messages: messages || [] } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, session: { sessionId: session.sessionId, title: session.title, updatedAt: session.updatedAt } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/ai/sessions/:sessionId — delete session
router.delete('/sessions/:sessionId', protect, async (req, res) => {
  try {
    await ChatSession.findOneAndDelete({
      sessionId: req.params.sessionId,
      userId: req.user._id,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

