const mongodb = require('mongodb');
let bucket;

// Initialize GridFS bucket when mongoose connection is ready
const initGridFS = (mongooseConnection) => {
  // GridFSBucket is the modern way to use GridFS with MongoDB
  bucket = new mongodb.GridFSBucket(mongooseConnection.db, {
    bucketName: 'uploads'
  });
  console.log('GridFS bucket initialized');
  return bucket;
};

// Get GridFS bucket instance
const getGridFSBucket = () => {
  if (!bucket) {
    throw new Error('GridFS bucket not initialized. Call initGridFS first.');
  }
  return bucket;
};

// Upload file to GridFS
const uploadFile = (filename, readStream, metadata = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        ...metadata,
        uploadedAt: new Date()
      }
    });

    // Capture ID before piping — finish event in driver v4+ passes no arguments
    const fileId = uploadStream.id;

    readStream
      .pipe(uploadStream)
      .on('finish', () => {
        resolve(fileId);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Download file from GridFS
// openDownloadStream requires an ObjectId, not a string
const downloadFile = (fileId) => {
  const objectId = new mongodb.ObjectId(fileId);
  return bucket.openDownloadStream(objectId);
};

// Get file metadata from GridFS
// MongoDB driver v4+ removed callback overloads — use Promise API
const getFileMetadata = async (fileId) => {
  const objectId = new mongodb.ObjectId(fileId);
  const files = await bucket.find({ _id: objectId }).toArray();
  if (!files || files.length === 0) {
    throw new Error('File not found');
  }
  return files[0];
};

// Delete file from GridFS
// MongoDB driver v4+ removed callback overloads — use Promise API
const deleteFile = async (fileId) => {
  const objectId = new mongodb.ObjectId(fileId);
  await bucket.delete(objectId);
  return true;
};

module.exports = {
  initGridFS,
  getGridFSBucket,
  uploadFile,
  downloadFile,
  getFileMetadata,
  deleteFile
};
