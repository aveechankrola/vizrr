const express = require('express')
const router = express.Router()

// In-memory store for messages (replace with DB later)
const messages = []
let nextId = 1

// POST /api/contact
router.post('/', (req, res) => {
  const { firstName, lastName, email, subject, message } = req.body

  if (!firstName || !lastName || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: firstName, lastName, email, subject, message',
    })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address' })
  }

  const entry = {
    id: nextId++,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
  }

  messages.push(entry)

  console.log(`[Contact] New message from ${entry.firstName} ${entry.lastName} <${entry.email}>: "${entry.subject}"`)

  res.status(201).json({
    success: true,
    message: `Thanks ${entry.firstName}! We'll get back to you soon.`,
    data: { id: entry.id, createdAt: entry.createdAt },
  })
})

// GET /api/contact  — list all messages (admin view)
router.get('/', (req, res) => {
  res.json({ success: true, data: messages, total: messages.length })
})

module.exports = router
