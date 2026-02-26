# Government ID Field Validation Reference

## Overview
This file provides validation patterns, examples, and test cases for government ID fields.

---

## ✅ Aadhaar Number Validation

### Rules
- **Length**: Exactly 12 digits
- **Format**: Numeric only
- **Pattern**: `/^\d{12}$/`
- **No Spaces or Special Characters**

### Valid Examples
```
123456789012
987654321098
500000000001
```

### Invalid Examples
```
12345678901     (only 11 digits)
1234567890123   (13 digits)
123456789012X   (contains letter)
123 456 789 012 (contains spaces)
1234-5678-9012  (contains hyphens)
```

### Implementation
```javascript
// Mongoose Schema Validation
aadhaarNumber: {
  type: String,
  default: null,
  validate: {
    validator: function(v) {
      if (!v) return true;  // Optional field
      return /^\d{12}$/.test(v);
    },
    message: 'Aadhaar number must be 12 digits'
  }
}

// HTML5 Input Pattern
<input
  type="text"
  name="aadhaarNumber"
  pattern="[0-9]{12}"
  placeholder="123456789012"
  maxlength="12"
/>
```

### Test Cases
```javascript
const testAadhaar = (value) => /^\d{12}$/.test(value);

console.log(testAadhaar('123456789012')); // ✅ true
console.log(testAadhaar('12345678901'));  // ❌ false (11 digits)
console.log(testAadhaar('1234567890123')); // ❌ false (13 digits)
console.log(testAadhaar('12345678901A')); // ❌ false (contains letter)
console.log(testAadhaar('123 456 789 012')); // ❌ false (contains spaces)
```

---

## ✅ PAN Number Validation

### Rules
- **Format**: ABCDE1234F
  - First 5 characters: Uppercase letters (A-Z)
  - Next 4 characters: Digits (0-9)
  - Last character: Uppercase letter (A-Z)
- **Total Length**: 10 characters
- **Case Sensitive**: Must be uppercase
- **Pattern**: `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/`

### Valid Examples
```
ABCDE1234F
XYZAB5678K
AAAPA1234D
MMMMA0000Z
```

### Invalid Examples
```
abcde1234f     (lowercase)
ABCDE1234      (missing last letter)
ABCD1234F      (only 4 letters at start)
ABCDE12345F    (5 digits in middle)
ABCDE-1234-F   (contains hyphens)
ABCDE 1234 F   (contains spaces)
```

### Implementation
```javascript
// Mongoose Schema Validation
panNumber: {
  type: String,
  default: null,
  validate: {
    validator: function(v) {
      if (!v) return true;  // Optional field
      // Ensure uppercase
      return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
    },
    message: 'PAN must be in format: ABCDE1234F'
  }
}

// HTML5 Input Pattern
<input
  type="text"
  name="panNumber"
  pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
  placeholder="ABCDE1234F"
  maxlength="10"
  style="text-transform: uppercase"
/>

// Auto-convert to uppercase
const handlePANChange = (value) => {
  return value.toUpperCase();
}
```

### Test Cases
```javascript
const testPAN = (value) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);

console.log(testPAN('ABCDE1234F')); // ✅ true
console.log(testPAN('abcde1234f')); // ❌ false (lowercase)
console.log(testPAN('ABCDE1234')); // ❌ false (missing letter)
console.log(testPAN('ABCD1234F')); // ❌ false (4 letters)
console.log(testPAN('ABCDE12345F')); // ❌ false (5 digits)
console.log(testPAN('ABCDE-1234-F')); // ❌ false (hyphens)
console.log(testPAN('XYZAB5678K')); // ✅ true
```

### PAN Parts Breakdown
```
XYZAB5678K
│ │ │ │ │ └─ Last Char (Letter): K
│ │ │ │ └──── Middle (4 digits): 5678
│ │ │ └────── Start (5 letters): XYZAB

Example:
X = First Initial
Y = First letter of father's name
Z = First letter of surname
AB = Sequence number
5678 = Year of allotment
K = Check digit
```

---

## ✅ Samagra ID Validation

### Rules
- **Length**: Exactly 9 digits
- **Format**: Numeric only
- **Pattern**: `/^\d{9}$/`
- **Note**: Used in Madhya Pradesh

### Valid Examples
```
123456789
987654321
500000001
```

### Invalid Examples
```
12345678  (8 digits)
1234567890  (10 digits)
12345678X  (contains letter)
```

### Implementation
```javascript
samagraId: {
  type: String,
  default: null,
  validate: {
    validator: function(v) {
      if (!v) return true;
      return /^\d{9}$/.test(v);
    },
    message: 'Samagra ID must be 9 digits'
  }
}

<input
  type="text"
  name="samagraId"
  pattern="[0-9]{9}"
  placeholder="123456789"
  maxlength="9"
/>
```

---

## 📝 Other Government ID Fields

### Passport Number
- **Format**: Variable (country-specific)
- **Example**: A12345678 (Indian format)
- **No strict validation needed** - stores as string

### Driving License Number
- **Format**: Variable (state-specific)
- **Example**: MH01AB1234567 (Maharashtra format)
- **No strict validation needed** - stores as string

### Voter ID Number
- **Format**: Variable
- **Example**: ABC1234567D (Indian format)
- **No strict validation needed** - stores as string

