const express = require('express');
const router = express.Router();
const {
  getAllSchemes,
  getSchemeById,
  getEligibleSchemes,
  getUnclaimedSchemes,
  getSchemesByLifeEvent,
  checkSchemeDocuments,
  checkSchemeEligibility,
  createScheme,
  updateScheme,
  deleteScheme,
  chatAboutScheme
} = require('../controllers/schemeController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllSchemes);
router.get('/life-event/:event', getSchemesByLifeEvent);
router.get('/check/:schemeId/:userId', checkSchemeEligibility);
router.post('/:id/chat', chatAboutScheme);
router.get('/:id', getSchemeById);

// Protected routes
router.get('/eligible/me', protect, getEligibleSchemes);
router.get('/unclaimed/me', protect, getUnclaimedSchemes);
router.get('/:id/check-documents', protect, checkSchemeDocuments);

// Admin routes
router.post('/', protect, authorize('Admin'), createScheme);
router.put('/:id', protect, authorize('Admin'), updateScheme);
router.delete('/:id', protect, authorize('Admin'), deleteScheme);

module.exports = router;
