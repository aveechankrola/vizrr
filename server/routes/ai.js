const express = require('express');
const router = express.Router();
const {
  analyzeFace,
  getLatestAnalysis,
  getAnalysisHistory,
  getRecommendations,
  getSupportedShapes,
  compareFaceShapes,
} = require('../controllers/aiController');
const { clerkMiddleware } = require('../middleware/clerkAuth');

// All AI routes require authentication
router.use(clerkMiddleware);

// Face analysis endpoints
router.post('/analyze', analyzeFace);
router.get('/latest-analysis', getLatestAnalysis);
router.get('/history', getAnalysisHistory);

// Face shape information
router.get('/shapes', getSupportedShapes);
router.get('/recommendations/:faceShape', getRecommendations);
router.post('/compare-shapes', compareFaceShapes);

module.exports = router;
