import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    ChevronRight, ChevronLeft, Check, MapPin, Calendar, Users,
    X, Download, BookOpen, Home, Settings,
    Plane, Hotel, Utensils, Car, DollarSign, UserPlus, CalendarDays,
    Star, Compass, Mountain, Waves, Palette, Camera, Heart,
    FileText, CreditCard, Mail, Phone, Globe, MessageSquare,
    Edit, Mail as MailIcon, Phone as PhoneIcon, HelpCircle, Sparkles
} from "lucide-react";
import DestinationMap from "./DestinationMap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useDataSaver from '@/components/DataSaver'; // or wherever you saved it
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut, Package, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

declare module "jspdf" {
    interface jsPDF {
        autoTable: typeof autoTable;
    }
}

// Interfaces
interface City {
    destination_id: string;
    destination_name: string;
    type: string;
    latitude: number;
    longitude: number;
    best_season_start: string;
    best_season_end: string;
    tags: string[];
    description?: string;
    popularity_score?: number;
    places_to_visit?: string[];
    admin_name?: string;
}

interface Activity {
    activity_id: string;
    activity_name: string;
    type: string;
    description: string;
    duration_hours: number;
    intensity: string;
    price_range: string;
    tags: string[];
    cities: string[];
}

interface Hotel {
    hotel_id: string;
    hotel_name: string;
    destination_id: string;
    type: string;
    address: string;
    latitude: number;
    longitude: number;
    price_per_night_usd: number;
    room_types: string[];
    meal_plans: string[];
    amenities: string[];
    image_urls: string[];
}

interface Package {
    package_id: string;
    package_name: string;
    package_type: string;
    description: string;
    duration_days: number;
    price_per_person_usd: number;
    included_activities: string[];
    accommodation_type: string;
    transport_included: boolean;
    routes: never[];
}

interface Answer {
    question: string;
    answer: unknown;
}

interface Question {
    id: string;
    question: string;
    type: string;
    options?: string[];
    fields?: string[];
    placeholder?: string;
    maxSelect?: number;
    condition?: (answers: Answer[], selectedOptions: Record<string, unknown>) => boolean;
}

interface TravelQuestionnaireProps {
    onClose?: () => void;
    onComplete?: (answers: Answer[]) => void;
}

interface RouteDay {
    day: number;
    location: string;
    title: string;
    description: string;
    activities: Activity[];
    hotel?: Hotel;
    coords: { lat: number; lng: number };
    travelDistance?: number;
}

interface UserDetails {
    fullName: string;
    email: string;
    country: string;
    city: string;
    whatsappNumber: string;
    specialRequirements?: string;
}

interface AIRecommendation {
    destination_id: string;
    destination_name: string;
    type: string;
    latitude: number;
    longitude: number;
    best_season_start: string;
    best_season_end: string;
    tags: string[];
    description?: string;
    popularity_score: number;
    places_to_visit: string[];
    admin_name: string;
}



// Animation variants
const fade = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

