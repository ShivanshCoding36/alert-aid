/**
 * WEATHER FORECAST SERVICE
 * Fetches 7-day forecast from backend OpenWeatherMap API
 */

import logger from '../utils/logger';

// Use environment variable or fallback to localhost
const getApiBaseUrl = (): string => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  if (process.env.NODE_ENV === 'production') {
    return ''; // Same origin for Vercel
  }
  return 'http://127.0.0.1:8000';
};
const API_BASE_URL = getApiBaseUrl();

export interface DailyForecast {
  date: string;
  day: string;
  temperature: number;
  temp_min: number;
  temp_max: number;
  feels_like: number;
  conditions: string;
  humidity: number;
  wind_speed: number;
  pressure: number;
  precipitation: number;
  uvi: number;
  risk_score: number;
}

export interface ForecastResponse {
  forecast: DailyForecast[];
  location: {
    latitude: number;
    longitude: number;
  };
  last_updated: string;
  source: string;
  is_real: boolean;
}

class WeatherForecastService {
  /**
   * Get 7-day weather forecast for coordinates
   */
  async getForecast(lat: number, lon: number, days: number = 7): Promise<ForecastResponse> {
    try {
      logger.log(`📅 Fetching ${days}-day forecast for ${lat}, ${lon}`);
      
      const response = await fetch(
        `${API_BASE_URL}/api/weather/forecast/${lat}/${lon}?days=${days}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        logger.warn(`⚠️ Forecast API failed (${response.status}), using calculated forecast`);
        return this.generateFallbackForecast(lat, lon, days);
      }

      const data: ForecastResponse = await response.json();
      
      logger.log(`✅ ${days}-day forecast retrieved:`, {
        days: data.forecast.length,
        source: data.source,
        is_real: data.is_real,
      });

      return data;
    } catch (error) {
      logger.warn('⚠️ Forecast fetch error, using calculated forecast:', error);
      return this.generateFallbackForecast(lat, lon, days);
    }
  }

  /**
   * Generate realistic fallback forecast when backend unavailable
   */
  private generateFallbackForecast(lat: number, lon: number, days: number): ForecastResponse {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const forecast: DailyForecast[] = [];
    const now = new Date();

    // Use coordinates to seed consistent but varied data
    const latSeed = Math.abs(Math.sin(lat * 100));
    const lonSeed = Math.abs(Math.cos(lon * 100));

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      // Generate varied but realistic values
      const dayOffset = (latSeed + lonSeed + i * 0.3) % 1;
      const baseTemp = 20 + (latSeed * 15) - 5; // 15-30°C range
      const tempVariation = Math.sin(i * 0.8) * 5;
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        day: daysOfWeek[date.getDay()],
        temperature: Math.round((baseTemp + tempVariation) * 10) / 10,
        temp_min: Math.round((baseTemp + tempVariation - 3) * 10) / 10,
        temp_max: Math.round((baseTemp + tempVariation + 3) * 10) / 10,
        feels_like: Math.round((baseTemp + tempVariation - 1) * 10) / 10,
        conditions: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Sunny'][Math.floor(dayOffset * 5)],
        humidity: Math.round(40 + dayOffset * 40), // 40-80%
        wind_speed: Math.round((5 + dayOffset * 20) * 10) / 10, // 5-25 km/h
        pressure: Math.round(1008 + dayOffset * 20), // 1008-1028 hPa
        precipitation: Math.round(dayOffset * 15 * 10) / 10, // 0-15mm
        uvi: Math.max(0, Math.min(11, Math.round(dayOffset * 12))), // 0-11
        risk_score: Math.round((1 + dayOffset * 7) * 10) / 10 // 1-8 risk
      });
    }

    return {
      forecast,
      location: { latitude: lat, longitude: lon },
      last_updated: new Date().toISOString(),
      source: 'Calculated Forecast (Backend unavailable)',
      is_real: false
    };
  }

  /**
   * Convert backend forecast to component-friendly format
   */
  convertToForecastData(forecast: DailyForecast[]) {
    return forecast.map(day => ({
      day: day.day,
      riskScore: day.risk_score,
      precipitation: day.precipitation,
      temperature: day.temperature,
      windSpeed: day.wind_speed,
      conditions: day.conditions,  // Include weather conditions for icons
    }));
  }
}

const weatherForecastService = new WeatherForecastService();
export default weatherForecastService;