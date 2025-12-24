/**
 * LeafletEvacuationMap - Evacuation routes and shelters using OpenStreetMap
 * No API keys required - uses free Overpass API
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import styled, { keyframes } from 'styled-components';
import { Navigation, Shield, AlertTriangle, RefreshCw, List } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Shelter interface
interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  distance: number;
  icon: string;
  color: string;
}

// Custom marker icons
const createIcon = (color: string, emoji: string) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="background:${color};border:3px solid white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:16px;">${emoji}</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const userIcon = createIcon('#3B82F6', '📍');
const hospitalIcon = createIcon('#EF4444', '🏥');
const fireIcon = createIcon('#F97316', '🚒');
const policeIcon = createIcon('#3B82F6', '👮');
const schoolIcon = createIcon('#8B5CF6', '🏫');
const shelterIcon = createIcon('#22C55E', '🏠');

// Animations
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components
const MapWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
  background: #0f172a;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(99, 102, 241, 0.3);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(99, 102, 241, 0.1);
  border-bottom: 1px solid rgba(99, 102, 241, 0.2);
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  svg { color: #22C55E; }
`;

const Badge = styled.div`
  padding: 4px 10px;
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: #22c55e;
`;

const Controls = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid ${p => p.$active ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255,255,255,0.1)'};
  background: ${p => p.$active ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0,0,0,0.3)'};
  color: ${p => p.$active ? '#a5b4fc' : 'rgba(255,255,255,0.7)'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(99, 102, 241, 0.2);
    border-color: rgba(99, 102, 241, 0.4);
  }
  
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  svg { width: 16px; height: 16px; }
`;

const RefreshBtn = styled(Button)<{ $loading?: boolean }>`
  svg { animation: ${p => p.$loading ? spin : 'none'} 1s linear infinite; }
`;

const MapContent = styled.div`
  flex: 1;
  position: relative;
  
  .leaflet-container {
    height: 100%;
    width: 100%;
    background: #1a1a2e;
  }
  
  .leaflet-popup-content-wrapper {
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 8px;
    color: #fff;
  }
  
  .leaflet-popup-tip { background: rgba(15, 23, 42, 0.95); }
  
  .leaflet-control-zoom a {
    background: rgba(15, 23, 42, 0.9);
    border-color: rgba(99, 102, 241, 0.3);
    color: #fff;
  }
`;

const Loading = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const ErrorMsg = styled.div`
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #f87171;
  font-size: 12px;
  margin: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SidePanel = styled.div<{ $show: boolean }>`
  position: absolute;
  top: 0;
  right: ${p => p.$show ? '0' : '-280px'};
  width: 260px;
  height: 100%;
  background: rgba(15, 23, 42, 0.98);
  border-left: 1px solid rgba(99, 102, 241, 0.3);
  transition: right 0.3s;
  z-index: 1000;
  overflow-y: auto;
  padding: 16px;
`;

const ShelterCard = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  
  &:hover {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(99, 102, 241, 0.4);
  }
`;

const ShelterName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
`;

const ShelterMeta = styled.div`
  font-size: 10px;
  color: rgba(255,255,255,0.6);
`;

const PopupContent = styled.div`
  padding: 8px;
  min-width: 180px;
  
  h4 {
    margin: 0 0 6px 0;
    font-size: 13px;
    color: #fff;
  }
  
  p {
    margin: 0;
    font-size: 11px;
    color: rgba(255,255,255,0.7);
  }
`;

// Map controller
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
};

// Calculate distance between two points (Haversine)
const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// Main Component
const LeafletEvacuationMap: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]);
  const [mapZoom, setMapZoom] = useState(13);

  // Fetch shelters from OpenStreetMap Overpass API
  const fetchShelters = useCallback(async (lat: number, lng: number): Promise<Shelter[]> => {
    const delta = 0.05; // ~5km
    const bbox = `${lat - delta},${lng - delta},${lat + delta},${lng + delta}`;
    
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](${bbox});
        node["amenity"="fire_station"](${bbox});
        node["amenity"="police"](${bbox});
        node["amenity"="school"](${bbox});
        node["emergency"="assembly_point"](${bbox});
        way["amenity"="hospital"](${bbox});
        way["amenity"="fire_station"](${bbox});
      );
      out center;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!response.ok) {
      console.error('Overpass API failed');
      return [];
    }
    
    const data = await response.json();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: Shelter[] = data.elements.map((el: any, i: number) => {
      const elLat = el.lat || el.center?.lat;
      const elLng = el.lon || el.center?.lon;
      const type = el.tags?.amenity || el.tags?.emergency || 'shelter';
      
      return {
        id: `${el.id}-${i}`,
        name: el.tags?.name || `${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}`,
        lat: elLat,
        lng: elLng,
        type,
        distance: calcDistance(lat, lng, elLat, elLng),
        icon: type === 'hospital' ? '🏥' : type === 'fire_station' ? '🚒' : type === 'police' ? '👮' : type === 'school' ? '🏫' : '🏠',
        color: type === 'hospital' ? '#EF4444' : type === 'fire_station' ? '#F97316' : type === 'police' ? '#3B82F6' : type === 'school' ? '#8B5CF6' : '#22C55E'
      };
    }).filter((s: Shelter) => s.lat && s.lng).sort((a: Shelter, b: Shelter) => a.distance - b.distance);

    return results;
  }, []);

  // Get user location and load shelters
  const loadData = useCallback(async () => {
    try {
      setError(null);
      
      // Get user location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      setUserLocation([lat, lng]);
      setMapCenter([lat, lng]);
      
      // Fetch shelters
      const foundShelters = await fetchShelters(lat, lng);
      setShelters(foundShelters);
      
      console.log(`✅ Found ${foundShelters.length} evacuation shelters`);
    } catch (err) {
      console.error('Location error:', err);
      setError('Location access denied. Using default location.');
      
      // Use default location (Delhi) if geolocation fails
      const defaultLat = 28.6139;
      const defaultLng = 77.2090;
      setUserLocation([defaultLat, defaultLng]);
      setMapCenter([defaultLat, defaultLng]);
      
      const foundShelters = await fetchShelters(defaultLat, defaultLng);
      setShelters(foundShelters);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchShelters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCenterOnUser = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(14);
    }
  };

  const handleShelterClick = (shelter: Shelter) => {
    setMapCenter([shelter.lat, shelter.lng]);
    setMapZoom(16);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'hospital': return hospitalIcon;
      case 'fire_station': return fireIcon;
      case 'police': return policeIcon;
      case 'school': return schoolIcon;
      default: return shelterIcon;
    }
  };

  return (
    <MapWrapper>
      <Header>
        <Title>
          <Shield size={18} />
          🚨 Evacuation Routes
        </Title>
        <Badge>{shelters.length} Shelters</Badge>
        <Controls>
          <Button onClick={handleCenterOnUser} disabled={!userLocation} title="Center on location">
            <Navigation />
          </Button>
          <Button $active={showPanel} onClick={() => setShowPanel(!showPanel)} title="Toggle list">
            <List />
          </Button>
          <RefreshBtn $loading={refreshing} onClick={handleRefresh} title="Refresh">
            <RefreshCw />
          </RefreshBtn>
        </Controls>
      </Header>

      <MapContent>
        {loading && <Loading><Spinner /></Loading>}
        {error && <ErrorMsg><AlertTriangle size={14} />{error}</ErrorMsg>}

        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }} zoomControl={true}>
          <MapController center={mapCenter} zoom={mapZoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {userLocation && (
            <>
              <Marker position={userLocation} icon={userIcon}>
                <Popup>
                  <PopupContent>
                    <h4>📍 Your Location</h4>
                    <p>Current position</p>
                  </PopupContent>
                </Popup>
              </Marker>
              
              <Circle
                center={userLocation}
                radius={5000}
                pathOptions={{
                  color: '#3B82F6',
                  fillColor: '#3B82F6',
                  fillOpacity: 0.05,
                  weight: 2,
                  dashArray: '5, 10'
                }}
              />
            </>
          )}

          {shelters.map((shelter) => (
            <Marker
              key={shelter.id}
              position={[shelter.lat, shelter.lng]}
              icon={getIcon(shelter.type)}
              eventHandlers={{ click: () => handleShelterClick(shelter) }}
            >
              <Popup>
                <PopupContent>
                  <h4>{shelter.icon} {shelter.name}</h4>
                  <p>📍 {shelter.distance.toFixed(1)} km away</p>
                  <p>Type: {shelter.type.replace('_', ' ')}</p>
                </PopupContent>
              </Popup>
            </Marker>
          ))}

          {userLocation && shelters.slice(0, 3).map((shelter, idx) => (
            <Polyline
              key={`route-${idx}`}
              positions={[userLocation, [shelter.lat, shelter.lng]]}
              pathOptions={{
                color: '#22C55E',
                weight: 3,
                opacity: 0.7,
                dashArray: '10, 10'
              }}
            />
          ))}
        </MapContainer>

        <SidePanel $show={showPanel}>
          <Title style={{ marginBottom: 16, fontSize: 14 }}>
            <Shield size={16} />
            Nearby Shelters
          </Title>
          
          {shelters.map((shelter) => (
            <ShelterCard key={shelter.id} onClick={() => handleShelterClick(shelter)}>
              <ShelterName>{shelter.icon} {shelter.name}</ShelterName>
              <ShelterMeta>📍 {shelter.distance.toFixed(1)} km • {shelter.type.replace('_', ' ')}</ShelterMeta>
            </ShelterCard>
          ))}
          
          {shelters.length === 0 && !loading && (
            <ShelterMeta>No shelters found in this area</ShelterMeta>
          )}
        </SidePanel>
      </MapContent>
    </MapWrapper>
  );
};

export default LeafletEvacuationMap;
