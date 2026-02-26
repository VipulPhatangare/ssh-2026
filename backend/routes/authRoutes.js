const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  downloadDocument,
  getDocumentInfo,
  deleteDocument
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { documentUpload } = require('../config/multer');
const { getGridFSBucket } = require('../config/gridfs');
const mongoose = require('mongoose');

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// GridFS multer middleware for file uploads
const gridfsMulterMiddleware = (req, res, next) => {
  try {
    // GridFS bucket is initialized when MongoDB connects
    const bucket = getGridFSBucket();
    if (!bucket) {
      return res.status(503).json({
        success: false,
        message: 'File upload service not ready. Please try again later.'
      });
    }
    
    const middleware = documentUpload(bucket);
    middleware(req, res, next);
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: 'File upload service not available'
    });
  }
};

router.put('/update-profile', protect, gridfsMulterMiddleware, updateProfile);
router.put('/update-password', protect, updatePassword);

// Document retrieval routes
router.get('/download-document/:fileId', protect, downloadDocument);
router.get('/document-info/:fileId', protect, getDocumentInfo);
router.delete('/document/:documentType', protect, deleteDocument);

module.exports = router;
