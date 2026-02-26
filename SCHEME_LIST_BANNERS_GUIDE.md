# Scheme List Eligibility Banners Implementation

## Overview

The eligibility banner system has been extended to the **Scheme Explorer** (listing page) to show at-a-glance eligibility status for each scheme card.

## What's New

Users can now see a color-coded banner above each scheme indicating their eligibility status **without** needing to click on the scheme details.

### Three Banner States

1. **Green Banner** - "✓ You are eligible"
   - User meets all criteria and has all documents
   - Can apply immediately

2. **Yellow Banner** - "⚠ Missing documents"
   - User is eligible but missing required documents
   - Needs to upload documents before applying

3. **Red Banner** - "✗ Not eligible"
   - User does not meet eligibility criteria
   - Cannot apply for this scheme

## Files Modified

### Frontend Components

1. **`frontend/src/pages/SchemeExplorer.js`**
   - Added `useContext` and `AuthContext` import
   - Added `eligibilityMap` state to store eligibility for all schemes
   - Added `fetchAllEligibilities()` function to fetch eligibility for multiple schemes in parallel
   - Added `getEligibilityBannerType()` helper function
   - Updated JSX to render eligibility banners on each scheme card

2. **`frontend/src/pages/SchemeExplorer.css`**
   - Added `.scheme-card-banner` styling
   - Added `.banner-fully-eligible` (green gradient)
   - Added `.banner-missing-docs` (yellow gradient)
   - Added `.banner-not-eligible` (red gradient)
   - Added `.banner-content-compact` for compact banner layout
   - Updated `.scheme-card` to use `overflow: hidden` for proper border-radius
   - Updated `.scheme-header` with padding

## How It Works

### Data Flow

```
User loads SchemeExplorer page
       ↓
fetchSchemes() loads all schemes
       ↓
useEffect detects schemes are loaded
       ↓
fetchAllEligibilities() called if user is logged in
       ↓
Parallel API calls to /schemes/check/{schemeId}/{userId}
       ↓
Results stored in eligibilityMap
       ↓
Each scheme card renders appropriate banner
```

### Component Logic

```javascript
// Helper function determines banner type
getEligibilityBannerType(schemeId) {
  if (eligible) return 'fully-eligible'
  if (missing docs only) return 'missing-docs'
  if (failed conditions) return 'not-eligible'
  return null // No banner
}

// In render:
const bannerType = getEligibilityBannerType(scheme._id)
// Conditionally render banner with appropriate styling
```

## Visual Design

### Banner Styling

- **Height**: ~12px padding top/bottom
- **Font Size**: 13px (compact)
- **Colors**:
  - Green: `#d4edda` → `#e8f5e9`
  - Yellow: `#fff3cd` → `#fffaf0`
  - Red: `#f8d7da` → `#ffebee`
- **Bottom Border**: 2px solid (matching state color)
- **Icons**: Emoji icons for quick visual recognition
  - ✓ = Green
  - ⚠ = Yellow
  - ✗ = Red

### Responsive Behavior

- Banners appear above scheme card content
- Full width of card
- Text truncates on smaller screens (flex layout handles responsiveness)
- Hover effect on card body still works (card lifts slightly)

## API Integration

### Expected Backend Endpoint

```
GET /schemes/check/{schemeId}/{userId}
```

### Response Format

```json
{
  "eligible": true/false,
  "failedConditions": ["Reason 1", "Reason 2"],
  "missingDocs": ["Document 1", "Document 2"]
}
```

### Performance Optimization

- Uses `Promise.all()` to fetch eligibility for all schemes in parallel
- Stores results in `eligibilityMap` for efficient lookup
- Only runs when user is logged in (`user?.id` check)
- Gracefully handles failures (silently marks scheme as no banner)

## User Experience

### Logged-In User

- ✅ Sees banners on all scheme cards
- ✅ Can quickly identify eligible schemes
- ✅ Knows which schemes need documents
- ✅ Understands why ineligible schemes can't be applied to

### Not Logged-In User

- ✅ No banners shown (no user context)
- ✅ Can still view all schemes
- ✅ Encouraged to log in to see eligibility info

## Browser Console Debugging

If banners aren't appearing, check browser console (F12) for:

```javascript
// Expected logs:
"Error fetching eligibility for scheme {schemeId}: [error]"
"Error fetching eligibilities: [error]"
```

## CSS Classes Reference

| Class | Purpose |
|-------|---------|
| `.scheme-card` | Main card container with overflow:hidden |
| `.scheme-card-banner` | Banner container |
| `.banner-fully-eligible` | Green state styling |
| `.banner-missing-docs` | Yellow state styling |
| `.banner-not-eligible` | Red state styling |
| `.banner-content-compact` | Layout for icon + text |
| `.scheme-header` | Card content area with padding |

## Future Enhancements

1. **Click to Expand**: Click banner to see detailed reasons
2. **Document Upload**: Direct upload from banner for missing-docs state
3. **Animations**: Fade in banners as data loads
4. **Caching**: Cache eligibility results to reduce API calls
5. **Real-time Updates**: Refresh banners when user uploads documents
6. **Bulk Actions**: Filter/sort by eligibility state

## Troubleshooting

### Banners Not Showing

**Possible Causes:**
- User not logged in → Check AuthContext
- API endpoint not implemented → Check backend
- Network error → Check browser console
- Wrong scheme ID format → Verify scheme._id exists

**Debug Steps:**
1. Open DevTools (F12)
2. Check Network tab for `/schemes/check/` requests
3. Look for errors in Console tab
4. Verify user is logged in (AuthContext)

### Performance Issues

**If page loads slowly:**
- Check number of schemes (> 100 may need pagination)
- Monitor API response times
- Consider adding loading skeleton for banners
- Implement result caching

### Styling Issues

**If banners look wrong:**
- Check `.scheme-card` has `overflow: hidden`
- Verify gradient syntax in banner classes
- Check z-index if banner is hidden behind content
- Test in different browsers

## Code Examples

### Checking if specific scheme is eligible

```javascript
const isEligible = eligibilityMap[schemeId]?.eligible === true;
const hasMissingDocs = eligibilityMap[schemeId]?.missingDocs?.length > 0;
const notEligible = eligibilityMap[schemeId]?.failedConditions?.length > 0;
```

### Adding custom logic based on banner type

```javascript
const bannerType = getEligibilityBannerType(schemeId);

if (bannerType === 'missing-docs') {
  // Maybe show "Upload Documents" button
  // Redirect to profile/documents page
}

if (bannerType === 'fully-eligible') {
  // Maybe highlight the scheme
  // Show "Apply Now" CTA
}
```

