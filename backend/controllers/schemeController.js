const checkEligibilityLogic = (user, scheme) => {
  let failedConditions = [];
  let missingDocs = [];

  const { eligibility, requiredDocuments } = scheme;

  // Age check
  if (eligibility.ageMin && eligibility.ageMax) {
    if (user.age < eligibility.ageMin || user.age > eligibility.ageMax) {
      failedConditions.push(`Age must be between ${eligibility.ageMin}-${eligibility.ageMax} years (Your age: ${user.age} years)`);
    }
  }

  // Income check (annualIncome field in User model)
  if (
    eligibility.incomeMax !== null &&
    eligibility.incomeMax !== undefined &&
    user.annualIncome > eligibility.incomeMax
  ) {
    failedConditions.push(`Annual income must not exceed ₹${eligibility.incomeMax} (Your income: ₹${user.annualIncome})`);
  }

  // Caste check (casteCategory field in User model)
  if (
    eligibility.casteCategories && 
    eligibility.casteCategories.length > 0 &&
    !eligibility.casteCategories.includes(user.casteCategory)
  ) {
    failedConditions.push(`Caste category: Must belong to ${eligibility.casteCategories.join('/')} (Your category: ${user.casteCategory})`);
  }

  // Gender check
  if (
    eligibility.gender && 
    eligibility.gender.length > 0 &&
    !eligibility.gender.includes(user.gender)
  ) {
    failedConditions.push(`Gender: Must be ${eligibility.gender.join('/')} (Your gender: ${user.gender})`);
  }

  // Occupation check
  if (
    eligibility.occupations && 
    eligibility.occupations.length > 0 &&
    !eligibility.occupations.includes(user.occupation)
  ) {
    failedConditions.push(`Occupation: Must be one of ${eligibility.occupations.join('/')} (Your occupation: ${user.occupation})`);
  }

  // Document check
  if (requiredDocuments && Array.isArray(requiredDocuments)) {
    requiredDocuments.forEach(doc => {
      if (!user.documentsUploaded?.includes(doc)) {
        missingDocs.push(doc);
      }
    });
  }

  return {
    eligible: failedConditions.length === 0 && missingDocs.length === 0,
    failedConditions,
    missingDocs
  };
};


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
exports.getEligibleSchemes = async (req, res) => {
  try {
    const user = req.user; // from protect middleware
    const schemes = await Scheme.find({ isActive: true });

    const categorized = {
      eligible: [],
      partiallyEligible: [],
      notEligible: []
    };

    schemes.forEach(scheme => {
      const result = checkEligibilityLogic(user, scheme);

      if (result.eligible) {
        categorized.eligible.push({ scheme, result });
      } else if (
        result.failedConditions.length === 0 &&
        result.missingDocs.length > 0
      ) {
        categorized.partiallyEligible.push({ scheme, result });
      } else {
        categorized.notEligible.push({ scheme, result });
      }
    });

    res.json(categorized);
  } catch (error) {
    res.status(500).json({ message: "Error fetching eligible schemes" });
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
exports.checkSchemeDocuments = async (req, res) => {
  try {
    const user = req.user;
    const scheme = await Scheme.findById(req.params.id);

    const result = checkEligibilityLogic(user, scheme);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error checking scheme documents" });
  }
};

// @desc    Check eligibility for a specific scheme (for a specific user)
// @route   GET /api/schemes/check/:schemeId/:userId
// @access  Public
exports.checkSchemeEligibility = async (req, res) => {
  try {
    const { schemeId, userId } = req.params;
    const User = require('../models/User');
    
    // Fetch scheme and user
    const scheme = await Scheme.findById(schemeId);
    const user = await User.findById(userId);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check eligibility
    const result = checkEligibilityLogic(user, scheme);

    // Format response with detailed information
    const response = {
      schemeId: scheme._id,
      schemeName: scheme.name,
      eligible: result.eligible,
      failedConditions: result.failedConditions.length > 0 ? result.failedConditions : [],
      missingDocs: result.missingDocs.length > 0 ? result.missingDocs : []
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error checking scheme eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking scheme eligibility'
    });
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