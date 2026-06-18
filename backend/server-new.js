require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pool = require('./config/database');

const itineraryRoutes = require('./routes/itinerary');
const adminRoutes = require('./routes/admin');
const mapRoutes = require('./routes/map');
const authRoutes = require('./routes/auth');
const expertSystemRoutes = require('./routes/expertSystem');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
}));

// Rate limiting - Increased for development
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 200, // 200 requests per minute
    message: { success: false, error: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/pdfs', express.static('pdfs'));

// Helper functions
function parseTags(tagsData) {
    if (!tagsData) return [];
    try {
        if (typeof tagsData === 'string' && tagsData.startsWith('[')) {
            return JSON.parse(tagsData);
        }
        if (typeof tagsData === 'string') {
            return tagsData.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
        if (Array.isArray(tagsData)) {
            return tagsData;
        }
    } catch (error) {
        console.log('⚠️ Error parsing tags:', tagsData);
    }
    return [];
}

function parseCities(citiesData) {
    if (!citiesData) return [];
    try {
        if (typeof citiesData === 'string' && citiesData.startsWith('[')) {
            return JSON.parse(citiesData);
        }
        if (typeof citiesData === 'string') {
            return [citiesData.trim()];
        }
        if (Array.isArray(citiesData)) {
            return citiesData;
        }
    } catch (error) {
        console.log('⚠️ Error parsing cities:', citiesData);
    }
    return [];
}

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/expert-system', expertSystemRoutes);
app.use('/api/chat', chatRoutes);

// Existing routes (keep your chatbot and other routes)
app.get('/api/packages', async (req, res) => {
    try {
        const [packageData] = await pool.execute(`
            SELECT package_id, package_name, package_type, description, duration_days,
                   price_per_person_usd, per_person_cost, included_activities,
                   included_meal_plans, accommodation_type, transport_included,
                   transport_type, image_urls, routes
            FROM packages
        `);
        res.json(packageData);
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.get('/api/packages/:id', async (req, res) => {
    try {
        const [packageData] = await pool.execute(
            'SELECT * FROM packages WHERE package_id = ?',
            [req.params.id]
        );
        if (packageData.length === 0) {
            return res.status(404).json({ success: false, error: 'Package not found' });
        }
        res.json(packageData[0]);
    } catch (error) {
        console.error('Error fetching package:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.get('/api/destinations', async (req, res) => {
    try {
        const [destinations] = await pool.execute(`
            SELECT destination_id, destination_name, type, description, latitude, longitude,
                   best_visit_start, best_visit_end, image_url, tags
            FROM destinations
        `);
        
        if (!destinations || destinations.length === 0) {
            return res.json([]);
        }
        
        const transformedDestinations = destinations.map(dest => ({
            destination_id: dest.destination_id,
            destination_name: dest.destination_name,
            type: dest.type,
            latitude: dest.latitude ? parseFloat(dest.latitude) : null,
            longitude: dest.longitude ? parseFloat(dest.longitude) : null,
            best_season_start: dest.best_visit_start || 'jan',
            best_season_end: dest.best_visit_end || 'dec',
            tags: parseTags(dest.tags)
        })).filter(dest => dest.latitude && dest.longitude); // Filter out invalid coordinates
        
        res.json(transformedDestinations);
    } catch (error) {
        console.error('Error fetching destinations:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.get('/api/activities', async (req, res) => {
    try {
        const [allActivities] = await pool.execute(`
            SELECT activity_id, activity_name, type, description, duration_hours,
                   intensity, price_range, tags, cities
            FROM activities
        `);
        const transformedActivities = allActivities.map(activity => ({
            activity_id: activity.activity_id,
            activity_name: activity.activity_name,
            type: activity.type,
            description: activity.description,
            duration: activity.duration_hours || 2,
            intensity: activity.intensity || 'medium',
            price_range: activity.price_range || 'moderate',
            tags: parseTags(activity.tags),
            cities: parseCities(activity.cities)
        }));
        res.json(transformedActivities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.json([]);
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📍 API endpoints:`);
    console.log(`   GET  /api/health`);
    console.log(`   GET  /api/destinations`);
    console.log(`   GET  /api/packages`);
    console.log(`   POST /api/itinerary/generate`);
    console.log(`   GET  /api/map/destinations`);
    console.log(`   POST /api/admin/destinations (protected)`);
    console.log(`   POST /api/expert-system/recommend`);
    console.log(`   GET  /api/expert-system/weights`);
    console.log(`   POST /api/chat/message`);
});

module.exports = app;
