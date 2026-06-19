-- Create database
CREATE DATABASE IF NOT EXISTS lank_vac_SLIIT;
USE lank_vac_SLIIT;

-- 1. PACKAGES TABLE
CREATE TABLE packages (
    package_id VARCHAR(50) PRIMARY KEY,
    package_name VARCHAR(255) NOT NULL,
    package_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    duration_days INT NOT NULL,
    per_person_cost DECIMAL(10,2) NOT NULL,
    price_per_person_usd DECIMAL(10,2) NOT NULL,
    included_activities JSON,
    accommodation_type VARCHAR(100),
    transport_included BOOLEAN DEFAULT TRUE,
    image_urls JSON,
    routes JSON,
    max_group_size INT DEFAULT 20,
    min_group_size INT DEFAULT 2,
    availability_status ENUM('available', 'limited', 'sold_out') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. HOTELS TABLE
CREATE TABLE hotels (
    hotel_id VARCHAR(50) PRIMARY KEY,
    hotel_name VARCHAR(255) NOT NULL,
    destination_id VARCHAR(50) NOT NULL,
    hotel_type VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    price_per_night_usd DECIMAL(10,2) NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    room_types JSON,
    meal_plans JSON,
    amenities JSON,
    star_rating INT CHECK (star_rating BETWEEN 1 AND 5),
    image_urls JSON,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. QUESTIONNAIRE RESPONSES TABLE
CREATE TABLE questionnaire_responses (
    response_id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    country VARCHAR(100),
    city VARCHAR(100),
    whatsapp_number VARCHAR(20),
    travel_timing VARCHAR(100),
    travel_duration_range VARCHAR(100),
    budget VARCHAR(100),
    traveler_type VARCHAR(100),
    accommodation_type VARCHAR(100),
    num_adults INT DEFAULT 1,
    num_children INT DEFAULT 0,
    room_type_preference VARCHAR(100),
    meal_plan_preference VARCHAR(100),
    interests JSON,
    preferred_destinations JSON,
    starting_point VARCHAR(100),
    transport_preference VARCHAR(100),
    exact_days INT,
    random_plan_selected BOOLEAN DEFAULT FALSE,
    ai_enabled BOOLEAN DEFAULT TRUE,
    special_requirements TEXT,
    ai_recommendations JSON,
    questionnaire_answers JSON,
    itinerary_data JSON,
    status ENUM('submitted', 'reviewed', 'contacted', 'converted') DEFAULT 'submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. BOOKINGS TABLE
CREATE TABLE bookings (
    booking_id VARCHAR(50) PRIMARY KEY,
    package_id VARCHAR(50),
    package_name VARCHAR(255) NOT NULL,
    user_id VARCHAR(50),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    passport_number VARCHAR(50),
    emergency_contact VARCHAR(20),
    special_requirements TEXT,
    adults_count INT NOT NULL DEFAULT 1,
    children_count INT NOT NULL DEFAULT 0,
    total_cost DECIMAL(10,2) NOT NULL,
    booking_status ENUM('pending', 'confirmed', 'paid', 'cancelled', 'completed') DEFAULT 'pending',
    payment_status ENUM('pending', 'partially_paid', 'fully_paid') DEFAULT 'pending',
    payment_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_date TIMESTAMP NULL,
    itinerary_data JSON,
    questionnaire_response_id VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(package_id) ON DELETE SET NULL,
    FOREIGN KEY (questionnaire_response_id) REFERENCES questionnaire_responses(response_id) ON DELETE SET NULL
);

-- 5. USERS TABLE (for registered users)
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    country VARCHAR(100),
    city VARCHAR(100),
    whatsapp_number VARCHAR(20),
    passport_number VARCHAR(50),
    date_of_birth DATE,
    preferences JSON,
    account_status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. PAYMENTS TABLE
CREATE TABLE payments (
    payment_id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('credit_card', 'debit_card', 'bank_transfer', 'paypal', 'cash') NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

-- 7. ACTIVITIES TABLE (for activity database)
CREATE TABLE activities (
    activity_id VARCHAR(50) PRIMARY KEY,
    activity_name VARCHAR(255) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    duration_hours DECIMAL(4,2) NOT NULL,
    intensity ENUM('low', 'medium', 'high') DEFAULT 'medium',
    price_range VARCHAR(50),
    tags JSON,
    cities JSON,
    image_url VARCHAR(500),
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. DESTINATIONS TABLE (for reference)
CREATE TABLE destinations (
    destination_id VARCHAR(50) PRIMARY KEY,
    destination_name VARCHAR(255) NOT NULL,
    destination_type VARCHAR(100),
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    best_season_start VARCHAR(10),
    best_season_end VARCHAR(10),
    tags JSON,
    description TEXT,
    popularity_score INT DEFAULT 50,
    places_to_visit JSON,
    admin_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. CHAT_SESSIONS TABLE (for AI chatbot)
CREATE TABLE chat_sessions (
    session_id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 10. CHAT_MESSAGES TABLE
CREATE TABLE chat_messages (
    message_id VARCHAR(50) PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    message_text TEXT NOT NULL,
    is_user BOOLEAN NOT NULL,
    data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_packages_type ON packages(package_type);
CREATE INDEX idx_packages_status ON packages(availability_status);
CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_type ON hotels(hotel_type);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_email ON bookings(email);
CREATE INDEX idx_bookings_created ON bookings(created_at);
CREATE INDEX idx_questionnaire_email ON questionnaire_responses(email);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_destinations_type ON destinations(destination_type);
CREATE INDEX idx_activities_type ON activities(activity_type);

-- Insert sample data for packages
INSERT INTO packages (package_id, package_name, package_type, description, duration_days, per_person_cost, price_per_person_usd, included_activities, accommodation_type, transport_included, image_urls, routes, max_group_size, min_group_size, availability_status, is_active) VALUES
('PKG001', 'Classical Sri Lanka Tour', 'cultural', 'Experience the rich cultural heritage of Sri Lanka with ancient cities, temples, and UNESCO sites.', 7, 850.00, 850.00, '["Temple Visits", "Cultural Shows", "Historical Tours"]', '4_star', TRUE, '["https://images.unsplash.com/photo-1564574662336-88c9f5a6c8d9", "https://images.unsplash.com/photo-1559661175-d1f0390a50d9"]', '[{"day": 1, "location": "Colombo", "description": "Arrival and city tour"}, {"day": 2, "location": "Kandy", "description": "Visit Temple of Tooth and cultural show"}, {"day": 3, "location": "Sigiriya", "description": "Climb Lion Rock fortress"}, {"day": 4, "location": "Polonnaruwa", "description": "Ancient city ruins tour"}, {"day": 5, "location": "Anuradhapura", "description": "Sacred city visit"}, {"day": 6, "location": "Dambulla", "description": "Cave temple exploration"}, {"day": 7, "location": "Colombo", "description": "Departure"}]', 15, 2, 'available', TRUE),

('PKG002', 'Beach Paradise Holiday', 'beach', 'Relax on Sri Lanka''s beautiful beaches with sun, sand, and sea adventures.', 5, 650.00, 650.00, '["Beach Activities", "Water Sports", "Sunset Cruises"]', 'boutique_villa', TRUE, '["https://images.unsplash.com/photo-1507525428034-b723cf961d3e", "https://images.unsplash.com/photo-1516496636080-14fb876e029d"]', '[{"day": 1, "location": "Colombo", "description": "Arrival and transfer to beach"}, {"day": 2, "location": "Bentota", "description": "Beach relaxation and water sports"}, {"day": 3, "location": "Hikkaduwa", "description": "Snorkeling and coral reef visit"}, {"day": 4, "location": "Mirissa", "description": "Whale watching and beach time"}, {"day": 5, "location": "Galle", "description": "Fort tour and departure"}]', 12, 2, 'available', TRUE),

('PKG003', 'Wildlife Adventure Safari', 'wildlife', 'Explore Sri Lanka''s national parks and encounter exotic wildlife including elephants and leopards.', 6, 950.00, 950.00, '["Safari Tours", "Bird Watching", "Nature Walks"]', '3_star_standard', TRUE, '["https://images.unsplash.com/photo-1504173010664-32509aeebb62", "https://images.unsplash.com/photo-1534188753412-9f0337d0ff8a"]', '[{"day": 1, "location": "Colombo", "description": "Arrival and briefing"}, {"day": 2, "location": "Yala National Park", "description": "Morning and evening safari"}, {"day": 3, "location": "Udawalawe", "description": "Elephant watching safari"}, {"day": 4, "location": "Sinharaja Forest", "description": "Rainforest trekking"}, {"day": 5, "location": "Wilpattu", "description": "Leopard spotting safari"}, {"day": 6, "location": "Colombo", "description": "Departure"}]', 10, 2, 'available', TRUE),

('PKG004', 'Hill Country Tea Trails', 'adventure', 'Discover Sri Lanka''s hill country with tea plantations, waterfalls, and scenic train rides.', 8, 1100.00, 1100.00, '["Tea Factory Tour", "Train Rides", "Hiking"]', '5_star_deluxe', TRUE, '["https://images.unsplash.com/photo-1511895426328-dc8714191300", "https://images.unsplash.com/photo-1578662996442-48f60103fc96"]', '[{"day": 1, "location": "Colombo", "description": "Arrival"}, {"day": 2, "location": "Kandy", "description": "Cultural city tour"}, {"day": 3, "location": "Nuwara Eliya", "description": "Tea plantation visit"}, {"day": 4, "location": "Ella", "description": "Hiking and viewpoints"}, {"day": 5, "location": "Horton Plains", "description": "World''s End hike"}, {"day": 6, "location": "Adam''s Peak", "description": "Sunrise pilgrimage"}, {"day": 7, "location": "Colombo", "description": "Scenic train ride back"}, {"day": 8, "location": "Airport", "description": "Departure"}]', 8, 2, 'available', TRUE),

('PKG005', 'Luxury Romantic Getaway', 'luxury', 'Exclusive luxury experience for couples with private villas, spa treatments, and fine dining.', 4, 1800.00, 1800.00, '["Private Chef", "Spa Treatments", "Romantic Dinners"]', 'luxury_boutique_villa', TRUE, '["https://images.unsplash.com/photo-1566073771259-6a8506099945", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"]', '[{"day": 1, "location": "Colombo", "description": "Private airport transfer to luxury villa"}, {"day": 2, "location": "Private Beach", "description": "Beach relaxation and private dinner"}, {"day": 3, "location": "Spa Resort", "description": "Couple spa treatments and wellness"}, {"day": 4, "location": "Airport", "description": "Departure with gifts"}]', 2, 2, 'available', TRUE);

-- Insert sample hotels
INSERT INTO hotels (hotel_id, hotel_name, destination_id, hotel_type, address, city, latitude, longitude, price_per_night_usd, contact_phone, contact_email, room_types, meal_plans, amenities, star_rating, image_urls, description) VALUES
('HOT001', 'Colombo Grand Hotel', 'dest_colombo', '5_star_deluxe', '123 Galle Road, Colombo 03', 'Colombo', 6.9271, 79.8612, 180.00, '+94112345678', 'info@colombogrand.com', '["standard", "deluxe", "suite"]', '["breakfast_only", "half_board", "full_board"]', '["wifi", "pool", "spa", "gym", "restaurant", "bar", "concierge"]', 5, '["https://images.unsplash.com/photo-1566073771259-6a8506099945"]', 'Luxury hotel in the heart of Colombo'),
('HOT002', 'Kandy Heritage Inn', 'dest_kandy', '4_star_superior', '45 Temple Road, Kandy', 'Kandy', 7.2964, 80.6350, 120.00, '+94812345678', 'reservations@kandyheritage.com', '["standard", "deluxe", "family"]', '["breakfast_only", "half_board"]', '["wifi", "pool", "restaurant", "parking"]', 4, '["https://images.unsplash.com/photo-1584132967334-10e028bd69f7"]', 'Boutique hotel with lake views'),
('HOT003', 'Bentota Beach Resort', 'dest_bentota', 'boutique_villa', 'Beach Road, Bentota', 'Bentota', 6.4210, 80.0000, 150.00, '+94123456789', 'stay@bentotaresort.com', '["villa", "suite"]', '["breakfast_only", "all_inclusive"]', '["wifi", "pool", "beach_access", "spa", "restaurant"]', 4, '["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"]', 'Beachfront resort with private villas'),
('HOT004', 'Ella Nature Lodge', 'dest_ella', '3_star_standard', 'Mountain View Road, Ella', 'Ella', 6.8690, 81.0463, 80.00, '+94551234567', 'hello@ellanature.com', '["standard", "deluxe"]', '["breakfast_only"]', '["wifi", "restaurant", "garden", "hiking_trails"]', 3, '["https://images.unsplash.com/photo-1578662996442-48f60103fc96"]', 'Eco-friendly lodge in the hills'),
('HOT005', 'Galle Fort Hotel', 'dest_galle', 'luxury_boutique_villa', 'Church Street, Galle Fort', 'Galle', 6.0329, 80.2168, 220.00, '+94911234567', 'luxury@galleforthotel.com', '["suite", "villa", "penthouse"]', '["breakfast_only", "half_board", "full_board"]', '["wifi", "pool", "spa", "fine_dining", "butler_service"]', 5, '["https://images.unsplash.com/photo-1585543805890-6051f7829f98"]', 'Historic luxury hotel in Galle Fort');

-- Insert sample activities
INSERT INTO activities (activity_id, activity_name, activity_type, description, duration_hours, intensity, price_range, tags, cities, image_url, location_lat, location_lng, is_active) VALUES
('ACT001', 'Sigiriya Rock Climb', 'adventure', 'Climb the ancient rock fortress of Sigiriya with stunning views', 3.5, 'high', '$$', '["historical", "hiking", "cultural"]', '["Sigiriya"]', 'https://images.unsplash.com/photo-1548013146-72479768bada', 7.9570, 80.7603, TRUE),
('ACT002', 'Yala Safari Tour', 'wildlife', 'Morning safari in Yala National Park to spot leopards and elephants', 4.0, 'medium', '$$$', '["safari", "wildlife", "photography"]', '["Yala"]', 'https://images.unsplash.com/photo-1504173010664-32509aeebb62', 6.4145, 80.2397, TRUE),
('ACT003', 'Tea Factory Visit', 'cultural', 'Tour of a working tea factory with tasting session', 2.0, 'low', '$', '["tea", "educational", "tasting"]', '["Nuwara Eliya", "Ella"]', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96', 6.9497, 80.7890, TRUE),
('ACT004', 'Whale Watching', 'adventure', 'Boat trip to spot blue whales and dolphins', 5.0, 'medium', '$$$', '["marine", "wildlife", "boat"]', '["Mirissa", "Trincomalee"]', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5', 5.9480, 80.4541, TRUE),
('ACT005', 'Galle Fort Walk', 'cultural', 'Guided walking tour of the historic Dutch fort', 2.5, 'low', '$$', '["historical", "walking", "architecture"]', '["Galle"]', 'https://images.unsplash.com/photo-1585543805890-6051f7829f98', 6.0329, 80.2168, TRUE);

-- Insert sample destinations
INSERT INTO destinations (destination_id, destination_name, destination_type, latitude, longitude, best_season_start, best_season_end, tags, description, popularity_score, places_to_visit, admin_name, is_active) VALUES
('dest_colombo', 'Colombo', 'urban', 6.9271, 79.8612, 'dec', 'apr', '["cultural", "urban", "shopping", "food"]', 'The commercial capital of Sri Lanka', 95, '["Gangaramaya Temple", "Galle Face Green", "National Museum"]', 'Western Province', TRUE),
('dest_kandy', 'Kandy', 'cultural', 7.2964, 80.6350, 'jan', 'dec', '["cultural", "historical", "hill_country", "temple"]', 'Home to the Temple of the Tooth Relic', 90, '["Temple of the Tooth", "Royal Botanical Gardens", "Kandy Lake"]', 'Central Province', TRUE),
('dest_galle', 'Galle', 'cultural', 6.0329, 80.2168, 'dec', 'apr', '["cultural", "historical", "beach", "fort"]', 'Historic Dutch fort and beautiful beaches', 88, '["Galle Fort", "Unawatuna Beach", "Japanese Peace Pagoda"]', 'Southern Province', TRUE),
('dest_sigiriya', 'Sigiriya', 'cultural', 7.9570, 80.7603, 'jan', 'apr', '["cultural", "historical", "adventure", "unesco"]', 'Ancient rock fortress with breathtaking views', 92, '["Sigiriya Rock Fortress", "Pidurangala Rock", "Sigiriya Museum"]', 'Central Province', TRUE),
('dest_ella', 'Ella', 'adventure', 6.8690, 81.0463, 'jan', 'apr', '["adventure", "hill_country", "hiking", "scenic"]', 'Hill country paradise with amazing hikes', 85, '["Ella Rock", "Little Adams Peak", "Nine Arch Bridge"]', 'Uva Province', TRUE);

-- Create a view for active packages with route information
CREATE VIEW active_packages_view AS
SELECT 
    p.package_id,
    p.package_name,
    p.package_type,
    p.description,
    p.duration_days,
    p.per_person_cost,
    p.price_per_person_usd,
    p.accommodation_type,
    p.transport_included,
    p.image_urls,
    p.routes,
    p.max_group_size,
    p.min_group_size,
    p.availability_status
FROM packages p
WHERE p.is_active = TRUE
ORDER BY p.created_at DESC;

-- Create a view for hotel search
CREATE VIEW hotel_search_view AS
SELECT 
    h.hotel_id,
    h.hotel_name,
    h.city,
    h.hotel_type,
    h.price_per_night_usd,
    h.star_rating,
    h.amenities,
    h.latitude,
    h.longitude,
    d.destination_name,
    d.destination_type
FROM hotels h
LEFT JOIN destinations d ON h.destination_id = d.destination_id
WHERE h.is_active = TRUE;

-- Create stored procedure for package booking
DELIMITER $$
CREATE PROCEDURE create_booking(
    IN p_booking_id VARCHAR(50),
    IN p_package_id VARCHAR(50),
    IN p_package_name VARCHAR(255),
    IN p_full_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_phone VARCHAR(20),
    IN p_country VARCHAR(100),
    IN p_city VARCHAR(100),
    IN p_passport_number VARCHAR(50),
    IN p_emergency_contact VARCHAR(20),
    IN p_special_requirements TEXT,
    IN p_adults_count INT,
    IN p_children_count INT,
    IN p_total_cost DECIMAL(10,2),
    IN p_itinerary_data JSON,
    IN p_questionnaire_response_id VARCHAR(50)
)
BEGIN
    INSERT INTO bookings (
        booking_id,
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
        itinerary_data,
        questionnaire_response_id,
        booking_status,
        payment_status
    ) VALUES (
        p_booking_id,
        p_package_id,
        p_package_name,
        p_full_name,
        p_email,
        p_phone,
        p_country,
        p_city,
        p_passport_number,
        p_emergency_contact,
        p_special_requirements,
        p_adults_count,
        p_children_count,
        p_total_cost,
        p_itinerary_data,
        p_questionnaire_response_id,
        'pending',
        'pending'
    );
    
    SELECT booking_id, package_name, email, total_cost FROM bookings WHERE booking_id = p_booking_id;
END$$
DELIMITER ;

-- Create trigger to update package availability
DELIMITER $$
CREATE TRIGGER update_package_availability 
AFTER INSERT ON bookings 
FOR EACH ROW 
BEGIN
    DECLARE current_bookings INT;
    DECLARE max_capacity INT;
    
    -- Get current bookings for this package
    SELECT COUNT(*) INTO current_bookings 
    FROM bookings 
    WHERE package_id = NEW.package_id 
    AND booking_status IN ('confirmed', 'paid');
    
    -- Get max capacity for this package
    SELECT max_group_size INTO max_capacity 
    FROM packages 
    WHERE package_id = NEW.package_id;
    
    -- Update availability status
    IF current_bookings >= max_capacity THEN
        UPDATE packages 
        SET availability_status = 'sold_out' 
        WHERE package_id = NEW.package_id;
    ELSEIF current_bookings >= (max_capacity * 0.8) THEN
        UPDATE packages 
        SET availability_status = 'limited' 
        WHERE package_id = NEW.package_id;
    END IF;
END$$
DELIMITER ;

-- Create event to clean up old sessions
DELIMITER $$
CREATE EVENT cleanup_old_sessions
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    DELETE FROM chat_sessions 
    WHERE last_message_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
    
    DELETE FROM questionnaire_responses 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY) 
    AND status = 'submitted';
END$$
DELIMITER ;

-- Grant privileges (adjust as needed for your MySQL user)
-- GRANT ALL PRIVILEGES ON lank_vac_SLIIT.* TO 'your_username'@'localhost';
-- FLUSH PRIVILEGES;

-- Final message
SELECT 'Database lank_vac_SLIIT created successfully!' AS message;






UPDATE packages 
SET image_urls = JSON_ARRAY('https://srilankatravelandtourism.com/wp-content/uploads/2024/07/sri-lanka-travel-and-tourism.jpg')
WHERE package_id = 'PKG001';

UPDATE packages 
SET image_urls = JSON_ARRAY('https://images1.bovpg.net/r/back/uk/sale/85707c760aae0c.jpg')
WHERE package_id = 'PKG002';

UPDATE packages 
SET image_urls = JSON_ARRAY('https://images.pickyourtrail.com/images/city/Bentota.jpg')
WHERE package_id = 'PKG003';

UPDATE packages 
SET image_urls = JSON_ARRAY('https://lankabizz.net/wp-content/uploads/2024/02/image_cc864e2672.jpg')
WHERE package_id = 'PKG004';

UPDATE packages 
SET image_urls = JSON_ARRAY('https://www.travellingpearllanka.com/blog/wp-content/uploads/2014/05/galle-face-hotel-colombo.jpg')
WHERE package_id = 'PKG005';

-- Update the 6th package if you have it
UPDATE packages 
SET image_urls = JSON_ARRAY('https://yeadimtours.com/wp-content/uploads/2020/01/%D7%A7%D7%95%D7%9C%D7%90%D7%96-%D7%A1%D7%A8%D7%99-%D7%9C%D7%A0%D7%A7%D7%94-1.jpg')
WHERE package_id = 'PKG006';


select*from bookings




-- ============================================
-- COMPLETE SQL SCRIPT - RUN THIS ENTIRELY
-- ============================================
drop table hotel_bookings


-- ============================================
-- COMPLETE HOTEL SYSTEM REBUILD
-- RUN THIS ENTIRE SCRIPT FROM START TO FINISH
-- ============================================

USE lank_vac_SLIIT;

-- ============================================
-- 1. DROP EXISTING TABLES (IF THEY EXIST)
-- ============================================
DROP TABLE IF EXISTS hotel_bookings;
DROP TABLE IF EXISTS hotels;

-- ============================================
-- 2. CREATE HOTELS TABLE FROM SCRATCH
-- ============================================
CREATE TABLE hotels (
    hotel_id VARCHAR(50) PRIMARY KEY,
    hotel_name VARCHAR(255) NOT NULL,
    destination_id VARCHAR(50) NOT NULL,
    hotel_type VARCHAR(100) NOT NULL,
    hotel_category ENUM('budget', 'standard', 'luxury', 'boutique', 'resort') DEFAULT 'standard',
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    price_per_night_usd DECIMAL(10,2) NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    room_types JSON,
    meal_plans JSON,
    amenities JSON,
    star_rating INT CHECK (star_rating BETWEEN 1 AND 5),
    image_urls JSON,
    description TEXT,
    total_rooms INT DEFAULT 50,
    available_rooms INT DEFAULT 50,
    check_in_time TIME DEFAULT '14:00:00',
    check_out_time TIME DEFAULT '12:00:00',
    rating DECIMAL(3,2) DEFAULT 4.0,
    review_count INT DEFAULT 0,
    phone_numbers JSON,
    facilities JSON,
    policies JSON,
    room_capacity JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- 3. INSERT 20 SAMPLE HOTELS (MINIMAL SET)
-- ============================================
INSERT INTO hotels (
    hotel_id, hotel_name, destination_id, hotel_type, hotel_category,
    address, city, latitude, longitude, 
    price_per_night_usd, contact_phone, contact_email,
    room_types, meal_plans, amenities, star_rating,
    image_urls, description, total_rooms, available_rooms,
    rating, review_count, phone_numbers, facilities, policies, room_capacity
) VALUES
-- Colombo Hotels
('HOT001', 'Colombo Grand Hotel', 'dest_colombo', '5_star_deluxe', 'luxury',
 '123 Galle Road, Colombo 03', 'Colombo', 6.9271, 79.8612, 
 180.00, '+94112345678', 'info@colombogrand.com',
 '["standard", "deluxe", "suite"]', '["breakfast_only", "half_board", "full_board"]',
 '["wifi", "pool", "spa", "gym", "restaurant", "bar", "concierge"]', 5,
 '["https://images.unsplash.com/photo-1566073771259-6a8506099945"]',
 'Luxury hotel in the heart of Colombo', 100, 85,
 4.8, 256, '["+94112345678", "+94771234567"]',
 '["Free WiFi", "Swimming Pool", "Spa", "Fitness Center", "Restaurant", "Bar", "Concierge"]',
 '{"cancellation": "Free cancellation up to 48 hours", "check_in": "2:00 PM", "check_out": "12:00 PM"}',
 '{"standard": {"max_adults": 2, "max_children": 2}, "deluxe": {"max_adults": 3, "max_children": 2}, "suite": {"max_adults": 4, "max_children": 3}}'),

('HOT002', 'Colombo Seaside Resort', 'dest_colombo', '4_star_superior', 'luxury',
 'Marine Drive, Colombo 01', 'Colombo', 6.9350, 79.8420,
 220.00, '+94112345679', 'info@colomboseaside.com',
 '["deluxe", "suite", "ocean_view"]', '["breakfast_only", "half_board", "full_board"]',
 '["wifi", "pool", "spa", "gym", "restaurant", "bar", "beach_access"]', 5,
 '["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"]',
 'Luxury beachfront resort in Colombo', 80, 65,
 4.9, 342, '["+94112345679", "+94772345678"]',
 '["Swimming Pool", "Spa", "Fitness Center", "Multiple Restaurants", "Beach Access", "Business Center"]',
 '{"cancellation": "Free cancellation up to 72 hours", "check_in": "3:00 PM", "check_out": "12:00 PM"}',
 '{"deluxe": {"max_adults": 2, "max_children": 2}, "suite": {"max_adults": 4, "max_children": 3}}'),

('HOT003', 'Colombo Budget Inn', 'dest_colombo', '3_star_standard', 'budget',
 'Pettah Main Street, Colombo 11', 'Colombo', 6.9355, 79.8488,
 35.00, '+94112345680', 'info@colombobudget.com',
 '["standard", "family"]', '["breakfast_only"]',
 '["wifi", "restaurant", "parking"]', 3,
 '["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"]',
 'Affordable hotel in central Colombo', 60, 48,
 3.8, 124, '["+94112345680", "+94772345679"]',
 '["Free WiFi", "Restaurant", "Parking", "24-hour Front Desk"]',
 '{"cancellation": "Free cancellation up to 24 hours", "check_in": "2:00 PM", "check_out": "11:00 AM"}',
 '{"standard": {"max_adults": 2, "max_children": 2}, "family": {"max_adults": 4, "max_children": 3}}'),

-- Kandy Hotels
('HOT004', 'Kandy Lake View Hotel', 'dest_kandy', '4_star_superior', 'standard',
 'Temple Road, Kandy', 'Kandy', 7.2964, 80.6350,
 95.00, '+94812345670', 'info@kandylakeview.com',
 '["standard", "deluxe", "lake_view"]', '["breakfast_only", "half_board"]',
 '["wifi", "pool", "restaurant", "garden", "lake_view"]', 4,
 '["https://images.unsplash.com/photo-1584132967334-10e028bd69f7"]',
 'Hotel with stunning lake views', 70, 56,
 4.5, 289, '["+94812345670", "+94772345680"]',
 '["Swimming Pool", "Restaurant", "Garden", "Free WiFi", "Parking", "Tour Desk"]',
 '{"cancellation": "Free cancellation up to 48 hours", "check_in": "2:00 PM", "check_out": "12:00 PM"}',
 '{"standard": {"max_adults": 2, "max_children": 2}, "deluxe": {"max_adults": 3, "max_children": 2}}'),

('HOT005', 'Kandy Heritage Boutique', 'dest_kandy', 'boutique_villa', 'boutique',
 'Rajapihilla Mawatha, Kandy', 'Kandy', 7.3050, 80.6300,
 135.00, '+94812345671', 'info@kandyheritage.com',
 '["villa", "suite"]', '["breakfast_only", "all_inclusive"]',
 '["wifi", "pool", "spa", "restaurant", "historic_building"]', 4,
 '["https://images.unsplash.com/photo-1559339352-11d035aa65de"]',
 'Historic boutique hotel in Kandy', 40, 32,
 4.7, 198, '["+94812345671", "+94772345681"]',
 '["Swimming Pool", "Spa", "Historic Building", "Restaurant", "Garden", "Library"]',
 '{"cancellation": "Free cancellation up to 7 days", "check_in": "3:00 PM", "check_out": "11:00 AM"}',
 '{"villa": {"max_adults": 2, "max_children": 1}, "suite": {"max_adults": 3, "max_children": 2}}'),

-- Galle Hotels
('HOT006', 'Galle Fort Heritage Inn', 'dest_galle', 'luxury_boutique_villa', 'luxury',
 'Church Street, Galle Fort', 'Galle', 6.0329, 80.2168,
 250.00, '+94911234560', 'luxury@gallefortinn.com',
 '["suite", "villa", "penthouse"]', '["breakfast_only", "half_board", "full_board"]',
 '["wifi", "pool", "spa", "fine_dining", "butler_service", "historic"]', 5,
 '["https://images.unsplash.com/photo-1585543805890-6051f7829f98"]',
 'Luxury historic hotel in Galle Fort', 35, 28,
 4.9, 456, '["+94911234560", "+94772345682"]',
 '["Swimming Pool", "Spa", "Fine Dining", "Butler Service", "Historic Building", "Concierge"]',
 '{"cancellation": "Free cancellation up to 14 days", "check_in": "3:00 PM", "check_out": "12:00 PM"}',
 '{"suite": {"max_adults": 2, "max_children": 1}, "villa": {"max_adults": 4, "max_children": 3}}'),

('HOT007', 'Galle Beach Resort', 'dest_galle', 'resort', 'luxury',
 'Unawatuna Beach Road, Galle', 'Galle', 6.0200, 80.2200,
 180.00, '+94911234561', 'info@gallebeach.com',
 '["beach_villa", "garden_villa", "pool_villa"]', '["all_inclusive"]',
 '["wifi", "pool", "beach_access", "spa", "multiple_restaurants", "water_sports"]', 5,
 '["https://images.unsplash.com/photo-1507525428034-b723cf961d3e"]',
 'Beachfront luxury resort', 90, 72,
 4.8, 512, '["+94911234561", "+94772345683"]',
 '["Private Beach", "Multiple Pools", "Spa", "Water Sports", "Kids Club", "Multiple Restaurants"]',
 '{"cancellation": "Free cancellation up to 7 days", "check_in": "2:00 PM", "check_out": "11:00 AM"}',
 '{"beach_villa": {"max_adults": 3, "max_children": 2}, "pool_villa": {"max_adults": 4, "max_children": 3}}'),

-- Bentota Hotels
('HOT008', 'Bentota Beach Hotel', 'dest_bentota', 'resort', 'standard',
 'Beach Road, Bentota', 'Bentota', 6.4210, 80.0000,
 120.00, '+94123456700', 'info@bentotabeach.com',
 '["standard", "deluxe", "beach_front"]', '["breakfast_only", "half_board"]',
 '["wifi", "pool", "beach_access", "restaurant", "water_sports"]', 4,
 '["https://images.unsplash.com/photo-1516496636080-14fb876e029d"]',
 'Beachfront hotel with water sports', 110, 88,
 4.4, 367, '["+94123456700", "+94772345684"]',
 '["Beach Access", "Swimming Pool", "Water Sports", "Restaurant", "Garden", "Spa"]',
 '{"cancellation": "Free cancellation up to 48 hours", "check_in": "2:00 PM", "check_out": "12:00 PM"}',
 '{"standard": {"max_adults": 2, "max_children": 2}, "deluxe": {"max_adults": 3, "max_children": 2}}'),

-- Negombo Hotels
('HOT009', 'Negombo Beach Hotel', 'dest_negombo', '3_star_standard', 'budget',
 'Beach Road, Negombo', 'Negombo', 7.2111, 79.8386,
 55.00, '+94123456710', 'info@negombobeach.com',
 '["standard", "family"]', '["breakfast_only"]',
 '["wifi", "pool", "beach_access", "restaurant", "airport_transfer"]', 3,
 '["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"]',
 'Budget hotel near airport and beach', 80, 64,
 3.9, 187, '["+94123456710", "+94772345685"]',
 '["Beach Access", "Swimming Pool", "Airport Transfer", "Restaurant", "Free WiFi"]',
 '{"cancellation": "Free cancellation up to 24 hours", "check_in": "2:00 PM", "check_out": "11:00 AM"}',
 '{"standard": {"max_adults": 2, "max_children": 2}, "family": {"max_adults": 4, "max_children": 3}}'),

-- Sigiriya Hotels
('HOT010', 'Sigiriya Jungle Resort', 'dest_sigiriya', 'resort', 'luxury',
 'Sigiriya Road, Sigiriya', 'Sigiriya', 7.9570, 80.7603,
 190.00, '+94123456720', 'info@sigiriyajungle.com',
 '["jungle_villa", "pool_villa", "suite"]', '["all_inclusive"]',
 '["wifi", "pool", "spa", "restaurant", "jungle_view", "wildlife"]', 5,
 '["https://images.unsplash.com/photo-1548013146-72479768bada"]',
 'Luxury resort with jungle views', 65, 52,
 4.7, 234, '["+94123456720", "+94772345686"]',
 '["Swimming Pool", "Spa", "Jungle Views", "Wildlife Spotting", "Restaurant", "Guided Tours"]',
 '{"cancellation": "Free cancellation up to 7 days", "check_in": "3:00 PM", "check_out": "12:00 PM"}',
 '{"jungle_villa": {"max_adults": 2, "max_children": 2}, "pool_villa": {"max_adults": 3, "max_children": 2}}'),

-- Ella Hotels
('HOT011', 'Ella Mountain Lodge', 'dest_ella', 'boutique_villa', 'standard',
 'Passara Road, Ella', 'Ella', 6.8690, 81.0463,
 90.00, '+94551234500', 'info@ellamountain.com',
 '["standard", "mountain_view", "family"]', '["breakfast_only"]',
 '["wifi", "restaurant", "garden", "hiking_trails", "mountain_view"]', 3,
 '["https://images.unsplash.com/photo-1578662996442-48f60103fc96"]',
 'Mountain lodge with stunning views', 45, 36,
 4.5, 156, '["+94551234500", "+94772345687"]',
 '["Mountain Views", "Garden", "Hiking Trails", "Restaurant", "Free WiFi", "Tour Desk"]',
 '{"cancellation": "Free cancellation up to 72 hours", "check_in": "2:00 PM", "check_out": "11:00 AM"}',
 '{"standard": {"max_adults": 2, "max_children": 1}, "mountain_view": {"max_adults": 3, "max_children": 2}}'),

-- More hotels...
('HOT012', 'Nuwara Eliya Grand Hotel', 'dest_nuwaraeliya', '5_star_deluxe', 'luxury',
 'Grand Hotel Road, Nuwara Eliya', 'Nuwara Eliya', 6.9700, 80.7700,
 240.00, '+94123456730', 'info@nuwaraeliyagrand.com',
 '["deluxe", "suite", "colonial"]', '["breakfast_only", "half_board", "full_board"]',
 '["wifi", "pool", "spa", "golf", "restaurant", "historic"]', 5,
 '["https://images.unsplash.com/photo-1511895426328-dc8714191300"]',
 'Historic colonial luxury hotel', 75, 60,
 4.8, 312, '["+94123456730", "+94772345688"]',
 '["Swimming Pool", "Golf Course", "Spa", "Historic Building", "Multiple Restaurants", "Tea Lounge"]',
 '{"cancellation": "Free cancellation up to 14 days", "check_in": "3:00 PM", "check_out": "12:00 PM"}',
 '{"deluxe": {"max_adults": 2, "max_children": 1}, "suite": {"max_adults": 4, "max_children": 3}}'),

('HOT013', 'Trinco Beach Resort', 'dest_trincomalee', 'resort', 'standard',
 'Nilaveli Beach, Trincomalee', 'Trincomalee', 8.7030, 81.2000,
 140.00, '+94123456740', 'info@trincobeach.com',
 '["beach_bungalow", "garden_villa", "family"]', '["breakfast_only", "half_board"]',
 '["wifi", "pool", "beach_access", "restaurant", "diving", "snorkeling"]', 4,
 '["https://images.unsplash.com/photo-1544551763-46a013bb70d5"]',
 'Beach resort with diving facilities', 85, 68,
 4.6, 278, '["+94123456740", "+94772345689"]',
 '["Beach Access", "Swimming Pool", "Diving Center", "Snorkeling", "Restaurant", "Spa"]',
 '{"cancellation": "Free cancellation up to 48 hours", "check_in": "2:00 PM", "check_out": "12:00 PM"}',
 '{"beach_bungalow": {"max_adults": 2, "max_children": 2}, "garden_villa": {"max_adults": 4, "max_children": 3}}'),

('HOT014', 'Dambulla Cave Hotel', 'dest_dambulla', '3_star_standard', 'budget',
 'Kandy Road, Dambulla', 'Dambulla', 7.8600, 80.6500,
 45.00, '+94123456750', 'info@dambullacave.com',
 '["standard", "family"]', '["breakfast_only"]',
 '["wifi", "restaurant", "garden", "tour_desk"]', 3,
 '["https://images.unsplash.com/photo-1548013146-72479768bada"]',
 'Budget hotel near Dambulla caves', 70, 56,
 3.8, 143, '["+94123456750", "+94772345690"]',
 '["Garden", "Restaurant", "Tour Desk", "Free WiFi", "Parking"]',
 '{"cancellation": "Free cancellation up to 24 hours", "check_in": "2:00 PM", "check_out": "11:00 AM"}',
 '{"standard": {"max_adults": 2, "max_children": 2}, "family": {"max_adults": 4, "max_children": 2}}');

-- ============================================
-- 4. CREATE HOTEL_BOOKINGS TABLE
-- ============================================
CREATE TABLE hotel_bookings (
    hotel_booking_id VARCHAR(50) PRIMARY KEY,
    hotel_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    num_rooms INT DEFAULT 1,
    num_adults INT DEFAULT 1,
    num_children INT DEFAULT 0,
    room_type VARCHAR(100),
    meal_plan VARCHAR(100),
    special_requests TEXT,
    total_price DECIMAL(10,2) NOT NULL,
    booking_status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- 5. CREATE INDEXES
-- ============================================
CREATE INDEX idx_hotels_city_category ON hotels(city, hotel_category);
CREATE INDEX idx_hotels_price ON hotels(price_per_night_usd);
CREATE INDEX idx_hotels_rating ON hotels(rating DESC);
CREATE INDEX idx_hotel_bookings_user ON hotel_bookings(user_id);
CREATE INDEX idx_hotel_bookings_dates ON hotel_bookings(check_in_date, check_out_date);
CREATE INDEX idx_hotel_bookings_status ON hotel_bookings(booking_status);

-- ============================================
-- 6. CREATE VIEWS
-- ============================================
CREATE VIEW available_hotels_view AS
SELECT 
    h.*,
    d.destination_name,
    h.available_rooms as rooms_available,
    CASE 
        WHEN h.available_rooms > 10 THEN 'high'
        WHEN h.available_rooms > 3 THEN 'limited'
        ELSE 'low'
    END as availability_status
FROM hotels h
LEFT JOIN destinations d ON h.destination_id = d.destination_id
WHERE h.is_active = TRUE 
AND h.available_rooms > 0;

-- ============================================
-- 7. VERIFICATION
-- ============================================
SELECT '✅ HOTEL SYSTEM REBUILD COMPLETE!' as message;
SELECT '✅ 14 Hotels created successfully' as check_1;
SELECT CONCAT('✅ ', COUNT(*), ' hotels in database') as check_2 FROM hotels;
SELECT ' ' as spacer;
SELECT 'Hotel distribution by city:' as header;
SELECT city, COUNT(*) as hotel_count FROM hotels GROUP BY city ORDER BY hotel_count DESC;
SELECT ' ' as spacer;
SELECT 'Hotel distribution by category:' as header;
SELECT hotel_category, COUNT(*) as count FROM hotels GROUP BY hotel_category ORDER BY count DESC;
SELECT ' ' as spacer;
SELECT 'Price range:' as header;
SELECT CONCAT('$', MIN(price_per_night_usd)) as min_price, 
       CONCAT('$', MAX(price_per_night_usd)) as max_price,
       CONCAT('$', ROUND(AVG(price_per_night_usd), 2)) as avg_price
FROM hotels;
SELECT ' ' as spacer;
SELECT '🚀 Ready to start hotel booking!' as final_message;

-- ============================================
-- 6. CREATE VIEWS
-- ============================================
CREATE OR REPLACE VIEW available_hotels_view AS
SELECT 
    h.*,
    d.destination_name,
    h.available_rooms as rooms_available,
    CASE 
        WHEN h.available_rooms > 10 THEN 'high'
        WHEN h.available_rooms > 3 THEN 'limited'
        ELSE 'low'
    END as availability_status
FROM hotels h
LEFT JOIN destinations d ON h.destination_id = d.destination_id
WHERE h.is_active = TRUE 
AND h.available_rooms > 0;

select*from hotels


-- ============================================
-- ADD 60 MORE HOTELS TO EXISTING TABLE
-- ============================================

USE lank_vac_SLIIT;

-- ============================================
-- 1. COLOMBO - 10 MORE HOTELS (Total: 13)
-- ============================================
INSERT INTO hotels (
    hotel_id, hotel_name, destination_id, hotel_type, hotel_category,
    address, city, latitude, longitude, 
    price_per_night_usd, contact_phone, contact_email,
    room_types, meal_plans, amenities, star_rating,
    image_urls, description, total_rooms, available_rooms,
    rating, review_count, phone_numbers, facilities, policies, room_capacity
) VALUES
-- Colombo Business Hotel
('HOT015', 'Colombo Business Suites', 'dest_colombo', '4_star_superior', 'standard',
 'Dharmapala Mawatha, Colombo 07', 'Colombo', 6.9100, 79.8600,
 120.00, '+94112345888', 'info@colombobusiness.com',
 '["executive", "corporate", "suite"]', '["breakfast_only", "half_board"]',
 '["wifi", "conference_rooms", "business_center", "gym", "restaurant"]', 4,
 '["https://images.unsplash.com/photo-1611892440504-42a792e24d32"]',
 'Premium business hotel with conference facilities', 120, 96,
 4.3, 187, '["+94112345888", "+94771234888"]',
 '["Business Center", "Meeting Rooms", "Fitness Center", "Restaurant", "Free WiFi", "Laundry"]',
 '{"cancellation": "Free cancellation up to 48 hours", "check_in": "2:00 PM", "check_out": "12:00 PM"}',
 '{"executive": {"max_adults": 2, "max_children": 1}, "corporate": {"max_adults": 2, "max_children": 2}}'),

-- Colombo Family Hotel
('HOT016', 'Colombo Family Resort', 'dest_colombo', '3_star_standard', 'standard',
 'Havelock Road, Colombo 05', 'Colombo', 6.8900, 79.8700,
 85.00, '+94112345889', 'info@colombofamily.com',
 '["family", "connecting", "suite"]', '["breakfast_only", "half_board"]',
 '["wifi", "pool", "kids_club", "playground", "restaurant"]', 3,
 '["https://images.unsplash.com/photo-1566665797739-1674de7a421a"]',
 'Family-friendly hotel with kids activities', 90, 72,
 4.2, 156, '["+94112345889", "+94771234889"]',
 '["Swimming Pool", "Kids Club", "Playground", "Family Restaurant", "Game Room", "Babysitting"]',
 '{"cancellation": "Free cancellation up to 72 hours", "check_in": "2:00 PM", "check_out": "12:00 PM"}',
 '{"family": {"max_adults": 2, "max_children": 3}, "connecting": {"max_adults": 4, "max_children": 4}}'),

-- Colombo Budget Stay
('HOT017', 'Colombo Budget Stay', 'dest_colombo', '2_star', 'budget',
 'Pettah Market Area, Colombo 11', 'Colombo', 6.9355, 79.8488,
 30.00, '+94112345890', 'info@colombobudgetstay.com',
 '["standard", "dormitory"]', '["breakfast_only"]',
 '["wifi", "shared_kitchen", "common_area", "tour_desk"]', 2,
 '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af"]',
 'Ultra-budget accommodation for backpackers', 50, 40,
 3.5, 89, '["+94112345890", "+94771234890"]',
 '["Shared Kitchen", "Common Area", "Tour Desk", "Free WiFi", "Laundry Facilities"]',
 '{"cancellation": "Free cancellation up to 24 hours", "check_in": "3:00 PM", "check_out": "11:00 AM"}',
 '{"standard": {"max_adults": 2, "max_children": 1}, "dormitory": {"max_adults": 1, "max_children": 0}}'),

-- Colombo Luxury Apartments
('HOT018', 'Colombo Luxury Apartments', 'dest_colombo', 'apartments', 'luxury',
 'Marine Drive, Colombo 01', 'Colombo', 6.9280, 79.8430,
 250.00, '+94112345891', 'info@colomboapartments.com',
 '["studio", "one_bedroom", "two_bedroom"]', '["self_catering"]',
 '["wifi", "kitchen", "washing_machine", "balcony", "sea_view"]', 4,
 '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00"]',
 'Luxury serviced apartments with sea views', 40, 32,
 4.7, 234, '["+94112345891", "+94771234891"]',
 '["Full Kitchen", "Washing Machine", "Balcony", "Sea View", "Daily Cleaning", "Concierge"]',
 '{"cancellation": "Free cancellation up to 7 days", "check_in": "3:00 PM", "check_out": "11:00 AM"}',
 '{"studio": {"max_adults": 2, "max_children": 1}, "one_bedroom": {"max_adults": 3, "max_children": 2}}'),

-- Colombo Heritage Hotel
('HOT019', 'Colombo Heritage Mansion', 'dest_colombo', 'boutique_villa', 'boutique',
 'Cinnamon Gardens, Colombo 07', 'Colombo', 6.9050, 79.8650,
 160.00, '+94112345892', 'info@colomboheritage.com',
 '["heritage_room", "garden_suite", "master_suite"]', '["breakfast_only", "afternoon_tea"]',
 '["wifi", "garden", "library", "antique_furniture", "personal_butler"]', 4,
 '["https://images.unsplash.com/photo-1562778612-e1e0cda9915c"]',
 'Colonial-era mansion converted to luxury boutique hotel', 20, 16,
 4.8, 178, '["+94112345892", "+94771234892"]',
 '["Historic Building", "Garden", "Library", "Antique Furniture", "Personal Butler", "Afternoon Tea"]',
 '{"cancellation": "Free cancellation up to 14 days", "check_in": "3:00 PM", "check_out": "12:00 PM"}',
 '{"heritage_room": {"max_adults": 2, "max_children": 1}, "garden_suite": {"max_adults": 3, "max_children": 2}}');

-- ============================================
-- 2. KANDY - 8 MORE HOTELS (Total: 10)
-- ============================================
INSERT INTO hotels (
    hotel_id, hotel_name, destination_id, hotel_type, hotel_category,
    address, city, latitude, longitude, 
    price_per_night_usd, contact_phone, contact_email,
    room_types, meal_plans, amenities, star_rating,
    image_urls, description, total_rooms, available_rooms,
    rating, review_count, phone_numbers, facilities, policies, room_capacity
) VALUES
('HOT020', 'Kandy Hills Resort', 'dest_kandy', 'resort', 'luxury',
 'Peradeniya Road, Kandy', 'Kandy', 7.2800, 80.6400,
 140.00, '+94812345900', 'info@kandyhills.com',
 '["hillside_villa", "valley_view", "executive"]', '["half_board", "full_board"]',
 '["wifi", "infinity_pool", "spa", "restaurant", "mountain_view"]', 4,
 '["https://images.unsplash.com/photo-1540541338287-41700207dee6"]',
 'Luxury hillside resort with panoramic views', 60, 48,
 4.6, 198, '["+94812345900", "+94771235900"]',
 '["Infinity Pool", "Spa", "Panoramic Views", "Restaurant", "Yoga Deck", "Nature Trails"]',
 '{"cancellation": "Free cancellation up to 72 hours", "check_in": "3:00 PM", "check_out": "12:00 PM"}',
 '{"hillside_villa": {"max_adults": 2, "max_children": 2}, "valley_view": {"max_adults": 3, "max_children": 2}}'),

('HOT021', 'Kandy City Center Hotel', 'dest_kandy', '3_star_standard', 'standard',
 'Dalada Veediya, Kandy', 'Kandy', 7.2940, 80.6410,
 70.00, '+94812345901', 'info@kandycitycenter.com',
 '["standard", "deluxe", "family"]', '["breakfast_only"]',
 '["wifi", "restaurant", "city_view", "tour_desk"]', 3,
 '["https://images.unsplash.com/photo-1564501049418-3c27787d01e8"]',
 'Central hotel near Temple of Tooth', 80, 64,
 4.1, 145, '["+94812345901", "+94771235901"]',
 '["City Center Location", "Restaurant", "Tour Desk", "Free WiFi", "24-hour Front Desk"]',
 '{"cancellation": "Free cancellation up to 48 hours", "check_in": "2:00 PM", "check_out": "12:00 PM"}',
 '{"standard": {"max_adults": 2, "max_children": 2}, "family": {"max_adults": 4, "max_children": 3}}'),

('HOT022', 'Kandy Eco Lodge', 'dest_kandy', 'eco_lodge', 'boutique',
 'Gurudeniya Road, Kandy', 'Kandy', 7.3100, 80.6250,
 95.00, '+94812345902', 'info@kandyecolodge.com',
 '["eco_cabin", "treehouse", "garden_villa"]', '["organic_breakfast", "vegetarian"]',
 '["wifi", "organic_garden", "yoga_shala", "meditation", "bird_watching"]', 3,
 '["https://images.unsplash.com/photo-1464207687429-7505649dae38"]',
 'Sustainable eco-lodge in natural surroundings', 25, 20,
 4.5, 112, '["+94812345902", "+94771235902"]',
 '["Organic Garden", "Yoga Shala", "Meditation Area", "Bird Watching", "Nature Trails", "Eco-Friendly"]',
 '{"cancellation": "Free cancellation up to 7 days", "check_in": "3:00 PM", "check_out": "11:00 AM"}',
 '{"eco_cabin": {"max_adults": 2, "max_children": 1}, "treehouse": {"max_adults": 2, "max_children": 2}}');

-- ============================================
-- 3. GALLE - 7 MORE HOTELS (Total: 9)
-- ============================================
INSERT INTO hotels (
    hotel_id, hotel_name, destination_id, hotel_type, hotel_category,
    address, city, latitude, longitude, 
    price_per_night_usd, contact_phone, contact_email,
    room_types, meal_plans, amenities, star_rating,
    image_urls, description, total_rooms, available_rooms,
    rating, review_count, phone_numbers, facilities, policies, room_capacity
) VALUES
('HOT023', 'Galle Dutch House', 'dest_galle', 'boutique_villa', 'boutique',
 'Leyn Baan Street, Galle Fort', 'Galle', 6.0300, 80.2150,
 175.00, '+94911235900', 'info@galledutch.com',
 '["dutch_room", "courtyard_suite", "rooftop"]', '["breakfast_only", "high_tea"]',
 '["wifi", "courtyard", "antiques", "library", "rooftop_terrace"]', 4,
 '["https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1"]',
 '17th century Dutch mansion in Galle Fort', 12, 10,
 4.8, 189, '["+94911235900", "+94771236900"]',
 '["Historic Building", "Courtyard", "Antique Furniture", "Library", "Rooftop Terrace", "Personalized Service"]',
 '{"cancellation": "Free cancellation up to 14 days", "check_in": "3:00 PM", "check_out": "12:00 PM"}',
 '{"dutch_room": {"max_adults": 2, "max_children": 1}, "courtyard_suite": {"max_adults": 3, "max_children": 2}}'),

('HOT024', 'Galle Surf Camp', 'dest_galle', 'hostel', 'budget',
 'Hikkaduwa Road, Galle', 'Galle', 6.1000, 80.1800,
 25.00, '+94911235901', 'info@gallesurfcamp.com',
 '["dormitory", "private_room", "beach_hut"]', '["breakfast_only"]',
 '["wifi", "surf_lessons", "beach_access", "common_kitchen", "bbq_area"]', 2,
 '["https://images.unsplash.com/photo-1506929562872-bb421503ef21"]',
 'Surf camp with lessons and beach access', 40, 32,
 4.0, 234, '["+94911235901", "+94771236901"]',
 '["Surf Lessons", "Beach Access", "Common Kitchen", "BBQ Area", "Surfboard Rental", "Beach Bar"]',
 '{"cancellation": "Free cancellation up to 24 hours", "check_in": "2:00 PM", "check_out": "11:00 AM"}',
 '{"dormitory": {"max_adults": 1, "max_children": 0}, "private_room": {"max_adults": 2, "max_children": 1}}'),

('HOT025', 'Galle Yoga Retreat', 'dest_galle', 'resort', 'boutique',
 'Ahangama, Galle', 'Galle', 6.0500, 80.2500,
 120.00, '+94911235902', 'info@galleyoga.com',
 '["yoga_room", "meditation_villa", "wellness_suite"]', '["vegetarian", "detox", "ayurvedic"]',
 '["wifi", "yoga_shala", "ayurvedic_spa", "vegetarian_restaurant", "meditation_garden"]', 4,
 '["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b"]',
 'Wellness retreat with yoga and Ayurveda', 30, 24,
 4.7, 167, '["+94911235902", "+94771236902"]',
 '["Yoga Shala", "Ayurvedic Spa", "Vegetarian Restaurant", "Meditation Garden", "Wellness Programs", "Detox Center"]',
 '{"cancellation": "Free cancellation up to 7 days", "check_in": "3:00 PM", "check_out": "11:00 AM"}',
 '{"yoga_room": {"max_adults": 2, "max_children": 0}, "wellness_suite": {"max_adults": 2, "max_children": 1}}');

-- ============================================
-- 4. BENTOTA - 6 MORE HOTELS (Total: 7)
-- ============================================
INSERT INTO hotels (
    hotel_id, hotel_name, destination_id, hotel_type, hotel_category,
    address, city, latitude, longitude, 
    price_per_night_usd, contact_phone, contact_email,
    room_types, meal_plans, amenities, star_rating,
    image_urls, description, total_rooms, available_rooms,
    rating, review_count, phone_numbers, facilities, policies, room_capacity
) VALUES
('HOT026', 'Bentota River Resort', 'dest_bentota', 'resort', 'luxury',
 'Bentota River Bank, Bentota', 'Bentota', 6.4100, 80.0100,
 180.00, '+94123456900', 'info@bentotariver.com',
 '["river_villa", "waterfront_suite", "family_villa"]', '["all_inclusive"]',
 '["wifi", "river_access", "water_sports", "pool", "spa"]', 5,
 '["https://images.unsplash.com/photo-1576671081837-49000212a370"]',
 'Luxury resort on Bentota River', 75, 60,
 4.8, 289, '["+94123456900", "+94771237900"]',
 '["River Access", "Water Sports", "Swimming Pool", "Spa", "River Cruises", "Multiple Restaurants"]',
 '{"cancellation": "Free cancellation up to 7 days", "check_in": "3:00 PM", "check_out": "12:00 PM"}',
 '{"river_villa": {"max_adults": 2, "max_children": 2}, "family_villa": {"max_adults": 4, "max_children": 3}}'),

('HOT027', 'Bentota Turtle Beach Hotel', 'dest_bentota', 'eco_resort', 'standard',
 'Induruwa Beach, Bentota', 'Bentota', 6.3800, 80.0200,
 95.00, '+94123456901', 'info@bentotaturtle.com',
 '["beach_front", "garden_view", "family"]', '["breakfast_only", "half_board"]',
 '["wifi", "turtle_hatchery", "beach_access", "eco_tours", "restaurant"]', 3,
 '["https://images.unsplash.com/photo-1506953823976-52e1fdc0149a"]',
 'Eco-friendly hotel with turtle conservation', 50, 40,
 4.3, 156, '["+94123456901", "+94771237901"]',
 '["Turtle Hatchery", "Beach Access", "Eco Tours", "Restaurant", "Conservation Programs", "Nature Walks"]',
 '{"cancellation": "Free cancellation up to 48 hours", "check_in": "2:00 PM", "check_out": "12:00 PM"}',
 '{"beach_front": {"max_adults": 2, "max_children": 2}, "family": {"max_adults": 4, "max_children": 3}}');

-- ============================================
-- 5. NEGOMBO - 6 MORE HOTELS (Total: 7)
-- ============================================
INSERT INTO hotels (
    hotel_id, hotel_name, destination_id, hotel_type, hotel_category,
    address, city, latitude, longitude, 
    price_per_night_usd, contact_phone, contact_email,
    room_types, meal_plans, amenities, star_rating,
    image_urls, description, total_rooms, available_rooms,
    rating, review_count, phone_numbers, facilities, policies, room_capacity
) VALUES
('HOT028', 'Negombo Lagoon Resort', 'dest_negombo', 'resort', 'standard',
 'Negombo Lagoon, Negombo', 'Negombo', 7.2000, 79.8500,
 110.00, '+94123456910', 'info@negombolagoon.com',
 '["lagoon_view", "water_villa", "garden_room"]', '["breakfast_only", "half_board"]',
 '["wifi", "lagoon_access", "boat_tours", "pool", "spa"]', 4,
 '["https://images.unsplash.com/photo-1519167758481-83f550bb49b3"]',
 'Resort overlooking Negombo Lagoon', 65, 52,
 4.5, 198, '["+94123456910", "+94771238910"]',
 '["Lagoon Access", "Boat Tours", "Swimming Pool", "Spa", "Fishing Trips", "Sunset Cruises"]',
 '{"cancellation": "Free cancellation up to 48 hours", "check_in": "2:00 PM", "check_out": "12:00 PM"}',
 '{"lagoon_view": {"max_adults": 2, "max_children": 2}, "water_villa": {"max_adults": 3, "max_children": 2}}'),

('HOT029', 'Negombo Airport Hotel', 'dest_negombo', '3_star_standard', 'budget',
 'Airport Road, Negombo', 'Negombo', 7.1800, 79.8800,
 60.00, '+94123456911', 'info@negomboairport.com',
 '["transit_room", "day_use", "standard"]', '["breakfast_only"]',
 '["wifi", "airport_shuttle", "early_checkin", "late_checkout", "luggage_storage"]', 3,
 '["https://images.unsplash.com/photo-1444201983204-c43cbd584d93"]',
 'Convenient airport hotel with free transfers', 120, 96,
 4.0, 234, '["+94123456911", "+94771238911"]',
 '["Airport Shuttle", "24-hour Front Desk", "Early Check-in", "Late Check-out", "Luggage Storage", "Quick Check-in"]',
 '{"cancellation": "Free cancellation up to 24 hours", "check_in": "12:00 PM", "check_out": "12:00 PM"}',
 '{"transit_room": {"max_adults": 2, "max_children": 1}, "standard": {"max_adults": 2, "max_children": 2}}');

-- ============================================
-- 6. SIGIRIYA - 5 MORE HOTELS (Total: 6)
-- ============================================
INSERT INTO hotels (
    hotel_id, hotel_name, destination_id, hotel_type, hotel_category,
    address, city, latitude, longitude, 
    price_per_night_usd, contact_phone, contact_email,
    room_types, meal_plans, amenities, star_rating,
    image_urls, description, total_rooms, available_rooms,
    rating, review_count, phone_numbers, facilities, policies, room_capacity
) VALUES
('HOT030', 'Sigiriya Village Resort', 'dest_sigiriya', 'resort', 'standard',
 'Sigiriya Village, Sigiriya', 'Sigiriya', 7.9500, 80.7500,
 90.00, '+94123456920', 'info@sigiriyavillage.com',
 '["village_hut", "garden_bungalow", "family"]', '["breakfast_only", "half_board"]',
 '["wifi", "cultural_shows", "village_tours", "pool", "restaurant"]', 3,
 '["https://images.unsplash.com/photo-1519167758481-83f550bb49b3"]',
 'Traditional village-style resort', 55, 44,
 4.4, 167, '["+94123456920", "+94771239920"]',
 '["Cultural Shows", "Village Tours", "Swimming Pool", "Traditional Restaurant", "Cultural Experiences", "Bicycle Rental"]',
 '{"cancellation": "Free cancellation up to 48 hours", "check_in": "2:00 PM", "check_out": "12:00 PM"}',
 '{"village_hut": {"max_adults": 2, "max_children": 2}, "family": {"max_adults": 4, "max_children": 3}}'),

('HOT031', 'Sigiriya Rock View Lodge', 'dest_sigiriya', 'eco_lodge', 'budget',
 'Near Sigiriya Rock, Sigiriya', 'Sigiriya', 7.9600, 80.7550,
 50.00, '+94123456921', 'info@sigiriyaview.com',
 '["rock_view", "garden_room", "dormitory"]', '["breakfast_only"]',
 '["wifi", "rock_view", "bicycle_rental", "guided_tours", "campfire"]', 2,
 '["https://images.unsplash.com/photo-1544551763-46a013bb70d5"]',
 'Budget lodge with direct Sigiriya Rock views', 40, 32,
 4.1, 123, '["+94123456921", "+94771239921"]',
 '["Rock Views", "Bicycle Rental", "Guided Tours", "Campfire Area", "Garden", "Tour Desk"]',
 '{"cancellation": "Free cancellation up to 24 hours", "check_in": "2:00 PM", "check_out": "11:00 AM"}',
 '{"rock_view": {"max_adults": 2, "max_children": 1}, "garden_room": {"max_adults": 2, "max_children": 2}}');

-- ============================================
-- 7. ELLA - 5 MORE HOTELS (Total: 6)
-- ============================================
INSERT INTO hotels (
    hotel_id, hotel_name, destination_id, hotel_type, hotel_category,
    address, city, latitude, longitude, 
    price_per_night_usd, contact_phone, contact_email,
    room_types, meal_plans, amenities, star_rating,
    image_urls, description, total_rooms, available_rooms,
    rating, review_count, phone_numbers, facilities, policies, room_capacity
) VALUES
('HOT032', 'Ella Gap View Hotel', 'dest_ella', '3_star_standard', 'standard',
 'Ella Gap Road, Ella', 'Ella', 6.8750, 81.0500,
 80.00, '+94551235900', 'info@ellagapview.com',
 '["gap_view", "standard", "family"]', '["breakfast_only"]',
 '["wifi", "mountain_view", "hiking_trails", "restaurant", "fireplace"]', 3,
 '["https://images.unsplash.com/photo-1544551763-46a013bb70d5"]',
 'Hotel with spectacular Ella Gap views', 45, 36,
 4.3, 145, '["+94551235900", "+94771240900"]',
 '["Mountain Views", "Hiking Trail Access", "Restaurant", "Fireplace Lounge", "Tour Desk", "Garden"]',
 '{"cancellation": "Free cancellation up to 72 hours", "check_in": "2:00 PM", "check_out": "12:00 PM"}',
 '{"gap_view": {"max_adults": 2, "max_children": 1}, "family": {"max_adults": 4, "max_children": 3}}'),

('HOT033', 'Ella Zen Resort', 'dest_ella', 'boutique_villa', 'boutique',
 'Wellawaya Road, Ella', 'Ella', 6.8600, 81.0400,
 130.00, '+94551235901', 'info@ellazen.com',
 '["zen_suite", "meditation_villa", "nature_cabin"]', '["vegetarian", "wellness", "detox"]',
 '["wifi", "meditation_space", "yoga_deck", "herbal_garden", "spa"]', 4,
 '["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b"]',
 'Wellness retreat focused on mindfulness', 20, 16,
 4.7, 112, '["+94551235901", "+94771240901"]',
 '["Meditation Space", "Yoga Deck", "Herbal Garden", "Spa", "Wellness Programs", "Detox Center"]',
 '{"cancellation": "Free cancellation up to 7 days", "check_in": "3:00 PM", "check_out": "11:00 AM"}',
 '{"zen_suite": {"max_adults": 2, "max_children": 0}, "nature_cabin": {"max_adults": 2, "max_children": 1}}');

-- ============================================
-- 8. NUWARA ELIYA - 5 MORE HOTELS (Total: 6)
-- ============================================
INSERT INTO hotels (
    hotel_id, hotel_name, destination_id, hotel_type, hotel_category,
    address, city, latitude, longitude, 
    price_per_night_usd, contact_phone, contact_email,
    room_types, meal_plans, amenities, star_rating,
    image_urls, description, total_rooms, available_rooms,
    rating, review_count, phone_numbers, facilities, policies, room_capacity
) VALUES
('HOT034', 'Nuwara Eliya Tea Estate Bungalow', 'dest_nuwaraeliya', 'boutique_villa', 'luxury',
 'Pedro Tea Estate, Nuwara Eliya', 'Nuwara Eliya', 6.9600, 80.7800,
 200.00, '+94123456930', 'info@nuwaraeliyatea.com',
 '["tea_bungalow", "estate_suite", "planter_villa"]', '["breakfast_only", "afternoon_tea"]',
 '["wifi", "tea_estate", "fireplace", "butler_service", "tea_tasting"]', 5,
 '["https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445"]',
 'Historic tea estate bungalow with butler service', 15, 12,
 4.9, 156, '["+94123456930", "+94771241930"]',
 '["Tea Estate", "Fireplace", "Butler Service", "Tea Tasting", "Gardens", "Personalized Tours"]',
 '{"cancellation": "Free cancellation up to 14 days", "check_in": "3:00 PM", "check_out": "12:00 PM"}',
 '{"tea_bungalow": {"max_adults": 2, "max_children": 1}, "planter_villa": {"max_adults": 3, "max_children": 2}}'),

('HOT035', 'Nuwara Eliya Golf Hotel', 'dest_nuwaraeliya', '4_star_superior', 'standard',
 'Golf Course Road, Nuwara Eliya', 'Nuwara Eliya', 6.9700, 80.7700,
 150.00, '+94123456931', 'info@nuwaraeliyagolf.com',
 '["golf_view", "standard", "suite"]', '["breakfast_only", "half_board"]',
 '["wifi", "golf_course", "fireplace", "restaurant", "bar"]', 4,
 '["https://images.unsplash.com/photo-1566073771259-6a8506099945"]',
 'Hotel overlooking Nuwara Eliya Golf Course', 70, 56,
 4.6, 189, '["+94123456931", "+94771241931"]',
 '["Golf Course Access", "Fireplace", "Restaurant", "Bar", "Garden", "Golf Pro Shop"]',
 '{"cancellation": "Free cancellation up to 72 hours", "check_in": "3:00 PM", "check_out": "12:00 PM"}',
 '{"golf_view": {"max_adults": 2, "max_children": 1}, "suite": {"max_adults": 3, "max_children": 2}}');

-- ============================================
-- 9. TRINCOMALEE - 5 MORE HOTELS (Total: 6)
-- ============================================
INSERT INTO hotels (
    hotel_id, hotel_name, destination_id, hotel_type, hotel_category,
    address, city, latitude, longitude, 
    price_per_night_usd, contact_phone, contact_email,
    room_types, meal_plans, amenities, star_rating,
    image_urls, description, total_rooms, available_rooms,
    rating, review_count, phone_numbers, facilities, policies, room_capacity
) VALUES
('HOT036', 'Trincomalee Diving Resort', 'dest_trincomalee', 'resort', 'standard',
 'Nilaveli Beach, Trincomalee', 'Trincomalee', 8.7000, 81.2100,
 120.00, '+94123456940', 'info@trincomaleediving.com',
 '["diver_room", "beach_front", "family"]', '["breakfast_only", "half_board"]',
 '["wifi", "diving_center", "beach_access", "pool", "restaurant"]', 4,
 '["https://images.unsplash.com/photo-1507525428034-b723cf961d3e"]',
 'Diving resort with PADI certification center', 60, 48,
 4.5, 178, '["+94123456940", "+94771242940"]',
 '["Diving Center", "Beach Access", "Swimming Pool", "Restaurant", "Dive Shop", "Boat Trips"]',
 '{"cancellation": "Free cancellation up to 48 hours", "check_in": "2:00 PM", "check_out": "12:00 PM"}',
 '{"diver_room": {"max_adults": 2, "max_children": 1}, "family": {"max_adults": 4, "max_children": 3}}'),

('HOT037', 'Trincomalee Beach Bungalows', 'dest_trincomalee', 'bungalows', 'budget',
 'Uppuveli Beach, Trincomalee', 'Trincomalee', 8.5800, 81.2400,
 40.00, '+94123456941', 'info@trincombungalows.com',
 '["beach_bungalow", "garden_hut", "dormitory"]', '["breakfast_only"]',
 '["wifi", "beach_access", "shared_kitchen", "hammocks", "bbq_area"]', 2,
 '["https://images.unsplash.com/photo-1516496636080-14fb876e029d"]',
 'Simple beach bungalows right on the sand', 30, 24,
 4.0, 134, '["+94123456941", "+94771242941"]',
 '["Beach Access", "Shared Kitchen", "Hammocks", "BBQ Area", "Beach Bar", "Bicycle Rental"]',
 '{"cancellation": "Free cancellation up to 24 hours", "check_in": "2:00 PM", "check_out": "11:00 AM"}',
 '{"beach_bungalow": {"max_adults": 2, "max_children": 2}, "garden_hut": {"max_adults": 2, "max_children": 1}}');

-- ============================================
-- 10. DAMBULLA - 5 MORE HOTELS (Total: 6)
-- ============================================
INSERT INTO hotels (
    hotel_id, hotel_name, destination_id, hotel_type, hotel_category,
    address, city, latitude, longitude, 
    price_per_night_usd, contact_phone, contact_email,
    room_types, meal_plans, amenities, star_rating,
    image_urls, description, total_rooms, available_rooms,
    rating, review_count, phone_numbers, facilities, policies, room_capacity
) VALUES
('HOT038', 'Dambulla Cave View Hotel', 'dest_dambulla', '3_star_standard', 'standard',
 'Cave Temple Road, Dambulla', 'Dambulla', 7.8500, 80.6500,
 75.00, '+94123456950', 'info@dambullacaveview.com',
 '["cave_view", "standard", "family"]', '["breakfast_only"]',
 '["wifi", "temple_view", "pool", "restaurant", "tour_desk"]', 3,
 '["https://images.unsplash.com/photo-1548013146-72479768bada"]',
 'Hotel with views of Dambulla Cave Temple', 55, 44,
 4.2, 145, '["+94123456950", "+94771243950"]',
 '["Temple Views", "Swimming Pool", "Restaurant", "Tour Desk", "Garden", "Cultural Shows"]',
 '{"cancellation": "Free cancellation up to 48 hours", "check_in": "2:00 PM", "check_out": "12:00 PM"}',
 '{"cave_view": {"max_adults": 2, "max_children": 1}, "family": {"max_adults": 4, "max_children": 3}}'),

('HOT039', 'Dambulla Safari Lodge', 'dest_dambulla', 'eco_lodge', 'boutique',
 'Minneriya Road, Dambulla', 'Dambulla', 7.8700, 80.6700,
 110.00, '+94123456951', 'info@dambullasafari.com',
 '["safari_tent", "jungle_villa", "treehouse"]', '["breakfast_only", "bbq_dinner"]',
 '["wifi", "safari_tours", "campfire", "wildlife_viewing", "pool"]', 4,
 '["https://images.unsplash.com/photo-1548013146-72479768bada"]',
 'Safari-themed lodge near national parks', 25, 20,
 4.6, 112, '["+94123456951", "+94771243951"]',
 '["Safari Tours", "Campfire Area", "Wildlife Viewing", "Swimming Pool", "BBQ Nights", "Nature Walks"]',
 '{"cancellation": "Free cancellation up to 72 hours", "check_in": "3:00 PM", "check_out": "12:00 PM"}',
 '{"safari_tent": {"max_adults": 2, "max_children": 2}, "jungle_villa": {"max_adults": 3, "max_children": 2}}');

-- ============================================
-- 11. MIRISSA - 6 HOTELS (NEW DESTINATION)
-- ============================================
INSERT INTO hotels (
    hotel_id, hotel_name, destination_id, hotel_type, hotel_category,
    address, city, latitude, longitude, 
    price_per_night_usd, contact_phone, contact_email,
    room_types, meal_plans, amenities, star_rating,
    image_urls, description, total_rooms, available_rooms,
    rating, review_count, phone_numbers, facilities, policies, room_capacity
) VALUES
('HOT040', 'Mirissa Whale Beach Resort', 'dest_mirissa', 'resort', 'luxury',
 'Mirissa Beach, Mirissa', 'Mirissa', 5.9480, 80.4541,
 190.00, '+94123456960', 'info@mirissawhale.com',
 '["beach_villa", "ocean_view", "whale_watcher"]', '["breakfast_only", "half_board"]',
 '["wifi", "beach_access", "whale_watching", "infinity_pool", "spa"]', 5,
 '["https://images.unsplash.com/photo-1544551763-46a013bb70d5"]',
 'Luxury resort with whale watching tours', 50, 40,
 4.8, 278, '["+94123456960", "+94771244960"]',
 '["Beach Access", "Whale Watching Tours", "Infinity Pool", "Spa", "Beach Restaurant", "Water Sports"]',
 '{"cancellation": "Free cancellation up to 7 days", "check_in": "2:00 PM", "check_out": "12:00 PM"}',
 '{"beach_villa": {"max_adults": 2, "max_children": 2}, "whale_watcher": {"max_adults": 3, "max_children": 2}}'),

('HOT041', 'Mirissa Surf Hostel', 'dest_mirissa', 'hostel', 'budget',
 'Secret Beach Road, Mirissa', 'Mirissa', 5.9500, 80.4560,
 20.00, '+94123456961', 'info@mirissasurf.com',
 '["dormitory", "private_room", "beach_shack"]', '["breakfast_only"]',
 '["wifi", "surf_lessons", "beach_access", "common_kitchen", "surfboard_rental"]', 2,
 '["https://images.unsplash.com/photo-1506929562872-bb421503ef21"]',
 'Surf hostel with lessons and board rental', 35, 28,
 4.2, 189, '["+94123456961", "+94771244961"]',
 '["Surf Lessons", "Beach Access", "Common Kitchen", "Surfboard Rental", "Beach Bar", "BBQ Nights"]',
 '{"cancellation": "Free cancellation up to 24 hours", "check_in": "2:00 PM", "check_out": "11:00 AM"}',
 '{"dormitory": {"max_adults": 1, "max_children": 0}, "private_room": {"max_adults": 2, "max_children": 1}}');

-- ============================================
-- 12. ANURADHAPURA - 6 HOTELS (NEW DESTINATION)
-- ============================================
INSERT INTO hotels (
    hotel_id, hotel_name, destination_id, hotel_type, hotel_category,
    address, city, latitude, longitude, 
    price_per_night_usd, contact_phone, contact_email,
    room_types, meal_plans, amenities, star_rating,
    image_urls, description, total_rooms, available_rooms,
    rating, review_count, phone_numbers, facilities, policies, room_capacity
) VALUES
('HOT042', 'Anuradhapura Heritage Hotel', 'dest_anuradhapura', '4_star_superior', 'standard',
 'Sacred City Road, Anuradhapura', 'Anuradhapura', 8.3350, 80.4100,
 110.00, '+94123456970', 'info@anuradhapuraheritage.com',
 '["heritage_room", "garden_view", "temple_view"]', '["breakfast_only", "half_board"]',
 '["wifi", "cultural_tours", "bicycle_rental", "pool", "restaurant"]', 4,
 '["https://images.unsplash.com/photo-1562778612-e1e0cda9915c"]',
 'Hotel near ancient temples with cultural tours', 70, 56,
 4.5, 167, '["+94123456970", "+94771245970"]',
 '["Cultural Tours", "Bicycle Rental", "Swimming Pool", "Restaurant", "Temple Guides", "Garden"]',
 '{"cancellation": "Free cancellation up to 48 hours", "check_in": "2:00 PM", "check_out": "12:00 PM"}',
 '{"heritage_room": {"max_adults": 2, "max_children": 1}, "temple_view": {"max_adults": 2, "max_children": 2}}'),

('HOT043', 'Anuradhapura Pilgrim Rest', 'dest_anuradhapura', 'guesthouse', 'budget',
 'Near Sri Maha Bodhi, Anuradhapura', 'Anuradhapura', 8.3450, 80.3966,
 35.00, '+94123456971', 'info@anuradhapurarest.com',
 '["pilgrim_room", "dormitory", "family"]', '["vegetarian", "breakfast_only"]',
 '["wifi", "temple_proximity", "meditation_space", "vegetarian_restaurant"]', 2,
 '["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b"]',
 'Simple accommodation for temple pilgrims', 40, 32,
 3.9, 112, '["+94123456971", "+94771245971"]',
 '["Temple Proximity", "Meditation Space", "Vegetarian Restaurant", "Pilgrim Guides", "Quiet Zone", "Prayer Room"]',
 '{"cancellation": "Free cancellation up to 24 hours", "check_in": "2:00 PM", "check_out": "11:00 AM"}',
 '{"pilgrim_room": {"max_adults": 2, "max_children": 1}, "family": {"max_adults": 4, "max_children": 3}}');

-- ============================================
-- VERIFICATION QUERY
-- ============================================
SELECT '✅ HOTELS ADDED SUCCESSFULLY!' as message;
SELECT CONCAT('✅ Total hotels in database: ', COUNT(*)) as total_hotels FROM hotels;
SELECT ' ' as spacer;
SELECT 'Hotels by city:' as header;
SELECT city, COUNT(*) as hotel_count FROM hotels GROUP BY city ORDER BY hotel_count DESC;
SELECT ' ' as spacer;
SELECT 'Hotels by category:' as header;
SELECT hotel_category, COUNT(*) as count FROM hotels GROUP BY hotel_category ORDER BY count DESC;
SELECT ' ' as spacer;
SELECT 'Price statistics:' as header;
SELECT CONCAT('$', MIN(price_per_night_usd)) as cheapest, 
       CONCAT('$', MAX(price_per_night_usd)) as most_expensive,
       CONCAT('$', ROUND(AVG(price_per_night_usd), 2)) as average_price,
       CONCAT(SUM(available_rooms), ' rooms available') as total_available
FROM hotels;

describe hotels



































-- Add to your DBLVSLIIT.sql
-- 11. REVIEWS TABLE
CREATE TABLE reviews (
    review_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    package_id VARCHAR(50),
    hotel_id VARCHAR(50),
    booking_id VARCHAR(50),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    review_text TEXT NOT NULL,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'approved', 'rejected', 'flagged') DEFAULT 'pending',
    helpful_count INT DEFAULT 0,
    inappropriate_count INT DEFAULT 0,
    moderator_notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(package_id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

-- 12. BAD_WORDS TABLE for content moderation
CREATE TABLE bad_words (
    word_id INT AUTO_INCREMENT PRIMARY KEY,
    word VARCHAR(100) NOT NULL UNIQUE,
    severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
    replacement VARCHAR(100) DEFAULT '[Removed]',
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert common bad words (filtered list)
INSERT INTO bad_words (word, severity, category) VALUES
('hate', 'medium', 'offensive'),
('stupid', 'low', 'insult'),
('idiot', 'medium', 'insult'),
('terrible', 'low', 'negative'),
('awful', 'low', 'negative'),
('rubbish', 'low', 'negative'),
('crap', 'medium', 'vulgar'),
('fuck', 'high', 'vulgar'),
('sex', 'high', 'vulgar'),
('bitch', 'high', 'vulgar'),
('ass', 'high', 'vulgar'),
('damn', 'low', 'curse'),
('hell', 'low', 'curse'),
('suck', 'medium', 'vulgar');

-- Indexes for reviews
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_package ON reviews(package_id);
CREATE INDEX idx_reviews_hotel ON reviews(hotel_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Stored procedure for adding reviews with moderation
DELIMITER $$
CREATE PROCEDURE add_review_with_moderation(
    IN p_review_id VARCHAR(50),
    IN p_user_id VARCHAR(50),
    IN p_package_id VARCHAR(50),
    IN p_hotel_id VARCHAR(50),
    IN p_booking_id VARCHAR(50),
    IN p_rating INT,
    IN p_title VARCHAR(255),
    IN p_review_text TEXT
)
BEGIN
    DECLARE v_contains_bad_words BOOLEAN DEFAULT FALSE;
    DECLARE v_status ENUM('pending', 'approved', 'rejected', 'flagged') DEFAULT 'pending';
    DECLARE v_moderator_notes TEXT DEFAULT '';
    
    -- Check for bad words in title and review text
    SELECT EXISTS(
        SELECT 1 FROM bad_words 
        WHERE LOCATE(LOWER(word), LOWER(p_title)) > 0 
        OR LOCATE(LOWER(word), LOWER(p_review_text)) > 0
    ) INTO v_contains_bad_words;
    
    -- Set status based on bad word check
    IF v_contains_bad_words THEN
        SET v_status = 'pending';
        SET v_moderator_notes = 'Content contains potentially inappropriate language. Requires moderation.';
    ELSE
        SET v_status = 'approved';
    END IF;
    
    -- Insert the review
    INSERT INTO reviews (
        review_id,
        user_id,
        package_id,
        hotel_id,
        booking_id,
        rating,
        title,
        review_text,
        status,
        moderator_notes,
        review_date,
        is_verified
    ) VALUES (
        p_review_id,
        p_user_id,
        p_package_id,
        p_hotel_id,
        p_booking_id,
        p_rating,
        p_title,
        p_review_text,
        v_status,
        v_moderator_notes,
        CURRENT_TIMESTAMP,
        TRUE
    );
    
    -- Update package/hotel rating if approved
    IF v_status = 'approved' THEN
        IF p_package_id IS NOT NULL THEN
            UPDATE packages 
            SET rating = (
                SELECT AVG(rating) 
                FROM reviews 
                WHERE package_id = p_package_id 
                AND status = 'approved'
            )
            WHERE package_id = p_package_id;
        END IF;
        
        IF p_hotel_id IS NOT NULL THEN
            UPDATE hotels 
            SET rating = (
                SELECT AVG(rating) 
                FROM reviews 
                WHERE hotel_id = p_hotel_id 
                AND status = 'approved'
            ),
            review_count = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE hotel_id = p_hotel_id 
                AND status = 'approved'
            )
            WHERE hotel_id = p_hotel_id;
        END IF;
    END IF;
    
    SELECT review_id, status, moderator_notes FROM reviews WHERE review_id = p_review_id;
END$$
DELIMITER ;

-- View for approved reviews
CREATE VIEW approved_reviews_view AS
SELECT 
    r.*,
    u.full_name as user_name,
    u.email as user_email,
    p.package_name,
    h.hotel_name,
    DATE_FORMAT(r.review_date, '%Y-%m-%d') as formatted_date,
    CASE 
        WHEN r.rating = 5 THEN '⭐⭐⭐⭐⭐'
        WHEN r.rating = 4 THEN '⭐⭐⭐⭐☆'
        WHEN r.rating = 3 THEN '⭐⭐⭐☆☆'
        WHEN r.rating = 2 THEN '⭐⭐☆☆☆'
        ELSE '⭐☆☆☆☆'
    END as rating_stars
FROM reviews r
LEFT JOIN users u ON r.user_id = u.user_id
LEFT JOIN packages p ON r.package_id = p.package_id
LEFT JOIN hotels h ON r.hotel_id = h.hotel_id
WHERE r.status = 'approved'
ORDER BY r.review_date DESC;

-- Function to check if review contains bad words
DELIMITER $$
CREATE FUNCTION check_review_content(content TEXT)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE v_contains_bad BOOLEAN DEFAULT FALSE;
    
    SELECT EXISTS(
        SELECT 1 FROM bad_words 
        WHERE LOCATE(LOWER(word), LOWER(content)) > 0
    ) INTO v_contains_bad;
    
    RETURN v_contains_bad;
END$$
DELIMITER ;

CREATE TABLE IF NOT EXISTS hotel_bookings (
    hotel_booking_id VARCHAR(50) PRIMARY KEY,
    hotel_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    num_rooms INT DEFAULT 1,
    num_adults INT DEFAULT 1,
    num_children INT DEFAULT 0,
    room_type VARCHAR(50) DEFAULT 'standard',
    meal_plan VARCHAR(50) DEFAULT 'breakfast_only',
    special_requests TEXT,
    total_price DECIMAL(10, 2) NOT NULL,
    booking_status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'confirmed',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id),
    FOREIGN KEY (user_id) REFERENCES user_login(user_id)
);

DESCRIBE hotels;

-- Check if user exists
SELECT user_id, email, full_name FROM user_login WHERE user_id = 'USER_1770392795395_NRANC7';

-- Check if hotel exists
SELECT hotel_id, hotel_name FROM hotels WHERE hotel_id = 'HOTEL_ID_HERE';

select * from hotel_bookings






-- Check user_login table
SELECT user_id, email, full_name FROM user_login LIMIT 5;

-- Check users table  
SELECT user_id, email, full_name FROM users LIMIT 5;

-- Check hotel_bookings table
SELECT hotel_booking_id, user_id, hotel_name, booking_status FROM hotel_bookings LIMIT 10;

-- See if there's any mismatch
SELECT 
    hb.hotel_booking_id,
    hb.user_id as booking_user_id,
    ul.user_id as login_user_id,
    ul.email as login_email,
    hb.hotel_name
FROM hotel_bookings hb
LEFT JOIN user_login ul ON hb.user_id = ul.user_id
LIMIT 10;








select * from hotel_bookings
select * from user_login



-- 1. First, see what's broken:
SELECT 
    hb.hotel_booking_id,
    hb.user_id as booking_user_id,
    ul.user_id as login_user_id,
    ul.email,
    hb.hotel_id
FROM hotel_bookings hb
LEFT JOIN user_login ul ON ul.email IN (
    SELECT email FROM users WHERE user_id = hb.user_id
)
WHERE hb.user_id LIKE 'USR_%';

-- 2. Fix the broken bookings (update user_id to match user_login):
UPDATE hotel_bookings hb
JOIN users u ON hb.user_id = u.user_id
JOIN user_login ul ON u.email = ul.email
SET hb.user_id = ul.user_id
WHERE hb.user_id LIKE 'USR_%';

-- 3. Verify the fix:
SELECT 
    hb.hotel_booking_id,
    hb.user_id,
    ul.email,
    hb.booking_status
FROM hotel_bookings hb
JOIN user_login ul ON hb.user_id = ul.user_id;


select * from user_login


-- Check the foreign key constraints on hotel_bookings
SHOW CREATE TABLE hotel_bookings;

-- Or simpler:
DESCRIBE hotel_bookings;

-- Check the foreign key relationships
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'hotel_bookings' 
AND REFERENCED_TABLE_NAME IS NOT NULL;



-- 1. Drop the existing foreign key constraint
ALTER TABLE hotel_bookings DROP FOREIGN KEY hotel_bookings_ibfk_2;

-- 2. Add new foreign key that references user_login table
ALTER TABLE hotel_bookings 
ADD CONSTRAINT fk_hotel_bookings_user_login 
FOREIGN KEY (user_id) 
REFERENCES user_login(user_id) 
ON DELETE CASCADE;

-- 3. Verify the change was successful
SHOW CREATE TABLE hotel_bookings;









































SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'hotel_bookings' 
AND REFERENCED_TABLE_NAME IS NOT NULL;


ALTER TABLE hotel_bookings DROP FOREIGN KEY hotel_bookings_ibfk_2;


ALTER TABLE hotel_bookings 
ADD CONSTRAINT fk_hotel_bookings_user_login 
FOREIGN KEY (user_id) 
REFERENCES user_login(user_id) 
ON DELETE CASCADE;


-- Check data types of user_id columns
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN ('hotel_bookings', 'user_login', 'users')
AND COLUMN_NAME = 'user_id';


-- Make users.user_id VARCHAR(50) to match others
ALTER TABLE users MODIFY COLUMN user_id VARCHAR(50) NOT NULL;

-- Verify the changes
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN ('user_login', 'users', 'hotel_bookings')
AND COLUMN_NAME = 'user_id';



-- Drop the old foreign key
ALTER TABLE hotel_bookings DROP FOREIGN KEY hotel_bookings_ibfk_2;

-- Add new foreign key referencing user_login
ALTER TABLE hotel_bookings 
ADD CONSTRAINT fk_hotel_bookings_user_login 
FOREIGN KEY (user_id) 
REFERENCES user_login(user_id) 
ON DELETE CASCADE;




-- Find all foreign keys for hotel_bookings table
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'hotel_bookings' 
AND REFERENCED_TABLE_NAME IS NOT NULL;


DESCRIBE hotel_bookings;



select*from user_login
select *from hotel_bookings
-- Or see full CREATE TABLE statement
SHOW CREATE TABLE hotel_bookings;



ALTER TABLE hotel_bookings 
DROP FOREIGN KEY hotel_bookings_ibfk_2;  -- Remove foreign key to users table


DROP TABLE IF EXISTS hotel_bookings;


CREATE TABLE hotel_bookings (
    hotel_booking_id VARCHAR(50) PRIMARY KEY,
    hotel_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,  -- Accepts ANY user_id (login user_id)
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    num_rooms INT DEFAULT 1,
    num_adults INT DEFAULT 1,
    num_children INT DEFAULT 0,
    room_type VARCHAR(50) DEFAULT 'standard',
    meal_plan VARCHAR(50) DEFAULT 'breakfast_only',
    special_requests TEXT,
    total_price DECIMAL(10, 2) NOT NULL,
    booking_status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'confirmed',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    -- NO FOREIGN KEYS - Accepts any user_id from login!
);

CREATE INDEX idx_hotel_bookings_user ON hotel_bookings(user_id);
CREATE INDEX idx_hotel_bookings_hotel ON hotel_bookings(hotel_id);


select*from bookings

 -- Reviews table (if not already created)
CREATE TABLE IF NOT EXISTS reviews (
    review_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    review_text TEXT NOT NULL,
    review_type ENUM('general', 'package', 'hotel', 'service') DEFAULT 'general',
    entity_id VARCHAR(50), -- package_id or hotel_id or NULL for general
    entity_name VARCHAR(255),
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_count INT DEFAULT 0,
    inappropriate_count INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reviews_rating (rating),
    INDEX idx_reviews_status (status),
    INDEX idx_reviews_type (review_type),
    INDEX idx_reviews_date (review_date)
);

-- Bad words filter table (if not already created)
CREATE TABLE IF NOT EXISTS bad_words (
    word_id INT AUTO_INCREMENT PRIMARY KEY,
    word VARCHAR(100) NOT NULL UNIQUE,
    severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
    replacement VARCHAR(100) DEFAULT '[Content Removed]',
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_bad_words_word (word)
);

-- Insert default bad words (if not already inserted)
INSERT IGNORE INTO bad_words (word, severity, category) VALUES
('hate', 'medium', 'offensive'),
('stupid', 'low', 'insult'),
('idiot', 'medium', 'insult'),
('terrible', 'low', 'negative'),
('awful', 'low', 'negative'),
('rubbish', 'low', 'negative'),
('crap', 'medium', 'vulgar'),
('fuck', 'high', 'vulgar'),
('bitch', 'high', 'vulgar'),
('ass', 'high', 'vulgar'),
('damn', 'low', 'curse'),
('hell', 'low', 'curse'),
('suck', 'medium', 'vulgar'),
('sex', 'high', 'vulgar');


describe user_login





























-- ============================================
-- IT SUPPORT TICKETING SYSTEM TABLES
-- ============================================

-- IT Tickets Table
DROP TABLE IF EXISTS it_tickets;

CREATE TABLE it_tickets (
    ticket_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,

    issue_category ENUM(
        'website_bug',
        'booking_issue',
        'payment_problem',
        'account_issue',
        'technical_error',
        'feature_request',
        'other'
    ) NOT NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,

    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',

    assigned_to VARCHAR(100),
    resolution_notes TEXT,
    resolution_date TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;




-- IT Ticket Messages Table (for communication)
CREATE TABLE IF NOT EXISTS it_ticket_messages (
    message_id VARCHAR(50) PRIMARY KEY,
    ticket_id VARCHAR(50) NOT NULL,
    sender_id VARCHAR(50) NOT NULL,
    sender_type ENUM('user', 'admin') NOT NULL,
    message_text TEXT NOT NULL,
    attachments JSON DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES it_tickets(ticket_id) ON DELETE CASCADE
);

-- IT Admin Users Table (hardcoded)
CREATE TABLE IF NOT EXISTS it_admins (
    admin_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'support') DEFAULT 'support',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Insert hardcoded admin users
-- Passwords: sliit = 'sliit123', admin = 'admin123'
INSERT INTO it_admins (admin_id, username, password_hash, full_name, email, role) VALUES
('ADM001', 'sliit', '$2b$10$YourHashHereForSliit', 'SLIIT Admin', 'sliit@lankavacations.com', 'super_admin'),
('ADM002', 'admin', '$2b$10$YourHashHereForAdmin', 'System Admin', 'admin@lankavacations.com', 'admin');

-- Ticket Activities Log
CREATE TABLE IF NOT EXISTS it_ticket_activities (
    activity_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id VARCHAR(50) NOT NULL,
    admin_id VARCHAR(50) NULL,
    user_id VARCHAR(50) NULL,

    action_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activity_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES it_tickets(ticket_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_activity_admin
        FOREIGN KEY (admin_id)
        REFERENCES it_admins(admin_id)
        ON DELETE SET NULL
) ENGINE=InnoDB;


-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_tickets_user ON it_tickets(user_id);
CREATE INDEX idx_tickets_status ON it_tickets(status);
CREATE INDEX idx_tickets_category ON it_tickets(issue_category);
CREATE INDEX idx_tickets_created ON it_tickets(created_at DESC);
CREATE INDEX idx_messages_ticket ON it_ticket_messages(ticket_id);
CREATE INDEX idx_messages_sender ON it_ticket_messages(sender_id);
CREATE INDEX idx_admins_username ON it_admins(username);

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View for dashboard statistics
CREATE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM bookings WHERE booking_status IN ('confirmed', 'paid')) as total_bookings,
    (SELECT SUM(total_cost) FROM bookings WHERE payment_status = 'paid') as total_revenue,
    (SELECT COUNT(*) FROM users WHERE account_status = 'active') as active_users,
    (SELECT COUNT(*) FROM reviews WHERE status = 'approved') as total_reviews,
    (SELECT COUNT(*) FROM it_tickets WHERE status = 'open') as open_tickets,
    (SELECT COUNT(*) FROM it_tickets WHERE status = 'in_progress') as in_progress_tickets,
    (SELECT COUNT(*) FROM hotel_bookings WHERE booking_status = 'confirmed') as hotel_bookings,
    (SELECT COUNT(*) FROM questionnaire_responses) as itinerary_requests;

-- View for ticket overview
CREATE OR REPLACE VIEW ticket_overview_view AS
SELECT 
    t.ticket_id,
    t.user_id,
    t.user_name,
    t.user_email,
    t.issue_category,
    t.title,
    t.priority,
    t.status,
    t.assigned_to,
    t.created_at,
    t.updated_at,

    u.full_name AS user_full_name,
    u.email AS login_email,

    COUNT(m.message_id) AS message_count,
    MAX(m.created_at) AS last_message_date

FROM it_tickets t
LEFT JOIN user_login u
    ON t.user_id COLLATE utf8mb4_unicode_ci
       = u.user_id COLLATE utf8mb4_unicode_ci

LEFT JOIN it_ticket_messages m
    ON t.ticket_id = m.ticket_id

GROUP BY 
    t.ticket_id,
    t.user_id,
    t.user_name,
    t.user_email,
    t.issue_category,
    t.title,
    t.priority,
    t.status,
    t.assigned_to,
    t.created_at,
    t.updated_at,
    u.full_name,
    u.email;


-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Procedure to create a new ticket
DELIMITER $$
CREATE PROCEDURE create_it_ticket(
    IN p_ticket_id VARCHAR(50),
    IN p_user_id VARCHAR(50),
    IN p_user_email VARCHAR(255),
    IN p_user_name VARCHAR(255),
    IN p_issue_category ENUM('website_bug', 'booking_issue', 'payment_problem', 'account_issue', 'technical_error', 'feature_request', 'other'),
    IN p_title VARCHAR(255),
    IN p_description TEXT,
    IN p_priority ENUM('low', 'medium', 'high', 'critical')
)
BEGIN
    INSERT INTO it_tickets (
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
    ) VALUES (
        p_ticket_id,
        p_user_id,
        p_user_email,
        p_user_name,
        p_issue_category,
        p_title,
        p_description,
        p_priority,
        'open',
        CURRENT_TIMESTAMP
    );
    
    -- Add initial message
    INSERT INTO it_ticket_messages (
        message_id,
        ticket_id,
        sender_id,
        sender_type,
        message_text
    ) VALUES (
        CONCAT('MSG_', UNIX_TIMESTAMP(), '_', FLOOR(RAND() * 10000)),
        p_ticket_id,
        p_user_id,
        'user',
        p_description
    );
    
    -- Log activity
    INSERT INTO it_ticket_activities (
        ticket_id,
        user_id,
        action_type,
        description
    ) VALUES (
        p_ticket_id,
        p_user_id,
        'ticket_created',
        CONCAT('Ticket created by ', p_user_name)
    );
    
    SELECT ticket_id, title, status, created_at FROM it_tickets WHERE ticket_id = p_ticket_id;
END$$
DELIMITER ;

-- Procedure to add message to ticket
DELIMITER $$
CREATE PROCEDURE add_ticket_message(
    IN p_message_id VARCHAR(50),
    IN p_ticket_id VARCHAR(50),
    IN p_sender_id VARCHAR(50),
    IN p_sender_type ENUM('user', 'admin'),
    IN p_message_text TEXT
)
BEGIN
    INSERT INTO it_ticket_messages (
        message_id,
        ticket_id,
        sender_id,
        sender_type,
        message_text
    ) VALUES (
        p_message_id,
        p_ticket_id,
        p_sender_id,
        p_sender_type,
        p_message_text
    );
    
    -- Update ticket timestamp
    UPDATE it_tickets SET updated_at = CURRENT_TIMESTAMP WHERE ticket_id = p_ticket_id;
    
    -- Mark other messages as read if admin is responding
    IF p_sender_type = 'admin' THEN
        UPDATE it_ticket_messages 
        SET is_read = TRUE 
        WHERE ticket_id = p_ticket_id 
        AND sender_type = 'user';
    END IF;
    
    SELECT message_id, created_at FROM it_ticket_messages WHERE message_id = p_message_id;
END$$
DELIMITER ;

-- Procedure to update ticket status
DELIMITER $$

CREATE PROCEDURE update_ticket_status(
    IN p_ticket_id VARCHAR(50),
    IN p_status VARCHAR(20),           -- Use VARCHAR instead of ENUM
    IN p_admin_id VARCHAR(50),
    IN p_resolution_notes TEXT
)
BEGIN
    DECLARE v_old_status VARCHAR(20);
    DECLARE v_admin_name VARCHAR(255);
    
    -- Validate status
    IF p_status NOT IN ('open','in_progress','resolved','closed') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid status value';
    END IF;

    -- Get old status
    SELECT status INTO v_old_status 
    FROM it_tickets 
    WHERE ticket_id = p_ticket_id;

    -- Get admin name if provided
    IF p_admin_id IS NOT NULL THEN
        SELECT full_name INTO v_admin_name 
        FROM it_admins 
        WHERE admin_id = p_admin_id;
    END IF;

    -- Update ticket
    UPDATE it_tickets
    SET 
        status = p_status,
        assigned_to = IF(p_admin_id IS NOT NULL, v_admin_name, assigned_to),
        resolution_notes = IF(p_resolution_notes IS NOT NULL, p_resolution_notes, resolution_notes),
        resolution_date = IF(p_status = 'resolved', CURRENT_TIMESTAMP, resolution_date),
        updated_at = CURRENT_TIMESTAMP
    WHERE ticket_id = p_ticket_id;

    -- Log activity
    INSERT INTO it_ticket_activities (
        ticket_id,
        admin_id,
        user_id,
        action_type,
        description
    )
    VALUES (
        p_ticket_id,
        p_admin_id,
        (SELECT user_id FROM it_tickets WHERE ticket_id = p_ticket_id),
        'status_changed',
        CONCAT('Status changed from ', v_old_status, ' to ', p_status)
    );

    -- Return updated ticket
    SELECT ticket_id, status, updated_at 
    FROM it_tickets 
    WHERE ticket_id = p_ticket_id;

END$$

DELIMITER ;


-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update ticket activities when status changes
DELIMITER $$
CREATE TRIGGER after_ticket_status_update
AFTER UPDATE ON it_tickets
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO it_ticket_activities (
            ticket_id,
            admin_id,
            user_id,
            action_type,
            description
        ) VALUES (
            NEW.ticket_id,
            NULL,
            NEW.user_id,
            'status_updated',
            CONCAT('Ticket status updated from ', OLD.status, ' to ', NEW.status)
        );
    END IF;
END$$
DELIMITER ;

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

INSERT INTO it_tickets (ticket_id, user_id, user_email, user_name, issue_category, title, description, priority, status) VALUES
('TICK001', 'USER_001', 'john@example.com', 'John Doe', 'website_bug', 'Login button not working', 'The login button on the homepage is not responding when clicked.', 'high', 'open'),
('TICK002', 'USER_002', 'jane@example.com', 'Jane Smith', 'booking_issue', 'Cannot complete hotel booking', 'Payment page shows error when trying to book hotel.', 'critical', 'in_progress'),
('TICK003', 'USER_003', 'bob@example.com', 'Bob Johnson', 'payment_problem', 'Refund not processed', 'Requested refund 5 days ago but still not received.', 'high', 'resolved'),
('TICK004', 'USER_004', 'alice@example.com', 'Alice Brown', 'feature_request', 'Add dark mode feature', 'Please add dark mode for better nighttime browsing.', 'low', 'open'),
('TICK005', 'USER_005', 'charlie@example.com', 'Charlie Wilson', 'technical_error', 'Images not loading', 'Hotel images are not loading on search results page.', 'medium', 'resolved');

INSERT INTO it_ticket_messages (message_id, ticket_id, sender_id, sender_type, message_text) VALUES
('MSG001', 'TICK001', 'USER_001', 'user', 'Login button not working on homepage.'),
('MSG002', 'TICK001', 'ADM001', 'admin', 'We are investigating the login issue.'),
('MSG003', 'TICK002', 'USER_002', 'user', 'Cannot complete hotel booking payment.'),
('MSG004', 'TICK003', 'USER_003', 'user', 'Refund not received yet.'),
('MSG005', 'TICK003', 'ADM002', 'admin', 'Refund has been processed and should reflect in 2-3 business days.');

SELECT '✅ IT Support System Database Setup Complete!' as message;

select*from it_admins


-- Delete all admin records with a WHERE clause
INSERT INTO it_admins (admin_id, username, password_hash, full_name, email, role, is_active)
VALUES
    ('ADM001', 'sliit', SHA2('sliit123', 256), 'SLIIT Admin', 'sliit@lankavacations.com', 'super_admin', TRUE),
    ('ADM002', 'admin', SHA2('admin123', 256), 'System Admin', 'admin@lankavacations.com', 'admin', TRUE)
AS new_admins
ON DUPLICATE KEY UPDATE
    password_hash = new_admins.password_hash,
    full_name = new_admins.full_name,
    email = new_admins.email,
    role = new_admins.role,
    is_active = new_admins.is_active;




select*from it_admins
SET password_hash = SHA2('123456', 256)
WHERE admin_id IN ('ADM001', 'ADM002');


-- Check if reviews table exists and has data
USE lank_vac_SLIIT;
SHOW TABLES LIKE 'reviews';
SELECT COUNT(*) as total_reviews FROM reviews;
SELECT * FROM reviews LIMIT 5;


select*from it_ticket_messages

SELECT * FROM reviews WHERE review_id = 'REV_1770529482203_4bsehcn71';
