// Backend API wrapper: the AI "brain" now lives in the server.
// Frontend keeps only UI and sends requests to /api/ai/* endpoints.

// Export small system prompts for compatibility with existing components.
export const CHAT_SYSTEM_PROMPT = `You are VizrGod, the premium AI style consultant for Vizrr. Provide concise, helpful eyewear advice.`
export const FACE_ANALYZER_PROMPT = `You are a face shape analysis expert for Vizrr eyewear. Analyze an image or measurements and recommend frame styles and a size guideline.`

function handleJsonResponse(res) {
  if (!res.ok) throw new Error(`AI API responded ${res.status}`)
  return res.json().then((d) => d?.result || d?.data || null)
}

export async function runVizrGodChat(messages = []) {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
  return handleJsonResponse(res)
}

export async function analyzeVizrrFace({ imageData, width, height } = {}) {
  const res = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData, width, height }),
  })
  return handleJsonResponse(res)
}
