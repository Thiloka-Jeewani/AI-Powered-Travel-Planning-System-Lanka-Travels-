require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/pdfs', express.static('pdfs'));

// Database connection
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Aabid2004@',
    database: 'lank_vac_SLIIT',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Flask AI API URL
const FLASK_AI_API = 'http://localhost:5000/api';

// ========== AI PROXY ENDPOINTS (UNCHANGED) ==========

app.get('/api/destinations', async (req, res) => {
    try {
        const response = await fetch(`${FLASK_AI_API}/destinations`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('❌ Error proxying to Flask API:', error);
        res.status(500).json({ error: 'AI Service unavailable' });
    }
});


app.get('/api/debug-test', (req, res) => {
    console.log('✅ Debug test endpoint called');
    res.json({
        success: true,
        message: 'Server is running!',
        time: new Date().toISOString()
    });
});

app.all('/api/*', (req, res, next) => {
    console.log(`📝 API Route called: ${req.method} ${req.originalUrl}`);
    next();
});


app.post('/api/ai-recommend', async (req, res) => {
    try {
        const response = await fetch(`${FLASK_AI_API}/ai-recommend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('❌ Error proxying AI recommendation:', error);
        res.status(500).json({ error: 'AI Recommendation service unavailable' });
    }
});

app.get('/api/activities', async (req, res) => {
    try {
        const response = await fetch(`${FLASK_AI_API}/activities`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('❌ Error proxying activities:', error);
        res.status(500).json({ error: 'AI Activities service unavailable' });
    }
});

app.get('/api/hotels', async (req, res) => {
    try {
        const response = await fetch(`${FLASK_AI_API}/hotels`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('❌ Error proxying hotels:', error);
        res.status(500).json({ error: 'AI Hotels service unavailable' });
    }
});

// DIRECT SAVE - no Flask involved
app.post('/api/questionnaire', async (req, res) => {
    try {
        // Direct MySQL save
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'lank_vac_SLIIT'
        });

        const response_id = 'QRES' + Date.now();

        const [result] = await connection.execute(
            `INSERT INTO questionnaire_responses (...) VALUES (...)`,
            [...params]
        );

        await connection.end();

        res.json({ success: true, response_id });

    } catch (error) {
        console.error('❌ Error saving questionnaire:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/generate-itinerary', async (req, res) => {
    try {
        const response = await fetch(`${FLASK_AI_API}/generate-itinerary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('❌ Error proxying itinerary generation:', error);
        res.status(500).json({ error: 'AI Itinerary service unavailable' });
    }
});

app.get('/api/map/destinations', async (req, res) => {
    try {
        const response = await fetch(`${FLASK_AI_API}/map/destinations`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('❌ Error proxying map destinations:', error);
        res.status(500).json({ error: 'AI Map service unavailable' });
    }
});

// ========== PACKAGES ENDPOINTS (UNCHANGED) ==========

// ========== PACKAGES ENDPOINTS FIXED ==========

app.get('/api/packages', async (req, res) => {
    try {
        const [packages] = await pool.execute(`
            SELECT
                package_id,
                package_name,
                package_type,
                description,
                duration_days,
                per_person_cost,
                price_per_person_usd,
                included_activities,
                accommodation_type,
                transport_included,
                image_urls,
                routes,
                max_group_size,
                min_group_size,
                availability_status,
                created_at
            FROM packages
            WHERE is_active = TRUE
            ORDER BY created_at DESC
        `);

        // Parse JSON fields
        const parsedPackages = packages.map(pkg => {
            const parsed = { ...pkg };

            // Generate frontend-friendly ID
            parsed.frontend_id = `PKG-${parsed.package_id.replace('PKG', '')}`;

            // Parse JSON strings to arrays/objects
            const jsonFields = ['image_urls', 'routes', 'included_activities'];
            jsonFields.forEach(field => {
                if (parsed[field] && typeof parsed[field] === 'string') {
                    try {
                        parsed[field] = JSON.parse(parsed[field]);
                    } catch (e) {
                        parsed[field] = [];
                    }
                }
            });

            // Ensure image_urls is always an array
            if (!parsed.image_urls || !Array.isArray(parsed.image_urls)) {
                parsed.image_urls = [];
            }

            // Add default image if none available
            if (parsed.image_urls.length === 0) {
                parsed.image_urls = ['https://images.unsplash.com/photo-1564574662336-88c9f5a6c8d9'];
            }

            return parsed;
        });

        res.json(parsedPackages);
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/packages/:packageId', async (req, res) => {
    try {
        let { packageId } = req.params;

        // Convert frontend ID (PKG-001) to database ID (PKG001)
        if (packageId.includes('-')) {
            packageId = `PKG${packageId.split('-')[1]}`;
        }

        const [packages] = await pool.execute(
            `SELECT * FROM packages WHERE package_id = ? AND is_active = TRUE`,
            [packageId]
        );

        if (packages.length === 0) {
            return res.status(404).json({ error: 'Package not found' });
        }

        const packageData = packages[0];

        // Add frontend ID
        packageData.frontend_id = `PKG-${packageData.package_id.replace('PKG', '')}`;

        // Parse JSON fields
        const jsonFields = ['routes', 'image_urls', 'included_activities'];
        jsonFields.forEach(field => {
            if (packageData[field] && typeof packageData[field] === 'string') {
                try {
                    packageData[field] = JSON.parse(packageData[field]);
                } catch (e) {
                    packageData[field] = [];
                }
            }
        });

        // Ensure image_urls is an array
        if (!Array.isArray(packageData.image_urls)) {
            packageData.image_urls = [];
        }

        // Add default image if none available
        if (packageData.image_urls.length === 0) {
            packageData.image_urls = ['https://images.unsplash.com/photo-1564574662336-88c9f5a6c8d9'];
        }

        res.json(packageData);

    } catch (error) {
        console.error('Error fetching package detail:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/map/package/:packageId/route', async (req, res) => {
    try {
        let { packageId } = req.params;

        // Convert frontend ID (PKG-001) to database ID (PKG001)
        if (packageId.includes('-')) {
            packageId = `PKG${packageId.split('-')[1]}`;
        }

        const [packages] = await pool.execute(
            `SELECT routes FROM packages WHERE package_id = ?`,
            [packageId]
        );

        if (packages.length === 0) {
            return res.status(404).json({ error: 'Package not found' });
        }

        const packageData = packages[0];
        let routes = [];

        // Parse routes
        if (packageData.routes) {
            try {
                if (typeof packageData.routes === 'string') {
                    routes = JSON.parse(packageData.routes);
                } else if (Array.isArray(packageData.routes)) {
                    routes = packageData.routes;
                }
            } catch (error) {
                console.error('Error parsing routes:', error);
            }
        }

        // Convert routes to map coordinates
        const routeCoordinates = routes.map((route, index) => {
            // Generate coordinates based on Sri Lanka location if not provided
            const lat = route.lat || route.latitude || getRandomSriLankaLat();
            const lng = route.lng || route.longitude || getRandomSriLankaLng();

            return {
                id: `day-${route.day || index + 1}`,
                name: route.location || `Destination ${index + 1}`,
                lat: lat,
                lng: lng,
                type: 'destination',
                day: route.day || index + 1,
                location: route.location || `Location ${index + 1}`,
                description: route.description || ''
            };
        });

        // Calculate approximate total distance
        const totalDistance = calculateTotalDistance(routeCoordinates);

        res.json({
            success: true,
            route: routeCoordinates,
            totalDistance: totalDistance,
            packageId: packageId
        });

    } catch (error) {
        console.error('Error fetching package route:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            route: []
        });
    }
});

app.get('/api/packages/:packageId', async (req, res) => {
    try {
        const { packageId } = req.params;

        const [packages] = await pool.execute(
            `SELECT * FROM packages WHERE package_id = ? AND is_active = TRUE`,
            [packageId]
        );

        if (packages.length === 0) {
            return res.status(404).json({ error: 'Package not found' });
        }

        const packageData = packages[0];

        // Parse JSON fields
        if (packageData.routes && typeof packageData.routes === 'string') {
            try {
                packageData.routes = JSON.parse(packageData.routes);
            } catch (e) {
                packageData.routes = [];
            }
        }

        if (packageData.image_urls && typeof packageData.image_urls === 'string') {
            try {
                packageData.image_urls = JSON.parse(packageData.image_urls);
            } catch (e) {
                packageData.image_urls = [];
            }
        }

        if (packageData.included_activities && typeof packageData.included_activities === 'string') {
            try {
                packageData.included_activities = JSON.parse(packageData.included_activities);
            } catch (e) {
                packageData.included_activities = [];
            }
        }

        // Ensure image_urls is an array
        if (!Array.isArray(packageData.image_urls)) {
            packageData.image_urls = [];
        }

        // Add default image if none available
        if (packageData.image_urls.length === 0) {
            packageData.image_urls = ['https://images.unsplash.com/photo-1564574662336-88c9f5a6c8d9'];
        }

        res.json(packageData);

    } catch (error) {
        console.error('Error fetching package detail:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/map/package/:packageId/route', async (req, res) => {
    try {
        const { packageId } = req.params;

        const [packages] = await pool.execute(
            `SELECT routes FROM packages WHERE package_id = ?`,
            [packageId]
        );

        if (packages.length === 0) {
            return res.status(404).json({ error: 'Package not found' });
        }

        const packageData = packages[0];
        let routes = [];

        // Parse routes
        if (packageData.routes) {
            try {
                if (typeof packageData.routes === 'string') {
                    routes = JSON.parse(packageData.routes);
                } else if (Array.isArray(packageData.routes)) {
                    routes = packageData.routes;
                }
            } catch (error) {
                console.error('Error parsing routes:', error);
            }
        }

        // Convert routes to map coordinates
        const routeCoordinates = routes.map((route, index) => {
            // Generate coordinates based on Sri Lanka location if not provided
            const lat = route.lat || route.latitude || getRandomSriLankaLat();
            const lng = route.lng || route.longitude || getRandomSriLankaLng();

            return {
                id: `day-${route.day || index + 1}`,
                name: route.location || `Destination ${index + 1}`,
                lat: lat,
                lng: lng,
                type: 'destination',
                day: route.day || index + 1,
                location: route.location || `Location ${index + 1}`,
                description: route.description || ''
            };
        });

        // Calculate approximate total distance
        const totalDistance = calculateTotalDistance(routeCoordinates);

        res.json({
            success: true,
            route: routeCoordinates,
            totalDistance: totalDistance,
            packageId: packageId
        });

    } catch (error) {
        console.error('Error fetching package route:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            route: []
        });
    }
});

function getRandomSriLankaLat() {
    return 6.0 + (Math.random() * 4.0);
}

function getRandomSriLankaLng() {
    return 79.0 + (Math.random() * 3.0);
}

function calculateTotalDistance(coordinates) {
    if (coordinates.length < 2) return 0;

    let total = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
        const lat1 = coordinates[i].lat;
        const lon1 = coordinates[i].lng;
        const lat2 = coordinates[i + 1].lat;
        const lon2 = coordinates[i + 1].lng;

        // Simple distance approximation
        const distance = Math.sqrt(
            Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2)
        ) * 111;

        total += Math.abs(distance);
    }

    return Math.round(total);
}

// ========== FIXED BOOKING ENDPOINT ==========
app.post('/api/book-package', async (req, res) => {
    console.log('📦 Package booking request received:', req.body);

    try {
        const {
            package_id,
            user_details,
            total_cost = 0,
            adults = 1,
            children = 0
        } = req.body;

        // Validate required fields
        if (!package_id || !user_details) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: package_id and user_details are required'
            });
        }

        if (!user_details.full_name || !user_details.email || !user_details.phone || !user_details.country) {
            return res.status(400).json({
                success: false,
                error: 'Missing required user details: full_name, email, phone, and country are required'
            });
        }

        // Generate unique IDs
        const booking_id = `BOOK_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const user_id = `USER_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Get package details
        let package_name = 'Tour Package';
        let per_person_cost = 0;

        try {
            const [packageData] = await pool.execute(
                'SELECT package_name, per_person_cost FROM packages WHERE package_id = ?',
                [package_id]
            );

            if (packageData.length > 0) {
                package_name = packageData[0].package_name;
                per_person_cost = packageData[0].per_person_cost;
            } else {
                console.log('⚠️ Package not found, using default name');
            }
        } catch (error) {
            console.log('⚠️ Could not fetch package details:', error.message);
        }

        // Check if user exists by email
        const [existingUsers] = await pool.query(
            'SELECT user_id FROM users WHERE email = ?',
            [user_details.email]
        );

        let finalUserId;
        if (existingUsers.length > 0) {
            finalUserId = existingUsers[0].user_id;
            // Update user if exists - FIXED COLUMN MAPPING
            await pool.query(
                `UPDATE users SET 
                    full_name = ?, 
                    phone = ?, 
                    country = ?, 
                    city = ?,
                    whatsapp_number = ?,
                    passport_number = ?
                 WHERE user_id = ?`,
                [
                    user_details.full_name,
                    user_details.phone,
                    user_details.country,
                    user_details.city || '',
                    user_details.emergency_contact || user_details.phone || '',
                    user_details.passport_number || '',
                    finalUserId
                ]
            );
            console.log('✅ User updated:', finalUserId);
        } else {
            // Create new user - FIXED COLUMN MAPPING
            finalUserId = user_id;
            await pool.query(
                `INSERT INTO users (
                    user_id, 
                    full_name, 
                    email, 
                    phone, 
                    country, 
                    city, 
                    whatsapp_number,
                    passport_number,
                    account_status,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
                [
                    finalUserId,
                    user_details.full_name,
                    user_details.email,
                    user_details.phone,
                    user_details.country,
                    user_details.city || '',
                    user_details.emergency_contact || user_details.phone || '',
                    user_details.passport_number || ''
                ]
            );
            console.log('✅ User created:', finalUserId);
        }

        // Create booking - FIXED: added passport_number field
        await pool.query(
            `INSERT INTO bookings (
                booking_id, 
                user_id, 
                package_id, 
                package_name, 
                full_name, 
                email, 
                phone, 
                country, 
                city,
                passport_number,
                emergency_contact, 
                special_requirements, 
                adults_count, 
                children_count, 
                total_cost,
                booking_status, 
                payment_status,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                booking_id,
                finalUserId,
                package_id,
                package_name,
                user_details.full_name,
                user_details.email,
                user_details.phone,
                user_details.country,
                user_details.city || '',
                user_details.passport_number || '',
                user_details.emergency_contact || user_details.phone || '',
                user_details.special_requirements || '',
                adults,
                children,
                total_cost,
                'pending',
                'pending'
            ]
        );

        console.log('✅ Package booking created successfully:', booking_id);

        res.json({
            success: true,
            message: 'Package booking submitted successfully',
            booking_id: booking_id,
            user_id: finalUserId,
            package_id: package_id,
            package_name: package_name,
            total_cost: total_cost,
            email: user_details.email,
            payment_redirect: true
        });

    } catch (error) {
        console.error('❌ Package booking error:', error);
        res.status(500).json({
            success: false,
            error: 'Database error',
            details: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage || 'No SQL message available'
        });
    }
});

app.get('/api/packages/:packageId/availability', async (req, res) => {
    try {
        const { packageId } = req.params;

        const [packageData] = await pool.execute(
            `SELECT availability_status, max_group_size FROM packages WHERE package_id = ?`,
            [packageId]
        );

        if (packageData.length === 0) {
            return res.status(404).json({ error: 'Package not found' });
        }

        const [bookings] = await pool.execute(
            `SELECT COUNT(*) as booked_count FROM bookings 
             WHERE package_id = ? AND booking_status IN ('confirmed', 'paid')`,
            [packageId]
        );

        const bookedCount = bookings[0]?.booked_count || 0;
        const maxCapacity = packageData[0].max_group_size;
        const availableSpots = maxCapacity - bookedCount;

        res.json({
            package_id: packageId,
            availability_status: packageData[0].availability_status,
            max_capacity: maxCapacity,
            booked_count: bookedCount,
            available_spots: availableSpots,
            is_available: availableSpots > 0
        });
    } catch (error) {
        console.error('Error fetching package availability:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========== OTHER BOOKINGS ENDPOINTS (UNCHANGED) ==========

app.post('/api/calculate-price', async (req, res) => {
    try {
        const { package_id, adults, children } = req.body;

        const [packageData] = await pool.execute(
            'SELECT per_person_cost FROM packages WHERE package_id = ?',
            [package_id]
        );

        if (packageData.length === 0) {
            return res.status(404).json({ error: 'Package not found' });
        }

        const perPersonCost = packageData[0].per_person_cost;
        const adultCost = adults * perPersonCost;
        const childCost = children * (perPersonCost / 2);
        const totalCost = adultCost + childCost;

        res.json({
            adultCost,
            childCost,
            totalCost,
            perPersonCost,
            adults,
            children
        });
    } catch (error) {
        console.error('Error calculating price:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/update-payment', async (req, res) => {
    try {
        const { booking_id, payment_status, payment_amount } = req.body;

        await pool.query(
            `UPDATE bookings SET 
                payment_status = ?,
                payment_amount = ?,
                booking_status = 'confirmed'
             WHERE booking_id = ?`,
            [payment_status, payment_amount, booking_id]
        );

        res.json({
            success: true,
            message: 'Payment status updated successfully'
        });
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/bookings/:email', async (req, res) => {
    try {
        const [bookings] = await pool.execute(
            `SELECT b.*, p.package_name, p.image_urls
             FROM bookings b
             LEFT JOIN packages p ON b.package_id = p.package_id
             LEFT JOIN users u ON b.user_id = u.user_id
             WHERE u.email = ? OR b.email = ?`,
            [req.params.email, req.params.email]
        );

        // Parse image_urls
        const parsedBookings = bookings.map(booking => {
            if (booking.image_urls && typeof booking.image_urls === 'string') {
                try {
                    booking.image_urls = JSON.parse(booking.image_urls);
                } catch (e) {
                    booking.image_urls = [];
                }
            }
            return booking;
        });

        res.json(parsedBookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/bookings', async (req, res) => {
    try {
        const [bookings] = await pool.execute(`
            SELECT b.*, p.package_name, u.email, u.full_name
            FROM bookings b
                     LEFT JOIN packages p ON b.package_id = p.package_id
                     LEFT JOIN users u ON b.user_id = u.user_id
            ORDER BY b.created_at DESC
        `);
        res.json({ success: true, bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// ========== CHATBOT ENDPOINTS (UNCHANGED) ==========

app.post('/api/chat/message', async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        console.log('🤖 Chatbot received message:', message);

        // Try AI-based response first via Flask
        try {
            const aiResponse = await fetch(`${FLASK_AI_API}/chat/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, sessionId })
            });

            if (aiResponse.ok) {
                const data = await aiResponse.json();
                return res.json(data);
            }
        } catch (aiError) {
            console.log('⚠️ Flask chatbot not available, using local logic');
        }

        // Local fallback logic
        const response = await generateChatResponse(message);
        res.json({
            response: response.text,
            data: response.data || null
        });
    } catch (error) {
        console.error('Error processing chat message:', error);
        res.status(500).json({
            response: "🤖 **AI Lanka Vacations Agent**\n\nI'm experiencing technical difficulties. Please try again later or contact our support team for assistance.",
            data: null
        });
    }
});

async function generateChatResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    // Check if this should go to AI
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') ||
        lowerMessage.includes('where should') || lowerMessage.includes('best place')) {
        return {
            text: "🤖 **AI Lanka Vacations Agent**\n\nFor personalized destination recommendations, please use our **AI Travel Planner** which analyzes your interests and preferences using machine learning!\n\nYou can access it from the main menu or click 'Plan Your Trip'.",
            data: { redirectToAI: true }
        };
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return {
            text: "🤖 **AI Lanka Vacations Agent**\n\nHello! I'm your AI travel assistant for Lanka Vacations. How can I help you plan your Sri Lanka adventure today?",
            data: null
        };
    }

    if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
        return {
            text: "🤖 **AI Lanka Vacations Agent**\n\n📞 **Contact Information:**\n\n• 📧 Email: clientservice@lanka-vacations.com\n• 📱 Phone: +94 777 325 515\n• 🌐 Website: www.lanka-vacations.com\n• 📍 Address: 43 St Anthony's Mawatha, Colombo 00300, Sri Lanka\n\nOur team is available 24/7 to assist you!",
            data: null
        };
    }

    if (lowerMessage.includes('booking') || lowerMessage.includes('reservation') || lowerMessage.includes('book')) {
        return {
            text: "🤖 **AI Lanka Vacations Agent**\n\n📋 **Booking Information:**\n\nYou can make bookings through:\n\n1. **AI Travel Planner** - Create personalized itinerary and book\n2. **Packages Page** - Book pre-designed tour packages\n3. **Contact Form** - Send us your requirements\n\nAll bookings include 24/7 support and can be customized!",
            data: null
        };
    }

    // Default response
    return {
        text: `🤖 **AI Lanka Vacations Agent**\n\nI understand you're asking about: "${userMessage}"\n\nI can help you with:\n\n• 🤖 **AI Travel Planning** - Personalized recommendations\n• 📦 **Tour packages** & bookings\n• 🏨 **Hotel information**\n• 📍 **General Sri Lanka travel advice**\n• 📞 **Contact information**\n\nFor AI-powered destination recommendations, try our **Travel Planner**!`,
        data: null
    };
}

// ========== FIXED PDF GENERATION ==========

app.get('/api/generate-pdf/:packageId', async (req, res) => {
    try {
        const packageId = req.params.packageId;

        const [packageData] = await pool.execute(
            'SELECT * FROM packages WHERE package_id = ?',
            [packageId]
        );

        if (packageData.length === 0) {
            return res.status(404).json({ error: 'Package not found' });
        }

        const packageItem = packageData[0];
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            bufferPages: true, // Enable page buffering
            info: {
                Title: `Itinerary - ${packageItem.package_name}`,
                Author: 'Lanka Vacations',
                Subject: 'Tour Package Itinerary'
            }
        });

        // Create pdfs directory if it doesn't exist
        if (!fs.existsSync('pdfs')) {
            fs.mkdirSync('pdfs');
        }

        const filename = `itinerary-${packageId}-${Date.now()}.pdf`;
        const filepath = path.join(__dirname, 'pdfs', filename);

        const writeStream = fs.createWriteStream(filepath);
        doc.pipe(writeStream);

        // Helper function to check page breaks
        const checkPageBreak = (requiredHeight) => {
            const bottomMargin = 50;
            const pageHeight = doc.page.height;
            if (doc.y + requiredHeight > pageHeight - bottomMargin) {
                doc.addPage();
                return true;
            }
            return false;
        };

        // ========== HEADER SECTION ==========
        doc.fillColor('#f97a1f').rect(0, 0, 600, 100).fill();

        // Company Name
        doc.fillColor('#ffffff')
            .fontSize(24)
            .font('Helvetica-Bold')
            .text('LANKA VACATIONS', 50, 30);

        doc.fillColor('#ffffff')
            .fontSize(12)
            .font('Helvetica')
            .text('AI-Powered Travel Partner in Sri Lanka', 50, 60);

        // Contact Info
        doc.fillColor('#ffffff')
            .fontSize(9)
            .text('43 St Anthony\'s Mawatha, Colombo 00300, Sri Lanka', 350, 35);
        doc.text('Tel: +94 777 325 515 | +94 112 577 285', 350, 50);
        doc.text('Email: clientservice@lanka-vacations.com', 350, 65);
        doc.text('Website: www.lanka-vacations.com', 350, 80);

        // Package Title
        doc.fillColor('#000000')
            .fontSize(20)
            .font('Helvetica-Bold')
            .text(packageItem.package_name.toUpperCase(), 50, 120);

        // Separator line
        doc.strokeColor('#f97a1f')
            .lineWidth(2)
            .moveTo(50, 150)
            .lineTo(550, 150)
            .stroke();

        // ========== PACKAGE DETAILS ==========
        checkPageBreak(100);
        doc.fontSize(12)
            .fillColor('#333333')
            .text('Package Details', 50, 170);

        // Details table
        const detailsY = 200;
        const details = [
            { label: 'Package ID', value: packageItem.package_id },
            { label: 'Duration', value: `${packageItem.duration_days} Days` },
            { label: 'Package Type', value: packageItem.package_type },
            { label: 'Price Per Person', value: `$${packageItem.per_person_cost || packageItem.price_per_person_usd}` }
        ];

        details.forEach((detail, index) => {
            const yPos = detailsY + (index * 25);
            doc.font('Helvetica-Bold')
                .fillColor('#f97a1f')
                .text(detail.label + ':', 50, yPos, { width: 150 });
            doc.font('Helvetica')
                .fillColor('#333333')
                .text(detail.value, 200, yPos);
        });

        // ========== ITINERARY SECTION ==========
        checkPageBreak(50);
        doc.fontSize(14)
            .font('Helvetica-Bold')
            .fillColor('#f97a1f')
            .text('DAILY ITINERARY', 50, doc.y + 20);

        // Parse routes
        let routes = [];
        try {
            if (packageItem.routes) {
                if (typeof packageItem.routes === 'string') {
                    routes = JSON.parse(packageItem.routes);
                } else if (Array.isArray(packageItem.routes)) {
                    routes = packageItem.routes;
                }
            }
        } catch (error) {
            console.log('Error parsing routes:', error);
        }

        // Add each day's itinerary with page break checks
        if (routes.length > 0) {
            routes.forEach((route, index) => {
                // Check if we need a new page (approx 80 points per route item)
                checkPageBreak(80);

                const yPos = doc.y + 20;

                // Day header
                doc.fontSize(12)
                    .font('Helvetica-Bold')
                    .fillColor('#ffffff')
                    .roundedRect(50, yPos, 500, 30, 5)
                    .fill('#f97a1f');
                doc.text(`Day ${route.day || index + 1}: ${route.location || 'Destination'}`, 70, yPos + 10);

                // Description
                doc.fontSize(10)
                    .font('Helvetica')
                    .fillColor('#333333')
                    .text(route.description || 'No description available.', 70, yPos + 40, {
                        width: 480,
                        align: 'justify'
                    });

                // Activities if available
                if (route.activities && Array.isArray(route.activities) && route.activities.length > 0) {
                    checkPageBreak(20);
                    doc.fontSize(9)
                        .font('Helvetica-Bold')
                        .fillColor('#f97a1f')
                        .text('Included Activities:', 70, doc.y);

                    route.activities.forEach((activity, actIndex) => {
                        checkPageBreak(15);
                        doc.font('Helvetica')
                            .fillColor('#666666')
                            .text(`• ${activity}`, 90, doc.y + 5);
                    });
                }

                doc.moveDown(1);
            });
        } else {
            checkPageBreak(50);
            doc.fontSize(10)
                .font('Helvetica')
                .fillColor('#666666')
                .text('Detailed itinerary will be provided upon booking confirmation.', 70, doc.y);
        }

        // ========== INCLUSIONS SECTION ==========
        checkPageBreak(100);
        doc.fontSize(14)
            .font('Helvetica-Bold')
            .fillColor('#f97a1f')
            .text('WHAT\'S INCLUDED', 50, doc.y + 20);

        // Parse inclusions
        let inclusions = [];
        try {
            if (packageItem.included_activities) {
                if (typeof packageItem.included_activities === 'string') {
                    inclusions = JSON.parse(packageItem.included_activities);
                } else if (Array.isArray(packageItem.included_activities)) {
                    inclusions = packageItem.included_activities;
                }
            }
        } catch (error) {
            console.log('Error parsing inclusions:', error);
        }

        if (inclusions.length > 0) {
            doc.moveDown(0.5);
            inclusions.forEach((inclusion, index) => {
                checkPageBreak(20);
                doc.fontSize(10)
                    .font('Helvetica')
                    .fillColor('#333333')
                    .text(`✓ ${inclusion}`, 70, doc.y);
            });
        }

        // ========== FOOTER SECTION ==========
        checkPageBreak(150);
        doc.fontSize(9)
            .font('Helvetica-Oblique')
            .fillColor('#666666')
            .text('Terms & Conditions:', 50, doc.y);

        const terms = [
            'Prices are subject to change without prior notice.',
            'Bookings are confirmed only after receiving payment.',
            'Cancellation policy applies as per company terms.',
            'Itinerary may be subject to change due to weather or unforeseen circumstances.',
            'All rights reserved © Lanka Vacations 2024.'
        ];

        terms.forEach((term, index) => {
            checkPageBreak(15);
            doc.font('Helvetica')
                .fillColor('#666666')
                .text(`• ${term}`, 70, doc.y + 5);
        });

        // Final line
        doc.strokeColor('#f97a1f')
            .lineWidth(1)
            .moveTo(50, doc.y + 20)
            .lineTo(550, doc.y + 20)
            .stroke();

        // Thank you message
        doc.fontSize(10)
            .font('Helvetica-Bold')
            .fillColor('#f97a1f')
            .text('Thank you for choosing Lanka Vacations!', 50, doc.y + 40, { align: 'center' });

        doc.end();

        writeStream.on('finish', () => {
            res.json({
                pdfUrl: `/pdfs/${filename}`,
                message: 'PDF generated successfully'
            });
        });

        writeStream.on('error', (error) => {
            console.error('Error writing PDF file:', error);
            res.status(500).json({ error: 'Error generating PDF file' });
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ========== HEALTH & TEST ENDPOINTS (UNCHANGED) ==========

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Lanka Vacations API Gateway',
        timestamp: new Date().toISOString(),
        ai_connected: true,
        database_connected: true,
        endpoints: {
            packages: '/api/packages',
            bookings: '/api/bookings',
            chat: '/api/chat/message',
            ai: '/api/ai-recommend',
            pdf: '/api/generate-pdf/:id'
        }
    });
});

app.get('/api/test', (req, res) => {
    res.json({
        message: 'API Gateway is working!',
        services: {
            ai: 'Flask AI API (Port 5000)',
            database: 'MySQL Database',
            chatbot: 'Available',
            packages: 'Available',
            bookings: 'Available'
        }
    });
});

// Add a test endpoint for database schema
app.get('/api/test-db-schema', async (req, res) => {
    try {
        const [bookingsColumns] = await pool.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'bookings' 
            AND TABLE_SCHEMA = 'lank_vac_SLIIT'
            ORDER BY ORDINAL_POSITION
        `);

        const [usersColumns] = await pool.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users' 
            AND TABLE_SCHEMA = 'lank_vac_SLIIT'
            ORDER BY ORDINAL_POSITION
        `);

        res.json({
            bookings_columns: bookingsColumns,
            users_columns: usersColumns
        });
    } catch (error) {
        console.error('Schema test error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ========== DATABASE INITIALIZATION (UNCHANGED) ==========

async function initializeDatabase() {
    try {
        console.log('🔧 Initializing database tables...');

        const [packageTables] = await pool.execute(`SHOW TABLES LIKE 'packages'`);
        if (packageTables.length === 0) {
            console.log('⚠️ Packages table not found. Creating...');
        } else {
            console.log('✅ Packages table exists');
        }

        const [userTables] = await pool.execute(`SHOW TABLES LIKE 'users'`);
        if (userTables.length === 0) {
            console.log('⚠️ Users table not found. Creating...');
        } else {
            console.log('✅ Users table exists');
        }

        const [bookingTables] = await pool.execute(`SHOW TABLES LIKE 'bookings'`);
        if (bookingTables.length === 0) {
            console.log('⚠️ Bookings table not found. Creating...');
        } else {
            console.log('✅ Bookings table exists');
        }

        console.log('✅ Database initialization complete');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
}

// ========== AUTHENTICATION ENDPOINTS ==========

// Hash password function
const bcrypt = require('bcrypt');
const saltRounds = 10;

// User Registration
app.post('/api/auth/register', async (req, res) => {
    console.log('📝 User registration request:', req.body);

    try {
        const {
            email,
            password,
            full_name,
            phone,
            country,
            city,
            whatsapp_number,
            passport_number,
            emergency_contact,
            date_of_birth,
            gender,
            travel_preferences,
            dietary_restrictions
        } = req.body;

        // Validate required fields
        if (!email || !password || !full_name || !phone || !country || !city) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: email, password, full_name, phone, country, and city are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        // Validate password (at least 6 characters, letters and numbers)
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long and contain both letters and numbers'
            });
        }

        // Validate phone (only numbers and + - symbols)
        const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number format. Only numbers, spaces, +, -, (, ) are allowed'
            });
        }

        // Validate full name (should have at least 2 parts)
        const nameParts = full_name.trim().split(/\s+/);
        if (nameParts.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Full name should contain at least first name and last name'
            });
        }

        // Check if user already exists
        const [existingUsers] = await pool.execute(
            'SELECT user_id FROM user_login WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Generate user ID
        const user_id = `USER_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Hash password
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Extract first and last name
        const first_name = nameParts[0];
        const last_name = nameParts.slice(1).join(' ');

        // Insert user into database
        await pool.execute(
            `INSERT INTO user_login (
                user_id, email, password_hash, full_name, first_name, last_name,
                phone, country, city, whatsapp_number, passport_number,
                emergency_contact, date_of_birth, gender,
                travel_preferences, dietary_restrictions, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                user_id,
                email,
                password_hash,
                full_name,
                first_name,
                last_name,
                phone,
                country,
                city,
                whatsapp_number || phone,
                passport_number || '',
                emergency_contact || phone,
                date_of_birth || null,
                gender || 'prefer_not_to_say',
                travel_preferences || '',
                dietary_restrictions || ''
            ]
        );

        console.log('✅ User registered successfully:', user_id);

        res.json({
            success: true,
            message: 'Registration successful',
            user_id: user_id,
            email: email,
            full_name: full_name,
            redirect: '/hero'
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed',
            details: error.message
        });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    console.log('🔐 Login request:', req.body.email);

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Find user by email
        const [users] = await pool.execute(
            `SELECT user_id, email, password_hash, full_name, first_name, last_name,
                    phone, country, city, whatsapp_number, passport_number,
                    emergency_contact, profile_image_url, is_active
             FROM user_login WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Check if account is active
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                error: 'Account is deactivated. Please contact support.'
            });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Update last login time
        await pool.execute(
            'UPDATE user_login SET last_login = NOW() WHERE user_id = ?',
            [user.user_id]
        );

        console.log('✅ Login successful for user:', user.user_id);

        // Return user data (excluding password)
        const userData = { ...user };
        delete userData.password_hash;

        res.json({
            success: true,
            message: 'Login successful',
            user: userData,
            redirect: '/hero'
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
            details: error.message
        });
    }
});

// Get User Profile
app.get('/api/auth/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const [users] = await pool.execute(
            `SELECT user_id, email, full_name, first_name, last_name,
                    phone, country, city, whatsapp_number, passport_number,
                    emergency_contact, date_of_birth, gender,
                    travel_preferences, dietary_restrictions, profile_image_url,
                    created_at, last_login
             FROM user_login WHERE user_id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error('❌ Profile fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile'
        });
    }
});

// Update User Profile
app.put('/api/auth/profile/:userId', async (req, res) => {
    console.log('🔄 Update profile request for:', req.params.userId);

    try {
        const { userId } = req.params;
        const {
            full_name,
            phone,
            country,
            city,
            whatsapp_number,
            passport_number,
            emergency_contact,
            date_of_birth,
            gender,
            travel_preferences,
            dietary_restrictions,
            profile_image_url
        } = req.body;

        // Validate required fields
        if (!full_name || !phone || !country || !city) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: full_name, phone, country, and city are required'
            });
        }

        // Validate full name
        const nameParts = full_name.trim().split(/\s+/);
        if (nameParts.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Full name should contain at least first name and last name'
            });
        }

        const first_name = nameParts[0];
        const last_name = nameParts.slice(1).join(' ');

        // Update user profile
        await pool.execute(
            `UPDATE user_login SET
                full_name = ?,
                first_name = ?,
                last_name = ?,
                phone = ?,
                country = ?,
                city = ?,
                whatsapp_number = ?,
                passport_number = ?,
                emergency_contact = ?,
                date_of_birth = ?,
                gender = ?,
                travel_preferences = ?,
                dietary_restrictions = ?,
                profile_image_url = ?,
                updated_at = NOW()
             WHERE user_id = ?`,
            [
                full_name,
                first_name,
                last_name,
                phone,
                country,
                city,
                whatsapp_number || phone,
                passport_number || '',
                emergency_contact || phone,
                date_of_birth || null,
                gender || 'prefer_not_to_say',
                travel_preferences || '',
                dietary_restrictions || '',
                profile_image_url || null,
                userId
            ]
        );

        console.log('✅ Profile updated successfully for:', userId);

        // Fetch updated user data
        const [users] = await pool.execute(
            `SELECT user_id, email, full_name, first_name, last_name,
                    phone, country, city, whatsapp_number, passport_number,
                    emergency_contact, profile_image_url
             FROM user_login WHERE user_id = ?`,
            [userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: users[0]
        });

    } catch (error) {
        console.error('❌ Profile update error:', error);
        res.status(500).json({
            success: false,
            error: 'Profile update failed',
            details: error.message
        });
    }
});

// Change Password
app.post('/api/auth/change-password/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Current password and new password are required'
            });
        }

        // Validate new password
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                error: 'New password must be at least 6 characters long and contain both letters and numbers'
            });
        }

        // Get current password hash
        const [users] = await pool.execute(
            'SELECT password_hash FROM user_login WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Verify current password
        const passwordMatch = await bcrypt.compare(currentPassword, users[0].password_hash);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await pool.execute(
            'UPDATE user_login SET password_hash = ?, updated_at = NOW() WHERE user_id = ?',
            [newPasswordHash, userId]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('❌ Password change error:', error);
        res.status(500).json({
            success: false,
            error: 'Password change failed'
        });
    }
});

// Check Authentication Status
app.get('/api/auth/check', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.json({
            isAuthenticated: false,
            message: 'No email provided'
        });
    }

    try {
        const [users] = await pool.execute(
            'SELECT user_id, full_name FROM user_login WHERE email = ? AND is_active = TRUE',
            [email]
        );

        res.json({
            isAuthenticated: users.length > 0,
            user: users.length > 0 ? users[0] : null
        });
    } catch (error) {
        console.error('❌ Auth check error:', error);
        res.json({
            isAuthenticated: false,
            error: 'Auth check failed'
        });
    }
});
// Add to server.js in the authentication section
app.delete('/api/auth/delete/:userId', async (req, res) => {
    console.log('🗑️ Delete account request for:', req.params.userId);

    try {
        const { userId } = req.params;

        // Optional: Add password verification for security
        const { password } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        // Optional: Verify password before deletion
        if (password) {
            const [users] = await pool.execute(
                'SELECT password_hash FROM user_login WHERE user_id = ?',
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const passwordMatch = await bcrypt.compare(password, users[0].password_hash);
            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    error: 'Incorrect password'
                });
            }
        }

        // Soft delete: Update is_active to false
        await pool.execute(
            'UPDATE user_login SET is_active = FALSE, updated_at = NOW() WHERE user_id = ?',
            [userId]
        );

        // Or hard delete (uncomment if you want permanent deletion):
        // await pool.execute('DELETE FROM user_login WHERE user_id = ?', [userId]);

        console.log('✅ Account soft-deleted for user:', userId);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('❌ Delete account error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete account',
            details: error.message
        });
    }
});

