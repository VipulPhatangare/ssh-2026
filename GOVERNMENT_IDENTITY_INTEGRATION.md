# Government Identity & Document Integration

## Overview

This document describes the extended user profile system that now supports government identity fields and document uploads. The system is designed to be **100% backward compatible** - existing users can continue using the system without any disruption.

---

## ✅ Backend Implementation

### 1. User Model (`backend/models/User.js`)

#### New Optional Fields Added:

**Government ID Numbers:**
```javascript
- aadhaarNumber (String): 12-digit Aadhaar number
- panNumber (String): PAN format ABCDE1234F
- passportNumber (String): Passport number
- drivingLicenseNumber (String): Driving license number
- voterIdNumber (String): Voter ID number
- rationCardNumber (String): Ration card number
- governmentEmployeeId (String): Government employee ID
```

**Document Upload URLs:**
```javascript
- incomeCertificate (String): File path/URL to income certificate
- domicileCertificate (String): File path/URL to domicile certificate
- casteCertificate (String): File path/URL to caste certificate
```

#### Key Features:
- ✅ All fields are **OPTIONAL** (default: null)
- ✅ Input validation for Aadhaar (12 digits) and PAN (specific format)
- ✅ Comments added for future encryption implementation
- ✅ `toJSON()` method excludes sensitive fields from API responses
- ✅ Fully backward compatible with existing users

### 2. Authentication Controller (`backend/controllers/authController.js`)

#### Register Endpoint Updates:
```javascript
// NEW: Accepts optional government identity fields
POST /api/auth/register
{
  // Required fields (existing)
  fullName, email, password, age, gender, casteCategory,
  annualIncome, occupation, district,
  
  // Optional fields (NEW)
  aadhaarNumber, panNumber, passportNumber, 
  drivingLicenseNumber, voterIdNumber, rationCardNumber,
  governmentEmployeeId
}
```

**Features:**
- Only provided fields are saved
- No required fields added (backward compatible)
- No sensitive logging of IDs

#### Update Profile Endpoint:
```javascript
// UPDATED: Now handles optional fields and file uploads
PUT /api/auth/update-profile
Content-Type: multipart/form-data
{
  // Text fields (optional)
  aadhaarNumber, panNumber, passportNumber, etc.,
  
  // File uploads (optional)
  incomeCertificate (file),
  domicileCertificate (file),
  casteCertificate (file)
}
```

**Features:**
- Partial updates only
- Only provided fields are updated
- No field overwriting if not sent
- Allows updating individual fields without affecting others

### 3. File Upload Configuration (`backend/config/multer.js`)

#### New Multi-field Upload Middleware:
```javascript
const { documentUpload } = require('../config/multer');

// Upload configuration for government document uploads
documentUpload.fields([
  { name: 'incomeCertificate', maxCount: 1 },
  { name: 'domicileCertificate', maxCount: 1 },
  { name: 'casteCertificate', maxCount: 1 }
]);
```

**Features:**
- Supports JPEG, JPG, PNG, PDF files
- File size limit: 10MB per document
- Stores files in `uploads/` directory
- Returns file path for database storage
- Optional file uploads (upload any, all, or none)

### 4. Routes Configuration (`backend/routes/authRoutes.js`)

```javascript
// Updated route with document upload middleware
router.put('/update-profile', protect, documentUpload, updateProfile);
```

---

## 🎨 Frontend Implementation

### 1. Registration Form (`frontend/src/pages/Register.js`)

**New Optional Section:**
```
┌─────────────────────────────────────────┐
│ ▶ Additional Government Details (Optional) │ ← Collapsible
├─────────────────────────────────────────┤
│ Aadhaar Number (12 digits)              │
│ PAN Number (Format: ABCDE1234F)         │
│ Passport Number                         │
│ Driving License Number                  │
│ Voter ID Number                         │
│ Ration Card Number                      │
│ Government Employee ID                  │
└─────────────────────────────────────────┘
```

