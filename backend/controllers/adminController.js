const User = require('../models/User');
const Application = require('../models/Application');
const Grievance = require('../models/Grievance');
const Scheme = require('../models/Scheme');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'Citizen' });
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'Pending' });
    const approvedApplications = await Application.countDocuments({ status: 'Approved' });
    const totalSchemes = await Scheme.countDocuments({ isActive: true });
    const totalGrievances = await Grievance.countDocuments();
    const pendingGrievances = await Grievance.countDocuments({ 
      status: { $in: ['Open', 'In Progress', 'Escalated'] } 
    });

    // Applications by status
    const applicationsByStatus = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Applications by scheme
    const topSchemes = await Application.aggregate([
      {
        $group: {
          _id: '$schemeId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'schemes',
          localField: '_id',
          foreignField: '_id',
          as: 'scheme'
        }
      }
    ]);

    // Recent applications
    const recentApplications = await Application.find()
      .populate('userId', 'fullName email')
      .populate('schemeId', 'name')
      .sort({ submissionDate: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalApplications,
          pendingApplications,
          approvedApplications,
          totalSchemes,
          totalGrievances,
          pendingGrievances
        },
        applicationsByStatus,
        topSchemes,
        recentApplications
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'Citizen' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('documents');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's applications
    const applications = await Application.find({ userId: user._id })
      .populate('schemeId');

    res.status(200).json({
      success: true,
      data: {
        user,
        applications
      }
    });
  } catch (error) {
    next(error);
  }
};
