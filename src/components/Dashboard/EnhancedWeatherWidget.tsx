import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind,
  Thermometer,
  Droplets,
  Eye,
  Gauge,
  AlertTriangle,
  MapPin,
  Activity,
  CloudSnow,
  Zap
} from 'lucide-react';
import { productionColors } from '../../styles/production-ui-system';
import { enhancedLocationService } from '../../services/enhancedLocationService';
import SimpleWeatherService from '../../services/simpleWeatherService';
import { SkeletonWeatherWidget } from '../common/SkeletonLoaders';

// Animations
const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

// Container
const WidgetContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 32px;
  padding: 32px;
  background: linear-gradient(135deg, #1a1b23 0%, #25262f 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;
  ${css`animation: ${slideIn} 0.6s ease-out;`}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, 
      ${productionColors.brand.primary}, 
      ${productionColors.status.warning}, 
      ${productionColors.brand.primary}
    );
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

// Left Panel - Main Weather
const MainWeatherPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const WeatherIcon = styled.div<{ $risk: number }>`
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${({ $risk }) => {
    if ($risk >= 7) return 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(249, 115, 22, 0.2))';
    if ($risk >= 5) return 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(245, 158, 11, 0.2))';
    if ($risk >= 3) return 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 179, 8, 0.2))';
    return 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))';
  }};
  border: 2px solid ${({ $risk }) => {
    if ($risk >= 7) return '#EF4444';
    if ($risk >= 5) return '#F97316';
    if ($risk >= 3) return '#F59E0B';
    return '#22C55E';
  }};
  box-shadow: ${({ $risk }) => {
    if ($risk >= 7) return '0 8px 32px rgba(239, 68, 68, 0.3)';
    if ($risk >= 5) return '0 8px 32px rgba(249, 115, 22, 0.3)';
    if ($risk >= 3) return '0 8px 32px rgba(245, 158, 11, 0.3)';
    return '0 8px 32px rgba(34, 197, 94, 0.3)';
  }};
  ${css`animation: ${float} 3s ease-in-out infinite;`}
  
  svg {
    width: 64px;
    height: 64px;
    color: ${({ $risk }) => {
      if ($risk >= 7) return '#EF4444';
      if ($risk >= 5) return '#F97316';
      if ($risk >= 3) return '#F59E0B';
      return '#22C55E';
    }};
  }
`;

const Temperature = styled.div`
  font-size: 56px;
  font-weight: 800;
  background: linear-gradient(135deg, #F7F8FA 0%, #D1D5DB 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
`;

const Condition = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${productionColors.text.secondary};
  text-align: center;
`;

const LocationDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  font-size: 14px;
  color: #EF4444;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const LastUpdated = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 8px;
  font-size: 12px;
  color: #22C55E;
  margin-top: 8px;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const LiveDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22C55E;
  ${css`animation: ${pulse} 2s ease-in-out infinite;`}
`;

// Right Panel - Details & Risk
const DetailsPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const MetricCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(239, 68, 68, 0.2);
    transform: translateY(-2px);
  }
  
  svg {
    width: 24px;
    height: 24px;
    color: ${productionColors.text.tertiary};
  }
`;

const MetricContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: ${productionColors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetricValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${productionColors.text.primary};
`;

// Risk Assessment Card
const RiskCard = styled.div<{ $risk: number }>`
  padding: 20px;
  border-radius: 12px;
  background: ${({ $risk }) => {
    if ($risk >= 7) return 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.15))';
    if ($risk >= 5) return 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(245, 158, 11, 0.15))';
    if ($risk >= 3) return 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 179, 8, 0.15))';
    return 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))';
  }};
  border: 2px solid ${({ $risk }) => {
    if ($risk >= 7) return 'rgba(239, 68, 68, 0.3)';
    if ($risk >= 5) return 'rgba(249, 115, 22, 0.3)';
    if ($risk >= 3) return 'rgba(245, 158, 11, 0.3)';
    return 'rgba(34, 197, 94, 0.3)';
  }};
  box-shadow: ${({ $risk }) => {
    if ($risk >= 7) return '0 8px 24px rgba(239, 68, 68, 0.2)';
    if ($risk >= 5) return '0 8px 24px rgba(249, 115, 22, 0.2)';
    if ($risk >= 3) return '0 8px 24px rgba(245, 158, 11, 0.2)';
    return '0 8px 24px rgba(34, 197, 94, 0.2)';
  }};
`;

const RiskHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const RiskLevel = styled.div<{ $risk: number }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: ${({ $risk }) => {
    if ($risk >= 7) return '#EF4444';
    if ($risk >= 5) return '#F97316';
    if ($risk >= 3) return '#F59E0B';
    return '#22C55E';
  }};
  
  svg {
    width: 20px;
    height: 20px;
    ${css`animation: ${pulse} 2s ease-in-out infinite;`}
  }
