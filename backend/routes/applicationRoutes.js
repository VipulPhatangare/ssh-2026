const express = require('express');
const router = express.Router();
const {
  createApplication,
  getMyApplications,
  getApplicationById,
  getAllApplications,
  updateApplicationStatus,
  getApplicationStats
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createApplication);
router.get('/my-applications', protect, getMyApplications);
router.get('/stats/overview', protect, authorize('Admin'), getApplicationStats);
router.get('/:id', protect, getApplicationById);

// Admin routes
router.get('/', protect, authorize('Admin'), getAllApplications);
router.put('/:id/status', protect, authorize('Admin'), updateApplicationStatus);

module.exports = router;
