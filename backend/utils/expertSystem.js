/**
 * Expert System for Travel Recommendations
 * Time Complexity: O(n log n) where n = number of destinations
 * Space Complexity: O(n) - only stores scored destinations once
 */

// Configurable weights for tuning
const WEIGHTS = {
    type_match: 0.35,
    tag_match: 0.25,
    traveler_fit: 0.20,
    season_match: 0.10,
    budget_fit: 0.10
};

// Traveler compatibility matrix - O(1) lookup
const TRAVELER_COMPATIBILITY = {
    "Solo traveler": {
        "beach": 85, "wildlife": 80, "cultural": 90, "adventure": 95, 
        "hill_country": 85, "historical": 85, "city": 75
    },
    "Couple": {
        "beach": 95, "wildlife": 75, "cultural": 85, "adventure": 70,
        "hill_country": 90, "historical": 80, "city": 70
    },
    "Family with kids": {
        "beach": 90, "wildlife": 85, "cultural": 70, "adventure": 50,
        "hill_country": 65, "historical": 60, "city": 75
    },
    "Group of friends": {
        "beach": 90, "wildlife": 85, "cultural": 75, "adventure": 95,
        "hill_country": 80, "historical": 70, "city": 80
    },
    "Business traveler": {
        "beach": 60, "wildlife": 50, "cultural": 80, "adventure": 40,
        "hill_country": 55, "historical": 75, "city": 95
    }
};

// Interest to destination type mapping - O(1) lookup
const INTEREST_MAPPING = {
    "Beaches & Relaxation": {
        primary: ["beach"],
        secondary: ["coastal"],
        tags: ["Beach", "Relaxation", "Coastal", "Surfing"]
    },
    "Wildlife & Nature": {
        primary: ["wildlife"],
        secondary: ["nature", "hill_country"],
        tags: ["Wildlife", "Safari", "Nature", "Elephant", "Rainforest"]
    },
    "Cultural & Historical Sites": {
        primary: ["cultural", "historical"],
        secondary: ["city"],
        tags: ["Cultural", "Historical", "Archaeological", "Religious", "Colonial"]
    },
    "Adventure & Sports": {
        primary: ["adventure"],
        secondary: ["hill_country", "beach"],
        tags: ["Adventure", "Hiking", "Trekking", "Sports", "Rafting"]
    },
    "Food & Local Experiences": {
        primary: ["city", "cultural"],
        secondary: ["beach"],
        tags: ["Cultural", "Food", "Local", "Market"]
    }
};

// Month name to number mapping - O(1) lookup
const MONTH_MAP = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
};

/**
 * Extract duration in days - O(1)
 */
function extractDurationDays(durationStr) {
    if (!durationStr) return 7;
    if (durationStr.includes("3-5")) return 4;
    if (durationStr.includes("5-7")) return 6;
    if (durationStr.includes("7-10")) return 8;
    if (durationStr.includes("10-14")) return 12;
    if (durationStr.includes("More than")) return 16;
    return 7;
}

/**
 * Calculate number of cities based on duration - O(1)
 */
function calculateCityCount(durationDays) {
    if (durationDays <= 4) return 2;
    if (durationDays <= 6) return 3;
    if (durationDays <= 10) return 4;
    if (durationDays <= 14) return 5;
    return 6;
}

/**
 * Extract budget maximum - O(1)
 */
function extractBudgetMax(budgetStr) {
    if (!budgetStr) return 5000;
    if (budgetStr.includes("Under $1,000")) return 1000;
    if (budgetStr.includes("$1,000 - $2,000")) return 2000;
    if (budgetStr.includes("$2,000 - $3,500")) return 3500;
    if (budgetStr.includes("$3,500 - $5,000")) return 5000;
    if (budgetStr.includes("Above $5,000")) return 10000;
    return 5000;
}

/**
 * Check if destination is in season - O(1)
 */
