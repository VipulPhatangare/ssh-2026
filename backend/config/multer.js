const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

// GridFS Storage engine for Multer
class GridFSStorage {
  constructor(bucket) {
    this.bucket = bucket;
  }

  _handleFile(req, file, cb) {
    if (!this.bucket) {
      return cb(new Error('GridFS bucket not available'));
    }

    const filename = `${Date.now()}-${file.originalname}`;
    
    // Create upload stream
    const uploadStream = this.bucket.openUploadStream(filename, {
      metadata: {
        originalName: file.originalname,
        uploadedAt: new Date(),
        userId: req.user?.id || null,
        mimeType: file.mimetype
      }
    });

    // Capture the file ID from the stream (it's set when stream is created)
    const fileId = uploadStream.id.toString();

    // Pipe file to GridFS
    file.stream
      .pipe(uploadStream)
      .on('finish', () => {
        // uploadStream finished writing successfully
        cb(null, {
          id: fileId,
          filename: filename,
          size: uploadStream.bytesWritten || 0,
          contentType: file.mimetype
        });
      })
      .on('error', (error) => {
        cb(error);
      });
  }

  _removeFile(req, file, cb) {
    if (!this.bucket || !file.id) {
      return cb(null);
    }

    try {
      const objectId = new mongoose.Types.ObjectId(file.id);
      this.bucket.delete(objectId, (err) => {
        if (err) {
          console.warn('Warning: Could not delete file from GridFS:', err.message);
          return cb(null); // Don't fail if cleanup fails
        }
        cb(null);
      });
    } catch (error) {
      console.warn('Warning: Error deleting file:', error.message);
      cb(null);
    }
  }
}

// File filter for PDF only
const fileFilter = (req, file, cb) => {
  // Only allow PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Create storage with GridFS bucket
const createStorage = (bucket) => {
  return new GridFSStorage(bucket);
};

// General file upload (uses memory storage for non-government documents)
const basicMemoryStorage = multer.memoryStorage();
const upload = multer({
  storage: basicMemoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Document upload middleware for government documents
// Bucket will be injected via route middleware
const documentUpload = (bucket) => {
  const storage = createStorage(bucket);
  
  return multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
  }).fields([
    { name: 'incomeCertificate', maxCount: 1 },
    { name: 'domicileCertificate', maxCount: 1 },
    { name: 'casteCertificate', maxCount: 1 }
  ]);
};

module.exports = {
  GridFSStorage,
  upload,
  documentUpload,
  fileFilter
};

