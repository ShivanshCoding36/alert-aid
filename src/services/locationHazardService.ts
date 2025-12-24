/**
 * Location-Based Hazard Assessment Service
 * Provides accurate, real-world hazard risk calculations based on actual geographic
 * and meteorological data for any given location.
 */

// Known geographic data for major Indian cities and regions
interface CityGeographicData {
  elevation: number; // in meters
  terrain: 'flat' | 'hilly' | 'mountainous' | 'coastal' | 'delta';
  nearRiver: boolean;
  riverDistance: number; // in km
  nearCoast: boolean;
  coastDistance: number; // in km
  seismicZone: 1 | 2 | 3 | 4 | 5; // ISS seismic zoning
  annualRainfall: number; // in mm
  vegetation: 'urban' | 'dense' | 'moderate' | 'sparse' | 'desert';
  floodHistory: 'none' | 'rare' | 'occasional' | 'frequent';
}

// Geographic database for Indian cities (can be expanded)
const CITY_GEOGRAPHIC_DATA: Record<string, CityGeographicData> = {
  // Delhi NCR Region
  'delhi': {
    elevation: 216,
    terrain: 'flat',
    nearRiver: true,
    riverDistance: 5, // Yamuna
    nearCoast: false,
    coastDistance: 1000,
    seismicZone: 4,
    annualRainfall: 797,
    vegetation: 'urban',
    floodHistory: 'occasional'
  },
  'new delhi': {
    elevation: 216,
    terrain: 'flat',
    nearRiver: true,
    riverDistance: 8,
    nearCoast: false,
    coastDistance: 1000,
    seismicZone: 4,
    annualRainfall: 797,
    vegetation: 'urban',
    floodHistory: 'rare'
  },
  'gurgaon': {
    elevation: 217,
    terrain: 'flat',
    nearRiver: false,
    riverDistance: 25,
    nearCoast: false,
    coastDistance: 950,
    seismicZone: 4,
    annualRainfall: 650,
    vegetation: 'urban',
    floodHistory: 'rare'
  },
  'noida': {
    elevation: 200,
    terrain: 'flat',
    nearRiver: true,
    riverDistance: 3,
    nearCoast: false,
    coastDistance: 1020,
    seismicZone: 4,
    annualRainfall: 800,
    vegetation: 'urban',
    floodHistory: 'occasional'
  },
  // Mumbai Region
  'mumbai': {
    elevation: 14,
    terrain: 'coastal',
    nearRiver: true,
    riverDistance: 2,
    nearCoast: true,
    coastDistance: 0,
    seismicZone: 3,
    annualRainfall: 2422,
    vegetation: 'urban',
    floodHistory: 'frequent'
  },
  // Chennai Region
  'chennai': {
    elevation: 6,
    terrain: 'coastal',
    nearRiver: true,
    riverDistance: 1,
    nearCoast: true,
    coastDistance: 0,
    seismicZone: 3,
    annualRainfall: 1400,
    vegetation: 'urban',
    floodHistory: 'frequent'
  },
  // Kolkata Region
  'kolkata': {
    elevation: 9,
    terrain: 'delta',
    nearRiver: true,
    riverDistance: 0,
    nearCoast: false,
    coastDistance: 100,
    seismicZone: 3,
    annualRainfall: 1582,
    vegetation: 'urban',
    floodHistory: 'frequent'
  },
  // Bangalore
  'bangalore': {
    elevation: 920,
    terrain: 'hilly',
    nearRiver: false,
    riverDistance: 50,
    nearCoast: false,
    coastDistance: 350,
    seismicZone: 2,
    annualRainfall: 970,
    vegetation: 'urban',
    floodHistory: 'occasional'
  },
  'bengaluru': {
    elevation: 920,
    terrain: 'hilly',
    nearRiver: false,
    riverDistance: 50,
    nearCoast: false,
    coastDistance: 350,
    seismicZone: 2,
    annualRainfall: 970,
    vegetation: 'urban',
    floodHistory: 'occasional'
  },
  // Himalayan Region
  'shimla': {
    elevation: 2276,
    terrain: 'mountainous',
    nearRiver: true,
    riverDistance: 10,
    nearCoast: false,
    coastDistance: 1200,
    seismicZone: 4,
    annualRainfall: 1575,
    vegetation: 'dense',
    floodHistory: 'rare'
  },
  'dehradun': {
    elevation: 435,
    terrain: 'hilly',
    nearRiver: true,
    riverDistance: 5,
    nearCoast: false,
    coastDistance: 1100,
    seismicZone: 4,
    annualRainfall: 2073,
    vegetation: 'moderate',
    floodHistory: 'occasional'
  },
  // Rajasthan
  'jaipur': {
    elevation: 431,
    terrain: 'flat',
    nearRiver: false,
    riverDistance: 50,
    nearCoast: false,
    coastDistance: 500,
    seismicZone: 2,
    annualRainfall: 650,
    vegetation: 'sparse',
    floodHistory: 'rare'
  },
  // Default for unknown locations
  'default': {
    elevation: 200,
    terrain: 'flat',
    nearRiver: false,
    riverDistance: 100,
    nearCoast: false,
    coastDistance: 500,
    seismicZone: 2,
    annualRainfall: 800,
    vegetation: 'moderate',
    floodHistory: 'rare'
  }
};

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainfall24h: number;
  pressure: number;
  description: string;
  clouds: number;
}

