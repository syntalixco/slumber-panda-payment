const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const Razorpay = require('razorpay');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'https://www.slumberpanda.com'],
  credentials: true
}));
// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Slumber Panda API Server is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Create Order endpoint
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', customerDetails } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Create order with Razorpay
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise and ensure integer
      currency,
      receipt: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notes: {
        customer_name: customerDetails?.name || '',
        customer_email: customerDetails?.email || '',
        customer_phone: customerDetails?.phone || '',
        created_at: new Date().toISOString()
      }
    });

    console.log('Order created:', order.id);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create order',
      message: error.message 
    });
  }
});

// Verify Payment endpoint
app.post('/api/verify-payment', async (req, res) => {
  try {
    console.log('Payment verification request received');
    
    // Extract payment data from request body
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    // Validate required fields - if any are missing, reject immediately
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.log('Invalid payment verification request - missing required fields');
      return res.status(400).json({ 
        success: false,
        verified: false,
        error: 'Missing required payment verification data',
        message: 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required'
      });
    }

    // Create signature for verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'hXeJI4VRm8WRc3pDtARwKCxb')
      .update(body.toString())
      .digest('hex');

    // Verify signature
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      console.log('Payment verified successfully:', razorpay_payment_id);
      
      res.status(200).json({
        success: true,
        verified: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        message: 'Payment verified successfully'
      });
    } else {
      console.log('Payment verification failed:', razorpay_payment_id);
      
      res.status(400).json({
        success: false,
        verified: false,
        error: 'Payment verification failed',
        message: 'Invalid payment signature'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      success: false,
      verified: false,
      error: 'Payment verification error',
      message: error.message 
    });
  }
});

// JSON parsing error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.log('JSON parse error:', err.message);
    console.log('Raw request details:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    });
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON format',
      message: 'Request body contains malformed JSON'
    });
  }
  next(err);
});

// General error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Slumber Panda API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
  console.log(`💳 Create Order: http://localhost:${PORT}/api/create-order`);
  console.log(`✅ Verify Payment: http://localhost:${PORT}/api/verify-payment`);
});

module.exports = app;