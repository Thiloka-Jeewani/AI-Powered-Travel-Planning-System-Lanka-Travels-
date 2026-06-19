-- Database will be created by Docker, skip this
-- USE lanka_vacations;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS questionnaire_responses;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS package_activities;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS destinations;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS itineraries;
SET FOREIGN_KEY_CHECKS = 1;

-- Create destinations table
CREATE TABLE destinations
    destination_id VARCHAR(36) PRIMARY KEY,
    destination_name VARCHAR(255) NOT NULL,
    type ENUM('cultural', 'beach', 'adventure', 'wildlife', 'city', 'hill_country', 'historical') NOT NULL,
    description TEXT,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    best_visit_start ENUM('jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'),
    best_visit_end ENUM('jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'),
    image_url VARCHAR(500),
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_latitude (latitude)
);

-- Insert destinations with UNIQUE IDs
INSERT INTO destinations (destination_id, destination_name, type, description, latitude, longitude, best_visit_start, best_visit_end, tags) VALUES
-- Cultural/Historical destinations
('dest_001', 'Sigiriya', 'cultural', 'Ancient rock fortress with frescoes', 7.9570, 80.7603, 'jan', 'dec', '["Cultural", "Historical", "Archaeological"]'),
('dest_002', 'Anuradhapura', 'historical', 'First ancient capital of Sri Lanka', 8.3114, 80.4037, 'jan', 'dec', '["Cultural", "Historical", "Sacred"]'),
('dest_003', 'Polonnaruwa', 'historical', 'Second ancient capital with ruins', 7.9403, 81.0188, 'jan', 'dec', '["Cultural", "Historical", "Archaeological"]'),
('dest_004', 'Kandy', 'cultural', 'Cultural capital with Temple of Tooth', 7.2906, 80.6337, 'jan', 'dec', '["Cultural", "Historical", "Religious"]'),
('dest_005', 'Galle', 'cultural', 'Dutch fort and colonial architecture', 6.0329, 80.2168, 'jan', 'dec', '["Cultural", "Historical", "Colonial"]'),
('dest_006', 'Dambulla', 'cultural', 'Cave temple complex', 7.8567, 80.6492, 'jan', 'dec', '["Cultural", "Historical", "Religious"]'),

-- Adventure destinations
('dest_007', 'Ella', 'adventure', 'Mountain views and hiking trails', 6.8667, 81.0467, 'jan', 'dec', '["Adventure", "Hiking", "Nature"]'),
('dest_008', 'Knuckles', 'adventure', 'Mountain range for trekking', 7.3869, 80.8122, 'jan', 'may', '["Adventure", "Trekking", "Nature"]'),
('dest_009', 'Kitulgala', 'adventure', 'White water rafting and adventure sports', 6.9894, 80.4175, 'dec', 'apr', '["Adventure", "Rafting", "Sports"]'),
('dest_010', 'Adams Peak', 'adventure', 'Sacred mountain for hiking', 6.8096, 80.4994, 'dec', 'may', '["Adventure", "Hiking", "Pilgrimage"]'),

-- Wildlife destinations
('dest_011', 'Yala', 'wildlife', 'Famous for leopard sightings', 6.3724, 81.5207, 'feb', 'jul', '["Wildlife", "Safari", "Nature"]'),
('dest_012', 'Udawalawe', 'wildlife', 'Elephant sanctuary and safari', 6.4342, 80.8914, 'jan', 'dec', '["Wildlife", "Elephant", "Safari"]'),
('dest_013', 'Sinharaja', 'wildlife', 'UNESCO rainforest with biodiversity', 6.4092, 80.4775, 'jan', 'dec', '["Wildlife", "Rainforest", "Hiking"]'),
('dest_014', 'Minneriya', 'wildlife', 'Elephant gathering national park', 7.3000, 80.3833, 'jan', 'dec', '["Wildlife", "Elephant", "Safari"]'),