function isInSeason(destination) {
    const currentMonth = new Date().getMonth() + 1;
    const startMonth = MONTH_MAP[destination.best_visit_start] || 1;
    const endMonth = MONTH_MAP[destination.best_visit_end] || 12;
    
    if (startMonth <= endMonth) {
        return currentMonth >= startMonth && currentMonth <= endMonth;
    } else {
        return currentMonth >= startMonth || currentMonth <= endMonth;
    }
}

/**
 * Get region for geographic diversity - O(1)
 */
function getRegion(lat) {
    if (lat > 8.5) return "north";
    if (lat > 7.5) return "north-central";
    if (lat > 6.5) return "central";
    if (lat > 6.0) return "south-central";
    return "south";
}

/**
 * Parse tags safely - O(k) where k = number of tags (small constant)
 */
function parseTags(tagsData) {
    if (!tagsData) return [];
    if (Array.isArray(tagsData)) return tagsData;
    if (typeof tagsData === 'string') {
        try {
            return JSON.parse(tagsData);
        } catch {
            return tagsData.split(',').map(t => t.trim()).filter(Boolean);
        }
    }
    return [];
}

/**
 * Score a single destination - O(k) where k = number of tags (small constant)
 * Overall: O(1) amortized
 */
function scoreDestination(destination, userPrefs, interestConfig) {
    let score = 0;
    const destTags = parseTags(destination.tags);
    
    // 1. Type matching (35%) - O(1)
    if (interestConfig.primary.includes(destination.type)) {
        score += 100 * WEIGHTS.type_match;
    } else if (interestConfig.secondary.includes(destination.type)) {
        score += 60 * WEIGHTS.type_match;
    }
    
    // 2. Tag matching (25%) - O(k) where k is small
    const matchingTags = destTags.filter(tag => 
        interestConfig.tags.some(t => tag.toLowerCase().includes(t.toLowerCase()))
    );
    const tagScore = matchingTags.length > 0 
        ? (matchingTags.length / interestConfig.tags.length) * 100 
        : 0;
    score += tagScore * WEIGHTS.tag_match;
    
    // 3. Traveler type fit (20%) - O(1) lookup
    const compatibility = TRAVELER_COMPATIBILITY[userPrefs.travelerType]?.[destination.type] || 50;
    score += compatibility * WEIGHTS.traveler_fit;
    
    // 4. Season match (10%) - O(1)
    if (isInSeason(destination)) {
        score += 100 * WEIGHTS.season_match;
    } else {
        score += 50 * WEIGHTS.season_match;
    }
    
    // 5. Budget fit (10%) - O(1)
    // Assume destinations have implicit budget tiers based on type
    const budgetScore = 80; // Default good fit
    score += budgetScore * WEIGHTS.budget_fit;
    
    return Math.round(score * 10) / 10;
}

/**
 * Select top cities with geographic diversity - O(n)
 * Uses single pass with region tracking
 */
function selectTopCities(scoredDestinations, numCities) {
    const selected = [];
    const regionCount = {};
    const maxPerRegion = Math.ceil(numCities / 3); // Distribute across regions
    
    // Single pass selection - O(n)
    for (const dest of scoredDestinations) {
        if (selected.length >= numCities) break;
        
        const region = getRegion(dest.latitude);
        const currentRegionCount = regionCount[region] || 0;
        
        // Add if we haven't maxed out this region
        if (currentRegionCount < maxPerRegion) {
            selected.push(dest);
            regionCount[region] = currentRegionCount + 1;
        }
    }
    
    // If we still need more cities, add remaining high-scoring ones
    if (selected.length < numCities) {
        for (const dest of scoredDestinations) {
            if (selected.length >= numCities) break;
            if (!selected.includes(dest)) {
                selected.push(dest);
            }
        }
    }
    
    return selected;
}

/**
 * Parse package routes safely - O(m) where m = route count
 */
function parseRoutes(routesData) {
    if (!routesData) return [];
    if (Array.isArray(routesData)) return routesData;
    if (typeof routesData === 'string') {
        try {
            return JSON.parse(routesData);
        } catch {
            return [];
        }
    }
    return [];
}

