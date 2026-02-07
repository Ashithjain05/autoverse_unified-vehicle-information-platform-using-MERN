import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import vehicleRoutes from './routes/vehicle.routes.js';
import showroomRoutes from './routes/showroom.routes.js';
import leadRoutes from './routes/lead.routes.js';
import aiRoutes from './routes/ai.routes.js';
import scraperRoutes from './routes/scraper.routes.js';
import scraperService from './services/scraper.service.js';
import cron from 'node-cron';

// Load environment variables
dotenv.config();

// Prevent crashes from uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('🔥 UNCAUGHT EXCEPTION:', err);
    // In production, we should restart, but in dev we might want to keep it alive or at least log it visibility
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 UNHANDLED REJECTION:', reason);
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (optional - only for auth/users/leads)
connectDB().catch(err => {
    console.warn('⚠️  Continuing without MongoDB - vehicle data will work via mock data');
    console.warn('   Auth, saved vehicles, and leads require MongoDB');
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Autoverse API is running',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/showrooms', showroomRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/scraper', scraperRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Autoverse Backend Server`);
    console.log(`   📡 Running on http://localhost:${PORT}`);
    console.log(`   🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   ✅ Health check: http://localhost:${PORT}/api/health\n`);

    // Schedule Cron Jobs
    // 1. Full scrape every Sunday and Wednesday at 2:00 AM
    cron.schedule('0 2 * * 0,3', async () => {
        console.log('⏰ Starting scheduled full scrape...');
        try {
            await scraperService.scrapeAll();
            console.log('✅ Scheduled scrape completed');
        } catch (error) {
            console.error('❌ Scheduled scrape failed:', error);
        }
    });

    // 2. Update stats/logs cleanup daily at 3:00 AM
    cron.schedule('0 3 * * *', async () => {
        console.log('⏰ Starting daily maintenance...');
        // Implement maintenance tasks if needed
    });
});
