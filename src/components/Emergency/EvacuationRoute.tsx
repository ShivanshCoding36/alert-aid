/**
 * EvacuationRoute - Interactive Evacuation Route Planner
 * Shows safe routes, shelters, and navigation during emergencies
 */

import React, { useState, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { productionColors } from '../../styles/production-ui-system';

interface Shelter {
  id: string;
  name: string;
  type: 'shelter' | 'hospital' | 'school' | 'community-center';
  capacity: number;
  currentOccupancy: number;
  distance: number;
  travelTime: number;
  coordinates: { lat: number; lng: number };
  facilities: string[];
  isRecommended?: boolean;
}

interface EvacuationRouteProps {
  userLocation?: { lat: number; lng: number };
  disasterType?: 'flood' | 'earthquake' | 'fire' | 'storm';
}

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

const flowAnimation = keyframes`
  0% { stroke-dashoffset: 20; }
  100% { stroke-dashoffset: 0; }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Styled Components
const Container = styled.div`
  background: ${productionColors.background.secondary};
  border: 1px solid ${productionColors.border.primary};
  border-radius: 16px;
  overflow: hidden;
  ${css`animation: ${fadeIn} 0.5s ease-out;`}
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.15) 0%, 
    rgba(249, 115, 22, 0.1) 100%
  );
  padding: 20px;
  border-bottom: 1px solid ${productionColors.border.secondary};
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${productionColors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AlertBadge = styled.span`
  padding: 4px 10px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: ${productionColors.brand.primary};
  ${css`animation: ${blink} 1.5s ease-in-out infinite;`}
`;

const StatusBar = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${productionColors.text.secondary};
`;

const StatusDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$color};
  box-shadow: 0 0 8px ${props => props.$color};
`;

const MapContainer = styled.div`
  position: relative;
  height: 400px;
  background: #0F172A;
  overflow: hidden;
`;

const MapSVG = styled.svg`
  width: 100%;
  height: 100%;
`;

const Grid = styled.g`
  stroke: rgba(255, 255, 255, 0.03);
  stroke-width: 1;
`;

const UserLocation = styled.circle`
  fill: #3B82F6;
  stroke: white;
  stroke-width: 3;
  ${css`animation: ${pulse} 2s ease-in-out infinite;`}
  filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.6));
`;

const UserLocationRing = styled.circle`
  fill: none;
  stroke: rgba(59, 130, 246, 0.3);
  stroke-width: 2;
  ${css`animation: ${pulse} 2s ease-in-out infinite;`}
`;

const ShelterMarker = styled.g<{ $recommended?: boolean }>`
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  ${props => props.$recommended && css`
    filter: drop-shadow(0 0 15px rgba(34, 197, 94, 0.7));
  `}
`;

const ShelterCircle = styled.circle<{ $type: string; $recommended?: boolean }>`
  fill: ${props => {
    if (props.$recommended) return '#22C55E';
    switch (props.$type) {
      case 'hospital': return '#EF4444';
      case 'school': return '#3B82F6';
      case 'community-center': return '#8B5CF6';
      default: return '#F97316';
    }
  }};
  stroke: white;
  stroke-width: 2;
`;

const ShelterIcon = styled.text`
  fill: white;
  font-size: 14px;
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
`;

const RoutePath = styled.path<{ $type: string }>`
  fill: none;
  stroke: ${props => {
    switch (props.$type) {
      case 'clear': return '#22C55E';
      case 'congested': return '#FBBF24';
      case 'blocked': return '#EF4444';
      default: return '#22C55E';
    }
  }};
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: ${props => props.$type === 'blocked' ? '10, 5' : 'none'};
  ${props => props.$type === 'clear' && css`animation: ${flowAnimation} 1s linear infinite;`}
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
`;

const DangerZone = styled.circle`
  fill: rgba(239, 68, 68, 0.15);
  stroke: rgba(239, 68, 68, 0.5);
  stroke-width: 2;
  stroke-dasharray: 5, 5;
`;

const DangerLabel = styled.text`
  fill: ${productionColors.brand.primary};
  font-size: 10px;
  font-weight: 600;
  text-anchor: middle;
`;

const InfoPanel = styled.div`
  padding: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${productionColors.text.primary};
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ShelterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ShelterCard = styled.div<{ $recommended?: boolean; $selected?: boolean }>`
  background: ${props => props.$recommended 
    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)'
    : 'rgba(255, 255, 255, 0.03)'
  };
  border: 1px solid ${props => 
    props.$selected ? '#3B82F6' :
    props.$recommended ? 'rgba(34, 197, 94, 0.4)' : 
    productionColors.border.secondary
  };
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  ${css`animation: ${slideIn} 0.3s ease-out;`}
  animation-fill-mode: backwards;
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateX(4px);
  }
