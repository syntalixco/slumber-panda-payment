# Slumber Panda API Server

Standalone Express.js API server for Slumber Panda payment processing with Razorpay integration.

## Features

- 🚀 Express.js REST API
- 💳 Razorpay payment integration
- 🔒 Secure payment verification
- 🌐 CORS enabled for frontend integration
- 📦 Ready for Render deployment

## API Endpoints

### Health Check
- **GET** `/` - Server health status

### Payment Processing
- **POST** `/api/create-order` - Create Razorpay order
- **POST** `/api/verify-payment` - Verify payment signature

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Razorpay credentials.

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:3001`

4. **Start production server:**
   ```bash
   npm start
   ```

## Deployment to Render

### Option 1: Connect GitHub Repository

1. Push this `api-server` folder to a GitHub repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name:** `slumber-panda-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free` (or paid for production)

### Option 2: Manual Deploy

1. Create a new repository with just the `api-server` contents
2. Follow Option 1 steps

### Environment Variables on Render

In your Render service settings, add these environment variables:

```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NODE_ENV=production
```

## Frontend Integration

Update your frontend `paymentService.js` to use the Render API URL:

```javascript
// Replace localhost URLs with your Render service URL
const API_BASE_URL = 'https://your-service-name.onrender.com';

// In createRazorpayOrder function:
const response = await fetch(`${API_BASE_URL}/api/create-order`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount, currency, customerDetails })
});

// In verifyPayment function:
const response = await fetch(`${API_BASE_URL}/api/verify-payment`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(verificationData)
});
```

## Security Notes

- ✅ Environment variables for sensitive data
- ✅ CORS configured for specific origins
- ✅ Input validation on all endpoints
- ✅ Secure payment signature verification
- ✅ Error handling without exposing sensitive info

## Testing

Test the API endpoints:

```bash
# Health check
curl https://your-service-name.onrender.com/

# Create order (replace with actual data)
curl -X POST https://your-service-name.onrender.com/api/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "customerDetails": {"name": "Test User"}}'
```

## Support

For issues or questions, please check:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Render Documentation](https://render.com/docs)
- [Express.js Documentation](https://expressjs.com/)