// ========== DASHBOARD ENDPOINTS ==========

// Get user's package bookings
app.get('/api/dashboard/package-bookings/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        console.log('📦 Fetching package bookings for login user:', userId);

        // 1. Get user email from user_login table
        const [userLoginData] = await pool.execute(
            'SELECT email FROM user_login WHERE user_id = ?',
            [userId]
        );

        if (userLoginData.length === 0) {
            console.log('⚠️ Login user not found:', userId);
            return res.json({ success: true, bookings: [] });
        }

        const userEmail = userLoginData[0].email;
        console.log('🔍 Searching bookings for email:', userEmail);

        // 2. Get ALL bookings for this email (ignore user_id completely)
        const [bookings] = await pool.execute(`
            SELECT
                b.*,
                p.duration_days,
                p.image_urls,
                p.routes,
                p.description as package_description
            FROM bookings b
                     LEFT JOIN packages p ON b.package_id = p.package_id
            WHERE b.email = ?
            ORDER BY b.created_at DESC
        `, [userEmail]);

        console.log(`✅ Found ${bookings.length} package bookings for ${userEmail}`);

        // Parse JSON fields
        const parsedBookings = bookings.map(booking => {
            const parsed = { ...booking };

            // Parse image_urls
            if (parsed.image_urls && typeof parsed.image_urls === 'string') {
                try {
                    parsed.image_urls = JSON.parse(parsed.image_urls);
                } catch (e) {
                    parsed.image_urls = [];
                }
            }

            // Parse routes
            if (parsed.routes && typeof parsed.routes === 'string') {
                try {
                    parsed.routes = JSON.parse(parsed.routes);
                } catch (e) {
                    parsed.routes = [];
                }
            }

            // Ensure image_urls is an array
            if (!Array.isArray(parsed.image_urls) || parsed.image_urls.length === 0) {
                parsed.image_urls = ['https://images.unsplash.com/photo-1564574662336-88c9f5a6c8d9'];
            }

            // Add booking type
            parsed.booking_type = parsed.package_id ? 'package' : 'itinerary';

            return parsed;
        });

        res.json({
            success: true,
            bookings: parsedBookings,
            email: userEmail
        });

    } catch (error) {
        console.error('❌ Error fetching package bookings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch package bookings',
            details: error.message
        });
    }
});
// Get user's itinerary bookings (from questionnaire responses)
// Get user's AI-generated itinerary bookings (from bookings table only)
app.get('/api/dashboard/itinerary-bookings/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        console.log('🗺️ Fetching AI itinerary bookings for user:', userId);

        // Step 1: Get user's email from user_login table
        const [userData] = await pool.execute(
            'SELECT email FROM user_login WHERE user_id = ?',
            [userId]
        );

        if (userData.length === 0) {
            console.log('⚠️ User not found:', userId);
            return res.json({
                success: true,
                bookings: []
            });
        }

        const userEmail = userData[0].email;
        console.log('📧 Fetching bookings by email:', userEmail);

        // Step 2: Fetch ONLY from bookings table where package_name is AI-Generated
        const [bookings] = await pool.execute(`
            SELECT
                booking_id as id,
                package_name as title,
                created_at as created_date,
                booking_status as status,
                adults_count as adults,
                children_count as children,
                total_cost,
                email,
                full_name,
                phone,
                country,
                city,
                itinerary_data,
                questionnaire_response_id,
                special_requirements,
                notes
            FROM bookings
            WHERE email = ?
              AND package_name LIKE '%AI-Generated%'
            ORDER BY created_at DESC
        `, [userEmail]);

        console.log(`✅ Found ${bookings.length} AI itinerary bookings for ${userEmail}`);

        // Step 3: Parse itinerary_data JSON and transform to frontend format
        const transformedBookings = bookings.map(booking => {
            let itineraryData = null;
            let activities = [];
            let interests = [];
            let preferredDestinations = [];
            let exactDays = 7;

            try {
                // Parse itinerary_data if exists
                if (booking.itinerary_data && typeof booking.itinerary_data === 'string') {
                    itineraryData = JSON.parse(booking.itinerary_data);

                    // Extract activities from itinerary
                    if (itineraryData.itinerary && Array.isArray(itineraryData.itinerary)) {
                        activities = itineraryData.itinerary
                            .flatMap(day => day.activities || [])
                            .map(activity => activity.activity_name || activity.name)
                            .filter(name => name && name.trim() !== '')
                            .slice(0, 5); // Limit to 5 activities
                    }

                    // Extract interests
                    if (itineraryData.questionnaire_answers) {
                        const interestAnswer = itineraryData.questionnaire_answers.find(
                            ans => ans.question && ans.question.toLowerCase().includes('interest')
                        );
                        if (interestAnswer && interestAnswer.answer) {
                            interests = Array.isArray(interestAnswer.answer)
                                ? interestAnswer.answer
                                : [interestAnswer.answer];
                        }
                    }

                    // Extract preferred destinations
                    if (itineraryData.selected_options?.preferred_cities) {
                        preferredDestinations = itineraryData.selected_options.preferred_cities;
                    }

                    // Extract days
                    if (itineraryData.questionnaire_data?.exact_days) {
                        exactDays = itineraryData.questionnaire_data.exact_days;
                    }
                }
            } catch (error) {
                console.error('Error parsing itinerary data:', error);
            }

            return {
                id: booking.id,
                title: booking.title,
                created_date: booking.created_date,
                dates: `${exactDays} days`,
                status: booking.status,
                activities: activities.length > 0 ? activities : interests,
                travelers: (booking.adults || 1) + (booking.children || 0),
                description: `AI-generated ${exactDays}-day custom itinerary`,
                interests: interests,
                preferred_destinations: preferredDestinations,
                itinerary_data: itineraryData,
                exact_days: exactDays,
                total_cost: booking.total_cost,
                booking_status: booking.status,
                // Include other booking details
                adults: booking.adults || 1,
                children: booking.children || 0,
                email: booking.email,
                full_name: booking.full_name
            };
        });

        res.json({
            success: true,
            bookings: transformedBookings
        });

    } catch (error) {
        console.error('❌ Error fetching AI itinerary bookings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch itinerary bookings'
        });
    }
});

