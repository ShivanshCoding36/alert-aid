/**
 * ENHANCED 7-DAY FORECAST SERVICE
 * Optimized weather forecast with smart caching and multiple API sources
 * API Key: 5e3cfb0419404781b05200642252312
 */

const OPENWEATHER_API_KEY = '5e3cfb0419404781b05200642252312';
const OPENWEATHER_FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const OPENWEATHER_ONECALL_URL = 'https://api.openweathermap.org/data/2.5/onecall';
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

export interface EnhancedForecastDay {
  date: string;
  day: string;
  temperature: number;
  temp_min: number;
  temp_max: number;
  feels_like: number;
  conditions: string;
  weatherCode: string;
  humidity: number;
  wind_speed: number;
  wind_deg: number;
  pressure: number;
  precipitation: number;
  pop: number; // probability of precipitation
  clouds: number;
  uvi: number;
  visibility: number;
  dew_point: number;
  riskScore: number;
}

export interface EnhancedForecastResponse {
  forecast: EnhancedForecastDay[];
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  last_updated: string;
  source: string;
  is_real: boolean;
  cached: boolean;
}

// Smart cache with 30-minute expiry to minimize API calls
interface CacheEntry {
  data: EnhancedForecastResponse;
  timestamp: number;
}

const forecastCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for forecast data

class EnhancedForecastService {
  /**
   * Get 7-day forecast with smart caching
   * Reduces API calls while maintaining accuracy
   */
  async getForecast(lat: number, lon: number): Promise<EnhancedForecastResponse> {
    const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
    
    // Check cache first (30-minute window)
    const cached = forecastCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 [ForecastService] Using cached forecast data (age: ' + 
        Math.round((Date.now() - cached.timestamp) / 60000) + 'min)');
      return { ...cached.data, cached: true };
    }
    
    console.log(`🌤️ [ForecastService] Fetching fresh 7-day forecast for ${lat}, ${lon}`);
    
