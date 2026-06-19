import { useState, useEffect } from 'react';
import DestinationMap from '@/components/DestinationMap';
import { Button } from '@/components/ui/button';

export default function MapTest() {
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateTestItinerary = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/itinerary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests: ['beach', 'cultural'],
          budget: '1500',
          exact_days: 7,
          preferred_destinations: ['Kandy', 'Mirissa', 'Galle'],
          accommodation_type: 'standard',
          starting_point: 'Colombo'
        })
      });
      const data = await response.json();
      if (data.success) {
        // Normalize coordinates to lat/lng format
        const normalizedItinerary = {
          ...data.itinerary,
          destinations: data.itinerary.destinations?.map((dest: any) => ({
            ...dest,
            lat: dest.lat || dest.latitude,
            lng: dest.lng || dest.longitude
          }))
        };
        setItinerary(normalizedItinerary);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Map Test - Lanka Vacations</h1>
      
      <div className="mb-6">
        <Button onClick={generateTestItinerary} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Test Itinerary'}
        </Button>
      </div>

      {itinerary && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Generated Itinerary</h2>
          <p>Destinations: {itinerary.destinations?.length}</p>
          <p>Hotels: {itinerary.hotels?.length}</p>
          <p>Total Distance: {itinerary.total_distance?.toFixed(1)} km</p>
          <p>Estimated Budget: ${itinerary.estimated_budget?.toFixed(0)}</p>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">All Destinations</h2>
        <DestinationMap />
      </div>

      {itinerary && itinerary.destinations && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Custom Route</h2>
          <DestinationMap 
            destinations={itinerary.destinations}
            showRoute={true}
            zoom={9}
          />
        </div>
      )}
    </div>
  );
}
