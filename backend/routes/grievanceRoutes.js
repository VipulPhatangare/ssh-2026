const express = require('express');
const router = express.Router();
const {
  createGrievance,
  getMyGrievances,
  getGrievanceById,
  getAllGrievances,
  updateGrievanceStatus,
  addGrievanceResponse,
  getPendingGrievances
} = require('../controllers/grievanceController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createGrievance);
router.get('/my-grievances', protect, getMyGrievances);
router.get('/:id', protect, getGrievanceById);

// Admin routes
router.get('/', protect, authorize('Admin'), getAllGrievances);
router.get('/pending/all', protect, authorize('Admin'), getPendingGrievances);
router.put('/:id/status', protect, authorize('Admin'), updateGrievanceStatus);
router.post('/:id/response', protect, authorize('Admin'), addGrievanceResponse);

module.exports = router;