    // Try OpenWeatherMap 5-day/3-hour forecast (free tier)
    try {
      const data = await this.fetchOpenWeatherForecast(lat, lon);
      forecastCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (owmError) {
      console.warn('⚠️ [ForecastService] OpenWeatherMap failed, trying Open-Meteo...', owmError);
    }
    
    // Fallback to Open-Meteo (free, no key required, excellent 7-day forecast)
    try {
      const data = await this.fetchOpenMeteoForecast(lat, lon);
      forecastCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (omError) {
      console.error('❌ [ForecastService] Open-Meteo also failed:', omError);
    }
    
    // Use stale cache if available
    if (cached) {
      console.warn('⚠️ [ForecastService] Using stale cached forecast');
      return { ...cached.data, cached: true };
    }
    
    throw new Error('All forecast APIs failed. Please check your internet connection.');
  }

  /**
   * Fetch from OpenWeatherMap 5 Day / 3 Hour Forecast API
   * Free tier: 5 days, 3-hour intervals
   */
  private async fetchOpenWeatherForecast(lat: number, lon: number): Promise<EnhancedForecastResponse> {
    const url = `${OPENWEATHER_FORECAST_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Group forecasts by day and calculate daily aggregates
    const dailyForecasts = this.aggregateToDailyForecast(data.list);
    
    return {
      forecast: dailyForecasts,
      location: {
        latitude: lat,
        longitude: lon,
        city: data.city?.name,
        country: data.city?.country,
      },
      last_updated: new Date().toISOString(),
      source: 'OpenWeatherMap 5-Day Forecast',
      is_real: true,
      cached: false,
    };
  }

  /**
   * Fetch from Open-Meteo API (free, excellent 7-day forecast)
   */
  private async fetchOpenMeteoForecast(lat: number, lon: number): Promise<EnhancedForecastResponse> {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      daily: 'temperature_2m_max,temperature_2m_min,apparent_temperature_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_probability_max,weathercode,windspeed_10m_max,winddirection_10m_dominant,uv_index_max,sunrise,sunset',
      timezone: 'auto',
      forecast_days: '7',
    });
    
    const url = `${OPEN_METEO_URL}?${params}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }
    
    const data = await response.json();
    const dailyData = data.daily;
    const forecast: EnhancedForecastDay[] = [];
    
    for (let i = 0; i < Math.min(7, dailyData.time.length); i++) {
      const date = new Date(dailyData.time[i]);
      const temp_max = dailyData.temperature_2m_max[i];
      const temp_min = dailyData.temperature_2m_min[i];
      const temperature = (temp_max + temp_min) / 2;
      const precipitation = (dailyData.rain_sum[i] || 0) + (dailyData.showers_sum[i] || 0) + (dailyData.snowfall_sum[i] || 0);
      const wind_speed = dailyData.windspeed_10m_max[i];
      const weatherCode = dailyData.weathercode[i];
      const conditions = this.getWeatherDescription(weatherCode);
      
      // Calculate risk score based on weather conditions
      const riskScore = this.calculateRiskScore(
        precipitation,
        wind_speed,
        dailyData.precipitation_probability_max[i],
        weatherCode
      );
      
      forecast.push({
        date: dailyData.time[i],
        day: this.getDayName(date),
        temperature: Math.round(temperature * 10) / 10,
        temp_min: Math.round(temp_min * 10) / 10,
        temp_max: Math.round(temp_max * 10) / 10,
        feels_like: Math.round(dailyData.apparent_temperature_max[i] * 10) / 10,
        conditions,
        weatherCode: weatherCode.toString(),
        humidity: 0, // Open-Meteo doesn't provide daily humidity
        wind_speed: Math.round(wind_speed * 10) / 10,
        wind_deg: dailyData.winddirection_10m_dominant[i],
        pressure: 1013, // Standard pressure as Open-Meteo doesn't provide it
        precipitation: Math.round(precipitation * 10) / 10,
        pop: dailyData.precipitation_probability_max[i] / 100,
        clouds: 0,
        uvi: Math.round((dailyData.uv_index_max[i] || 0) * 10) / 10,
        visibility: 10000,
        dew_point: 0,
        riskScore: Math.round(riskScore * 10) / 10,
      });
    }
    
    return {
      forecast,
      location: {
        latitude: lat,
        longitude: lon,
      },
      last_updated: new Date().toISOString(),
      source: 'Open-Meteo 7-Day Forecast',
      is_real: true,
      cached: false,
    };
  }