// Delete AI itinerary booking (from bookings table)
app.delete('/api/dashboard/ai-itinerary-booking/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;

        console.log('🗑️ Deleting AI itinerary booking:', bookingId);

        // Delete from bookings table where package_name is AI-Generated
        const [result] = await pool.execute(
            `DELETE FROM bookings 
             WHERE booking_id = ? 
             AND package_name LIKE '%AI-Generated%'`,
            [bookingId]
        );

        if (result.affectedRows > 0) {
            console.log(`✅ AI itinerary booking ${bookingId} deleted successfully`);
            res.json({
                success: true,
                message: 'AI itinerary deleted successfully'
            });
        } else {
            console.log(`❌ AI itinerary booking ${bookingId} not found`);
            res.status(404).json({
                success: false,
                error: 'AI itinerary not found'
            });
        }

    } catch (error) {
        console.error('❌ Error deleting AI itinerary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete AI itinerary'
        });
    }
});
// Get user's hotel bookings
app.get('/api/dashboard/hotel-bookings/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // This is a placeholder - you'll need to create a hotel_bookings table
        const [bookings] = await pool.execute(`
            SELECT 
                booking_id as id,
                CONCAT('Hotel Stay - ', DATE_FORMAT(created_at, '%b %Y')) as hotelName,
                city as location,
                DATE(created_at) as checkIn,
                DATE(DATE_ADD(created_at, INTERVAL 3 DAY)) as checkOut,
                'confirmed' as status,
                CONCAT('$', FLOOR(50 + RAND() * 150)) as price,
                adults_count as guests,
                'Standard Room' as roomType,
                3 as nights,
                CONCAT('$', FLOOR(150 + RAND() * 450)) as total
            FROM bookings 
            WHERE user_id = ? 
            AND booking_status = 'confirmed'
            ORDER BY created_at DESC
            LIMIT 3
        `, [userId]);

        res.json({
            success: true,
            bookings: bookings
        });

    } catch (error) {
        console.error('❌ Error fetching hotel bookings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch hotel bookings'
        });
    }
});