-- Beach destinations
('dest_015', 'Arugam Bay', 'beach', 'Famous surfing destination', 6.8375, 81.8847, 'may', 'oct', '["Beach", "Surfing", "Adventure"]'),
('dest_016', 'Mirissa', 'beach', 'Whale watching and beaches', 5.9467, 80.4686, 'nov', 'apr', '["Beach", "Whale Watching", "Relaxation"]'),
('dest_017', 'Trincomalee', 'beach', 'Natural harbor and diving', 8.5711, 81.2335, 'apr', 'sep', '["Beach", "Diving", "Harbor"]'),
('dest_018', 'Hikkaduwa', 'beach', 'Coral reefs and snorkeling', 6.1392, 80.1032, 'nov', 'apr', '["Beach", "Coral", "Snorkeling"]'),
('dest_019', 'Weligama', 'beach', 'Famous beach with fishing', 5.9747, 80.4294, 'nov', 'apr', '["Beach", "Fishing", "Surfing"]'),
('dest_020', 'Unawatuna', 'beach', 'Popular tourist beach', 6.0214, 80.4253, 'nov', 'apr', '["Beach", "Relaxation", "Coastal"]'),
('dest_021', 'Pasikuda', 'beach', 'Famous shallow beach resort', 7.9167, 81.5667, 'apr', 'sep', '["Beach", "Resort", "Shallow Waters"]'),
('dest_022', 'Bentota', 'beach', 'Resort town with water sports', 6.4210, 80.0000, 'nov', 'apr', '["Beach", "Resort", "Water Sports"]'),

-- Hill Country destinations
('dest_023', 'Hatton', 'hill_country', 'Tea plantations and mountains', 6.8969, 80.5953, 'jan', 'dec', '["Tea", "Mountains", "Hill Country"]'),
('dest_024', 'Nuwara Eliya', 'hill_country', 'Tea plantations and cool climate', 6.9497, 80.7891, 'mar', 'may', '["Tea", "Hill Station", "Cool Climate"]'),

-- City destinations
('dest_025', 'Colombo', 'city', 'Commercial capital with shopping and dining', 6.9271, 79.8612, 'jan', 'dec', '["City", "Shopping", "Dining"]'),
('dest_026', 'Negombo', 'city', 'Fishing town with lagoon', 7.2008, 79.8358, 'nov', 'apr', '["Beach", "Fishing", "Lagoon"]'),
('dest_027', 'Jaffna', 'city', 'Northern cultural capital', 9.6615, 80.0255, 'jan', 'dec', '["Cultural", "Tamil", "Northern"]'),
('dest_028', 'Ratnapura', 'city', 'Gem mining cultural city', 6.6800, 80.4000, 'jan', 'dec', '["Gems", "Mining", "Cultural"]');

-- Create activities table
CREATE TABLE activities (
    activity_id VARCHAR(36) PRIMARY KEY,
    activity_name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    duration_hours DECIMAL(4,2),
    intensity ENUM('low', 'medium', 'high'),
    price_range ENUM('budget', 'moderate', 'premium'),
    image_url VARCHAR(500),
    tags JSON NOT NULL,
    cities JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_intensity (intensity)
);

-- Insert activities data
INSERT INTO activities (activity_id, activity_name, type, description, duration_hours, intensity, price_range, tags, cities) VALUES
-- Cultural/Historical Activities
('act_001', 'Sigiriya Rock Climb', 'culture_heritage', 'Climb ancient rock fortress with frescoes', 3.5, 'high', 'moderate', '["Cultural", "Historical", "Archaeological"]', '["Sigiriya"]'),
('act_002', 'Temple of Tooth Visit', 'culture_heritage', 'Visit sacred Buddhist temple in Kandy', 2.0, 'low', 'budget', '["Cultural", "Historical", "Religious"]', '["Kandy"]'),
('act_003', 'Ancient City Tour - Anuradhapura', 'culture_heritage', 'Explore ancient capital ruins', 4.0, 'medium', 'moderate', '["Cultural", "Historical", "Archaeological"]', '["Anuradhapura"]'),
('act_004', 'Polonnaruwa Archaeological Site', 'culture_heritage', 'Tour second ancient capital', 3.5, 'medium', 'moderate', '["Cultural", "Historical", "Archaeological"]', '["Polonnaruwa"]'),
('act_005', 'Dambulla Cave Temple', 'culture_heritage', 'Visit ancient cave temple complex', 2.5, 'low', 'budget', '["Cultural", "Historical", "Religious"]', '["Dambulla"]'),
('act_006', 'Galle Fort Walk', 'culture_heritage', 'Walking tour of Dutch fort', 2.0, 'low', 'moderate', '["Cultural", "Historical", "Colonial"]', '["Galle"]'),

