/**
 * Test Expert System Locally
 * Run: node backend/test-expert-system.js
 */

const { analyzeQuestionnaire, WEIGHTS } = require('./utils/expertSystem');

// Mock destinations data
const mockDestinations = [
    {
        destination_id: 'dest_001',
        destination_name: 'Yala',
        type: 'wildlife',
        latitude: 6.3724,
        longitude: 81.5207,
        best_visit_start: 'feb',
        best_visit_end: 'jul',
        tags: '["Wildlife", "Safari", "Nature"]'
    },
    {
        destination_id: 'dest_002',
        destination_name: 'Mirissa',
        type: 'beach',
        latitude: 5.9467,
        longitude: 80.4686,
        best_visit_start: 'nov',
        best_visit_end: 'apr',
        tags: '["Beach", "Whale Watching", "Relaxation"]'
    },
    {
        destination_id: 'dest_003',
        destination_name: 'Sigiriya',
        type: 'cultural',
        latitude: 7.9570,
        longitude: 80.7603,
        best_visit_start: 'jan',
        best_visit_end: 'dec',
        tags: '["Cultural", "Historical", "Archaeological"]'
    },
    {
        destination_id: 'dest_004',
        destination_name: 'Ella',
        type: 'adventure',
        latitude: 6.8667,
        longitude: 81.0467,
        best_visit_start: 'jan',
        best_visit_end: 'dec',
        tags: '["Adventure", "Hiking", "Nature"]'
    },
    {
        destination_id: 'dest_005',
        destination_name: 'Kandy',
        type: 'cultural',
        latitude: 7.2906,
        longitude: 80.6337,
        best_visit_start: 'jan',
        best_visit_end: 'dec',
        tags: '["Cultural", "Historical", "Religious"]'
    }
];

// Mock packages data
const mockPackages = [
    {
        package_id: 'pkg_001',
        package_name: 'Wildlife Safari Adventure',
        package_type: 'wildlife',
        duration_days: 7,
        price_per_person_usd: 2500,
        routes: JSON.stringify([
            { day: 1, location: 'Yala' },
            { day: 3, location: 'Udawalawe' },
            { day: 5, location: 'Minneriya' }
        ])
    },
    {
        package_id: 'pkg_002',
        package_name: 'Beach Paradise',
        package_type: 'beach',
        duration_days: 5,
        price_per_person_usd: 1800,
        routes: JSON.stringify([
            { day: 1, location: 'Mirissa' },
            { day: 3, location: 'Unawatuna' }
        ])
    },
    {
        package_id: 'pkg_003',
        package_name: 'Cultural Triangle',
        package_type: 'cultural',
        duration_days: 6,
        price_per_person_usd: 2200,
        routes: JSON.stringify([
            { day: 1, location: 'Sigiriya' },
            { day: 3, location: 'Kandy' },
            { day: 5, location: 'Anuradhapura' }
        ])
    }
];

// Test cases
const testCases = [
    {
        name: 'Family Beach Vacation',
        answers: {
            timing: '3-6 months',
            duration: '7-10 days',
            travelerType: 'Family with kids',
            interests: 'Beaches & Relaxation',
            accommodation: 'Mid-range Hotels',
            budget: '$2,000 - $3,500',
            transportation: 'Yes, private car with driver'
        }
    },
    {
        name: 'Solo Wildlife Adventure',
        answers: {
            timing: '1-3 months',
            duration: '5-7 days',
            travelerType: 'Solo traveler',
            interests: 'Wildlife & Nature',
            accommodation: 'Eco-lodges',
            budget: '$1,000 - $2,000',
            transportation: 'Yes, shared tours'
        }
    },
    {
        name: 'Couple Cultural Tour',
        answers: {
            timing: '6-12 months',
            duration: '7-10 days',
            travelerType: 'Couple',
            interests: 'Cultural & Historical Sites',
            accommodation: 'Boutique Guesthouses',
            budget: '$2,000 - $3,500',
            transportation: 'Yes, private car with driver'
        }
    }
];

console.log('🧪 Testing Expert System\n');
console.log('⚙️  Current Weights:', WEIGHTS, '\n');

testCases.forEach((testCase, index) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log('='.repeat(60));
    console.log('Input:', JSON.stringify(testCase.answers, null, 2));
    
    const startTime = Date.now();
    const result = analyzeQuestionnaire(testCase.answers, mockDestinations, mockPackages);
    const endTime = Date.now();
    
    console.log(`\n⏱️  Execution Time: ${endTime - startTime}ms`);
    console.log(`\n📍 Recommended Cities (${result.recommended_cities.length}):`);
    result.recommended_cities.forEach((city, i) => {
        console.log(`   ${i + 1}. ${city.destination_name} (${city.type}) - Score: ${city.score}`);
    });
    
    console.log(`\n📦 Matching Packages (${result.matching_packages.length}):`);
    result.matching_packages.forEach((pkg, i) => {
        console.log(`   ${i + 1}. ${pkg.package_name} - ${pkg.duration_days} days - $${pkg.price_per_person_usd}`);
    });
    
    console.log(`\n💡 Reasoning: ${result.reasoning}`);
    console.log(`\n📊 Metadata:`, result.metadata);
});

console.log(`\n${'='.repeat(60)}`);
console.log('✅ All tests completed!');
console.log('='.repeat(60));

// Complexity Analysis
console.log('\n📈 Complexity Analysis:');
console.log('   Time Complexity: O(n log n) where n = destinations');
console.log('   Space Complexity: O(n) for scored destinations');
console.log('   Actual Performance: <10ms for typical dataset');
