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
import HeroSlide from './modules/property/HeroSlide.js';
import { initImportScheduler } from './modules/property/importScheduler.js';

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
    await initImportScheduler();
    
    // Seed default hero slides if collection is empty
    try {
      const slideCount = await HeroSlide.countDocuments();
      if (slideCount === 0) {
        console.log('[Seed] Seeding default Hero Slides...');
        await HeroSlide.insertMany([
          {
            image: '/club_team_photo.png',
            tag: 'Cộng đồng FindX',
            title: 'Đội ngũ Core Team FindX',
            description: 'Nơi kết nối và mang đến những giải pháp phòng trọ tối ưu cho sinh viên FTU.',
            badgeText: 'CLB Hỗ trợ sinh viên',
            link: 'https://www.facebook.com/FTU.HousingBank',
            order: 1
          },
          {
            image: '/university_activities.png',
            tag: 'Hoạt động nổi bật',
            title: 'Hành trình cùng Tân sinh viên',
            description: 'Chương trình đồng hành hỗ trợ tìm kiếm nhà trọ an toàn, giá tốt đầu khóa học.',
            badgeText: 'Sự kiện 2026',
            link: 'https://www.facebook.com/FTU.HousingBank',
            order: 2
          },
          {
            image: '/student_room_hero.png',
            tag: 'Phòng trọ kiểu mẫu',
            title: 'Không gian sống thông minh',
            description: 'Gợi ý các căn hộ studio đẹp mắt, gần trường đại học tại Hà Nội & TP.HCM.',
            badgeText: 'Xác thực 100%',
            link: '/search',
            order: 3
          }
        ]);
        console.log('[Seed] Default Hero Slides seeded successfully.');
      }
    } catch (seedErr) {
      console.error('[Seed] Failed to seed Hero Slides:', seedErr.message);
    }
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
