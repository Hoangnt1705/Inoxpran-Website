// src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { default: helmet } = require('helmet');
const compression = require('compression');

// Init shared connections early (Redis, etc.)
// require('./config/redis'); // safe to require; handles its own connect

// Middleware
// const { rateLimitCommon, rateLimitStrict } = require('./middleware/rateLimit');

// Routes
// const webhookRoutes = require('./routes/webhook.routes'); // contains route-scoped raw body for Stripe
// const authRoutes = require('./routes/auth.routes');
// const productRoutes = require('./routes/product.routes');
// const cartRoutes = require('./routes/cart.routes');
// const orderRoutes = require('./routes/order.routes');
// const couponRoutes = require('./routes/coupon.routes');
// const reviewRoutes = require('./routes/review.routes');
// const uploadRoutes = require('./routes/upload.routes');
// const paymentRoutes = require('./routes/payment.routes');
// const adminRoutes = require('./routes/admin.routes');

const app = express();

// Security & logs
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
// morgan("compile");
// morgan("short");
// morgan("tiny");
// morgan(dev);
app.use(helmet());
app.use(compression());


//init db
require("./dbs/init.mongodb")
const { checkOverload } = require('./helpers/check.connect');
checkOverload(); 
// Stripe requires RAW body on its webhook route.
// The route file uses `express.raw` on that specific path,
// so we must mount /webhooks BEFORE the global JSON parser.
// app.use('/webhooks', rateLimitStrict, webhookRoutes);

// Global JSON parser for the rest of the API
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' })); 

// Rate limit (general) for normal API traffic
// app.use(rateLimitCommon);

// Health check
app.use('/', require('./routes'));

// // Feature routes
// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/coupons', couponRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/upload', uploadRoutes);
// app.use('/api/payments', rateLimitStrict, paymentRoutes);
// app.use('/api/admin', adminRoutes);

// Centralized error handler
// eslint-disable-next-line no-unused-vars

app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
})

app.use((error, req, res, next) => {
  const statusCode = error.status || 500
  return res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    message: error.message || 'Internal Server Error'
  })
})

module.exports = app;
