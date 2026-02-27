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

// @desc    Get scheme by ID or schemeId
// @route   GET /api/schemes/:id
// @access  Public
exports.getSchemeById = async (req, res, next) => {
  try {
    let scheme;
    
    // Try to find by MongoDB _id first
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      scheme = await Scheme.findById(req.params.id);
    }
    
    // If not found or not a valid ObjectId, try to find by schemeId
    if (!scheme) {
      scheme = await Scheme.findOne({ schemeId: req.params.id });
    }

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

// @desc    Resolve MongoDB _id from schemeId
// @route   GET /api/schemes/resolve/:schemeId
// @access  Public
exports.resolveSchemeId = async (req, res, next) => {
  try {
    const { schemeId } = req.params;

    if (!schemeId || !schemeId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'schemeId is required'
      });
    }

    const scheme = await Scheme.findOne({ schemeId: schemeId.trim() }).select('_id schemeId name');

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: scheme._id,
        schemeId: scheme.schemeId,
        name: scheme.name
      }
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
    let scheme;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      scheme = await Scheme.findById(req.params.id);
    }
    if (!scheme) {
      scheme = await Scheme.findOne({ schemeId: req.params.id });
    }
    
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

    // Get scheme details - support both MongoDB _id and schemeId
    let schemeData;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      schemeData = await Scheme.findById(id);
    }
    if (!schemeData) {
      schemeData = await Scheme.findOne({ schemeId: id });
    }
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
    // console.log('\n========== WEBHOOK PAYLOAD ==========');
    // console.log(JSON.stringify(payload, null, 2));
    // console.log('=====================================\n');

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
      // console.log('\n========== WEBHOOK RESPONSE ==========');
      // console.log(JSON.stringify(data, null, 2));
      // console.log('=====================================\n');

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

// ── District → numeric index (matches training dataset encoding) ─────────────
const DISTRICT_INDEX = {
  'Agar Malwa':0,'Alirajpur':1,'Anuppur':2,'Ashoknagar':3,'Balaghat':4,
  'Barwani':5,'Betul':6,'Bhind':7,'Bhopal':8,'Burhanpur':9,
  'Chhatarpur':10,'Chhindwara':11,'Damoh':12,'Datia':13,'Dewas':14,
  'Dhar':15,'Dindori':16,'Guna':17,'Gwalior':18,'Harda':19,
  'Hoshangabad':20,'Indore':21,'Jabalpur':22,'Jhabua':23,'Katni':24,
  'Khandwa':25,'Khargone':26,'Mandla':27,'Mandsaur':28,'Morena':29,
  'Narsinghpur':30,'Neemuch':31,'Niwari':32,'Panna':33,'Raisen':34,
  'Rajgarh':35,'Ratlam':36,'Rewa':37,'Sagar':38,'Satna':39,
  'Sehore':40,'Seoni':41,'Shahdol':42,'Shajapur':43,'Sheopur':44,
  'Shivpuri':45,'Sidhi':46,'Singrauli':47,'Tikamgarh':48,'Ujjain':49,
  'Umaria':50,'Vidisha':51,
};

const CATEGORY_INDEX = { General:0, OBC:1, SC:2, ST:3, EWS:4 };

