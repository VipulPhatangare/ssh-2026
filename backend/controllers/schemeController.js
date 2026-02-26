const Scheme = require('../models/Scheme');
const { 
  findEligibleSchemes, 
  findUnclaimedSchemes,
  getSchemesByLifeEvent,
  checkDocumentAvailability
} = require('../utils/schemeMatchingService');

// @desc    Get all schemes
// @route   GET /api/schemes
// @access  Public
exports.getAllSchemes = async (req, res, next) => {
  try {
    const schemes = await Scheme.find({ isActive: true });

    res.status(200).json({
      success: true,
      count: schemes.length,
      data: schemes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get scheme by ID
// @route   GET /api/schemes/:id
// @access  Public
exports.getSchemeById = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    res.status(200).json({
      success: true,
      data: scheme
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get eligible schemes for current user
// @route   GET /api/schemes/eligible/me
// @access  Private
exports.getEligibleSchemes = async (req, res, next) => {
  try {
    const user = req.user;
    const { eligible, all } = await findEligibleSchemes(user);

    res.status(200).json({
      success: true,
      eligibleCount: eligible.length,
      eligible: eligible,
      recommended: all.slice(0, 10) // Top 10 recommended
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unclaimed schemes for current user
// @route   GET /api/schemes/unclaimed/me
// @access  Private
exports.getUnclaimedSchemes = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = req.user;
    const unclaimedSchemes = await findUnclaimedSchemes(userId, user);

    res.status(200).json({
      success: true,
      count: unclaimedSchemes.length,
      data: unclaimedSchemes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get schemes by life event
// @route   GET /api/schemes/life-event/:event
// @access  Public
exports.getSchemesByLifeEvent = async (req, res, next) => {
  try {
    const schemes = await getSchemesByLifeEvent(req.params.event);

    res.status(200).json({
      success: true,
      count: schemes.length,
      data: schemes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check document availability for a scheme
// @route   GET /api/schemes/:id/check-documents
// @access  Private
exports.checkSchemeDocuments = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    const documentStatus = await checkDocumentAvailability(
      req.user._id, 
      scheme.requiredDocuments
    );

    res.status(200).json({
      success: true,
      data: documentStatus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create scheme (Admin only)
// @route   POST /api/schemes
// @access  Private/Admin
exports.createScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.create(req.body);

    res.status(201).json({
      success: true,
      data: scheme
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update scheme (Admin only)
// @route   PUT /api/schemes/:id
// @access  Private/Admin
exports.updateScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    res.status(200).json({
      success: true,
      data: scheme
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete scheme (Admin only)
// @route   DELETE /api/schemes/:id
// @access  Private/Admin
exports.deleteScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Scheme deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