export interface HazardRiskResult {
  type: 'flood' | 'earthquake' | 'storm' | 'fire' | 'landslide';
  name: string;
  icon: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  probability: number;
  confidence: number;
  factors: string[];
  trend: 'decreasing' | 'stable' | 'increasing';
  timeframe: string;
  recommendations: string[];
  dataSource: string;
}

class LocationHazardService {
  private static readonly API_KEY = '1801423b3942e324ab80f5b47afe0859';
  private static weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
  private static readonly CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

  /**
   * Get geographic data for a location based on city name or coordinates
   */
  static getGeographicData(cityName: string, lat: number, lon: number): CityGeographicData {
    // Normalize city name
    const normalizedCity = cityName.toLowerCase().trim();
    
    // Check for exact match
    if (CITY_GEOGRAPHIC_DATA[normalizedCity]) {
      return CITY_GEOGRAPHIC_DATA[normalizedCity];
    }

    // Check for partial matches
    for (const [key, data] of Object.entries(CITY_GEOGRAPHIC_DATA)) {
      if (normalizedCity.includes(key) || key.includes(normalizedCity)) {
        return data;
      }
    }

    // Generate approximate data based on coordinates for India
    return this.estimateGeographicData(lat, lon);
  }

  /**
   * Estimate geographic data based on coordinates when city is not in database
   */
  private static estimateGeographicData(lat: number, lon: number): CityGeographicData {
    // India-specific estimation
    const isHimalayanRegion = lat > 28 && lat < 36 && lon > 74 && lon < 92;
    const isCoastal = (lon < 73 || lon > 87) || lat < 12;
    const isGangeticPlain = lat > 22 && lat < 28 && lon > 78 && lon < 90;
    const isTharDesert = lat > 24 && lat < 30 && lon > 68 && lon < 76;
    const isWesternGhats = lon > 73 && lon < 78 && lat > 8 && lat < 21;

    let terrain: CityGeographicData['terrain'] = 'flat';
    let seismicZone: CityGeographicData['seismicZone'] = 2;
    let elevation = 200;

    if (isHimalayanRegion) {
      terrain = 'mountainous';
      seismicZone = 5;
      elevation = 2000;
    } else if (isWesternGhats) {
      terrain = 'hilly';
      seismicZone = 3;
      elevation = 800;
    } else if (isCoastal) {
      terrain = 'coastal';
      seismicZone = 3;
      elevation = 10;
    } else if (isGangeticPlain) {
      terrain = 'flat';
      seismicZone = 4;
      elevation = 80;
    }

    return {
      elevation,
      terrain,
      nearRiver: isGangeticPlain || isCoastal,
      riverDistance: isGangeticPlain ? 20 : 100,
      nearCoast: isCoastal,
      coastDistance: isCoastal ? 10 : 500,
      seismicZone,
      annualRainfall: isCoastal ? 2000 : (isTharDesert ? 300 : 800),
      vegetation: isTharDesert ? 'desert' : (isCoastal ? 'moderate' : 'urban'),
      floodHistory: isGangeticPlain || isCoastal ? 'occasional' : 'rare'
    };
  }