-- Adventure Activities
('act_007', 'Ella Rock Hike', 'adventure', 'Scenic hike to Ella Rock summit', 4.0, 'high', 'budget', '["Adventure", "Hiking", "Nature"]', '["Ella"]'),
('act_008', 'Knuckles Mountain Trek', 'adventure', 'Challenging mountain trekking', 6.0, 'high', 'moderate', '["Adventure", "Trekking", "Mountain"]', '["Knuckles"]'),
('act_009', 'Kitulgala White Water Rafting', 'adventure', 'Exciting white water rafting', 3.0, 'high', 'moderate', '["Adventure", "Rafting", "Sports"]', '["Kitulgala"]'),
('act_010', 'Adams Peak Night Hike', 'adventure', 'Night hike to sacred mountain', 5.0, 'high', 'budget', '["Adventure", "Hiking", "Pilgrimage"]', '["Adams Peak"]'),

-- Wildlife Activities
('act_011', 'Yala National Park Safari', 'wildlife', 'Wildlife safari for leopard sightings', 4.0, 'low', 'premium', '["Wildlife", "Safari", "Photography"]', '["Yala"]'),
('act_012', 'Udawalawe Elephant Safari', 'wildlife', 'Elephant watching safari', 3.0, 'low', 'moderate', '["Wildlife", "Elephant", "Safari"]', '["Udawalawe"]'),
('act_013', 'Sinharaja Rainforest Trek', 'wildlife', 'Rainforest biodiversity trek', 4.0, 'medium', 'moderate', '["Wildlife", "Rainforest", "Hiking"]', '["Sinharaja"]'),
('act_014', 'Minneriya Elephant Gathering', 'wildlife', 'Witness elephant gathering', 3.0, 'low', 'moderate', '["Wildlife", "Elephant", "Safari"]', '["Minneriya"]'),

-- Beach Activities
('act_015', 'Arugam Bay Surfing', 'beach', 'Learn to surf in famous bay', 2.0, 'medium', 'moderate', '["Beach", "Surfing", "Sports"]', '["Arugam Bay"]'),
('act_016', 'Mirissa Whale Watching', 'beach', 'Whale and dolphin watching tour', 4.0, 'low', 'premium', '["Beach", "Whale Watching", "Marine Life"]', '["Mirissa"]'),
('act_017', 'Trincomalee Scuba Diving', 'beach', 'Explore underwater marine life', 2.0, 'medium', 'premium', '["Beach", "Diving", "Marine Life"]', '["Trincomalee"]'),
('act_018', 'Hikkaduwa Snorkeling', 'beach', 'Snorkel in coral reefs', 2.0, 'low', 'moderate', '["Beach", "Snorkeling", "Coral"]', '["Hikkaduwa"]'),

-- Mixed Activities
('act_019', 'Tea Plantation Tour', 'culture_heritage', 'Tour of tea factories and plantations', 3.0, 'low', 'moderate', '["Cultural", "Educational", "Scenic"]', '["Nuwara Eliya", "Hatton"]'),
('act_020', 'Colombo City Tour', 'culture_heritage', 'Explore commercial capital', 4.0, 'low', 'moderate', '["City", "Cultural", "Shopping"]', '["Colombo"]'),
('act_021', 'Negombo Lagoon Boat Tour', 'adventure', 'Boat tour through fishing lagoon', 2.0, 'low', 'moderate', '["Adventure", "Fishing", "Lagoon"]', '["Negombo"]');