// @desc    Predict approval probability for Kisan Kalyan Yojana (S0002 only)
// @route   POST /api/schemes/S0002/predict-approval
// @access  Private
exports.predictApproval = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Guard — only S0002 uses this ML model
    if (id !== 'S0002') {
      return res.status(400).json({
        success: false,
        message: 'Approval prediction is only available for scheme S0002',
      });
    }

    const user = req.user;
    const b    = req.body;  // form inputs from frontend

    // ── Map user profile → numeric features ──────────────────────────────────
    const toBit = (v) => (v ? 1 : 0);

    const features = {
      // ── From user profile (auto-filled) ─────────────────────────────────
      age                         : user.age || 0,
      gender                      : user.gender === 'Male' ? 1 : 0,
      category                    : CATEGORY_INDEX[user.casteCategory] ?? 0,
      district                    : DISTRICT_INDEX[user.district] ?? 0,
      is_mp_resident              : 1,   // all registered users are MP residents
      aadhaar_valid               : toBit(user.aadhaarNumber),
      aadhaar_uploaded            : toBit(user.aadhaarNumber),
      domicile_uploaded           : toBit(user.domicileCertificate),

      // ── From form inputs ──────────────────────────────────────────────────
      rural_flag                  : toBit(b.rural_flag),
      mobile_linked_aadhaar       : toBit(b.mobile_linked_aadhaar),
      bank_linked_aadhaar         : toBit(b.bank_linked_aadhaar),
      land_registered             : toBit(b.land_registered),
      land_area_hectare           : parseFloat(b.land_area_hectare) || 0,
      land_record_verified        : toBit(b.land_record_verified),
      land_dispute_flag           : toBit(b.land_dispute_flag),
      pm_kisan_registered         : toBit(b.pm_kisan_registered),
      pm_kisan_active             : toBit(b.pm_kisan_active),
      pm_kisan_installment_received: parseInt(b.pm_kisan_installment_received) || 0,
      pm_kisan_rejected_flag      : toBit(b.pm_kisan_rejected_flag),
      bank_account_valid          : toBit(b.bank_account_valid),
      ifsc_valid                  : toBit(b.ifsc_valid),
      dbt_enabled                 : toBit(b.dbt_enabled),
      previous_dbt_failure        : toBit(b.previous_dbt_failure),
      land_doc_uploaded           : toBit(b.land_doc_uploaded),
      bank_passbook_uploaded      : toBit(b.bank_passbook_uploaded),
      pm_kisan_proof_uploaded     : toBit(b.pm_kisan_proof_uploaded),
    };

    // documents_complete = all required docs uploaded
    features.documents_complete = toBit(
      features.aadhaar_uploaded &&
      features.domicile_uploaded &&
      features.land_doc_uploaded &&
      features.bank_passbook_uploaded
    );

    // ── Call Python prediction microservice ──────────────────────────────────
    const PREDICT_URL = process.env.PREDICT_SERVICE_URL || 'http://localhost:5001/predict';

    let prediction;
    try {
      const pyRes = await fetch(PREDICT_URL, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(features),
      });
      if (!pyRes.ok) throw new Error(`Prediction service returned ${pyRes.status}`);
      prediction = await pyRes.json();
    } catch (svcErr) {
      console.error('⚠️  Prediction service error:', svcErr.message);
      return res.status(503).json({
        success: false,
        message: 'Prediction service unavailable. Please ensure prediction_server.py is running on port 5001.',
        error  : svcErr.message,
      });
    }

    return res.status(200).json({
      success   : true,
      schemeId  : 'S0002',
      userName  : user.fullName,
      features,          // echo back so frontend can inspect
      prediction,
    });
  } catch (error) {
    next(error);
  }
};

/* ─────────────────────────────────────────────────────────────────────
   analyzeDocuments  —  sends uploaded document to n8n / LLM
   POST /api/schemes/:id/analyze-document   (protected)
   Body: { documentType, fileName, fileBase64, mimeType }
───────────────────────────────────────────────────────────────────── */
exports.analyzeDocuments = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('fullName');
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const { documentType, fileName, fileBase64, mimeType } = req.body;
    if (!documentType || !fileBase64) {
      return res.status(400).json({ success: false, message: 'documentType and fileBase64 are required' });
    }

    const WEBHOOK_URL = 'https://synthomind.cloud/webhook/doc-analysis';

    const webhookResp = await fetch(WEBHOOK_URL, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        documentType,
        fileName   : fileName || 'document',
        fileBase64,
        mimeType   : mimeType || 'application/octet-stream',
        userName   : user.fullName,
        schemeId   : req.params.id,
      }),
    });

    if (!webhookResp.ok) {
      return res.status(502).json({ success: false, message: 'Document analysis service unavailable. Please try again later.' });
    }

    const raw = await webhookResp.json();

    // n8n may return an array (single-item) or an object
    const data = Array.isArray(raw) ? raw[0] : raw;

    return res.status(200).json({ success: true, analysis: data });
  } catch (error) {
    next(error);
  }
};