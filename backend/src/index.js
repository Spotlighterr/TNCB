import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

import authRoutes from './modules/auth/authRoutes.js';
import propertyRoutes from './modules/property/propertyRoutes.js';
import ticketRoutes from './modules/ticket/ticketRoutes.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';
import { initPropertyBloomFilter } from './modules/property/propertyBloomFilter.js';

// Load environment variables
dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Nginx)
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Database Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tncb';
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully.');
    await initPropertyBloomFilter();
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
  });

// Mount Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/properties', apiLimiter, propertyRoutes);
app.use('/api/tickets', apiLimiter, ticketRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FindX - TNCB API Server is running smoothly',
    timestamp: new Date()
  });
});


// Start Server
app.listen(PORT, () => {
  console.log(`🚀 API Server is running on port ${PORT}`);
  console.log(`🔗 Health check available at: http://localhost:${PORT}/api/health`);
});