### Ration Card Number
- **Format**: Variable
- **Example**: 12AB3456 (variable state format)
- **No strict validation needed** - stores as string

### Government Employee ID
- **Format**: Organization-specific
- **No validation needed** - stores as string

---

## 📁 File Upload Validation

### Supported Formats
```
Images: JPG, JPEG, PNG
Documents: PDF
Max Size: 10MB per file
```

### Validation Code
```javascript
// Backend Multer Configuration
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf'
  ];
  
  // Allowed extensions
  const allowedExtensions = /jpeg|jpg|png|pdf/;
  
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  
  const isValidExt = allowedExtensions.test(ext);
  const isValidMime = allowedMimes.includes(mime);
  
  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
});

// Frontend Input
<input
  type="file"
  name="incomeCertificate"
  accept="image/*,.pdf"
  accept=".jpg,.jpeg,.png,.pdf"
/>
```

### File Size Limits
```javascript
// Max 10MB per file
const maxFileSize = 10 * 1024 * 1024; // bytes

// Validation
if (file.size > maxFileSize) {
  throw new Error('File size must be less than 10MB');
}
```

### Test Cases
```javascript
// Valid files
✅ document.pdf (5MB)
✅ certificate.jpg (2MB)
✅ photo.png (1MB)
✅ identity.jpeg (3MB)

// Invalid files
❌ document.docx (unsupported format)
❌ certificate.gif (unsupported format)
❌ photo.jpg (15MB - exceeds limit)
❌ video.mp4 (unsupported format)
```

---

## 🔍 Complete Validation Function

```javascript
// Frontend Validation Example
const validateGovernmentID = (type, value) => {
  if (!value) return true; // Optional field
  
  switch(type) {
    case 'aadhaar':
      return /^\d{12}$/.test(value);
    
    case 'pan':
      return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
    
    case 'samagra':
      return /^\d{9}$/.test(value);
    
    case 'passport':
    case 'drivingLicense':
    case 'voterId':
    case 'rationCard':
    case 'employeeId':
      return value.trim().length > 0;
    
    default:
      return false;
  }
};

// Usage
const isValid = validateGovernmentID('aadhaar', '123456789012');
const isPANValid = validateGovernmentID('pan', 'ABCDE1234F');
```

---

## 🧪 Test Suite

```javascript
describe('Government ID Validation', () => {
  
  describe('Aadhaar Number', () => {
    test('accepts valid 12-digit numbers', () => {
      expect(validateAadhaar('123456789012')).toBe(true);
    });
    
    test('rejects non-numeric input', () => {
      expect(validateAadhaar('12345678901A')).toBe(false);
    });
    
    test('rejects incorrect length', () => {
      expect(validateAadhaar('1234567890')).toBe(false);
    });
    
    test('accepts empty (optional field)', () => {
      expect(validateAadhaar('')).toBe(true);
    });
  });
  
  describe('PAN Number', () => {
    test('accepts valid PAN format', () => {
      expect(validatePAN('ABCDE1234F')).toBe(true);
    });
    
    test('rejects lowercase', () => {
      expect(validatePAN('abcde1234f')).toBe(false);
    });
    
    test('rejects incorrect format', () => {
      expect(validatePAN('ABCD1234F')).toBe(false);
    });
  });
  
  describe('File Uploads', () => {
    test('accepts PDF files', () => {
      expect(validateFileType('document.pdf')).toBe(true);
    });
    
    test('accepts JPEG files', () => {
      expect(validateFileType('photo.jpg')).toBe(true);
    });
    
    test('rejects unsupported formats', () => {
      expect(validateFileType('document.docx')).toBe(false);
    });
  });
});
```

---

## 🛡️ Security Validation

### Input Sanitization
```javascript
// Remove any suspicious characters
const sanitizeID = (value) => {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '') // Remove special chars
    .toUpperCase(); // Normalize case
};

// Usage
const cleanPAN = sanitizeID('ABCDE-1234-F');
// Result: 'ABCDE1234F'
```

### SQL Injection Prevention
```javascript
// Never concatenate user input
// ❌ WRONG
db.query(`SELECT * FROM users WHERE aadhaar = '${input}'`);

// ✅ CORRECT - Use parameterized queries
db.query('SELECT * FROM users WHERE aadhaar = ?', [input]);

// ✅ CORRECT - Use Mongoose (handles sanitization)
User.findOne({ aadhaarNumber: input });
```

---

## 📋 Checklist for Implementation

- [ ] Aadhaar: 12 digits only
- [ ] PAN: ABCDE1234F format (uppercase)
- [ ] Samagra: 9 digits only
- [ ] File uploads: PDF, JPG, PNG, max 10MB
- [ ] Optional fields handling
- [ ] Validation on both frontend and backend
- [ ] Error messages to user
- [ ] Sanitization of input
- [ ] No sensitive data logging
- [ ] Test all validation rules

---

## 🔗 References

- Aadhaar: https://uidai.gov.in/
- PAN: https://www.incometax.gov.in/
- Samagra: https://samagra.mp.gov.in/
- File validation: OWASP guidelines

---

**Note**: This is a reference guide. Always implement validation on both frontend (UX) and backend (security).