// Delete itinerary booking
app.delete('/api/dashboard/itinerary/:responseId', async (req, res) => {
    try {
        const { responseId } = req.params;

        const [result] = await pool.execute(
            'DELETE FROM questionnaire_responses WHERE response_id = ?',
            [responseId]
        );

        if (result.affectedRows > 0) {
            res.json({
                success: true,
                message: 'Itinerary deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Itinerary not found'
            });
        }

    } catch (error) {
        console.error('❌ Error deleting itinerary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete itinerary'
        });
    }
});

// Delete package booking
app.delete('/api/dashboard/package-booking/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;

        const [result] = await pool.execute(
            'UPDATE bookings SET booking_status = "cancelled" WHERE booking_id = ?',
            [bookingId]
        );

        if (result.affectedRows > 0) {
            res.json({
                success: true,
                message: 'Booking cancelled successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

    } catch (error) {
        console.error('❌ Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel booking'
        });
    }
});

// Update itinerary booking
app.put('/api/dashboard/itinerary/:responseId', async (req, res) => {
    try {
        const { responseId } = req.params;
        const updateData = req.body;

        console.log('🔄 Updating itinerary:', responseId);

        // Build update query
        const updateFields = [];
        const updateValues = [];

        // Allowed fields to update
        const allowedFields = [
            'travel_duration_range', 'num_adults', 'num_children',
            'room_type_preference', 'meal_plan_preference', 'special_requirements'
        ];

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                updateValues.push(updateData[field]);
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update'
            });
        }

        updateValues.push(responseId);

        const query = `UPDATE questionnaire_responses
                       SET ${updateFields.join(', ')}, updated_at = NOW()
                       WHERE response_id = ?`;

        await pool.execute(query, updateValues);

        res.json({
            success: true,
            message: 'Itinerary updated successfully'
        });

    } catch (error) {
        console.error('❌ Error updating itinerary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update itinerary'
        });
    }
});

// Add these endpoints to your server.js file

// ========== REVIEW SYSTEM ENDPOINTS ==========

// Get reviews with filters
app.get('/api/reviews', async (req, res) => {
    console.log('🔍 GET /api/reviews called with params:', req.query);
    console.log('📋 Full URL:', req.originalUrl);

    try {
        const { sort = 'newest', rating, type, user_id } = req.query;

        // Build WHERE conditions
        const conditions = ['status = "approved"'];
        const queryParams = [];

        // Add rating filter
        if (rating && !isNaN(rating)) {
            conditions.push('rating = ?');
            queryParams.push(parseInt(rating));
        }

        // Add type filter
        if (type && type !== 'all') {
            conditions.push('review_type = ?');
            queryParams.push(type);
        }

        // Add user filter (for showing user's reviews)
        if (user_id) {
            conditions.push('user_id = ?');
            queryParams.push(user_id);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Build ORDER BY
        let orderBy = 'ORDER BY review_date DESC';
        switch (sort) {
            case 'oldest':
                orderBy = 'ORDER BY review_date ASC';
                break;
            case 'rating_high':
                orderBy = 'ORDER BY rating DESC, review_date DESC';
                break;
            case 'rating_low':
                orderBy = 'ORDER BY rating ASC, review_date DESC';
                break;
        }

        // Get reviews
        const [reviews] = await pool.execute(`
            SELECT 
                r.*,
                (r.user_id = ?) as can_edit,
                (r.user_id = ?) as can_delete
            FROM reviews r
            ${whereClause}
            ${orderBy}
            LIMIT 50
        `, [...queryParams, user_id || '', user_id || '']);

        // Get statistics
        const [stats] = await pool.execute(`
            SELECT 
                COUNT(*) as total,
                AVG(rating) as average,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1,
                SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) as verified
            FROM reviews 
            WHERE status = 'approved'
        `);

        const statsData = stats[0] || {
            total: 0,
            average: 0,
            rating_5: 0,
            rating_4: 0,
            rating_3: 0,
            rating_2: 0,
            rating_1: 0,
            verified: 0
        };

        res.json({
            success: true,
            reviews: reviews,
            stats: {
                total: statsData.total,
                average: parseFloat(statsData.average) || 0,
                distribution: [
                    statsData.rating_5,
                    statsData.rating_4,
                    statsData.rating_3,
                    statsData.rating_2,
                    statsData.rating_1
                ],
                verified: statsData.verified
            }
        });

    } catch (error) {
        console.error('❌ Error fetching reviews:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
    }
});

// Submit new review
app.post('/api/reviews', async (req, res) => {
    try {
        const {
            user_id,
            full_name,
            email,
            rating,
            title,
            review_text,
            review_type = 'general',
            entity_id,
            entity_name
        } = req.body;

        // Validate required fields
        if (!user_id || !full_name || !rating || !title || !review_text) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 1 and 5'
            });
        }

        // Check for bad words
        const containsBadWords = await checkForBadWords(`${title} ${review_text}`);

        // Generate review ID
        const review_id = `REV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Get user verification status
        const [userBookings] = await pool.execute(
            'SELECT COUNT(*) as booking_count FROM bookings WHERE user_id = ? AND booking_status = "confirmed"',
            [user_id]
        );

        const is_verified = userBookings[0]?.booking_count > 0;

        // Insert review
        await pool.execute(
            `INSERT INTO reviews (
                review_id,
                user_id,
                full_name,
                email,
                rating,
                title,
                review_text,
                review_type,
                entity_id,
                entity_name,
                status,
                is_verified,
                review_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                review_id,
                user_id,
                full_name,
                email,
                rating,
                title,
                review_text,
                review_type,
                entity_id || null,
                entity_name || null,
                containsBadWords ? 'pending' : 'approved',
                is_verified
            ]
        );

        console.log('✅ Review submitted:', review_id);

        res.json({
            success: true,
            message: containsBadWords
                ? 'Review submitted and pending moderation'
                : 'Review submitted successfully',
            review_id: review_id,
            status: containsBadWords ? 'pending' : 'approved',
            is_verified: is_verified
        });

    } catch (error) {
        console.error('❌ Error submitting review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit review',
            details: error.message
        });
    }
});

// Update review
app.put('/api/reviews/:reviewId', async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { user_id, rating, title, review_text, review_type, entity_name } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                error: 'User ID required'
            });
        }

        // Check if review belongs to user
        const [existingReviews] = await pool.execute(
            'SELECT user_id FROM reviews WHERE review_id = ?',
            [reviewId]
        );

        if (existingReviews.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Review not found'
            });
        }

        if (existingReviews[0].user_id !== user_id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to edit this review'
            });
        }

        // Check for bad words
        const containsBadWords = await checkForBadWords(`${title} ${review_text}`);

        // Update review
        await pool.execute(
            `UPDATE reviews SET
                rating = ?,
                title = ?,
                review_text = ?,
                review_type = ?,
                entity_name = ?,
                status = ?,
                updated_at = NOW()
             WHERE review_id = ?`,
            [
                rating,
                title,
                review_text,
                review_type,
                entity_name || null,
                containsBadWords ? 'pending' : 'approved',
                reviewId
            ]
        );

        console.log('✅ Review updated:', reviewId);

        res.json({
            success: true,
            message: containsBadWords
                ? 'Review updated and pending moderation'
                : 'Review updated successfully'
        });

    } catch (error) {
        console.error('❌ Error updating review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update review'
        });
    }
});