  /**
   * Fetch current weather data from OpenWeatherMap
   */
  static async getWeatherData(lat: number, lon: number): Promise<WeatherData> {
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const cached = this.weatherCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      const weatherData: WeatherData = {
        temperature: data.main?.temp ?? 25,
        humidity: data.main?.humidity ?? 50,
        windSpeed: data.wind?.speed ?? 0,
        rainfall24h: data.rain?.['1h'] ?? data.rain?.['3h'] ?? 0,
        pressure: data.main?.pressure ?? 1013,
        description: data.weather?.[0]?.description ?? 'clear',
        clouds: data.clouds?.all ?? 0
      };

      this.weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
      return weatherData;
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      // Return default weather
      return {
        temperature: 25,
        humidity: 50,
        windSpeed: 5,
        rainfall24h: 0,
        pressure: 1013,
        description: 'clear',
        clouds: 20
      };
    }
  }

  /**
   * Calculate flood risk based on geographic and weather data
   */
  static calculateFloodRisk(geoData: CityGeographicData, weather: WeatherData): HazardRiskResult {
    let riskScore = 0;
    const factors: string[] = [];
    
    // Base risk from geographic factors
    if (geoData.nearRiver && geoData.riverDistance < 10) {
      riskScore += 25;
      factors.push(`Located ${geoData.riverDistance}km from river`);
    } else if (geoData.nearRiver) {
      riskScore += 10;
      factors.push('River in vicinity');
    }

    if (geoData.nearCoast) {
      riskScore += 20;
      factors.push('Coastal location - storm surge risk');
    }

    if (geoData.terrain === 'delta') {
      riskScore += 25;
      factors.push('Low-lying delta region');
    } else if (geoData.terrain === 'flat' && geoData.elevation < 50) {
      riskScore += 15;
      factors.push('Low elevation flat terrain');
    }

    // Historical flood frequency
    if (geoData.floodHistory === 'frequent') {
      riskScore += 20;
      factors.push('Area has frequent flooding history');
    } else if (geoData.floodHistory === 'occasional') {
      riskScore += 10;
      factors.push('Occasional flooding in region');
    }

    // Current weather impact
    if (weather.rainfall24h > 50) {
      riskScore += 30;
      factors.push(`Heavy rainfall: ${weather.rainfall24h.toFixed(1)}mm`);
    } else if (weather.rainfall24h > 20) {
      riskScore += 15;
      factors.push(`Moderate rainfall: ${weather.rainfall24h.toFixed(1)}mm`);
    } else if (weather.rainfall24h > 5) {
      riskScore += 5;
      factors.push('Light rainfall recorded');
    }

    if (weather.humidity > 85) {
      riskScore += 10;
      factors.push(`High humidity: ${weather.humidity}%`);
    }

    // Monsoon season consideration (June-September)
    const month = new Date().getMonth();
    if (month >= 5 && month <= 8 && geoData.annualRainfall > 1000) {
      riskScore += 15;
      factors.push('Active monsoon season');
    }

    // Normalize score to probability
    const probability = Math.min(riskScore / 100, 0.95);
    
    // If terrain is flat and far from water, cap the risk
    if (!geoData.nearRiver && !geoData.nearCoast && geoData.terrain === 'flat') {
      const cappedProbability = Math.min(probability, 0.25);
      return {
        type: 'flood',
        name: 'Flood',
        icon: '🌊',
        riskLevel: this.getRiskLevel(cappedProbability),
        probability: cappedProbability,
        confidence: 0.85,
        factors: factors.length > 0 ? factors : ['No significant flood risk factors in area'],
        trend: weather.rainfall24h > 10 ? 'increasing' : 'stable',
        timeframe: 'Next 24-48 hours',
        recommendations: this.getFloodRecommendations(cappedProbability),
        dataSource: 'Geographic analysis + Real-time weather'
      };
    }

    return {
      type: 'flood',
      name: 'Flood',
      icon: '🌊',
      riskLevel: this.getRiskLevel(probability),
      probability,
      confidence: 0.85,
      factors: factors.length > 0 ? factors : ['Low flood risk area'],
      trend: weather.rainfall24h > 10 ? 'increasing' : 'stable',
      timeframe: 'Next 24-48 hours',
      recommendations: this.getFloodRecommendations(probability),
      dataSource: 'Geographic analysis + Real-time weather'
    };
  }

  /**
   * Calculate earthquake risk based on seismic zone
   */
  static calculateEarthquakeRisk(geoData: CityGeographicData): HazardRiskResult {
    const factors: string[] = [];
    let riskScore = 0;

    // Seismic zone is the primary factor
    switch (geoData.seismicZone) {
      case 5:
        riskScore = 45;
        factors.push('Located in Seismic Zone V (Very High Risk)');
        factors.push('Himalayan fault line proximity');
        break;
      case 4:
        riskScore = 25;
        factors.push('Located in Seismic Zone IV (High Risk)');
        break;
      case 3:
        riskScore = 15;
        factors.push('Located in Seismic Zone III (Moderate Risk)');
        break;
      case 2:
        riskScore = 8;
        factors.push('Located in Seismic Zone II (Low Risk)');
        break;
      default:
        riskScore = 5;
        factors.push('Located in Seismic Zone I (Very Low Risk)');
    }

    if (geoData.terrain === 'mountainous') {
      riskScore += 10;
      factors.push('Mountainous terrain - higher seismic activity');
    }

    const probability = Math.min(riskScore / 100, 0.60);

    return {
      type: 'earthquake',
      name: 'Earthquake',
      icon: '🏚️',
      riskLevel: this.getRiskLevel(probability),
      probability,
      confidence: 0.55, // Earthquakes are hard to predict
      factors,
      trend: 'stable',
      timeframe: 'Ongoing monitoring',
      recommendations: this.getEarthquakeRecommendations(probability),
      dataSource: 'Indian Seismic Zonation Map'
    };
  }

  /**
   * Calculate storm risk based on weather data
   */
  static calculateStormRisk(geoData: CityGeographicData, weather: WeatherData): HazardRiskResult {
    let riskScore = 0;
    const factors: string[] = [];

    // Wind speed factor
    if (weather.windSpeed > 20) {
      riskScore += 40;
      factors.push(`High winds: ${weather.windSpeed.toFixed(1)} m/s`);
    } else if (weather.windSpeed > 10) {
      riskScore += 20;
      factors.push(`Moderate winds: ${weather.windSpeed.toFixed(1)} m/s`);
    } else if (weather.windSpeed > 5) {
      riskScore += 5;
      factors.push('Light winds');
    }

    // Pressure drop indicates storm
    if (weather.pressure < 1000) {
      riskScore += 25;
      factors.push(`Low pressure system: ${weather.pressure} hPa`);
    } else if (weather.pressure < 1010) {
      riskScore += 10;
      factors.push('Slightly low pressure');
    }

    // Cloud cover
    if (weather.clouds > 80) {
      riskScore += 15;
      factors.push('Heavy cloud cover');
    }

    // Coastal areas more prone to storms
    if (geoData.nearCoast) {
      riskScore += 15;
      factors.push('Coastal exposure to cyclones');
    }

    // Weather description
    if (weather.description.includes('storm') || weather.description.includes('thunder')) {
      riskScore += 30;
      factors.push(`Current conditions: ${weather.description}`);
    }

    const probability = Math.min(riskScore / 100, 0.90);

    return {
      type: 'storm',
      name: 'Severe Storm',
      icon: '⛈️',
      riskLevel: this.getRiskLevel(probability),
      probability,
      confidence: 0.80,
      factors: factors.length > 0 ? factors : ['Calm weather conditions'],
      trend: weather.windSpeed > 10 || weather.pressure < 1005 ? 'increasing' : 'stable',
      timeframe: 'Next 6-12 hours',
      recommendations: this.getStormRecommendations(probability),
      dataSource: 'Real-time meteorological data'
    };
  }

  /**
   * Calculate wildfire risk
   */
  static calculateFireRisk(geoData: CityGeographicData, weather: WeatherData): HazardRiskResult {
    let riskScore = 0;
    const factors: string[] = [];

    // Urban areas have low wildfire risk
    if (geoData.vegetation === 'urban') {
      riskScore = 5;
      factors.push('Urban area - minimal wildfire risk');
    } else {
      // Vegetation density
      if (geoData.vegetation === 'dense') {
        riskScore += 25;
        factors.push('Dense vegetation cover');
      } else if (geoData.vegetation === 'moderate') {
        riskScore += 15;
        factors.push('Moderate vegetation');
      }

      // Dry conditions
      if (weather.humidity < 30) {
        riskScore += 30;
        factors.push(`Very low humidity: ${weather.humidity}%`);
      } else if (weather.humidity < 50) {
        riskScore += 15;
        factors.push(`Low humidity: ${weather.humidity}%`);
      }

      // High temperature
      if (weather.temperature > 40) {
        riskScore += 25;
        factors.push(`Extreme heat: ${weather.temperature.toFixed(1)}°C`);
      } else if (weather.temperature > 35) {
        riskScore += 15;
        factors.push(`High temperature: ${weather.temperature.toFixed(1)}°C`);
      }

      // Wind spreads fire
      if (weather.windSpeed > 15) {
        riskScore += 20;
        factors.push('High winds can spread fire');
      }
    }

    // Recent rain reduces risk
    if (weather.rainfall24h > 5) {
      riskScore = Math.max(0, riskScore - 20);
      factors.push('Recent rainfall reduces risk');
    }

    const probability = Math.min(riskScore / 100, 0.80);

    return {
      type: 'fire',
      name: 'Wildfire',
      icon: '🔥',
      riskLevel: this.getRiskLevel(probability),
      probability,
      confidence: 0.75,
      factors,
      trend: weather.humidity < 40 && weather.temperature > 35 ? 'increasing' : 'stable',
      timeframe: 'Seasonal assessment',
      recommendations: this.getFireRecommendations(probability),
      dataSource: 'Weather data + Vegetation analysis'
    };
  }

  /**
   * Calculate landslide risk
   */
  static calculateLandslideRisk(geoData: CityGeographicData, weather: WeatherData): HazardRiskResult {
    let riskScore = 0;
    const factors: string[] = [];

    // Terrain is the primary factor
    if (geoData.terrain === 'mountainous') {
      riskScore += 35;
      factors.push('Mountainous terrain - high landslide risk');
    } else if (geoData.terrain === 'hilly') {
      riskScore += 20;
      factors.push('Hilly terrain - moderate slope risk');
    } else if (geoData.terrain === 'flat') {
      riskScore = 2; // Flat terrain = minimal landslide risk
      factors.push('Flat terrain - minimal landslide risk');
    }

    // Only add weather factors if terrain supports landslides
    if (geoData.terrain !== 'flat') {
      // Heavy rainfall triggers landslides
      if (weather.rainfall24h > 50) {
        riskScore += 35;
        factors.push(`Heavy rainfall saturating slopes: ${weather.rainfall24h.toFixed(1)}mm`);
      } else if (weather.rainfall24h > 20) {
        riskScore += 20;
        factors.push('Moderate rainfall affecting soil stability');
      }

      // Seismic zones can trigger landslides
      if (geoData.seismicZone >= 4) {
        riskScore += 15;
        factors.push('High seismic activity can trigger slides');
      }

      // High elevation
      if (geoData.elevation > 1500) {
        riskScore += 10;
        factors.push(`High elevation: ${geoData.elevation}m`);
      }
    }

    const probability = Math.min(riskScore / 100, 0.85);

    return {
      type: 'landslide',
      name: 'Landslide',
      icon: '🏔️',
      riskLevel: this.getRiskLevel(probability),
      probability,
      confidence: geoData.terrain === 'flat' ? 0.95 : 0.70,
      factors,
      trend: weather.rainfall24h > 30 && geoData.terrain !== 'flat' ? 'increasing' : 'stable',
      timeframe: 'Next 72 hours',
      recommendations: this.getLandslideRecommendations(probability, geoData.terrain),
      dataSource: 'Topographic analysis + Weather data'
    };
  }

  /**
   * Get risk level from probability
   */
  private static getRiskLevel(probability: number): 'low' | 'moderate' | 'high' | 'critical' {
    if (probability >= 0.70) return 'critical';
    if (probability >= 0.45) return 'high';
    if (probability >= 0.20) return 'moderate';
    return 'low';
  }

  /**
   * Generate all hazard predictions for a location
   */
  static async getHazardPredictions(
    cityName: string,
    lat: number,
    lon: number
  ): Promise<HazardRiskResult[]> {
    console.log(`🔍 Calculating hazards for ${cityName} (${lat}, ${lon})`);
    
    const geoData = this.getGeographicData(cityName, lat, lon);
    const weather = await this.getWeatherData(lat, lon);
    
    console.log('📊 Geographic data:', geoData);
    console.log('🌤️ Weather data:', weather);

    return [
      this.calculateFloodRisk(geoData, weather),
      this.calculateEarthquakeRisk(geoData),
      this.calculateStormRisk(geoData, weather),
      this.calculateFireRisk(geoData, weather),
      this.calculateLandslideRisk(geoData, weather)
    ];
  }

  // Recommendation generators
  private static getFloodRecommendations(risk: number): string[] {
    if (risk < 0.20) {
      return [
        'Standard preparedness is sufficient',
        'Keep emergency contacts handy',
        'Monitor weather forecasts during monsoon'
      ];
    }
    if (risk < 0.45) {
      return [
        'Monitor local weather updates',
        'Keep important documents elevated',
        'Know your evacuation routes',
        'Have emergency supplies ready'
      ];
    }
    return [
      '⚠️ Prepare for potential flooding',
      'Move valuables to higher ground',
      'Stock emergency supplies and water',
      'Avoid low-lying areas',
      'Keep emergency evacuation bag ready'
    ];
  }

  private static getEarthquakeRecommendations(risk: number): string[] {
    const base = [
      'Secure heavy furniture to walls',
      'Identify safe spots (under sturdy tables)',
      'Keep emergency kit accessible'
    ];
    if (risk >= 0.25) {
      return [
        ...base,
        '⚠️ Area is in high seismic zone',
        'Practice drop, cover, and hold on',
        'Know how to turn off gas/electricity'
      ];
    }
    return base;
  }

  private static getStormRecommendations(risk: number): string[] {
    if (risk < 0.20) {
      return ['No storm precautions needed currently', 'Continue monitoring forecasts'];
    }
    if (risk < 0.45) {
      return [
        'Secure loose outdoor items',
        'Keep devices charged',
        'Stay updated on weather alerts'
      ];
    }
    return [
      '⚠️ Storm conditions developing',
      'Stay indoors during storm',
      'Secure all outdoor objects',
      'Have flashlights and batteries ready',
      'Avoid windows and electrical equipment'
    ];
  }

  private static getFireRecommendations(risk: number): string[] {
    if (risk < 0.15) {
      return ['Urban area - standard fire safety applies', 'Ensure smoke detectors work'];
    }
    return [
      'Clear dry vegetation from property',
      'Have evacuation plan ready',
      'Keep important documents accessible',
      'Monitor air quality alerts'
    ];
  }

  private static getLandslideRecommendations(risk: number, terrain: string): string[] {
    if (terrain === 'flat') {
      return ['Flat terrain - landslide risk negligible', 'No special precautions needed'];
    }
    if (risk < 0.20) {
      return [
        'Low risk but monitor during heavy rain',
        'Avoid steep slopes in wet weather'
      ];
    }
    return [
      '⚠️ Be alert in hilly/mountainous areas',
      'Avoid steep slopes during rain',
      'Watch for cracks in ground',
      'Be alert to unusual sounds (rumbling)',
      'Know evacuation routes away from slopes'
    ];
  }
}

export default LocationHazardService;
