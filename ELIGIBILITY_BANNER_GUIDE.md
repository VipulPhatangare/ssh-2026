# Scheme Eligibility Banner System

## Overview

The scheme eligibility banner system provides transparent, contextual feedback to users about their eligibility for specific government schemes. It displays three distinct states with clear visual indicators and actionable information.

## Implementation Details

### Component Location
- **Component File**: `frontend/src/pages/SchemeDetails.js`
- **Styles File**: `frontend/src/pages/SchemeDetails.css`

### Three-State Banner System

#### 1. **Green Banner - Fully Eligible** ✓
**Condition**: User meets all eligibility criteria AND has all required documents

**Display**:
- Icon: ✓ (checkmark)
- Color: Green gradient background (#d4edda to #e8f5e9)
- Title: "You Meet All Requirements" (translatable)
- Description: Confirms they meet all criteria and have required documents, ready to apply

**Example**:
```
✓ You Meet All Requirements
You meet all eligibility criteria and have all required documents. You can apply for this scheme now.
```

---

#### 2. **Yellow Banner - Eligible but Missing Documents** ⚠
**Condition**: User meets core eligibility conditions BUT is missing required documents

**Display**:
- Icon: ⚠ (warning sign)
- Color: Yellow/amber gradient background (#fff3cd to #fffaf0)
- Title: "Missing Documents" (translatable)
- Description: Clearly states they're eligible but need to upload documents
- Document List: Shows each missing document with 📄 icon
- CTA: Encourages uploading/obtaining documents

**Example**:
```
⚠ Missing Documents
You meet the eligibility criteria, but you need to upload the following documents to proceed:

📄 Aadhar Card
📄 Income Certificate
📄 Caste Certificate

Please upload or obtain these documents to complete your eligibility for this scheme.
```

---

#### 3. **Red Banner - Not Eligible** ✗
**Condition**: User fails one or more core eligibility conditions

**Display**:
- Icon: ✗ (cross mark)
- Color: Red gradient background (#f8d7da to #ffebee)
- Title: "Not Eligible" (translatable)
- Description: Explains they don't meet eligibility criteria
- Condition List: Shows each failed condition with • bullet

**Example**:
```
✗ Not Eligible
Unfortunately, you do not meet the following eligibility criteria:

• Age must be between 18-35 years (Your age: 42 years)
• Annual income must not exceed ₹3,00,000 (Your income: ₹4,50,000)
• Caste category: Must belong to OBC/SC/ST (Your category: General)
```

---

## Backend API Contract

The system expects the eligibility check endpoint to return structured data:

### API Endpoint
```
GET /schemes/check/{schemeId}/{userId}
```

### Response Format

#### 1. Fully Eligible Response
```json
{
  "eligible": true,
  "failedConditions": [],
  "missingDocs": []
}
```

#### 2. Eligible but Missing Documents Response
```json
{
  "eligible": false,
  "failedConditions": [],
  "missingDocs": [
    "Aadhar Card",
    "Income Certificate",
    "Caste Certificate"
  ]
}
```

#### 3. Not Eligible Response
```json
{
  "eligible": false,
  "failedConditions": [
    "Age must be between 18-35 years (Your age: 42 years)",
    "Annual income must not exceed ₹3,00,000 (Your income: ₹4,50,000)",
    "Caste category: Must belong to OBC/SC/ST (Your category: General)"
  ],
  "missingDocs": []
}
```

---

## Frontend Logic Flow

```
User loads scheme detail page
       ↓
Component fetches eligibility data
       ↓
getEligibilityBannerState() evaluates response
       ↓
┌─────────────────────────────────────┐
│  Check: eligibility.eligible?       │
└─────────────────────────────────────┘
  YES ↓                          NO ↓
  ┌──────────────────┐    ┌──────────────────────────────┐
  │ GREEN BANNER     │    │ Check: missingDocs.length>0  │
  │ Fully Eligible   │    │ AND failedConditions.empty?  │
  └──────────────────┘    └──────────────────────────────┘
                            YES ↓                    NO ↓
                          ┌─────────────────┐  ┌──────────────────┐
                          │ YELLOW BANNER   │  │ RED BANNER       │
                          │ Missing Docs    │  │ Not Eligible     │
                          └─────────────────┘  └──────────────────┘
```

---

## Key Features

✅ **Three Distinct States**
- Clear visual differentiation using colors and icons
- Appropriate messaging for each scenario

✅ **Transparent Decision-Making**
- Specific reasons listed instead of generic messages
- Explains what needs to be done (upload docs) or why (failed conditions)

✅ **User-Friendly Design**
- Icons for quick recognition (✓, ⚠, ✗)
- Icons for document items (📄)
- Smooth animations (slideDown effect)
- Responsive layout with gradient backgrounds

✅ **Internationalization Support**
- All text uses translation keys (t() function)
- Fallback text provided in English
- Keys used:
  - `fullyEligible`
  - `fullyEligibleDesc`
  - `missingDocuments`
  - `missingDocsDesc`
  - `notEligible`
  - `notEligibleDesc`
  - `uploadDocsEncouragement`

✅ **Comprehensive Styling**
- Gradient backgrounds for visual appeal
- Left border accent color matching state
- Proper spacing and typography
- Responsive design

---

## Integration Points

### 1. Backend Service
Implement the `/schemes/check/{schemeId}/{userId}` endpoint that:
- Retrieves user profile data
- Retrieves scheme eligibility criteria
- Compares structured data
- Generates clear, human-readable reasons for failures

### 2. User Profile Data Structure (Expected)
```javascript
{
  id: string,
  age: number,
  gender: string,
  income: number,
  caste: string,
  occupation: string,
  uploadedDocuments: string[] // Array of document names
}
```

### 3. Scheme Eligibility Criteria (Expected)
```javascript
{
  id: string,
  requiredDocuments: string[],
  eligibility: {
    ageMin: number,
    ageMax: number,
    gender: string,
    incomeMax: number,
    casteCategories: string[],
    occupations: string[]
  }
}
```

---

## Styling Reference

### CSS Classes

| Class | Purpose |
|-------|---------|
| `.eligibility-banner` | Main banner container |
| `.eligibility-fully-eligible` | Green state styling |
| `.eligibility-missing-docs` | Yellow/warning state styling |
| `.eligibility-not-eligible` | Red state styling |
| `.banner-header` | Container for icon + title + description |
| `.banner-icon` | Icon display (✓, ⚠, ✗) |
| `.banner-content` | Title + description container |
| `.banner-title` | State title text |
| `.banner-description` | Explanation text |
| `.banner-items` | Container for list of items |
| `.items-list` | Actual list element |
| `.item` | Individual list item |
| `.item-document` | Document-type item styling |
| `.item-condition` | Condition-type item styling |
| `.item-icon` | Icon in list item |
| `.item-text` | Text in list item |
| `.banner-cta` | Call-to-action section |
| `.cta-text` | CTA message text |

---

## Translation Keys Required

Add these keys to your translation files (`locales/en/translation.json` and `locales/hi/translation.json`):

```json
{
  "fullyEligible": "You Meet All Requirements",
  "fullyEligibleDesc": "You meet all eligibility criteria and have all required documents. You can apply for this scheme now.",
  "missingDocuments": "Missing Documents",
  "missingDocsDesc": "You meet the eligibility criteria, but you need to upload the following documents to proceed:",
  "notEligible": "Not Eligible",
  "notEligibleDesc": "Unfortunately, you do not meet the following eligibility criteria:",
  "uploadDocsEncouragement": "Please upload or obtain these documents to complete your eligibility for this scheme."
}
```

---

## Error Handling

- If eligibility check fails: Banner is not displayed (silent failure)
- If eligibility data is missing/null: Banner is not displayed
- User can still view scheme details and apply even if banner is not shown

---

## Future Enhancements

1. **Document Upload Integration**: Add "Upload Now" button in missing documents banner
2. **Appeal Process**: Add option to appeal rejection for not-eligible cases
3. **Detailed Explanations**: Add expandable sections for complex criteria
4. **Progress Tracking**: Show which documents have been uploaded
5. **Email Notifications**: Notify when missing documents are ready to upload
6. **Batch Eligibility Check**: Check eligibility for multiple schemes at once

