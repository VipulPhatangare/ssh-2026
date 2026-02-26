const Application = require('../models/Application');
const Scheme = require('../models/Scheme');

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res, next) => {
  try {
    const { schemeId, submittedDocuments } = req.body;

    // Check if scheme exists
    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      userId: req.user._id,
      schemeId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this scheme'
      });
    }

    // Create application
    const application = await Application.create({
      userId: req.user._id,
      schemeId,
      submittedDocuments,
      timeline: [{
        status: 'Submitted',
        description: 'Application submitted successfully',
        date: new Date()
      }]
    });

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for current user
// @route   GET /api/applications/my-applications
// @access  Private
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('schemeId')
      .populate('submittedDocuments')
      .sort({ submissionDate: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
exports.getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('schemeId')
      .populate('submittedDocuments');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Make sure user owns this application or is admin
    if (application.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this application'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications (Admin only)
// @route   GET /api/applications
// @access  Private/Admin
exports.getAllApplications = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate('userId', 'fullName email district')
      .populate('schemeId')
      .sort({ submissionDate: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (Admin only)
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = status;
    application.remarks = remarks || application.remarks;

    // Add to timeline
    application.timeline.push({
      status: status,
      description: remarks || `Status updated to ${status}`,
      date: new Date()
    });

    await application.save();

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get application statistics (Admin only)
// @route   GET /api/applications/stats/overview
// @access  Private/Admin
exports.getApplicationStats = async (req, res, next) => {
  try {
    const total = await Application.countDocuments();
    const pending = await Application.countDocuments({ status: 'Pending' });
    const approved = await Application.countDocuments({ status: 'Approved' });
    const rejected = await Application.countDocuments({ status: 'Rejected' });
    const underReview = await Application.countDocuments({ status: 'Under Review' });

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        underReview
      }
    });
  } catch (error) {
    next(error);
  }
};
