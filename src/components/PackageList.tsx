import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, MapPin, Download, Eye } from "lucide-react";
import { Package, Route } from '../types';
import { useNavigate } from 'react-router-dom';

interface PackageListProps {
    onPackageSelect: (pkg: Package) => void;
}

type ImageUrlData = string | string[] | null | undefined;
type RoutesData = Route[] | string | object | null | undefined;

const PackageList = ({ onPackageSelect }: PackageListProps) => {
    const navigate = useNavigate();
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getImageUrl = (imageUrls: ImageUrlData): string => {
        try {
            if (!imageUrls) return '/default-package.jpg';

            if (typeof imageUrls === 'string') {
                if (imageUrls.startsWith('http')) {
                    return imageUrls;
                }
                if (imageUrls.startsWith('[')) {
                    const parsed = JSON.parse(imageUrls);
                    return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : '/default-package.jpg';
                }
                return '/default-package.jpg';
            }

            if (Array.isArray(imageUrls)) {
                return imageUrls.length > 0 ? imageUrls[0] : '/default-package.jpg';
            }

            return '/default-package.jpg';
        } catch (error) {
            console.error('Error parsing image URLs:', error);
            return '/default-package.jpg';
        }
    };

    const getRoutes = (routesData: RoutesData): Route[] => {
        if (!routesData) return [];

        try {
            if (Array.isArray(routesData)) {
                return routesData;
            }

            if (typeof routesData === 'string') {
                if (routesData.startsWith('[') || routesData.startsWith('{')) {
                    const parsed = JSON.parse(routesData);
                    return Array.isArray(parsed) ? parsed : [];
                }
                return [];
            }

            if (typeof routesData === 'object' && routesData !== null) {
                const routeLike = routesData as Partial<Route>;
                if (routeLike.day || routeLike.location) {
                    return [routesData as Route];
                }
            }

            return [];
        } catch (error) {
            console.error('Error parsing routes:', error);
            return [];
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            setError(null);
            const response = await fetch('http://localhost:5001/api/packages');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📦 Fetched packages:', data);
            setPackages(data);
        } catch (error) {
            console.error('Error fetching packages:', error);
            setError('Failed to load packages. Please try again later.');
        } finally {
            setLoading(false);
        }
    };



    const handleViewDetails = (pkg: Package) => {
        // Navigate to package detail page
        navigate(`/package/${pkg.package_id}`);
    };

    if (loading) {
        return (
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading packages...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                            Tour Packages
                        </h2>
                        <p className="text-gray-600 text-lg mb-8">{error}</p>
                        <Button onClick={fetchPackages} className="bg-orange-500 hover:bg-orange-600 text-white">
                            Try Again
                        </Button>
                    </div>
                </div>
            </section>
        );
    }

    if (packages.length === 0) {
        return (
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                            Tour Packages
                        </h2>
                        <p className="text-gray-600 text-lg mb-8">
                            No packages available at the moment.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Tour Packages
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Discover our carefully curated Sri Lankan adventures
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {packages.map((pkg) => {
                        const routes = getRoutes(pkg.routes);
                        const imageUrl = getImageUrl(pkg.image_urls);
                        const displayPrice = pkg.per_person_cost || pkg.price_per_person_usd;

                        return (
                            <Card key={pkg.package_id} className="group overflow-hidden border-2 border-transparent hover:border-orange-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={imageUrl}
                                        alt={pkg.package_name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/default-package.jpg';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                                        {pkg.duration_days} Days
                                    </div>
                                </div>

                                <CardContent className="p-6 space-y-4">
                                    <h3 className="font-serif text-2xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                                        {pkg.package_name}
                                    </h3>

                                    <p className="text-gray-600 leading-relaxed line-clamp-3">
                                        {pkg.description}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-gray-500 border-t border-b border-gray-200 py-3">
                                        <div className="flex items-center space-x-2">
                                            <Calendar size={16} className="text-orange-500" />
                                            <span>{pkg.duration_days} days</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Users size={16} className="text-blue-500" />
                                            <span>Max 20 people</span>
                                        </div>
                                    </div>

                                    {routes.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-start space-x-2">
                                                <MapPin size={18} className="text-green-500 mt-1 flex-shrink-0" />
                                                <div className="text-sm text-gray-600">
                                                    <strong className="text-gray-800">Route: </strong>
                                                    {routes.slice(0, 3).map((route: Route) => route.location).join(' → ')}
                                                    {routes.length > 3 && '...'}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Starting from</p>
                                            <p className="text-2xl font-bold text-orange-500">${displayPrice}</p>
                                            <p className="text-xs text-gray-500">per person</p>
                                        </div>
                                        <div className="flex space-x-2">


                                            <Button
                                                onClick={() => handleViewDetails(pkg)}
                                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                                            >
                                                <Eye size={16} className="mr-2" />
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default PackageList;