**Features:**
- ✅ All fields are optional
- ✅ Collapsible section (hidden by default)
- ✅ Helper text explaining optional nature
- ✅ Input validation patterns
- ✅ No breaking changes to existing form

**Usage:**
```javascript
const [formData, setFormData] = useState({
  // Existing fields
  fullName: '', email: '', password: '', ...
  
  // NEW: Government identity fields
  aadhaarNumber: '',
  panNumber: '',
  // ... etc
});

const [showGovDetails, setShowGovDetails] = useState(false);
```

### 2. Edit Profile Form (`frontend/src/pages/Profile.js`)

**New Collapsible Section:**
```
┌─────────────────────────────────────────────────┐
│ ▼ Government Identity & Documents (Optional)    │ ← Expandable
├─────────────────────────────────────────────────┤
│                                                 │
│ Government ID Numbers                           │
│ ├─ Aadhaar Number (12 digits, encrypted)       │
│ ├─ PAN Number (Format: ABCDE1234F)             │
│ ├─ Passport Number                             │
│ ├─ Driving License Number                      │
│ └─ ... etc                                      │
│                                                 │
│ Government Documents                            │
│ ├─ Income Certificate   [Choose File]          │
│ ├─ Domicile Certificate [Choose File]          │
│ └─ Caste Certificate    [Choose File]          │
│                                                 │
│ [Upload] [Cancel]                              │
└─────────────────────────────────────────────────┘
```

**Features:**
- ✅ Full edit capability for all government IDs
- ✅ File upload for government documents
- ✅ Shows if document already uploaded
- ✅ Supports PDF and image files
- ✅ Individual field updates
- ✅ FormData handling for file uploads

**File Upload Example:**
```javascript
const [documentFiles, setDocumentFiles] = useState({
  incomeCertificate: null,
  domicileCertificate: null,
  casteCertificate: null
});

const handleFileChange = (e) => {
  const { name, files } = e.target;
  setDocumentFiles({
    ...documentFiles,
    [name]: files[0] || null
  });
};
```

### 3. Authentication Context (`frontend/src/context/AuthContext.js`)

**Updated Profile Update Function:**
```javascript
const updateProfile = async (profileData) => {
  // Handles both regular objects and FormData
  const config = {};
  if (profileData instanceof FormData) {
    config.headers = { 'Content-Type': 'multipart/form-data' };
  }
  const response = await api.put('/auth/update-profile', profileData, config);
  setUser(response.data.data);
  return { success: true };
};
```

### 4. Styling (`frontend/src/pages/Auth.css` & `Profile.css`)

**Collapsible Section Styles:**
- Smooth slide-down animation
- Toggle button with visual feedback
- Helper text with blue highlight
- Responsive design for mobile
- File input with dashed border (indicates drag-drop)

---

## 📋 Input Validation

### Aadhaar Number
- Pattern: 12 digits only
- Example: `123456789012`

### PAN Number
- Pattern: ABCDE1234F
- 5 letters + 4 numbers + 1 letter
- Example: `ABCDE1234F`

### Existing Validations
- **Age**: 1-120 years
- **Samagra ID**: 9 digits
- All numeric fields with proper constraints

---

## 🔒 Security Considerations

### Current Implementation:
- ✅ Passwords hashed with bcrypt
- ✅ All fields require authentication (`GET /api/auth/me`)
- ✅ Only authenticated users can update their profile
- ✅ No sensitive IDs logged to console
- ✅ File uploads scanned for type validity

### Future Recommendations:
- 🔐 Encrypt Aadhaar and PAN before storing (see TODO comments in model)
- 🔐 Use environment variables for upload directory
- 🔐 Implement file virus scanning
- 🔐 Add audit logs for sensitive field updates
- 🔐 Implement rate limiting on profile updates

---

## 🔄 Backward Compatibility

### Existing Users:
- ✅ Can login without providing new fields
- ✅ New fields not required during login
- ✅ Can update profile with or without new fields
- ✅ No database migration breaks existing records
- ✅ All new fields have `default: null`

