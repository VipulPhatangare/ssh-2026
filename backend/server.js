const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { initGridFS } = require('./config/gridfs');
const translationMiddleware = require('./middleware/translationMiddleware');
const translationCache = require('./services/translationCache');

// Load env vars from root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Connect to database
connectDB();

const app = express();

// Initialize GridFS after MongoDB connection is ready
mongoose.connection.once('open', () => {
  try {
    initGridFS(mongoose.connection);
    console.log('✓ GridFS initialized successfully');
  } catch (error) {
    console.error('Error initializing GridFS:', error.message);
  }
});

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS — allow any localhost port in development so 3000/3001 both work
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// ── EJS view engine (for server-side rendered pages) ────────────────────────
// Remove or skip this block if the project is API-only (React SPA).
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Dynamic translation middleware ──────────────────────────────────────────
// Reads ?lng=<code> from every request and patches res.json() / res.render()
// to translate responses into the requested language at runtime.
// English (?lng=en or no lng param) is a zero-cost no-op.
app.use(translationMiddleware);

// Middleware to make GridFS bucket available to routes
app.use((req, res, next) => {
  // GridFS bucket will be available after MongoDB connection
  // Routes that need it will check if it exists
  next();
});

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/schemes', require('./routes/schemeRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/grievances', require('./routes/grievanceRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ai', require('./routes/uploadRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.noTranslate = true;   // system data — never translate
  res.status(200).json({
    success: true,
    message: 'Server is running'
  });
});

// Translation cache stats (useful for APM / admin monitoring)
app.get('/api/translation/cache-stats', (req, res) => {
  res.noTranslate = true;
  res.json({ success: true, cache: translationCache.stats() });
});

// Flush translation cache (admin only — protect this in production)
app.post('/api/translation/cache-flush', (req, res) => {
  translationCache.flush();
  res.json({ success: true, message: 'Translation cache flushed.' });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
