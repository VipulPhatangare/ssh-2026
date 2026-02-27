const express = require('express');
const router = express.Router();
const axios = require('axios');
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

// Photo-based grievance submission (forwards to webhook)
router.post('/submit-photo', protect, async (req, res) => {
  try {
    const { name, image_url, description, location } = req.body;

    if (!image_url || !location) {
      return res.status(400).json({ message: 'Image URL and location are required' });
    }

    // Send to webhook (non-blocking - don't fail if webhook is down)
    const webhookPayload = {
      name: name || req.user.fullName,
      image_url,
      description: description || 'No description provided',
      location,
      userId: req.user._id,
      userEmail: req.user.email,
      timestamp: new Date().toISOString()
    };

    // Try to send to webhook and capture response
    let webhookSuccess = false;
    let webhookData = null;
    try {
      console.log('📤 Sending to image-chat webhook...');
      console.log('Payload:', JSON.stringify(webhookPayload, null, 2));
      
      const webhookResponse = await axios.post(
        'https://synthomind.cloud/webhook/image-chat',
        webhookPayload,
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 45000
        }
      );
      webhookSuccess = true;
      webhookData = webhookResponse.data;
      console.log('✅ Webhook delivered successfully');
      console.log('Response status:', webhookResponse.status);
      console.log('Response data type:', typeof webhookData);
      console.log('Response data:', JSON.stringify(webhookData, null, 2));
      
      // Check if response is empty or invalid
      if (!webhookData || webhookData === '' || Object.keys(webhookData).length === 0) {
        console.log('⚠️ Webhook returned empty response - n8n workflow may not be configured correctly');
        webhookData = null;
        webhookSuccess = false;
      } else {
        // Check if response is the expected format
        console.log('Has draft?', !!webhookData.draft);
        console.log('Has choices?', !!webhookData.choices);
        console.log('Has message?', !!webhookData.message);
        console.log('Keys:', Object.keys(webhookData));
      }
    } catch (webhookError) {
      console.log('⚠️ Webhook failed:', webhookError.message);
      if (webhookError.response) {
        console.log('Response status:', webhookError.response.status);
        console.log('Response data:', JSON.stringify(webhookError.response.data, null, 2));
      }
      if (webhookError.code === 'ECONNABORTED') {
        console.log('❌ Request timed out after 45 seconds');
      }
      // Continue execution - webhook failure shouldn't block user
    }

    // Return success with webhook response data
    res.status(200).json({ 
      success: true,
      message: webhookSuccess ? 'Grievance analyzed successfully!' : 'Grievance submitted! (AI analysis unavailable - please check n8n webhook configuration)',
      data: {
        image_url,
        location,
        webhookDelivered: webhookSuccess,
        // Include webhook response (issue, department, draft)
        analysis: webhookData || null,
        webhookNote: webhookSuccess ? null : 'n8n webhook returned empty response. Please verify the workflow is active and configured to return analysis data.'
      }
    });

  } catch (error) {
    console.error('Grievance submission error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit grievance',
      error: error.message
    });
  }
});

router.post('/', protect, createGrievance);
router.get('/my-grievances', protect, getMyGrievances);
router.get('/:id', protect, getGrievanceById);

// Admin routes
router.get('/', protect, authorize('Admin'), getAllGrievances);
router.get('/pending/all', protect, authorize('Admin'), getPendingGrievances);
router.put('/:id/status', protect, authorize('Admin'), updateGrievanceStatus);
router.post('/:id/response', protect, authorize('Admin'), addGrievanceResponse);

module.exports = router;
