import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTheme } from "next-themes";

// Fix for default leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create numbered icon
const createNumberedIcon = (number: number) => {
  return L.divIcon({
    className: 'custom-numbered-icon',
    html: `
      <div style="
        background-color: #F47920;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
      ">
        ${number}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Simple icon without numbers
const createSimpleIcon = () => {
  return L.divIcon({
    className: 'custom-simple-icon',
    html: `
      <div style="
        background-color: #F47920;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface Destination {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  description?: string;
  day?: number;
}

interface DestinationMapProps {
  destinations?: Destination[];
  showRoute?: boolean;
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
}

export default function DestinationMap({
                                         destinations = [],
                                         showRoute = false,
                                         center = [7.8731, 80.7718],
                                         zoom = 8,
                                         height = "400px",
                                         className = ""
                                       }: DestinationMapProps) {
  const [mapDestinations, setMapDestinations] = useState<Destination[]>(destinations);
  const [roadRoute, setRoadRoute] = useState<[number, number][]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    // If no destinations provided, fetch from AI API
    if (destinations.length === 0) {
      fetch('http://localhost:5000/api/map/destinations')
          .then(res => res.json())
          .then(data => {
            if (data.success && data.destinations) {
              setMapDestinations(data.destinations);
            }
          })
          .catch(err => console.error('Error fetching map destinations:', err));
    } else {
      setMapDestinations(destinations);
    }
  }, [destinations]);

  useEffect(() => {
    if (showRoute && mapDestinations.length > 1) {
      fetchRoadRoute();
    }
  }, [mapDestinations, showRoute]);

  const fetchRoadRoute = async () => {
    try {
      // Sort destinations by day if available
      const sortedDestinations = [...mapDestinations].sort((a, b) =>
          (a.day || 0) - (b.day || 0)
      );

      const coords = sortedDestinations.map(d => `${d.lng},${d.lat}`).join(';');
      const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.code === 'Ok' && data.routes[0]) {
        const routeCoords = data.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        );
        setRoadRoute(routeCoords);
      }
    } catch (error) {
      console.error('Error fetching road route:', error);
      // Fallback: direct line between points
      const sortedDestinations = [...mapDestinations].sort((a, b) =>
          (a.day || 0) - (b.day || 0)
      );
      setRoadRoute(sortedDestinations.map(d => [d.lat, d.lng]));
    }
  };

  const routeCoordinates = useMemo(() => {
    if (roadRoute.length > 0) return roadRoute;
    if (showRoute && mapDestinations.length > 1) {
      const sortedDestinations = [...mapDestinations].sort((a, b) =>
          (a.day || 0) - (b.day || 0)
      );
      return sortedDestinations.map(d => [d.lat, d.lng] as [number, number]);
    }
    return [];
  }, [roadRoute, mapDestinations, showRoute]);

  // Get tile layer URL based on theme
  const tileLayerUrl = theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
      <div className={`w-full rounded-lg overflow-hidden shadow-lg ${className}`} style={{ height }}>
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            zoomControl={true}
            className="rounded-lg"
        >
          <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={tileLayerUrl}
          />

          {mapDestinations.map((dest) => (
              <Marker
                  key={dest.id}
                  position={[dest.lat, dest.lng]}
                  icon={dest.day ? createNumberedIcon(dest.day) : createSimpleIcon()}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[200px]">
                    {dest.day && (
                        <div className="font-bold text-orange-600 mb-1">
                          Day {dest.day}
                        </div>
                    )}
                    <div className="font-semibold text-gray-800">{dest.name}</div>
                    <div className="text-sm text-gray-600 capitalize">{dest.type.replace('_', ' ')}</div>
                    {dest.description && (
                        <div className="text-xs mt-2 text-gray-700">{dest.description}</div>
                    )}
                  </div>
                </Popup>
              </Marker>
          ))}

          {showRoute && routeCoordinates.length > 1 && (
              <Polyline
                  positions={routeCoordinates}
                  color="#F47920"
                  weight={4}
                  opacity={0.8}
                  dashArray="5, 5"
              />
          )}
        </MapContainer>
      </div>
  );
}