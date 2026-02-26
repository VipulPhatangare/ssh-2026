# MongoDB GridFS Integration Documentation

## Overview
This document describes the migration from disk-based file storage to MongoDB GridFS for document uploads (Income Certificate, Domicile Certificate, Caste Certificate).

## Architecture Changes

### Before (Disk Storage)
```
User uploads file
  ↓
Multer diskStorage
  ↓
File saved in backend/uploads/
  ↓
File path stored in User.incomeCertificate
  ↓
File retrieved from disk when needed
```

### After (GridFS)
```
User uploads file
  ↓
Multer with GridFS storage engine
  ↓
File chunks stored in MongoDB (fs.files + fs.chunks collections)
  ↓
File ID stored in User.incomeCertificate
  ↓
File retrieved from MongoDB when needed
```

## Components

### 1. GridFS Configuration (`backend/config/gridfs.js`)
Provides utility functions for GridFS operations:
- **initGridFS(connection)** - Initialize GridFS with mongoose connection
- **getGridFS()** - Get initialized GridFS instance
- **storeFile(filename, readStream, metadata)** - Store file in GridFS
- **retrieveFile(fileId)** - Get readable stream from GridFS
- **getFileMetadata(fileId)** - Get file metadata without downloading
- **deleteFile(fileId)** - Delete file from GridFS

### 2. Multer Configuration (`backend/config/multer.js`)
Updated to use custom GitFS storage engine:
- **GridFSStorage** - Custom storage class that pipes files to GridFS
- **documentUpload(gfs)** - Returns configured multer middleware for document uploads
- **fileFilter** - Validates file type (PDF only now)
- Handles multi-field uploads (incomeCertificate, domicileCertificate, casteCertificate)

### 3. User Model (`backend/models/User.js`)
Updated document fields to store ObjectIds instead of file paths:
```javascript
incomeCertificate: {
  type: mongoose.Schema.Types.ObjectId,
  default: null,
  ref: 'uploads.files'
},
domicileCertificate: {
  type: mongoose.Schema.Types.ObjectId,
  default: null,
  ref: 'uploads.files'
},
casteCertificate: {
  type: mongoose.Schema.Types.ObjectId,
  default: null,
  ref: 'uploads.files'
}
```

### 4. Auth Controller (`backend/controllers/authController.js`)
Enhanced with GridFS support:

#### updateProfile()
- Accepts multipart FormData with file uploads
- Stores file IDs instead of paths
- Automatically deletes old files when new ones are uploaded
- Updates user document with new file IDs

#### downloadDocument(fileId)
- Route: `GET /api/auth/download-document/:fileId`
- Validates that user owns the file
- Streams file from MongoDB to client
- Sets proper headers (Content-Type, Content-Disposition)

#### getDocumentInfo(fileId)
- Route: `GET /api/auth/document-info/:fileId`
- Returns file metadata without downloading
- Useful for checking file info before download

#### deleteDocument(documentType)
- Route: `DELETE /api/auth/document/:documentType`
- Removes file from GridFS and user document
- Validates user ownership

### 5. Routes (`backend/routes/authRoutes.js`)
New endpoints:
```
PUT    /api/auth/update-profile          - Update profile with file uploads
GET    /api/auth/download-document/:id   - Download a document
GET    /api/auth/document-info/:id       - Get document metadata
DELETE /api/auth/document/:type          - Delete a document
```

### 6. Server Configuration (`backend/server.js`)
- Initializes GridFS when MongoDB connection is ready
- Makes GridFS instance available to routes via middleware
- Removed static file serving (no longer needed)

## Security Features

### Access Control
✅ Only authenticated users can upload files
✅ Only file owner can download their own documents
✅ File ownership validated using user.incomeCertificate/domicileCertificate/casteCertificate

### File Validation
✅ PDF files only (MIME type: application/pdf)
✅ File size limit: 10MB per file
✅ Original filename preserved in metadata