// Delete review

app.delete('/api/reviews/:reviewId', async (req, res) => {
    console.log('🗑️ DELETE /api/reviews called for:', req.params.reviewId);
    console.log('📦 Request body:', req.body);

    try {
        const { reviewId } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                error: 'User ID required'
            });
        }

        // Check if review exists and belongs to user
        const [existingReviews] = await pool.execute(
            'SELECT user_id FROM reviews WHERE review_id = ?',
            [reviewId]
        );

        if (existingReviews.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Review not found'
            });
        }

        if (existingReviews[0].user_id !== user_id) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this review'
            });
        }

        // Delete review
        await pool.execute(
            'DELETE FROM reviews WHERE review_id = ?',
            [reviewId]
        );

        console.log('✅ Review deleted:', reviewId);

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete review',
            details: error.message
        });
    }
});


// Mark review as helpful
app.post('/api/reviews/:reviewId/helpful', async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { user_id } = req.body;

        // Check if user already voted
        const [existingVotes] = await pool.execute(
            'SELECT COUNT(*) as vote_count FROM review_votes WHERE review_id = ? AND user_id = ?',
            [reviewId, user_id]
        );

        if (existingVotes[0].vote_count > 0) {
            return res.status(400).json({
                success: false,
                error: 'Already voted'
            });
        }

        // Record vote
        await pool.execute(
            'INSERT INTO review_votes (review_id, user_id, vote_type) VALUES (?, ?, "helpful")',
            [reviewId, user_id]
        );

        // Update helpful count
        await pool.execute(
            'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE review_id = ?',
            [reviewId]
        );

        res.json({
            success: true,
            message: 'Thank you for your feedback!'
        });

    } catch (error) {
        console.error('❌ Error voting:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process vote'
        });
    }
});

// Report review
app.post('/api/reviews/:reviewId/report', async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { user_id } = req.body;

        // Record report
        await pool.execute(
            'INSERT INTO review_reports (review_id, user_id) VALUES (?, ?)',
            [reviewId, user_id]
        );

        // Update inappropriate count
        await pool.execute(
            'UPDATE reviews SET inappropriate_count = inappropriate_count + 1 WHERE review_id = ?',
            [reviewId]
        );

        // Check if report threshold reached
        const [reviewData] = await pool.execute(
            'SELECT inappropriate_count FROM reviews WHERE review_id = ?',
            [reviewId]
        );

        if (reviewData[0]?.inappropriate_count >= 3) {
            await pool.execute(
                'UPDATE reviews SET status = "pending" WHERE review_id = ?',
                [reviewId]
            );
        }

        res.json({
            success: true,
            message: 'Review reported. Our team will review it.'
        });

    } catch (error) {
        console.error('❌ Error reporting review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to report review'
        });
    }
});

// Helper function to check for bad words
async function checkForBadWords(text) {
    try {
        const [badWords] = await pool.execute(
            'SELECT word FROM bad_words WHERE ? LIKE CONCAT("%", word, "%")',
            [text.toLowerCase()]
        );
        return badWords.length > 0;
    } catch (error) {
        console.error('Error checking bad words:', error);
        return false;
    }
}


app.put('/api/dashboard/package-booking/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { special_requirements, notes } = req.body;

        console.log('📦 Updating package booking:', bookingId);

        // SIMPLE UPDATE - just update what's allowed
        const updateFields = [];
        const updateValues = [];

        if (special_requirements !== undefined) {
            updateFields.push('special_requirements = ?');
            updateValues.push(special_requirements);
        }

        if (notes !== undefined) {
            updateFields.push('notes = ?');
            updateValues.push(notes);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }

        updateFields.push('updated_at = NOW()');
        updateValues.push(bookingId);

        const query = `UPDATE bookings SET ${updateFields.join(', ')} WHERE booking_id = ?`;

        await pool.execute(query, updateValues);

        res.json({
            success: true,
            message: 'Package booking updated successfully'
        });

    } catch (error) {
        console.error('❌ Error updating package booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update package booking'
        });
    }
})




// Cancel package booking
app.delete('/api/dashboard/package-booking/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;

        await pool.execute(
            `UPDATE bookings SET 
                booking_status = 'cancelled',
                updated_at = NOW()
             WHERE booking_id = ?`,
            [bookingId]
        );

        res.json({
            success: true,
            message: 'Package booking cancelled successfully'
        });

    } catch (error) {
        console.error('❌ Error cancelling package booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel booking'
        });
    }
});

// Cancel hotel booking
app.delete('/api/dashboard/hotel-booking/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;

        await pool.execute(
            `UPDATE hotel_bookings SET 
                booking_status = 'cancelled',
                updated_at = NOW()
             WHERE hotel_booking_id = ?`,
            [bookingId]
        );

        res.json({
            success: true,
            message: 'Hotel booking cancelled successfully'
        });

    } catch (error) {
        console.error('❌ Error cancelling hotel booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel hotel booking'
        });
    }
});

// ========== HOTEL BOOKING ENDPOINTS ==========

// Get all cities with hotels
app.get('/api/hotels/cities', async (req, res) => {
    try {
        const [cities] = await pool.execute(`
            SELECT DISTINCT 
                city,
                COUNT(*) as hotel_count,
                MIN(price_per_night_usd) as min_price,
                MAX(price_per_night_usd) as max_price
            FROM hotels 
            WHERE is_active = TRUE
            GROUP BY city
            ORDER BY hotel_count DESC
        `);

        res.json({
            success: true,
            cities: cities
        });
    } catch (error) {
        console.error('❌ Error fetching cities:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch cities' });
    }
});

// Get hotels with filters
app.get('/api/hotels/search', async (req, res) => {
    try {
        const {
            city,
            checkIn,
            checkOut,
            adults,
            children,
            rooms,
            minPrice,
            maxPrice,
            hotelCategory,
            sortBy = 'rating',
            page = 1,
            limit = 12
        } = req.query;

        console.log('🔍 Hotel search parameters:', req.query);

        // Build WHERE conditions
        const conditions = ['is_active = TRUE'];
        const queryParams = [];

        // Add available rooms condition
        if (rooms) {
            conditions.push('available_rooms >= ?');
            queryParams.push(parseInt(rooms) || 1);
        }

        // Add city filter
        if (city && city !== 'all') {
            conditions.push('city = ?');
            queryParams.push(city);
        }

        // Add price filters
        if (minPrice && minPrice !== '0') {
            conditions.push('price_per_night_usd >= ?');
            queryParams.push(parseFloat(minPrice));
        }

        if (maxPrice && maxPrice !== '500') {
            conditions.push('price_per_night_usd <= ?');
            queryParams.push(parseFloat(maxPrice));
        }

        // Add hotel category filter
        if (hotelCategory && hotelCategory !== 'all') {
            conditions.push('hotel_category = ?');
            queryParams.push(hotelCategory);
        }

        // Build the WHERE clause
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Build sorting
        const sortOptions = {
            'price_low': 'price_per_night_usd ASC',
            'price_high': 'price_per_night_usd DESC',
            'rating': 'rating DESC',
            'popular': 'review_count DESC',
            'name': 'hotel_name ASC'
        };
        const orderBy = `ORDER BY ${sortOptions[sortBy] || 'rating DESC'}`;

        // Calculate pagination (NO prepared statements for LIMIT/OFFSET)
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12;
        const offsetNum = (pageNum - 1) * limitNum;

        // **IMPORTANT: Build LIMIT/OFFSET directly in the query string (not as parameters)**
        const limitClause = `LIMIT ${limitNum} OFFSET ${offsetNum}`;

        // Build the main query
        const query = `
            SELECT 
                hotel_id,
                hotel_name,
                hotel_category,
                city,
                address,
                latitude,
                longitude,
                price_per_night_usd,
                star_rating,
                rating,
                review_count,
                image_urls,
                description,
                available_rooms,
                total_rooms,
                facilities,
                policies,
                room_capacity,
                room_types,
                meal_plans,
                phone_numbers,
                contact_phone,
                contact_email,
                check_in_time,
                check_out_time,
                amenities
            FROM hotels
            ${whereClause}
            ${orderBy}
            ${limitClause}
        `;

        console.log('📝 Query:', query);
        console.log('📝 Query parameters:', queryParams);

        // Execute query with only WHERE clause parameters
        const [hotels] = await pool.execute(query, queryParams);
        console.log(`✅ Found ${hotels.length} hotels`);

        // Parse JSON fields
        const parsedHotels = hotels.map(hotel => {
            const parsed = { ...hotel };

            // Parse all JSON fields
            const jsonFields = [
                'image_urls',
                'facilities',
                'policies',
                'room_capacity',
                'room_types',
                'meal_plans',
                'phone_numbers',
                'amenities'
            ];

            jsonFields.forEach(field => {
                if (parsed[field] && typeof parsed[field] === 'string') {
                    try {
                        parsed[field] = JSON.parse(parsed[field]);
                    } catch (e) {
                        parsed[field] = field === 'image_urls' ? [] : {};
                    }
                }
            });

            // Ensure image_urls is an array
            if (!Array.isArray(parsed.image_urls) || parsed.image_urls.length === 0) {
                parsed.image_urls = ['https://images.unsplash.com/photo-1566073771259-6a8506099945'];
            }

            // Calculate stay duration if dates provided
            if (checkIn && checkOut) {
                try {
                    const checkInDate = new Date(checkIn);
                    const checkOutDate = new Date(checkOut);
                    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
                    parsed.total_price = (hotel.price_per_night_usd * nights * (parseInt(rooms) || 1)).toFixed(2);
                    parsed.nights = nights;
                } catch (dateError) {
                    console.log('⚠️ Date calculation error:', dateError.message);
                }
            }

            // Add destination_name from city if needed
            parsed.destination_name = hotel.city;

            return parsed;
        });

        // Get total count (for pagination)
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM hotels 
            ${whereClause}
        `;

        const [countResult] = await pool.execute(countQuery, queryParams);
        const total = countResult[0]?.total || 0;

        console.log('📊 Total hotels found:', total);

        res.json({
            success: true,
            hotels: parsedHotels,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            },
            filters: {
                city,
                checkIn,
                checkOut,
                adults,
                children,
                rooms,
                minPrice,
                maxPrice,
                hotelCategory,
                sortBy
            }
        });

    } catch (error) {
        console.error('❌ Error searching hotels:', error);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            sql: error.sql ? error.sql.substring(0, 200) + '...' : 'No SQL'
        });

        res.status(500).json({
            success: false,
            error: 'Failed to search hotels',
            details: error.message,
            sqlMessage: error.sqlMessage,
            code: error.code
        });
    }
});

// Get single hotel details
app.get('/api/hotels/:hotelId', async (req, res) => {
    try {
        const { hotelId } = req.params;

        const [hotels] = await pool.execute(`
            SELECT
                h.*,
                h.city as destination_name  -- Use city as destination_name
            FROM hotels h
            WHERE h.hotel_id = ? AND h.is_active = TRUE
        `, [hotelId]);

        if (hotels.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Hotel not found'
            });
        }

        const hotel = hotels[0];

        // Parse JSON fields
        const jsonFields = [
            'image_urls',
            'facilities',
            'policies',
            'room_capacity',
            'room_types',
            'meal_plans',
            'phone_numbers',
            'amenities'
        ];

        jsonFields.forEach(field => {
            if (hotel[field] && typeof hotel[field] === 'string') {
                try {
                    hotel[field] = JSON.parse(hotel[field]);
                } catch (e) {
                    console.log(`⚠️ Failed to parse ${field}:`, e.message);
                    hotel[field] = field === 'image_urls' ? [] : {};
                }
            }
        });

        // Get similar hotels in same city
        const [similarHotels] = await pool.execute(`
            SELECT
                hotel_id,
                hotel_name,
                hotel_category,
                price_per_night_usd,
                rating,
                image_urls,
                city
            FROM hotels
            WHERE city = ?
              AND hotel_id != ? 
            AND is_active = TRUE
            AND available_rooms > 0
            ORDER BY rating DESC
                LIMIT 4
        `, [hotel.city, hotelId]);

        // Parse image_urls for similar hotels
        similarHotels.forEach(h => {
            if (h.image_urls && typeof h.image_urls === 'string') {
                try {
                    h.image_urls = JSON.parse(h.image_urls);
                } catch (e) {
                    h.image_urls = [];
                }
            }
        });

        res.json({
            success: true,
            hotel: hotel,
            similarHotels: similarHotels
        });

    } catch (error) {
        console.error('❌ Error fetching hotel details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch hotel details'
        });
    }
});
app.post('/api/hotels/book', async (req, res) => {
    console.log('🔵 Hotel booking attempt...');

    try {
        // Get data
        const data = req.body;
        console.log('📦 Received:', data);

        // Basic validation
        if (!data.hotel_id || !data.user_id || !data.check_in_date || !data.check_out_date) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Generate booking ID
        const booking_id = `HB_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

        console.log('✅ Creating booking with ID:', booking_id);

        // SIMPLE INSERT - no complex validation
        await pool.execute(
            `INSERT INTO hotel_bookings (
                hotel_booking_id,
                hotel_id,
                user_id,
                check_in_date,
                check_out_date,
                num_rooms,
                num_adults,
                num_children,
                room_type,
                meal_plan,
                special_requests,
                total_price,
                booking_status,
                payment_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'paid')`,
            [
                booking_id,
                data.hotel_id,
                data.user_id,
                data.check_in_date,
                data.check_out_date,
                data.num_rooms || 1,
                data.num_adults || 1,
                data.num_children || 0,
                data.room_type || 'standard',
                data.meal_plan || 'breakfast_only',
                data.special_requests || '',
                data.total_price || '0.00'
            ]
        );

        console.log('✅ Booking saved successfully!');

        // Return success
        res.json({
            success: true,
            message: 'Hotel booked successfully!',
            booking_id: booking_id,
            user_id: data.user_id
        });

    } catch (error) {
        console.error('❌ Booking error:', error);
        console.error('❌ SQL Message:', error.sqlMessage);
        console.error('❌ Error code:', error.code);

        res.status(500).json({
            success: false,
            error: 'Booking failed',
            details: error.message,
            sqlMessage: error.sqlMessage || 'Unknown SQL error'
        });
    }
});


