/**
 * ROBUST WEATHER SERVICE
 * Multi-API weather integration with Open-Meteo as free backup
 * No mock data - real API responses only
 */

const OPENWEATHER_API_KEY = '1801423b3942e324ab80f5b47afe0859';
const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

export interface SimpleWeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    visibility: number;
    uvi: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  };
  last_updated: string;
  is_real: boolean;
  source: string;
}

// Cache to reduce API calls (5 minute cache)
const weatherCache = new Map<string, { data: SimpleWeatherData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class SimpleWeatherService {
  /**
   * Fetch weather data with fallback chain:
   * 1. Check cache
   * 2. Try OpenWeatherMap API
   * 3. Fall back to Open-Meteo API (free, no key required)
   */
  static async getWeather(lat: number, lon: number): Promise<SimpleWeatherData> {
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    
    // Check cache first
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 [WeatherService] Using cached data');
      return cached.data;
    }
    
    console.log(`🌤️ [WeatherService] Fetching weather for ${lat}, ${lon}`);
    
    // Try OpenWeatherMap first
    try {
      const data = await this.fetchOpenWeatherMap(lat, lon);
      weatherCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (owmError) {
      console.warn('⚠️ [WeatherService] OpenWeatherMap failed, trying Open-Meteo...', owmError);
    }
    
    // Fallback to Open-Meteo (free, no API key required)
    try {
      const data = await this.fetchOpenMeteo(lat, lon);
      weatherCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (omError) {
      console.error('❌ [WeatherService] Open-Meteo also failed:', omError);
    }
    
    // If we have stale cache, use it
    if (cached) {
      console.warn('⚠️ [WeatherService] Using stale cached data');
      return cached.data;
    }
    
    throw new Error('All weather APIs failed. Please check your internet connection.');
  }

  /**
   * OpenWeatherMap API (Primary)
   */
  private static async fetchOpenWeatherMap(lat: number, lon: number): Promise<SimpleWeatherData> {
    const url = `${OPENWEATHER_URL}?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenWeatherMap HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ [WeatherService] OpenWeatherMap success');
    
    return {
      current: {
        temp: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        wind_speed: data.wind.speed * 3.6, // Convert m/s to km/h
        visibility: data.visibility || 10000,
        uvi: 0, // Not available in free tier
        weather: data.weather || [{ main: 'Clear', description: 'clear sky', icon: '01d' }]
      },
      last_updated: new Date().toISOString(),
      is_real: true,
      source: 'OpenWeatherMap'
    };
  }

  /**
   * Open-Meteo API (Free backup - no API key required)
   * https://open-meteo.com/
   */
  private static async fetchOpenMeteo(lat: number, lon: number): Promise<SimpleWeatherData> {
    const url = `${OPEN_METEO_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,visibility&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ [WeatherService] Open-Meteo success');
    
    const current = data.current;
    const weatherCode = current.weather_code || 0;
    
    return {
      current: {
        temp: current.temperature_2m,
        feels_like: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        pressure: current.surface_pressure,
        wind_speed: current.wind_speed_10m, // Already in km/h
        visibility: (current.visibility || 10000), // meters
        uvi: 0,
        weather: [this.mapWeatherCode(weatherCode)]
      },
      last_updated: new Date().toISOString(),
      is_real: true,
      source: 'Open-Meteo'
    };
  }

  /**
   * Map Open-Meteo weather codes to OpenWeatherMap-style objects
   * https://open-meteo.com/en/docs
   */
  private static mapWeatherCode(code: number): { main: string; description: string; icon: string } {
    const weatherMap: Record<number, { main: string; description: string; icon: string }> = {
      0: { main: 'Clear', description: 'clear sky', icon: '01d' },
      1: { main: 'Clear', description: 'mainly clear', icon: '01d' },
      2: { main: 'Clouds', description: 'partly cloudy', icon: '02d' },
      3: { main: 'Clouds', description: 'overcast', icon: '04d' },
      45: { main: 'Fog', description: 'fog', icon: '50d' },
      48: { main: 'Fog', description: 'depositing rime fog', icon: '50d' },
      51: { main: 'Drizzle', description: 'light drizzle', icon: '09d' },
      53: { main: 'Drizzle', description: 'moderate drizzle', icon: '09d' },
      55: { main: 'Drizzle', description: 'dense drizzle', icon: '09d' },
      61: { main: 'Rain', description: 'slight rain', icon: '10d' },
      63: { main: 'Rain', description: 'moderate rain', icon: '10d' },
      65: { main: 'Rain', description: 'heavy rain', icon: '10d' },
      71: { main: 'Snow', description: 'slight snow', icon: '13d' },
      73: { main: 'Snow', description: 'moderate snow', icon: '13d' },
      75: { main: 'Snow', description: 'heavy snow', icon: '13d' },
      77: { main: 'Snow', description: 'snow grains', icon: '13d' },
      80: { main: 'Rain', description: 'slight rain showers', icon: '09d' },
      81: { main: 'Rain', description: 'moderate rain showers', icon: '09d' },
      82: { main: 'Rain', description: 'violent rain showers', icon: '09d' },
      85: { main: 'Snow', description: 'slight snow showers', icon: '13d' },
      86: { main: 'Snow', description: 'heavy snow showers', icon: '13d' },
      95: { main: 'Thunderstorm', description: 'thunderstorm', icon: '11d' },
      96: { main: 'Thunderstorm', description: 'thunderstorm with slight hail', icon: '11d' },
      99: { main: 'Thunderstorm', description: 'thunderstorm with heavy hail', icon: '11d' },
    };
    
    return weatherMap[code] || { main: 'Unknown', description: 'unknown', icon: '01d' };
  }

  /**
   * Clear weather cache (useful for forcing refresh)
   */
  static clearCache(): void {
    weatherCache.clear();
    console.log('🗑️ [WeatherService] Cache cleared');
  }
}

export default SimpleWeatherService;
