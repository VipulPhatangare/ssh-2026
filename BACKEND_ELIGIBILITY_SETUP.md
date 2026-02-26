# Backend Setup for Eligibility Banners

## Summary of Changes

The backend has been updated to support eligibility checking. Here's what was added:

### 1. **New API Endpoint**
```
GET /api/schemes/check/:schemeId/:userId
```

**Purpose**: Returns eligibility status for a specific user and scheme

**Response Format**:
```json
{
  "schemeId": "scheme123",
  "schemeName": "Prime Minister Scheme XYZ",
  "eligible": false,
  "failedConditions": [
    "Age must be between 18-35 years (Your age: 42 years)",
    "Annual income must not exceed ₹3,00,000 (Your income: ₹4,50,000)"
  ],
  "missingDocs": [
    "Aadhar Card",
    "Income Certificate"
  ]
}
```

### 2. **Updated Eligibility Logic**
The `checkEligibilityLogic()` function now:
- Uses correct User model field names (`annualIncome`, `casteCategory`)
- Provides detailed, user-friendly error messages
- Shows user's actual values vs. required values
- Handles optional eligibility criteria gracefully

### 3. **Data Requirements**

For the banners to work, you need:

#### ✅ User Profile Data
Each user must have these fields filled:
```javascript
{
  age: Number,
  gender: String (Male/Female/Other),
  casteCategory: String (General/OBC/SC/ST/EWS),
  annualIncome: Number,
  occupation: String (Student/Farmer/Business/Job/Unemployed/Self-Employed/Retired/Other),
  documentsUploaded: Array of document names (optional)
}
```

#### ✅ Scheme Data
Each scheme must have these fields:
```javascript
{
  name: String,
  eligibility: {
    ageMin: Number,
    ageMax: Number,
    incomeMax: Number,
    casteCategories: [String],
    gender: [String],
    occupations: [String]
  },
  requiredDocuments: [String]
}
```

## How to Test the System

### Step 1: Ensure User Has Complete Profile

Make sure your test user has all profile data filled. Check the database:

```javascript
// MongoDB
db.users.findOne({ email: "test@example.com" })

// Should show:
{
  fullName: "John Doe",
  email: "test@example.com",
  age: 25,
  gender: "Male",
  casteCategory: "OBC",
  annualIncome: 250000,
  occupation: "Student",
  district: "Bhopal",
  // ... other fields
}
```

If any fields are missing, update the user:
```javascript
db.users.updateOne(
  { email: "test@example.com" },
  { $set: { age: 25, gender: "Male", casteCategory: "OBC", annualIncome: 250000, occupation: "Student" } }
)
```

### Step 2: Ensure Schemes Have Eligibility Data

Check your schemes in database:

```javascript
// MongoDB
db.schemes.findOne({ name: "Your Scheme Name" })

// Should show eligibility criteria:
{
  name: "Prime Minister Scheme",
  eligibility: {
    ageMin: 18,
    ageMax: 35,
    incomeMax: 300000,
    casteCategories: ["OBC", "SC", "ST"],
    gender: ["Male", "Female"],
    occupations: ["Student", "Farmer"]
  },
  requiredDocuments: ["Aadhar Card", "Income Certificate"],
  // ... other fields
}
```

If schemes don't have eligibility data, update them:

```javascript
db.schemes.updateOne(
  { name: "Your Scheme" },
  { $set: { 
    "eligibility.ageMin": 18,
    "eligibility.ageMax": 35,
    "eligibility.incomeMax": 300000,
    "eligibility.casteCategories": ["OBC", "SC", "ST"],
    "eligibility.gender": ["Male", "Female"],
    "eligibility.occupations": ["Student", "Farmer"],
    requiredDocuments: ["Aadhar Card", "Income Certificate"]
  }}
)
```

### Step 3: Test the API Endpoint

Use Postman or curl to test:

```bash
curl -X GET "http://localhost:5000/api/schemes/check/{schemeId}/{userId}"
```

Replace `{schemeId}` and `{userId}` with actual MongoDB ObjectIds.

**Example Response (User is eligible)**:
```json
{
  "schemeId": "507f1f77bcf86cd799439011",
  "schemeName": "Prime Minister Scheme",
  "eligible": true,
  "failedConditions": [],
  "missingDocs": []
}
```

