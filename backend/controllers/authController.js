const User = require('../models/User');
const { sendTokenResponse } = require('../utils/jwtUtils');
const { deleteFile, downloadFile, getFileMetadata } = require('../config/gridfs');
const mongoose = require('mongoose');
const axios = require('axios');

const N8N_USER_EMBEDDING_WEBHOOK = 'https://synthomind.cloud/webhook-test/ssh_2026_user_data_embeddings';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      password,
      age,
      gender,
      casteCategory,
      annualIncome,
      occupation,
      district,
      samagraId,
      // Optional government identity fields
      aadhaarNumber,
      panNumber,
      passportNumber,
      drivingLicenseNumber,
      voterIdNumber,
      rationCardNumber,
      governmentEmployeeId
    } = req.body;

    // Build user object with only required fields
    const userData = {
      fullName,
      email,
      password,
      age,
      gender,
      casteCategory,
      annualIncome,
      occupation,
      district,
      samagraId
    };

    // Add optional government fields if provided
    if (aadhaarNumber) userData.aadhaarNumber = aadhaarNumber;
    if (panNumber) userData.panNumber = panNumber;
    if (passportNumber) userData.passportNumber = passportNumber;
    if (drivingLicenseNumber) userData.drivingLicenseNumber = drivingLicenseNumber;
    if (voterIdNumber) userData.voterIdNumber = voterIdNumber;
    if (rationCardNumber) userData.rationCardNumber = rationCardNumber;
    if (governmentEmployeeId) userData.governmentEmployeeId = governmentEmployeeId;

    // Create user
    const user = await User.create(userData);

    // Don't log sensitive IDs
    console.log(`User registered: ${user.email}`);

    // Fire-and-forget: send registration data + _id to n8n for embedding / CRM
    const webhookPayload = {
      _id:                  user._id,
      fullName:             user.fullName,
      email:                user.email,
      age:                  user.age,
      gender:               user.gender,
      casteCategory:        user.casteCategory,
      annualIncome:         user.annualIncome,
      occupation:           user.occupation,
      district:             user.district,
      samagraId:            user.samagraId,
      aadhaarNumber:        user.aadhaarNumber        || null,
      panNumber:            user.panNumber            || null,
      passportNumber:       user.passportNumber       || null,
      drivingLicenseNumber: user.drivingLicenseNumber || null,
      voterIdNumber:        user.voterIdNumber        || null,
      rationCardNumber:     user.rationCardNumber     || null,
      governmentEmployeeId: user.governmentEmployeeId || null,
      registeredAt:         user.createdAt,
    };

    axios.post(N8N_USER_EMBEDDING_WEBHOOK, webhookPayload, {
      headers: { 'Content-Type': 'application/json' },
    }).then(() => {
      console.log(`✅ Registration data sent to n8n for user: ${user._id}`);
    }).catch(err => {
      console.error('⚠️  n8n registration webhook failed (non-blocking):', err.message);
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    // Define allowed fields for update
    const allowedFields = [
      'fullName', 'age', 'gender', 'casteCategory', 'annualIncome',
      'occupation', 'district', 'samagraId',
      // Optional government identity fields
      'aadhaarNumber', 'panNumber', 'passportNumber',
      'drivingLicenseNumber', 'voterIdNumber', 'rationCardNumber',
      'governmentEmployeeId'
    ];

    // Build update object with only allowed fields that were provided
    const fieldsToUpdate = {};
    allowedFields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    // Get current user to check for existing files
    const currentUser = await User.findById(req.user.id);

    // Handle file uploads if present (GridFS File IDs)
    if (req.files) {
      // Handle income certificate
      if (req.files.incomeCertificate && req.files.incomeCertificate[0]) {
        // Delete old file if exists
        if (currentUser.incomeCertificate) {
          try {
            await deleteFile(currentUser.incomeCertificate);
          } catch (delError) {
            console.warn('Warning: Could not delete old income certificate:', delError.message);
          }
        }
        // Store new file ID only if upload succeeded and ID is a valid ObjectId
        const incomeFileInfo = req.files.incomeCertificate[0];
        if (incomeFileInfo && incomeFileInfo.id && mongoose.Types.ObjectId.isValid(incomeFileInfo.id)) {
          fieldsToUpdate.incomeCertificate = incomeFileInfo.id;
        } else {
          console.warn('Income certificate upload ID is invalid or missing — skipping save');
        }
      }

      // Handle domicile certificate
      if (req.files.domicileCertificate && req.files.domicileCertificate[0]) {
        if (currentUser.domicileCertificate) {
          try {
            await deleteFile(currentUser.domicileCertificate);
          } catch (delError) {
            console.warn('Warning: Could not delete old domicile certificate:', delError.message);
          }
        }
        const domicileFileInfo = req.files.domicileCertificate[0];
        if (domicileFileInfo && domicileFileInfo.id && mongoose.Types.ObjectId.isValid(domicileFileInfo.id)) {
          fieldsToUpdate.domicileCertificate = domicileFileInfo.id;
        } else {
          console.warn('Domicile certificate upload ID is invalid or missing — skipping save');
        }
      }

      // Handle caste certificate
      if (req.files.casteCertificate && req.files.casteCertificate[0]) {
        if (currentUser.casteCertificate) {
          try {
            await deleteFile(currentUser.casteCertificate);
          } catch (delError) {
            console.warn('Warning: Could not delete old caste certificate:', delError.message);
          }
        }
        const casteFileInfo = req.files.casteCertificate[0];
        if (casteFileInfo && casteFileInfo.id && mongoose.Types.ObjectId.isValid(casteFileInfo.id)) {
          fieldsToUpdate.casteCertificate = casteFileInfo.id;
        } else {
          console.warn('Caste certificate upload ID is invalid or missing — skipping save');
        }
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};
// @desc    Download user's document from GridFS
// @route   GET /api/auth/download-document/:fileId
// @access  Private
exports.downloadDocument = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    // Validate file ID
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file ID format'
      });
    }

    // Check if user owns this document
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify user owns this file
    const ownsFile = 
      (user.incomeCertificate && user.incomeCertificate.toString() === fileId) ||
      (user.domicileCertificate && user.domicileCertificate.toString() === fileId) ||
      (user.casteCertificate && user.casteCertificate.toString() === fileId);

    if (!ownsFile) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have access to this document'
      });
    }

    // Get file metadata
    const metadata = await getFileMetadata(fileId);
    if (!metadata) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Set response headers
    res.set({
      'Content-Type': metadata.metadata?.mimeType || 'application/pdf',
      'Content-Length': metadata.length,
      'Content-Disposition': `inline; filename="${metadata.filename}"`
    });

    // Stream file from GridFS
    let fileStream;
    try {
      fileStream = downloadFile(fileId);
    } catch (streamErr) {
      console.error('Failed to open GridFS download stream:', streamErr);
      return res.status(500).json({ success: false, message: 'Failed to open file stream' });
    }

    // Register error handler BEFORE piping to catch early stream failures
    fileStream.on('error', (error) => {
      console.error('Error streaming file from GridFS:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error retrieving file'
        });
      } else {
        // Headers already sent — destroy the socket to signal broken transfer
        res.destroy(error);
      }
    });

    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get document metadata
