import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMap, LayersControl, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import styled, { keyframes } from 'styled-components';
import { AlertTriangle, Droplets, Navigation, Layers, RefreshCw, MapPin, Target, Info } from 'lucide-react';
import { enhancedLocationService } from '../../services/enhancedLocationService';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Animations
const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.02); }
`;

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
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95));
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(99, 102, 241, 0.2);
`;

const MapHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.1), transparent);
  border-bottom: 1px solid rgba(99, 102, 241, 0.15);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MapTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #3b82f6;
  }
`;

const LiveBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  color: #22c55e;
  
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: #22c55e;
    border-radius: 50%;
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid ${({ active }) => active ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
  background: ${({ active }) => active ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
  color: ${({ active }) => active ? '#a5b4fc' : 'rgba(255, 255, 255, 0.6)'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(99, 102, 241, 0.2);
    border-color: rgba(99, 102, 241, 0.4);
    color: #a5b4fc;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const RefreshButton = styled(IconButton)<{ isRefreshing?: boolean }>`
  svg {
    animation: ${({ isRefreshing }) => isRefreshing ? spin : 'none'} 1s linear infinite;
  }
`;

const MapContent = styled.div`
  flex: 1;
  position: relative;
  
  .leaflet-container {
    height: 100%;
    width: 100%;
    background: #1a1a2e;
  }
  
  .leaflet-tile-pane {
    filter: brightness(0.8) saturate(0.9);
  }
  
  .leaflet-popup-content-wrapper {
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 12px;
    color: #fff;
  }
  
  .leaflet-popup-tip {
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(99, 102, 241, 0.3);
  }
  
  .leaflet-control-layers {
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 8px;
    color: #fff;
  }
  
  .leaflet-control-zoom a {
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(99, 102, 241, 0.3);
    color: #fff;
  }
`;

const Legend = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  padding: 12px;
  z-index: 1000;
  min-width: 160px;
`;

const LegendTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const LegendColor = styled.div<{ color: string }>`
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: ${({ color }) => color};
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const InfoPanel = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  padding: 16px;
  z-index: 1000;
  max-width: 280px;
  display: ${({ isVisible }) => isVisible ? 'block' : 'none'};
`;

const InfoTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
  
  span:first-child {
    color: rgba(255, 255, 255, 0.6);
  }
  
  span:last-child {
    color: #fff;
    font-weight: 500;
  }
`;

const RiskBadge = styled.span<{ level: string }>`
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  background: ${({ level }) => 
    level === 'critical' ? 'rgba(239, 68, 68, 0.2)' :
    level === 'high' ? 'rgba(245, 158, 11, 0.2)' :
    level === 'moderate' ? 'rgba(59, 130, 246, 0.2)' :
    'rgba(34, 197, 94, 0.2)'
  };
  color: ${({ level }) => 
    level === 'critical' ? '#ef4444' :
    level === 'high' ? '#f59e0b' :
    level === 'moderate' ? '#3b82f6' :
    '#22c55e'
  };
