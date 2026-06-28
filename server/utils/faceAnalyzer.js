const axios = require('axios');

/**
 * VIZRR AI FACE ANALYZER - Production Grade
 * Robust face shape detection with fallback mechanisms
 * Supports multiple providers with intelligent fallback
 */

// Face Shape Detection Database
const FACE_SHAPES_DB = {
  oval: {
    ratioRange: [0.92, 1.08],
    coverageRange: [0.38, 0.50],
    characteristics: 'Balanced proportions with slightly longer face',
    frameStyles: ['Aviator', 'Square', 'Cat-eye', 'Browline'],
    frameWidthMm: { min: 124, max: 130 },
    why: 'preserve your natural balance while adding style',
  },
  round: {
    ratioRange: [0.70, 0.92],
    coverageRange: [0.40, 0.55],
    characteristics: 'Fuller cheeks with rounded forehead and chin',
    frameStyles: ['Rectangular', 'Geometric', 'Browline', 'Aviator'],
    frameWidthMm: { min: 124, max: 130 },
    why: 'add angles and structure to your face',
  },
  square: {
    ratioRange: [0.93, 1.05],
    coverageRange: [0.42, 0.58],
    characteristics: 'Strong jawline with defined angles',
    frameStyles: ['Round', 'Oval', 'Cat-eye', 'Browline'],
    frameWidthMm: { min: 126, max: 132 },
    why: 'soften a strong jawline and balance proportions',
  },
  heart: {
    ratioRange: [1.05, 1.15],
    coverageRange: [0.35, 0.48],
    characteristics: 'Wider forehead, narrower chin',
    frameStyles: ['Browline', 'Oval', 'Aviator', 'Round'],
    frameWidthMm: { min: 126, max: 132 },
    why: 'balance a wider forehead and keep the look light around the chin',
  },
  diamond: {
    ratioRange: [0.88, 1.00],
    coverageRange: [0.35, 0.48],
    characteristics: 'Prominent cheekbones, narrow forehead and chin',
    frameStyles: ['Oval', 'Cat-eye', 'Rimless', 'Browline'],
    frameWidthMm: { min: 124, max: 130 },
    why: 'soften cheekbones and keep the frame visually balanced',
  },
  'oblong/rectangular': {
    ratioRange: [1.14, 1.50],
    coverageRange: [0.30, 0.45],
    characteristics: 'Longer face with consistent width',
    frameStyles: ['Round', 'Aviator', 'Oversized Oval', 'Geometric'],
    frameWidthMm: { min: 128, max: 138 },
    why: 'add width and reduce the feeling of extra length',
  },
};

// Multi-provider AI implementations
async function analyzeWithOpenAI(imageBase64, apiKey) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-vision' || 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this face image and determine the face shape. Classify it as one of: oval, round, square, heart, diamond, or oblong/rectangular.

Return ONLY a JSON object with:
{
  "faceShape": "shape_name",
  "confidence": 0.95,
  "measurements": {
    "ratio": 1.05,
    "coverage": 0.42
  },
  "reasoning": "brief explanation"
}`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response format from OpenAI');
  } catch (error) {
    console.error('OpenAI analysis failed:', error.message);
    throw error;
  }
}

async function analyzeWithAnthropic(imageBase64, apiKey) {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: `Analyze this face image and determine the face shape. Classify it as one of: oval, round, square, heart, diamond, or oblong/rectangular.

