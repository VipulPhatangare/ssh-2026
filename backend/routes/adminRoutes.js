const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getUserById
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('Admin'), getDashboardStats);
router.get('/users', protect, authorize('Admin'), getAllUsers);
router.get('/users/:id', protect, authorize('Admin'), getUserById);

module.exports = router;
