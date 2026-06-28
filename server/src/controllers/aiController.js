import fetch from 'node-fetch'
import aiLog from '../models/aiLogModel.js'

const APP_KNOWLEDGE = `Vizrr is a premium eyewear brand and shopping app.

What Vizrr can help with:
- Product selection: sunglasses and eyeglasses
- Style advice: match frames to face shape, outfit, and lens preferences
- Eye support: lens types, sizing, and frame materials
- Shopping: cart, checkout, saved addresses, order history, and wallet
- Contact: support@vizrr.in
- Product page: open the face analyzer, filter products, sort by price, and add frames to cart
- Contact page: quick support card, live AI chat, and email support
- Account page: orders, saved addresses, wallet balance, and order tracking
- Checkout: customer details, delivery address, delivery fee, and payment method
- Admin: orders, products, users, and stats for store management

Tone:
- Warm, premium, confident, and concise
- Give clear next steps
- Stay helpful, specific, and stylish`;

const CHAT_SYSTEM_PROMPT = `You are VizrGod, the premium AI style consultant for Vizrr.

${APP_KNOWLEDGE}

Knowledge you should use:
- Frame styles: aviator, round, square, cat-eye, browline, geometric, oval, rectangular, rimless
- Face shapes: oval, round, square, heart, diamond, oblong/rectangular
- Materials: acetate, titanium, stainless steel, wood, bio-plastic
- Lens types: single vision, progressive, blue-light, photochromic, polarized
- Sizing: total frame width, lens width, bridge width, temple length
- Eyewear size notation: a number like 50□18-140 means 50mm lens width, 18mm bridge, 140mm temple length; the total frame width is usually much larger than the first number

Rules:
- If the user asks about a face shape, recommend specific frame styles and explain why.
- If the user asks about product advice, suggest styles that match their needs.
- If the user asks about size, explain the difference between lens width and total frame width, and convert their size into a realistic Vizrr fit.
- Keep responses concise, premium, and practical.
- End with a helpful follow-up question when appropriate.
- If asked about pricing, say Vizrr offers bespoke pricing starting at $180 for acetate frames and $280 for titanium.
- If asked about delivery, say handcrafted orders take 3-4 weeks.`;

const FACE_ANALYZER_PROMPT = `You are a face shape analysis expert for Vizrr eyewear.

${APP_KNOWLEDGE}

Analyze the provided face image or measurements and:
1. Identify the most likely face shape from: oval, round, square, heart, diamond, oblong/rectangular.
2. Recommend 2-3 specific frame styles from Vizrr.
3. Explain why each style flatters that face shape.
4. Give one realistic sizing guideline using full frame width / total frame width in millimeters (not only lens width).

Return this format exactly:
**Face Shape:** [shape]
**Why:** [short explanation]
**Perfect Frames for You:**
• [Frame Style 1]: [why it works]
• [Frame Style 2]: [why it works]
• [Frame Style 3]: [why it works]
**Size Guide:** [one practical sizing tip using full frame width in mm]`;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
const AI_PROVIDER = (process.env.AI_PROVIDER || 'local').toLowerCase()
const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini'
const OPENAI_VISION_MODEL = process.env.OPENAI_VISION_MODEL || OPENAI_CHAT_MODEL
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620'

export async function runChat(messages = []) {
  try {
    if ((AI_PROVIDER === 'openai' || AI_PROVIDER === 'auto') && OPENAI_API_KEY) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_CHAT_MODEL,
          messages: [
            { role: 'system', content: CHAT_SYSTEM_PROMPT },
            ...messages,
          ],
          temperature: 0.7,
          max_tokens: 700,
        }),
      })
      const data = await res.json()
      const text = data?.choices?.[0]?.message?.content
      aiLog.appendLog({ type: 'chat', source: 'openai', messages, response: text })
      return text || localChatBrain(messages)
    }

    if ((AI_PROVIDER === 'anthropic' || AI_PROVIDER === 'auto') && ANTHROPIC_API_KEY) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 700,
          system: CHAT_SYSTEM_PROMPT,
          messages: messages,
        }),
      })
      const data = await res.json()
      const text = data?.content?.map((b) => b.text || '').join('')
      aiLog.appendLog({ type: 'chat', source: 'anthropic', messages, response: text })
      return text || localChatBrain(messages)
    }

    return localChatBrain(messages)
  } catch (err) {
    console.error('runChat error', err)
    return localChatBrain(messages)
  }
}

