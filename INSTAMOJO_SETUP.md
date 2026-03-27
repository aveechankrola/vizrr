# Instamojo Payment Gateway Setup

This guide explains how to set up Instamojo payment gateway for Keprates e-commerce platform.

## Prerequisites

1. **Instamojo Account**: If you don't have one, sign up at [instamojo.com](https://www.instamojo.com)
2. **API Credentials**: Visit your Instamojo merchant dashboard to get API Key and Auth Token

## Step 1: Get Instamojo API Credentials

1. Log in to your [Instamojo Dashboard](https://www.instamojo.com/dashboard)
2. Navigate to **Settings** → **API**
3. Copy your:
   - **API Key** (X-Api-Key)
   - **Auth Token** (X-Auth-Token)
4. Also note your **Webhook URL** (if you have a custom domain)

## Step 2: Set Environment Variables

In your `.env` file in the `server/` directory, add:

```env
INSTAMOJO_API_KEY=your_api_key_here
INSTAMOJO_AUTH_TOKEN=your_auth_token_here
INSTAMOJO_WEBHOOK_URL=https://api.keprates.in/api/payment/webhook
```

**⚠️ Important:**
- Replace `your_api_key_here` and `your_auth_token_here` with your actual credentials
- Keep these credentials **secret** - never commit them to git
- The webhook URL should match your production API domain

## Step 3: Verify Environment Variables

After adding to `.env`, restart your server:

```bash
cd server
npm install  # if you haven't already
npm run dev   # or npm start for production
```

## Step 4: Test Payment Flow

### Test in Development (localhost)

1. Go to your website on **localhost:5173**
2. Add items to cart and proceed to checkout
3. Select **"📱 Online Payment"** option
4. Fill in customer details and click **"Place Order"**
5. You'll be redirected to Instamojo test payment page

### Using Instamojo Test Credentials

For testing before going live:
- Instamojo provides test credentials in your dashboard
- Test cards are provided on the Instamojo payment page
- Use test API key/token for development, production credentials for live

## Step 5: Payment Flow

1. **Order Created**: Order is created in database with `paymentMethod: 'online'`
2. **Payment Link**: Backend creates Instamojo payment link via API
3. **Redirect**: Customer is redirected to Instamojo payment page
4. **Payment**: Customer completes payment securely
5. **Webhook**: Instamojo sends payment confirmation to `/api/payment/webhook`
6. **Success**: Customer is redirected back to Keprates website

## Step 6: Configure Webhook (Optional but Recommended)

To automatically update order status when payment is completed:

1. In Instamojo Dashboard → **Settings** → **Webhooks**
2. Add webhook URL: `https://api.keprates.in/api/payment/webhook`
3. Select events: `Payment.Completed`, `Payment.Failed`
4. Backend will receive payment status and update order accordingly

## Step 7: Deployment to Render

1. Add environment variables to Render dashboard:
   - Go to your service
   - **Environment** → Add these variables:
     - `INSTAMOJO_API_KEY`
     - `INSTAMOJO_AUTH_TOKEN`
     - `INSTAMOJO_WEBHOOK_URL` (use your production domain)

2. Redeploy your backend

## API Endpoints

### Create Payment Link
```
POST /api/payment/create-link
Content-Type: application/json

{
  "orderId": "ORDER_ID_123",
  "amount": 149.50,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+919876543210"
}

Response:
{
  "success": true,
  "data": {
    "paymentUrl": "https://www.instamojo.com/pay/...",
    "paymentId": "PAYMENT_ID"
  }
}
```

### Webhook (Receive Payment Status)
```
POST /api/payment/webhook

Instamojo sends payment_id and status to confirm payment
```

## Troubleshooting

### "Payment gateway error"
- Check that `INSTAMOJO_API_KEY` and `INSTAMOJO_AUTH_TOKEN` are set correctly
- Verify environment variables are loaded (restart server)
- Check Instamojo dashboard for any API issues

### Order not being saved
- Ensure MongoDB is connected and running
- Check server logs for database errors
- Verify order endpoint is working (test with `POST /api/orders`)

### Webhook not working
- Verify webhook URL is accessible from internet (not localhost)
- Check Instamojo dashboard for webhook delivery logs
- Ensure webhook URL matches exactly in settings and code

### Payment page not loading
- Verify credentials are correct
- Check if Instamojo service is up
- Try with different test card (Instamojo provides options)

## Payment Status Codes

- `completed` - Payment successful
- `failed` - Payment failed
- `pending` - Payment processing

## Testing Checklist

- [ ] Environment variables set in `.env`
- [ ] Server restarted after adding environment variables
- [ ] Can add products to cart
- [ ] Can proceed to checkout
- [ ] Can select "Online Payment" option
- [ ] Can fill checkout form
- [ ] Gets redirected to Instamojo payment page
- [ ] Can complete test payment
- [ ] Order appears in "My Orders" after payment

## Security Notes

- Never expose API keys in frontend code
- Keep webhook URL secure
- Validate webhook signatures if Instamojo provides them
- Use HTTPS in production (Render provides this automatically)
- Rotate API keys periodically for security

## Support

- **Instamojo Support**: https://support.instamojo.com
- **API Documentation**: https://docs.instamojo.com
- **Sandbox Testing**: Use test credentials provided in Instamojo dashboard

## Cash on Delivery (Alternative)

Orders can still be placed using "💵 Cash on Delivery" option without Instamojo:
- No payment gateway needed
- Customer pays on delivery
- Order is created immediately
- Payment status can be updated manually via admin panel
