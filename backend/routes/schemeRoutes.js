const express = require('express');
const router = express.Router();
const {
  getAllSchemes,
  getSchemeById,
  resolveSchemeId,
  getEligibleSchemes,
  getUnclaimedSchemes,
  getSchemesByLifeEvent,
  checkSchemeDocuments,
  createScheme,
  updateScheme,
  deleteScheme,
  chatAboutScheme,
  predictApproval
} = require('../controllers/schemeController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllSchemes);
router.get('/resolve/:schemeId', resolveSchemeId);
router.get('/life-event/:event', getSchemesByLifeEvent);

// Protected named routes — must come BEFORE /:id wildcard
router.get('/eligible/me', protect, getEligibleSchemes);
router.get('/unclaimed/me', protect, getUnclaimedSchemes);

// Wildcard routes
router.post('/:id/predict-approval', protect, predictApproval);
router.post('/:id/chat', chatAboutScheme);
router.get('/:id/check-documents', protect, checkSchemeDocuments);
router.get('/:id', getSchemeById);

// Admin routes
router.post('/', protect, authorize('Admin'), createScheme);
router.put('/:id', protect, authorize('Admin'), updateScheme);
router.delete('/:id', protect, authorize('Admin'), deleteScheme);

module.exports = router;