export async function analyzeFace({ imageData, width, height } = {}) {
  try {
    if ((AI_PROVIDER === 'openai' || AI_PROVIDER === 'auto') && OPENAI_API_KEY && imageData) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_VISION_MODEL,
          messages: [
            { role: 'system', content: FACE_ANALYZER_PROMPT },
            {
              role: 'user',
              content: [
                { type: 'text', text: FACE_ANALYZER_PROMPT },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageData}` } },
              ],
            },
          ],
          temperature: 0.2,
          max_tokens: 900,
        }),
      })
      const data = await res.json()
      const text = data?.choices?.[0]?.message?.content
      aiLog.appendLog({ type: 'analyze', source: 'openai', width, height, response: text })
      return text || localFaceAnalysis({ width, height })
    }

    if ((AI_PROVIDER === 'anthropic' || AI_PROVIDER === 'auto') && ANTHROPIC_API_KEY && imageData) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 900,
          system: FACE_ANALYZER_PROMPT,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageData } },
                { type: 'text', text: FACE_ANALYZER_PROMPT },
              ],
            },
          ],
        }),
      })
      const data = await res.json()
      const text = data?.content?.map((b) => b.text || '').join('')
      aiLog.appendLog({ type: 'analyze', source: 'anthropic', width, height, response: text })
      return text || localFaceAnalysis({ width, height })
    }

    // fallback local analysis using image dimensions
    return localFaceAnalysis({ width, height })
  } catch (err) {
    console.error('analyzeFace error', err)
    return localFaceAnalysis({ width, height })
  }
}

function localChatBrain(messages = []) {
  const last = (messages?.[messages.length - 1]?.content || '').toLowerCase()
  const conversation = (messages || []).map(m => `${m.role}: ${m.content}`).join('\n').toLowerCase()

  const sizeReply = buildSizingReply(last, conversation)
  if (sizeReply) return sizeReply

  if (last.includes('round') || conversation.includes('round face')) {
    return "For round faces, try rectangular, geometric, or browline frames to add structure. Want me to suggest styles from Vizrr's collection?"
  }
  if (last.includes('square') || conversation.includes('square face')) {
    return "Square faces look great with round, oval, or aviator frames to soften angles. I can also recommend the best fit sizes if you want."
  }
  if (last.includes('heart')) {
    return "Heart-shaped faces pair beautifully with browline, oval, or soft cat-eye frames to balance the forehead and chin. Want frame picks?"
  }
  if (last.includes('measure') || last.includes('size')) {
    return "Measure lens width, bridge width, and temple length in millimeters. If you share your current frame size, I can help you match it."
  }
  if (last.includes('acetate')) {
    return "Acetate frames feel rich, bold, and premium. They’re great for statement looks and daily comfort."
  }
  if (last.includes('titanium')) {
    return "Titanium is lightweight, durable, and ideal for a refined minimalist look."
  }
  if (last.includes('price') || last.includes('cost') || last.includes('delivery')) {
    return "Vizrr offers bespoke pricing and handcrafted delivery in 3–4 weeks. If you want, I can help you choose frames that fit your face and budget."
  }
  if (conversation.includes('what can you do') || conversation.includes('help me with') || conversation.includes('how do i use')) {
    return "I can help with frame recommendations, face shape analysis, eyewear sizing, materials, delivery, checkout, saved addresses, orders, wallet, and support. Ask me anything about the app or your next pair of frames."
  }
  if (conversation.includes('where is') || conversation.includes('how do i') || conversation.includes('how to')) {
    return "Tell me what you want to do in Vizrr and I’ll guide you step by step — for example: open the analyzer, filter products, add to cart, place an order, or check your account orders."
  }
  return "I’m VizrGod — your virtual eyewear stylist and Vizrr guide. Tell me your face shape, your current frame size, or what you want to do in the app, and I’ll give you a clear next step."
}

function buildSizingReply(last, conversation) {
  const sizeText = `${last} ${conversation}`
  const sizeNumber = extractSizeNumber(sizeText)
  const hasSizeLanguage = /\b(size|frame size|specs|glasses size|lens width|bridge|temple|fit)\b/.test(sizeText)
  if (!sizeNumber && !hasSizeLanguage) return null

  if (sizeNumber) {
    const frame = classifyFrameWidth(sizeNumber)
    return `If your current frame width is ${sizeNumber}mm, that’s usually the total frame width — not the lens width. For Vizrr, you’ll likely fit best around ${frame.min}-${frame.max}mm total frame width, with lens width around ${frame.lensMin}-${frame.lensMax}mm, bridge ${frame.bridgeMin}-${frame.bridgeMax}mm, and temples about ${frame.templeMin}-${frame.templeMax}mm. If your current frame is marked like 50□18-140, the 50 is lens width and the 140 is temple length, so I can translate it for you if you share the full marking.`
  }

  return "For eyewear, the number you see on the frame is usually lens width, not the full frame width. Share the number printed on your current specs, and I’ll convert it into a realistic Vizrr fit with total width, lens width, bridge, and temple length."
}

function extractSizeNumber(text) {
  const match = text.match(/\b(1[0-5]\d|[8-9]\d|\d{3})\s*(?:mm)?\b/)
  if (!match) return null
  const value = Number(match[1])
  return Number.isFinite(value) ? value : null
}

function classifyFrameWidth(sizeNumber) {
  if (sizeNumber <= 120) {
    return { min: 120, max: 124, lensMin: 48, lensMax: 50, bridgeMin: 16, bridgeMax: 18, templeMin: 135, templeMax: 140 }
  }
  if (sizeNumber <= 126) {
    return { min: 124, max: 128, lensMin: 49, lensMax: 51, bridgeMin: 16, bridgeMax: 18, templeMin: 140, templeMax: 145 }
  }
  if (sizeNumber <= 132) {
    return { min: 128, max: 132, lensMin: 50, lensMax: 52, bridgeMin: 16, bridgeMax: 18, templeMin: 140, templeMax: 145 }
  }
  if (sizeNumber <= 138) {
    return { min: 132, max: 136, lensMin: 51, lensMax: 53, bridgeMin: 17, bridgeMax: 19, templeMin: 145, templeMax: 150 }
  }
  return { min: 136, max: 140, lensMin: 52, lensMax: 54, bridgeMin: 17, bridgeMax: 19, templeMin: 145, templeMax: 150 }
}

function localFaceAnalysis({ width = 640, height = 480 } = {}) {
  const ratio = width / height
  const coverage = 0.4

  let shape = 'oval'
  if (ratio <= 0.92) shape = coverage > 0.42 ? 'round' : 'oval'
  else if (ratio >= 0.93 && ratio <= 1.03) shape = coverage > 0.40 ? 'square' : 'oval'
  else if (ratio > 1.03 && ratio <= 1.14) shape = coverage > 0.36 ? 'heart' : 'oval'
  else if (ratio > 1.14) shape = coverage > 0.34 ? 'oblong/rectangular' : 'oval'

  const recommendations = {
    oval: ['Aviator', 'Square', 'Cat-eye'],
    round: ['Rectangular', 'Geometric', 'Browline'],
    square: ['Round', 'Oval', 'Cat-eye'],
    heart: ['Browline', 'Oval', 'Aviator'],
    diamond: ['Oval', 'Cat-eye', 'Rimless'],
    'oblong/rectangular': ['Round', 'Aviator', 'Oversized Oval'],
  }

  const picks = recommendations[shape] || recommendations.oval
  const why = {
    round: 'add angles and structure',
    square: 'soften a strong jawline and balance proportions',
    heart: 'balance a wider forehead and keep the look light around the chin',
    diamond: 'soften cheekbones and keep the frame visually balanced',
    'oblong/rectangular': 'add width and reduce the feeling of extra length',
    oval: 'preserve your natural balance while adding style',
  }[shape] || 'balance proportions and preserve natural contours'

  const frameWidth = estimateFrameWidthMm({ shape, ratio, coverage })
  return `**Face Shape:** ${shape}\n**Why:** Based on proportions, your face benefits from frames that ${why}.\n**Perfect Frames for You:**\n• ${picks[0]}: Adds definition and contrast.\n• ${picks[1]}: Balances proportions for everyday wear.\n• ${picks[2]}: Offers a stylish complement to your features.\n**Size Guide:** Look for a full frame width around ${frameWidth.min}-${frameWidth.max}mm; lens width is usually ${Math.max(frameWidth.min - 68, 46)}-${Math.max(frameWidth.max - 64, 50)}mm, with a bridge around ${shape === 'round' ? '16-18mm' : shape === 'square' ? '17-19mm' : '16-18mm'}.`
}

function estimateFrameWidthMm({ shape, ratio, coverage }) {
  const base = shape === 'round'
    ? 124
    : shape === 'square'
      ? 128
      : shape === 'heart'
        ? 126
        : shape === 'diamond'
          ? 125
          : shape === 'oblong/rectangular'
            ? 130
            : 126

  const coverageAdjust = coverage > 0.44 ? 2 : coverage < 0.30 ? -2 : 0
  const ratioAdjust = ratio > 1.12 ? 2 : ratio < 0.95 ? -1 : 0
  const center = Math.max(120, Math.min(140, base + coverageAdjust + ratioAdjust))
  return { min: center - 4, max: center + 4 }
}
