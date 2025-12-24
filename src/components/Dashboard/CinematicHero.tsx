import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { MapPin, Clock, Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import EnhancedWeatherCard from './cards/EnhancedWeatherCard';

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const HeroContainer = styled.div<{ $riskLevel: string }>`
  position: relative;
  height: 60vh;
  min-height: 500px;
  width: 100%;
  overflow: hidden;
  background: ${props => {
    switch (props.$riskLevel) {
      case 'high':
      case 'critical':
        return `linear-gradient(135deg, 
          #1a0d0d 0%, 
          #2d1b1b 25%, 
          #4a2c2a 50%, 
          #2d1b1b 75%, 
          #1a0d0d 100%)`;
      case 'moderate':
        return `linear-gradient(135deg, 
          #1a1a0d 0%, 
          #2d2d1b 25%, 
          #4a4a2c 50%, 
          #2d2d1b 75%, 
          #1a1a0d 100%)`;
      default:
        return `linear-gradient(135deg, 
          #0d1a0d 0%, 
          #1b2d1b 25%, 
          #2c4a2c 50%, 
          #1b2d1b 75%, 
          #0d1a0d 100%)`;
    }
  }};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 80%, rgba(76, 209, 199, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(168, 85, 247, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2rem;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.4) 100%
  );
`;

const TopOverlay = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.6);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  ${css`animation: ${floatAnimation} 3s ease-in-out infinite;`}
`;

const LocationText = styled.div`
  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #e2e8f0;
  }
  
  p {
    margin: 0.25rem 0 0 0;
    font-size: 0.9rem;
    color: #a0aec0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const StatusBadges = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const StatusBadge = styled.div<{ $variant: 'success' | 'warning' | 'danger' | 'info' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  background: ${props => {
    switch (props.$variant) {
      case 'success': return 'rgba(72, 187, 120, 0.2)';
      case 'warning': return 'rgba(251, 191, 36, 0.2)';
      case 'danger': return 'rgba(245, 101, 101, 0.2)';
      default: return 'rgba(76, 209, 199, 0.2)';
    }
  }};
  
  color: ${props => {
    switch (props.$variant) {
      case 'success': return '#68d391';
      case 'warning': return '#fbd38d';
      case 'danger': return '#fc8181';
      default: return '#4fd1c7';
    }
  }};
  
  ${props => props.$variant === 'danger' && css`animation: ${pulseAnimation} 2s ease-in-out infinite;`}
`;

const CenterStats = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  flex-wrap: wrap;
  margin: 2rem 0;
`;

const StatCard = styled.div<{ highlight?: boolean }>`
  text-align: center;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 16px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 120px;
  
  ${props => props.highlight && `
    background: rgba(76, 209, 199, 0.1);
    border: 1px solid rgba(76, 209, 199, 0.3);
    box-shadow: 0 0 30px rgba(76, 209, 199, 0.2);
  `}
  
  h3 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: #e2e8f0;
    line-height: 1;
  }
  
  p {
    margin: 0.5rem 0 0 0;
    font-size: 0.85rem;
    color: #a0aec0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const WeatherInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  background: rgba(0, 0, 0, 0.5);
  padding: 1.5rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const WeatherIcon = styled.div`
  font-size: 3rem;
  ${css`animation: ${floatAnimation} 4s ease-in-out infinite;`}
`;

const WeatherDetails = styled.div`
  h3 {
    margin: 0;
    font-size: 2.5rem;
    font-weight: 300;
    color: #e2e8f0;
  }
  
  p {
    margin: 0.5rem 0 0 0;
    font-size: 1rem;
    color: #a0aec0;
  }
`;

interface CinematicHeroProps {
  location: any;
  weather: any;
  prediction: any;
  alerts: any;
}

const CinematicHero: React.FC<CinematicHeroProps> = ({
  location,
  weather,
  prediction,
  alerts
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getRiskLevel = () => {
    if (!prediction) return 'low';
    const score = prediction.risk_score || 0;
    if (score >= 8) return 'critical';
    if (score >= 6) return 'high';
    if (score >= 4) return 'moderate';
    return 'low';
  };

  const getAlertVariant = () => {
    const riskLevel = getRiskLevel();
    switch (riskLevel) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'moderate': return 'warning';
      default: return 'success';
    }
  };

  const getWeatherIcon = () => {
    if (!weather?.weather_icon) return '🌤️';
    const icon = weather.weather_icon;
    const iconMap: { [key: string]: string } = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '🌙',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '🌨️', '13n': '🌨️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[icon] || '🌤️';
  };

  return (
    <HeroContainer $riskLevel={getRiskLevel()}>
      <HeroContent>
        <TopOverlay>
          <LocationInfo>
            <MapPin size={20} color="#4fd1c7" />
            <LocationText>
              <h2>{location?.city || 'Unknown Location'}</h2>
              <p>
                <Clock size={14} />
                {currentTime.toLocaleTimeString()} • {location?.state}, {location?.country}
              </p>
            </LocationText>
          </LocationInfo>
          
          <StatusBadges>
            <StatusBadge $variant={getAlertVariant()}>
              <Shield size={16} />
              Risk: {getRiskLevel().toUpperCase()}
            </StatusBadge>
            
            {prediction?.confidence && (
              <StatusBadge $variant="info">
                <TrendingUp size={16} />
                Confidence: {Math.round(prediction.confidence * 100)}%
              </StatusBadge>
            )}
            
            {alerts?.count > 0 && (
              <StatusBadge $variant="warning">
                <AlertTriangle size={16} />
                {alerts.count} Active Alert{alerts.count !== 1 ? 's' : ''}
              </StatusBadge>
            )}
          </StatusBadges>
        </TopOverlay>

        <CenterStats>
          <StatCard highlight={prediction?.risk_score >= 6}>
            <h3>{prediction?.risk_score || 0}</h3>
            <p>Overall Risk</p>
          </StatCard>
          
          <StatCard>
            <h3>{prediction?.flood_risk || 0}</h3>
            <p>Flood Risk</p>
          </StatCard>
          
          <StatCard>
            <h3>{prediction?.fire_risk || 0}</h3>
            <p>Fire Risk</p>
          </StatCard>
          
          <StatCard>
            <h3>{prediction?.storm_risk || 0}</h3>
            <p>Storm Risk</p>
          </StatCard>
        </CenterStats>

        {/* Enhanced weather card (uses OpenWeatherMap fallback, live display) */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <EnhancedWeatherCard weather={weather} />
        </div>
      </HeroContent>
    </HeroContainer>
  );
};

export default CinematicHero;