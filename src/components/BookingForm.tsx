import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, User, Mail, Phone, MapPin, FileText, ChevronLeft, Users } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';

interface Package {
    package_id: string;
    package_name: string;
    per_person_cost: number;
}

const BookingForm = () => {
    const navigate = useNavigate();
    const { packageId } = useParams<{ packageId: string }>();
    const [packageData, setPackageData] = useState<Package | null>(null);
    const [step, setStep] = useState(1);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [calculation, setCalculation] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingData, setBookingData] = useState<any>(null);

    // User details form
    const [userDetails, setUserDetails] = useState({
        full_name: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        passport_number: '',
        emergency_contact: '',
        special_requirements: ''
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        if (packageId) {
            fetchPackageData();
        }
    }, [packageId]);

    const fetchPackageData = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/packages/${packageId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setPackageData(data);
        } catch (error) {
            console.error('Error fetching package:', error);
            alert('Failed to load package details.');
            navigate('/packages');
        }
    };

    const calculatePrice = async () => {
        if (!packageId) return;

        try {
            const response = await fetch('http://localhost:5001/api/calculate-price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    package_id: packageId,
                    adults: parseInt(adults.toString()),
                    children: parseInt(children.toString())
                })
            });

            const data = await response.json();
            setCalculation(data);
            setStep(2);
        } catch (error) {
            console.error('Error calculating price:', error);
            alert('Failed to calculate price. Please try again.');
        }
    };

    // FIXED: handleSubmitBooking with better error handling
    const handleSubmitBooking = async () => {
        if (!packageData || !packageId) {
            alert('Package data is missing. Please try again.');
            return;
        }

        // Validate required fields
        if (!userDetails.full_name.trim()) {
            alert('Full name is required');
            return;
        }
        if (!userDetails.email.trim()) {
            alert('Email is required');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userDetails.email)) {
            alert('Please enter a valid email address');
            return;
        }
        if (!userDetails.phone.trim()) {
            alert('Phone number is required');
            return;
        }
        if (!userDetails.country.trim()) {
            alert('Country is required');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5001/api/book-package', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    package_id: packageId,
                    user_details: userDetails,
                    total_cost: calculation?.totalCost || 0,
                    adults: adults,
                    children: children
                })
            });

            const data = await response.json();
            console.log('Booking response:', data);

            if (!response.ok) {
                throw new Error(data.error || data.details || 'Booking submission failed');
            }

            if (data.success) {
                setBookingData({
                    bookingId: data.booking_id,
                    packageName: data.package_name || packageData.package_name,
                    totalAmount: data.total_cost || calculation?.totalCost || 0,
                    email: data.email || userDetails.email
                });
                setBookingSuccess(true);
                setStep(3);
            } else {
                alert(`Booking submission failed: ${data.error || 'Please try again.'}`);
            }
        } catch (error: any) {
            console.error('Error submitting booking:', error);
            alert(`Failed to submit booking: ${error.message || 'Please check your connection and try again.'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setUserDetails({
            ...userDetails,
            [e.target.name]: e.target.value
        });
    };

    const handlePayment = async () => {
        if (!bookingData?.bookingId) return;

        try {
            const response = await fetch('http://localhost:5001/api/update-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    booking_id: bookingData.bookingId,
                    payment_status: 'partially_paid',
                    payment_amount: 50 // Example: $50 partial payment
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('✅ Thank you for your payment! Your booking is now confirmed.\n\nA travel consultant will contact you within 24 hours.');
                navigate('/packages');
            } else {
                alert('Payment processed! A travel consultant will contact you shortly.');
                navigate('/packages');
            }
        } catch (error) {
            console.error('Error updating payment:', error);
            alert('Payment processed! A travel consultant will contact you shortly.');
            navigate('/packages');
        }
    };

    if (!packageData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading booking form...</p>
                </div>
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="mb-4"
                    >
                        <ChevronLeft size={20} className="mr-2" />
                        Back to Package
                    </Button>

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                        <h1 className="font-serif text-3xl font-bold mb-2">Book Your Tour</h1>
                        <p className="text-orange-100">Complete your booking for: <span className="font-semibold">{packageData.package_name}</span></p>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="flex justify-between mb-8 relative">
                    <div className={`flex-1 text-center ${step >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${step >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
                            1
                        </div>
                        <span className="text-sm font-medium">Calculate Price</span>
                    </div>
                    <div className={`flex-1 text-center ${step >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${step >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
                            2
                        </div>
                        <span className="text-sm font-medium">Personal Details</span>
                    </div>
                    <div className={`flex-1 text-center ${step >= 3 ? 'text-orange-600' : 'text-gray-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${step >= 3 ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
                            3
                        </div>
                        <span className="text-sm font-medium">Confirmation</span>
                    </div>
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
                        <div className={`h-full bg-orange-600 transition-all duration-300 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`}></div>
                    </div>
                </div>

                {/* Step 1: Participant Calculation */}
                {step === 1 && (
                    <Card className="shadow-xl border-none">
                        <CardContent className="p-8">
                            <div className="text-center mb-8">
                                <Calculator className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Calculate Your Tour Cost</h2>
                                <p className="text-gray-600">Select number of participants to calculate total price</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <div className="flex items-center mb-4">
                                        <Users className="text-orange-500 mr-3" />
                                        <h3 className="font-semibold text-gray-800">Number of Adults</h3>
                                    </div>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={adults}
                                        onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                                        className="w-full text-2xl font-bold text-center py-4"
                                    />
                                    <p className="text-sm text-gray-500 mt-2">Age 12+ years</p>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <div className="flex items-center mb-4">
                                        <Users className="text-blue-500 mr-3" />
                                        <h3 className="font-semibold text-gray-800">Number of Children</h3>
                                    </div>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={children}
                                        onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                                        className="w-full text-2xl font-bold text-center py-4"
                                    />
                                    <p className="text-sm text-gray-500 mt-2">Age 3-11 years (50% discount)</p>
                                </div>
                            </div>

                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8">
                                <p className="text-sm text-orange-800">
                                    <strong>Note:</strong> Children under 3 years travel free. Children aged 3-11 years pay 50% of adult price.
                                </p>
                            </div>

                            <Button
                                onClick={calculatePrice}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold shadow-lg"
                                size="lg"
                            >
                                <Calculator size={24} className="mr-3" />
                                Calculate Total Price & Continue
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: User Details Form */}
                {step === 2 && calculation && (
                    <Card className="shadow-xl border-none">
                        <CardContent className="p-8">
                            {/* Price Summary */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-6 mb-8 border border-green-200">
                                <h4 className="font-bold text-green-800 text-lg mb-4">Price Summary</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">{calculation.adults} Adults × ${calculation.perPersonCost}</span>
                                        <span className="font-semibold text-gray-800">${calculation.adultCost}</span>
                                    </div>
                                    {calculation.children > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">{calculation.children} Children × ${calculation.perPersonCost / 2}</span>
                                            <span className="font-semibold text-gray-800">${calculation.childCost}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-green-300 pt-3 mt-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-800">Total Cost</span>
                                            <span className="text-2xl font-bold text-green-700">${calculation.totalCost}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* User Details Form */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Personal Information</h3>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <User size={18} className="mr-2 text-orange-500" />
                                            Full Name *
                                        </label>
                                        <Input
                                            name="full_name"
                                            value={userDetails.full_name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <Mail size={18} className="mr-2 text-orange-500" />
                                            Email Address *
                                        </label>
                                        <Input
                                            name="email"
                                            type="email"
                                            value={userDetails.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <Phone size={18} className="mr-2 text-orange-500" />
                                            Phone Number *
                                        </label>
                                        <Input
                                            name="phone"
                                            value={userDetails.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full"
                                            placeholder="+94 77 123 4567"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <MapPin size={18} className="mr-2 text-orange-500" />
                                            Country *
                                        </label>
                                        <Input
                                            name="country"
                                            value={userDetails.country}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full"
                                            placeholder="Your country"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <MapPin size={18} className="mr-2 text-blue-500" />
                                            City
                                        </label>
                                        <Input
                                            name="city"
                                            value={userDetails.city}
                                            onChange={handleInputChange}
                                            className="w-full"
                                            placeholder="Your city"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <FileText size={18} className="mr-2 text-blue-500" />
                                            Passport Number
                                        </label>
                                        <Input
                                            name="passport_number"
                                            value={userDetails.passport_number}
                                            onChange={handleInputChange}
                                            className="w-full"
                                            placeholder="AB1234567 (optional)"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">Emergency Contact</label>
                                    <Input
                                        name="emergency_contact"
                                        value={userDetails.emergency_contact}
                                        onChange={handleInputChange}
                                        className="w-full"
                                        placeholder="Emergency contact number"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">Special Requirements / Notes</label>
                                    <Textarea
                                        name="special_requirements"
                                        value={userDetails.special_requirements}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full"
                                        placeholder="Any dietary restrictions, medical conditions, special requests..."
                                    />
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>Important:</strong> Your information is secure and will only be used for booking purposes.
                                        A travel consultant will contact you within 24 hours to finalize your booking.
                                    </p>
                                </div>

                                <div className="flex space-x-4 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-6"
                                    >
                                        Back to Calculation
                                    </Button>
                                    <Button
                                        onClick={handleSubmitBooking}
                                        disabled={loading || !userDetails.full_name || !userDetails.email || !userDetails.phone || !userDetails.country}
                                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold"
                                    >
                                        {loading ? 'Submitting...' : 'Submit Booking & Continue'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Confirmation & Payment */}
                {step === 3 && bookingSuccess && (
                    <Card className="shadow-xl border-none">
                        <CardContent className="p-8">
                            <div className="text-center mb-8">
                                <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>

                                <h2 className="text-3xl font-bold text-gray-800 mb-4">Booking Submitted Successfully! 🎉</h2>

                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8">
                                    <h3 className="font-bold text-green-800 text-xl mb-4">Booking Details</h3>
                                    <div className="grid md:grid-cols-2 gap-4 text-left">
                                        <div>
                                            <p className="text-sm text-gray-600">Booking ID</p>
                                            <p className="font-mono font-bold text-gray-800">{bookingData.bookingId}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Package</p>
                                            <p className="font-semibold text-gray-800">{bookingData.packageName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Total Amount</p>
                                            <p className="text-2xl font-bold text-orange-600">${bookingData.totalAmount}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Contact Email</p>
                                            <p className="font-semibold text-gray-800">{bookingData.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Section */}
                                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-8 mb-8 border border-orange-200">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Secure Your Booking</h3>
                                    <p className="text-gray-600 mb-6">
                                        Pay any amount now to secure your tour. The remaining balance can be paid later or upon arrival.
                                    </p>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                                            <span className="text-gray-700">Minimum Deposit</span>
                                            <span className="text-lg font-bold text-orange-600">$50</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                                            <span className="text-gray-700">Full Payment</span>
                                            <span className="text-lg font-bold text-green-600">${bookingData.totalAmount}</span>
                                        </div>
                                    </div>

                                    {/* Payment Button */}
                                    <Button
                                        onClick={handlePayment}
                                        className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white py-6 text-xl font-bold shadow-lg hover:shadow-xl transition-all"
                                        size="lg"
                                    >
                                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Pay Any Amount to Secure Your Tour
                                    </Button>

                                    <p className="text-sm text-gray-500 mt-4">
                                        Secure payment gateway • SSL encrypted • No booking fees
                                    </p>
                                </div>

                                {/* Next Steps */}
                                <div className="bg-blue-50 rounded-xl p-6 mb-8">
                                    <h4 className="font-bold text-blue-800 text-lg mb-4">What happens next?</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-blue-100 p-2 rounded-lg">
                                                <Phone className="text-blue-600" size={18} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">24/7 WhatsApp Support</p>
                                                <p className="text-sm text-gray-600">Available throughout your journey</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="bg-green-100 p-2 rounded-lg">
                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Email Confirmation</p>
                                                <p className="text-sm text-gray-600">Receive detailed itinerary within 24 hours</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="border-t pt-6">
                                    <p className="text-sm text-gray-500 mb-4">Questions about your booking?</p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                        <a href="tel:+94777325515" className="text-blue-600 hover:text-blue-800 font-medium">
                                            <Phone size={16} className="inline mr-2" />
                                            +94 777 325 515
                                        </a>
                                        <span className="text-gray-300">•</span>
                                        <a href="mailto:clientservice@lanka-vacations.com" className="text-blue-600 hover:text-blue-800 font-medium">
                                            <Mail size={16} className="inline mr-2" />
                                            clientservice@lanka-vacations.com
                                        </a>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/packages')}
                                    className="mt-8"
                                >
                                    Return to Packages
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </section>
    );
};

export default BookingForm;