const TravelQuestionnaire = ({ onClose, onComplete }: TravelQuestionnaireProps) => {
    const { user, logout } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, unknown>>({});
    const [showItinerary, setShowItinerary] = useState(false);
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [showPaymentButton, setShowPaymentButton] = useState(false);
    const [bookingSubmitted, setBookingSubmitted] = useState(false);
    const [showBeachAdvice, setShowBeachAdvice] = useState(false);
    const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiEnabled, setAiEnabled] = useState(true);
    const { saveQuestionnaireDirect, saveBookingDirect, loading, message } = useDataSaver();


    // AI-generated data states
    const [cities, setCities] = useState<City[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [dataLoading, setDataLoading] = useState(false);
    const [maxCitiesAllowed, setMaxCitiesAllowed] = useState(4);
    const [calculatedDays, setCalculatedDays] = useState<number>(0);
    const [randomPlan, setRandomPlan] = useState<boolean>(false);

    // User details for booking
    const [userDetails, setUserDetails] = useState<UserDetails>({
        fullName: "",
        email: "",
        country: "",
        city: "",
        whatsappNumber: "",
        specialRequirements: ""
    });

    const itineraryRef = useRef<HTMLDivElement>(null);

    // Load data from Flask AI API when questionnaire starts
    useEffect(() => {
        if (showQuestionnaire) {
            loadDataFromAI();
        }
    }, [showQuestionnaire]);

    const loadDataFromAI = async () => {
        try {
            setDataLoading(true);
            console.log('🤖 Loading data from AI API...');

            // Load destinations from Flask AI API
            const destinationsRes = await fetch('http://localhost:5000/api/destinations');

            if (destinationsRes.ok) {
                const destinationsData = await destinationsRes.json();
                console.log('✅ Destinations data loaded:', destinationsData.count, 'destinations');

                if (destinationsData.success && destinationsData.destinations) {
                    const formattedCities = destinationsData.destinations.map((dest: any) => {
                        // Map API fields to your component's expected fields
                        return {
                            destination_id: dest.destination_id || `dest_${dest.city?.toLowerCase().replace(/\s+/g, '_')}`,
                            destination_name: dest.city || '', // API uses 'city'
                            type: dest.primary_category || dest.type || 'general', // API uses 'primary_category'
                            latitude: dest.lat || 6.9271, // API uses 'lat'
                            longitude: dest.lng || 79.8612, // API uses 'lng'
                            best_season_start: dest.best_season?.split('_')[0] || 'jan',
                            best_season_end: dest.best_season?.split('_')[1] || 'dec',
                            tags: dest.categories || [], // API uses 'categories'
                            description: dest.description || `Visit ${dest.city || 'this destination'} for ${dest.primary_category || 'general'} experiences.`,
                            popularity_score: dest.popularity_score || 50,
                            places_to_visit: dest.places_to_visit || [],
                            admin_name: dest.admin_name || ''
                        };
                    });

                    setCities(formattedCities);
                    console.log(`✅ Formatted ${formattedCities.length} cities`);
                    console.log('🏙️ Sample cities:', formattedCities.slice(0, 3));
                }
            } else {
                console.error('❌ Failed to load destinations:', destinationsRes.status);
                createFallbackData();
            }

            setIsDataLoaded(true);
            console.log('✅ AI data loaded successfully');

        } catch (error) {
            console.error('❌ Error loading AI data:', error);
            createFallbackData();
        } finally {
            setDataLoading(false);
        }
    };
    // Add fallback data function
    const createFallbackData = () => {
        // Get top 15 tourist cities from database (extended list)
        const sampleCities = [
            {
                destination_id: 'dest_colombo',
                destination_name: 'Colombo',
                type: 'urban',
                latitude: 6.9271,
                longitude: 79.8612,
                best_season_start: 'dec',
                best_season_end: 'apr',
                tags: ['cultural', 'urban', 'shopping', 'food'],
                description: 'The commercial capital of Sri Lanka',
                popularity_score: 95,
                places_to_visit: ['Gangaramaya Temple', 'Galle Face Green', 'National Museum', 'Pettah Market'],
                admin_name: 'Western Province'
            },
            {
                destination_id: 'dest_kandy',
                destination_name: 'Kandy',
                type: 'cultural',
                latitude: 7.2964,
                longitude: 80.635,
                best_season_start: 'jan',
                best_season_end: 'dec',
                tags: ['cultural', 'historical', 'hill_country', 'temple'],
                description: 'Home to the Temple of the Tooth Relic',
                popularity_score: 90,
                places_to_visit: ['Temple of the Tooth', 'Royal Botanical Gardens', 'Kandy Lake', 'Udawattakele Sanctuary'],
                admin_name: 'Central Province'
            },
            {
                destination_id: 'dest_galle',
                destination_name: 'Galle',
                type: 'cultural',
                latitude: 6.0329,
                longitude: 80.2168,
                best_season_start: 'dec',
                best_season_end: 'apr',
                tags: ['cultural', 'historical', 'beach', 'fort'],
                description: 'Historic Dutch fort and beautiful beaches',
                popularity_score: 88,
                places_to_visit: ['Galle Fort', 'Unawatuna Beach', 'Japanese Peace Pagoda', 'Jungle Beach'],
                admin_name: 'Southern Province'
            },
            {
                destination_id: 'dest_sigiriya',
                destination_name: 'Sigiriya',
                type: 'cultural',
                latitude: 7.9570,
                longitude: 80.7603,
                best_season_start: 'jan',
                best_season_end: 'apr',
                tags: ['cultural', 'historical', 'adventure', 'unesco'],
                description: 'Ancient rock fortress with breathtaking views',
                popularity_score: 92,
                places_to_visit: ['Sigiriya Rock Fortress', 'Pidurangala Rock', 'Sigiriya Museum', 'Minneriya Safari'],
                admin_name: 'Central Province'
            },
            {
                destination_id: 'dest_ella',
                destination_name: 'Ella',
                type: 'adventure',
                latitude: 6.8690,
                longitude: 81.0463,
                best_season_start: 'jan',
                best_season_end: 'apr',
                tags: ['adventure', 'hill_country', 'hiking', 'scenic'],
                description: 'Hill country paradise with amazing hikes',
                popularity_score: 85,
                places_to_visit: ['Ella Rock', 'Little Adams Peak', 'Nine Arch Bridge', 'Ravana Falls'],
                admin_name: 'Uva Province'
            },
            {
                destination_id: 'dest_nuwara_eliya',
                destination_name: 'Nuwara Eliya',
                type: 'hill_country',
                latitude: 6.9497,
                longitude: 80.7890,
                best_season_start: 'jan',
                best_season_end: 'apr',
                tags: ['hill_country', 'tea', 'scenic', 'relaxation'],
                description: 'Tea country with colonial charm',
                popularity_score: 82,
                places_to_visit: ['Gregory Lake', 'Victoria Park', 'Pedro Tea Estate', 'Hakgala Botanical Garden'],
                admin_name: 'Central Province'
            },
            {
                destination_id: 'dest_mirissa',
                destination_name: 'Mirissa',
                type: 'beach',
                latitude: 5.9480,
                longitude: 80.4541,
                best_season_start: 'dec',
                best_season_end: 'apr',
                tags: ['beach', 'adventure', 'wildlife'],
                description: 'Beautiful beach and whale watching destination',
                popularity_score: 86,
                places_to_visit: ['Mirissa Beach', 'Coconut Tree Hill', 'Whale Watching', 'Parrot Rock'],
                admin_name: 'Southern Province'
            },
            {
                destination_id: 'dest_bentota',
                destination_name: 'Bentota',
                type: 'beach',
                latitude: 6.4250,
                longitude: 80.0097,
                best_season_start: 'dec',
                best_season_end: 'apr',
                tags: ['beach', 'relaxation', 'wildlife'],
                description: 'Tropical beach resort with river safaris',
                popularity_score: 84,
                places_to_visit: ['Bentota Beach', 'Madu River Safari', 'Turtle Hatchery', 'Brief Garden'],
                admin_name: 'Southern Province'
            },
            {
                destination_id: 'dest_trincomalee',
                destination_name: 'Trincomalee',
                type: 'beach',
                latitude: 8.5667,
                longitude: 81.2333,
                best_season_start: 'may',
                best_season_end: 'sep',
                tags: ['beach', 'cultural', 'wildlife'],
                description: 'Beautiful east coast beaches and temples',
                popularity_score: 87,
                places_to_visit: ['Nilaveli Beach', 'Koneswaram Temple', 'Pigeon Island', 'Fort Frederick'],
                admin_name: 'Eastern Province'
            },
            {
                destination_id: 'dest_arugam_bay',
                destination_name: 'Arugam Bay',
                type: 'beach',
                latitude: 6.8310,
                longitude: 81.7080,
                best_season_start: 'may',
                best_season_end: 'sep',
                tags: ['beach', 'adventure', 'surfing'],
                description: 'World-class surfing destination',
                popularity_score: 84,
                places_to_visit: ['Arugam Bay Beach', 'Surfing', 'Muhudu Maha Vihara', 'Elephant Rock'],
                admin_name: 'Eastern Province'
            },
            {
                destination_id: 'dest_yala',
                destination_name: 'Yala National Park',
                type: 'wildlife',
                latitude: 6.4145,
                longitude: 80.2397,
                best_season_start: 'dec',
                best_season_end: 'apr',
                tags: ['wildlife', 'adventure', 'safari'],
                description: 'Best wildlife park for leopard sightings',
                popularity_score: 89,
                places_to_visit: ['Yala Safari', 'Leopard Spotting', 'Bird Watching', 'Beaches'],
                admin_name: 'Southern Province'
            },
            {
                destination_id: 'dest_wilpattu',
                destination_name: 'Wilpattu National Park',
                type: 'wildlife',
                latitude: 8.3561,
                longitude: 79.9951,
                best_season_start: 'dec',
                best_season_end: 'apr',
                tags: ['wildlife', 'safari', 'adventure'],
                description: 'Largest national park in Sri Lanka',
                popularity_score: 76,
                places_to_visit: ['Leopard Safaris', 'Villus (Natural Lakes)', 'Ancient Ruins'],
                admin_name: 'North Western Province'
            },
            {
                destination_id: 'dest_dambulla',
                destination_name: 'Dambulla',
                type: 'cultural',
                latitude: 7.8560,
                longitude: 80.6510,
                best_season_start: 'jan',
                best_season_end: 'apr',
                tags: ['cultural', 'historical', 'temple'],
                description: 'Famous cave temple complex',
                popularity_score: 78,
                places_to_visit: ['Dambulla Cave Temple', 'Golden Temple', 'Buddha Statues', 'Iron Wood Forest'],
                admin_name: 'Central Province'
            },
            {
                destination_id: 'dest_negombo',
                destination_name: 'Negombo',
                type: 'beach',
                latitude: 7.2111,
                longitude: 79.8386,
                best_season_start: 'dec',
                best_season_end: 'apr',
                tags: ['beach', 'cultural', 'fishing'],
                description: 'Fishing town near Colombo airport',
                popularity_score: 75,
                places_to_visit: ['Negombo Beach', 'Fish Market', 'Dutch Canal', 'St. Mary\'s Church'],
                admin_name: 'Western Province'
            },
            {
                destination_id: 'dest_anuradhapura',
                destination_name: 'Anuradhapura',
                type: 'cultural',
                latitude: 8.3350,
                longitude: 80.4100,
                best_season_start: 'jan',
                best_season_end: 'apr',
                tags: ['cultural', 'historical', 'ancient'],
                description: 'Ancient capital with sacred Buddhist sites',
                popularity_score: 81,
                places_to_visit: ['Sri Maha Bodhi', 'Ruwanwelisaya', 'Jetavanaramaya', 'Abhayagiri Monastery'],
                admin_name: 'North Central Province'
            },
            {
                destination_id: 'dest_polonnaruwa',
                destination_name: 'Polonnaruwa',
                type: 'cultural',
                latitude: 7.9400,
                longitude: 81.0000,
                best_season_start: 'jan',
                best_season_end: 'apr',
                tags: ['cultural', 'historical', 'ancient'],
                description: 'Medieval capital with ancient ruins',
                popularity_score: 79,
                places_to_visit: ['Gal Vihara', 'Polonnaruwa Vatadage', 'Royal Palace', 'Lotus Pond'],
                admin_name: 'North Central Province'
            }
        ];

        setCities(sampleCities);
        setIsDataLoaded(true);
        console.log('✅ Fallback data loaded with 16 main tourist cities');
    };

    // Helper function to convert travel timing to month
    const getTravelMonth = (travelTiming: string): number => {
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-12

        if (!travelTiming) return currentMonth;

        if (travelTiming.includes("Within the next month")) {
            return currentMonth + 1 > 12 ? 1 : currentMonth + 1;
        }
        if (travelTiming.includes("1-3 months")) {
            return (currentMonth + 2) % 12 || 12;
        }
        if (travelTiming.includes("3-6 months")) {
            return (currentMonth + 4) % 12 || 12;
        }
        if (travelTiming.includes("6-12 months")) {
            return (currentMonth + 9) % 12 || 12;
        }
        return currentMonth; // For "Just exploring options"
    };

    // Main AI recommendations function
    const getAIRecommendations = async (userProfile?: any): Promise<AIRecommendation[]> => {
        try {
            const profile = userProfile || {
                interests: selectedOptions.interests || [],
                travel_timing: selectedOptions.travel_timing,
                traveler_type: selectedOptions.traveler_type,
                budget: selectedOptions.budget,
                travel_duration_range: selectedOptions.travel_duration_range,
                exact_days: calculatedDays
            };

            console.log('🤖 Getting AI recommendations for:', profile);

            const response = await fetch('http://localhost:5000/api/ai-recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    interests: profile.interests || [],
                    travel_month: getTravelMonth(profile.travel_timing),
                    traveler_type: profile.traveler_type || 'solo',
                    budget: profile.budget || '$1,000 - $2,000',
                    days: profile.exact_days || 7,
                    top_n: 12
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ AI Recommendations received:', data);
                console.log('   Is real AI?', data.is_real_ai);
                console.log('   Count:', data.recommendations?.length || 0);

                if (data.recommendations && data.recommendations.length > 0) {
                    console.log('🏆 Top recommendations:');
                    data.recommendations.slice(0, 5).forEach((rec: any, i: number) => {
                        console.log(`   ${i+1}. ${rec.destination_name} - Score: ${rec.ai_score}, Type: ${rec.type}`);
                    });
                }

                // Map API response
                const mappedRecommendations = (data.recommendations || []).map((rec: any): AIRecommendation => ({
                    destination_id: rec.destination_id,
                    destination_name: rec.destination_name || rec.city || '',
                    type: rec.type || rec.primary_category || 'general',
                    latitude: rec.latitude || rec.lat || 6.9271,
                    longitude: rec.longitude || rec.lng || 79.8612,
                    best_season_start: rec.best_season_start || (rec.best_season?.split('_')[0]) || 'jan',
                    best_season_end: rec.best_season_end || (rec.best_season?.split('_')[1]) || 'dec',
                    tags: rec.tags || rec.categories || [],
                    description: rec.description || `Visit ${rec.destination_name || rec.city || 'this destination'}`,
                    popularity_score: rec.popularity_score || 50,
                    places_to_visit: rec.places_to_visit || [],
                    admin_name: rec.admin_name || ''
                }));

                return mappedRecommendations;
            } else {
                console.error('❌ Failed to get AI recommendations');
                const errorText = await response.text();
                console.error('Error response:', errorText);
                return [];
            }
        } catch (error) {
            console.error('❌ Error getting AI recommendations:', error);
            return [];
        }
    };

    // Questions array
    const questions: Question[] = [
        {
            id: 'travel_timing',
            question: "When are you planning to visit Sri Lanka?",
            type: 'select',
            options: [
                "Within the next month",
                "1-3 months",
                "3-6 months",
                "6-12 months",
                "Just exploring options"
            ]
        },
        {
            id: 'travel_duration_range',
            question: "How long do you plan to stay?",
            type: 'select',
            options: [
                "3-5 days",
                "5-7 days",
                "7-10 days",
                "10-14 days",
                "More than 2 weeks"
            ]
        },
        {
            id: 'budget',
            question: "What's your budget per person?",
            type: 'select',
            options: [
                "Under $1,000",
                "$1,000 - $2,000",
                "$2,000 - $3,500",
                "$3,500 - $5,000",
                "Above $5,000"
            ]
        },
        {
            id: 'traveler_type',
            question: "What type of traveler are you?",
            type: 'select',
            options: [
                "Solo traveler",
                "Couple",
                "Family with kids",
                "Group of friends",
                "Business traveler"
            ]
        },
        {
            id: 'accommodation_type',
            question: "What type of accommodation do you prefer?",
            type: 'select',
            options: [
                "Economic",
                "Boutique Villas",
                "3 Star (Standard)",
                "4 Star (Superior)",
                "5 Star (Deluxe)",
                "Luxury Boutique Villas"
            ]
        },
        {
            id: 'traveler_composition',
            question: "Number of travelers",
            type: 'people',
            fields: ['adults', 'children']
        },
        {
            id: 'room_type',
            question: "What room type do you prefer?",
            type: 'select',
            options: ["Single", "Double", "Triple", "Family", "Suite"]
        },
        {
            id: 'meal_plan',
            question: "What meal plan do you prefer?",
            type: 'select',
            options: [
                "Breakfast only",
                "Lunch only",
                "Dinner only",
                "2 meals (Breakfast & Dinner)",
                "All 3 meals"
            ]
        },
        {
            id: 'interests',
            question: "What interests you most?",
            type: 'interests-mixed',
            options: [
                "Beaches & Relaxation",
                "Wildlife & Nature",
                "Cultural & Historical Sites",
                "Adventure & Sports",
                "Food & Local Experiences",
                "Shopping & Markets",
                "Photography",
                "Yoga & Wellness",
                "Romantic Getaway",
                "Family Activities"
            ]
        },
        {
            id: 'preferred_cities',
            question: "Which cities would you like to visit?",
            type: 'city-select',
            maxSelect: 12
        },
        {
            id: 'starting_point',
            question: "From where should we start your journey?",
            type: 'starting-point'
        },
        {
            id: 'transportation',
            question: "Do you need transportation services?",
            type: 'select',
            options: [
                "Yes, private car with driver",
                "Yes, shared tours",
                "Yes, airport transfers only",
                "No, I'll arrange my own",
                "Not sure yet"
            ]
        }
    ];

    // Calculate max cities based on days
    const calculateMaxCities = (days: number): number => {
        console.log(`📅 Calculating max cities for ${days} days`);
        if (days <= 3) return 1;
        if (days <= 5) return 2;
        if (days <= 7) return 3;
        if (days <= 10) return 4;
        if (days <= 14) return 6;
        return Math.min(days - 3, 12);
    };

    // Haversine formula to calculate distance between two coordinates
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Get matching hotel from AI data
    const getMatchingHotel = (cityName: string, accommodationType: string): Hotel | undefined => {
        const typeMap: Record<string, string[]> = {
            'Economic': ['economic'],
            'Boutique Villas': ['boutique_villa', 'luxury_boutique_villa'],
            '3 Star (Standard)': ['3_star_standard'],
            '4 Star (Superior)': ['4_star_superior'],
            '5 Star (Deluxe)': ['5_star_deluxe'],
            'Luxury Boutique Villas': ['luxury_boutique_villa']
        };

        const preferredTypes = typeMap[accommodationType] || ['3_star_standard'];

        return hotels.find(hotel => {
            const hotelCity = cities.find(c => c.destination_id === hotel.destination_id);
            return hotelCity?.destination_name === cityName && preferredTypes.includes(hotel.type);
        });
    };

    // Get matching activities from AI data
    const getMatchingActivities = (cityName: string, userInterests: string[]): Activity[] => {
        const cityActivities = activities.filter(activity =>
            activity.cities?.some(city =>
                city.toLowerCase().includes(cityName.toLowerCase())
            )
        );

        if (userInterests.length === 0) return cityActivities.slice(0, 3);

        // Score activities based on interest match
        const scoredActivities = cityActivities.map(activity => {
            let score = 0;
            userInterests.forEach(interest => {
                const interestLower = interest.toLowerCase();
                if (activity.tags?.some(tag => tag.toLowerCase().includes(interestLower))) {
                    score += 2;
                }
                if (activity.type?.toLowerCase().includes(interestLower)) {
                    score += 1;
                }
                if (activity.description?.toLowerCase().includes(interestLower)) {
                    score += 0.5;
                }
            });
            return { activity, score };
        });

        // Sort by score and return top 3
        return scoredActivities
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(item => item.activity);
    };

    // FLEXIBLE ITINERARY GENERATOR (NO FREE DAYS VERSION)
    const generateFlexibleItinerary = (): RouteDay[] => {
        if (cities.length === 0 && aiRecommendations.length === 0) return [];

        const userInterests = (selectedOptions.interests as string[]) || [];
        const selectedCities = (selectedOptions.preferred_cities as string[]) || [];
        const accommodationType = (selectedOptions.accommodation_type as string) || "3 Star (Standard)";

        // Use calculatedDays from questionnaire
        const days = calculatedDays || 7;
        const maxCities = Math.min(calculateMaxCities(days), days); // Don't exceed total days

        console.log("📊 Flexible Itinerary Generation:", {
            days,
            maxCities,
            selectedCities: selectedCities.length,
            userInterests,
            randomPlan,
            aiRecommendations: aiRecommendations.length,
            allCities: cities.length
        });

        // FILTER CITIES BASED ON USER INTERESTS
        let availableCities = [...cities];

        // Only apply interest filtering if user has selected interests
        if (userInterests.length > 0) {
            console.log('🎯 Filtering cities based on interests:', userInterests);

            availableCities = availableCities.filter(city => {
                const cityTags = city.tags.map(tag => tag.toLowerCase());
                const cityType = city.type.toLowerCase();

                // Check each user interest
                for (const interest of userInterests) {
                    const interestLower = interest.toLowerCase();

                    // CULTURE/HISTORY INTEREST MAPPING
                    if (interestLower.includes('cultural') ||
                        interestLower.includes('historical') ||
                        interestLower.includes('history') ||
                        interestLower.includes('heritage')) {

                        // Check if city has cultural/historical tags or type
                        const isCultural = cityTags.some(tag =>
                            tag.includes('cultural') ||
                            tag.includes('historical') ||
                            tag.includes('heritage') ||
                            tag.includes('temple') ||
                            tag.includes('fort') ||
                            tag.includes('unesco') ||
                            tag.includes('ancient')
                        ) || cityType.includes('cultural');

                        if (isCultural) {
                            console.log(`   ✅ ${city.destination_name} matches cultural interest`);
                            return true;
                        }
                    }

                    // BEACH INTEREST MAPPING
                    if (interestLower.includes('beach') || interestLower.includes('relaxation')) {
                        const isBeach = cityTags.some(tag =>
                            tag.includes('beach') ||
                            tag.includes('coast') ||
                            tag.includes('sea') ||
                            tag.includes('shore')
                        ) || cityType.includes('beach');

                        if (isBeach) return true;
                    }

                    // WILDLIFE INTEREST MAPPING
                    if (interestLower.includes('wildlife') || interestLower.includes('nature')) {
                        const isWildlife = cityTags.some(tag =>
                            tag.includes('wildlife') ||
                            tag.includes('nature') ||
                            tag.includes('safari') ||
                            tag.includes('park') ||
                            tag.includes('forest')
                        ) || cityType.includes('wildlife');

                        if (isWildlife) return true;
                    }

                    // ADVENTURE INTEREST MAPPING
                    if (interestLower.includes('adventure') || interestLower.includes('sports')) {
                        const isAdventure = cityTags.some(tag =>
                            tag.includes('adventure') ||
                            tag.includes('hiking') ||
                            tag.includes('trek') ||
                            tag.includes('sport')
                        ) || cityType.includes('adventure');

                        if (isAdventure) return true;
                    }
                }

                // If no specific interests match, check if city matches general preferences
                if (randomPlan && city.popularity_score > 70) {
                    return true; // Include popular cities in random plans
                }

                return false;
            });

            console.log(`📍 Filtered to ${availableCities.length} cities matching interests`);
        }

        // Use AI recommendations if available
        if (randomPlan && aiRecommendations.length > 0) {
            console.log('🎯 Using AI recommendations for random plan');
            const aiCities = aiRecommendations.map(rec => ({
                destination_id: rec.destination_id,
                destination_name: rec.destination_name,
                type: rec.type,
                latitude: rec.latitude,
                longitude: rec.longitude,
                best_season_start: rec.best_season_start,
                best_season_end: rec.best_season_end,
                tags: rec.tags,
                description: rec.description || `AI-recommended ${rec.type} destination`,
                popularity_score: rec.popularity_score
            }));

            // Merge AI recommendations with filtered cities
            const mergedCities = [...aiCities];
            for (const city of availableCities) {
                if (!mergedCities.some(ai => ai.destination_name === city.destination_name)) {
                    mergedCities.push(city);
                }
            }
            availableCities = mergedCities;
        }

        console.log(`📍 Available cities after filtering: ${availableCities.length}`);

        // Get starting city
        let startingCity: City;
        if (selectedOptions.starting_point === 'Airport (Katunayake)') {
            startingCity = availableCities.find(city => city.destination_name === 'Colombo') || availableCities[0];
        } else {
            startingCity = availableCities.find(city =>
                city.destination_name === (selectedOptions.starting_point as string)
            ) || availableCities[0];
        }

        const itinerary: RouteDay[] = [];

        // PRIORITIZE CULTURAL DESTINATIONS IF THAT'S THE MAIN INTEREST
        if (userInterests.some(i => i.toLowerCase().includes('cultural'))) {
            console.log('🎭 Cultural interest detected - prioritizing cultural destinations');

            // Sort available cities by cultural relevance
            availableCities.sort((a, b) => {
                const aIsCultural = a.tags.some(tag =>
                    tag.toLowerCase().includes('cultural') ||
                    tag.toLowerCase().includes('historical')
                ) ? 2 : (a.type === 'cultural' ? 1 : 0);

                const bIsCultural = b.tags.some(tag =>
                    tag.toLowerCase().includes('cultural') ||
                    tag.toLowerCase().includes('historical')
                ) ? 2 : (b.type === 'cultural' ? 1 : 0);

                return bIsCultural - aIsCultural;
            });
        }

        // Lock selected cities if not random plan
        const lockedCities: City[] = [];
        if (!randomPlan && selectedCities.length > 0) {
            selectedCities.forEach(cityName => {
                const city = availableCities.find(c => c.destination_name === cityName);
                if (city) {
                    lockedCities.push(city);
                }
            });
        }

        // Build cities list - FLEXIBLE LOGIC
        let selectedCitiesList: City[] = [...lockedCities];

        // If random plan or not enough cities selected, add based on interests
        if (randomPlan || selectedCitiesList.length < maxCities) {
            // Remove already selected cities
            const remainingCities = availableCities.filter(city =>
                !selectedCitiesList.some(selected => selected.destination_name === city.destination_name) &&
                city.destination_name !== startingCity?.destination_name
            );

            // Add cities based on available days
            const citiesToAdd = Math.min(remainingCities.length, maxCities - selectedCitiesList.length);

            // Select top cultural cities if that's the interest
            if (userInterests.some(i => i.toLowerCase().includes('cultural'))) {
                const culturalCities = remainingCities.filter(city =>
                    city.type === 'cultural' ||
                    city.tags.some(tag => tag.toLowerCase().includes('cultural'))
                );

                // Add cultural cities first
                const culturalToAdd = Math.min(culturalCities.length, Math.ceil(citiesToAdd * 0.7));
                selectedCitiesList = [...selectedCitiesList, ...culturalCities.slice(0, culturalToAdd)];

                // Add remaining spots with other types
                const remainingSpots = citiesToAdd - culturalToAdd;
                if (remainingSpots > 0) {
                    const otherCities = remainingCities.filter(city =>
                        !culturalCities.includes(city)
                    );
                    selectedCitiesList = [...selectedCitiesList, ...otherCities.slice(0, remainingSpots)];
                }
            } else {
                // Add based on popularity and diversity
                selectedCitiesList = [...selectedCitiesList, ...remainingCities.slice(0, citiesToAdd)];
            }
        }

        console.log(`📍 Selected cities: ${selectedCitiesList.map(c => c.destination_name).join(', ')} (${selectedCitiesList.length}/${maxCities})`);

        // Add arrival day
        if (startingCity) {
            itinerary.push({
                day: 1,
                location: startingCity.destination_name,
                title: `Arrival in ${startingCity.destination_name}`,
                description: startingCity.description || `Begin your journey in ${startingCity.destination_name}. Check into your hotel and explore the local area.`,
                activities: getMatchingActivities(startingCity.destination_name, userInterests),
                hotel: getMatchingHotel(startingCity.destination_name, accommodationType),
                coords: { lat: startingCity.latitude, lng: startingCity.longitude }
            });
        }

        // Now create itinerary with exact number of days - NO FREE DAYS
        // Use route optimization to find best order
        let remainingCities = [...selectedCitiesList];
        let dayCounter = 2; // Start from day 2 (day 1 is arrival)
        let lastCoords = startingCity ? { lat: startingCity.latitude, lng: startingCity.longitude } : { lat: 6.9271, lng: 79.8612 };

        // Calculate how many days we can allocate per city
        const totalCitiesToVisit = remainingCities.length;
        const daysRemaining = days - 1; // Minus arrival day

        if (totalCitiesToVisit === 0) {
            console.log("⚠️ No cities selected to visit!");
            return itinerary;
        }

        // Distribute days evenly among cities
        const baseDaysPerCity = Math.max(1, Math.floor(daysRemaining / totalCitiesToVisit));
        const extraDaysToDistribute = daysRemaining - (baseDaysPerCity * totalCitiesToVisit);

        console.log(`📅 Day allocation: ${daysRemaining} days for ${totalCitiesToVisit} cities = ${baseDaysPerCity} days/city + ${extraDaysToDistribute} extra days`);

        // Sort cities by nearest first (travel optimization)
        const sortedCitiesByRoute = [];
        let currentCoords = lastCoords;
        let citiesToSort = [...remainingCities];

        while (citiesToSort.length > 0) {
            // Find nearest city
            const nearestCity = citiesToSort.reduce((nearest, city) => {
                const distanceToNearest = calculateDistance(
                    currentCoords.lat,
                    currentCoords.lng,
                    nearest.latitude,
                    nearest.longitude
                );
                const distanceToCity = calculateDistance(
                    currentCoords.lat,
                    currentCoords.lng,
                    city.latitude,
                    city.longitude
                );
                return distanceToCity < distanceToNearest ? city : nearest;
            }, citiesToSort[0]);

            sortedCitiesByRoute.push(nearestCity);
            currentCoords = { lat: nearestCity.latitude, lng: nearestCity.longitude };
            citiesToSort = citiesToSort.filter(city => city !== nearestCity);
        }

        // Create itinerary with optimized route and proper day allocation
        remainingCities = sortedCitiesByRoute;
        currentCoords = lastCoords;

        for (let i = 0; i < remainingCities.length; i++) {
            const city = remainingCities[i];
            if (dayCounter > days) break;

            // Calculate days for this city (give extra days to first few cities)
            const daysForThisCity = baseDaysPerCity + (i < extraDaysToDistribute ? 1 : 0);

            for (let dayInCity = 0; dayInCity < daysForThisCity; dayInCity++) {
                if (dayCounter > days) break;

                const isFirstDayInCity = dayInCity === 0;
                const travelDistance = isFirstDayInCity ? calculateDistance(
                    currentCoords.lat,
                    currentCoords.lng,
                    city.latitude,
                    city.longitude
                ) : undefined;

                itinerary.push({
                    day: dayCounter,
                    location: city.destination_name,
                    title: isFirstDayInCity ? `Explore ${city.destination_name}` : `Continue Exploring ${city.destination_name}`,
                    description: isFirstDayInCity
                        ? getCulturalDescription(city, userInterests)
                        : `Another day to enjoy ${city.destination_name}. Explore more of what this destination has to offer.`,
                    activities: getMatchingActivities(city.destination_name, userInterests),
                    hotel: getMatchingHotel(city.destination_name, accommodationType),
                    coords: { lat: city.latitude, lng: city.longitude },
                    travelDistance
                });

                dayCounter++;
            }

            // Update current coordinates for next travel calculation
            currentCoords = { lat: city.latitude, lng: city.longitude };
        }

        // If we still have days left (shouldn't happen with proper calculation), just stop
        if (dayCounter <= days) {
            console.log(`⚠️ WARNING: ${days - dayCounter + 1} unused days - this shouldn't happen with no-free-days logic`);
        }

        // LOG THE ITINERARY FOR DEBUGGING
        console.log('🎯 FINAL ITINERARY (Days:', itinerary.length, 'requested:', days, ')');
        itinerary.forEach(day => {
            console.log(`  Day ${day.day}: ${day.location} - ${day.description.substring(0, 50)}...`);
        });

        return itinerary;
    };

// Add this helper function for better descriptions
    const getCulturalDescription = (city: City, userInterests: string[]): string => {
        if (userInterests.some(i => i.toLowerCase().includes('cultural'))) {
            const culturalTags = city.tags.filter(tag =>
                tag.toLowerCase().includes('cultural') ||
                tag.toLowerCase().includes('historical') ||
                tag.toLowerCase().includes('heritage') ||
                tag.toLowerCase().includes('temple') ||
                tag.toLowerCase().includes('fort') ||
                tag.toLowerCase().includes('ancient')
            );

            if (culturalTags.length > 0) {
                return `Explore the rich cultural heritage of ${city.destination_name}, known for ${culturalTags.join(', ')}.`;
            }
        }

        return city.description || `Experience the ${city.type.replace('_', ' ')} of ${city.destination_name}.`;
    };
    // Event handlers
    const handleNext = () => {

        const currentQuestion = questions[currentStep];

        if (validateStep(currentStep)) {
            const newAnswers = [...answers];
            const currentValue = selectedOptions[currentQuestion.id];
            let answerValue: unknown;

            switch (currentQuestion.type) {
                case 'people':
                    answerValue = {
                        adults: (selectedOptions.adults as number) || 1,
                        children: (selectedOptions.children as number) || 0
                    };
                    break;
                case 'interests-mixed':
                    answerValue = (selectedOptions[currentQuestion.id] as string[]) || [];
                    break;
                case 'city-select':
                    answerValue = (selectedOptions[currentQuestion.id] as string[]) || [];
                    break;
                default:
                    answerValue = currentValue as string;
            }

            newAnswers[currentStep] = {
                question: currentQuestion.question,
                answer: answerValue
            };

            setAnswers(newAnswers);

            // Check for beach interest
            if (currentQuestion.id === 'interests' && (selectedOptions.interests as string[])?.includes("Beaches & Relaxation")) {
                setShowBeachAdvice(true);
            }

            // Update max cities if duration question
            if (currentQuestion.id === 'travel_duration_range' && selectedOptions.travel_duration_range) {
                const durationMap: Record<string, number> = {
                    "3-5 days": 4,
                    "5-7 days": 6,
                    "7-10 days": 8,
                    "10-14 days": 12,
                    "More than 2 weeks": 16
                };
                const days = durationMap[selectedOptions.travel_duration_range as string] || 7;
                setCalculatedDays(days);
                setMaxCitiesAllowed(calculateMaxCities(days));
                console.log(`📅 Updated days: ${days}, max cities: ${calculateMaxCities(days)}`);
            }

            if (currentStep < questions.length - 1) {
                setCurrentStep(currentStep + 1);
            } else {
                handleSubmit();
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Save questionnaire and get AI recommendations
    const handleSubmit = async () => {
        try {
            const sessionId = `session_${Date.now()}`;
            const userProfile = {
                session_id: sessionId,
                full_name: userDetails.fullName || '',
                email: userDetails.email || '',
                phone: userDetails.whatsappNumber || '',
                country: userDetails.country || '',
                city: userDetails.city || '',
                whatsapp_number: userDetails.whatsappNumber || '',
                travel_timing: selectedOptions.travel_timing as string || 'Just exploring options',
                travel_duration_range: selectedOptions.travel_duration_range as string || '5-7 days',
                budget: selectedOptions.budget as string || '$1,000 - $2,000',
                traveler_type: selectedOptions.traveler_type as string || 'Solo traveler',
                accommodation_type: selectedOptions.accommodation_type as string || '3 Star (Standard)',
                traveler_composition: {
                    adults: (selectedOptions.adults as number) || 1,
                    children: (selectedOptions.children as number) || 0
                },
                num_travelers: ((selectedOptions.adults as number) || 1) + ((selectedOptions.children as number) || 0),
                room_type_preference: selectedOptions.room_type as string || 'Double',
                meal_plan_preference: selectedOptions.meal_plan as string || 'Breakfast only',
                interests: (selectedOptions.interests as string[]) || [],
                preferred_destinations: randomPlan ? [] : ((selectedOptions.preferred_cities as string[]) || []),
                starting_point: selectedOptions.starting_point as string || 'Airport (Katunayake)',
                transport_preference: selectedOptions.transportation as string || 'Yes, private car with driver',
                exact_days: calculatedDays || 7,
                random_plan_selected: randomPlan,
                ai_enabled: aiEnabled,
                special_requirements: userDetails.specialRequirements || ''
            };

            console.log('📝 Saving questionnaire via DataSaver:', userProfile);

            // Get AI recommendations first (optional)
            if (aiEnabled && (randomPlan || (selectedOptions.interests as string[])?.length > 0)) {
                console.log('🎯 Fetching AI recommendations...');
                const recommendations = await getAIRecommendations(userProfile);
                setAiRecommendations(recommendations);
                console.log('🤖 AI Recommendations set:', recommendations.length);
            }

            // Save using DataSaver (now uses Flask API)
            const saveResult = await saveQuestionnaireDirect(userProfile);

            if (saveResult.success) {
                console.log('✅ Questionnaire saved via Flask API:', saveResult);

                // Save to localStorage for backup
                localStorage.setItem('travelQuestionnaire', JSON.stringify({
                    sessionId,
                    answers,
                    selectedOptions,
                    userDetails,
                    aiRecommendations,
                    timestamp: new Date().toISOString(),
                    responseId: saveResult.response_id
                }));

                if (onComplete) onComplete(answers);
            } else {
                console.error('❌ Failed to save questionnaire:', saveResult.error);
                // Still proceed but with warning
                localStorage.setItem('travelQuestionnaire', JSON.stringify({
                    sessionId,
                    answers,
                    selectedOptions,
                    userDetails,
                    aiRecommendations,
                    timestamp: new Date().toISOString(),
                    responseId: `temp_${sessionId}`
                }));

                if (onComplete) onComplete(answers);
            }
        } catch (error) {
            console.error('❌ Error in handleSubmit:', error);
            // Still set step to complete even on error
            setCurrentStep(questions.length);
        } finally {
            setCurrentStep(questions.length);
        }
    };


    const validateStep = (step: number): boolean => {
        const question = questions[step];
        const value = selectedOptions[question.id];

        switch (question.type) {
            case 'select':
            case 'interests-mixed':
                return !!value;
            case 'people':
                return ((selectedOptions.adults as number) || 0) >= 1;
            case 'city-select':
                if (randomPlan) return true;
                const selectedCities = (selectedOptions.preferred_cities as string[]) || [];
                return selectedCities.length > 0 && selectedCities.length <= maxCitiesAllowed;
            default:
                return true;
        }
    };

    const handleOptionSelect = (key: string, value: string | string[] | Record<string, unknown> | number) => {
        setSelectedOptions(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // REPLACE the existing handleBookingSubmit with:
    const handleBookingSubmit = async () => {
        try {
            const itinerary = generateFlexibleItinerary();

            // Get the response ID from localStorage or generate new
            const savedQuestionnaire = localStorage.getItem('travelQuestionnaire');
            let questionnaireResponseId = '';

            if (savedQuestionnaire) {
                const parsed = JSON.parse(savedQuestionnaire);
                questionnaireResponseId = parsed.responseId || `resp_${Date.now()}`;
            } else {
                questionnaireResponseId = `resp_${Date.now()}`;
            }

            // Prepare booking data for DataSaver
            const bookingData = {
                full_name: userDetails.fullName,
                email: userDetails.email,
                phone: userDetails.whatsappNumber,
                country: userDetails.country,
                city: userDetails.city,
                whatsapp_number: userDetails.whatsappNumber,
                emergency_contact: userDetails.whatsappNumber,
                special_requirements: userDetails.specialRequirements || '',
                total_booking_amount: 0, // Will be calculated by server
                booking_status: 'pending',
                itinerary_data: {
                    itinerary,
                    questionnaire_answers: answers,
                    selected_options: selectedOptions,
                    ai_recommendations: aiRecommendations
                },
                questionnaire_data: {
                    travel_timing: selectedOptions.travel_timing as string,
                    travel_duration_range: selectedOptions.travel_duration_range as string,
                    budget: selectedOptions.budget as string,
                    traveler_type: selectedOptions.traveler_type as string,
                    accommodation_type: selectedOptions.accommodation_type as string,
                    traveler_composition: {
                        adults: (selectedOptions.adults as number) || 1,
                        children: (selectedOptions.children as number) || 0
                    },
                    num_travelers: ((selectedOptions.adults as number) || 1) + ((selectedOptions.children as number) || 0),
                    room_type_preference: selectedOptions.room_type as string,
                    meal_plan_preference: selectedOptions.meal_plan as string,
                    interests: (selectedOptions.interests as string[]) || [],
                    preferred_destinations: randomPlan ? [] : ((selectedOptions.preferred_cities as string[]) || []),
                    starting_point: selectedOptions.starting_point as string,
                    transport_preference: selectedOptions.transportation as string,
                    exact_days: calculatedDays || 7,
                    random_plan_selected: randomPlan,
                    ai_enabled: aiEnabled
                },
                questionnaire_response_id: questionnaireResponseId
            };

            console.log('📤 Saving booking via DataSaver:', bookingData);

            // Save using DataSaver (now uses Flask API)
            const saveResult = await saveBookingDirect(bookingData);

            if (saveResult.success) {
                console.log('✅ Booking saved via Flask API:', saveResult);
                setBookingSubmitted(true);
                setShowPaymentButton(true);
                setShowBookingForm(false);

                // Store booking ID in localStorage
                localStorage.setItem('lastBookingId', saveResult.booking_id || '');

                alert('Booking submitted successfully! Our team will contact you within 24 hours.');
            } else {
                console.error('Booking save failed:', saveResult.error);
                // Still show success to user but with warning
                setBookingSubmitted(true);
                setShowPaymentButton(true);
                setShowBookingForm(false);

                alert('Booking request received! (Note: There was a minor issue saving to database, but our team will still contact you)');
            }
        } catch (error: any) {
            console.error('Error submitting booking:', error);
            // Fallback - still show success to user
            setBookingSubmitted(true);
            setShowPaymentButton(true);
            setShowBookingForm(false);

            alert('Booking request received! We will contact you shortly.');
        }
    };


    const handleCitySelect = (cityName: string) => {
        const currentCities = (selectedOptions.preferred_cities as string[]) || [];

        if (cityName === "I don't know the cities") {
            setRandomPlan(true);
            handleOptionSelect('preferred_cities', ["I don't know the cities"]);
        } else {
            setRandomPlan(false);
            if (currentCities.includes(cityName)) {
                handleOptionSelect('preferred_cities', currentCities.filter(city => city !== cityName));
            } else if (currentCities.length < maxCitiesAllowed) {
                handleOptionSelect('preferred_cities', [...currentCities, cityName]);
            }
        }
    };

    // Generate PDF
    const generatePDF = () => {
        try {
            const itinerary = generateFlexibleItinerary();
            const doc = new jsPDF('p', 'mm', 'a4');

            // Add autoTable plugin
            (doc as any).autoTable = autoTable;

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Company Header
            doc.setFillColor(45, 95, 77);
            doc.rect(0, 0, pageWidth, 30, 'F');

            doc.setFontSize(28);
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.text("LANKA VACATION", pageWidth / 2, 18, { align: 'center' });

            doc.setFontSize(12);
            doc.setTextColor(249, 122, 31);
            doc.text("AI-Powered Travel Itinerary", pageWidth / 2, 25, { align: 'center' });

            // Contact Info
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text("clientservice@lanka-vacations.com", 20, 38);
            doc.text("+94777325515 | +94112577285", pageWidth - 20, 38, { align: 'right' });

            // User Details Section
            doc.setFontSize(14);
            doc.setTextColor(45, 95, 77);
            doc.setFont("helvetica", "bold");
            doc.text("Traveler Information", 20, 50);

            doc.setFontSize(10);
            doc.setTextColor(60, 60, 60);
            doc.setFont("helvetica", "normal");

            const userInfo = [
                ['Name:', userDetails.fullName || 'Not provided'],
                ['Email:', userDetails.email || 'Not provided'],
                ['Country:', userDetails.country || 'Not provided'],
                ['WhatsApp:', userDetails.whatsappNumber || 'Not provided'],
                ['Special Requirements:', userDetails.specialRequirements || 'None']
            ];

            userInfo.forEach(([label, value], index) => {
                doc.text(`${label}`, 20, 60 + (index * 6));
                doc.text(`${value}`, 60, 60 + (index * 6));
            });

            let yPos = 95;

            // Questionnaire Answers
            doc.setFontSize(14);
            doc.setTextColor(45, 95, 77);
            doc.setFont("helvetica", "bold");
            doc.text("Your Travel Preferences", 20, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);
            doc.setFont("helvetica", "normal");

            const answerRows = answers.map((answer, idx) => [
                `${idx + 1}.`,
                answer.question,
                Array.isArray(answer.answer)
                    ? (answer.answer as string[]).join(', ')
                    : typeof answer.answer === 'object'
                        ? JSON.stringify(answer.answer)
                        : String(answer.answer)
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['#', 'Question', 'Answer']],
                body: answerRows,
                theme: 'striped',
                headStyles: { fillColor: [249, 122, 31] },
                columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 70 },
                    2: { cellWidth: 110 }
                },
                styles: { fontSize: 8, cellPadding: 2 },
                margin: { left: 20, right: 20 }
            });

            yPos = (doc as any).lastAutoTable.finalY + 15;

            // Itinerary Details
            doc.setFontSize(14);
            doc.setTextColor(45, 95, 77);
            doc.setFont("helvetica", "bold");
            doc.text("Detailed Itinerary", 20, yPos);
            yPos += 10;

            itinerary.forEach((day, index) => {
                if (yPos > pageHeight - 40) {
                    doc.addPage();
                    yPos = 20;
                }

                doc.setFontSize(12);
                doc.setTextColor(45, 95, 77);
                doc.text(`Day ${day.day}: ${day.location}`, 20, yPos);
                yPos += 7;

                doc.setFontSize(10);
                doc.setTextColor(80, 80, 80);
                const splitDescription = doc.splitTextToSize(day.description, pageWidth - 40);
                doc.text(splitDescription, 25, yPos);
                yPos += splitDescription.length * 5 + 5;

                if (day.hotel) {
                    doc.setFontSize(9);
                    doc.setTextColor(100, 100, 100);
                    doc.text(`🏨 Accommodation: ${day.hotel.hotel_name} (${day.hotel.type.replace('_', ' ')})`, 25, yPos);
                    yPos += 5;
                }

                if (day.activities.length > 0) {
                    doc.setFontSize(9);
                    doc.setTextColor(60, 60, 60);
                    doc.text("Activities:", 25, yPos);
                    yPos += 5;

                    day.activities.forEach(activity => {
                        const activityText = `• ${activity.activity_name} (${activity.duration_hours}hrs, ${activity.intensity})`;
                        doc.text(activityText, 30, yPos);
                        yPos += 5;
                    });
                }

                if (day.travelDistance) {
                    doc.setFontSize(8);
                    doc.setTextColor(150, 150, 150);
                    doc.text(`Travel distance: ${day.travelDistance.toFixed(1)} km`, 25, yPos);
                    yPos += 5;
                }

                yPos += 10;
            });

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text("Generated by Lanka Vacations - AI-Powered Travel Planning",
                pageWidth / 2, pageHeight - 10, { align: 'center' });
            doc.text("Terms & Conditions Apply | All prices in USD",
                pageWidth / 2, pageHeight - 5, { align: 'center' });

            // Save PDF
            const fileName = `Lanka-Vacation-Itinerary-${userDetails.fullName || 'Traveler'}-${Date.now()}.pdf`;
            doc.save(fileName);

            console.log('✅ PDF generated successfully');

        } catch (error) {
            console.error('❌ Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    // Customization
    const handleCustomize = () => {
        setShowItinerary(false);
        setCurrentStep(0);
        setShowBookingForm(false);
        setBookingSubmitted(false);
        setShowPaymentButton(false);
        setAiRecommendations([]);
    };

    // Toggle AI
    const toggleAI = () => {
        setAiEnabled(!aiEnabled);
        if (!aiEnabled) {
            setAiRecommendations([]);
        }
    };

    // Render question based on type
    const renderQuestion = () => {
        const question = questions[currentStep];

        if (loading && question.type === 'city-select') {
            return (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97a1f] mb-4"></div>
                    <p className="text-gray-600">Loading AI recommendations...</p>
                </div>
            );
        }

        switch (question.type) {
            case 'select':
                return (
                    <div className="grid gap-3">
                        {question.options?.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleOptionSelect(question.id, option)}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${
                                    selectedOptions[question.id] === option
                                        ? "border-[#f97a1f] bg-orange-50 shadow-lg"
                                        : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{option}</span>
                                    {selectedOptions[question.id] === option && (
                                        <Check className="text-[#f97a1f]" size={20} />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                );

            case 'people':
                return (
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="font-medium text-gray-700 flex items-center gap-2">
                                    <UserPlus size={16} />
                                    Adults *
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={(selectedOptions.adults as number) || 1}
                                    onChange={(e) => handleOptionSelect('adults', parseInt(e.target.value) || 1)}
                                    className="text-lg"
                                />
                                <p className="text-sm text-gray-500">Minimum 1 adult required</p>
                            </div>
                            <div className="space-y-3">
                                <label className="font-medium text-gray-700">Children (under 12)</label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={(selectedOptions.children as number) || 0}
                                    onChange={(e) => handleOptionSelect('children', parseInt(e.target.value) || 0)}
                                    className="text-lg"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'interests-mixed': {
                const selectedInterests = (selectedOptions[question.id] as string[]) || [];
                const interestIcons: Record<string, React.ReactNode> = {
                    "Beaches & Relaxation": <Waves size={16} />,
                    "Wildlife & Nature": <Mountain size={16} />,
                    "Cultural & Historical Sites": <Compass size={16} />,
                    "Adventure & Sports": <Mountain size={16} />,
                    "Food & Local Experiences": <Utensils size={16} />,
                    "Shopping & Markets": <DollarSign size={16} />,
                    "Photography": <Camera size={16} />,
                    "Yoga & Wellness": <Heart size={16} />,
                    "Romantic Getaway": <Heart size={16} />,
                    "Family Activities": <UserPlus size={16} />
                };

                return (
                    <div className="space-y-4">
                        {showBeachAdvice && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                <div className="flex items-start gap-3">
                                    <Waves className="text-blue-500 mt-0.5" size={20} />
                                    <div>
                                        <p className="font-medium text-blue-800">🏖️ Beach Season Tip</p>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Sri Lanka's beaches have opposite seasons: West/South coasts (Bentota, Hikkaduwa, Mirissa)
                                            are sunny Dec-Apr. East coast (Arugam Bay, Passikudah, Trincomalee) shine May-Sep.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* AI Toggle */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="text-purple-600" size={20} />
                                    <div>
                                        <p className="font-medium text-gray-800">AI Recommendation Engine</p>
                                        <p className="text-sm text-gray-600">Get personalized destination suggestions</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleAI}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        aiEnabled ? 'bg-purple-600' : 'bg-gray-300'
                                    }`}
                                >
                  <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          aiEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                                </button>
                            </div>
                            {aiEnabled && (
                                <p className="text-xs text-purple-700 mt-2">
                                    ✓ AI will analyze your interests to suggest perfect destinations
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {question.options?.map((interest) => (
                                <button
                                    key={interest}
                                    onClick={() => {
                                        const newInterests = selectedInterests.includes(interest)
                                            ? selectedInterests.filter(i => i !== interest)
                                            : [...selectedInterests, interest];
                                        handleOptionSelect(question.id, newInterests);
                                    }}
                                    className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                                        selectedInterests.includes(interest)
                                            ? "border-[#f97a1f] bg-orange-50 text-[#f97a1f] font-semibold"
                                            : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    {interestIcons[interest]}
                                    <span className="text-sm">{interest}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            }

            case 'city-select': {
                const selectedCities = (selectedOptions.preferred_cities as string[]) || [];

                return (
                    <div className="space-y-4">
                        <div className="bg-orange-50 rounded-lg p-4 mb-4">
                            <p className="text-sm text-orange-800">
                                <strong>Select up to {maxCitiesAllowed} cities.</strong>
                                {maxCitiesAllowed < 4 && " We recommend fewer cities for a relaxed experience."}
                            </p>
                            {aiRecommendations.length > 0 && (
                                <div className="mt-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="text-green-600" size={16} />
                                        <span className="text-sm font-medium text-green-800">
                      AI has suggested {aiRecommendations.length} destinations based on your interests
                    </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* "I don't know" option */}
                        <button
                            onClick={() => handleCitySelect("I don't know the cities")}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                                randomPlan
                                    ? "border-[#f97a1f] bg-orange-50 shadow-lg"
                                    : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
                            }`}
                        >
                            <HelpCircle size={20} className={randomPlan ? "text-[#f97a1f]" : "text-gray-400"} />
                            <div className="flex-1">
                                <span className="font-medium">I don't know the cities</span>
                                <p className="text-sm text-gray-600 mt-1">
                                    {aiEnabled
                                        ? "Let our AI create a personalized itinerary based on your interests"
                                        : "Let us create a personalized itinerary based on your interests and duration"}
                                </p>
                            </div>
                            {randomPlan && <Check className="text-[#f97a1f]" size={20} />}
                        </button>

                        {/* Show 15+ tourist cities (grid) */}
                        <div className="mt-4">
                            <h4 className="font-semibold text-gray-800 mb-3">Top Tourist Cities in Sri Lanka</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                                {cities.slice(0, 16).map((city) => {
                                    const icon = city.type === 'beach' ? <Waves size={12} /> :
                                        city.type === 'cultural' ? <Compass size={12} /> :
                                            city.type === 'wildlife' ? <Mountain size={12} /> :
                                                city.type === 'urban' ? <MapPin size={12} /> :
                                                    city.type === 'hill_country' ? <Mountain size={12} /> :
                                                        city.type === 'adventure' ? <Mountain size={12} /> :
                                                            <MapPin size={12} />;

                                    return (
                                        <button
                                            key={city.destination_id}
                                            onClick={() => handleCitySelect(city.destination_name)}
                                            disabled={randomPlan || (!selectedCities.includes(city.destination_name) && selectedCities.length >= maxCitiesAllowed)}
                                            className={`p-3 rounded-lg border-2 text-sm transition-all flex flex-col items-start ${
                                                selectedCities.includes(city.destination_name)
                                                    ? "border-[#f97a1f] bg-orange-50 text-[#f97a1f] font-semibold"
                                                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                                            } ${(randomPlan || (!selectedCities.includes(city.destination_name) && selectedCities.length >= maxCitiesAllowed))
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:bg-gray-50"
                                            }`}
                                        >
                                            <div className="flex items-center gap-1 mb-1">
                                                {icon}
                                                <span className="font-medium">{city.destination_name}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 capitalize">{city.type.replace('_', ' ')}</div>
                                            <div className="text-xs text-gray-400 mt-1 truncate w-full">
                                                {city.places_to_visit?.[0] || 'Popular destination'}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {selectedCities.length > 0 && !randomPlan && (
                            <div className="bg-green-50 rounded-lg p-4 mt-4">
                                <p className="text-sm text-green-800 font-semibold mb-2">
                                    Selected ({selectedCities.length}/{maxCitiesAllowed}):
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCities.map((city) => (
                                        <span
                                            key={city}
                                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                                        >
                      {city}
                                            <button
                                                onClick={() => handleCitySelect(city)}
                                                className="ml-1 hover:text-green-900"
                                            >
                        <X size={14} />
                      </button>
                    </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            }

            case 'starting-point':
                return (
                    <div className="space-y-4">
                        <button
                            onClick={() => handleOptionSelect(question.id, 'Airport (Katunayake)')}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                                selectedOptions[question.id] === 'Airport (Katunayake)'
                                    ? "border-[#f97a1f] bg-orange-50 shadow-lg"
                                    : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-medium">Airport (Katunayake)</span>
                                    <p className="text-sm text-gray-600">Start from Colombo</p>
                                </div>
                                {selectedOptions[question.id] === 'Airport (Katunayake)' && (
                                    <Check className="text-[#f97a1f]" size={20} />
                                )}
                            </div>
                        </button>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {cities.slice(0, 12).map((city) => (
                                <button
                                    key={city.destination_id}
                                    onClick={() => handleOptionSelect(question.id, city.destination_name)}
                                    className={`p-3 rounded-lg border-2 text-sm transition-all ${
                                        selectedOptions[question.id] === city.destination_name
                                            ? "border-[#f97a1f] bg-orange-50 text-[#f97a1f] font-semibold"
                                            : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                                    }`}
                                >
                                    {city.destination_name}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const progress = ((currentStep + 1) / questions.length) * 100;

    // Booking Form Component
    const renderBookingForm = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl mx-auto"
        >
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <BookOpen className="text-green-600" size={28} />
                </div>
                <h3 className="font-serif text-3xl font-bold text-gray-800 mb-2">
                    Complete Your Booking
                </h3>
                <p className="text-gray-600">
                    Please provide your details to secure your personalized itinerary
                </p>
            </div>

            <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="font-medium text-gray-700 flex items-center gap-2">
                            <UserPlus size={16} />
                            Full Name *
                        </label>
                        <Input
                            value={userDetails.fullName}
                            onChange={(e) => setUserDetails(prev => ({ ...prev, fullName: e.target.value }))}
                            placeholder="John Smith"
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="font-medium text-gray-700 flex items-center gap-2">
                            <MailIcon size={16} />
                            Email Address *
                        </label>
                        <Input
                            type="email"
                            value={userDetails.email}
                            onChange={(e) => setUserDetails(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="john@example.com"
                            required
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="font-medium text-gray-700 flex items-center gap-2">
                            <Globe size={16} />
                            Country *
                        </label>
                        <Input
                            value={userDetails.country}
                            onChange={(e) => setUserDetails(prev => ({ ...prev, country: e.target.value }))}
                            placeholder="United States"
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="font-medium text-gray-700 flex items-center gap-2">
                            <MapPin size={16} />
                            City *
                        </label>
                        <Input
                            value={userDetails.city}
                            onChange={(e) => setUserDetails(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="New York"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="font-medium text-gray-700 flex items-center gap-2">
                        <MessageSquare size={16} />
                        WhatsApp Number *
                    </label>
                    <Input
                        value={userDetails.whatsappNumber}
                        onChange={(e) => setUserDetails(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                        placeholder="+94712345678"
                        required
                    />
                    <p className="text-sm text-gray-500">
                        We'll use this for booking confirmations and updates
                    </p>
                </div>

                <div className="space-y-3">
                    <label className="font-medium text-gray-700">
                        Special Requirements (Optional)
                    </label>
                    <Textarea
                        value={userDetails.specialRequirements}
                        onChange={(e) => setUserDetails(prev => ({ ...prev, specialRequirements: e.target.value }))}
                        placeholder="Any dietary restrictions, mobility requirements, or special requests..."
                        rows={3}
                    />
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Check className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-blue-800">What happens next?</p>
                            <ul className="text-sm text-blue-700 mt-2 space-y-1">
                                <li>• Your AI-generated itinerary will be confirmed within 24 hours</li>
                                <li>• Our travel consultant will contact you via WhatsApp</li>
                                <li>• No payment required until you're ready to proceed</li>
                                <li>• Full itinerary details will be emailed to you</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button
                    onClick={() => setShowBookingForm(false)}
                    variant="outline"
                    className="flex-1"
                >
                    <ChevronLeft size={20} className="mr-2" />
                    Back to Itinerary
                </Button>

                <Button
                    onClick={handleBookingSubmit}
                    disabled={!userDetails.fullName || !userDetails.email || !userDetails.country || !userDetails.city || !userDetails.whatsappNumber}
                    className="flex-1 bg-[#f97a1f] hover:bg-[#e66a0f]"
                >
                    <Check size={20} className="mr-2" />
                    Submit Booking Request
                </Button>
            </div>
        </motion.div>
    );

    // Simple Payment Page
    const SimplePaymentPage = () => {
        const handlePayment = () => {
            alert('Payment gateway integration coming soon!\n\nFor now, your booking is confirmed without payment.');
            if (onClose) onClose();
        };

        const handleBackToHome = () => {
            if (onClose) onClose();
        };

        return (
            <section className="py-20 bg-gradient-to-br from-[#2d5f4d] to-[#1e4a3a] min-h-screen flex items-center">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center"
                    >
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="text-green-600" size={48} />
                        </div>

                        <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                            Booking Confirmed! 🎉
                        </h2>

                        <p className="text-gray-600 text-lg mb-8">
                            Your AI-generated itinerary has been saved and our team will contact you within 24 hours.
                        </p>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8">
                            <h3 className="font-bold text-gray-800 mb-6 text-xl">
                                What happens next?
                            </h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="bg-green-100 p-2 rounded-lg">
                                        <Check className="text-green-600" size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-gray-800">AI Travel Consultant</p>
                                        <p className="text-sm text-gray-600">Assigned to customize your AI-generated trip</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-green-100 p-2 rounded-lg">
                                        <UserPlus className="text-green-600" size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-gray-800">24/7 WhatsApp Support</p>
                                        <p className="text-sm text-gray-600">Available throughout your journey</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-green-100 p-2 rounded-lg">
                                        <Star className="text-green-600" size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-gray-800">AI-Optimized Routes</p>
                                        <p className="text-sm text-gray-600">Smart travel planning</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handlePayment}
                                className="bg-[#f97a1f] hover:bg-[#e66a0f] text-white px-12 py-6 text-lg w-full shadow-lg hover:shadow-xl transition-all"
                                size="lg"
                            >
                                <CreditCard size={24} className="mr-3" />
                                Pay Any Amount to Secure Your Booking
                            </Button>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={handleBackToHome}
                                className="text-gray-600 hover:text-[#f97a1f] transition-colors flex items-center justify-center gap-2 mx-auto"
                            >
                                <Home size={18} />
                                Back to Home
                            </button>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <p className="text-sm text-gray-500 mb-2">Questions about your booking?</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a href="mailto:clientservice@lanka-vacations.com" className="text-blue-600 hover:text-blue-800 text-sm">
                                    <Mail size={16} className="inline mr-1" />
                                    clientservice@lanka-vacations.com
                                </a>
                                <a href="tel:+94777325515" className="text-blue-600 hover:text-blue-800 text-sm">
                                    <Phone size={16} className="inline mr-1" />
                                    +94 777 325 515
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        );
    };

    // --- START BUTTON PAGE ---
    if (!showQuestionnaire) {
        return (
            <section className="py-20 bg-gradient-to-br from-[#2d5f4d] to-[#1e4a3a] min-h-screen flex items-center justify-center">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#f97a1f] rounded-full mb-6">
                                <Compass size={40} className="text-white" />
                            </div>

                            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
                                Plan Your Perfect Sri Lanka Journey
                            </h1>

                            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                                Answer a few questions and our AI will create a personalized itinerary with hotels,
                                activities, and a detailed route map using our intelligent AI model.
                            </p>

                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white/10 rounded-xl p-4">
                                    <Sparkles className="text-[#f97a1f] mx-auto mb-2" size={24} />
                                    <h3 className="font-semibold text-white">AI-Powered</h3>
                                    <p className="text-white/80 text-sm">Machine learning decisions</p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4">
                                    <MapPin className="text-[#f97a1f] mx-auto mb-2" size={24} />
                                    <h3 className="font-semibold text-white">Smart Routing</h3>
                                    <p className="text-white/80 text-sm">AI-optimized travel routes</p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4">
                                    <Calendar className="text-[#f97a1f] mx-auto mb-2" size={24} />
                                    <h3 className="font-semibold text-white">Personalized</h3>
                                    <p className="text-white/80 text-sm">AI-generated day-by-day itinerary</p>
                                </div>
                            </div>

                            <Button
                                onClick={() => setShowQuestionnaire(true)}
                                className="bg-[#f97a1f] hover:bg-[#e66a0f] text-white px-12 py-7 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                                size="lg"
                            >
                                <Plane className="mr-3" size={24} />
                                Start AI Travel Planning
                            </Button>

                            <p className="text-white/70 mt-6 text-sm">
                                Takes about 3 minutes • AI-powered personalization
                            </p>
                        </div>

                        {onClose && (
                            <button
                                onClick={onClose}
                                className="mt-8 text-white/80 hover:text-orange-300 transition-colors flex items-center justify-center gap-2 mx-auto"
                            >
                                <ChevronLeft size={18} />
                                Back to Home
                            </button>
                        )}
                    </motion.div>
                </div>
            </section>
        );
    }

    // --- PAYMENT BUTTON PAGE (AFTER BOOKING) ---
    if (bookingSubmitted && showPaymentButton) {
        return <SimplePaymentPage />;
    }

    // --- BOOKING FORM PAGE ---
    if (showBookingForm) {
        return (
            <section className="py-12 bg-[#2d5f4d] min-h-screen flex items-center">
                <div className="container mx-auto px-4">
                    {renderBookingForm()}
                </div>
            </section>
        );
    }

    // --- ITINERARY PAGE ---
    if (currentStep === questions.length && showItinerary) {
        const itinerary = generateFlexibleItinerary();
        const mapDestinations = itinerary.map(day => ({
            id: `day-${day.day}`,
            name: `${day.location}`,
            lat: day.coords.lat,
            lng: day.coords.lng,
            type: day.location,
            description: day.title,
            day: day.day
        }));

        return (
            <section className="py-12 bg-[#2d5f4d] min-h-screen">
                <div className="container mx-auto px-4">
                    <motion.div {...fade} className="max-w-7xl mx-auto">
                        {/* Header with Customize button */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                            <div className="text-center md:text-left">
                                <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-2">
                                    Your AI-Powered Sri Lanka Journey
                                </h2>
                                <p className="text-white/90">
                                    {itinerary.length}-day adventure generated by AI
                                    {randomPlan && aiRecommendations.length > 0 && " (AI-generated based on your interests)"}
                                    {randomPlan && aiRecommendations.length === 0 && " (Generated based on your interests)"}
                                </p>
                                {aiRecommendations.length > 0 && (
                                    <div className="inline-flex items-center gap-2 mt-2 bg-purple-900/30 backdrop-blur-sm px-3 py-1 rounded-full">
                                        <Sparkles size={14} className="text-purple-300" />
                                        <span className="text-sm text-purple-200">Powered by AI Recommendations</span>
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleCustomize}
                                variant="outline"
                                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                            >
                                <Edit size={20} className="mr-2" />
                                Customize
                            </Button>
                        </div>

                        {/* Map Section */}
                        <div ref={itineraryRef} className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <MapPin className="text-[#f97a1f]" size={28} />
                                    <h3 className="font-bold text-2xl text-gray-800">AI-Optimized Route Map</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {aiRecommendations.length > 0 && (
                                        <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                            <Sparkles size={12} />
                                            <span>AI-Optimized</span>
                                        </div>
                                    )}
                                    <Button
                                        onClick={generatePDF}
                                        variant="outline"
                                        size="sm"
                                        className="border-[#f97a1f] text-[#f97a1f] hover:bg-[#f97a1f] hover:text-white"
                                    >
                                        <FileText size={16} className="mr-2" />
                                        Export PDF
                                    </Button>
                                </div>
                            </div>
                            <DestinationMap
                                destinations={mapDestinations}
                                showRoute={true}
                                center={[7.8731, 80.7718]}
                                zoom={8}
                                height="450px"
                                className="rounded-xl"
                            />
                        </div>

                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Main Itinerary Timeline (2/3 width) */}
                            <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <Calendar className="text-[#f97a1f]" size={28} />
                                    <h3 className="font-bold text-2xl text-gray-800">AI-Generated Day-by-Day Itinerary</h3>
                                </div>
                                <div className="space-y-6">
                                    {itinerary.map((day) => (
                                        <motion.div
                                            key={day.day}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex gap-4"
                                        >
                                            <div className="flex-shrink-0">
                                                <div className="w-14 h-14 bg-[#f97a1f] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                    {day.day}
                                                </div>
                                            </div>
                                            <div className="flex-grow">
                                                <div className="bg-gradient-to-br from-orange-50 to-green-50 rounded-xl p-5 border-l-4 border-[#f97a1f]">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-bold text-lg text-gray-800">{day.title}</h4>
                                                            <div className="flex items-center gap-2 text-[#f97a1f] font-medium mt-1">
                                                                <MapPin size={16} />
                                                                <span className="text-sm">{day.location}</span>
                                                                {day.travelDistance && (
                                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
                                    {day.travelDistance.toFixed(1)} km
                                  </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {day.hotel && (
                                                            <div className="bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-700 border border-orange-200">
                                                                <Hotel size={12} className="inline mr-1" />
                                                                {day.hotel.hotel_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-600 mb-4">{day.description}</p>

                                                    {day.activities.length > 0 && (
                                                        <div className="mt-3">
                                                            <p className="font-semibold text-gray-700 mb-2 text-sm">Activities:</p>
                                                            <div className="space-y-2">
                                                                {day.activities.map((activity, idx) => (
                                                                    <div key={idx} className="bg-white/70 rounded-lg p-3 border border-gray-200">
                                                                        <div className="flex justify-between items-start">
                                                                            <div>
                                                                                <p className="font-medium text-gray-800">{activity.activity_name}</p>
                                                                                <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                                                                            </div>
                                                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                                                activity.intensity === 'high' ? 'bg-red-100 text-red-800' :
                                                                                    activity.intensity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                                        'bg-green-100 text-green-800'
                                                                            }`}>
                                        {activity.intensity}
                                      </span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Sidebar (1/3 width) - REMOVED AI Insights section */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Trip Summary */}
                                <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Users className="text-[#f97a1f]" size={28} />
                                        <h3 className="font-bold text-2xl text-gray-800">Trip Summary</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {answers.slice(0, 6).map((answer, idx) => (
                                            <div key={idx} className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">
                                                    {answer.question}
                                                </p>
                                                <p className="font-semibold text-gray-800">
                                                    {Array.isArray(answer.answer)
                                                        ? (answer.answer as string[]).join(', ')
                                                        : typeof answer.answer === 'object'
                                                            ? JSON.stringify(answer.answer)
                                                            : String(answer.answer)
                                                    }
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="bg-gradient-to-br from-orange-50 to-green-50 rounded-3xl shadow-2xl p-6">
                                    <h4 className="font-bold text-gray-800 mb-4">Trip Statistics</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white rounded-lg p-4 text-center">
                                            <CalendarDays className="text-[#f97a1f] mx-auto mb-2" size={24} />
                                            <p className="text-2xl font-bold text-[#f97a1f]">{itinerary.length}</p>
                                            <p className="text-xs text-gray-600">Days</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-4 text-center">
                                            <MapPin className="text-[#2d5f4d] mx-auto mb-2" size={24} />
                                            <p className="text-2xl font-bold text-[#2d5f4d]">{new Set(itinerary.map(d => d.location)).size}</p>
                                            <p className="text-xs text-gray-600">Destinations</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-700 mb-2">Route Highlights:</p>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                            {Array.from(new Set(itinerary.map(d => d.location))).slice(0, 4).map((city, idx) => (
                                                <li key={idx} className="flex items-center">
                                                    <Check size={12} className="text-green-500 mr-2" />
                                                    {city}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Contact Support */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-2xl p-6">
                                    <h4 className="font-bold text-gray-800 mb-4">Need Help?</h4>
                                    <div className="space-y-3">
                                        <a href="mailto:clientservice@lanka-vacations.com" className="flex items-center gap-3 text-blue-700 hover:text-blue-900">
                                            <Mail size={18} />
                                            <span className="text-sm">Email Support</span>
                                        </a>
                                        <a href="tel:+94777325515" className="flex items-center gap-3 text-blue-700 hover:text-blue-900">
                                            <Phone size={18} />
                                            <span className="text-sm">Call: +94 777 325 515</span>
                                        </a>
                                        <p className="text-xs text-gray-600 mt-4">24/7 support available during your trip</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white rounded-3xl shadow-2xl p-8 mt-8">
                            <h3 className="font-bold text-xl text-gray-800 mb-6 text-center">
                                Ready to Start Your AI-Planned Adventure?
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={generatePDF}
                                    className="bg-[#f97a1f] hover:bg-[#e66a0f] text-white px-6 py-6"
                                >
                                    <Download className="mr-2" size={20} />
                                    Download PDF Itinerary
                                </Button>

                                <Button
                                    onClick={() => setShowBookingForm(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-6"
                                >
                                    <BookOpen className="mr-2" size={20} />
                                    Book This Itinerary
                                </Button>

                                <Button
                                    onClick={handleCustomize}
                                    variant="outline"
                                    className="border-[#f97a1f] text-[#f97a1f] hover:bg-[#f97a1f] hover:text-white px-6 py-6"
                                >
                                    <Settings className="mr-2" size={20} />
                                    Customize
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        );
    }

    // --- THANK YOU PAGE ---
    if (currentStep === questions.length) {
        return (
            <section className="py-20 bg-[#2d5f4d] min-h-screen flex items-center">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12"
                    >
                        <div className="text-center">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="text-green-600" size={48} />
                            </div>
                            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                                Thank You!
                            </h2>
                            <p className="text-gray-600 text-lg mb-8">
                                Your preferences have been saved. Ready to see your personalized itinerary!
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-green-50 rounded-2xl p-6 mb-8">
                            <h3 className="font-bold text-xl mb-4 text-gray-800 flex items-center gap-2">
                                <Check className="text-[#f97a1f]" size={24} />
                                Your Travel Preferences
                            </h3>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {answers.slice(0, 5).map((answer, idx) => (
                                    <div key={idx} className="bg-white rounded-lg p-4 border-l-4 border-[#f97a1f]">
                                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">
                                            {answer.question}
                                        </p>
                                        <p className="font-semibold text-gray-800">
                                            {Array.isArray(answer.answer)
                                                ? (answer.answer as string[]).join(', ')
                                                : typeof answer.answer === 'object'
                                                    ? JSON.stringify(answer.answer)
                                                    : String(answer.answer)
                                            }
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={() => setShowItinerary(true)}
                                className="flex-1 bg-[#f97a1f] hover:bg-[#e66a0f] text-white px-8 py-7 text-lg font-semibold"
                            >
                                <MapPin className="mr-2" size={24} />
                                Generate Flexible Itinerary with Map
                            </Button>
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="flex-1 border-[#f97a1f] text-[#f97a1f] hover:bg-[#f97a1f] hover:text-white px-8 py-7 text-lg font-semibold"
                            >
                                <Home className="mr-2" size={24} />
                                Return to Home
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        );
    }

    // --- QUESTIONNAIRE PAGE ---
    return (
        <section className="py-20 bg-gradient-to-br from-[#2d5f4d] to-[#1e4a3a] min-h-screen">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Progress and Navigation */}
                    <div className="flex items-center justify-between mb-8">
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="text-white/90 hover:text-orange-300 flex items-center gap-2 transition-colors"
                            >
                                <ChevronLeft size={20} />
                                Back
                            </button>
                        )}
                        <div className="text-right">
              <span className="text-white font-medium">
                Question {currentStep + 1} of {questions.length}
              </span>
                            <div className="text-white/70 text-sm">
                                {Math.round(progress)}% Complete
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="h-3 bg-white/20 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                className="h-full bg-[#f97a1f] rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* Question Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            {...fade}
                            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-6"
                        >
                            <h3 className="font-serif text-2xl md:text-3xl font-bold text-gray-800 mb-8">
                                {questions[currentStep].question}
                            </h3>

                            {renderQuestion()}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center gap-4">
                        <Button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            variant="outline"
                            className="bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 disabled:opacity-50 px-6 py-6"
                        >
                            <ChevronLeft size={20} className="mr-2" />
                            Back
                        </Button>

                        {currentStep === questions.length - 1 ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={!validateStep(currentStep) || isGeneratingAI}
                                className="bg-[#f97a1f] hover:bg-[#e66a0f] text-white px-10 py-6 shadow-lg hover:shadow-xl"
                            >
                                {isGeneratingAI ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        AI Processing...
                                    </>
                                ) : (
                                    <>
                                        Submit
                                        <Check size={20} className="ml-2" />
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                disabled={!validateStep(currentStep)}
                                className="bg-[#f97a1f] hover:bg-[#e66a0f] text-white px-10 py-6 shadow-lg hover:shadow-xl"
                            >
                                Next
                                <ChevronRight size={20} className="ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TravelQuestionnaire;