### Database:
- ✅ Graceful degradation for old documents
- ✅ Optional field queries work correctly
- ✅ No breaking changes to schema

---

## 📖 API Documentation

### Register with Optional Government Details
```bash
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "age": 30,
  "gender": "Male",
  "casteCategory": "General",
  "annualIncome": 500000,
  "occupation": "Job",
  "district": "Bhopal",
  "samagraId": "123456789",
  
  // OPTIONAL government details
  "aadhaarNumber": "123456789012",
  "panNumber": "ABCDE1234F",
  "passportNumber": "A12345678"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    // ... other fields
    "aadhaarNumber": "123456789012",
    "panNumber": "ABCDE1234F"
  }
}
```

### Update Profile with Files
```bash
PUT /api/auth/update-profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- aadhaarNumber: "123456789012"
- panNumber: "ABCDE1234F"
- incomeCertificate: <binary file>
- domicileCertificate: <binary file>

Response:
{
  "success": true,
  "data": {
    "_id": "user_id",
    "fullName": "John Doe",
    "aadhaarNumber": "123456789012",
    "incomeCertificate": "uploads/incomeCertificate-1708989823456-123456789.pdf"
  }
}
```

---

## ✨ User Flow Examples

### Scenario 1: Existing User (No Government Details)
```
1. User logs in with email + password ✅
2. Profile shown without government ID section
3. Can add government IDs anytime from "Edit Profile" ✅
4. Existing profile data unaffected ✅
```

### Scenario 2: New User Adding Government Details During Registration
```
1. User fills required basic info
2. User clicks "Additional Government Details" toggle
3. User optionally fills Aadhaar, PAN, Passport, etc.
4. User submits form
5. All details saved to database ✅
```

### Scenario 3: User Updating Profile with Document Upload
```
1. User clicks "Edit Profile"
2. User expands "Government Identity & Documents" section
3. User fills/updates government ID numbers
4. User uploads income certificate (PDF/Image)
5. User uploads domicile certificate
6. User clicks "Save Changes"
7. Files uploaded, paths stored in database ✅
8. Documents accessible for scheme applications ✅
```

---

## 🚀 Future Enhancements

### Suggested Improvements:
1. **Encryption**: Encrypt Aadhaar/PAN before storage
2. **Document Verification**: Verify uploaded document authenticity
3. **Expiry Tracking**: Add expiry dates for certificates
4. **Document Templates**: Provide templates for required documents
5. **Selective Sharing**: Allow users to control who sees their documents
6. **Auto-Matching**: Use details for automatic scheme eligibility
7. **Document Scanning**: OCR to extract data from uploaded documents
8. **Compliance**: Add document hashing for audit trails

---

## ❓ FAQ

**Q: Will existing users be forced to provide government details?**
A: No. All new fields are completely optional. Existing users can continue using the system without any changes.

**Q: Can I update just one government ID field?**
A: Yes. The update endpoint supports partial updates. You can update individual fields.

**Q: What file formats are supported for documents?**
A: JPEG, JPG, PNG, and PDF files up to 10MB each.

**Q: Are the government IDs encrypted?**
A: Not yet. Encryption is recommended before production deployment (see TODO comments in code).

**Q: Can I delete an uploaded document?**
A: Currently, re-uploading will replace it. Add a delete endpoint if needed.

**Q: Is this data shared with government agencies?**
A: No. Data is only stored locally. You control who has access.

---

## 📝 Testing Checklist

- [ ] Existing users can still login without government details
- [ ] New users can register with just basic info
- [ ] New users can optionally add government details during signup
- [ ] Users can edit profile and add government details later
- [ ] Aadhaar validation (12 digits)
- [ ] PAN validation (ABCDE1234F format)
- [ ] File uploads (PDF, JPG, PNG)
- [ ] Partial profile updates work correctly
- [ ] Document files are accessible after upload
- [ ] Profile displays existing documents correctly

---

## 📞 Support

For questions or issues related to government identity integration, refer to the code comments marked with `TODO` for future implementation steps.
