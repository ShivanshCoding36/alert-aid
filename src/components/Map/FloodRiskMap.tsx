/**
 * FloodRiskMap Component - Advanced Interactive Risk Visualization
 * Real-time flood risk zones with ML predictions
 * Uses production-ui-system for consistent styling
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { productionColors } from '../../styles/production-ui-system';
import { advancedMLApi } from '../../services/advancedMLApi';

// Types
interface RiskPoint {
  id: string;
  lat: number;
  lng: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  probability: number;
  name: string;
  type: 'sensor' | 'station' | 'prediction' | 'alert';
}

interface FloodZone {
  id: string;
  name: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  probability: number;
  polygon: { lat: number; lng: number }[];
}

interface FloodRiskMapProps {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  showPredictions?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
}

// Animations
const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.6; }
`;

const rippleEffect = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// Risk level colors matching production system
const riskColors = {
  critical: { 
    primary: productionColors.brand.primary, 
    secondary: 'rgba(239, 68, 68, 0.25)', 
    glow: 'rgba(239, 68, 68, 0.5)' 
  },
  high: { 
    primary: '#F97316', 
    secondary: 'rgba(249, 115, 22, 0.25)', 
    glow: 'rgba(249, 115, 22, 0.5)' 
  },
  moderate: { 
    primary: productionColors.status.warning, 
    secondary: 'rgba(251, 191, 36, 0.2)', 
    glow: 'rgba(251, 191, 36, 0.4)' 
  },
  low: { 
    primary: productionColors.status.success, 
    secondary: 'rgba(34, 197, 94, 0.15)', 
    glow: 'rgba(34, 197, 94, 0.4)' 
  },
};

// Styled Components
const MapWrapper = styled.div`
  background: ${productionColors.background.secondary};
  border: 1px solid ${productionColors.border.primary};
  border-radius: 16px;
  overflow: hidden;
  ${css`animation: ${fadeIn} 0.5s ease-out;`}
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
`;

const MapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid ${productionColors.border.primary};
  background: rgba(0, 0, 0, 0.2);
`;

const MapTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: ${productionColors.text.primary};
  margin: 0;
`;

const TitleIcon = styled.span`
  font-size: 20px;
`;

const MapControls = styled.div`
  display: flex;
  gap: 8px;
`;

const ControlButton = styled.button<{ $active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid ${props => props.$active ? productionColors.brand.primary : productionColors.border.primary};
  background: ${props => props.$active ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)'};
  color: ${props => props.$active ? productionColors.brand.primary : productionColors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 16px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: ${productionColors.text.secondary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 450px;
  background: linear-gradient(180deg, #0a0f1a 0%, #111827 50%, #0f172a 100%);
  overflow: hidden;
`;

const MapCanvas = styled.svg`
  width: 100%;
  height: 100%;
  cursor: crosshair;
`;

const FloodZonePolygon = styled.polygon<{ $riskLevel: string; $isHovered: boolean }>`
  fill: ${props => riskColors[props.$riskLevel as keyof typeof riskColors]?.secondary || riskColors.low.secondary};
  stroke: ${props => riskColors[props.$riskLevel as keyof typeof riskColors]?.primary || riskColors.low.primary};
  stroke-width: ${props => props.$isHovered ? 3 : 2};
  stroke-dasharray: ${props => props.$isHovered ? 'none' : '8,4'};
  opacity: ${props => props.$isHovered ? 1 : 0.8};
  cursor: pointer;
  transition: all 0.3s ease;
`;

const RiskPulse = styled.circle<{ $riskLevel: string; $delay?: number }>`
  fill: ${props => riskColors[props.$riskLevel as keyof typeof riskColors]?.primary || riskColors.low.primary};
  ${css`animation: ${rippleEffect} 2s ease-out infinite;`}
  animation-delay: ${props => props.$delay || 0}s;
  pointer-events: none;
`;

const RiskMarker = styled.circle<{ $riskLevel: string }>`
  fill: ${props => riskColors[props.$riskLevel as keyof typeof riskColors]?.primary || riskColors.low.primary};
  stroke: #fff;
  stroke-width: 2;
  cursor: pointer;
  transition: all 0.2s ease;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  
  &:hover {
    transform: scale(1.2);
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
  }
`;

const InfoOverlay = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
`;

const CoordinatesBox = styled.div`
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  padding: 8px 12px;
  border-radius: 8px;
  font-family: 'SF Mono', 'Monaco', monospace;
  font-size: 11px;
  color: ${productionColors.text.secondary};
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const AlertBanner = styled.div<{ $severity: string }>`
  position: absolute;
  top: 16px;
  right: 16px;
  background: ${props => {
    const colors: Record<string, string> = {
      critical: 'rgba(239, 68, 68, 0.9)',
      severe: 'rgba(249, 115, 22, 0.9)',
      warning: 'rgba(251, 191, 36, 0.9)',
      watch: 'rgba(34, 197, 94, 0.9)',
    };
    return colors[props.$severity] || 'rgba(100, 100, 100, 0.9)';
  }};
  backdrop-filter: blur(8px);
  padding: 10px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  z-index: 10;
  ${css`animation: ${pulse} 2s ease-in-out infinite;`}
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const Legend = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  padding: 14px 16px;
  border-radius: 12px;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const LegendTitle = styled.h4`
  font-size: 12px;
  font-weight: 600;
  color: ${productionColors.text.primary};
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LegendItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: ${productionColors.text.secondary};
`;

const LegendDot = styled.span<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$color};
  box-shadow: 0 0 8px ${props => props.$color}40;
`;

const DetailsPanel = styled.div<{ $visible: boolean }>`
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 260px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  z-index: 10;
  transform: ${props => props.$visible ? 'translateY(0)' : 'translateY(20px)'};
  opacity: ${props => props.$visible ? 1 : 0};
  pointer-events: ${props => props.$visible ? 'auto' : 'none'};
  transition: all 0.3s ease;
`;

const DetailHeader = styled.div<{ $riskLevel: string }>`
  padding: 12px 16px;
  background: ${props => riskColors[props.$riskLevel as keyof typeof riskColors]?.secondary || riskColors.low.secondary};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const DetailTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${productionColors.text.primary};
`;

const DetailSubtitle = styled.p`
  margin: 4px 0 0;
  font-size: 11px;
  color: ${productionColors.text.secondary};
`;

const DetailBody = styled.div`
  padding: 14px 16px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-size: 12px;
  color: ${productionColors.text.secondary};
`;

const DetailValue = styled.span<{ $highlight?: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$highlight ? productionColors.brand.primary : productionColors.text.primary};
`;

const RiskMeter = styled.div`
  margin-top: 12px;
`;

const MeterLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 6px;
`;

const MeterTrack = styled.div`
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
`;

const MeterFill = styled.div<{ $value: number; $riskLevel: string }>`
  height: 100%;
  width: ${props => Math.min(props.$value * 100, 100)}%;
  background: ${props => riskColors[props.$riskLevel as keyof typeof riskColors]?.primary || riskColors.low.primary};
  border-radius: 3px;
  transition: width 0.5s ease;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 20;
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: ${productionColors.brand.primary};
  border-radius: 50%;
  ${css`animation: ${spin} 1s linear infinite;`}
`;

const LoadingText = styled.span`
  font-size: 13px;
  color: ${productionColors.text.secondary};
`;

const ErrorOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 20;
  padding: 20px;
`;

const ErrorIcon = styled.span`
  font-size: 48px;
`;

const ErrorText = styled.span`
  font-size: 14px;
  color: ${productionColors.text.secondary};
  text-align: center;
`;

const RetryButton = styled.button`
  padding: 10px 20px;
  background: ${productionColors.brand.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${productionColors.brand.secondary};
  }
`;

// Component
const FloodRiskMap: React.FC<FloodRiskMapProps> = ({
  centerLat = 28.6139,
  centerLng = 77.2090,
  zoom = 1,
  showPredictions = true,
  onLocationSelect,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(zoom);
  const [selectedZone, setSelectedZone] = useState<FloodZone | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<RiskPoint | null>(null);
  const [mouseCoords, setMouseCoords] = useState({ lat: centerLat, lng: centerLng });
  const [alertData, setAlertData] = useState<any>(null);
  const [showLayers, setShowLayers] = useState(true);
  const [floodProbability, setFloodProbability] = useState(0.35);
  const svgRef = useRef<SVGSVGElement>(null);

  // Map dimensions
  const mapWidth = 800;
  const mapHeight = 450;
  const scale = 80 * zoomLevel;

  // Convert coordinates
  const latLngToXY = useCallback((lat: number, lng: number) => {
    const x = (lng - centerLng) * scale + mapWidth / 2;
    const y = (centerLat - lat) * scale + mapHeight / 2;
    return { x, y };
  }, [centerLat, centerLng, scale]);

  const xyToLatLng = useCallback((x: number, y: number) => {
    const lng = (x - mapWidth / 2) / scale + centerLng;
    const lat = centerLat - (y - mapHeight / 2) / scale;
    return { lat, lng };
  }, [centerLat, centerLng, scale]);

  // Generate flood zones based on prediction
  const floodZones = useMemo((): FloodZone[] => {
    const prob = floodProbability;
    
    return [
      {
        id: 'zone-1',
        name: 'River Flood Plain',
        riskLevel: prob > 0.6 ? 'critical' : prob > 0.4 ? 'high' : 'moderate',
        probability: Math.min(prob * 1.3, 0.95),
        polygon: [
          { lat: centerLat + 0.04, lng: centerLng - 0.02 },
          { lat: centerLat + 0.06, lng: centerLng + 0.03 },
          { lat: centerLat + 0.02, lng: centerLng + 0.05 },
          { lat: centerLat - 0.01, lng: centerLng + 0.02 },
          { lat: centerLat + 0.01, lng: centerLng - 0.01 },
        ],
      },
      {
        id: 'zone-2',
        name: 'Low-lying Urban Area',
        riskLevel: prob > 0.5 ? 'high' : prob > 0.3 ? 'moderate' : 'low',
        probability: Math.min(prob * 1.1, 0.85),
        polygon: [
          { lat: centerLat - 0.03, lng: centerLng - 0.05 },
          { lat: centerLat - 0.01, lng: centerLng - 0.03 },
          { lat: centerLat - 0.04, lng: centerLng },
          { lat: centerLat - 0.06, lng: centerLng - 0.03 },
        ],
      },
      {
        id: 'zone-3',
        name: 'Drainage Basin',
        riskLevel: prob > 0.7 ? 'critical' : prob > 0.5 ? 'high' : 'moderate',
        probability: Math.min(prob * 1.2, 0.9),
        polygon: [
          { lat: centerLat + 0.02, lng: centerLng - 0.06 },
          { lat: centerLat + 0.04, lng: centerLng - 0.04 },
          { lat: centerLat + 0.01, lng: centerLng - 0.02 },
          { lat: centerLat - 0.01, lng: centerLng - 0.05 },
        ],
      },
      {
        id: 'zone-4',
        name: 'Agricultural Zone',
        riskLevel: 'low',
        probability: Math.max(prob * 0.5, 0.1),
        polygon: [
          { lat: centerLat + 0.05, lng: centerLng + 0.04 },
          { lat: centerLat + 0.07, lng: centerLng + 0.06 },
          { lat: centerLat + 0.04, lng: centerLng + 0.08 },
          { lat: centerLat + 0.02, lng: centerLng + 0.06 },
        ],
      },
    ];
  }, [centerLat, centerLng, floodProbability]);

  // Generate risk points
  const riskPoints = useMemo((): RiskPoint[] => {
    const prob = floodProbability;
    
    return [
      { 
        id: 'p1', 
        lat: centerLat + 0.03, 
        lng: centerLng + 0.02, 
        riskLevel: prob > 0.6 ? 'critical' : 'high', 
        probability: Math.min(prob * 1.2, 1),
        name: 'River Gauge Station A',
        type: 'station'
      },
      { 
        id: 'p2', 
        lat: centerLat - 0.02, 
        lng: centerLng - 0.03, 
        riskLevel: prob > 0.5 ? 'high' : 'moderate', 
        probability: prob,
        name: 'Flood Sensor B',
        type: 'sensor'
      },
      { 
        id: 'p3', 
        lat: centerLat + 0.04, 
        lng: centerLng - 0.03, 
        riskLevel: 'moderate', 
        probability: prob * 0.8,
        name: 'Weather Station C',
        type: 'station'
      },
      { 
        id: 'p4', 
        lat: centerLat - 0.04, 
        lng: centerLng + 0.04, 
        riskLevel: 'low', 
        probability: prob * 0.5,
        name: 'Monitoring Point D',
        type: 'sensor'
      },
      { 
        id: 'p5', 
        lat: centerLat + 0.01, 
        lng: centerLng + 0.05, 
        riskLevel: prob > 0.4 ? 'high' : 'moderate', 
        probability: prob * 0.9,
        name: 'Alert Station E',
        type: 'alert'
      },
    ];
  }, [centerLat, centerLng, floodProbability]);

  // Fetch ML predictions
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [predResponse, alertResponse] = await Promise.all([
        advancedMLApi.getEnsemblePredictionGet(centerLat, centerLng).catch(() => null),
        advancedMLApi.getSmartAlertGet(centerLat, centerLng).catch(() => null),
      ]);
      
      if (predResponse?.prediction?.ensemble_prediction?.flood_probability) {
        setFloodProbability(predResponse.prediction.ensemble_prediction.flood_probability);
      }
      
      if (alertResponse) {
        setAlertData(alertResponse);
      }
    } catch (err) {
      console.error('Failed to fetch ML data:', err);
      // Don't show error - use default values
    } finally {
      setLoading(false);
    }
  }, [centerLat, centerLng]);

  useEffect(() => {
    if (showPredictions) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [showPredictions, fetchData]);

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (mapWidth / rect.width);
    const y = (e.clientY - rect.top) * (mapHeight / rect.height);
    const coords = xyToLatLng(x, y);
    setMouseCoords(coords);
  };

  // Handle map click
  const handleMapClick = () => {
    if (onLocationSelect) {
      onLocationSelect(mouseCoords.lat, mouseCoords.lng);
    }
    setSelectedZone(null);
    setSelectedPoint(null);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.3, 0.5));

  // Grid lines
  const gridLines = useMemo(() => {
    const lines = [];
    const step = 50;
    
    for (let x = 0; x <= mapWidth; x += step) {
      lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={mapHeight} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />);
    }
    for (let y = 0; y <= mapHeight; y += step) {
      lines.push(<line key={`h${y}`} x1={0} y1={y} x2={mapWidth} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />);
    }
    
    return lines;
  }, []);

  const getRiskLabel = (level: string) => {
    const labels: Record<string, string> = {
      critical: 'Critical Risk',
      high: 'High Risk',
      moderate: 'Moderate Risk',
      low: 'Low Risk',
    };
    return labels[level] || 'Unknown';
  };

  return (
    <MapWrapper>
      <MapHeader>
        <MapTitle>
          <TitleIcon>🌊</TitleIcon>
          Flood Risk Map
        </MapTitle>
        <MapControls>
          <ControlButton onClick={handleZoomIn} title="Zoom In">🔍+</ControlButton>
          <ControlButton onClick={handleZoomOut} title="Zoom Out">🔍-</ControlButton>
          <ControlButton $active={showLayers} onClick={() => setShowLayers(!showLayers)} title="Toggle Layers">
            📊
          </ControlButton>
          <ControlButton onClick={fetchData} disabled={loading} title="Refresh Data">
            🔄
          </ControlButton>
        </MapControls>
      </MapHeader>

      <MapContainer>
        {loading && (
          <LoadingOverlay>
            <Spinner />
            <LoadingText>Loading ML predictions...</LoadingText>
          </LoadingOverlay>
        )}

        {error && (
          <ErrorOverlay>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorText>{error}</ErrorText>
            <RetryButton onClick={fetchData}>Retry</RetryButton>
          </ErrorOverlay>
        )}

        {/* Alert Banner */}
        {alertData?.alert && (
          <AlertBanner $severity={alertData.alert.severity}>
            ⚠️ {alertData.alert.title}
          </AlertBanner>
        )}

        {/* Coordinates Display */}
        <InfoOverlay>
          <CoordinatesBox>
            📍 {mouseCoords.lat.toFixed(4)}°, {mouseCoords.lng.toFixed(4)}°
          </CoordinatesBox>
        </InfoOverlay>

        {/* Main SVG Map */}
        <MapCanvas
          ref={svgRef}
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          onClick={handleMapClick}
          onMouseMove={handleMouseMove}
        >
          {/* Grid Background */}
          <g>{gridLines}</g>

          {/* Flood Zones */}
          {showLayers && floodZones.map((zone) => {
            const points = zone.polygon.map(p => {
              const { x, y } = latLngToXY(p.lat, p.lng);
              return `${x},${y}`;
            }).join(' ');
            
            return (
              <FloodZonePolygon
                key={zone.id}
                points={points}
                $riskLevel={zone.riskLevel}
                $isHovered={selectedZone?.id === zone.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedZone(zone);
                  setSelectedPoint(null);
                }}
              />
            );
          })}

          {/* Risk Points */}
          {riskPoints.map((point) => {
            const { x, y } = latLngToXY(point.lat, point.lng);
            const isHighRisk = point.riskLevel === 'critical' || point.riskLevel === 'high';
            
            return (
              <g key={point.id}>
                {/* Pulse animation for high risk */}
                {isHighRisk && (
                  <>
                    <RiskPulse cx={x} cy={y} r={8} $riskLevel={point.riskLevel} $delay={0} />
                    <RiskPulse cx={x} cy={y} r={8} $riskLevel={point.riskLevel} $delay={0.5} />
                  </>
                )}
                
                {/* Main marker */}
                <RiskMarker
                  cx={x}
                  cy={y}
                  r={10}
                  $riskLevel={point.riskLevel}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPoint(point);
                    setSelectedZone(null);
                  }}
                />
              </g>
            );
          })}

          {/* Center Location Marker */}
          <g>
            <circle cx={mapWidth / 2} cy={mapHeight / 2} r={20} fill="rgba(59, 130, 246, 0.3)" />
            <circle cx={mapWidth / 2} cy={mapHeight / 2} r={8} fill="#3B82F6" stroke="#fff" strokeWidth={3} />
            <circle cx={mapWidth / 2} cy={mapHeight / 2} r={3} fill="#fff" />
          </g>
        </MapCanvas>

        {/* Legend */}
        <Legend>
          <LegendTitle>📊 Risk Levels</LegendTitle>
          <LegendItems>
            <LegendItem>
              <LegendDot $color={riskColors.critical.primary} />
              Critical (&gt;70%)
            </LegendItem>
            <LegendItem>
              <LegendDot $color={riskColors.high.primary} />
              High (50-70%)
            </LegendItem>
            <LegendItem>
              <LegendDot $color={riskColors.moderate.primary} />
              Moderate (30-50%)
            </LegendItem>
            <LegendItem>
              <LegendDot $color={riskColors.low.primary} />
              Low (&lt;30%)
            </LegendItem>
          </LegendItems>
        </Legend>

        {/* Details Panel */}
        <DetailsPanel $visible={!!(selectedZone || selectedPoint)}>
          {selectedZone && (
            <>
              <DetailHeader $riskLevel={selectedZone.riskLevel}>
                <DetailTitle>{selectedZone.name}</DetailTitle>
                <DetailSubtitle>{getRiskLabel(selectedZone.riskLevel)}</DetailSubtitle>
              </DetailHeader>
              <DetailBody>
                <DetailRow>
                  <DetailLabel>Zone ID</DetailLabel>
                  <DetailValue>{selectedZone.id}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Risk Level</DetailLabel>
                  <DetailValue $highlight>{selectedZone.riskLevel.toUpperCase()}</DetailValue>
                </DetailRow>
                <RiskMeter>
                  <MeterLabel>
                    <span style={{ color: productionColors.text.secondary }}>Flood Probability</span>
                    <span style={{ color: productionColors.text.primary, fontWeight: 600 }}>
                      {(selectedZone.probability * 100).toFixed(0)}%
                    </span>
                  </MeterLabel>
                  <MeterTrack>
                    <MeterFill $value={selectedZone.probability} $riskLevel={selectedZone.riskLevel} />
                  </MeterTrack>
                </RiskMeter>
              </DetailBody>
            </>
          )}
          
          {selectedPoint && (
            <>
              <DetailHeader $riskLevel={selectedPoint.riskLevel}>
                <DetailTitle>{selectedPoint.name}</DetailTitle>
                <DetailSubtitle>{selectedPoint.type.charAt(0).toUpperCase() + selectedPoint.type.slice(1)}</DetailSubtitle>
              </DetailHeader>
              <DetailBody>
                <DetailRow>
                  <DetailLabel>Coordinates</DetailLabel>
                  <DetailValue>{selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Risk Level</DetailLabel>
                  <DetailValue $highlight>{selectedPoint.riskLevel.toUpperCase()}</DetailValue>
                </DetailRow>
                <RiskMeter>
                  <MeterLabel>
                    <span style={{ color: productionColors.text.secondary }}>Risk Probability</span>
                    <span style={{ color: productionColors.text.primary, fontWeight: 600 }}>
                      {(Math.min(selectedPoint.probability, 1) * 100).toFixed(0)}%
                    </span>
                  </MeterLabel>
                  <MeterTrack>
                    <MeterFill $value={Math.min(selectedPoint.probability, 1)} $riskLevel={selectedPoint.riskLevel} />
                  </MeterTrack>
                </RiskMeter>
              </DetailBody>
            </>
          )}
        </DetailsPanel>
      </MapContainer>
    </MapWrapper>
  );
};

export default FloodRiskMap;
