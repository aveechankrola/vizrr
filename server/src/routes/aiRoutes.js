import express from 'express'
import { runChat, analyzeFace } from '../controllers/aiController.js'

const router = express.Router()

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body
    const result = await runChat(messages)
    res.json({ ok: true, result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: err?.message || 'Server error' })
  }
})

router.post('/analyze', async (req, res) => {
  try {
    const { imageData, width, height } = req.body
    const result = await analyzeFace({ imageData, width, height })
    res.json({ ok: true, result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: err?.message || 'Server error' })
  }
})

export default router