-- Create other necessary tables
CREATE TABLE packages (
    package_id VARCHAR(36) PRIMARY KEY,
    package_name VARCHAR(255) NOT NULL,
    package_type VARCHAR(100),
    description TEXT,
    duration_days INT,
    price_per_person_usd DECIMAL(10,2),
    per_person_cost DECIMAL(10,2),
    included_activities JSON,
    included_meal_plans JSON,
    accommodation_type VARCHAR(100),
    transport_included BOOLEAN,
    transport_type VARCHAR(100),
    image_urls JSON,
    routes JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    country VARCHAR(100),
    passport_number VARCHAR(50),
    emergency_contact VARCHAR(255),
    special_requirements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    booking_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    country VARCHAR(100),
    passport_number VARCHAR(50),
    emergency_contact VARCHAR(255),
    special_requirements TEXT,
    total_booking_amount DECIMAL(10,2),
    booking_status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    itinerary_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE questionnaire_responses (
    response_id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(255),
    travel_timing VARCHAR(100),
    travel_duration_range VARCHAR(100),
    budget VARCHAR(100),
    accommodation_type VARCHAR(100),
    num_travelers INT,
    traveler_composition JSON,
    room_type_preference VARCHAR(100),
    meal_plan_preference VARCHAR(100),
    travel_ideas TEXT,
    preferred_destinations JSON,
    exact_dates JSON,
    flight_details JSON,
    travel_intention JSON,
    transport_preference VARCHAR(100),
    transport_method VARCHAR(100),
    extra_transport_desires TEXT,
    exact_days INT,
    starting_point VARCHAR(100),
    interests JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_activities_cities ON activities((CAST(cities AS CHAR(255))));
CREATE INDEX idx_destinations_name ON destinations(destination_name);
CREATE INDEX idx_activities_tags ON activities((CAST(tags AS CHAR(255))));




-- Insert packages data
INSERT INTO packages (package_id, package_name, package_type, description, duration_days, price_per_person_usd, per_person_cost, included_activities, included_meal_plans, accommodation_type, transport_included, transport_type, image_urls, routes) VALUES
(
    'pkg_001',
    'Mini Tour Sri Lanka in 4 Days',
    'Cultural',
    'Experience the highlights of Sri Lanka in just 4 days. Visit Kandy, the cultural capital, explore the Temple of the Tooth Relic, enjoy the Royal Botanical Gardens, and witness traditional Kandyan dance performances.',
    4,
    350.00,
    350.00,
    '["Temple of Tooth Visit", "Botanical Gardens Tour", "Kandyan Dance Performance", "City Tour"]',
    '["Breakfast"]',
    '3-Star Hotel',
    TRUE,
    'Private Vehicle',
    '["/api/placeholder/400/300"]',
    '[
        {"day": 1, "location": "Colombo", "description": "Your journey begins here", "activities": ["Airport pickup", "Transfer to Kandy", "Hotel check-in"]},
        {"day": 2, "location": "Kandy", "description": "Explore the cultural capital", "activities": ["Temple of the Tooth Relic", "Peradeniya Botanical Gardens", "Kandy city tour", "Kandyan dance performance"]},
        {"day": 3, "location": "Kandy", "description": "Continue exploring Kandy", "activities": ["Pinnawala Elephant Orphanage", "Spice garden visit"]},
        {"day": 4, "location": "Colombo", "description": "Departure day", "activities": ["Transfer to Colombo", "City tour", "Airport transfer"]}
    ]'
),
(
    'pkg_002',
    'Tropical Sri Lanka in 8 Days',
    'Mixed',
    'Experience the best of Sri Lanka from cultural sites to pristine beaches. Visit Sigiriya, Kandy, the hill country of Nuwara Eliya, and relax on the beautiful beaches of Mirissa.',
    8,
    690.00,
    690.00,
    '["Sigiriya Rock Climb", "Temple of Tooth Visit", "Tea Plantation Tour", "Beach Relaxation"]',
    '["Breakfast", "Dinner"]',
    '4-Star Hotel',
    TRUE,
    'Private Vehicle',
    '["/api/placeholder/400/300"]',
    '[
        {"day": 1, "location": "Colombo", "description": "Arrival and transfer", "activities": ["Airport pickup", "Transfer to hotel"]},
        {"day": 2, "location": "Sigiriya", "description": "Ancient rock fortress", "activities": ["Sigiriya Rock climb", "Dambulla cave temple"]},
        {"day": 3, "location": "Kandy", "description": "Cultural capital", "activities": ["Temple of the Tooth Relic", "Cultural show"]},
        {"day": 4, "location": "Nuwara Eliya", "description": "Hill country beauty", "activities": ["Tea plantation tour", "City tour"]},
        {"day": 5, "location": "Mirissa", "description": "Beach relaxation", "activities": ["Beach time", "Whale watching"]},
        {"day": 6, "location": "Mirissa", "description": "Coastal exploration", "activities": ["Beach activities", "Local market"]},
        {"day": 7, "location": "Galle", "description": "Historic fort", "activities": ["Galle Fort tour", "Shopping"]},
        {"day": 8, "location": "Colombo", "description": "Departure", "activities": ["Transfer to airport"]}
    ]'
),
(
    'pkg_003',
    'Classic Sri Lanka in 11 Days',
    'Comprehensive',
    'The ultimate Sri Lankan experience covering all major highlights. From ancient cities to wildlife safaris, hill country tea plantations to pristine beaches, this comprehensive tour showcases the best of the island.',
    11,
    980.00,
    980.00,
    '["Sigiriya Rock Climb", "Ancient City Tour", "Wildlife Safari", "Tea Plantation", "Beach Activities"]',
    '["Breakfast", "Lunch", "Dinner"]',
    '4-Star Hotel',
    TRUE,
    'Private Vehicle with Driver',
    '["/api/placeholder/400/300"]',
    '[
        {"day": 1, "location": "Colombo", "description": "Arrival day", "activities": ["Airport pickup", "City orientation"]},
        {"day": 2, "location": "Anuradhapura", "description": "Ancient capital", "activities": ["Ancient city tour", "Sacred sites"]},
        {"day": 3, "location": "Sigiriya", "description": "Rock fortress", "activities": ["Sigiriya climb", "Village tour"]},
        {"day": 4, "location": "Polonnaruwa", "description": "Second ancient capital", "activities": ["Archaeological site", "Museum visit"]},
        {"day": 5, "location": "Kandy", "description": "Cultural heart", "activities": ["Temple visit", "Cultural show"]},
        {"day": 6, "location": "Nuwara Eliya", "description": "Tea country", "activities": ["Tea factory", "Gardens"]},
        {"day": 7, "location": "Yala", "description": "Wildlife adventure", "activities": ["Safari", "Nature walk"]},
        {"day": 8, "location": "Mirissa", "description": "Beach time", "activities": ["Beach relaxation", "Water sports"]},
        {"day": 9, "location": "Galle", "description": "Historic charm", "activities": ["Fort exploration", "Shopping"]},
        {"day": 10, "location": "Colombo", "description": "Final day", "activities": ["City tour", "Shopping"]},
        {"day": 11, "location": "Colombo", "description": "Departure", "activities": ["Airport transfer"]}
    ]'
),
(
    'pkg_004',
    'Culture and Heritage Sri Lanka in 6 Days',
    'Cultural',
    'Discover Sri Lanka''s rich cultural heritage with visits to ancient cities, UNESCO World Heritage sites, and wildlife safaris. Experience Sigiriya Rock Fortress, Polonnaruwa ruins, and the sacred city of Kandy.',
    6,
    550.00,
    550.00,
    '["Sigiriya Rock Climb", "Ancient City Tours", "Temple Visits", "Cultural Shows"]',
    '["Breakfast"]',
    '3-Star Hotel',
    TRUE,
    'Private Vehicle',
    '["/api/placeholder/400/300"]',
    '[
        {"day": 1, "location": "Colombo", "description": "Arrival", "activities": ["Airport pickup", "Transfer to Dambulla"]},
        {"day": 2, "location": "Sigiriya", "description": "Ancient wonder", "activities": ["Sigiriya Rock climb", "Dambulla caves"]},
        {"day": 3, "location": "Polonnaruwa", "description": "Ancient city", "activities": ["Archaeological site", "Museum"]},
        {"day": 4, "location": "Kandy", "description": "Cultural capital", "activities": ["Temple of Tooth", "Botanical gardens"]},
        {"day": 5, "location": "Kandy", "description": "More exploration", "activities": ["Cultural show", "City tour"]},
        {"day": 6, "location": "Colombo", "description": "Departure", "activities": ["Transfer to airport"]}
    ]'
);

