// src/pages/HotelDetails.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
    MapPin, Star, Calendar, Users, Wifi, Coffee, Car,
    Dumbbell, Waves, Sparkles, Check, Hotel as HotelIcon,
    ArrowLeft, Phone, Mail, Globe, CreditCard,
    Shield, Clock, Award, Heart, Bed, Coffee as Breakfast,
    Car as Parking, Waves as Pool, Sparkles as Spa,
    Users as Capacity, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

interface Hotel {
    hotel_id: string;
    hotel_name: string;
    hotel_category: string;
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
    contact_phone: string;
    contact_email: string;
    check_in_time: string;
    check_out_time: string;
    amenities: string[];
    destination_name: string;
}

const HotelDetails = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedDates, setSelectedDates] = useState({
        checkIn: "",
        checkOut: "",
        adults: "2",
        children: "0",
        rooms: "1"
    });

    useEffect(() => {
        fetchHotelDetails();
    }, [hotelId]);

    const fetchHotelDetails = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}`);
            const data = await response.json();

            if (data.success) {
                setHotel(data.hotel);
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to fetch hotel details",
                    variant: "destructive"
                });
                navigate('/book-hotel');
            }
        } catch (error) {
            console.error("Error fetching hotel details:", error);
            toast({
                title: "Error",
                description: "Failed to fetch hotel details",
                variant: "destructive"
            });
            navigate('/book-hotel');
        } finally {
            setLoading(false);
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

    const handleBookNow = () => {
        if (!isAuthenticated || !user) {
            toast({
                title: "Please login",
                description: "You need to login to book a hotel",
                variant: "destructive"
            });
            navigate("/login");
            return;
        }

        if (!selectedDates.checkIn || !selectedDates.checkOut) {
            toast({
                title: "Select Dates",
                description: "Please select check-in and check-out dates",
                variant: "destructive"
            });
            return;
        }

        navigate(`/book-hotel?hotel=${hotelId}&checkIn=${selectedDates.checkIn}&checkOut=${selectedDates.checkOut}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
                <div className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
                <div className="container mx-auto px-4 py-8">
                    <Card className="border-orange-200">
                        <CardContent className="pt-6 text-center py-12">
                            <HotelIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Hotel Not Found</h3>
                            <p className="text-gray-600 mb-6">The hotel you're looking for doesn't exist.</p>
                            <Button
                                onClick={() => navigate('/book-hotel')}
                                className="bg-gradient-to-r from-orange-500 to-amber-600"
                            >
                                Browse Hotels
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => navigate('/book-hotel')}
                    className="mb-6 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Hotels
                </Button>

                {/* Hotel Header */}
                <div className="flex flex-col lg:flex-row gap-8 mb-8">
                    {/* Images Section */}
                    <div className="lg:w-2/3">
                        <div className="rounded-xl overflow-hidden mb-4">
                            <img
                                src={hotel.image_urls[selectedImage] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}
                                alt={hotel.hotel_name}
                                className="w-full h-96 object-cover"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {hotel.image_urls.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                                        selectedImage === index ? 'border-orange-500' : 'border-transparent'
                                    }`}
                                >
                                    <img
                                        src={img}
                                        alt={`${hotel.hotel_name} view ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <Card className="lg:w-1/3 border-orange-200 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl">{hotel.hotel_name}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {hotel.city}, {hotel.address}
                            </CardDescription>
                            <div className="flex items-center gap-4 mt-2">
                                <Badge className={getHotelCategoryColor(hotel.hotel_category)}>
                                    {hotel.hotel_category.charAt(0).toUpperCase() + hotel.hotel_category.slice(1)}
                                </Badge>
                                <div className="flex items-center">
                                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 mr-1" />
                                    <span className="font-medium">{hotel.rating.toFixed(1)}</span>
                                    <span className="text-gray-500 ml-1">({hotel.review_count} reviews)</span>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-4">
                                {/* Price */}
                                <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Starting from</p>
                                    <div className="text-4xl font-bold text-orange-600">
                                        ${hotel.price_per_night_usd}
                                        <span className="text-lg font-normal text-gray-500">/night</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {hotel.available_rooms} of {hotel.total_rooms} rooms available
                                    </p>
                                </div>

                                {/* Date Selection */}
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Check-in</label>
                                            <input
                                                type="date"
                                                value={selectedDates.checkIn}
                                                onChange={(e) => setSelectedDates({...selectedDates, checkIn: e.target.value})}
                                                className="w-full p-2 border border-orange-300 rounded-md"
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Check-out</label>
                                            <input
                                                type="date"
                                                value={selectedDates.checkOut}
                                                onChange={(e) => setSelectedDates({...selectedDates, checkOut: e.target.value})}
                                                className="w-full p-2 border border-orange-300 rounded-md"
                                                min={selectedDates.checkIn || new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Adults</label>
                                            <select
                                                value={selectedDates.adults}
                                                onChange={(e) => setSelectedDates({...selectedDates, adults: e.target.value})}
                                                className="w-full p-2 border border-orange-300 rounded-md"
                                            >
                                                {[1,2,3,4,5,6].map(num => (
                                                    <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Children</label>
                                            <select
                                                value={selectedDates.children}
                                                onChange={(e) => setSelectedDates({...selectedDates, children: e.target.value})}
                                                className="w-full p-2 border border-orange-300 rounded-md"
                                            >
                                                {[0,1,2,3,4].map(num => (
                                                    <option key={num} value={num}>{num} Child{num !== 1 ? 'ren' : ''}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Rooms</label>
                                        <select
                                            value={selectedDates.rooms}
                                            onChange={(e) => setSelectedDates({...selectedDates, rooms: e.target.value})}
                                            className="w-full p-2 border border-orange-300 rounded-md"
                                        >
                                            {[1,2,3,4,5].map(num => (
                                                <option key={num} value={num}>{num} Room{num > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Calculate price if dates selected */}
                                {selectedDates.checkIn && selectedDates.checkOut && (
                                    <div className="bg-orange-50 p-3 rounded-lg">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Nights:</span>
                                            <span className="font-medium">
                                                {Math.ceil(
                                                    (new Date(selectedDates.checkOut).getTime() -
                                                        new Date(selectedDates.checkIn).getTime()) /
                                                    (1000 * 60 * 60 * 24)
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Price per night:</span>
                                            <span className="font-medium">${hotel.price_per_night_usd}</span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total:</span>
                                            <span className="text-orange-600">
                                                $
                                                {(
                                                    hotel.price_per_night_usd *
                                                    Math.ceil(
                                                        (new Date(selectedDates.checkOut).getTime() -
                                                            new Date(selectedDates.checkIn).getTime()) /
                                                        (1000 * 60 * 60 * 24)
                                                    ) *
                                                    parseInt(selectedDates.rooms)
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter>
                            <Button
                                onClick={handleBookNow}
                                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 h-12 text-lg"
                                disabled={hotel.available_rooms === 0}
                            >
                                {hotel.available_rooms === 0 ? 'Sold Out' : 'Book Now'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Hotel Details Tabs */}
                <Tabs defaultValue="overview" className="mb-8">
                    <TabsList className="grid grid-cols-4 w-full">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="facilities">Facilities</TabsTrigger>
                        <TabsTrigger value="rooms">Rooms</TabsTrigger>
                        <TabsTrigger value="policies">Policies</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <Card className="border-orange-200">
                            <CardHeader>
                                <CardTitle>About This Hotel</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700">{hotel.description}</p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                                        <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                                        <p className="font-medium">Check-in</p>
                                        <p className="text-gray-600">{hotel.check_in_time}</p>
                                    </div>
                                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                                        <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                                        <p className="font-medium">Check-out</p>
                                        <p className="text-gray-600">{hotel.check_out_time}</p>
                                    </div>
                                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                                        <Capacity className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                                        <p className="font-medium">Capacity</p>
                                        <p className="text-gray-600">
                                            {Object.values(hotel.room_capacity || {}).reduce((max: number, room: any) => {
                                                return Math.max(max, (room.max_adults || 0) + (room.max_children || 0));
                                            }, 0)} guests max
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                                        <Bed className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                                        <p className="font-medium">Star Rating</p>
                                        <div className="flex justify-center">
                                            {[...Array(hotel.star_rating)].map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="facilities">
                        <Card className="border-orange-200">
                            <CardHeader>
                                <CardTitle>Facilities & Amenities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {hotel.facilities.map((facility, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                            {getFacilityIcon(facility)}
                                            <span className="font-medium">{facility}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="rooms">
                        <Card className="border-orange-200">
                            <CardHeader>
                                <CardTitle>Room Types</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {hotel.room_types.map((roomType, index) => (
                                        <div key={index} className="p-4 border border-orange-200 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-semibold text-lg">
                                                    {roomType.charAt(0).toUpperCase() + roomType.slice(1)} Room
                                                </h4>
                                                <Badge variant="outline" className="text-orange-600">
                                                    Available
                                                </Badge>
                                            </div>
                                            <p className="text-gray-600 mt-2">
                                                Comfortable {roomType} room with all modern amenities.
                                            </p>
                                            <div className="flex items-center gap-4 mt-3 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Capacity className="h-4 w-4" />
                                                    <span>
                                                        Max {hotel.room_capacity?.[roomType]?.max_adults || 2} adults,
                                                        {hotel.room_capacity?.[roomType]?.max_children || 2} children
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6">
                                    <h4 className="font-semibold text-lg mb-3">Meal Plans Available</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {hotel.meal_plans.map((plan, index) => (
                                            <div key={index} className="p-4 bg-orange-50 rounded-lg">
                                                <Breakfast className="h-6 w-6 text-orange-500 mb-2" />
                                                <h5 className="font-medium">
                                                    {plan.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                </h5>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="policies">
                        <Card className="border-orange-200">
                            <CardHeader>
                                <CardTitle>Hotel Policies</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {hotel.policies ? (
                                    <div className="space-y-4">
                                        {Object.entries(hotel.policies).map(([key, value]) => (
                                            <div key={key} className="flex items-start gap-3">
                                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                                <div>
                                                    <p className="font-medium capitalize">{key.replace('_', ' ')}:</p>
                                                    <p className="text-gray-600">{value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-600">No specific policies listed.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Contact Information */}
                <Card className="border-orange-200">
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-orange-500" />
                                <div>
                                    <p className="font-medium">Phone</p>
                                    <p className="text-gray-600">{hotel.contact_phone || 'Not available'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-orange-500" />
                                <div>
                                    <p className="font-medium">Email</p>
                                    <p className="text-gray-600">{hotel.contact_email || 'Not available'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-orange-500" />
                                <div>
                                    <p className="font-medium">Address</p>
                                    <p className="text-gray-600">{hotel.address}, {hotel.city}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HotelDetails;