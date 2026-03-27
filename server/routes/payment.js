const express = require('express')
const router = express.Router()
const https = require('https')
const querystring = require('querystring')
const Order = require('../models/Order')

// Instamojo API credentials (from environment)
const INSTAMOJO_API_KEY = process.env.INSTAMOJO_API_KEY || ''
const INSTAMOJO_AUTH_TOKEN = process.env.INSTAMOJO_AUTH_TOKEN || ''
const INSTAMOJO_WEBHOOK_URL = process.env.INSTAMOJO_WEBHOOK_URL || 'https://api.keprates.in/api/payment/webhook'

// POST /api/payment/create-link - Create Instamojo payment link
router.post('/create-link', async (req, res) => {
    try {
        const { orderId, amount, customerName, customerEmail, customerPhone } = req.body

        if (!amount || !orderId) {
            return res.status(400).json({ success: false, message: 'Missing required fields.' })
        }

        const postData = querystring.stringify({
            purpose: `Order #${orderId}`,
            amount: amount,
            buyer_name: customerName,
            email: customerEmail,
            phone: customerPhone,
            redirect_url: `https://www.keprates.in?order=${orderId}`,
            webhook: INSTAMOJO_WEBHOOK_URL,
            send_email: 'True',
            send_sms: 'True',
        })

        const options = {
            hostname: 'www.instamojo.com',
            port: 443,
            path: '/api/1.1/payment-requests/',
            method: 'POST',
            headers: {
                'X-Api-Key': INSTAMOJO_API_KEY,
                'X-Auth-Token': INSTAMOJO_AUTH_TOKEN,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
            },
        }

        const request = https.request(options, (response) => {
            let responseData = ''

            response.on('data', (chunk) => {
                responseData += chunk
            })

            response.on('end', () => {
                try {
                    const jsonResponse = JSON.parse(responseData)
                    if (response.statusCode === 201 && jsonResponse.success) {
                        res.status(201).json({
                            success: true,
                            data: {
                                paymentUrl: jsonResponse.payment_request.longurl,
                                paymentId: jsonResponse.payment_request.id,
                            },
                        })
                    } else {
                        res.status(400).json({
                            success: false,
                            message: jsonResponse.message || 'Failed to create payment link.',
                        })
                    }
                } catch (err) {
                    console.error('Error parsing Instamojo response:', err)
                    res.status(500).json({ success: false, message: 'Payment gateway error.' })
                }
            })
        })

        request.on('error', (err) => {
            console.error('Instamojo request error:', err)
            res.status(500).json({ success: false, message: 'Payment gateway error.' })
        })

        request.write(postData)
        request.end()
    } catch (err) {
        console.error('Error creating payment link:', err)
        res.status(500).json({ success: false, message: err.message })
    }
})

// POST /api/payment/webhook - Instamojo webhook for payment confirmation
router.post('/webhook', async (req, res) => {
    try {
        const paymentId = req.body.payment_id
        const paymentStatus = req.body.status  // 'completed', 'failed', 'pending'
        const shortUrl = req.body.shorturl

        console.log(`[Payment Webhook] ID: ${paymentId}, Status: ${paymentStatus}, URL: ${shortUrl}`)

        // Extract orderId from short URL if available
        // Instamojo format: https://www.instamojo.com/pay/PAYMENT_ID/
        // We can also look for our custom purpose field in the request

        if (paymentStatus === 'completed') {
            // Try to find order by paymentId first, then by orderId if in webhook
            const order = await Order.findOne({ paymentId: paymentId })
            if (order) {
                order.paymentStatus = 'completed'
                order.status = 'confirmed'  // Confirm order when payment completes
                await order.save()
                console.log(`✅ Order ${order.orderId} payment confirmed`)
            }
        } else if (paymentStatus === 'failed') {
            const order = await Order.findOne({ paymentId: paymentId })
            if (order) {
                order.paymentStatus = 'failed'
                order.status = 'cancelled'  // Cancel order if payment fails
                await order.save()
                console.log(`❌ Order ${order.orderId} payment failed`)
            }
        }
        res.status(500).json({ success: false, message: 'Webhook processing failed.' })
    }
})

module.exports = router