`;

const RiskScore = styled.div<{ $risk: number }>`
  font-size: 32px;
  font-weight: 800;
  background: ${({ $risk }) => {
    if ($risk >= 7) return 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
    if ($risk >= 5) return 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)';
    if ($risk >= 3) return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
    return 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)';
  }};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const RiskDescription = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: ${productionColors.text.secondary};
`;

interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  lastUpdated?: string;
}

const EnhancedWeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<string>('Jaipur, Rajasthan, India');
  const [loading, setLoading] = useState(true);

  const calculateWeatherRisk = (data: WeatherData): number => {
    let risk = 1; // Base risk - always some minimal risk
    
    // Temperature factors (more granular)
    if (data.temp > 45 || data.temp < -5) risk += 3;
    else if (data.temp > 40 || data.temp < 0) risk += 2.5;
    else if (data.temp > 35 || data.temp < 5) risk += 2;
    else if (data.temp > 32 || data.temp < 10) risk += 1;
    else if (data.temp > 28) risk += 0.5; // Warm but not extreme
    
    // Wind speed (more granular)
    if (data.windSpeed > 60) risk += 3;
    else if (data.windSpeed > 40) risk += 2.5;
    else if (data.windSpeed > 25) risk += 1.5;
    else if (data.windSpeed > 15) risk += 0.5;
    
    // Humidity factors
    if (data.humidity > 90) risk += 1;
    else if (data.humidity > 80) risk += 0.5;
    else if (data.humidity < 20) risk += 0.5; // Very dry conditions
    
    // Visibility factors
    if (data.visibility < 1) risk += 2;
    else if (data.visibility < 3) risk += 1;
    else if (data.visibility < 5) risk += 0.5;
    
    // Weather conditions
    const cond = data.condition.toLowerCase();
    if (cond.includes('storm') || cond.includes('thunder')) risk += 2.5;
    else if (cond.includes('heavy rain') || cond.includes('torrential')) risk += 2;
    else if (cond.includes('snow') || cond.includes('blizzard')) risk += 2;
    else if (cond.includes('rain') || cond.includes('drizzle')) risk += 1;
    else if (cond.includes('fog') || cond.includes('mist')) risk += 0.8;
    else if (cond.includes('haze') || cond.includes('smoke')) risk += 0.5;
    else if (cond.includes('cloud') || cond.includes('overcast')) risk += 0.3;
    
    // UV Index
    if (data.uvIndex > 10) risk += 1.5;
    else if (data.uvIndex > 8) risk += 1;
    else if (data.uvIndex > 6) risk += 0.5;
    
    // Pressure factors (extreme pressure can indicate storms)
    if (data.pressure < 990 || data.pressure > 1030) risk += 0.5;
    
    return Math.min(Math.max(risk, 1), 10); // Ensure between 1-10
  };

  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('clear') || cond.includes('sunny')) return Sun;
    if (cond.includes('rain')) return CloudRain;
    if (cond.includes('snow')) return CloudSnow;
    if (cond.includes('storm') || cond.includes('thunder')) return Zap;
    if (cond.includes('wind')) return Wind;
    return Cloud;
  };

  const getRiskMessage = (risk: number): string => {
    if (risk >= 7) return 'Severe weather conditions detected. Take extra precautions and monitor updates closely.';
    if (risk >= 5) return 'Elevated weather risk. Stay alert and be prepared for changing conditions.';
    if (risk >= 3) return 'Moderate conditions. Standard safety precautions recommended.';
    return 'Weather conditions are favorable. Enjoy your day with normal precautions.';
  };

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchWeather = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        console.log('🌤️ [EnhancedWeatherWidget] Starting weather fetch...');
        
        // Get location with retry
        console.log('📍 [EnhancedWeatherWidget] Getting current location...');
        const loc = await enhancedLocationService.getCurrentLocation();
        if (!isMounted) return;
        
        console.log('📍 [EnhancedWeatherWidget] Location obtained:', {
          city: loc.city,
          state: loc.state,
          country: loc.country,
          lat: loc.latitude,
          lon: loc.longitude
        });
        setLocation(`${loc.city}, ${loc.state || loc.country}`);
        
        // Get weather data with simple reliable service
        console.log('☀️ [EnhancedWeatherWidget] Fetching weather data for coordinates:', loc.latitude, loc.longitude);
        const weatherData = await SimpleWeatherService.getWeather(loc.latitude, loc.longitude);
        if (!isMounted) return;
        
        console.log('☀️ [EnhancedWeatherWidget] Weather data received:', {
          temp: weatherData.current.temp,
          condition: weatherData.current.weather[0].main,
          humidity: weatherData.current.humidity,
          windSpeed: weatherData.current.wind_speed
        });
        
        const weatherState = {
          temp: Math.round(weatherData.current.temp),
          feelsLike: Math.round(weatherData.current.feels_like),
          condition: weatherData.current.weather[0].main,
          humidity: weatherData.current.humidity,
          windSpeed: Math.round(weatherData.current.wind_speed * 3.6), // m/s to km/h
          pressure: weatherData.current.pressure,
          visibility: Math.round(weatherData.current.visibility / 1000),
          uvIndex: weatherData.current.uvi,
          lastUpdated: weatherData.last_updated || new Date().toISOString()
        };
        
        setWeather(weatherState);
        console.log('✅ [EnhancedWeatherWidget] Weather state updated successfully:', weatherState);
        
        retryCount = 0; // Reset retry count on success
      } catch (error) {
        console.error('❌ [EnhancedWeatherWidget] Weather fetch error:', error);
        console.error('❌ [EnhancedWeatherWidget] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        
        // Retry logic
        if (retryCount < maxRetries && isMounted) {
          retryCount++;
          const retryDelay = 2000 * retryCount;
          console.log(`🔄 [EnhancedWeatherWidget] Retrying weather fetch (${retryCount}/${maxRetries}) in ${retryDelay}ms...`);
          setTimeout(fetchWeather, retryDelay); // Exponential backoff
        } else {
          console.error(`❌ [EnhancedWeatherWidget] Max retries (${maxRetries}) reached. Weather data unavailable.`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    console.log('🚀 [EnhancedWeatherWidget] Component mounted, initiating first weather fetch...');
    fetchWeather();
    
    const interval = setInterval(() => {
      console.log('🔄 [EnhancedWeatherWidget] Auto-refresh triggered (10-minute interval)');
      fetchWeather();
    }, 10 * 60 * 1000); // Update every 10 minutes
    
    return () => {
      console.log('🛑 [EnhancedWeatherWidget] Component unmounting, cleaning up...');
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading || !weather) {
    return <SkeletonWeatherWidget />;
  }

  const risk = calculateWeatherRisk(weather);
  const WeatherIconComponent = getWeatherIcon(weather.condition);
  
  // Format last updated time
  const getTimeAgo = (timestamp?: string) => {
    if (!timestamp) return 'Just now';
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diffMinutes = Math.floor((now - then) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes === 1) return '1 minute ago';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  return (
    <WidgetContainer>
      <MainWeatherPanel>
        <WeatherIcon $risk={risk}>
          <WeatherIconComponent />
        </WeatherIcon>
        <Temperature>{weather.temp}°C</Temperature>
        <Condition>{weather.condition}</Condition>
        <LocationDisplay>
          <MapPin />
          <span>{location}</span>
        </LocationDisplay>
        <LastUpdated>
          <LiveDot />
          <Activity size={14} />
          <span>Last updated: {getTimeAgo(weather.lastUpdated)}</span>
        </LastUpdated>
      </MainWeatherPanel>

      <DetailsPanel>
        <MetricsGrid>
          <MetricCard>
            <Thermometer />
            <MetricContent>
              <MetricLabel>Feels Like</MetricLabel>
              <MetricValue>{weather.feelsLike}°C</MetricValue>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <Droplets />
            <MetricContent>
              <MetricLabel>Humidity</MetricLabel>
              <MetricValue>{weather.humidity}%</MetricValue>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <Wind />
            <MetricContent>
              <MetricLabel>Wind Speed</MetricLabel>
              <MetricValue>{weather.windSpeed} km/h</MetricValue>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <Gauge />
            <MetricContent>
              <MetricLabel>Pressure</MetricLabel>
              <MetricValue>{weather.pressure} hPa</MetricValue>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <Eye />
            <MetricContent>
              <MetricLabel>Visibility</MetricLabel>
              <MetricValue>{weather.visibility} km</MetricValue>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <Sun />
            <MetricContent>
              <MetricLabel>UV Index</MetricLabel>
              <MetricValue>{weather.uvIndex.toFixed(1)}</MetricValue>
            </MetricContent>
          </MetricCard>
        </MetricsGrid>

        <RiskCard $risk={risk}>
          <RiskHeader>
            <RiskLevel $risk={risk}>
              <AlertTriangle />
              {risk >= 7 ? 'High Risk' : risk >= 5 ? 'Elevated Risk' : risk >= 3 ? 'Moderate Risk' : 'Low Risk'}
            </RiskLevel>
            <RiskScore $risk={risk}>{risk.toFixed(1)}</RiskScore>
          </RiskHeader>
          <RiskDescription>{getRiskMessage(risk)}</RiskDescription>
        </RiskCard>
      </DetailsPanel>
    </WidgetContainer>
  );
};

export default EnhancedWeatherWidget;
