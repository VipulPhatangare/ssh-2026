const Grievance = require('../models/Grievance');
const Application = require('../models/Application');

// @desc    Create new grievance
// @route   POST /api/grievances
// @access  Private
exports.createGrievance = async (req, res, next) => {
  try {
    const { applicationId, complaintText } = req.body;

    // Check if application exists and belongs to user
    const application = await Application.findById(applicationId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to raise grievance for this application'
      });
    }

    const grievance = await Grievance.create({
      userId: req.user._id,
      applicationId,
      complaintText
    });

    res.status(201).json({
      success: true,
      data: grievance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all grievances for current user
// @route   GET /api/grievances/my-grievances
// @access  Private
exports.getMyGrievances = async (req, res, next) => {
  try {
    const grievances = await Grievance.find({ userId: req.user._id })
      .populate('applicationId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: grievances.length,
      data: grievances
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get grievance by ID
// @route   GET /api/grievances/:id
// @access  Private
exports.getGrievanceById = async (req, res, next) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate('applicationId')
      .populate('userId', 'fullName email');

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    // Make sure user owns this grievance or is admin
    if (grievance.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this grievance'
      });
    }

    res.status(200).json({
      success: true,
      data: grievance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all grievances (Admin only)
// @route   GET /api/grievances
// @access  Private/Admin
exports.getAllGrievances = async (req, res, next) => {
  try {
    const grievances = await Grievance.find()
      .populate('userId', 'fullName email district')
      .populate('applicationId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: grievances.length,
      data: grievances
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update grievance status (Admin only)
// @route   PUT /api/grievances/:id/status
// @access  Private/Admin
exports.updateGrievanceStatus = async (req, res, next) => {
  try {
    const { status, responseMessage } = req.body;

    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    grievance.status = status;

    if (responseMessage) {
      grievance.responses.push({
        respondent: 'Admin',
        message: responseMessage,
        date: new Date()
      });
    }

    await grievance.save();

    res.status(200).json({
      success: true,
      data: grievance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add response to grievance (Admin only)
// @route   POST /api/grievances/:id/response
// @access  Private/Admin
exports.addGrievanceResponse = async (req, res, next) => {
  try {
    const { message } = req.body;

    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    grievance.responses.push({
      respondent: 'Admin',
      message,
      date: new Date()
    });

    await grievance.save();

    res.status(200).json({
      success: true,
      data: grievance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending grievances (Admin only)
// @route   GET /api/grievances/pending/all
// @access  Private/Admin
exports.getPendingGrievances = async (req, res, next) => {
  try {
    const grievances = await Grievance.find({
      status: { $in: ['Open', 'In Progress', 'Escalated'] }
    })
      .populate('userId', 'fullName email district')
      .populate('applicationId')
      .sort({ escalationLevel: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: grievances.length,
      data: grievances
    });
  } catch (error) {
    next(error);
  }
};
