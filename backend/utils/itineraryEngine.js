const pool = require('../config/database');

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

async function generateCustomItinerary(questionnaireData) {
    const {
        interests,
        budget,
        exact_days,
        preferred_destinations,
        accommodation_type,
        starting_point
    } = questionnaireData;

    const budgetPerDay = parseBudget(budget) / exact_days;
    const selectedDestinations = await selectDestinations(interests, preferred_destinations, exact_days);
    const optimizedRoute = optimizeRoute(selectedDestinations, starting_point || 'Colombo');
    const hotels = await selectHotels(selectedDestinations, accommodation_type, budgetPerDay);
    
    return {
        destinations: optimizedRoute,
        hotels: hotels,
        total_distance: calculateTotalDistance(optimizedRoute),
        estimated_budget: calculateEstimatedBudget(hotels, exact_days)
    };
}

async function selectDestinations(interests, preferredDestinations, days) {
    let query = `
        SELECT destination_id, destination_name, type, latitude, longitude, tags, description
        FROM destinations
        WHERE 1=1
    `;
    const params = [];

    if (interests && interests.length > 0) {
        const typeConditions = interests.map(interest => {
            if (interest.toLowerCase().includes('beach')) return 'beach';
            if (interest.toLowerCase().includes('cultural') || interest.toLowerCase().includes('heritage')) return 'cultural';
            if (interest.toLowerCase().includes('adventure')) return 'adventure';
            if (interest.toLowerCase().includes('wildlife')) return 'wildlife';
            return null;
        }).filter(Boolean);

        if (typeConditions.length > 0) {
            query += ` AND type IN (${typeConditions.map(() => '?').join(',')})`;
            params.push(...typeConditions);
        }
    }

    if (preferredDestinations && preferredDestinations.length > 0) {
        query += ` OR destination_name IN (${preferredDestinations.map(() => '?').join(',')})`;
        params.push(...preferredDestinations);
    }

    query += ` LIMIT ${Math.min(days + 2, 10)}`;

    const [destinations] = await pool.execute(query, params);
    return destinations.slice(0, days);
}

async function selectHotels(destinations, accommodationType, budgetPerNight) {
    const hotelType = mapAccommodationType(accommodationType);
    const maxPrice = budgetPerNight * 0.4;

    const destinationIds = destinations.map(d => d.destination_id);
    
    const [hotels] = await pool.execute(`
        SELECT h.*, d.destination_name
        FROM hotels h
        JOIN destinations d ON h.destination_id = d.destination_id
        WHERE h.destination_id IN (${destinationIds.map(() => '?').join(',')})
        AND h.price_per_night_usd <= ?
        ${hotelType ? 'AND h.type = ?' : ''}
        ORDER BY h.price_per_night_usd ASC
    `, hotelType ? [...destinationIds, maxPrice, hotelType] : [...destinationIds, maxPrice]);

    return hotels;
}

function optimizeRoute(destinations, startingPoint) {
    if (destinations.length === 0) return [];

    const startDest = destinations.find(d => 
        d.destination_name.toLowerCase() === startingPoint.toLowerCase()
    ) || destinations[0];

    const route = [startDest];
    const remaining = destinations.filter(d => d.destination_id !== startDest.destination_id);

    while (remaining.length > 0) {
        const current = route[route.length - 1];
        let nearest = remaining[0];
        let minDistance = calculateDistance(
            current.latitude, current.longitude,
            nearest.latitude, nearest.longitude
        );

        for (let i = 1; i < remaining.length; i++) {
            const dist = calculateDistance(
                current.latitude, current.longitude,
                remaining[i].latitude, remaining[i].longitude
            );
            if (dist < minDistance) {
                minDistance = dist;
                nearest = remaining[i];
            }
        }

        route.push(nearest);
        remaining.splice(remaining.indexOf(nearest), 1);
    }

    return route.map((dest, index) => ({
        ...dest,
        day: index + 1,
        distance_from_previous: index === 0 ? 0 : calculateDistance(
            route[index - 1].latitude, route[index - 1].longitude,
            dest.latitude, dest.longitude
        )
    }));
}

function calculateTotalDistance(route) {
    return route.reduce((total, dest) => total + (dest.distance_from_previous || 0), 0);
}

function calculateEstimatedBudget(hotels, days) {
    const avgHotelPrice = hotels.length > 0 
        ? hotels.reduce((sum, h) => sum + parseFloat(h.price_per_night_usd), 0) / hotels.length 
        : 50;
    return (avgHotelPrice * days) + (days * 30);
}

function parseBudget(budgetString) {
    if (!budgetString) return 1000;
    const match = budgetString.match(/\d+/);
    return match ? parseInt(match[0]) : 1000;
}

function mapAccommodationType(type) {
    if (!type) return null;
    const mapping = {
        'budget': 'economic',
        'economic': 'economic',
        'standard': '3_star_standard',
        'superior': '4_star_superior',
        'luxury': '5_star_deluxe',
        'boutique': 'boutique_villa'
    };
    return mapping[type.toLowerCase()] || null;
}

module.exports = {
    generateCustomItinerary,
    calculateDistance
};
