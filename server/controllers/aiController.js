const FaceAnalysis = require('../models/FaceAnalysis');
const User = require('../models/User');
const Spectacle = require('../models/Spectacle');
const { asyncHandler } = require('../middleware/errorHandler');
const { analyzeVizrrFace, getFrameRecommendations } = require('../utils/faceAnalyzer');
const { cloudinary } = require('../config/cloudinary');

/**
 * Analyze face from image
 * This is the main endpoint that processes face images
 */
const analyzeFace = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { imageData, width = null, height = null, source = 'camera' } = req.body;

  if (!imageData) {
    return res.status(400).json({
      success: false,
      error: 'Missing imageData. Send base64 encoded image',
    });
  }

  try {
    // Mark previous analysis as not latest
    await FaceAnalysis.updateMany(
      { userId, isLatest: true },
      { isLatest: false }
    );

    // Analyze face using AI backend
    const startTime = Date.now();
    const analysisResult = await analyzeVizrrFace(imageData, {
      width: parseInt(width) || null,
      height: parseInt(height) || null,
    });
    const processingTime = Date.now() - startTime;

    // Upload image to Cloudinary
    let imageUrl = null;
    let imagePublicId = null;

    if (imageData) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${imageData}`,
          {
            folder: 'vizrr/face-analysis',
            resource_type: 'auto',
          }
        );
        imageUrl = uploadResponse.secure_url;
        imagePublicId = uploadResponse.public_id;
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError.message);
        // Continue even if upload fails
      }
    }

    // Save analysis to database
    const analysis = new FaceAnalysis({
      userId,
      faceShape: analysisResult.faceShape,
      confidence: analysisResult.confidence,
      imageUrl,
      imagePublicId,
      faceMeasurements: {
        width: parseInt(width) || null,
        height: parseInt(height) || null,
        ratio: analysisResult.measurements?.ratio || 1.0,
        coverage: analysisResult.measurements?.coverage || 0.4,
      },
      recommendations: {
        frameStyles: analysisResult.recommendations?.frameStyles || [],
        frameWidth: analysisResult.recommendations?.frameWidthMm,
        lensWidth: analysisResult.recommendations?.lensWidthMm,
        bridgeWidth: analysisResult.recommendations?.bridgeWidthMm,
      },
      analysis: {
        provider: analysisResult.provider,
        processingTime,
        response: JSON.stringify(analysisResult),
      },
      matchedProducts: [],
    });

    await analysis.save();

    // Update user's face analysis data
    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        'faceAnalysis.detectedShape': analysisResult.faceShape,
        'faceAnalysis.confidence': analysisResult.confidence,
        'faceAnalysis.recommendedStyles': analysisResult.recommendations?.frameStyles,
        'faceAnalysis.recommendedFrameWidth': analysisResult.recommendations?.frameWidthMm,
        'faceAnalysis.recommendedLensWidth': analysisResult.recommendations?.lensWidthMm,
        'faceAnalysis.recommendedBridgeWidth': analysisResult.recommendations?.bridgeWidthMm,
        'faceAnalysis.analysisDate': new Date(),
        'faceAnalysis.capturedImageUrl': imageUrl,
        'faceAnalysis.capturedImagePublicId': imagePublicId,
      },
      { new: true }
    );

    // Get recommended products
    const recommendedProducts = await Spectacle.find({
      suitableFaceShapes: { $in: [analysisResult.faceShape] },
      isActive: true,
    }).limit(12);

    res.json({
      success: true,
      data: {
        analysisId: analysis._id,
        faceShape: analysisResult.faceShape,
        confidence: analysisResult.confidence,
        recommendations: analysisResult.recommendations,
        reasoning: analysisResult.reasoning,
        provider: analysisResult.provider,
        processingTime,
        recommendedProducts: recommendedProducts.map(p => ({
          id: p._id,
          name: p.name,
          style: p.style,
          price: p.price,
          image: p.image,
        })),
      },
    });
  } catch (error) {
    console.error('Face analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Face analysis failed: ' + error.message,
    });
  }
});

/**
 * Get user's latest face analysis
 */
const getLatestAnalysis = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const analysis = await FaceAnalysis.findOne({
    userId,
    isLatest: true,
  }).sort({ createdAt: -1 });

  if (!analysis) {
    return res.status(404).json({
      success: false,
      error: 'No face analysis found. Please run face analyzer first.',
    });
  }

  res.json({
    success: true,
    data: analysis,
  });
});

/**
 * Get user's analysis history
 */
const getAnalysisHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 10, page = 1 } = req.query;

  const analyses = await FaceAnalysis.find({ userId })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await FaceAnalysis.countDocuments({ userId });

  res.json({
    success: true,
    data: analyses,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    },
  });
});

/**
 * Get frame recommendations for a face shape
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const { faceShape } = req.params;

  const validShapes = ['oval', 'round', 'square', 'heart', 'diamond', 'oblong/rectangular'];
  if (!validShapes.includes(faceShape)) {
    return res.status(400).json({
      success: false,
      error: `Invalid face shape. Supported shapes: ${validShapes.join(', ')}`,
    });
  }

  const recommendations = getFrameRecommendations(faceShape);

  // Get matching products
  const products = await Spectacle.find({
    suitableFaceShapes: { $in: [faceShape] },
    isActive: true,
  }).limit(20);

  res.json({
    success: true,
    data: {
      recommendations,
      matchingProducts: products,
    },
  });
});

/**
 * Get all supported face shapes
 */
const getSupportedShapes = asyncHandler(async (req, res) => {
  const { analyzeVizrrFace, getSupportedFaceShapes, FACE_SHAPES_DB } = require('../utils/faceAnalyzer');

  const shapes = getSupportedFaceShapes();
  const shapeDetails = shapes.map(shape => ({
    name: shape,
    details: FACE_SHAPES_DB[shape],
  }));

  res.json({
    success: true,
    data: shapeDetails,
  });
});

/**
 * Compare multiple face shapes
 */
const compareFaceShapes = asyncHandler(async (req, res) => {
  const { shapes } = req.body;

  if (!Array.isArray(shapes) || shapes.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Please provide at least 2 face shapes to compare',
    });
  }

  const { FACE_SHAPES_DB } = require('../utils/faceAnalyzer');

  const comparison = shapes.map(shape => ({
    shape,
    details: FACE_SHAPES_DB[shape] || null,
  }));

  res.json({
    success: true,
    data: comparison,
  });
});

module.exports = {
  analyzeFace,
  getLatestAnalysis,
  getAnalysisHistory,
  getRecommendations,
  getSupportedShapes,
  compareFaceShapes,
};
