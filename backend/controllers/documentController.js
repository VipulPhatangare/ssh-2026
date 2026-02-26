const Document = require('../models/Document');
const User = require('../models/User');
const { checkDocumentExpiry } = require('../utils/schemeMatchingService');
const path = require('path');
const fs = require('fs');

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const { documentType, expiryDate } = req.body;

    const document = await Document.create({
      userId: req.user._id,
      documentType,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileUrl: `/uploads/${req.file.filename}`,
      expiryDate: expiryDate || null
    });

    // Add document to user's documents array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { documents: document._id }
    });

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all documents for current user
// @route   GET /api/documents/my-documents
// @access  Private
exports.getMyDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ userId: req.user._id })
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private
exports.getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Make sure user owns this document or is admin
    if (document.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this document'
      });
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Make sure user owns this document
    if (document.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this document'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Remove from user's documents array
    await User.findByIdAndUpdate(document.userId, {
      $pull: { documents: document._id }
    });

    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check document expiry alerts
// @route   GET /api/documents/expiry-alerts
// @access  Private
exports.getExpiryAlerts = async (req, res, next) => {
  try {
    const alerts = await checkDocumentExpiry(req.user._id);

    res.status(200).json({
      success: true,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update document verification status (Admin only)
// @route   PUT /api/documents/:id/verify
// @access  Private/Admin
exports.verifyDocument = async (req, res, next) => {
  try {
    const { isVerified } = req.body;

    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true, runValidators: true }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};