**Example Response (User is eligible but missing docs)**:
```json
{
  "schemeId": "507f1f77bcf86cd799439011",
  "schemeName": "Prime Minister Scheme",
  "eligible": false,
  "failedConditions": [],
  "missingDocs": ["Aadhar Card", "Income Certificate"]
}
```

**Example Response (User is not eligible)**:
```json
{
  "schemeId": "507f1f77bcf86cd799439011",
  "schemeName": "Prime Minister Scheme",
  "eligible": false,
  "failedConditions": [
    "Age must be between 18-35 years (Your age: 42 years)",
    "Annual income must not exceed ₹300000 (Your income: 450000)"
  ],
  "missingDocs": []
}
```

### Step 4: Test on Frontend

1. Log in with your test user
2. Go to Scheme Explorer page
3. You should see colored banners on each scheme card:
   - 🟢 Green: "✓ You are eligible"
   - 🟡 Yellow: "⚠ Missing documents"
   - 🔴 Red: "✗ Not eligible"

## Sample Data

### Sample User (Eligible for some schemes)
```javascript
{
  fullName: "Ram Kumar",
  email: "ram@example.com",
  age: 28,
  gender: "Male",
  casteCategory: "OBC",
  annualIncome: 280000,
  occupation: "Farmer",
  district: "Bhopal"
}
```

### Sample Scheme 1 (This user should be eligible)
```javascript
{
  name: "Farmer Income Support Scheme",
  schemeId: "scheme_001",
  description: "Monthly income support for farmers",
  department: "Agriculture",
  eligibility: {
    ageMin: 18,
    ageMax: 65,
    incomeMax: 500000,
    casteCategories: [],
    gender: [],
    occupations: ["Farmer"]
  },
  requiredDocuments: ["Land Certificate", "Aadhar Card"],
  benefits: "₹500 monthly"
}
```

### Sample Scheme 2 (This user should be NOT eligible - age)
```javascript
{
  name: "Youth Employment Scheme",
  schemeId: "scheme_002",
  description: "For young job seekers",
  department: "Employment",
  eligibility: {
    ageMin: 18,
    ageMax: 25,
    incomeMax: null,
    casteCategories: [],
    gender: [],
    occupations: []
  },
  requiredDocuments: ["Degree Certificate"],
  benefits: "Job placement assistance"
}
```

### Sample Scheme 3 (This user should be eligible but missing docs)
```javascript
{
  name: "OBC Welfare Scheme",
  schemeId: "scheme_003",
  description: "Special benefits for OBC category",
  department: "Social Welfare",
  eligibility: {
    ageMin: 0,
    ageMax: 120,
    incomeMax: null,
    casteCategories: ["OBC", "SC", "ST"],
    gender: [],
    occupations: []
  },
  requiredDocuments: ["Caste Certificate", "Aadhar Card"],
  benefits: "Educational scholarships"
}
```

## Files Modified

1. **backend/controllers/schemeController.js**
   - Updated `checkEligibilityLogic()` with correct field names and detailed messages
   - Added `checkSchemeEligibility()` function

2. **backend/routes/schemeRoutes.js**
   - Added import for `checkSchemeEligibility`
   - Added route: `GET /api/schemes/check/:schemeId/:userId`

## Troubleshooting

### Banners Still Not Showing

**Check 1: Is the API endpoint working?**
```bash
curl -X GET "http://localhost:5000/api/schemes/check/{schemeId}/{userId}"
```
Should return JSON with `eligible`, `failedConditions`, `missingDocs`

**Check 2: Do users have complete profile data?**
```javascript
// MongoDB console
db.users.findOne().pretty()
// Look for: age, gender, casteCategory, annualIncome, occupation
```

**Check 3: Do schemes have eligibility data?**
```javascript
// MongoDB console
db.schemes.findOne().pretty()
// Look for: eligibility object with criteria
```

**Check 4: Browser Console Errors**
Open F12 → Console and look for errors in network requests

### Wrong Messages Showing

If messages don't match your criteria, check:
1. Field names in User model match code (use `annualIncome`, not `income`)
2. Field names in Scheme eligibility match code
3. Data types are correct (age should be Number, not String)

## Next Steps

1. Update your test users with complete profile information
2. Update your schemes with eligibility criteria
3. Test the API endpoint to verify responses
4. Log in and check the frontend - banners should now appear!