-- select*from questionnaire_responses;

ALTER TABLE questionnaire_responses 
ADD COLUMN user_id VARCHAR(36),
ADD FOREIGN KEY (user_id) REFERENCES users(user_id);

-- Add indexes for better performance
CREATE INDEX idx_questionnaire_user_id ON questionnaire_responses(user_id);
CREATE INDEX idx_questionnaire_session_id ON questionnaire_responses(session_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);

UPDATE packages SET image_urls = '["https://lankanewsweb.net/wp-content/uploads/2023/07/01-Tourism.jpg"]' WHERE package_id = 'pkg_001';

UPDATE packages SET image_urls = '["https://adaderanaenglish.s3.amazonaws.com/1706768165-tourists-sri-lanka-l.jpg"]' WHERE package_id = 'pkg_002';

UPDATE packages SET image_urls = '["https://img.freepik.com/premium-photo/sunset-scenery-beautiful-sri-lankan-beach_1038599-86.jpg"]' WHERE package_id = 'pkg_003';

UPDATE packages SET image_urls = '["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"]' WHERE package_id = 'pkg_004';

CREATE TABLE hotels (
    hotel_id VARCHAR(36) PRIMARY KEY,
    hotel_name VARCHAR(255) NOT NULL,
    destination_id VARCHAR(36) NOT NULL,
    type ENUM('economic', 'boutique_villa', '3_star_standard', '4_star_superior', '5_star_deluxe', 'luxury_boutique_villa') NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    price_per_night_usd DECIMAL(10,2),
    room_types JSON,
    meal_plans JSON,
    amenities JSON,
    image_urls JSON,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE CASCADE,
    INDEX idx_hotel_type (type),
    INDEX idx_destination_hotels (destination_id),
    INDEX idx_price_range (price_per_night_usd)
);

