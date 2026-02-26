const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  deleteDocument,
  getExpiryAlerts,
  verifyDocument
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/multer');

router.post('/upload', protect, upload.single('document'), uploadDocument);
router.get('/my-documents', protect, getMyDocuments);
router.get('/expiry-alerts', protect, getExpiryAlerts);
router.get('/:id', protect, getDocumentById);
router.delete('/:id', protect, deleteDocument);

// Admin routes
router.put('/:id/verify', protect, authorize('Admin'), verifyDocument);

module.exports = router;