/**
 * Count city matches in package - O(m * c) where m = routes, c = cities (both small)
 */
function countCityMatches(pkg, cityNames) {
    const routes = parseRoutes(pkg.routes);
    let matches = 0;
    
    for (const route of routes) {
        const location = (route.location || '').toLowerCase();
        for (const city of cityNames) {
            if (location.includes(city) || city.includes(location)) {
                matches++;
                break;
            }
        }
    }
    
    return matches;
}

/**
 * Filter and rank packages - O(p * m * c) where p = packages, m = routes, c = cities
 * Optimized with early filtering
 */
function filterPackages(packages, recommendedCities, durationDays, budgetMax) {
    const cityNames = recommendedCities.map(c => c.destination_name.toLowerCase());
    
    // Filter packages - O(p)
    const filtered = packages.filter(pkg => {
        // Quick checks first - O(1)
        if (pkg.duration_days > durationDays + 2) return false;
        if (pkg.price_per_person_usd > budgetMax) return false;
        
        // Check city match - O(m * c)
        const routes = parseRoutes(pkg.routes);
        return routes.some(route => {
            const location = (route.location || '').toLowerCase();
            return cityNames.some(city => 
                location.includes(city) || city.includes(location)
            );
        });
    });
    
    // Score and sort - O(p log p)
    return filtered
        .map(pkg => ({
            ...pkg,
            matchScore: countCityMatches(pkg, cityNames)
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10); // Limit to top 10 packages
}

/**
 * Generate reasoning text - O(1)
 */
function generateReasoning(answers, recommendedCities, durationDays) {
    const cityList = recommendedCities.slice(0, 3).map(c => c.destination_name).join(', ');
    const interest = answers.interests || 'various attractions';
    
    return `Based on your interest in ${interest} and ${durationDays}-day duration, ` +
           `we recommend visiting ${cityList}${recommendedCities.length > 3 ? ' and more' : ''} ` +
           `for the best experience matching your travel style.`;
}

/**
 * Main expert system function
 * Time Complexity: O(n log n) where n = number of destinations
 * Space Complexity: O(n) for scored destinations array
 */
function analyzeQuestionnaire(answers, destinations, packages) {
    // Extract user preferences - O(1)
    const durationDays = extractDurationDays(answers.duration);
    const numCities = calculateCityCount(durationDays);
    const budgetMax = extractBudgetMax(answers.budget);
    const interestConfig = INTEREST_MAPPING[answers.interests] || INTEREST_MAPPING["Cultural & Historical Sites"];
    
    const userPrefs = {
        travelerType: answers.travelerType || "Solo traveler",
        interests: answers.interests,
        durationDays,
        budgetMax
    };
    
    // Score all destinations - O(n)
    const scoredDestinations = destinations.map(dest => ({
        ...dest,
        score: scoreDestination(dest, userPrefs, interestConfig)
    }));
    
    // Sort by score - O(n log n)
    scoredDestinations.sort((a, b) => b.score - a.score);
    
    // Select top cities with diversity - O(n)
    const recommendedCities = selectTopCities(scoredDestinations, numCities);
    
    // Filter packages - O(p * m * c) where p, m, c are small
    const matchingPackages = filterPackages(packages, recommendedCities, durationDays, budgetMax);
    
    // Generate reasoning - O(1)
    const reasoning = generateReasoning(answers, recommendedCities, durationDays);
    
    return {
        recommended_cities: recommendedCities,
        matching_packages: matchingPackages,
        reasoning,
        metadata: {
            total_destinations_analyzed: destinations.length,
            cities_recommended: recommendedCities.length,
            packages_found: matchingPackages.length,
            user_duration_days: durationDays,
            user_budget_max: budgetMax
        }
    };
}

module.exports = {
    analyzeQuestionnaire,
    WEIGHTS,
    TRAVELER_COMPATIBILITY,
    INTEREST_MAPPING
};
