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
// @desc    Chat with AI about a scheme
// @route   POST /api/schemes/:id/chat
// @access  Public
exports.chatAboutScheme = async (req, res, next) => {
  try {
    const { chat, scheme } = req.body;
    const { id } = req.params;

    // Validate required fields
    if (!chat || !chat.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Chat message is required'
      });
    }

    // Get scheme details
    const schemeData = await Scheme.findById(id);
    if (!schemeData) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    // Print scheme data to terminal
    // console.log('\n========== SCHEME DATA ==========');
    // console.log('Scheme ID:', schemeData._id);
    // console.log('Scheme Code:', schemeData.schemeId || '(fallback to MongoDB ID)');
    // console.log('Scheme Name:', schemeData.name);
    // console.log('Department:', schemeData.department);
    // console.log('Description:', schemeData.description);
    // console.log('Benefits:', schemeData.benefits);
    // console.log('Required Documents:', schemeData.requiredDocuments);
    // console.log('Eligibility:', schemeData.eligibility);
    // console.log('Apply URL:', schemeData.applyUrl);
    // console.log('Is Active:', schemeData.isActive);
    // console.log('=====================================\n');

    // Send request to n8n webhook
    const webhookUrl = 'https://synthomind.cloud/webhook/shceme-1';
    const payload = {
      chat: chat.trim(),
      scheme: schemeData.name || scheme || '',
      schemeId: schemeData.schemeId 
      // Send all scheme document data

    };

    // Print payload to terminal
    console.log('\n========== WEBHOOK PAYLOAD ==========');
    console.log(JSON.stringify(payload, null, 2));
    console.log('=====================================\n');

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned status ${response.status}`);
      }

      const data = await response.json();

      // Print webhook response to terminal
      console.log('\n========== WEBHOOK RESPONSE ==========');
      console.log(JSON.stringify(data, null, 2));
      console.log('=====================================\n');

      res.status(200).json({
        success: true,
        output: data.output || 'Unable to process your question. Please try again.',
        data: data,
      });
    } catch (webhookError) {
      console.error('\n========== WEBHOOK ERROR ==========');
      console.error('Error Message:', webhookError.message);
      console.error('Error Stack:', webhookError.stack);
      console.error('=====================================\n');
      res.status(500).json({
        success: false,
        message: 'Failed to get response from AI service',
        error: webhookError.message,
      });
    }
  } catch (error) {
    next(error);
  }
};