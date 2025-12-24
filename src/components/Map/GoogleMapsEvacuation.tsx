/**
 * GoogleMapsEvacuation - Evacuation routes and shelters using Google Maps
 * Shows real-time route status with directions
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import styled, { keyframes } from 'styled-components';
import { productionColors } from '../../styles/production-ui-system';
import { useLocation } from '../../contexts/LocationContext';

// Interfaces
interface Shelter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  currentOccupancy: number;
  amenities: string[];
  status: 'open' | 'full' | 'closed';
  distance?: string;
  phone?: string;
}

interface RouteInfo {
  shelter: Shelter;
  directions: google.maps.DirectionsResult | null;
  duration: string;
  distance: string;
  traffic: 'clear' | 'moderate' | 'heavy';
}

// Animations
const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
`;

// Styled Components
const MapWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${productionColors.border.secondary};
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.9);
  z-index: 10;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: ${productionColors.status.info};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  margin-top: 16px;
  color: ${productionColors.text.secondary};
  font-size: 14px;
`;

const ControlPanel = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(15, 23, 42, 0.95);
  border-radius: 12px;
  padding: 16px;
  max-width: 320px;
  border: 1px solid ${productionColors.border.secondary};
  z-index: 5;
  max-height: calc(100% - 32px);
  overflow-y: auto;
`;

const PanelTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${productionColors.text.primary};
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ShelterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ShelterItem = styled.div<{ $selected: boolean; $status: string }>`
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$selected 
    ? 'rgba(59, 130, 246, 0.2)' 
    : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid ${props => props.$selected 
    ? productionColors.status.info 
    : props.$status === 'open' 
      ? 'rgba(34, 197, 94, 0.3)' 
      : props.$status === 'full' 
        ? 'rgba(234, 179, 8, 0.3)' 
        : 'rgba(239, 68, 68, 0.3)'};
  
  &:hover {
    background: ${props => props.$selected 
      ? 'rgba(59, 130, 246, 0.25)' 
      : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const ShelterName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${productionColors.text.primary};
  margin-bottom: 4px;
`;

const ShelterDetails = styled.div`
  font-size: 11px;
  color: ${productionColors.text.secondary};
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => props.$status === 'open' 
    ? 'rgba(34, 197, 94, 0.2)' 
    : props.$status === 'full' 
      ? 'rgba(234, 179, 8, 0.2)' 
      : 'rgba(239, 68, 68, 0.2)'};
  color: ${props => props.$status === 'open' 
    ? '#22C55E' 
    : props.$status === 'full' 
      ? '#EAB308' 
      : '#EF4444'};
`;

const RouteInfoPanel = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
`;

const RouteStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
`;

const RouteStat = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${productionColors.text.primary};
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: ${productionColors.text.tertiary};
  text-transform: uppercase;
`;

const DirectionsButton = styled.button`
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #3B82F6, #6366F1);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
`;

const TrafficBadge = styled.span<{ $traffic: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  background: ${props => props.$traffic === 'clear' 
    ? 'rgba(34, 197, 94, 0.2)' 
    : props.$traffic === 'moderate' 
      ? 'rgba(234, 179, 8, 0.2)' 
      : 'rgba(239, 68, 68, 0.2)'};
  color: ${props => props.$traffic === 'clear' 
    ? '#22C55E' 
    : props.$traffic === 'moderate' 
      ? '#EAB308' 
      : '#EF4444'};
`;

const Legend = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(15, 23, 42, 0.95);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid ${productionColors.border.secondary};
  z-index: 5;
`;

const LegendTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${productionColors.text.primary};
  margin-bottom: 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  color: ${productionColors.text.secondary};
  margin-bottom: 4px;
  
  &:last-child { margin-bottom: 0; }
`;

const LegendDot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.$color};
`;

const CustomInfoWindow = styled.div`
  padding: 12px;
  min-width: 200px;
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #1F2937;
  }
  
  p {
    margin: 0 0 4px 0;
    font-size: 12px;
    color: #6B7280;
  }
  
  .amenities {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 8px;
  }
  
  .amenity {
    padding: 2px 6px;
    background: #E5E7EB;
    border-radius: 4px;
    font-size: 10px;
    color: #374151;
  }
`;

// Map configuration
const containerStyle = {
  width: '100%',
  height: '100%'
};

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }]
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b6878' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#304a7d' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#255763' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2c6675' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#255763' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1626' }]
  }
];

const GoogleMapsEvacuation: React.FC = () => {
  const { currentLocation } = useLocation();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState<string | null>(null);
  const [isLoadingShelters, setIsLoadingShelters] = useState(false);
  const [shelterError, setShelterError] = useState<string | null>(null);

  // Use environment variable for Google Maps API key
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places', 'geometry'] as any
  });

  const center = useMemo(() => ({
    lat: currentLocation?.latitude || 28.6139,
    lng: currentLocation?.longitude || 77.2090
  }), [currentLocation]);

  // Fetch REAL shelters from OpenStreetMap Overpass API (free, no key required)
  useEffect(() => {
    const fetchRealShelters = async () => {
      if (!currentLocation) return;
      
      setIsLoadingShelters(true);
      setShelterError(null);
      
      try {
        const lat = currentLocation.latitude;
        const lng = currentLocation.longitude;
        const radius = 0.05; // ~5km in degrees
        const bbox = `${lat - radius},${lng - radius},${lat + radius},${lng + radius}`;
        
        // Overpass API query for emergency facilities
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"="hospital"](${bbox});
            node["amenity"="fire_station"](${bbox});
            node["amenity"="police"](${bbox});
            node["amenity"="school"](${bbox});
            node["amenity"="community_centre"](${bbox});
            way["amenity"="hospital"](${bbox});
            way["amenity"="fire_station"](${bbox});
          );
          out center;
        `;

        console.log('🏠 [GoogleMapsEvacuation] Fetching real shelters from OpenStreetMap...');
        
        const response = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: `data=${encodeURIComponent(query)}`,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (!response.ok) {
          throw new Error(`OpenStreetMap API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Convert OSM data to our shelter format
        const realShelters: Shelter[] = data.elements
          .filter((el: any) => (el.lat || el.center?.lat) && (el.lon || el.center?.lon))
          .map((el: any, index: number) => {
            const elLat = el.lat || el.center?.lat;
            const elLng = el.lon || el.center?.lon;
            const amenity = el.tags?.amenity || 'shelter';
            
            // Calculate distance using Haversine formula
            const R = 6371;
            const dLat = (elLat - lat) * Math.PI / 180;
            const dLng = (elLng - lng) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(lat * Math.PI / 180) * Math.cos(elLat * Math.PI / 180) *
                      Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;
            
            return {
              id: `osm-${el.id}`,
              name: el.tags?.name || getDefaultName(amenity, index),
              address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || 'OpenStreetMap verified location',
              lat: elLat,
              lng: elLng,
              capacity: getEstimatedCapacity(amenity),
              currentOccupancy: 0,
              amenities: getAmenities(amenity),
              status: 'open' as const,
              phone: el.tags?.phone || el.tags?.['contact:phone'],
              distance: `${distance.toFixed(1)} km`
            };
          })
          .sort((a: Shelter, b: Shelter) => 
            parseFloat(a.distance || '0') - parseFloat(b.distance || '0')
          )
          .slice(0, 15); // Limit to 15 nearest

        console.log(`✅ [GoogleMapsEvacuation] Found ${realShelters.length} real shelters`);
        setShelters(realShelters);
        
      } catch (error) {
        console.error('❌ [GoogleMapsEvacuation] Failed to fetch shelters:', error);
        setShelterError('Unable to load nearby shelters. Please try again.');
        setShelters([]);
      } finally {
        setIsLoadingShelters(false);
      }
    };

    fetchRealShelters();
  }, [currentLocation]);

  // Helper functions for OSM data
  const getDefaultName = (amenity: string, index: number): string => {
    const names: Record<string, string> = {
      hospital: 'Hospital',
      fire_station: 'Fire Station',
      police: 'Police Station',
      school: 'School',
      community_centre: 'Community Center'
    };
    return `${names[amenity] || 'Emergency Facility'} #${index + 1}`;
  };

  const getEstimatedCapacity = (amenity: string): number => {
    const capacities: Record<string, number> = {
      hospital: 500,
      fire_station: 50,
      police: 30,
      school: 300,
      community_centre: 200
    };
    return capacities[amenity] || 100;
  };

  const getAmenities = (amenity: string): string[] => {
    const amenityMap: Record<string, string[]> = {
      hospital: ['Medical', 'Water', 'Shelter', '24/7'],
      fire_station: ['Emergency Services', 'First Aid'],
      police: ['Security', 'Emergency Services'],
      school: ['Shelter', 'Large Space', 'Restrooms'],
      community_centre: ['Shelter', 'Kitchen', 'Restrooms']
    };
    return amenityMap[amenity] || ['Shelter'];
  };

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Calculate route to selected shelter
  const calculateRoute = useCallback(async (shelter: Shelter) => {
    if (!isLoaded || !currentLocation) return;

    const directionsService = new google.maps.DirectionsService();
    
    try {
      const result = await directionsService.route({
        origin: { lat: currentLocation.latitude, lng: currentLocation.longitude },
        destination: { lat: shelter.lat, lng: shelter.lng },
        travelMode: google.maps.TravelMode.DRIVING
      });
      
      setDirectionsResponse(result);
      
      const route = result.routes[0];
      const leg = route.legs[0];
      
      // Determine traffic condition based on duration ratio
      const durationValue = leg.duration?.value || 0;
      const durationInTraffic = leg.duration_in_traffic?.value || durationValue;
      const trafficRatio = durationInTraffic / durationValue;
      
      const traffic = trafficRatio < 1.2 ? 'clear' : trafficRatio < 1.5 ? 'moderate' : 'heavy';
      
      setRouteInfo({
        shelter,
        directions: result,
        duration: leg.duration?.text || 'N/A',
        distance: leg.distance?.text || 'N/A',
        traffic
      });
    } catch (error) {
      console.error('Error calculating route:', error);
      // Show error state - don't use fake data
      setRouteInfo({
        shelter,
        directions: null,
        duration: 'Route unavailable',
        distance: shelter.distance || 'N/A',
        traffic: 'clear'
      });
    }
  }, [isLoaded, currentLocation]);

  const handleShelterSelect = (shelter: Shelter) => {
    setSelectedShelter(shelter);
    calculateRoute(shelter);
    
    if (map) {
      map.panTo({ lat: shelter.lat, lng: shelter.lng });
      map.setZoom(14);
    }
  };

  const openGoogleMapsDirections = () => {
    if (!selectedShelter || !currentLocation) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${selectedShelter.lat},${selectedShelter.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // Get marker icon based on shelter status
  const getMarkerIcon = (status: string) => {
    const color = status === 'open' ? '#22C55E' : status === 'full' ? '#EAB308' : '#EF4444';
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 12,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 2
    };
  };

  if (loadError) {
    return (
      <MapWrapper>
        <LoadingOverlay>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
          <LoadingText>Google Maps unavailable. Please check your API key configuration.</LoadingText>
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
            Shelters are still being loaded from OpenStreetMap
          </div>
        </LoadingOverlay>
      </MapWrapper>
    );
  }

  if (!isLoaded) {
    return (
      <MapWrapper>
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>Loading Google Maps...</LoadingText>
        </LoadingOverlay>
      </MapWrapper>
    );
  }

  return (
    <MapWrapper>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: darkMapStyles,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        }}
      >
        {/* User location marker */}
        {currentLocation && (
          <Marker
            position={{ lat: currentLocation.latitude, lng: currentLocation.longitude }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#3B82F6',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 3
            }}
            title="Your Location"
          />
        )}

        {/* Shelter markers */}
        {shelters.map(shelter => (
          <Marker
            key={shelter.id}
            position={{ lat: shelter.lat, lng: shelter.lng }}
            icon={getMarkerIcon(shelter.status)}
            onClick={() => {
              setInfoWindowOpen(shelter.id);
              handleShelterSelect(shelter);
            }}
          >
            {infoWindowOpen === shelter.id && (
              <InfoWindow onCloseClick={() => setInfoWindowOpen(null)}>
                <CustomInfoWindow>
                  <h4>{shelter.name}</h4>
                  <p>{shelter.address}</p>
                  <p>Capacity: {shelter.currentOccupancy}/{shelter.capacity}</p>
                  <p>Status: {shelter.status.toUpperCase()}</p>
                  <div className="amenities">
                    {shelter.amenities.map(amenity => (
                      <span key={amenity} className="amenity">{amenity}</span>
                    ))}
                  </div>
                </CustomInfoWindow>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {/* Directions */}
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              polylineOptions: {
                strokeColor: '#3B82F6',
                strokeWeight: 5,
                strokeOpacity: 0.8
              },
              suppressMarkers: true
            }}
          />
        )}
      </GoogleMap>

      {/* Control Panel */}
      <ControlPanel>
        <PanelTitle>
          🏠 Emergency Shelters
        </PanelTitle>
        
        <ShelterList>
          {shelters.map(shelter => (
            <ShelterItem
              key={shelter.id}
              $selected={selectedShelter?.id === shelter.id}
              $status={shelter.status}
              onClick={() => handleShelterSelect(shelter)}
            >
              <ShelterName>{shelter.name}</ShelterName>
              <ShelterDetails>
                <span>{shelter.distance}</span>
                <span>{shelter.currentOccupancy}/{shelter.capacity}</span>
                <StatusBadge $status={shelter.status}>{shelter.status}</StatusBadge>
              </ShelterDetails>
            </ShelterItem>
          ))}
        </ShelterList>

        {/* Route Info */}
        {routeInfo && (
          <RouteInfoPanel>
            <RouteStats>
              <RouteStat>
                <StatValue>{routeInfo.distance}</StatValue>
                <StatLabel>Distance</StatLabel>
              </RouteStat>
              <RouteStat>
                <StatValue>{routeInfo.duration}</StatValue>
                <StatLabel>Duration</StatLabel>
              </RouteStat>
              <RouteStat>
                <TrafficBadge $traffic={routeInfo.traffic}>
                  {routeInfo.traffic}
                </TrafficBadge>
                <StatLabel>Traffic</StatLabel>
              </RouteStat>
            </RouteStats>
            
            <DirectionsButton onClick={openGoogleMapsDirections}>
              🧭 Open in Google Maps
            </DirectionsButton>
          </RouteInfoPanel>
        )}
      </ControlPanel>

      {/* Legend */}
      <Legend>
        <LegendTitle>Legend</LegendTitle>
        <LegendItem>
          <LegendDot $color="#3B82F6" />
          Your Location
        </LegendItem>
        <LegendItem>
          <LegendDot $color="#22C55E" />
          Open Shelter
        </LegendItem>
        <LegendItem>
          <LegendDot $color="#EAB308" />
          Full Shelter
        </LegendItem>
        <LegendItem>
          <LegendDot $color="#EF4444" />
          Closed Shelter
        </LegendItem>
      </Legend>
    </MapWrapper>
  );
};

export default GoogleMapsEvacuation;