// Get user's hotel bookings
app.get('/api/hotels/bookings/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('🔍 Fetching hotel bookings for:', userId);

        // TRY BOTH APPROACHES:
        // 1. First try to get bookings directly by user_id
        const [directBookings] = await pool.execute(`
            SELECT 
                hb.*,
                h.hotel_name,
                h.city,
                h.image_urls,
                h.rating,
                h.price_per_night_usd
            FROM hotel_bookings hb
            JOIN hotels h ON hb.hotel_id = h.hotel_id
            WHERE hb.user_id = ?
            ORDER BY hb.created_at DESC
        `, [userId]);

        console.log(`📊 Found ${directBookings.length} direct bookings by user_id`);

        if (directBookings.length > 0) {
            return formatAndReturnBookings(directBookings, res, userId);
        }

        // 2. If no direct bookings, try to get user email and search by email
        const [userData] = await pool.execute(
            'SELECT email FROM user_login WHERE user_id = ?',
            [userId]
        );

        if (userData.length === 0) {
            console.log('⚠️ User not found in user_login');
            return res.json({
                success: true,
                bookings: [],
                count: 0,
                message: 'No bookings found'
            });
        }

        const userEmail = userData[0].email;
        console.log('🔍 Searching bookings by email:', userEmail);

        const [emailBookings] = await pool.execute(`
            SELECT 
                hb.*,
                h.hotel_name,
                h.city,
                h.image_urls,
                h.rating,
                h.price_per_night_usd
            FROM hotel_bookings hb
            JOIN hotels h ON hb.hotel_id = h.hotel_id
            WHERE hb.user_id IN (
                SELECT user_id FROM users WHERE email = ?
                UNION
                SELECT user_id FROM user_login WHERE email = ?
            )
            ORDER BY hb.created_at DESC
        `, [userEmail, userEmail]);

        console.log(`📊 Found ${emailBookings.length} bookings by email`);

        formatAndReturnBookings(emailBookings, res, userId);

    } catch (error) {
        console.error('❌ Error fetching hotel bookings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings',
            details: error.message
        });
    }
});

// Helper function to format bookings
function formatAndReturnBookings(bookings, res, userId) {
    const formattedBookings = bookings.map(booking => {
        const nights = Math.ceil(
            (new Date(booking.check_out_date) - new Date(booking.check_in_date)) /
            (1000 * 60 * 60 * 24)
        );

        // Parse image URLs
        let imageUrls = [];
        if (booking.image_urls && typeof booking.image_urls === 'string') {
            try {
                imageUrls = JSON.parse(booking.image_urls);
            } catch (e) {
                imageUrls = [];
            }
        }

        return {
            id: booking.hotel_booking_id,
            hotel_booking_id: booking.hotel_booking_id,
            hotelName: booking.hotel_name,
            location: booking.city,
            checkIn: booking.check_in_date,
            checkOut: booking.check_out_date,
            roomType: booking.room_type,
            guests: (booking.num_adults || 1) + (booking.num_children || 0),
            total: `$${parseFloat(booking.total_price || 0).toFixed(2)}`,
            price: `$${parseFloat(booking.price_per_night_usd || booking.total_price / nights || 0).toFixed(2)}/night`,
            nights: nights,
            status: booking.booking_status,
            hotel_id: booking.hotel_id,
            num_rooms: booking.num_rooms,
            num_adults: booking.num_adults,
            num_children: booking.num_children,
            total_price: booking.total_price,
            check_in_date: booking.check_in_date,
            check_out_date: booking.check_out_date,
            booking_status: booking.booking_status,
            image_urls: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1566073771259-6a8506099945']
        };
    });

    res.json({
        success: true,
        bookings: formattedBookings,
        count: formattedBookings.length,
        user_id: userId
    });
}


// Sync user between user_login and users tables
async function syncUserToUsersTable(userId) {
    try {
        // Get user from user_login
        const [userLoginData] = await pool.execute(
            'SELECT * FROM user_login WHERE user_id = ?',
            [userId]
        );

        if (userLoginData.length === 0) {
            return null;
        }

        const user = userLoginData[0];

        // Check if user exists in users table
        const [existingUsers] = await pool.execute(
            'SELECT user_id FROM users WHERE email = ?',
            [user.email]
        );

        if (existingUsers.length === 0) {
            // Create user in users table
            await pool.execute(
                `INSERT INTO users (
                    user_id, 
                    full_name, 
                    email, 
                    phone, 
                    country, 
                    city, 
                    whatsapp_number,
                    passport_number,
                    account_status,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
                [
                    user.user_id,
                    user.full_name || '',
                    user.email,
                    user.phone || '',
                    user.country || 'Not specified',
                    user.city || 'Not specified',
                    user.whatsapp_number || user.phone || '',
                    user.passport_number || '',
                ]
            );
            console.log('✅ User synced to users table:', user.user_id);
            return user.user_id;
        }

        return existingUsers[0].user_id;
    } catch (error) {
        console.error('❌ Error syncing user:', error);
        return null;
    }
}

// Call this function in login endpoint after successful login
// Add to your login endpoint:
// const syncedUserId = await syncUserToUsersTable(user.user_id);
// Update hotel booking (dates only)
app.put('/api/hotels/bookings/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { check_in_date, check_out_date, num_rooms } = req.body;

        if (!check_in_date || !check_out_date) {
            return res.status(400).json({
                success: false,
                error: 'Check-in and check-out dates are required'
            });
        }

        // Validate dates
        const checkIn = new Date(check_in_date);
        const checkOut = new Date(check_out_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkIn < today) {
            return res.status(400).json({
                success: false,
                error: 'Check-in date cannot be in the past'
            });
        }

        if (checkOut <= checkIn) {
            return res.status(400).json({
                success: false,
                error: 'Check-out date must be after check-in date'
            });
        }

        // Get current booking details
        const [currentBookings] = await pool.execute(
            `SELECT hb.*, h.available_rooms, h.price_per_night_usd 
             FROM hotel_bookings hb
             JOIN hotels h ON hb.hotel_id = h.hotel_id
             WHERE hb.hotel_booking_id = ?`,
            [bookingId]
        );

        if (currentBookings.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        const currentBooking = currentBookings[0];

        // Check if new dates are different
        const currentCheckIn = new Date(currentBooking.check_in_date).toDateString();
        const newCheckIn = checkIn.toDateString();
        const currentCheckOut = new Date(currentBooking.check_out_date).toDateString();
        const newCheckOut = checkOut.toDateString();

        if (currentCheckIn === newCheckIn && currentCheckOut === newCheckOut &&
            (!num_rooms || num_rooms === currentBooking.num_rooms)) {
            return res.status(400).json({
                success: false,
                error: 'No changes detected'
            });
        }

        // Calculate new total price
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const rooms = num_rooms || currentBooking.num_rooms;
        const total_price = (currentBooking.price_per_night_usd * nights * rooms).toFixed(2);

        // Update booking
        await pool.execute(
            `UPDATE hotel_bookings SET 
                check_in_date = ?,
                check_out_date = ?,
                num_rooms = ?,
                total_price = ?,
                updated_at = NOW()
             WHERE hotel_booking_id = ?`,
            [check_in_date, check_out_date, rooms, total_price, bookingId]
        );

        // Update hotel room availability if number of rooms changed
        if (num_rooms && num_rooms !== currentBooking.num_rooms) {
            const roomDifference = num_rooms - currentBooking.num_rooms;
            await pool.execute(
                'UPDATE hotels SET available_rooms = available_rooms - ? WHERE hotel_id = ?',
                [roomDifference, currentBooking.hotel_id]
            );
        }

        res.json({
            success: true,
            message: 'Booking updated successfully',
            booking_id: bookingId,
            total_price: total_price,
            nights: nights
        });

    } catch (error) {
        console.error('❌ Error updating hotel booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update booking',
            details: error.message
        });
    }
});

// Cancel hotel booking
app.delete('/api/hotels/bookings/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Get booking details before deletion
        const [bookings] = await pool.execute(
            'SELECT hotel_id, num_rooms, booking_status FROM hotel_bookings WHERE hotel_booking_id = ?',
            [bookingId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }

        const booking = bookings[0];

        // Update booking status to cancelled instead of deleting
        await pool.execute(
            `UPDATE hotel_bookings SET 
                booking_status = 'cancelled',
                updated_at = NOW()
             WHERE hotel_booking_id = ?`,
            [bookingId]
        );

        // Return rooms to availability
        await pool.execute(
            'UPDATE hotels SET available_rooms = available_rooms + ? WHERE hotel_id = ?',
            [booking.num_rooms, booking.hotel_id]
        );

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });

    } catch (error) {
        console.error('❌ Error cancelling hotel booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel booking'
        });
    }
});

// Check hotel availability for specific dates
app.get('/api/hotels/:hotelId/availability', async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { check_in_date, check_out_date } = req.query;

        const [hotelData] = await pool.execute(
            'SELECT available_rooms, total_rooms FROM hotels WHERE hotel_id = ?',
            [hotelId]
        );

        if (hotelData.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Hotel not found'
            });
        }

        const hotel = hotelData[0];
        let availableRooms = hotel.available_rooms;

        // If dates provided, check for overlapping bookings
        if (check_in_date && check_out_date) {
            const [overlappingBookings] = await pool.execute(
                `SELECT SUM(num_rooms) as booked_rooms
                 FROM hotel_bookings
                 WHERE hotel_id = ?
                 AND booking_status IN ('confirmed', 'pending')
                 AND (
                     (check_in_date <= ? AND check_out_date > ?) OR
                     (check_in_date < ? AND check_out_date >= ?) OR
                     (check_in_date >= ? AND check_out_date <= ?)
                 )`,
                [hotelId, check_out_date, check_in_date, check_out_date, check_in_date, check_in_date, check_out_date]
            );

            const bookedRooms = overlappingBookings[0].booked_rooms || 0;
            availableRooms = Math.max(0, hotel.total_rooms - bookedRooms);
        }

        res.json({
            success: true,
            hotel_id: hotelId,
            total_rooms: hotel.total_rooms,
            available_rooms: availableRooms,
            is_available: availableRooms > 0
        });

    } catch (error) {
        console.error('❌ Error checking hotel availability:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check availability'
        });
    }
});

// Add to server.js after other endpoints

// ========== IT SUPPORT ENDPOINTS ==========

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
    'sliit': 'sliit123',
    'admin': 'admin123'
};

// Admin Login
// Admin Login (Add this to server.js)
// Admin Login (Add this to server.js)
app.post('/api/admin/login', async (req, res) => {
    console.log('🔐 Admin login attempt:', req.body.username);

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        // Check if user exists in it_admins table
        const [admins] = await pool.execute(
            'SELECT * FROM it_admins WHERE username = ? AND is_active = TRUE',
            [username]
        );

        if (admins.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid username or password'
            });
        }

        const admin = admins[0];

        // Verify password (simple comparison for hardcoded passwords)
        const isValidPassword =
            (username === 'sliit' && password === 'sliit123') ||
            (username === 'admin' && password === 'admin123');

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid username or password'
            });
        }

        // Update last login time
        await pool.execute(
            'UPDATE it_admins SET last_login = NOW() WHERE admin_id = ?',
            [admin.admin_id]
        );

        // Generate token
        const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        console.log('✅ Admin login successful:', username);

        res.json({
            success: true,
            message: 'Login successful',
            username: username,
            token: token,
            role: admin.role || 'admin',
            redirect: '/admin-dashboard'
        });

    } catch (error) {
        console.error('❌ Admin login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
            details: error.message
        });
    }
});

// Check Admin Authentication
app.get('/api/admin/check', async (req, res) => {
    const { token, username } = req.query;

    if (!token || !username) {
        return res.json({
            isAuthenticated: false,
            message: 'No credentials provided'
        });
    }

    // Simple token validation
    const isValid = token.startsWith('admin_') &&
        (username === 'sliit' || username === 'admin');

    res.json({
        isAuthenticated: isValid,
        username: isValid ? username : null,
        role: username === 'sliit' ? 'super_admin' : 'admin'
    });
});

// Admin Check Authentication
app.get('/api/admin/check', async (req, res) => {
    const { token, username } = req.query;

    if (!token || !username) {
        return res.json({
            isAuthenticated: false,
            message: 'No credentials provided'
        });
    }

    // Simple token validation (in production, use JWT)
    const isValid = token.startsWith('admin_') &&
        (username === 'sliit' || username === 'admin');

    res.json({
        isAuthenticated: isValid,
        username: isValid ? username : null,
        role: username === 'sliit' ? 'super_admin' : 'admin'
    });
});

// Get Dashboard Statistics
// ============================================
// FIXED DASHBOARD STATS ENDPOINT
// ============================================

// ============================================
// COMPLETE FIXED ADMIN DASHBOARD STATS ENDPOINT
// ============================================

app.get('/api/admin/dashboard-stats', async (req, res) => {
    console.log('📊 Admin dashboard stats - REAL DATA RETRIEVAL');

    try {
        // Get REAL data from database
        const stats = {
            total_bookings: 0,
            total_revenue: 0,
            active_users: 0,
            total_reviews: 0,
            open_tickets: 0,
            in_progress_tickets: 0,
            hotel_bookings: 0,
            itinerary_requests: 0,
            active_packages: 0,
            active_hotels: 0
        };

        // 1. REAL Bookings count
        try {
            const [bookingsResult] = await pool.execute(
                "SELECT COUNT(*) as count FROM bookings"
            );
            stats.total_bookings = bookingsResult[0]?.count || 0;
        } catch (err) {
            console.log('Bookings query error:', err.message);
        }

        // 2. REAL Revenue
        try {
            const [revenueResult] = await pool.execute(
                "SELECT COALESCE(SUM(total_cost), 0) as total FROM bookings"
            );
            stats.total_revenue = parseFloat(revenueResult[0]?.total) || 0;
        } catch (err) {
            console.log('Revenue query error:', err.message);
        }

        // 3. REAL Active users (from user_login)
        try {
            const [usersResult] = await pool.execute(
                "SELECT COUNT(*) as count FROM user_login"
            );
            stats.active_users = usersResult[0]?.count || 0;
        } catch (err) {
            console.log('Users query error:', err.message);
        }

        // 4. REAL Reviews
        try {
            const [reviewsResult] = await pool.execute(
                "SELECT COUNT(*) as count FROM reviews"
            );
            stats.total_reviews = reviewsResult[0]?.count || 0;
        } catch (err) {
            console.log('Reviews query error:', err.message);
        }

        // 5. REAL Tickets
        try {
            const [openTicketsResult] = await pool.execute(
                "SELECT COUNT(*) as count FROM it_tickets WHERE status = 'open'"
            );
            stats.open_tickets = openTicketsResult[0]?.count || 0;

            const [progressTicketsResult] = await pool.execute(
                "SELECT COUNT(*) as count FROM it_tickets WHERE status = 'in_progress'"
            );
            stats.in_progress_tickets = progressTicketsResult[0]?.count || 0;
        } catch (err) {
            console.log('Tickets query error:', err.message);
        }

        // 6. REAL Hotel bookings
        try {
            const [hotelBookingsResult] = await pool.execute(
                "SELECT COUNT(*) as count FROM hotel_bookings"
            );
            stats.hotel_bookings = hotelBookingsResult[0]?.count || 0;
        } catch (err) {
            console.log('Hotel bookings query error:', err.message);
        }

        // 7. REAL Itinerary requests
        try {
            const [itinerariesResult] = await pool.execute(
                "SELECT COUNT(*) as count FROM questionnaire_responses"
            );
            stats.itinerary_requests = itinerariesResult[0]?.count || 0;
        } catch (err) {
            console.log('Itineraries query error:', err.message);
        }

        // 8. REAL Active packages
        try {
            const [packagesResult] = await pool.execute(
                "SELECT COUNT(*) as count FROM packages WHERE is_active = TRUE"
            );
            stats.active_packages = packagesResult[0]?.count || 0;
        } catch (err) {
            console.log('Packages query error:', err.message);
        }

        // 9. REAL Active hotels
        try {
            const [hotelsResult] = await pool.execute(
                "SELECT COUNT(*) as count FROM hotels WHERE is_active = TRUE"
            );
            stats.active_hotels = hotelsResult[0]?.count || 0;
        } catch (err) {
            console.log('Hotels query error:', err.message);
        }

        // Get REAL revenue data for chart (last 6 months)
        let revenueData = [];
        try {
            const [revenueRows] = await pool.execute(`
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    COALESCE(SUM(total_cost), 0) as revenue
                FROM bookings 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month DESC
                LIMIT 6
            `);
            revenueData = revenueRows || [];
        } catch (err) {
            console.log('Revenue chart query error:', err.message);
        }

        // Get REAL booking trends (last 30 days)
        let bookingTrends = [];
        try {
            const [trendRows] = await pool.execute(`
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as bookings
                FROM bookings 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY DATE(created_at)
                ORDER BY date
            `);
            bookingTrends = trendRows || [];
        } catch (err) {
            console.log('Booking trends query error:', err.message);
        }

        // Get REAL popular packages
        let popularPackages = [];
        try {
            const [packageRows] = await pool.execute(`
                SELECT 
                    p.package_name,
                    COUNT(b.booking_id) as booking_count,
                    COALESCE(SUM(b.total_cost), 0) as revenue
                FROM bookings b
                LEFT JOIN packages p ON b.package_id = p.package_id
                GROUP BY p.package_id, p.package_name
                ORDER BY booking_count DESC
                LIMIT 5
            `);
            popularPackages = packageRows || [];
        } catch (err) {
            console.log('Popular packages query error:', err.message);
        }

        console.log('✅ REAL Dashboard stats retrieved:', stats);

        res.json({
            success: true,
            stats: stats,
            revenueData: revenueData,
            bookingTrends: bookingTrends,
            popularPackages: popularPackages
        });

    } catch (error) {
        console.error('❌ Error in dashboard stats:', error);
        res.status(500).json({
            success: false,
            error: 'Database error',
            message: error.message
        });
    }
});
// Create new IT ticket
// Create new IT ticket
// Create new IT ticket
app.post('/api/it-support/tickets', async (req, res) => {
    console.log('🎫 Creating IT ticket:', req.body);

    try {
        const {
            user_id,
            user_email,
            user_name,
            issue_category,
            title,
            description,
            priority = 'medium'
        } = req.body;

        // Validate required fields
        if (!user_id || !issue_category || !title || !description) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Generate ticket ID
        const ticket_id = `TICKET_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Create ticket
        await pool.execute(
            `INSERT INTO it_tickets (
                ticket_id,
                user_id,
                user_email,
                user_name,
                issue_category,
                title,
                description,
                priority,
                status,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', NOW())`,
            [
                ticket_id,
                user_id,
                user_email || '',
                user_name || 'User',
                issue_category,
                title,
                description,
                priority
            ]
        );

        // Add initial message
        const message_id = `MSG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await pool.execute(
            `INSERT INTO it_ticket_messages (
                message_id,
                ticket_id,
                sender_id,
                sender_type,
                message_text
            ) VALUES (?, ?, ?, 'user', ?)`,
            [message_id, ticket_id, user_id, description]
        );

        console.log('✅ IT ticket created:', ticket_id);

        res.json({
            success: true,
            message: 'Ticket created successfully',
            ticket_id: ticket_id
        });

    } catch (error) {
        console.error('❌ Error creating IT ticket:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create ticket',
            details: error.message
        });
    }
});

// Get user's tickets
app.get('/api/it-support/tickets/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

        const conditions = ['t.user_id = ?'];
        const queryParams = [userId];
        const offset = (parseInt(page) - 1) * parseInt(limit);

        if (status && status !== 'all') {
            conditions.push('t.status = ?');
            queryParams.push(status);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get tickets
        const [tickets] = await pool.execute(`
            SELECT 
                t.*,
                COUNT(m.message_id) as message_count,
                MAX(m.created_at) as last_message_date
            FROM it_tickets t
            LEFT JOIN it_ticket_messages m ON t.ticket_id = m.ticket_id
            ${whereClause}
            GROUP BY t.ticket_id
            ORDER BY t.created_at DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, parseInt(limit), offset]);

        // Get total count
        const [countResult] = await pool.execute(`
            SELECT COUNT(*) as total 
            FROM it_tickets t
            ${whereClause}
        `, queryParams);

        // Get unread message counts
        const unreadCounts = {};
        for (const ticket of tickets) {
            const [unread] = await pool.execute(`
                SELECT COUNT(*) as count 
                FROM it_ticket_messages 
                WHERE ticket_id = ? 
                AND sender_type = 'admin' 
                AND is_read = FALSE
            `, [ticket.ticket_id]);
            ticket.unread_messages = unread[0]?.count || 0;
        }

        res.json({
            success: true,
            tickets: tickets,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0]?.total || 0,
                pages: Math.ceil((countResult[0]?.total || 0) / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('❌ Error fetching user tickets:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tickets'
        });
    }
});

