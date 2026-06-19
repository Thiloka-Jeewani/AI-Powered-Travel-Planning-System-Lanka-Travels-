import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Star, BookOpen, ChevronRight, Phone, Mail, ChevronLeft } from "lucide-react";
import { Package, Route } from '../types';
import { useNavigate, useParams } from 'react-router-dom';

interface PackageDetailProps {
    onBack?: () => void;
}

interface RouteWithCoordinates extends Route {
    longitude: number;
    latitude: number;
    lat?: number;
    lng?: number;
    destination_id?: string;
}

interface CoordinateData {
    id: string;
    name: string;
    lat: number;
    lng: number;
    type: string;
    day: number;
    location?: string;
    destination_id?: string;
}

type RoutesData = Route[] | string | object | null | undefined;

const PackageDetail = ({ onBack }: PackageDetailProps) => {
    const navigate = useNavigate();
    const { packageId } = useParams<{ packageId: string }>();
    const [packageData, setPackageData] = useState<Package | null>(null);
    const [loading, setLoading] = useState(true);
    const [routeCoordinates, setRouteCoordinates] = useState<CoordinateData[]>([]);
    const [totalDistance, setTotalDistance] = useState<number>(0);
    const [destinationMarkers, setDestinationMarkers] = useState<Array<{id: string, name: string, lat: number, lng: number, type: string, day?: number}>>([]);

    useEffect(() => {
        if (packageId) {
            fetchPackageDetail();
            fetchRouteCoordinates();
        }
    }, [packageId]);

    const fetchPackageDetail = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/packages/${packageId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('📦 Package detail data:', data);
            setPackageData(data);

            if (data.routes) {
                const routes = getRoutes(data.routes);
                const destinations = routes.map((route: RouteWithCoordinates, index: number) => ({
                    id: `${route.location || route.destination_id || 'destination'}-${index}`,
                    name: route.location || 'Destination',
                    lat: route.lat || route.latitude || (Math.random() * 0.5 + 6.5),
                    lng: route.lng || route.longitude || (Math.random() * 0.5 + 79.5),
                    type: 'destination',
                    day: route.day || index + 1
                }));
                setDestinationMarkers(destinations);
            }
        } catch (error) {
            console.error('Error fetching package details:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRouteCoordinates = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/map/package/${packageId}/route`);
            if (!response.ok) return;
            const data = await response.json();
            if (data.success && data.route) {
                const routeData: CoordinateData[] = data.route.map((r: CoordinateData, index: number) => {
                    const locationCount = data.route.slice(0, index).filter((d: CoordinateData) => d.location === r.location).length;
                    const offset = locationCount * 0.001;
                    return {
                        id: `${r.destination_id || r.location}-day-${r.day}`,
                        name: `${r.location} (Day ${r.day})`,
                        lat: r.lat + offset,
                        lng: r.lng + offset,
                        type: r.type || 'destination',
                        day: r.day,
                        location: r.location,
                        destination_id: r.destination_id
                    };
                });
                setRouteCoordinates(routeData);
                setTotalDistance(data.totalDistance || 0);
            }
        } catch (error) {
            console.error('Error fetching route coordinates:', error);
        }
    };

    const handleBookNow = () => {
        if (packageData) {
            // Navigate to booking form page
            navigate(`/book/${packageData.package_id}`);
        }
    };

    const getRoutes = (routesData: RoutesData): RouteWithCoordinates[] => {
        if (!routesData) return [];

        try {
            if (Array.isArray(routesData)) {
                return routesData as RouteWithCoordinates[];
            }

            if (typeof routesData === 'string') {
                if (routesData.startsWith('[') || routesData.startsWith('{')) {
                    const parsed = JSON.parse(routesData);
                    return Array.isArray(parsed) ? parsed as RouteWithCoordinates[] : [];
                }
                return [];
            }

            if (typeof routesData === 'object' && routesData !== null) {
                const routeLike = routesData as Partial<RouteWithCoordinates>;
                if (routeLike.day || routeLike.location) {
                    return [routesData as RouteWithCoordinates];
                }
                return [];
            }

            return [];
        } catch (error) {
            console.error('❌ Error parsing routes:', error);
            console.log('❌ Routes data that caused error:', routesData);
            return [];
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading package details...</p>
            </div>
        );
    }

    if (!packageData) {
        return <div className="text-center py-8">Package not found</div>;
    }

    const routes: RouteWithCoordinates[] = getRoutes(packageData.routes);

    return (
        <section className="py-8 bg-background">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={onBack ? onBack : () => navigate('/packages')}
                        className="flex items-center gap-2"
                    >
                        <ChevronLeft size={20} />
                        Back to Packages
                    </Button>
                </div>

                {/* Package Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h1 className="font-serif text-4xl font-bold text-gray-800 mb-4">
                                {packageData.package_name}
                            </h1>
                            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                                {packageData.description}
                            </p>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center bg-orange-50 p-4 rounded-xl">
                                    <Calendar className="text-orange-500 mx-auto mb-2" size={24} />
                                    <p className="font-semibold text-gray-800">{packageData.duration_days} Days</p>
                                    <p className="text-sm text-gray-500">Duration</p>
                                </div>
                                <div className="text-center bg-blue-50 p-4 rounded-xl">
                                    <Users className="text-blue-500 mx-auto mb-2" size={24} />
                                    <p className="font-semibold text-gray-800">Max 20 people</p>
                                    <p className="text-sm text-gray-500">Group Size</p>
                                </div>
                                <div className="text-center bg-green-50 p-4 rounded-xl">
                                    <Star className="text-green-500 mx-auto mb-2" size={24} />
                                    <p className="font-semibold text-gray-800">{packageData.package_type}</p>
                                    <p className="text-sm text-gray-500">Tour Type</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200">
                            <h3 className="font-semibold text-xl mb-4 text-gray-800">Tour Highlights</h3>
                            {routes.slice(0, 5).map((route: RouteWithCoordinates, index: number) => (
                                <div key={index} className="flex items-center space-x-3 mb-3">
                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {index + 1}
                                    </div>
                                    <span className="text-gray-700 font-medium">{route.location}</span>
                                </div>
                            ))}
                            {routes.length === 0 && (
                                <p className="text-gray-500 italic">No route information available</p>
                            )}
                            <div className="flex space-x-4 mt-6">
                                <Button
                                    onClick={handleBookNow}
                                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl"
                                >
                                    <BookOpen size={18} className="mr-2" />
                                    Book Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Day by Day Itinerary */}
                        <Card className="border shadow-lg">
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-xl mb-6 text-gray-800">Day by Day Itinerary</h3>
                                <div className="space-y-6">
                                    {routes.length > 0 ? (
                                        routes.map((route: RouteWithCoordinates, index: number) => (
                                            <div key={index} className="flex space-x-4 group">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform shadow-lg">
                                                        {route.day || index + 1}
                                                    </div>
                                                    {index < routes.length - 1 && (
                                                        <div className="w-0.5 h-8 bg-gradient-to-b from-orange-300 to-orange-100 mx-auto mt-2"></div>
                                                    )}
                                                </div>
                                                <div className="flex-grow pb-6">
                                                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-5 border-l-4 border-orange-500 hover:shadow-md transition-shadow">
                                                        <h4 className="font-bold text-lg text-gray-800 mb-2">
                                                            Day {route.day || index + 1}: {route.location || 'Destination'}
                                                        </h4>
                                                        <p className="text-gray-600 leading-relaxed mb-3">
                                                            {route.description || 'No description available.'}
                                                        </p>
                                                        {route.activities && Array.isArray(route.activities) && route.activities.length > 0 && (
                                                            <div className="bg-white/80 rounded-xl p-3">
                                                                <p className="font-semibold text-sm mb-2 text-gray-700">Activities:</p>
                                                                <ul className="text-sm text-gray-600 space-y-1">
                                                                    {route.activities.map((activity: string, activityIndex: number) => (
                                                                        <li key={activityIndex} className="flex items-center">
                                                                            <ChevronRight size={16} className="text-orange-500 mr-2" />
                                                                            {activity}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No itinerary details available for this package.</p>
                                            <p className="text-sm mt-2">Please contact us for more information.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Price Card */}
                        <Card className="border shadow-lg">
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-xl mb-4 text-gray-800">Package Price</h3>
                                <div className="text-center mb-6">
                                    <p className="text-4xl font-bold text-orange-500">${packageData.per_person_cost || packageData.price_per_person_usd}</p>
                                    <p className="text-gray-500">per person</p>
                                </div>
                                <Button
                                    onClick={handleBookNow}
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl"
                                >
                                    <BookOpen size={20} className="mr-2" />
                                    Book Now
                                </Button>
                                <p className="text-center text-sm text-gray-500 mt-3">
                                    Secure booking • Best price guarantee
                                </p>
                            </CardContent>
                        </Card>

                        {/* Tour Information */}
                        <Card className="border shadow-lg">
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-xl mb-4 text-gray-800">Tour Information</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b">
                                        <span className="text-gray-600">Duration</span>
                                        <span className="font-semibold text-gray-800">{packageData.duration_days} Days</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b">
                                        <span className="text-gray-600">Tour Type</span>
                                        <span className="font-semibold text-gray-800">{packageData.package_type}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b">
                                        <span className="text-gray-600">Group Size</span>
                                        <span className="font-semibold text-gray-800">Flexible</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-gray-600">Transport</span>
                                        <span className="font-semibold text-gray-800">{packageData.transport_included ? 'Included' : 'Not Included'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card className="border shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-xl mb-4 text-gray-800">Need help planning?</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                                        <Phone size={18} className="text-orange-500" />
                                        <div>
                                            <p className="font-semibold text-gray-800">+94 777 325 515</p>
                                            <p className="text-sm text-gray-600">24/7 WhatsApp Available</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
                                        <Mail size={18} className="text-orange-500" />
                                        <div>
                                            <p className="font-semibold text-gray-800">clientservice@</p>
                                            <p className="text-sm text-gray-600">lanka-vacations.com</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-blue-200">
                                    <p className="text-sm text-gray-600">
                                        Our travel experts are available to help customize your itinerary.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PackageDetail;