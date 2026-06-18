const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

router.get('/destinations', async (req, res) => {
    try {
        const [destinations] = await pool.execute(`
            SELECT destination_id, destination_name, type, latitude, longitude, 
                   description, tags, image_url
            FROM destinations
        `);

        const mapData = destinations.map(dest => ({
            id: dest.destination_id,
            name: dest.destination_name,
            type: dest.type,
            lat: parseFloat(dest.latitude),
            lng: parseFloat(dest.longitude),
            description: dest.description,
            tags: typeof dest.tags === 'string' ? JSON.parse(dest.tags) : dest.tags,
            image: dest.image_url
        }));

        res.json({
            success: true,
            destinations: mapData
        });
    } catch (error) {
        console.error('Error fetching map destinations:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch destinations' 
        });
    }
});

router.get('/hotels', async (req, res) => {
    try {
        const { destination_id, max_price, type } = req.query;

        let query = `
            SELECT h.hotel_id, h.hotel_name, h.type, h.latitude, h.longitude,
                   h.price_per_night_usd, h.amenities, d.destination_name
            FROM hotels h
            JOIN destinations d ON h.destination_id = d.destination_id
            WHERE 1=1
        `;
        const params = [];

        if (destination_id) {
            query += ' AND h.destination_id = ?';
            params.push(destination_id);
        }

        if (max_price) {
            query += ' AND h.price_per_night_usd <= ?';
            params.push(parseFloat(max_price));
        }

        if (type) {
            query += ' AND h.type = ?';
            params.push(type);
        }

        const [hotels] = await pool.execute(query, params);

        const mapData = hotels.map(hotel => ({
            id: hotel.hotel_id,
            name: hotel.hotel_name,
            type: hotel.type,
            lat: parseFloat(hotel.latitude),
            lng: parseFloat(hotel.longitude),
            price: parseFloat(hotel.price_per_night_usd),
            amenities: typeof hotel.amenities === 'string' ? JSON.parse(hotel.amenities) : hotel.amenities,
            destination: hotel.destination_name
        }));

        res.json({
            success: true,
            hotels: mapData
        });
    } catch (error) {
        console.error('Error fetching map hotels:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch hotels' 
        });
    }
});

router.get('/package/:id/route', async (req, res) => {
    try {
        const { id } = req.params;

        const [packages] = await pool.execute(
            'SELECT routes FROM packages WHERE package_id = ?',
            [id]
        );

        if (packages.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Package not found' 
            });
        }

        const routes = typeof packages[0].routes === 'string' 
            ? JSON.parse(packages[0].routes) 
            : packages[0].routes;

        const locationNames = [...new Set(routes.map(r => r.location))];

        const [destinations] = await pool.execute(`
            SELECT destination_id, destination_name, latitude, longitude, type
            FROM destinations
            WHERE destination_name IN (${locationNames.map(() => '?').join(',')})
        `, locationNames);

        const routeWithCoordinates = routes.map(route => {
            const dest = destinations.find(d => d.destination_name === route.location);
            return {
                ...route,
                destination_id: dest?.destination_id,
                lat: dest ? parseFloat(dest.latitude) : null,
                lng: dest ? parseFloat(dest.longitude) : null,
                type: dest?.type
            };
        }).filter(r => r.lat && r.lng);

        // Fetch actual road distance from OSRM
        let totalDistance = 0;
        try {
            const coords = routeWithCoordinates.map(r => `${r.lng},${r.lat}`).join(';');
            const osrmResponse = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`
            );
            const osrmData = await osrmResponse.json();
            if (osrmData.code === 'Ok' && osrmData.routes[0]) {
                totalDistance = Math.round(osrmData.routes[0].distance / 1000);
            }
        } catch (osrmError) {
            console.warn('OSRM API failed, using Haversine fallback');
            for (let i = 0; i < routeWithCoordinates.length - 1; i++) {
                const current = routeWithCoordinates[i];
                const next = routeWithCoordinates[i + 1];
                totalDistance += calculateDistance(current.lat, current.lng, next.lat, next.lng);
            }
            totalDistance = Math.round(totalDistance);
        }

        res.json({
            success: true,
            route: routeWithCoordinates,
            totalDistance
        });
    } catch (error) {
        console.error('Error fetching package route:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch package route' 
        });
    }
});

module.exports = router;
