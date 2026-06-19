// src/pages/HotelBooking.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
    Search, MapPin, Calendar, Users, Star,
    Filter, ChevronRight, ChevronLeft,
    X, Check, Wifi, Coffee, Car, Dumbbell,
    Waves, Sparkles, Shield, Clock, CreditCard,
    Hotel as HotelIcon, Home, Settings, Phone,
    Mail, Globe, Tag, Award, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

interface Hotel {
    hotel_id: string;
    hotel_name: string;
    hotel_category: 'budget' | 'standard' | 'luxury' | 'boutique' | 'resort';
    city: string;
    address: string;
    price_per_night_usd: number;
    star_rating: number;
    rating: number;
    review_count: number;
    image_urls: string[];
    description: string;
    available_rooms: number;
    total_rooms: number;
    facilities: string[];
    policies: any;
    room_capacity: any;
    room_types: string[];
    meal_plans: string[];
    destination_name: string;
    total_price?: string;
    nights?: number;
}

interface City {
    city: string;
    hotel_count: number;
    min_price: number;
    max_price: number;
}

const HotelBooking = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    // State for search filters
    const [searchParams, setSearchParams] = useState({
        city: "",
        checkIn: "",
        checkOut: "",
        adults: "2",
        children: "0",
        rooms: "1",
        minPrice: 0,
        maxPrice: 500,
        hotelCategory: "all",
        sortBy: "rating"
    });

    // State for hotels data
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalHotels, setTotalHotels] = useState(0);

    // Booking modal state
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [bookingDetails, setBookingDetails] = useState({
        num_rooms: "1",
        room_type: "standard",
        meal_plan: "breakfast_only",
        special_requests: ""
    });

    // Fetch cities on component mount
    useEffect(() => {
        fetchCities();
        // Load default search (Colombo)
        handleSearch();
    }, []);

    const fetchCities = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/hotels/cities`);
            const data = await response.json();
            if (data.success) {
                setCities(data.cities);
            }
        } catch (error) {
            console.error("Error fetching cities:", error);
        }
    };

    const handleSearch = async (page = 1) => {
        if (!searchParams.city) {
            toast({
                title: "Please select a city",
                description: "Choose a city to search for hotels",
                variant: "destructive"
            });
            return;
        }

        if (!searchParams.checkIn || !searchParams.checkOut) {
            toast({
                title: "Please select dates",
                description: "Choose check-in and check-out dates",
                variant: "destructive"
            });
            return;
        }

        setSearching(true);
        setCurrentPage(page);

        try {
            const params = new URLSearchParams({
                ...searchParams,
                page: page.toString(),
                limit: "12"
            }).toString();

            const response = await fetch(`${API_BASE_URL}/hotels/search?${params}`);
            const data = await response.json();

            if (data.success) {
                setHotels(data.hotels);
                setTotalPages(data.pagination.pages);
                setTotalHotels(data.pagination.total);
            } else {
                toast({
                    title: "Search failed",
                    description: data.error || "Failed to search hotels",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Error searching hotels:", error);
            toast({
                title: "Error",
                description: "Failed to search hotels",
                variant: "destructive"
            });
        } finally {
            setSearching(false);
        }
    };

    const handleBookHotel = async () => {
        console.log('🏨 Starting hotel booking process...');
        console.log('User authenticated:', isAuthenticated);
        console.log('User ID:', user?.user_id);
        console.log('Selected hotel:', selectedHotel);

        if (!isAuthenticated || !user) {
            toast({
                title: "Please login",
                description: "You need to login to book a hotel",
                variant: "destructive"
            });
            navigate("/login");
            return;
        }

        if (!selectedHotel) {
            console.error('No hotel selected');
            return;
        }

        // Calculate total price
        const checkIn = new Date(searchParams.checkIn);
        const checkOut = new Date(searchParams.checkOut);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const totalPrice = (selectedHotel.price_per_night_usd * nights * parseInt(bookingDetails.num_rooms)).toFixed(2);

        const bookingData = {
            hotel_id: selectedHotel.hotel_id,
            user_id: user.user_id,
            check_in_date: searchParams.checkIn,
            check_out_date: searchParams.checkOut,
            num_rooms: parseInt(bookingDetails.num_rooms),
            num_adults: parseInt(searchParams.adults),
            num_children: parseInt(searchParams.children),
            room_type: bookingDetails.room_type,
            meal_plan: bookingDetails.meal_plan,
            special_requests: bookingDetails.special_requests,
            total_price: totalPrice
        };

        console.log('📦 Booking data to send:', bookingData);

        try {
            const response = await fetch(`${API_BASE_URL}/hotels/book`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();
            console.log('📦 Booking API response:', data);

            if (data.success) {
                toast({
                    title: "Booking Successful!",
                    description: `Your booking at ${selectedHotel.hotel_name} has been confirmed. Booking ID: ${data.booking_id}`,
                });

                setBookingModalOpen(false);
                setSelectedHotel(null);

                // Navigate to dashboard with hotels tab
                navigate("/view?tab=hotels");

                // Refresh bookings after a delay
                setTimeout(() => {
                    window.dispatchEvent(new Event('hotel-booking-refresh'));
                }, 1000);
            } else {
                toast({
                    title: "Booking Failed",
                    description: data.error || "Failed to book hotel",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Error booking hotel:", error);
            toast({
                title: "Error",
                description: "Failed to book hotel",
                variant: "destructive"
            });
        }
    };

    const getHotelCategoryColor = (category: string) => {
        switch (category) {
            case 'luxury': return 'bg-purple-100 text-purple-800';
            case 'boutique': return 'bg-pink-100 text-pink-800';
            case 'resort': return 'bg-blue-100 text-blue-800';
            case 'standard': return 'bg-green-100 text-green-800';
            case 'budget': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getFacilityIcon = (facility: string) => {
        if (facility.toLowerCase().includes('wifi')) return <Wifi className="h-4 w-4" />;
        if (facility.toLowerCase().includes('restaurant') || facility.toLowerCase().includes('breakfast'))
            return <Coffee className="h-4 w-4" />;
        if (facility.toLowerCase().includes('parking')) return <Car className="h-4 w-4" />;
        if (facility.toLowerCase().includes('gym')) return <Dumbbell className="h-4 w-4" />;
        if (facility.toLowerCase().includes('pool') || facility.toLowerCase().includes('beach'))
            return <Waves className="h-4 w-4" />;
        if (facility.toLowerCase().includes('spa')) return <Sparkles className="h-4 w-4" />;
        return <Check className="h-4 w-4" />;
    };

    // Render pagination
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Button
                    key={i}
                    variant={currentPage === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSearch(i)}
                    className={currentPage === i ? "bg-orange-600 hover:bg-orange-700" : ""}
                >
                    {i}
                </Button>
            );
        }

        return (
            <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearch(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                {pages}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearch(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Book a Hotel in Sri Lanka</h1>
                    <p className="text-gray-600 mt-2">
                        Discover amazing hotels across Sri Lanka's most beautiful destinations
                    </p>
                </div>

                {/* Search Bar */}
                <Card className="border-orange-200 shadow-lg mb-8">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* City Select */}
                            <div className="md:col-span-3">
                                <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-2 block">
                                    <MapPin className="h-4 w-4 inline mr-1" />
                                    Destination
                                </Label>
                                <Select
                                    value={searchParams.city}
                                    onValueChange={(value) => setSearchParams({...searchParams, city: value})}
                                >
                                    <SelectTrigger id="city" className="border-orange-300">
                                        <SelectValue placeholder="Select a city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Cities</SelectItem>
                                        {cities.map(city => (
                                            <SelectItem key={city.city} value={city.city}>
                                                {city.city} ({city.hotel_count} hotels)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Dates */}
                            <div className="md:col-span-3">
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    <Calendar className="h-4 w-4 inline mr-1" />
                                    Check-in / Check-out
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        value={searchParams.checkIn}
                                        onChange={(e) => setSearchParams({...searchParams, checkIn: e.target.value})}
                                        className="border-orange-300"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <Input
                                        type="date"
                                        value={searchParams.checkOut}
                                        onChange={(e) => setSearchParams({...searchParams, checkOut: e.target.value})}
                                        className="border-orange-300"
                                        min={searchParams.checkIn || new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            {/* Guests & Rooms */}
                            <div className="md:col-span-3">
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                    <Users className="h-4 w-4 inline mr-1" />
                                    Guests & Rooms
                                </Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={searchParams.adults}
                                        onValueChange={(value) => setSearchParams({...searchParams, adults: value})}
                                    >
                                        <SelectTrigger className="border-orange-300">
                                            <SelectValue placeholder="Adults" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1,2,3,4,5,6].map(num => (
                                                <SelectItem key={num} value={num.toString()}>{num} Adult{num > 1 ? 's' : ''}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={searchParams.children}
                                        onValueChange={(value) => setSearchParams({...searchParams, children: value})}
                                    >
                                        <SelectTrigger className="border-orange-300">
                                            <SelectValue placeholder="Children" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[0,1,2,3,4].map(num => (
                                                <SelectItem key={num} value={num.toString()}>{num} Child{num !== 1 ? 'ren' : ''}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Rooms */}
                            <div className="md:col-span-1">
                                <Label htmlFor="rooms" className="text-sm font-medium text-gray-700 mb-2 block">
                                    Rooms
                                </Label>
                                <Select
                                    value={searchParams.rooms}
                                    onValueChange={(value) => setSearchParams({...searchParams, rooms: value})}
                                >
                                    <SelectTrigger id="rooms" className="border-orange-300">
                                        <SelectValue placeholder="Rooms" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1,2,3,4,5].map(num => (
                                            <SelectItem key={num} value={num.toString()}>{num} Room{num > 1 ? 's' : ''}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Search Button */}
                            <div className="md:col-span-2 flex items-end">
                                <Button
                                    onClick={() => handleSearch(1)}
                                    disabled={searching}
                                    className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 h-10"
                                >
                                    {searching ? (
                                        <div className="flex items-center">
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            Searching...
                                        </div>
                                    ) : (
                                        <>
                                            <Search className="h-4 w-4 mr-2" />
                                            Search Hotels
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Advanced Filters (Collapsible) */}
                        <div className="mt-4 pt-4 border-t border-orange-100">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Advanced Filters
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Price Range */}
                                <div>
                                    <Label className="text-sm text-gray-600 mb-2 block">
                                        Price Range: ${searchParams.minPrice} - ${searchParams.maxPrice}
                                    </Label>
                                    <Slider
                                        defaultValue={[0, 500]}
                                        max={1000}
                                        step={10}
                                        value={[searchParams.minPrice, searchParams.maxPrice]}
                                        onValueChange={(value) => setSearchParams({
                                            ...searchParams,
                                            minPrice: value[0],
                                            maxPrice: value[1]
                                        })}
                                        className="w-full"
                                    />
                                </div>

                                {/* Hotel Category */}
                                <div>
                                    <Label className="text-sm text-gray-600 mb-2 block">Hotel Type</Label>
                                    <Select
                                        value={searchParams.hotelCategory}
                                        onValueChange={(value) => setSearchParams({...searchParams, hotelCategory: value})}
                                    >
                                        <SelectTrigger className="border-orange-300">
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="luxury">Luxury</SelectItem>
                                            <SelectItem value="boutique">Boutique</SelectItem>
                                            <SelectItem value="resort">Resort</SelectItem>
                                            <SelectItem value="standard">Standard</SelectItem>
                                            <SelectItem value="budget">Budget</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sort By */}
                                <div>
                                    <Label className="text-sm text-gray-600 mb-2 block">Sort By</Label>
                                    <Select
                                        value={searchParams.sortBy}
                                        onValueChange={(value) => setSearchParams({...searchParams, sortBy: value})}
                                    >
                                        <SelectTrigger className="border-orange-300">
                                            <SelectValue placeholder="Rating" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rating">Highest Rating</SelectItem>
                                            <SelectItem value="price_low">Price: Low to High</SelectItem>
                                            <SelectItem value="price_high">Price: High to Low</SelectItem>
                                            <SelectItem value="popular">Most Popular</SelectItem>
                                            <SelectItem value="name">Name A-Z</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Clear Filters */}
                                <div className="flex items-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchParams({
                                                city: "",
                                                checkIn: "",
                                                checkOut: "",
                                                adults: "2",
                                                children: "0",
                                                rooms: "1",
                                                minPrice: 0,
                                                maxPrice: 500,
                                                hotelCategory: "all",
                                                sortBy: "rating"
                                            });
                                        }}
                                        className="w-full border-orange-300 text-orange-600"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {searching ? 'Searching...' : `${totalHotels} Hotels Found`}
                        </h2>
                        {searchParams.city && (
                            <p className="text-gray-600">
                                In {searchParams.city} • {searchParams.checkIn && format(new Date(searchParams.checkIn), 'MMM dd')} - {searchParams.checkOut && format(new Date(searchParams.checkOut), 'MMM dd')} • {searchParams.adults} Adults, {searchParams.children} Children
                            </p>
                        )}
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Page {currentPage} of {totalPages}
                    </Badge>
                </div>

                {/* Hotels Grid */}
                {searching ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : hotels.length === 0 ? (
                    <Card className="border-orange-200">
                        <CardContent className="pt-6 text-center py-12">
                            <HotelIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Hotels Found</h3>
                            <p className="text-gray-600 mb-6">Try adjusting your search criteria or explore different cities.</p>
                            <Button
                                onClick={() => {
                                    setSearchParams({
                                        ...searchParams,
                                        city: "Colombo",
                                        checkIn: new Date().toISOString().split('T')[0],
                                        checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0]
                                    });
                                    handleSearch(1);
                                }}
                                className="bg-gradient-to-r from-orange-500 to-amber-600"
                            >
                                Search Colombo Hotels
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {hotels.filter(hotel => hotel).map((hotel) => (
                                <Card key={hotel.hotel_id} className="border-orange-200 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                                    {/* Hotel Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={hotel.image_urls[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                                            alt={hotel.hotel_name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <Badge className={cn("font-semibold", getHotelCategoryColor(hotel.hotel_category))}>
                                                {hotel.hotel_category.charAt(0).toUpperCase() + hotel.hotel_category.slice(1)}
                                            </Badge>
                                        </div>
                                        <div className="absolute top-3 right-3">
                                            <Badge className="bg-white/90 text-gray-800 font-semibold">
                                                <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                                                <span className="text-sm font-medium">{parseFloat(String(hotel?.rating || 0)).toFixed(1)}</span>
                                            </Badge>
                                        </div>
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <Badge className="bg-green-100 text-green-800 font-semibold">
                                                {hotel.available_rooms} rooms available
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{hotel.hotel_name}</CardTitle>
                                                <CardDescription className="flex items-center gap-1 mt-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {hotel.city} • {hotel.destination_name}
                                                </CardDescription>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-orange-600">
                                                    ${hotel.price_per_night_usd}
                                                    <span className="text-sm font-normal text-gray-500">/night</span>
                                                </div>
                                                {hotel.total_price && (
                                                    <p className="text-sm text-gray-600">
                                                        Total: ${hotel.total_price} for {hotel.nights} nights
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{hotel.description}</p>

                                        {/* Facilities */}
                                        <div className="mb-4">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Top Facilities:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {hotel.facilities?.slice(0, 4).map((facility, idx) => (
                                                    <Badge key={idx} variant="secondary" className="bg-orange-50 text-orange-700 text-xs">
                                                        {getFacilityIcon(facility)}
                                                        <span className="ml-1">{facility.split(' ')[0]}</span>
                                                    </Badge>
                                                ))}
                                                {hotel.facilities && hotel.facilities.length > 4 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{hotel.facilities.length - 4} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Room Info */}
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span>Room Types:</span>
                                                <span className="font-medium">
                                                    {hotel.room_types?.slice(0, 2).join(', ')}
                                                    {hotel.room_types && hotel.room_types.length > 2 && '...'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Max Capacity:</span>
                                                <span className="font-medium">
                                                    {Object.values(hotel.room_capacity || {}).reduce((max: number, room: any) => {
                                                        return Math.max(max, (room.max_adults || 0) + (room.max_children || 0));
                                                    }, 0)} guests
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex justify-between border-t border-orange-100 pt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/hotel/${hotel.hotel_id}`)}
                                            className="border-orange-400 text-orange-600 hover:bg-orange-50"
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                if (!isAuthenticated) {
                                                    toast({
                                                        title: "Please login",
                                                        description: "You need to login to book a hotel",
                                                        variant: "destructive"
                                                    });
                                                    navigate("/login");
                                                    return;
                                                }
                                                setSelectedHotel(hotel);
                                                setBookingModalOpen(true);
                                            }}
                                            className="bg-gradient-to-r from-orange-500 to-amber-600"
                                            disabled={hotel.available_rooms === 0}
                                        >
                                            {hotel.available_rooms === 0 ? 'Sold Out' : 'Book Now'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {renderPagination()}
                    </>
                )}

                {/* Popular Cities Section */}
                {!searchParams.city && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Destinations in Sri Lanka</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {cities.slice(0, 10).map(city => (
                                <Card
                                    key={city.city}
                                    className="border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    onClick={() => {
                                        setSearchParams({
                                            ...searchParams,
                                            city: city.city,
                                            checkIn: new Date().toISOString().split('T')[0],
                                            checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0]
                                        });
                                    }}
                                >
                                    <CardContent className="p-4 text-center">
                                        <MapPin className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                                        <h3 className="font-semibold text-gray-900">{city.city}</h3>
                                        <p className="text-sm text-gray-600">{city.hotel_count} hotels</p>
                                        <p className="text-sm font-medium text-orange-600">
                                            From ${city.min_price}/night
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Why Book With Us */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Book With Lanka Vacations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="border-orange-200">
                            <CardContent className="pt-6 text-center">
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                                    <Shield className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">Secure Booking</h3>
                                <p className="text-sm text-gray-600">Your data is protected with 256-bit SSL encryption</p>
                            </CardContent>
                        </Card>

                        <Card className="border-orange-200">
                            <CardContent className="pt-6 text-center">
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                                    <Clock className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
                                <p className="text-sm text-gray-600">Round-the-clock customer service for all your needs</p>
                            </CardContent>
                        </Card>

                        <Card className="border-orange-200">
                            <CardContent className="pt-6 text-center">
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                                    <Award className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">Best Price Guarantee</h3>
                                <p className="text-sm text-gray-600">Find a lower price? We'll match it and give you 10% off</p>
                            </CardContent>
                        </Card>

                        <Card className="border-orange-200">
                            <CardContent className="pt-6 text-center">
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                                    <Heart className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">Flexible Cancellation</h3>
                                <p className="text-sm text-gray-600">Free cancellation on most hotels up to 48 hours before check-in</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Book Your Stay</DialogTitle>
                        <DialogDescription>
                            Complete your booking for {selectedHotel?.hotel_name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedHotel && (
                        <div className="space-y-4">
                            {/* Hotel Summary */}
                            <Card className="border-orange-200">
                                <CardContent className="pt-4">
                                    <div className="flex gap-4">
                                        <img
                                            src={selectedHotel.image_urls[0]}
                                            alt={selectedHotel.hotel_name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div>
                                            <h4 className="font-semibold">{selectedHotel.hotel_name}</h4>
                                            <p className="text-sm text-gray-600 flex items-center">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {selectedHotel.city}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge className={getHotelCategoryColor(selectedHotel.hotel_category)}>
                                                    {selectedHotel.hotel_category}
                                                </Badge>
                                                <div className="flex items-center">
                                                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
                                                    <span className="text-sm font-medium">{parseFloat(String(selectedHotel.rating || 0)).toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Booking Details */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Check-in</Label>
                                        <Input
                                            type="date"
                                            value={searchParams.checkIn}
                                            readOnly
                                            className="bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <Label>Check-out</Label>
                                        <Input
                                            type="date"
                                            value={searchParams.checkOut}
                                            readOnly
                                            className="bg-gray-50"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Rooms</Label>
                                        <Select
                                            value={bookingDetails.num_rooms}
                                            onValueChange={(value) => setBookingDetails({...bookingDetails, num_rooms: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1,2,3,4].map(num => (
                                                    <SelectItem key={num} value={num.toString()}>{num} Room{num > 1 ? 's' : ''}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Room Type</Label>
                                        <Select
                                            value={bookingDetails.room_type}
                                            onValueChange={(value) => setBookingDetails({...bookingDetails, room_type: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {selectedHotel.room_types?.map(type => (
                                                    <SelectItem key={type} value={type}>
                                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label>Meal Plan</Label>
                                    <Select
                                        value={bookingDetails.meal_plan}
                                        onValueChange={(value) => setBookingDetails({...bookingDetails, meal_plan: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedHotel.meal_plans?.map(plan => (
                                                <SelectItem key={plan} value={plan}>
                                                    {plan.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Special Requests (Optional)</Label>
                                    <Input
                                        placeholder="Any special requirements or requests"
                                        value={bookingDetails.special_requests}
                                        onChange={(e) => setBookingDetails({...bookingDetails, special_requests: e.target.value})}
                                    />
                                </div>

                                {/* Price Summary */}
                                <Card className="border-orange-200">
                                    <CardContent className="pt-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Price per night:</span>
                                                <span className="font-medium">${selectedHotel.price_per_night_usd}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Nights:</span>
                                                <span className="font-medium">
                                                    {Math.ceil(
                                                        (new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime()) /
                                                        (1000 * 60 * 60 * 24)
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Rooms:</span>
                                                <span className="font-medium">{bookingDetails.num_rooms}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Total:</span>
                                                <span className="text-orange-600">
                                                    $
                                                    {(
                                                        selectedHotel.price_per_night_usd *
                                                        Math.ceil(
                                                            (new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime()) /
                                                            (1000 * 60 * 60 * 24)
                                                        ) *
                                                        parseInt(bookingDetails.num_rooms)
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setBookingModalOpen(false)}
                            className="border-orange-300 text-orange-600"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBookHotel}
                            className="bg-gradient-to-r from-orange-500 to-amber-600"
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Confirm Booking
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HotelBooking;