// Get single ticket with messages
app.get('/api/it-support/tickets/:ticketId', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { email } = req.query;

        // Get ticket
        const [tickets] = await pool.execute(
            'SELECT * FROM it_tickets WHERE ticket_id = ?',
            [ticketId]
        );

        if (tickets.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Ticket not found'
            });
        }

        const ticket = tickets[0];

        // Check if user owns this ticket (by email)
        if (email && ticket.user_email !== email) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        // Get messages
        const [messages] = await pool.execute(
            'SELECT * FROM it_ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC',
            [ticketId]
        );

        res.json({
            success: true,
            ticket: ticket,
            messages: messages || []
        });

    } catch (error) {
        console.error('❌ Error fetching ticket:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ticket'
        });
    }
});

// Add message to ticket (User)
app.post('/api/it-support/tickets/:ticketId/messages', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { user_email, message_text } = req.body;

        // Verify ticket exists and belongs to user
        const [tickets] = await pool.execute(
            'SELECT * FROM it_tickets WHERE ticket_id = ? AND user_email = ?',
            [ticketId, user_email]
        );

        if (tickets.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Ticket not found or access denied'
            });
        }

        // Create message
        const message_id = `MSG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await pool.execute(
            'INSERT INTO it_ticket_messages (message_id, ticket_id, sender_id, sender_type, message_text) VALUES (?, ?, ?, "user", ?)',
            [message_id, ticketId, user_email, message_text]
        );

        res.json({
            success: true,
            message: 'Message sent'
        });

    } catch (error) {
        console.error('❌ Error adding message:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send message'
        });
    }
});
app.get('/api/it-support/tickets/by-email/:email', async (req, res) => {
    console.log('📋 Fetching tickets for email:', req.params.email);

    try {
        const { email } = req.params;
        const { status, search } = req.query;

        // Build query
        let query = 'SELECT * FROM it_tickets WHERE user_email = ?';
        const params = [email];

        if (status && status !== 'all') {
            query += ' AND status = ?';
            params.push(status);
        }

        if (search) {
            query += ' AND (title LIKE ? OR description LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        query += ' ORDER BY created_at DESC';

        console.log('Executing query:', query, 'with params:', params);

        const [tickets] = await pool.execute(query, params);

        // Get message count for each ticket
        for (const ticket of tickets) {
            const [messageCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM it_ticket_messages WHERE ticket_id = ?',
                [ticket.ticket_id]
            );
            ticket.message_count = messageCount[0]?.count || 0;

            // Get unread messages count
            const [unreadCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM it_ticket_messages WHERE ticket_id = ? AND sender_type = "admin" AND is_read = FALSE',
                [ticket.ticket_id]
            );
            ticket.unread_messages = unreadCount[0]?.count || 0;
        }

        res.json({
            success: true,
            tickets: tickets || []
        });

    } catch (error) {
        console.error('❌ Error fetching tickets by email:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tickets',
            details: error.message
        });
    }
});



// Update ticket (User - only title/description)
app.put('/api/it-support/tickets/:ticketId', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { user_id, title, description } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        // Verify ticket belongs to user
        const [tickets] = await pool.execute(
            'SELECT user_id, status FROM it_tickets WHERE ticket_id = ?',
            [ticketId]
        );

        if (tickets.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Ticket not found'
            });
        }

        if (tickets[0].user_id !== user_id) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        // Can only edit open tickets
        if (tickets[0].status !== 'open') {
            return res.status(400).json({
                success: false,
                error: 'Can only edit open tickets'
            });
        }

        // Build update query
        const updateFields = [];
        const updateValues = [];

        if (title) {
            updateFields.push('title = ?');
            updateValues.push(title);
        }

        if (description) {
            updateFields.push('description = ?');
            updateValues.push(description);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }

        updateFields.push('updated_at = NOW()');
        updateValues.push(ticketId);

        const query = `UPDATE it_tickets SET ${updateFields.join(', ')} WHERE ticket_id = ?`;

        await pool.execute(query, updateValues);

        // Log activity
        await pool.execute(
            `INSERT INTO it_ticket_activities (ticket_id, user_id, action_type, description) VALUES (?, ?, 'ticket_updated', 'Ticket details updated by user')`,
            [ticketId, user_id]
        );

        res.json({
            success: true,
            message: 'Ticket updated successfully'
        });

    } catch (error) {
        console.error('❌ Error updating ticket:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update ticket'
        });
    }
});

// Delete ticket (User - only if open)
// Delete ticket (User - only if open)
app.delete('/api/it-support/tickets/:ticketId', async (req, res) => {
    console.log('🗑️ DELETE ticket request:', req.params.ticketId);

    try {
        const { ticketId } = req.params;
        const { user_email } = req.body;

        console.log('Request body:', req.body);
        console.log('User email from request:', user_email);

        if (!user_email) {
            console.log('❌ No email provided in request');
            return res.status(400).json({
                success: false,
                error: 'Email is required in request body'
            });
        }

        // Verify ticket exists and belongs to user by email
        const [tickets] = await pool.execute(
            'SELECT user_email, status FROM it_tickets WHERE ticket_id = ?',
            [ticketId]
        );

        console.log('Found tickets:', tickets);

        if (tickets.length === 0) {
            console.log('❌ Ticket not found:', ticketId);
            return res.status(404).json({
                success: false,
                error: 'Ticket not found'
            });
        }

        const ticket = tickets[0];

        // Check if ticket belongs to user
        if (ticket.user_email !== user_email) {
            console.log('❌ Email mismatch. Ticket email:', ticket.user_email, 'Request email:', user_email);
            return res.status(403).json({
                success: false,
                error: 'Access denied - ticket does not belong to this user'
            });
        }

        // Can only delete open tickets
        if (ticket.status !== 'open') {
            console.log('❌ Cannot delete - ticket status is:', ticket.status);
            return res.status(400).json({
                success: false,
                error: 'Can only delete open tickets. Current status: ' + ticket.status
            });
        }

        console.log('✅ Deleting ticket:', ticketId);

        // Delete ticket (cascade will delete messages)
        await pool.execute(
            'DELETE FROM it_tickets WHERE ticket_id = ?',
            [ticketId]
        );

        console.log('✅ Ticket deleted successfully');

        res.json({
            success: true,
            message: 'Ticket deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting ticket:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete ticket',
            details: error.message
        });
    }
});

// ========== ADMIN LOGIN ENDPOINT ==========
// (Make sure this is NOT inside any other function or catch block)

// ========== ADMIN LOGIN ENDPOINT ==========
app.post('/api/admin/login', async (req, res) => {
    console.log('🔐 Admin login attempt:', req.body.username);

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        // Generate SHA256 hash of the provided password
        const crypto = require('crypto');
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        // Check if user exists in it_admins table with matching password hash
        const [admins] = await pool.execute(
            'SELECT * FROM it_admins WHERE username = ? AND password_hash = ? AND is_active = TRUE',
            [username, passwordHash]
        );

        if (admins.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid username or password'
            });
        }

        const admin = admins[0];

        // Update last login time
        await pool.execute(
            'UPDATE it_admins SET last_login = NOW() WHERE admin_id = ?',
            [admin.admin_id]
        );

        // Generate token
        const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        console.log('✅ Admin login successful:', username);

        res.json({
            success: true,
            message: 'Login successful',
            username: username,
            token: token,
            role: admin.role || 'admin',
            redirect: '/admin-dashboard'
        });

    } catch (error) {
        console.error('❌ Admin login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
            details: error.message
        });
    }
});

// ========== IT TICKET ENDPOINTS (ADMIN) ==========

// ========== DEBUG ENDPOINTS ==========

// Get all tickets (Admin)
// FIXED IT TICKETS ENDPOINT
// FIXED IT TICKETS ENDPOINT
app.get('/api/admin/it-tickets', async (req, res) => {
    console.log('📋 Admin fetching tickets - FIXED');

    try {
        const {
            status = 'all',
            priority = 'all',
            category = 'all',
            search = '',
            page = 1,
            limit = 20
        } = req.query;

        // Build query with safe defaults
        let query = `
            SELECT
                t.ticket_id,
                t.title,
                t.description,
                t.issue_category,
                t.priority,
                t.status,
                t.user_name,
                t.user_email,
                t.created_at,
                t.updated_at,
                COUNT(m.message_id) as message_count,
                DATEDIFF(NOW(), t.created_at) as days_open
            FROM it_tickets t
                     LEFT JOIN it_ticket_messages m ON t.ticket_id = m.ticket_id
        `;

        const conditions = [];
        const queryParams = [];

        // Add filters if provided
        if (status && status !== 'all') {
            conditions.push('t.status = ?');
            queryParams.push(status);
        }

        if (priority && priority !== 'all') {
            conditions.push('t.priority = ?');
            queryParams.push(priority);
        }

        if (category && category !== 'all') {
            conditions.push('t.issue_category = ?');
            queryParams.push(category);
        }

        if (search) {
            conditions.push('(t.title LIKE ? OR t.description LIKE ? OR t.user_name LIKE ?)');
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }

        // Add WHERE clause if there are conditions
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Add GROUP BY and ORDER BY
        query += ' GROUP BY t.ticket_id';
        query += ' ORDER BY t.created_at DESC';

        // Add LIMIT (safely)
        const limitNum = parseInt(limit) || 20;
        const offsetNum = (parseInt(page) - 1) * limitNum;
        query += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;

        console.log('Executing tickets query');
        const [tickets] = await pool.execute(query, queryParams);

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM it_tickets t';
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }

        const [countResult] = await pool.execute(countQuery, queryParams);
        const total = countResult[0]?.total || 0;

        console.log(`✅ Found ${tickets.length} tickets`);

        res.json({
            success: true,
            tickets: tickets || [],
            pagination: {
                page: parseInt(page),
                limit: limitNum,
                total: total,
                pages: Math.ceil(total / limitNum)
            }
        });

    } catch (error) {
        console.error('❌ Error fetching tickets:', error);
        console.error('Error details:', error.message);

        // If complex query fails, try simple query
        try {
            console.log('Trying simple tickets query...');
            const [simpleTickets] = await pool.execute(
                "SELECT * FROM it_tickets ORDER BY created_at DESC LIMIT 20"
            );

            res.json({
                success: true,
                tickets: simpleTickets || [],
                pagination: {
                    page: 1,
                    limit: 20,
                    total: simpleTickets?.length || 0,
                    pages: 1
                }
            });
        } catch (simpleError) {
            console.error('Simple query also failed:', simpleError);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch tickets',
                message: simpleError.message
            });
        }
    }
});

// Admin: Update ticket status
// FIXED: Update ticket status
app.put('/api/admin/it-tickets/:ticketId/status', async (req, res) => {
    const { ticketId } = req.params;
    const { status, admin_username } = req.body;

    console.log(`Updating ticket ${ticketId} status to: ${status}`);

    try {
        // Validate status
        const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be: open, in_progress, resolved, or closed'
            });
        }

        // Update ticket
        await pool.execute(
            'UPDATE it_tickets SET status = ?, updated_at = NOW() WHERE ticket_id = ?',
            [status, ticketId]
        );

        // Log activity if admin provided
        if (admin_username) {
            await pool.execute(
                'INSERT INTO it_ticket_activities (ticket_id, action_type, description) VALUES (?, "status_changed", ?)',
                [ticketId, `Status changed to ${status} by admin ${admin_username}`]
            );
        }

        res.json({
            success: true,
            message: 'Ticket status updated successfully'
        });

    } catch (error) {
        console.error('Error updating ticket status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update ticket status',
            message: error.message
        });
    }
});
// Admin: Add message to ticket
// FIXED: Add admin message to ticket
app.post('/api/admin/it-tickets/:ticketId/messages', async (req, res) => {
    const { ticketId } = req.params;
    const { message_text, admin_username } = req.body;

    console.log(`Admin ${admin_username} sending message to ticket ${ticketId}`);

    try {
        if (!message_text || !message_text.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Message text is required'
            });
        }

        // Generate message ID
        const message_id = `ADMIN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Insert message
        await pool.execute(
            'INSERT INTO it_ticket_messages (message_id, ticket_id, sender_id, sender_type, message_text) VALUES (?, ?, ?, "admin", ?)',
            [message_id, ticketId, admin_username || 'admin', message_text]
        );

        // Update ticket timestamp
        await pool.execute(
            'UPDATE it_tickets SET updated_at = NOW() WHERE ticket_id = ?',
            [ticketId]
        );

        // Update ticket status to in_progress if it was open
        await pool.execute(
            `UPDATE it_tickets SET status = 'in_progress' WHERE ticket_id = ? AND status = 'open'`,
            [ticketId]
        );

        // Log activity
        if (admin_username) {
            await pool.execute(
                'INSERT INTO it_ticket_activities (ticket_id, action_type, description) VALUES (?, "admin_replied", ?)',
                [ticketId, `Admin ${admin_username} replied to ticket`]
            );
        }

        res.json({
            success: true,
            message: 'Message sent successfully',
            message_id: message_id
        });

    } catch (error) {
        console.error('Error sending admin message:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send message',
            message: error.message
        });
    }
});


