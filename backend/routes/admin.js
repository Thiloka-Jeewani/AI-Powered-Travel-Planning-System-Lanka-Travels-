const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');
const { destinationValidation, hotelValidation, packageValidation } = require('../middleware/validation');
const { v4: uuidv4 } = require('uuid');

router.post('/destinations', authenticateAdmin, destinationValidation, async (req, res) => {
    try {
        const { destination_name, type, description, latitude, longitude, best_visit_start, best_visit_end, tags, image_url } = req.body;
        
        const destinationId = uuidv4();
        
        await pool.execute(
            `INSERT INTO destinations 
            (destination_id, destination_name, type, description, latitude, longitude, 
             best_visit_start, best_visit_end, tags, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [destinationId, destination_name, type, description, latitude, longitude, 
             best_visit_start, best_visit_end, JSON.stringify(tags), image_url]
        );

        res.json({
            success: true,
            message: 'Destination created successfully',
            destination_id: destinationId
        });
    } catch (error) {
        console.error('Error creating destination:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create destination' 
        });
    }
});

router.put('/destinations/:id', authenticateAdmin, destinationValidation, async (req, res) => {
    try {
        const { id } = req.params;
        const { destination_name, type, description, latitude, longitude, best_visit_start, best_visit_end, tags, image_url } = req.body;

        await pool.execute(
            `UPDATE destinations 
            SET destination_name = ?, type = ?, description = ?, latitude = ?, longitude = ?,
                best_visit_start = ?, best_visit_end = ?, tags = ?, image_url = ?
            WHERE destination_id = ?`,
            [destination_name, type, description, latitude, longitude, 
             best_visit_start, best_visit_end, JSON.stringify(tags), image_url, id]
        );

        res.json({
            success: true,
            message: 'Destination updated successfully'
        });
    } catch (error) {
        console.error('Error updating destination:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update destination' 
        });
    }
});

router.delete('/destinations/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.execute('DELETE FROM destinations WHERE destination_id = ?', [id]);

        res.json({
            success: true,
            message: 'Destination deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting destination:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete destination' 
        });
    }
});

router.post('/hotels', authenticateAdmin, hotelValidation, async (req, res) => {
    try {
        const { hotel_name, destination_id, type, address, latitude, longitude, 
                price_per_night_usd, room_types, meal_plans, amenities, image_urls, 
                contact_email, contact_phone } = req.body;
        
        const hotelId = uuidv4();

        let finalLat = latitude;
        let finalLng = longitude;

        if (!latitude || !longitude) {
            const [destination] = await pool.execute(
                'SELECT latitude, longitude FROM destinations WHERE destination_id = ?',
                [destination_id]
            );
            if (destination.length > 0) {
                finalLat = parseFloat(destination[0].latitude) + (Math.random() * 0.02 - 0.01);
                finalLng = parseFloat(destination[0].longitude) + (Math.random() * 0.02 - 0.01);
            }
        }

        await pool.execute(
            `INSERT INTO hotels 
            (hotel_id, hotel_name, destination_id, type, address, latitude, longitude,
             price_per_night_usd, room_types, meal_plans, amenities, image_urls,
             contact_email, contact_phone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [hotelId, hotel_name, destination_id, type, address, finalLat, finalLng,
             price_per_night_usd, JSON.stringify(room_types), JSON.stringify(meal_plans),
             JSON.stringify(amenities), JSON.stringify(image_urls), contact_email, contact_phone]
        );

        res.json({
            success: true,
            message: 'Hotel created successfully',
            hotel_id: hotelId
        });
    } catch (error) {
        console.error('Error creating hotel:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create hotel' 
        });
    }
});

router.get('/destinations', authenticateAdmin, async (req, res) => {
    try {
        const [destinations] = await pool.execute('SELECT * FROM destinations ORDER BY created_at DESC');
        res.json({
            success: true,
            destinations
        });
    } catch (error) {
        console.error('Error fetching destinations:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch destinations' 
        });
    }
});

router.get('/hotels', authenticateAdmin, async (req, res) => {
    try {
        const [hotels] = await pool.execute(`
            SELECT h.*, d.destination_name 
            FROM hotels h
            LEFT JOIN destinations d ON h.destination_id = d.destination_id
            ORDER BY h.hotel_name
        `);
        res.json({
            success: true,
            hotels
        });
    } catch (error) {
        console.error('Error fetching hotels:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch hotels' 
        });
    }
});

module.exports = router;