`;

const ShelterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ShelterInfo = styled.div`
  flex: 1;
`;

const ShelterName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${productionColors.text.primary};
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RecommendedBadge = styled.span`
  padding: 2px 8px;
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
  border-radius: 10px;
  font-size: 9px;
  font-weight: 600;
  color: #22C55E;
  text-transform: uppercase;
`;

const ShelterType = styled.div`
  font-size: 11px;
  color: ${productionColors.text.tertiary};
  text-transform: capitalize;
`;

const DistanceInfo = styled.div`
  text-align: right;
`;

const Distance = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${productionColors.text.primary};
`;

const TravelTime = styled.div`
  font-size: 11px;
  color: ${productionColors.text.tertiary};
`;

const ShelterStats = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
`;

const Stat = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: ${productionColors.text.tertiary};
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const StatValue = styled.div<{ $warning?: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.$warning ? '#FBBF24' : productionColors.text.primary};
`;

const CapacityBar = styled.div`
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
`;

const CapacityFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => {
    if (props.$percentage >= 90) return '#EF4444';
    if (props.$percentage >= 70) return '#FBBF24';
    return '#22C55E';
  }};
  border-radius: 2px;
  transition: width 0.5s ease;
`;

const Facilities = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const FacilityTag = styled.span`
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${productionColors.border.secondary};
  border-radius: 6px;
  font-size: 10px;
  color: ${productionColors.text.secondary};
`;

const NavigateButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${props => props.$primary 
    ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
    : 'rgba(255, 255, 255, 0.05)'
  };
  border: ${props => props.$primary ? 'none' : `1px solid ${productionColors.border.secondary}`};
  border-radius: 10px;
  color: ${props => props.$primary ? 'white' : productionColors.text.secondary};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  margin-top: 12px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  }
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid ${productionColors.border.secondary};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: ${productionColors.text.secondary};
`;

const LegendColor = styled.span<{ $color: string; $dashed?: boolean }>`
  width: 16px;
  height: 3px;
  background: ${props => props.$dashed ? 'transparent' : props.$color};
  border: ${props => props.$dashed ? `2px dashed ${props.$color}` : 'none'};
  border-radius: 2px;
`;