// Admin: Assign ticket
app.post('/api/admin/it-tickets/:ticketId/assign', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { admin_username, assign_to } = req.body;

        if (!admin_username || !assign_to) {
            return res.status(400).json({
                success: false,
                error: 'Admin username and assign_to are required'
            });
        }

        // Verify admin
        const [admins] = await pool.execute(
            'SELECT admin_id FROM it_admins WHERE username = ?',
            [admin_username]
        );

        if (admins.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'Invalid admin credentials'
            });
        }

        // Update assignment
        await pool.execute(
            `UPDATE it_tickets SET 
                assigned_to = ?,
                status = 'in_progress',
                updated_at = NOW()
             WHERE ticket_id = ?`,
            [assign_to, ticketId]
        );

        // Log activity
        await pool.execute(
            `INSERT INTO it_ticket_activities (ticket_id, admin_id, action_type, description) 
             VALUES (?, ?, 'ticket_assigned', ?)`,
            [ticketId, admins[0].admin_id, `Ticket assigned to ${assign_to}`]
        );

        res.json({
            success: true,
            message: 'Ticket assigned successfully'
        });

    } catch (error) {
        console.error('❌ Error assigning ticket:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to assign ticket'
        });
    }
});

// Admin: Get ticket analytics
app.get('/api/admin/it-tickets/analytics', async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        let dateFormat, interval;
        switch (period) {
            case 'day':
                dateFormat = '%Y-%m-%d';
                interval = '7 DAY';
                break;
            case 'week':
                dateFormat = '%Y-%u';
                interval = '12 WEEK';
                break;
            case 'month':
            default:
                dateFormat = '%Y-%m';
                interval = '6 MONTH';
                break;
        }

        // Ticket creation trends
        const [creationTrends] = await pool.execute(`
            SELECT 
                DATE_FORMAT(created_at, ?) as period,
                COUNT(*) as ticket_count,
                SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical_count,
                SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_count
            FROM it_tickets
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${interval})
            GROUP BY DATE_FORMAT(created_at, ?)
            ORDER BY period
        `, [dateFormat, dateFormat]);

        // Resolution time analysis
        const [resolutionStats] = await pool.execute(`
            SELECT 
                issue_category,
                COUNT(*) as total_tickets,
                AVG(TIMESTAMPDIFF(HOUR, created_at, resolution_date)) as avg_resolution_hours,
                MIN(TIMESTAMPDIFF(HOUR, created_at, resolution_date)) as min_resolution_hours,
                MAX(TIMESTAMPDIFF(HOUR, created_at, resolution_date)) as max_resolution_hours
            FROM it_tickets
            WHERE status = 'resolved'
            AND resolution_date IS NOT NULL
            GROUP BY issue_category
            ORDER BY total_tickets DESC
        `);

        // Admin performance
        const [adminPerformance] = await pool.execute(`
            SELECT 
                t.assigned_to as admin_name,
                COUNT(*) as total_assigned,
                SUM(CASE WHEN t.status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
                AVG(TIMESTAMPDIFF(HOUR, t.created_at, t.resolution_date)) as avg_resolution_time
            FROM it_tickets t
            WHERE t.assigned_to IS NOT NULL
            GROUP BY t.assigned_to
            ORDER BY resolved_count DESC
        `);

        // Category distribution
        const [categoryDistribution] = await pool.execute(`
            SELECT 
                issue_category,
                COUNT(*) as count,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM it_tickets), 2) as percentage
            FROM it_tickets
            GROUP BY issue_category
            ORDER BY count DESC
        `);

        res.json({
            success: true,
            analytics: {
                creationTrends,
                resolutionStats,
                adminPerformance,
                categoryDistribution,
                period: period
            }
        });

    } catch (error) {
        console.error('❌ Error fetching ticket analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics'
        });

        // Update review - PUT endpoint (MISSING FROM YOUR CODE)
        app.put('/api/reviews/:reviewId', async (req, res) => {
            console.log('✏️ PUT /api/reviews called for:', req.params.reviewId);
            console.log('📦 Request body:', req.body);

            try {
                const { reviewId } = req.params;
                const { user_id, rating, title, review_text, review_type, entity_name } = req.body;

                if (!user_id) {
                    return res.status(400).json({
                        success: false,
                        error: 'User ID required'
                    });
                }

                // Check if review exists and belongs to user
                const [existingReviews] = await pool.execute(
                    'SELECT user_id FROM reviews WHERE review_id = ?',
                    [reviewId]
                );

                if (existingReviews.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Review not found'
                    });
                }

                if (existingReviews[0].user_id !== user_id) {
                    return res.status(403).json({
                        success: false,
                        error: 'Not authorized to edit this review'
                    });
                }

                // Check for bad words
                const containsBadWords = await checkForBadWords(`${title} ${review_text}`);

                // Update review
                await pool.execute(
                    `UPDATE reviews SET
                rating = ?,
                title = ?,
                review_text = ?,
                review_type = ?,
                entity_name = ?,
                status = ?,
                updated_at = NOW()
             WHERE review_id = ?`,
                    [
                        rating,
                        title,
                        review_text,
                        review_type,
                        entity_name || null,
                        containsBadWords ? 'pending' : 'approved',
                        reviewId
                    ]
                );

                console.log('✅ Review updated:', reviewId);

                res.json({
                    success: true,
                    message: containsBadWords
                        ? 'Review updated and pending moderation'
                        : 'Review updated successfully',
                    review_id: reviewId,
                    status: containsBadWords ? 'pending' : 'approved'
                });

            } catch (error) {
                console.error('❌ Error updating review:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to update review',
                    details: error.message
                });
            }
        });
    }
});

// ========== START SERVER ==========

app.listen(PORT, async () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
    console.log(`📊 AI Endpoints proxied to: ${FLASK_AI_API}`);
    console.log(`📋 Available endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/api/health`);
    console.log(`   GET  http://localhost:${PORT}/api/packages`);
    console.log(`   GET  http://localhost:${PORT}/api/packages/:id`);
    console.log(`   POST http://localhost:${PORT}/api/book-package`);
    console.log(`   POST http://localhost:${PORT}/api/calculate-price`);
    console.log(`   POST http://localhost:${PORT}/api/chat/message`);
    console.log(`   GET  http://localhost:${PORT}/api/destinations → Flask AI`);
    console.log(`   POST http://localhost:${PORT}/api/ai-recommend → Flask AI`);
    console.log(`   GET  http://localhost:${PORT}/api/test-db-schema → Check database schema`);

    // Initialize database tables
    await initializeDatabase();
});