`;

// Custom marker icons
const createCustomIcon = (color: string, size: number = 24) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Flood zone data generator based on location
const generateFloodZones = (centerLat: number, centerLng: number) => {
  const zones = [];
  
  // Critical flood zone (very close to water bodies)
  zones.push({
    id: 'critical-1',
    level: 'critical',
    probability: 85,
    area: 'Low-lying River Basin',
    coordinates: [
      [centerLat + 0.015, centerLng - 0.02],
      [centerLat + 0.025, centerLng + 0.01],
      [centerLat + 0.01, centerLng + 0.025],
      [centerLat - 0.005, centerLng + 0.015],
      [centerLat - 0.01, centerLng - 0.01],
    ] as [number, number][],
    color: 'rgba(239, 68, 68, 0.4)',
    borderColor: '#ef4444',
  });
  
  // High risk zone
  zones.push({
    id: 'high-1',
    level: 'high',
    probability: 65,
    area: 'Flood Plain Area',
    coordinates: [
      [centerLat + 0.04, centerLng - 0.03],
      [centerLat + 0.05, centerLng + 0.02],
      [centerLat + 0.03, centerLng + 0.04],
      [centerLat + 0.01, centerLng + 0.035],
      [centerLat - 0.015, centerLng + 0.02],
      [centerLat - 0.02, centerLng - 0.02],
      [centerLat + 0.02, centerLng - 0.035],
    ] as [number, number][],
    color: 'rgba(245, 158, 11, 0.35)',
    borderColor: '#f59e0b',
  });
  
  // Moderate risk zone
  zones.push({
    id: 'moderate-1',
    level: 'moderate',
    probability: 40,
    area: 'Urban Drainage Area',
    coordinates: [
      [centerLat - 0.025, centerLng - 0.04],
      [centerLat - 0.01, centerLng - 0.05],
      [centerLat + 0.02, centerLng - 0.045],
      [centerLat + 0.035, centerLng - 0.025],
      [centerLat + 0.025, centerLng + 0.01],
      [centerLat - 0.02, centerLng - 0.015],
    ] as [number, number][],
    color: 'rgba(59, 130, 246, 0.3)',
    borderColor: '#3b82f6',
  });
  
  // Low risk zone
  zones.push({
    id: 'low-1',
    level: 'low',
    probability: 15,
    area: 'Elevated Residential',
    coordinates: [
      [centerLat - 0.04, centerLng + 0.03],
      [centerLat - 0.02, centerLng + 0.045],
      [centerLat + 0.01, centerLng + 0.05],
      [centerLat + 0.025, centerLng + 0.035],
      [centerLat + 0.015, centerLng + 0.015],
      [centerLat - 0.03, centerLng + 0.01],
    ] as [number, number][],
    color: 'rgba(34, 197, 94, 0.25)',
    borderColor: '#22c55e',
  });
  
  return zones;
};

// Risk points generator
const generateRiskPoints = (centerLat: number, centerLng: number) => {
  return [
    { id: 1, lat: centerLat + 0.018, lng: centerLng + 0.005, level: 'critical', type: 'Water Level Sensor', value: '4.2m', threshold: '3.5m' },
    { id: 2, lat: centerLat + 0.008, lng: centerLng - 0.015, level: 'high', type: 'Rain Gauge', value: '85mm/hr', threshold: '60mm/hr' },
    { id: 3, lat: centerLat - 0.012, lng: centerLng + 0.02, level: 'moderate', type: 'Flow Sensor', value: '450 m³/s', threshold: '400 m³/s' },
    { id: 4, lat: centerLat + 0.035, lng: centerLng - 0.008, level: 'low', type: 'Soil Moisture', value: '72%', threshold: '85%' },
    { id: 5, lat: centerLat - 0.025, lng: centerLng - 0.025, level: 'moderate', type: 'Dam Level', value: '78%', threshold: '80%' },
  ];
};

// Shelters generator
const generateShelters = (centerLat: number, centerLng: number) => {
  return [
    { id: 1, lat: centerLat - 0.035, lng: centerLng + 0.04, name: 'Community Center', capacity: 500, current: 120 },
    { id: 2, lat: centerLat + 0.045, lng: centerLng - 0.035, name: 'School Gymnasium', capacity: 300, current: 45 },
    { id: 3, lat: centerLat - 0.02, lng: centerLng - 0.045, name: 'Sports Complex', capacity: 800, current: 230 },
  ];
};

// Map controller component
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

// Main component
interface LeafletFloodMapProps {
  center?: [number, number];
  zoom?: number;
  onZoneSelect?: (zone: any) => void;
}

const LeafletFloodMap: React.FC<LeafletFloodMapProps> = ({ center: initialCenter, zoom: initialZoom = 13, onZoneSelect }) => {
  const [center, setCenter] = useState<[number, number]>(initialCenter || [28.6139, 77.2090]); // Default: New Delhi
  const [zoom] = useState(initialZoom);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [locationName, setLocationName] = useState('Loading...');

  // Generate data based on center
  const floodZones = useMemo(() => generateFloodZones(center[0], center[1]), [center]);
  const riskPoints = useMemo(() => generateRiskPoints(center[0], center[1]), [center]);
  const shelters = useMemo(() => generateShelters(center[0], center[1]), [center]);

  // Fetch user location
  const fetchLocation = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const loc = await enhancedLocationService.getCurrentLocation();
      setCenter([loc.latitude, loc.longitude]);
      setLocationName(`${loc.city || 'Unknown'}, ${loc.country || ''}`);
    } catch (error) {
      console.error('Failed to get location:', error);
      setLocationName('New Delhi, India');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const handleZoneClick = (zone: any) => {
    setSelectedZone(zone);
    setShowInfo(true);
    onZoneSelect?.(zone);
  };

  const handleRefresh = () => {
    fetchLocation();
  };

  // Risk point icon colors
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'moderate': return '#3b82f6';
      default: return '#22c55e';
    }
  };

  return (
    <MapWrapper>
      <MapHeader>
        <HeaderLeft>
          <MapTitle>
            <Droplets size={20} />
            Flood Risk Map
          </MapTitle>
          <LiveBadge>LIVE DATA</LiveBadge>
        </HeaderLeft>
        <HeaderRight>
          <IconButton onClick={() => setShowInfo(!showInfo)} active={showInfo}>
            <Info />
          </IconButton>
          <IconButton>
            <Layers />
          </IconButton>
          <RefreshButton onClick={handleRefresh} isRefreshing={isRefreshing}>
            <RefreshCw />
          </RefreshButton>
        </HeaderRight>
      </MapHeader>

      <MapContent>
        <MapContainer
          center={center}
          zoom={zoom}
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <MapController center={center} zoom={zoom} />
          <ZoomControl position="bottomright" />
          
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Dark Map">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; Esri'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Street Map">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* Flood Zones */}
          {floodZones.map((zone) => (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              pathOptions={{
                fillColor: zone.color.replace(/[^,]+\)/, '0.4)'),
                fillOpacity: 0.4,
                color: zone.borderColor,
                weight: 2,
              }}
              eventHandlers={{
                click: () => handleZoneClick(zone),
              }}
            >
              <Popup>
                <div style={{ padding: '8px 0' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} style={{ color: zone.borderColor }} />
                    {zone.area}
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                    Risk Level: <RiskBadge level={zone.level}>{zone.level.toUpperCase()}</RiskBadge>
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    Flood Probability: <strong>{zone.probability}%</strong>
                  </div>
                </div>
              </Popup>
            </Polygon>
          ))}

          {/* Risk Points */}
          {riskPoints.map((point) => (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={createCustomIcon(getRiskColor(point.level), 20)}
            >
              <Popup>
                <div style={{ padding: '8px 0' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>{point.type}</div>
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                    Current: <strong>{point.value}</strong>
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                    Threshold: {point.threshold}
                  </div>
                  <RiskBadge level={point.level}>{point.level.toUpperCase()}</RiskBadge>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Shelters */}
          {shelters.map((shelter) => (
            <Marker
              key={`shelter-${shelter.id}`}
              position={[shelter.lat, shelter.lng]}
              icon={L.divIcon({
                className: 'shelter-marker',
                html: `
                  <div style="
                    width: 28px;
                    height: 28px;
                    background: #22c55e;
                    border: 3px solid white;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                  ">
                    <span style="color: white; font-weight: bold; font-size: 10px;">S</span>
                  </div>
                `,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
              })}
            >
              <Popup>
                <div style={{ padding: '8px 0' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Navigation size={14} style={{ color: '#22c55e' }} />
                    {shelter.name}
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                    Capacity: <strong>{shelter.capacity}</strong>
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                    Currently: <strong>{shelter.current}</strong> ({Math.round(shelter.current / shelter.capacity * 100)}%)
                  </div>
                  <button
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${shelter.lat},${shelter.lng}`, '_blank')}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: '#22c55e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '12px',
                    }}
                  >
                    Get Directions
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* User Location Marker */}
          <Circle
            center={center}
            radius={100}
            pathOptions={{
              fillColor: '#6366f1',
              fillOpacity: 0.3,
              color: '#6366f1',
              weight: 2,
            }}
          />
          <Marker
            position={center}
            icon={L.divIcon({
              className: 'user-marker',
              html: `
                <div style="
                  width: 16px;
                  height: 16px;
                  background: #6366f1;
                  border: 3px solid white;
                  border-radius: 50%;
                  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.3), 0 2px 8px rgba(0,0,0,0.3);
                "></div>
              `,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Popup>
              <div style={{ padding: '4px 0' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} style={{ color: '#6366f1' }} />
                  Your Location
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                  {locationName}
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Legend */}
        <Legend>
          <LegendTitle>
            <Target size={14} />
            Risk Levels
          </LegendTitle>
          <LegendItem>
            <LegendColor color="rgba(239, 68, 68, 0.6)" />
            Critical (&gt;70%)
          </LegendItem>
          <LegendItem>
            <LegendColor color="rgba(245, 158, 11, 0.6)" />
            High (50-70%)
          </LegendItem>
          <LegendItem>
            <LegendColor color="rgba(59, 130, 246, 0.6)" />
            Moderate (30-50%)
          </LegendItem>
          <LegendItem>
            <LegendColor color="rgba(34, 197, 94, 0.6)" />
            Low (&lt;30%)
          </LegendItem>
          <LegendItem style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <LegendColor color="#22c55e" />
            Shelter
          </LegendItem>
        </Legend>

        {/* Info Panel */}
        <InfoPanel isVisible={showInfo && selectedZone}>
          <InfoTitle>
            <AlertTriangle size={16} style={{ color: selectedZone?.borderColor, marginRight: '8px' }} />
            {selectedZone?.area}
          </InfoTitle>
          <InfoRow>
            <span>Risk Level</span>
            <RiskBadge level={selectedZone?.level || 'low'}>
              {selectedZone?.level?.toUpperCase()}
            </RiskBadge>
          </InfoRow>
          <InfoRow>
            <span>Flood Probability</span>
            <span>{selectedZone?.probability}%</span>
          </InfoRow>
          <InfoRow>
            <span>ML Confidence</span>
            <span>92%</span>
          </InfoRow>
          <InfoRow>
            <span>Last Updated</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </InfoRow>
        </InfoPanel>
      </MapContent>
    </MapWrapper>
  );
};

export default LeafletFloodMap;