// @route   GET /api/auth/document-info/:fileId
// @access  Private
exports.getDocumentInfo = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    // Validate file ID
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file ID format'
      });
    }

    // Check if user owns this document
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify user owns this file
    const ownsFile = 
      (user.incomeCertificate && user.incomeCertificate.toString() === fileId) ||
      (user.domicileCertificate && user.domicileCertificate.toString() === fileId) ||
      (user.casteCertificate && user.casteCertificate.toString() === fileId);

    if (!ownsFile) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have access to this document'
      });
    }

    // Get file metadata
    const metadata = await getFileMetadata(fileId);
    if (!metadata) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: metadata._id.toString(),
        filename: metadata.filename,
        contentType: metadata.metadata?.mimeType || 'application/pdf',
        size: metadata.length,
        uploadedAt: metadata.uploadDate,
        metadata: metadata.metadata
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user document
// @route   DELETE /api/auth/document/:documentType
// @access  Private
exports.deleteDocument = async (req, res, next) => {
  try {
    const { documentType } = req.params;
    const userId = req.user.id;

    // Validate document type
    const validTypes = ['incomeCertificate', 'domicileCertificate', 'casteCertificate'];
    if (!validTypes.includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get file ID from user's document
    const fileId = user[documentType];
    if (!fileId) {
      return res.status(404).json({
        success: false,
        message: `No ${documentType} found`
      });
    }

    // Delete file from GridFS
    await deleteFile(fileId);

    // Remove file ID from user
    user[documentType] = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: `${documentType} deleted successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};