const LegendMarker = styled.span<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$color};
`;

const EvacuationRoute: React.FC<EvacuationRouteProps> = ({
  userLocation = { lat: 28.6139, lng: 77.2090 },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  disasterType = 'flood',
}) => {
  const [selectedShelter, setSelectedShelter] = useState<string | null>(null);

  // Sample shelter data
  const shelters: Shelter[] = useMemo(() => [
    {
      id: 's1',
      name: 'Central Relief Center',
      type: 'shelter',
      capacity: 500,
      currentOccupancy: 234,
      distance: 2.3,
      travelTime: 12,
      coordinates: { lat: 28.625, lng: 77.220 },
      facilities: ['Food', 'Water', 'Medical', 'Beds', 'WiFi'],
      isRecommended: true,
    },
    {
      id: 's2',
      name: 'City Hospital Emergency',
      type: 'hospital',
      capacity: 200,
      currentOccupancy: 156,
      distance: 3.8,
      travelTime: 18,
      coordinates: { lat: 28.605, lng: 77.195 },
      facilities: ['Medical', 'ICU', 'Pharmacy', 'Ambulance'],
    },
    {
      id: 's3',
      name: 'Public School #42',
      type: 'school',
      capacity: 350,
      currentOccupancy: 289,
      distance: 4.5,
      travelTime: 22,
      coordinates: { lat: 28.630, lng: 77.180 },
      facilities: ['Food', 'Water', 'Playground', 'Classrooms'],
    },
  ], []);

  const getShelterIcon = (type: string) => {
    switch (type) {
      case 'hospital': return '🏥';
      case 'school': return '🏫';
      case 'community-center': return '🏛️';
      default: return '🏠';
    }
  };

  const mapScale = (value: number, min: number, max: number, outMin: number, outMax: number) => {
    return ((value - min) / (max - min)) * (outMax - outMin) + outMin;
  };

  const handleNavigate = (shelterId: string) => {
    setSelectedShelter(shelterId);
    // In a real app, this would trigger navigation
    console.log('Navigating to shelter:', shelterId);
  };

  return (
    <Container>
      <Header>
        <HeaderTop>
          <Title>
            🗺️ Evacuation Routes
          </Title>
          <AlertBadge>⚠️ ACTIVE EMERGENCY</AlertBadge>
        </HeaderTop>
        <StatusBar>
          <StatusItem>
            <StatusDot $color="#22C55E" />
            3 Routes Clear
          </StatusItem>
          <StatusItem>
            <StatusDot $color="#FBBF24" />
            1 Congested
          </StatusItem>
          <StatusItem>
            <StatusDot $color="#EF4444" />
            2 Blocked
          </StatusItem>
        </StatusBar>
      </Header>

      <MapContainer>
        <MapSVG viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
          {/* Grid Background */}
          <Grid>
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="400" />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} />
            ))}
          </Grid>

          {/* Danger Zones */}
          <DangerZone cx="450" cy="300" r="80" />
          <DangerLabel x="450" y="300">⚠️ Flood Zone</DangerLabel>
          
          <DangerZone cx="150" cy="350" r="50" />
          <DangerLabel x="150" y="350">⚠️ Rising Water</DangerLabel>

          {/* Route to recommended shelter */}
          <RoutePath
            $type="clear"
            d="M 300 200 Q 350 180 400 150 Q 450 120 480 100"
            strokeDasharray="10, 5"
          />
          
          {/* Route to hospital */}
          <RoutePath
            $type="congested"
            d="M 300 200 Q 250 220 200 250 Q 150 280 120 300"
          />
          
          {/* Blocked route */}
          <RoutePath
            $type="blocked"
            d="M 300 200 Q 350 250 400 280"
          />

          {/* Shelter Markers */}
          {shelters.map((shelter, index) => {
            const x = mapScale(shelter.coordinates.lng, 77.17, 77.23, 80, 520);
            const y = mapScale(shelter.coordinates.lat, 28.60, 28.64, 320, 80);
            
            return (
              <ShelterMarker
                key={shelter.id}
                $recommended={shelter.isRecommended}
                onClick={() => setSelectedShelter(shelter.id)}
              >
                <ShelterCircle
                  cx={x}
                  cy={y}
                  r={shelter.isRecommended ? 20 : 16}
                  $type={shelter.type}
                  $recommended={shelter.isRecommended}
                />
                <ShelterIcon x={x} y={y}>
                  {getShelterIcon(shelter.type)}
                </ShelterIcon>
              </ShelterMarker>
            );
          })}

          {/* User Location */}
          <UserLocationRing cx="300" cy="200" r="25" />
          <UserLocation cx="300" cy="200" r="12" />
          <text x="300" y="200" fill="white" fontSize="10" textAnchor="middle" dominantBaseline="central">📍</text>
        </MapSVG>
      </MapContainer>

      <InfoPanel>
        <SectionTitle>
          🏠 Nearby Shelters
        </SectionTitle>
        <ShelterList>
          {shelters.map(shelter => {
            const occupancyPercentage = (shelter.currentOccupancy / shelter.capacity) * 100;
            
            return (
              <ShelterCard
                key={shelter.id}
                $recommended={shelter.isRecommended}
                $selected={selectedShelter === shelter.id}
                onClick={() => setSelectedShelter(shelter.id)}
              >
                <ShelterHeader>
                  <ShelterInfo>
                    <ShelterName>
                      {getShelterIcon(shelter.type)} {shelter.name}
                      {shelter.isRecommended && <RecommendedBadge>Recommended</RecommendedBadge>}
                    </ShelterName>
                    <ShelterType>{shelter.type.replace('-', ' ')}</ShelterType>
                  </ShelterInfo>
                  <DistanceInfo>
                    <Distance>{shelter.distance} km</Distance>
                    <TravelTime>~{shelter.travelTime} min</TravelTime>
                  </DistanceInfo>
                </ShelterHeader>

                <ShelterStats>
                  <Stat>
                    <StatLabel>Capacity</StatLabel>
                    <StatValue $warning={occupancyPercentage > 80}>
                      {shelter.currentOccupancy}/{shelter.capacity}
                    </StatValue>
                    <CapacityBar>
                      <CapacityFill $percentage={occupancyPercentage} />
                    </CapacityBar>
                  </Stat>
                  <Stat>
                    <StatLabel>Availability</StatLabel>
                    <StatValue>
                      {shelter.capacity - shelter.currentOccupancy} spots
                    </StatValue>
                  </Stat>
                </ShelterStats>

                <Facilities>
                  {shelter.facilities.map(facility => (
                    <FacilityTag key={facility}>{facility}</FacilityTag>
                  ))}
                </Facilities>

                <NavigateButton 
                  $primary={shelter.isRecommended}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate(shelter.id);
                  }}
                >
                  🧭 Navigate to this shelter
                </NavigateButton>
              </ShelterCard>
            );
          })}
        </ShelterList>
      </InfoPanel>

      <Legend>
        <LegendItem>
          <LegendColor $color="#22C55E" />
          Clear Route
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#FBBF24" />
          Congested
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#EF4444" $dashed />
          Blocked
        </LegendItem>
        <LegendItem>
          <LegendMarker $color="#3B82F6" />
          Your Location
        </LegendItem>
        <LegendItem>
          <LegendMarker $color="#22C55E" />
          Recommended
        </LegendItem>
      </Legend>
    </Container>
  );
};

export default EvacuationRoute;
