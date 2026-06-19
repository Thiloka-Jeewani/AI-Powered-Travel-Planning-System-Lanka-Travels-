import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Calculator, User, Mail, Phone, MapPin, FileText, CreditCard } from "lucide-react";
import DestinationMap from './DestinationMap';

interface Package {
  package_id: string;
  package_name: string;
  per_person_cost: number;
  routes?: any;
}

interface BookingModalProps {
  package: Package;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: (bookingData: {
    bookingId: string;
    email: string;
    totalCost: number;
    packageName: string;
  }) => void;
}

const BookingModal = ({ package: pkg, isOpen, onClose, onBookingComplete }: BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [destinationMarkers, setDestinationMarkers] = useState<any[]>([]);

  // User details form
  const [userDetails, setUserDetails] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    passport_number: '',
    emergency_contact: '',
    special_requirements: ''
  });

  // Parse routes for map
  const parseRoutesForMap = () => {
    if (!pkg.routes) return [];

    try {
      const routes = typeof pkg.routes === 'string' ? JSON.parse(pkg.routes) : pkg.routes;
      if (Array.isArray(routes)) {
        return routes.map((route: any, index: number) => ({
          id: `${route.location || 'destination'}-${index}`,
          name: route.location || 'Destination',
          lat: route.lat || route.latitude || (Math.random() * 0.5 + 6.5),
          lng: route.lng || route.longitude || (Math.random() * 0.5 + 79.5),
          type: 'destination',
          day: route.day || index + 1
        }));
      }
    } catch (error) {
      console.error('Error parsing routes for map:', error);
    }
    return [];
  };

  // Calculate map center
  const calculateMapCenter = (): [number, number] => {
    if (destinationMarkers.length > 0) {
      const avgLat = destinationMarkers.reduce((sum, dest) => sum + dest.lat, 0) / destinationMarkers.length;
      const avgLng = destinationMarkers.reduce((sum, dest) => sum + dest.lng, 0) / destinationMarkers.length;
      return [avgLat, avgLng];
    }
    return [7.8731, 80.7718];
  };

  if (!isOpen) return null;

  const calculatePrice = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/calculate-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package_id: pkg.package_id,
          adults: parseInt(adults.toString()),
          children: parseInt(children.toString())
        })
      });

      const data = await response.json();
      setCalculation(data);

      // Parse routes for map when moving to step 2
      const markers = parseRoutesForMap();
      setDestinationMarkers(markers);

      setStep(2);
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  };

  const handleSubmitBooking = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/book-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: pkg.package_id,
          user_details: userDetails,
          total_cost: calculation.totalCost,
          adults: adults,
          children: children
        })
      });

      const data = await response.json();

      if (data.success) {
        // Pass booking data to parent for payment page
        onBookingComplete({
          bookingId: data.booking_id,
          email: userDetails.email,
          totalCost: calculation.totalCost,
          packageName: pkg.package_name
        });

        // Close modal
        onClose();
      } else {
        alert('Failed to submit booking. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to submit booking. Please try again.');
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

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                {step === 1 && 'Book Package'}
                {step === 2 && 'Complete Your Booking'}
              </h2>
              <p className="text-muted-foreground">{pkg.package_name}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={24} />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden flex">
            {/* Left side - Booking Form */}
            <div className="w-1/2 p-6 overflow-y-auto">
              {/* Step 1: Participant Calculation */}
              {step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2">{pkg.package_name}</h3>
                      <p className="text-muted-foreground">Calculate your package cost</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Number of Adults</label>
                        <Input
                            type="number"
                            min="1"
                            value={adults}
                            onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                            className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Number of Children</label>
                        <Input
                            type="number"
                            min="0"
                            value={children}
                            onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                            className="w-full"
                        />
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-sm text-orange-800">
                        <strong>Note:</strong> Children (under 12) pay 50% of adult price
                      </p>
                    </div>

                    <Button
                        onClick={calculatePrice}
                        className="w-full bg-accent hover:bg-accent/90 text-white py-6"
                    >
                      <Calculator size={20} className="mr-2" />
                      Calculate Price & Continue
                    </Button>
                  </div>
              )}

              {/* Step 2: User Details Form */}
              {step === 2 && calculation && (
                  <div className="space-y-6">
                    {/* Price Summary */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Price Summary</h4>
                      <div className="space-y-1 text-sm text-green-700">
                        <div className="flex justify-between">
                          <span>{calculation.adults} Adults × ${calculation.perPersonCost}</span>
                          <span>${calculation.adultCost}</span>
                        </div>
                        {calculation.children > 0 && (
                            <div className="flex justify-between">
                              <span>{calculation.children} Children × ${calculation.perPersonCost / 2}</span>
                              <span>${calculation.childCost}</span>
                            </div>
                        )}
                        <div className="border-t border-green-200 pt-1 mt-1 font-semibold flex justify-between">
                          <span>Total Cost:</span>
                          <span>${calculation.totalCost}</span>
                        </div>
                      </div>
                    </div>

                    {/* User Details Form */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Personal Information</h4>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center">
                            <User size={16} className="mr-2 text-accent" />
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

                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center">
                            <Mail size={16} className="mr-2 text-accent" />
                            Email *
                          </label>
                          <Input
                              name="email"
                              type="email"
                              value={userDetails.email}
                              onChange={handleInputChange}
                              required
                              className="w-full"
                              placeholder="Enter your email"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center">
                            <Phone size={16} className="mr-2 text-accent" />
                            Phone Number *
                          </label>
                          <Input
                              name="phone"
                              value={userDetails.phone}
                              onChange={handleInputChange}
                              required
                              className="w-full"
                              placeholder="Enter your phone number"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center">
                            <MapPin size={16} className="mr-2 text-accent" />
                            Country *
                          </label>
                          <Input
                              name="country"
                              value={userDetails.country}
                              onChange={handleInputChange}
                              required
                              className="w-full"
                              placeholder="Enter your country"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center">
                          <FileText size={16} className="mr-2 text-accent" />
                          Passport Number
                        </label>
                        <Input
                            name="passport_number"
                            value={userDetails.passport_number}
                            onChange={handleInputChange}
                            className="w-full"
                            placeholder="Enter your passport number"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Emergency Contact</label>
                        <Input
                            name="emergency_contact"
                            value={userDetails.emergency_contact}
                            onChange={handleInputChange}
                            className="w-full"
                            placeholder="Enter emergency contact number"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Special Requirements</label>
                        <Textarea
                            name="special_requirements"
                            value={userDetails.special_requirements}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full"
                            placeholder="Any special requirements or notes..."
                        />
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Button
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                          onClick={handleSubmitBooking}
                          disabled={loading || !userDetails.full_name || !userDetails.email || !userDetails.phone || !userDetails.country}
                          className="flex-1 bg-accent hover:bg-accent/90 text-white"
                      >
                        {loading ? 'Submitting...' : 'Submit Booking'}
                      </Button>
                    </div>
                  </div>
              )}
            </div>

            {/* Right side - Map Preview (Only shown in step 2) */}
            <div className="w-1/2 border-l bg-gray-50">
              {step === 2 && destinationMarkers.length > 0 ? (
                  <div className="h-full p-4">
                    <h3 className="font-semibold text-lg mb-4">Tour Route Preview</h3>
                    <div className="bg-white rounded-lg overflow-hidden shadow h-[calc(100%-3rem)]">
                      <DestinationMap
                          destinations={destinationMarkers}
                          showRoute={true}
                          center={calculateMapCenter()}
                          zoom={8}
                          height="100%"
                      />
                    </div>
                  </div>
              ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center p-8">
                      <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>Tour route map will appear here</p>
                      <p className="text-sm mt-2">Complete step 1 to see the itinerary map</p>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default BookingModal;