Return ONLY a JSON object with:
{
  "faceShape": "shape_name",
  "confidence": 0.95,
  "measurements": {
    "ratio": 1.05,
    "coverage": 0.42
  },
  "reasoning": "brief explanation"
}`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const content = response.data.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response format from Anthropic');
  } catch (error) {
    console.error('Anthropic analysis failed:', error.message);
    throw error;
  }
}

/**
 * Local fallback analysis using heuristic-based detection
 * NEVER FAILS - Always returns a result
 */
function localFaceAnalysis(width, height) {
  if (!width || !height || width === 0 || height === 0) {
    // Default to oval if no measurements
    return generateAnalysisResult('oval', 0.5, { ratio: 1.0, coverage: 0.4 });
  }

  const ratio = width / height;
  let detectedShape = 'oval'; // default
  let confidence = 0.6;

  // Detect shape using ratio and heuristics
  if (ratio <= 0.92) {
    detectedShape = 'round';
    confidence = Math.min(0.85, ratio + 0.2);
  } else if (ratio >= 0.93 && ratio <= 1.05) {
    detectedShape = ratio <= 0.98 ? 'diamond' : ratio >= 1.02 ? 'square' : 'oval';
    confidence = 0.75;
  } else if (ratio > 1.05 && ratio <= 1.15) {
    detectedShape = 'heart';
    confidence = 0.70;
  } else if (ratio > 1.15) {
    detectedShape = 'oblong/rectangular';
    confidence = Math.min(0.9, ratio - 0.3);
  }

  return generateAnalysisResult(detectedShape, confidence, { ratio, coverage: 0.4 });
}

/**
 * Generate standardized analysis result
 */
function generateAnalysisResult(faceShape, confidence, measurements = {}) {
  const shapeDB = FACE_SHAPES_DB[faceShape] || FACE_SHAPES_DB.oval;

  return {
    faceShape,
    confidence: Math.min(1, Math.max(0, confidence)),
    measurements: {
      ratio: measurements.ratio || 1.0,
      coverage: measurements.coverage || 0.4,
    },
    recommendations: {
      frameStyles: shapeDB.frameStyles,
      frameWidthMm: shapeDB.frameWidthMm,
      lensWidthMm: {
        min: Math.max(shapeDB.frameWidthMm.min - 68, 46),
        max: Math.max(shapeDB.frameWidthMm.max - 64, 50),
      },
      bridgeWidthMm: { min: 16, max: 19 },
      why: shapeDB.why,
    },
    reasoning: shapeDB.characteristics,
  };
}

/**
 * Main analysis function with intelligent fallback
 * Uses provider priority: OpenAI -> Anthropic -> Local
 */
async function analyzeVizrrFace(imageBase64, options = {}) {
  const {
    useOpenAI = !!process.env.OPENAI_API_KEY,
    useAnthropic = !!process.env.ANTHROPIC_API_KEY,
    provider = 'auto', // 'auto', 'openai', 'anthropic', 'local'
    width = null,
    height = null,
  } = options;

  const startTime = Date.now();
  let lastError = null;

  // Provider priority list
  const providers = [];
  if (provider === 'auto' || provider === 'openai') {
    if (useOpenAI) providers.push('openai');
  }
  if (provider === 'auto' || provider === 'anthropic') {
    if (useAnthropic) providers.push('anthropic');
  }
  providers.push('local'); // Always include local as ultimate fallback

  // Try each provider in order
  for (const prov of providers) {
    try {
      let result;

      if (prov === 'openai') {
        result = await analyzeWithOpenAI(imageBase64, process.env.OPENAI_API_KEY);
      } else if (prov === 'anthropic') {
        result = await analyzeWithAnthropic(imageBase64, process.env.ANTHROPIC_API_KEY);
      } else {
        result = localFaceAnalysis(width, height);
      }

      // Validate result
      if (result && result.faceShape) {
        const processingTime = Date.now() - startTime;
        return {
          ...result,
          provider: prov,
          processingTime,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      lastError = error;
      console.warn(`Provider ${prov} failed:`, error.message);
      continue;
    }
  }

  // If we get here, all providers failed (shouldn't happen as local always works)
  console.error('All providers exhausted, using ultimate local fallback');
  return {
    ...localFaceAnalysis(width, height),
    provider: 'local-fallback',
    processingTime: Date.now() - startTime,
    timestamp: new Date(),
    error: `All providers failed: ${lastError?.message}`,
  };
}

/**
 * Get frame recommendations for a face shape
 */
function getFrameRecommendations(faceShape) {
  const shapeDB = FACE_SHAPES_DB[faceShape] || FACE_SHAPES_DB.oval;
  return {
    faceShape,
    styles: shapeDB.frameStyles,
    frameWidth: shapeDB.frameWidthMm,
    lensWidth: {
      min: Math.max(shapeDB.frameWidthMm.min - 68, 46),
      max: Math.max(shapeDB.frameWidthMm.max - 64, 50),
    },
    why: shapeDB.why,
    characteristics: shapeDB.characteristics,
  };
}

/**
 * Get all supported face shapes
 */
function getSupportedFaceShapes() {
  return Object.keys(FACE_SHAPES_DB);
}

module.exports = {
  analyzeVizrrFace,
  getFrameRecommendations,
  getSupportedFaceShapes,
  FACE_SHAPES_DB,
};
