// src/pages/ViewDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
    Package,
    CalendarDays,
    Hotel,
    User,
    ArrowLeft,
    Clock,
    Users,
    MapPin,
    CreditCard,
    FileText,
    Eye,
    CheckCircle,
    XCircle,
    ChevronRight,
    Download,
    Edit,
    Trash2,
    Plus,
    AlertCircle,
    RefreshCw,
    Settings,
    CreditCard as CardIcon,
    HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

interface PackageBooking {
    booking_id: string;
    package_id: string;
    package_name: string;
    booking_date: string;
    booking_status: 'pending' | 'confirmed' | 'paid' | 'cancelled' | 'completed';
    payment_status: string;
    total_cost: string | number;
    travelers: number;
    duration: string | number;
    image_urls: string[];
    routes?: any[];
}

interface ItineraryBooking {
    id: string;
    title: string;
    created_date: string;
    dates: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    activities: string[];
    travelers: number;
    description: string;
    interests?: any[];
    preferred_destinations?: any[];
    itinerary_data?: any;
    ai_recommendations?: any;
    exact_days?: number;
    total_cost?: string | number;
    booking_status?: string;
    adults?: number;
    children?: number;
    email?: string;
    full_name?: string;
}

interface HotelBooking {
    id: string;
    hotel_booking_id: string;
    hotelName: string;
    location: string;
    checkIn: string;
    checkOut: string;
    status: string;
    price: string;
    guests: number;
    roomType: string;
    nights: number;
    total: string;
    hotel_id: string;
    num_adults: number;
    num_children: number;
    num_rooms: number;
    total_price: number;
    booking_status: string;
    check_in_date: string;
    check_out_date: string;
}

const ViewDashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, deleteAccount } = useAuth(); // Get deleteAccount at top level
    const [activeTab, setActiveTab] = useState("packages");
    const [loading, setLoading] = useState({
        packages: false,
        itinerary: false,
        hotels: false
    });
    const [packageBookings, setPackageBookings] = useState<PackageBooking[]>([]);
    const [itineraryBookings, setItineraryBookings] = useState<ItineraryBooking[]>([]);
    const [hotelBookings, setHotelBookings] = useState<HotelBooking[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['packages', 'itinerary', 'hotels', 'settings'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        if (user?.user_id) {
            fetchData();
        }
    }, [user, activeTab]);

    const fetchData = async () => {
        if (!user?.user_id) return;

        try {
            switch (activeTab) {
                case 'packages':
                    await fetchPackageBookings();
                    break;
                case 'itinerary':
                    await fetchItineraryBookings();
                    break;
                case 'hotels':
                    await fetchHotelBookings();
                    break;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: "Error",
                description: "Failed to fetch data. Please try again.",
                variant: "destructive"
            });
        }
    };

    const fetchPackageBookings = async () => {
        setLoading(prev => ({ ...prev, packages: true }));
        setError(null);

        try {
            console.log('📦 Fetching package bookings for user:', user?.user_id);
            const response = await fetch(`${API_BASE_URL}/dashboard/package-bookings/${user?.user_id}`);
            const data = await response.json();

            console.log('📦 Package bookings response:', data);

            if (data.success && data.bookings) {
                setPackageBookings(data.bookings);
            } else {
                setError(data.error || 'Failed to fetch package bookings');
                toast({
                    title: "Error",
                    description: data.error || "Failed to fetch package bookings",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error fetching package bookings:', error);
            setError('Failed to fetch package bookings');
            toast({
                title: "Error",
                description: "Failed to fetch package bookings",
                variant: "destructive"
            });
        } finally {
            setLoading(prev => ({ ...prev, packages: false }));
        }
    };

    const fetchItineraryBookings = async () => {
        setLoading(prev => ({ ...prev, itinerary: true }));
        setError(null);

        try {
            console.log('🗺️ Fetching AI itinerary bookings for user:', user?.user_id);

            const response = await fetch(`${API_BASE_URL}/dashboard/itinerary-bookings/${user?.user_id}`);
            const data = await response.json();

            console.log('🗺️ AI itinerary bookings response:', data);

            if (data.success && data.bookings) {
                console.log(`✅ Found ${data.bookings.length} AI itinerary bookings`);

                // Direct mapping - server already transformed the data
                setItineraryBookings(data.bookings);
            } else {
                console.log('⚠️ No AI itinerary bookings found');
                setItineraryBookings([]);

                if (data.error) {
                    setError(data.error);
                    toast({
                        title: "Error",
                        description: data.error,
                        variant: "destructive"
                    });
                }
            }
        } catch (error) {
            console.error('❌ Error fetching AI itinerary bookings:', error);
            setError('Failed to fetch itinerary bookings');
            toast({
                title: "Error",
                description: "Failed to fetch itinerary bookings",
                variant: "destructive"
            });
        } finally {
            setLoading(prev => ({ ...prev, itinerary: false }));
        }
    };

    const fetchHotelBookings = async () => {
        setLoading(prev => ({ ...prev, hotels: true }));
        setError(null);

        try {
            console.log('🏨 Fetching hotel bookings for user:', user?.user_id);
            const response = await fetch(`${API_BASE_URL}/hotels/bookings/${user?.user_id}`);
            const data = await response.json();

            console.log('🏨 Hotel bookings response:', data);

            if (data.success && data.bookings) {
                setHotelBookings(data.bookings);
            } else {
                setError(data.error || 'Failed to fetch hotel bookings');
                toast({
                    title: "Error",
                    description: data.error || "Failed to fetch hotel bookings",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error fetching hotel bookings:', error);
            setError('Failed to fetch hotel bookings');
            toast({
                title: "Error",
                description: "Failed to fetch hotel bookings",
                variant: "destructive"
            });
        } finally {
            setLoading(prev => ({ ...prev, hotels: false }));
        }
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'confirmed':
            case 'paid':
            case 'completed':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" /> Confirmed</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>;
            case 'draft':
                return <Badge variant="outline"><FileText className="h-3 w-3 mr-1" /> Draft</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleDeleteItinerary = async (bookingId: string) => {
        console.log('🔄 Delete button clicked for booking ID:', bookingId);
        if (!confirm('Are you sure you want to delete this AI itinerary?')) return;

        try {
            // Delete from bookings table
            const response = await fetch(`${API_BASE_URL}/dashboard/ai-itinerary-booking/${bookingId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: "AI itinerary deleted successfully"
                });
                fetchItineraryBookings();
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to delete itinerary",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error deleting AI itinerary:', error);
            toast({
                title: "Error",
                description: "Failed to delete itinerary",
                variant: "destructive"
            });
        }
    };

    const handleDeletePackageBooking = async (bookingId: string) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/package-booking/${bookingId}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Booking cancelled successfully"
                });
                fetchPackageBookings();
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to cancel booking",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            toast({
                title: "Error",
                description: "Failed to cancel booking",
                variant: "destructive"
            });
        }
    };

    const handleDeleteHotelBooking = async (bookingId: string) => {
        if (!confirm('Are you sure you want to cancel this hotel booking?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/hotels/bookings/${bookingId}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Hotel booking cancelled successfully"
                });
                fetchHotelBookings();
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to cancel booking",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error cancelling hotel booking:', error);
            toast({
                title: "Error",
                description: "Failed to cancel booking",
                variant: "destructive"
            });
        }
    };

    // NEW: Handle delete account
    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        try {
            const password = prompt('Please enter your password to confirm:');
            if (!password) {
                return;
            }

            await deleteAccount(password);
            toast({
                title: "Account Deleted",
                description: "Your account has been deleted successfully."
            });
        } catch (error: any) {
            console.error('Error deleting account:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to delete account",
                variant: "destructive"
            });
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Date not available';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString;
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    const formatCurrency = (amount: string | number) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(numAmount);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
                <Card className="max-w-md border-orange-200">
                    <CardHeader>
                        <CardTitle className="text-orange-600">Access Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">Please log in to view your dashboard.</p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={() => navigate('/login')}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-600"
                        >
                            Go to Login
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/')}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 mb-2"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Home
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                        <p className="text-gray-600 mt-2">
                            Welcome back, <span className="font-semibold text-orange-600">{user?.full_name || user?.first_name}</span>!
                            Manage your bookings and travel plans here.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-orange-200">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold">
                                {user?.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{user?.full_name}</p>
                                <p className="text-sm text-gray-600">{user?.email}</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => navigate('/update-profile')}
                            variant="outline"
                            className="border-orange-400 text-orange-600 hover:bg-orange-50"
                        >
                            <User className="h-4 w-4 mr-2" />
                            Profile
                        </Button>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="border-orange-200 hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Package Bookings</p>
                                    <h3 className="text-2xl font-bold mt-2">{packageBookings.length}</h3>
                                    <p className="text-sm text-green-600 mt-1">
                                        {packageBookings.filter(b => b.booking_status === 'confirmed' || b.booking_status === 'paid').length} confirmed
                                    </p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                                    <Package className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-200 hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Itinerary Bookings</p>
                                    <h3 className="text-2xl font-bold mt-2">{itineraryBookings.length}</h3>
                                    <p className="text-sm text-green-600 mt-1">
                                        {itineraryBookings.filter(b => b.status === 'confirmed').length} confirmed
                                    </p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                                    <CalendarDays className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-200 hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Hotel Bookings</p>
                                    <h3 className="text-2xl font-bold mt-2">{hotelBookings.length}</h3>
                                    <p className="text-sm text-green-600 mt-1">
                                        {hotelBookings.filter(b => b.status === 'confirmed').length} confirmed
                                    </p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                                    <Hotel className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                        <TabsTrigger value="packages" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
                            <Package className="h-4 w-4 mr-2" />
                            Packages
                            {loading.packages && <RefreshCw className="h-3 w-3 ml-2 animate-spin" />}
                        </TabsTrigger>
                        <TabsTrigger value="itinerary" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Itineraries
                            {loading.itinerary && <RefreshCw className="h-3 w-3 ml-2 animate-spin" />}
                        </TabsTrigger>
                        <TabsTrigger value="hotels" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
                            <Hotel className="h-4 w-4 mr-2" />
                            Hotels
                            {loading.hotels && <RefreshCw className="h-3 w-3 ml-2 animate-spin" />}
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="packages" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Package Bookings</h2>
                                <p className="text-gray-600">Manage your tour package bookings</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={fetchPackageBookings}
                                    variant="outline"
                                    size="sm"
                                    disabled={loading.packages}
                                    className="border-orange-400 text-orange-600"
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${loading.packages ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                                <Button
                                    onClick={() => navigate('/packages')}
                                    className="bg-gradient-to-r from-orange-500 to-amber-600"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Book New Package
                                </Button>
                            </div>
                        </div>

                        {loading.packages ? (
                            <div className="flex justify-center items-center py-12">
                                <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
                            </div>
                        ) : packageBookings.length === 0 ? (
                            <Card className="border-orange-200">
                                <CardContent className="pt-6 text-center py-12">
                                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Package Bookings Yet</h3>
                                    <p className="text-gray-600 mb-6">You haven't booked any tour packages yet.</p>
                                    <Button
                                        onClick={() => navigate('/packages')}
                                        className="bg-gradient-to-r from-orange-500 to-amber-600"
                                    >
                                        Browse Packages
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {packageBookings.map((booking) => (
                                    <Card key={booking.booking_id} className="border-orange-200 hover:shadow-lg transition-all duration-300">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-lg">{booking.package_name}</CardTitle>
                                                    <CardDescription className="flex items-center gap-2 mt-1">
                                                        <Clock className="h-3 w-3" />
                                                        {booking.duration} days • {formatDate(booking.booking_date)}
                                                    </CardDescription>
                                                </div>
                                                {getStatusBadge(booking.booking_status)}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    <span>{booking.travelers} travelers</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <CreditCard className="h-4 w-4" />
                                                    <span className="font-semibold">{formatCurrency(booking.total_cost)}</span>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <img
                                                    src={booking.image_urls?.[0] || 'https://images.unsplash.com/photo-1564574662336-88c9f5a6c8d9'}
                                                    alt={booking.package_name}
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-between">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/package/${booking.package_id}`)}
                                                className="border-orange-400 text-orange-600"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                            {(booking.booking_status === 'pending' || booking.booking_status === 'confirmed') && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-red-400 text-red-600"
                                                    onClick={() => handleDeletePackageBooking(booking.booking_id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Cancel
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="itinerary" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Itinerary Bookings</h2>
                                <p className="text-gray-600">Manage your AI-generated travel itineraries</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={fetchItineraryBookings}
                                    variant="outline"
                                    size="sm"
                                    disabled={loading.itinerary}
                                    className="border-orange-400 text-orange-600"
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${loading.itinerary ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                                <Button
                                    onClick={() => navigate('/plan-your-travel')}
                                    className="bg-gradient-to-r from-orange-500 to-amber-600"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create New Itinerary
                                </Button>
                            </div>
                        </div>

                        {loading.itinerary ? (
                            <div className="flex justify-center items-center py-12">
                                <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
                            </div>
                        ) : itineraryBookings.length === 0 ? (
                            <Card className="border-orange-200">
                                <CardContent className="pt-6 text-center py-12">
                                    <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Itineraries Yet</h3>
                                    <p className="text-gray-600 mb-6">You haven't created any AI-generated travel itineraries yet.</p>
                                    <Button
                                        onClick={() => navigate('/plan-your-travel')}
                                        className="bg-gradient-to-r from-orange-500 to-amber-600"
                                    >
                                        Create AI Itinerary
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {itineraryBookings.map((itinerary) => (
                                    <Card key={itinerary.id} className="border-orange-200 hover:shadow-lg transition-all duration-300">
                                        <CardContent className="pt-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <h3 className="text-lg font-semibold">{itinerary.title}</h3>
                                                        {getStatusBadge(itinerary.booking_status || itinerary.status)}
                                                    </div>

                                                    <p className="text-gray-600 mb-3">
                                                        {itinerary.description} • {itinerary.travelers} travelers • {itinerary.exact_days || 7} days
                                                    </p>

                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <CalendarDays className="h-4 w-4" />
                                                            <span>Created: {formatDate(itinerary.created_date)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            <span>Duration: {itinerary.dates}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="h-4 w-4" />
                                                            <span>{itinerary.travelers} travelers</span>
                                                        </div>
                                                        {itinerary.total_cost && (
                                                            <div className="flex items-center gap-1">
                                                                <CreditCard className="h-4 w-4" />
                                                                <span className="font-semibold">{formatCurrency(itinerary.total_cost)}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {itinerary.activities && itinerary.activities.length > 0 && (
                                                        <div className="mt-3">
                                                            <p className="text-sm font-medium text-gray-700 mb-1">Activities/Interests:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {itinerary.activities.slice(0, 5).map((activity, idx) => (
                                                                    <Badge key={idx} variant="secondary" className="bg-orange-50 text-orange-700">
                                                                        {activity}
                                                                    </Badge>
                                                                ))}
                                                                {itinerary.activities.length > 5 && (
                                                                    <Badge variant="outline" className="text-gray-500">
                                                                        +{itinerary.activities.length - 5} more
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-red-400 text-red-600"
                                                        onClick={() => handleDeleteItinerary(itinerary.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="hotels" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Hotel Bookings</h2>
                                <p className="text-gray-600">Manage your accommodation bookings</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={fetchHotelBookings}
                                    variant="outline"
                                    size="sm"
                                    disabled={loading.hotels}
                                    className="border-orange-400 text-orange-600"
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${loading.hotels ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                                <Button
                                    onClick={() => navigate('/book-hotel')}
                                    className="bg-gradient-to-r from-orange-500 to-amber-600"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Book New Hotel
                                </Button>
                            </div>
                        </div>

                        {loading.hotels ? (
                            <div className="flex justify-center items-center py-12">
                                <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
                            </div>
                        ) : hotelBookings.length === 0 ? (
                            <Card className="border-orange-200">
                                <CardContent className="pt-6 text-center py-12">
                                    <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Hotel Bookings Yet</h3>
                                    <p className="text-gray-600 mb-6">You haven't booked any hotels yet.</p>
                                    <Button
                                        onClick={() => navigate('/book-hotel')}
                                        className="bg-gradient-to-r from-orange-500 to-amber-600"
                                    >
                                        Find Hotels
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {hotelBookings.map((hotel) => (
                                    <Card key={hotel.id} className="border-orange-200 hover:shadow-lg transition-all duration-300">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle>{hotel.hotelName}</CardTitle>
                                                    <CardDescription className="flex items-center gap-1 mt-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {hotel.location}
                                                    </CardDescription>
                                                </div>
                                                {getStatusBadge(hotel.status)}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Check-in</p>
                                                        <p className="font-medium">{formatDate(hotel.checkIn)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Check-out</p>
                                                        <p className="font-medium">{formatDate(hotel.checkOut)}</p>
                                                    </div>
                                                </div>

                                                <Separator />

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Room Type</p>
                                                        <p className="font-medium">{hotel.roomType}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Guests</p>
                                                        <p className="font-medium">{hotel.guests} guests</p>
                                                    </div>
                                                </div>

                                                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-3 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Total Cost</p>
                                                            <p className="text-xl font-bold text-orange-600">{hotel.total}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-500">{hotel.nights} nights</p>
                                                            <p className="font-medium">{hotel.price}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-between">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-orange-400 text-orange-600"
                                                onClick={() => window.open(`${API_BASE_URL}/generate-pdf/hotel/${hotel.id}`, '_blank')}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Receipt
                                            </Button>
                                            {hotel.status !== 'cancelled' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-red-400 text-red-600"
                                                    onClick={() => handleDeleteHotelBooking(hotel.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Cancel
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="border-orange-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/update-profile')}>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center text-center p-4">
                                        <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full mb-4">
                                            <User className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">Update Profile</h3>
                                        <p className="text-sm text-gray-600 mb-4">Edit your personal information and preferences</p>
                                        <Button variant="outline" className="w-full border-orange-400 text-orange-600">
                                            Go to Profile <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-orange-200 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/change-password')}>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center text-center p-4">
                                        <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full mb-4">
                                            <CardIcon className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">Change Password</h3>
                                        <p className="text-sm text-gray-600 mb-4">Update your account password for security</p>
                                        <Button variant="outline" className="w-full border-orange-400 text-orange-600">
                                            Change Password <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* FIXED: Delete Account Card - Using the handleDeleteAccount function */}
                            <Card
                                className="border-orange-200 hover:shadow-lg transition-all cursor-pointer"
                                onClick={handleDeleteAccount}
                            >
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center text-center p-4">
                                        <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-4">
                                            <Trash2 className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">Delete Account</h3>
                                        <p className="text-sm text-gray-600 mb-4">Permanently delete your account and all data</p>
                                        <Button
                                            variant="outline"
                                            className="w-full border-red-400 text-red-600"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent card onClick from firing
                                                handleDeleteAccount();
                                            }}
                                        >
                                            Delete Account <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-orange-200">
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>Common dashboard actions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        className="w-full border-orange-400 text-orange-600 justify-start"
                                        onClick={() => navigate('/packages')}
                                    >
                                        <Package className="h-4 w-4 mr-2" />
                                        Browse Packages
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full border-orange-400 text-orange-600 justify-start"
                                        onClick={() => navigate('/book-hotel')}
                                    >
                                        <Hotel className="h-4 w-4 mr-2" />
                                        Book Hotel
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full border-orange-400 text-orange-600 justify-start"
                                        onClick={() => navigate('/plan-your-travel')}
                                    >
                                        <CalendarDays className="h-4 w-4 mr-2" />
                                        Create Itinerary
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full border-orange-400 text-orange-600 justify-start"
                                        onClick={() => navigate('/support')}
                                    >
                                        <HelpCircle className="h-4 w-4 mr-2" />
                                        Contact Support
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-orange-200">
                            <CardHeader>
                                <CardTitle>Upcoming Trips</CardTitle>
                                <CardDescription>Your confirmed upcoming travel plans</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {packageBookings.filter(b => b.booking_status === 'confirmed' || b.booking_status === 'paid').length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No upcoming trips scheduled</p>
                                ) : (
                                    <div className="space-y-4">
                                        {packageBookings
                                            .filter(b => b.booking_status === 'confirmed' || b.booking_status === 'paid')
                                            .slice(0, 2)
                                            .map((booking) => (
                                                <div key={booking.booking_id} className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                                                            <CalendarDays className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{booking.package_name}</p>
                                                            <p className="text-sm text-gray-600">{formatDate(booking.booking_date)} • {booking.duration} days</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-orange-600"
                                                        onClick={() => navigate(`/package/${booking.package_id}`)}
                                                    >
                                                        View Details
                                                    </Button>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default ViewDashboard;