  /**
   * Aggregate 3-hour forecast data into daily forecasts
   */
  private aggregateToDailyForecast(list: any[]): EnhancedForecastDay[] {
    const dailyMap = new Map<string, any[]>();
    
    // Group by date
    list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, []);
      }
      dailyMap.get(date)!.push(item);
    });
    
    // Calculate daily aggregates
    const forecast: EnhancedForecastDay[] = [];
    let dayCount = 0;
    
    for (const [dateStr, items] of Array.from(dailyMap.entries())) {
      if (dayCount >= 7) break;
      
      const date = new Date(dateStr);
      const temps = items.map(i => i.main.temp);
      const feels_like = items.map(i => i.main.feels_like);
      const precipitation = items.reduce((sum, i) => sum + (i.rain?.['3h'] || 0) + (i.snow?.['3h'] || 0), 0);
      const pop = Math.max(...items.map(i => i.pop || 0));
      
      // Get most common weather condition
      const weatherCounts = new Map<string, number>();
      items.forEach(i => {
        const weather = i.weather[0].main;
        weatherCounts.set(weather, (weatherCounts.get(weather) || 0) + 1);
      });
      const conditions = Array.from(weatherCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];
      const weatherCode = items[0].weather[0].id.toString();
      
      const temperature = temps.reduce((a, b) => a + b, 0) / temps.length;
      const wind_speed = items.reduce((s, i) => s + i.wind.speed, 0) / items.length;
      
      const riskScore = this.calculateRiskScore(precipitation, wind_speed * 3.6, pop * 100, parseInt(weatherCode));
      
      forecast.push({
        date: dateStr,
        day: this.getDayName(date),
        temperature: Math.round(temperature * 10) / 10,
        temp_min: Math.round(Math.min(...temps) * 10) / 10,
        temp_max: Math.round(Math.max(...temps) * 10) / 10,
        feels_like: Math.round(feels_like.reduce((a, b) => a + b, 0) / feels_like.length * 10) / 10,
        conditions,
        weatherCode,
        humidity: Math.round(items.reduce((s, i) => s + i.main.humidity, 0) / items.length),
        wind_speed: Math.round(wind_speed * 3.6 * 10) / 10, // Convert m/s to km/h
        wind_deg: Math.round(items.reduce((s, i) => s + i.wind.deg, 0) / items.length),
        pressure: Math.round(items.reduce((s, i) => s + i.main.pressure, 0) / items.length),
        precipitation: Math.round(precipitation * 10) / 10,
        pop: Math.round(pop * 100) / 100,
        clouds: Math.round(items.reduce((s, i) => s + i.clouds.all, 0) / items.length),
        uvi: 0,
        visibility: Math.round(items.reduce((s, i) => s + (i.visibility || 10000), 0) / items.length),
        dew_point: 0,
        riskScore: Math.round(riskScore * 10) / 10,
      });
      
      dayCount++;
    }
    
    return forecast;
  }

  /**
   * Calculate risk score based on weather conditions
   */
  private calculateRiskScore(precipitation: number, windSpeed: number, pop: number, weatherCode: number): number {
    let risk = 1.0;
    
    // Precipitation risk (0-15mm = low, 15-40mm = medium, >40mm = high)
    if (precipitation > 40) risk += 3.0;
    else if (precipitation > 15) risk += 2.0;
    else if (precipitation > 5) risk += 1.0;
    
    // Wind speed risk (km/h)
    if (windSpeed > 50) risk += 2.5;
    else if (windSpeed > 30) risk += 1.5;
    else if (windSpeed > 20) risk += 0.5;
    
    // Probability of precipitation risk
    if (pop > 70) risk += 1.5;
    else if (pop > 40) risk += 0.75;
    
    // Weather code risk (storms, extreme conditions)
    if (weatherCode >= 200 && weatherCode < 300) risk += 3.0; // Thunderstorm
    else if (weatherCode >= 500 && weatherCode < 600) risk += 1.5; // Rain
    else if (weatherCode >= 600 && weatherCode < 700) risk += 2.0; // Snow
    else if (weatherCode >= 700 && weatherCode < 800) risk += 1.0; // Atmosphere (fog, etc)
    
    return Math.min(10, Math.max(1, risk));
  }

  /**
   * Get weather description from Open-Meteo weather code
   */
  private getWeatherDescription(code: number): string {
    const weatherCodes: { [key: number]: string } = {
      0: 'Clear',
      1: 'Mostly Clear',
      2: 'Partly Cloudy',
      3: 'Cloudy',
      45: 'Foggy',
      48: 'Rime Fog',
      51: 'Light Drizzle',
      53: 'Drizzle',
      55: 'Heavy Drizzle',
      61: 'Light Rain',
      63: 'Rain',
      65: 'Heavy Rain',
      71: 'Light Snow',
      73: 'Snow',
      75: 'Heavy Snow',
      77: 'Snow Grains',
      80: 'Light Showers',
      81: 'Showers',
      82: 'Heavy Showers',
      85: 'Light Snow Showers',
      86: 'Snow Showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with Hail',
      99: 'Heavy Thunderstorm',
    };
    
    return weatherCodes[code] || 'Unknown';
  }

  /**
   * Get day name from date
   */
  private getDayName(date: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }

  /**
   * Clear cache manually (useful for forcing refresh)
   */
  clearCache(): void {
    forecastCache.clear();
    console.log('🗑️ [ForecastService] Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: forecastCache.size,
      entries: Array.from(forecastCache.keys()),
    };
  }
}

const enhancedForecastService = new EnhancedForecastService();
export default enhancedForecastService;