### Error Handling
✅ Invalid file IDs rejected (must be valid ObjectId)
✅ Missing files return 404
✅ Unauthorized access returns 403
✅ Graceful error messages
✅ Old file cleanup on upload failure

## API Usage

### Upload Profile with Documents
```javascript
const formData = new FormData();
formData.append('fullName', 'John Doe');
formData.append('age', '30');
formData.append('incomeCertificate', file1); // PDF file
formData.append('domicileCertificate', file2); // PDF file

const response = await axios.put(
  '/api/auth/update-profile',
  formData,
  {
    headers: { 'Content-Type': 'multipart/form-data' }
  }
);

// Response includes file IDs:
// {
//   success: true,
//   data: {
//     _id: "...",
//     fullName: "John Doe",
//     incomeCertificate: "65a7d2e4b3c0f1a2b3c4d5e6",
//     domicileCertificate: "65a7d3e5c4d1g2b3c4d5e6f7"
//   }
// }
```

### Download Document
```javascript
// Get document stream
const response = await axios.get(
  '/api/auth/download-document/65a7d2e4b3c0f1a2b3c4d5e6',
  { responseType: 'blob' }
);

// Save file
const url = window.URL.createObjectURL(response.data);
const link = document.createElement('a');
link.href = url;
link.download = 'document.pdf';
link.click();
```

### Get Document Info
```javascript
const response = await axios.get(
  '/api/auth/document-info/65a7d2e4b3c0f1a2b3c4d5e6'
);

// Returns:
// {
//   success: true,
//   data: {
//     id: "65a7d2e4b3c0f1a2b3c4d5e6",
//     filename: "1234567890-income-cert.pdf",
//     contentType: "application/pdf",
//     size: 2048576,
//     uploadedAt: "2024-02-27T10:30:00Z"
//   }
// }
```

### Delete Document
```javascript
const response = await axios.delete(
  '/api/auth/document/incomeCertificate'
);

// Response includes updated user without the document
```

## Database Collections

### GridFS Files
MongoDB automatically creates:
- `uploads.files` - File metadata (filename, contentType, length, uploadDate)
- `uploads.chunks` - File binary data split into chunks (default 255KB each)

### User Documents
Each user document stores ObjectIds pointing to GridFS files:
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  incomeCertificate: ObjectId("65a7d2e4b3c0f1a2b3c4d5e6"),
  domicileCertificate: ObjectId("65a7d3e5c4d1g2b3c4d5e6f7"),
  casteCertificate: null,
  // ... other fields
}
```

## Benefits

| Aspect | Disk Storage | GridFS |
|--------|-------------|--------|
| Storage | File system | MongoDB |
| Scalability | Limited | Excellent |
| Backup | Requires file sync | Built-in to DB backup |
| Access Control | File system level | Application level |
| Replication | Manual | MongoDB replication |
| File Chunks | Whole files | Up to 255KB chunks |
| Cleanup | Manual file deletion | Automatic with TTL |
| Multi-server | Sync required | Transparent |

## Installation

```bash
# Install gridfs-stream
npm install gridfs-stream

# Restart backend
npm run dev
```

## Migration Notes

- Old files in `backend/uploads/` can be deleted
- Existing user documents with file paths will not work
- Run data migration script if needed to transfer old files to GridFS
- No changes required to frontend (same API endpoints)

## Troubleshooting

### GridFS Not Initialized
**Problem**: "GridFS not initialized" error
**Solution**: Ensure MongoDB connection is established before making requests

### File Not Found
**Problem**: 404 when trying to download
**Solution**: Check file ID format and that user owns the file

### Permission Denied
**Problem**: 403 error on download
**Solution**: Verify you're authenticated and file belongs to your account

### Large Files Hanging
**Problem**: Large files take long time or fail
**Solution**: Check GridFS chunk size (default 255KB) and network timeout

## Future Enhancements

1. Add file versioning (track document updates)
2. Add file search/indexing
3. Implement document expiration (TTL)
4. Add virus scanning for uploads
5. Add file access logging
6. Support additional file types
7. Add file compression
8. Implement S3 fallback for very large files