INSERT INTO hotels (hotel_id, hotel_name, destination_id, type, address, latitude, longitude, price_per_night_usd, room_types, meal_plans, amenities, image_urls, contact_email, contact_phone) 
SELECT 
    UUID(),
    CASE 
        WHEN d.destination_name = 'Sigiriya' THEN 'Rajarata Standard Hotel'
        WHEN d.destination_name = 'Sigiriya' THEN 'Ulagalla by UGA'
        WHEN d.destination_name = 'Kandy' THEN 'Queens Hotel Kandy'
        WHEN d.destination_name = 'Kandy' THEN 'Earls Regency Hotel'
        WHEN d.destination_name = 'Mirissa' THEN 'Mirissa Beach Villas'
        WHEN d.destination_name = 'Colombo' THEN 'Galle Face Hotel'
        ELSE CONCAT(d.destination_name, ' Standard Hotel')
    END,
    d.destination_id,
    CASE 
        WHEN RAND() < 0.2 THEN 'economic'
        WHEN RAND() < 0.4 THEN '3_star_standard'
        WHEN RAND() < 0.6 THEN '4_star_superior'
        WHEN RAND() < 0.8 THEN '5_star_deluxe'
        ELSE 'luxury_boutique_villa'
    END,
    CONCAT('Main Street, ', d.destination_name),
    d.latitude + (RAND() * 0.02 - 0.01),
    d.longitude + (RAND() * 0.02 - 0.01),
    CASE 
        WHEN type = 'economic' THEN 30 + (RAND() * 20)
        WHEN type = '3_star_standard' THEN 60 + (RAND() * 40)
        WHEN type = '4_star_superior' THEN 120 + (RAND() * 80)
        WHEN type = '5_star_deluxe' THEN 250 + (RAND() * 150)
        ELSE 400 + (RAND() * 300)
    END,
    '["single", "double", "family"]',
    '["breakfast_only", "half_board", "full_board"]',
    '["wifi", "pool", "restaurant"]',
    '["https://example.com/hotel1.jpg", "https://example.com/hotel2.jpg"]',
    'info@example.com',
    '+94123456789'
FROM destinations d
LIMIT 20;


