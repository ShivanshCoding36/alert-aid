/**
 * RealTimeWeatherWidget - Live Weather Data Display
 * Shows current conditions, forecasts, and weather alerts
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { productionColors } from '../../styles/production-ui-system';

interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  visibility: number;
  clouds: number;
  description: string;
  icon: string;
  rain_1h?: number;
  uvi?: number;
}

interface ForecastItem {
  dt: number;
  temp: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  pop: number; // Probability of precipitation
}

interface RealTimeWeatherWidgetProps {
  latitude: number;
  longitude: number;
  onWeatherUpdate?: (data: WeatherData) => void;
}

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const rainDrop = keyframes`
  0% { transform: translateY(-10px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(20px); opacity: 0; }
`;

// Styled Components
const WidgetContainer = styled.div`
  background: ${productionColors.background.secondary};
  border: 1px solid ${productionColors.border.primary};
  border-radius: 16px;
  padding: 20px;
  ${css`animation: ${fadeIn} 0.5s ease-out;`}
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
`;

const WidgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${productionColors.border.primary};
`;

const Title = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: ${productionColors.text.primary};
  margin: 0;
`;

const LiveBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: ${productionColors.status.success};
  
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${productionColors.status.success};
    ${css`animation: ${pulse} 1.5s ease-in-out infinite;`}
  }
`;

const MainWeather = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 24px;
  margin-bottom: 24px;
`;

const WeatherIconSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const WeatherIcon = styled.div`
  font-size: 64px;
  ${css`animation: ${float} 3s ease-in-out infinite;`}
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
`;

const WeatherDescription = styled.span`
  font-size: 12px;
  color: ${productionColors.text.secondary};
  text-transform: capitalize;
`;

const TempSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Temperature = styled.div`
  font-size: 56px;
  font-weight: 700;
  color: ${productionColors.text.primary};
  line-height: 1;
  
  span {
    font-size: 24px;
    color: ${productionColors.text.secondary};
    font-weight: 400;
  }
`;

const FeelsLike = styled.div`
  font-size: 14px;
  color: ${productionColors.text.secondary};
  margin-top: 8px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${productionColors.border.secondary};
  border-radius: 12px;
  padding: 12px;
  text-align: center;
`;

const MetricIcon = styled.span`
  font-size: 20px;
  display: block;
  margin-bottom: 6px;
`;

const MetricValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${productionColors.text.primary};
`;

const MetricLabel = styled.div`
  font-size: 10px;
  color: ${productionColors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
`;

const ForecastSection = styled.div`
  margin-top: 20px;
`;

const SectionTitle = styled.h4`
  font-size: 13px;
  font-weight: 600;
  color: ${productionColors.text.secondary};
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ForecastGrid = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${productionColors.border.primary};
    border-radius: 2px;
  }
`;

const ForecastCard = styled.div`
  flex: 0 0 auto;
  width: 80px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${productionColors.border.secondary};
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-2px);
  }
`;

const ForecastTime = styled.div`
  font-size: 11px;
  color: ${productionColors.text.tertiary};
  margin-bottom: 8px;
`;

const ForecastIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const ForecastTemp = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${productionColors.text.primary};
`;

const ForecastPop = styled.div<{ $value: number }>`
  font-size: 10px;
  color: ${props => props.$value > 50 ? productionColors.status.info : productionColors.text.tertiary};
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
`;

const AlertBanner = styled.div<{ $severity: 'warning' | 'danger' | 'info' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  margin-top: 16px;
  background: ${props => {
    switch (props.$severity) {
      case 'danger': return 'rgba(239, 68, 68, 0.15)';
      case 'warning': return 'rgba(251, 191, 36, 0.15)';
      default: return 'rgba(59, 130, 246, 0.15)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$severity) {
      case 'danger': return 'rgba(239, 68, 68, 0.3)';
      case 'warning': return 'rgba(251, 191, 36, 0.3)';
      default: return 'rgba(59, 130, 246, 0.3)';
    }
  }};
`;

const AlertIcon = styled.span`
  font-size: 20px;
`;

const AlertText = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${productionColors.text.primary};
`;

const AlertDescription = styled.div`
  font-size: 11px;
  color: ${productionColors.text.secondary};
  margin-top: 2px;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: ${productionColors.text.secondary};
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: ${productionColors.brand.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const RainEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.3;
  
  &::before, &::after {
    content: '💧';
    position: absolute;
    font-size: 10px;
    ${css`animation: ${rainDrop} 1s linear infinite;`}
  }
  
  &::before {
    left: 20%;
    animation-delay: 0s;
  }
  
  &::after {
    left: 70%;
    animation-delay: 0.5s;
  }
`;

// Weather icon mapping
const getWeatherEmoji = (icon: string, description: string): string => {
  const iconMap: Record<string, string> = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  return iconMap[icon] || '🌤️';
};

const getWindDirection = (deg: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
};

const RealTimeWeatherWidget: React.FC<RealTimeWeatherWidgetProps> = ({
  latitude,
  longitude,
  onWeatherUpdate,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = '1801423b3942e324ab80f5b47afe0859';

  const fetchWeather = useCallback(async () => {
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`),
      ]);

      if (!weatherRes.ok || !forecastRes.ok) throw new Error('Failed to fetch weather');

      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();

      const current: WeatherData = {
        temp: Math.round(weatherData.main.temp),
        feels_like: Math.round(weatherData.main.feels_like),
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        wind_speed: Math.round(weatherData.wind.speed * 3.6), // Convert to km/h
        wind_deg: weatherData.wind.deg,
        visibility: Math.round(weatherData.visibility / 1000),
        clouds: weatherData.clouds.all,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        rain_1h: weatherData.rain?.['1h'] || 0,
      };

      const forecastItems: ForecastItem[] = (forecastData.list || []).slice(0, 8).map((item: any) => ({
        dt: item.dt,
        temp: Math.round(item.main.temp),
        humidity: item.main.humidity,
        wind_speed: Math.round(item.wind.speed * 3.6),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        pop: Math.round(item.pop * 100),
      }));

      setWeather(current);
      setForecast(forecastItems);
      setError(null);

      if (onWeatherUpdate) {
        onWeatherUpdate(current);
      }
    } catch (err) {
      setError('Failed to load weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, onWeatherUpdate]);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [fetchWeather]);

  const getWeatherAlert = () => {
    if (!weather) return null;

    if (weather.rain_1h && weather.rain_1h > 10) {
      return {
        severity: 'danger' as const,
        icon: '🌊',
        title: 'Heavy Rainfall Alert',
        description: `${weather.rain_1h}mm rainfall in the last hour. Flash flood risk elevated.`,
      };
    }

    if (weather.wind_speed > 50) {
      return {
        severity: 'warning' as const,
        icon: '💨',
        title: 'High Wind Warning',
        description: `Wind speeds of ${weather.wind_speed} km/h detected. Secure loose objects.`,
      };
    }

    if (weather.visibility < 1) {
      return {
        severity: 'warning' as const,
        icon: '🌫️',
        title: 'Low Visibility Warning',
        description: 'Visibility below 1km. Exercise caution while traveling.',
      };
    }

    if (weather.humidity > 90 && weather.clouds > 80) {
      return {
        severity: 'info' as const,
        icon: '🌧️',
        title: 'Rain Expected',
        description: 'High humidity and cloud cover indicate imminent precipitation.',
      };
    }

    return null;
  };

  if (loading) {
    return (
      <WidgetContainer>
        <LoadingState>
          <Spinner />
          <span>Loading weather data...</span>
        </LoadingState>
      </WidgetContainer>
    );
  }

  if (error || !weather) {
    return (
      <WidgetContainer>
        <LoadingState>
          <span>⚠️ {error || 'Unable to load weather'}</span>
        </LoadingState>
      </WidgetContainer>
    );
  }

  const alert = getWeatherAlert();
  const isRaining = weather.rain_1h && weather.rain_1h > 0;

  return (
    <WidgetContainer style={{ position: 'relative', overflow: 'hidden' }}>
      {isRaining && <RainEffect />}
      
      <WidgetHeader>
        <Title>
          🌤️ Live Weather
        </Title>
        <LiveBadge>LIVE</LiveBadge>
      </WidgetHeader>

      <MainWeather>
        <WeatherIconSection>
          <WeatherIcon>{getWeatherEmoji(weather.icon, weather.description)}</WeatherIcon>
          <WeatherDescription>{weather.description}</WeatherDescription>
        </WeatherIconSection>
        
        <TempSection>
          <Temperature>
            {weather.temp}<span>°C</span>
          </Temperature>
          <FeelsLike>Feels like {weather.feels_like}°C</FeelsLike>
        </TempSection>
      </MainWeather>

      <MetricsGrid>
        <MetricCard>
          <MetricIcon>💧</MetricIcon>
          <MetricValue>{weather.humidity}%</MetricValue>
          <MetricLabel>Humidity</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricIcon>💨</MetricIcon>
          <MetricValue>{weather.wind_speed}</MetricValue>
          <MetricLabel>Wind km/h</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricIcon>🧭</MetricIcon>
          <MetricValue>{getWindDirection(weather.wind_deg)}</MetricValue>
          <MetricLabel>Direction</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricIcon>👁️</MetricIcon>
          <MetricValue>{weather.visibility}</MetricValue>
          <MetricLabel>Vis. km</MetricLabel>
        </MetricCard>
      </MetricsGrid>

      <ForecastSection>
        <SectionTitle>24-Hour Forecast</SectionTitle>
        <ForecastGrid>
          {forecast.map((item, index) => (
            <ForecastCard key={index}>
              <ForecastTime>
                {new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </ForecastTime>
              <ForecastIcon>{getWeatherEmoji(item.icon, item.description)}</ForecastIcon>
              <ForecastTemp>{item.temp}°</ForecastTemp>
              <ForecastPop $value={item.pop}>
                💧 {item.pop}%
              </ForecastPop>
            </ForecastCard>
          ))}
        </ForecastGrid>
      </ForecastSection>

      {alert && (
        <AlertBanner $severity={alert.severity}>
          <AlertIcon>{alert.icon}</AlertIcon>
          <AlertText>
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </AlertText>
        </AlertBanner>
      )}
    </WidgetContainer>
  );
};

export default RealTimeWeatherWidget;
