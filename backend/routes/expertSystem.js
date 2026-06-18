// TODO: Current expert system doesn't go further than 7 days
// REQUIREMENT GATHERING NEEDED:
// - Discuss with stakeholders about multi-week itineraries
// - Consider breaking long trips into phases/regions
// - Implement dynamic day allocation based on interests
// - Add rest days for longer trips
// - Consider seasonal variations for extended stays

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { analyzeQuestionnaire } = require('../utils/expertSystem');

/**
 * POST /api/expert-system/recommend
 * Generate personalized recommendations based on questionnaire
 */
router.post('/recommend', async (req, res) => {
    try {
        const answers = req.body;
        
        // Validate required fields
        if (!answers.interests || !answers.duration || !answers.travelerType) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: interests, duration, travelerType'
            });
        }
        
        // Fetch destinations from database
        const [destinations] = await pool.execute(`
            SELECT destination_id, destination_name, type, description, 
                   latitude, longitude, best_visit_start, best_visit_end, 
                   image_url, tags
            FROM destinations
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        `);
        
        if (destinations.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No destinations available'
            });
        }
        
        // Fetch packages from database
        const [packages] = await pool.execute(`
            SELECT package_id, package_name, package_type, description, 
                   duration_days, price_per_person_usd, per_person_cost,
                   included_activities, included_meal_plans, accommodation_type,
                   transport_included, transport_type, image_urls, routes
            FROM packages
        `);
        
        // Run expert system analysis
        const recommendations = analyzeQuestionnaire(answers, destinations, packages);
        
        // Log for analytics (optional)
        console.log(`✅ Expert System: Generated ${recommendations.recommended_cities.length} cities and ${recommendations.matching_packages.length} packages`);
        
        res.json({
            success: true,
            ...recommendations
        });
        
    } catch (error) {
        console.error('❌ Expert system error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate recommendations',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/expert-system/weights
 * Get current scoring weights (for admin tuning)
 */
router.get('/weights', (req, res) => {
    const { WEIGHTS, TRAVELER_COMPATIBILITY, INTEREST_MAPPING } = require('../utils/expertSystem');
    
    res.json({
        success: true,
        weights: WEIGHTS,
        traveler_compatibility: TRAVELER_COMPATIBILITY,
        interest_mapping: INTEREST_MAPPING
    });
});

module.exports = router;
