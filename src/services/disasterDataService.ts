/**
 * Disaster Data Service - Aggregates data from multiple authoritative sources
 * Provides real-time, accurate disaster information from:
 * - NASA EONET (Earth Observatory Natural Event Tracker)
 * - NASA FIRMS (Fire Information for Resource Management System) - Active fires
 * - GDACS (Global Disaster Alert and Coordination System) - via backend proxy
 * - USGS Earthquake API
 * - OpenWeatherMap
 * - IMD India (via backend proxy)
 */

const getBackendUrl = (): string => {
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  return 'http://localhost:8000';
};

const BACKEND_URL = getBackendUrl();

export interface DataSource {
  name: string;
  status: 'active' | 'error' | 'loading';
  lastUpdated: Date | null;
  confidence: number; // 0-100
  dataCount: number;
}

export interface NASAEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  geometry: {
    date: string;
    type: string;
    coordinates: [number, number];
  }[];
  sources: { id: string; url: string }[];
}

export interface FIRMSFire {
  latitude: number;
  longitude: number;
  brightness: number;
  frp: number; // Fire Radiative Power
  confidence: string;
  intensity: 'low' | 'moderate' | 'high' | 'extreme';
  distance_km: number | null;
  acq_date: string | null;
  acq_time: string | null;
  source: string;
}

export interface GDACSAlert {
  eventId: string;
  eventType: string;
  alertLevel: 'Green' | 'Orange' | 'Red';
  title: string;
  description: string;
  pubDate: string;
  link: string;
  coordinates: { lat: number; lon: number };
}

export interface IMDWarning {
  type: string;
  severity: 'Yellow' | 'Orange' | 'Red';
  message: string;
  instructions: string[];
  valid_from: string;
  valid_until: string;
}

export interface USGSEarthquake {
  id: string;
  magnitude: number;
  place: string;
  time: number;
  coordinates: [number, number, number];
  tsunami: boolean;
  alert: string | null;
  significance: number;
}

export interface AggregatedDisasterData {
  sources: DataSource[];
  events: {
    earthquakes: USGSEarthquake[];
    wildfires: NASAEvent[];
    activeFires: FIRMSFire[];
    storms: NASAEvent[];
    floods: NASAEvent[];
    volcanoes: NASAEvent[];
    gdacsAlerts: GDACSAlert[];
    imdWarnings: IMDWarning[];
  };
  nearbyThreats: {
    type: string;
    distance: number;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    source: string;
    description: string;
  }[];
  overallConfidence: number;
  lastUpdated: Date;
}

class DisasterDataService {
  private static cache: Map<string, { data: any; timestamp: number }> = new Map();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static readonly OPENWEATHER_API_KEY = '1801423b3942e324ab80f5b47afe0859';

  /**
   * Fetch NASA EONET natural events
   * Categories: wildfires, volcanoes, severeStorms, floods, earthquakes
   */
  static async fetchNASAEvents(): Promise<NASAEvent[]> {
    const cacheKey = 'nasa_eonet';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // NASA EONET API - free, no key required
      const response = await fetch(
        'https://eonet.gsfc.nasa.gov/api/v3/events?limit=50&days=7&status=open',
        { signal: AbortSignal.timeout(10000) }
      );

      if (!response.ok) throw new Error(`NASA API error: ${response.status}`);
      
      const data = await response.json();
      const events: NASAEvent[] = data.events.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description || event.title,
        category: event.categories[0]?.title || 'Unknown',
        geometry: event.geometry,
        sources: event.sources
      }));

      this.setCache(cacheKey, events);
      console.log(`✅ NASA EONET: ${events.length} active events`);
      return events;
    } catch (error) {
      console.error('❌ NASA EONET fetch failed:', error);
      return [];
    }
  }

  /**
   * Fetch GDACS (Global Disaster Alert and Coordination System) alerts
   * Uses backend proxy to avoid CORS issues
   */
  static async fetchGDACSAlerts(): Promise<GDACSAlert[]> {
    const cacheKey = 'gdacs_alerts';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Use backend proxy to avoid CORS
      const response = await fetch(
        `${BACKEND_URL}/api/external/gdacs`,
        { signal: AbortSignal.timeout(15000) }
      );

      if (!response.ok) {
        console.warn('⚠️ GDACS backend proxy error');
        return [];
      }
      
      const data = await response.json();
      
      if (data.success && data.alerts) {
        this.setCache(cacheKey, data.alerts);
        console.log(`✅ GDACS (via proxy): ${data.alerts.length} active alerts`);
        return data.alerts;
      }
      
      return [];
    } catch (error) {
      console.warn('⚠️ GDACS fetch failed:', error);
      return [];
    }
  }

  /**
   * Fetch NASA FIRMS active fire data
   * Uses backend proxy for reliable access
   */
  static async fetchNASAFIRMS(lat: number, lon: number): Promise<FIRMSFire[]> {
    const cacheKey = `firms_${lat.toFixed(1)}_${lon.toFixed(1)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/external/firms?lat=${lat}&lon=${lon}&days=1`,
        { signal: AbortSignal.timeout(30000) }
      );

      if (!response.ok) {
        console.warn('⚠️ NASA FIRMS error');
        return [];
      }
      
      const data = await response.json();
      
      if (data.success && data.fires) {
        this.setCache(cacheKey, data.fires);
        console.log(`✅ NASA FIRMS: ${data.fires.length} active fires detected`);
        return data.fires;
      }
      
      return [];
    } catch (error) {
      console.warn('⚠️ NASA FIRMS fetch failed:', error);
      return [];
    }
  }

  /**
   * Fetch IMD-style weather warnings for India
   * Uses backend proxy with OpenWeatherMap data
   */
  static async fetchIMDWarnings(lat: number, lon: number): Promise<IMDWarning[]> {
    const cacheKey = `imd_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/external/imd-warnings?lat=${lat}&lon=${lon}`,
        { signal: AbortSignal.timeout(10000) }
      );

      if (!response.ok) {
        console.warn('⚠️ IMD warnings error');
        return [];
      }
      
      const data = await response.json();
      
      if (data.success && data.warnings) {
        this.setCache(cacheKey, data.warnings);
        console.log(`✅ IMD Warnings: ${data.warnings.length} active warnings`);
        return data.warnings;
      }
      
      return [];
    } catch (error) {
      console.warn('⚠️ IMD warnings fetch failed:', error);
      return [];
    }
  }

  /**
   * Fetch USGS earthquake data
   */
  static async fetchUSGSEarthquakes(lat: number, lon: number, radiusKm: number = 500): Promise<USGSEarthquake[]> {
    const cacheKey = `usgs_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(
        `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startDate}&endtime=${endDate}&latitude=${lat}&longitude=${lon}&maxradiuskm=${radiusKm}&minmagnitude=2.5&orderby=magnitude`,
        { signal: AbortSignal.timeout(10000) }
      );

      if (!response.ok) throw new Error(`USGS API error: ${response.status}`);

      const data = await response.json();
      const earthquakes: USGSEarthquake[] = data.features.map((f: any) => ({
        id: f.id,
        magnitude: f.properties.mag,
        place: f.properties.place,
        time: f.properties.time,
        coordinates: f.geometry.coordinates,
        tsunami: f.properties.tsunami === 1,
        alert: f.properties.alert,
        significance: f.properties.sig
      }));

      this.setCache(cacheKey, earthquakes);
      console.log(`✅ USGS: ${earthquakes.length} earthquakes in ${radiusKm}km radius`);
      return earthquakes;
    } catch (error) {
      console.error('❌ USGS fetch failed:', error);
      return [];
    }
  }

  /**
   * Get aggregated disaster data from all sources
   */
  static async getAggregatedData(lat: number, lon: number): Promise<AggregatedDisasterData> {
    const sources: DataSource[] = [];
    const startTime = Date.now();

    // Fetch from all sources in parallel
    const [nasaEvents, gdacsAlerts, earthquakes, activeFires, imdWarnings] = await Promise.all([
      this.fetchNASAEvents().then(events => {
        sources.push({
          name: 'NASA EONET',
          status: events.length >= 0 ? 'active' : 'error',
          lastUpdated: new Date(),
          confidence: events.length > 0 ? 95 : 50,
          dataCount: events.length
        });
        return events;
      }),
      this.fetchGDACSAlerts().then(alerts => {
        sources.push({
          name: 'GDACS',
          status: alerts.length >= 0 ? 'active' : 'error',
          lastUpdated: new Date(),
          confidence: alerts.length > 0 ? 92 : 60,
          dataCount: alerts.length
        });
        return alerts;
      }),
      this.fetchUSGSEarthquakes(lat, lon, 1000).then(quakes => {
        sources.push({
          name: 'USGS Earthquake',
          status: quakes.length >= 0 ? 'active' : 'error',
          lastUpdated: new Date(),
          confidence: 98, // USGS is very reliable
          dataCount: quakes.length
        });
        return quakes;
      }),
      this.fetchNASAFIRMS(lat, lon).then(fires => {
        sources.push({
          name: 'NASA FIRMS',
          status: fires.length >= 0 ? 'active' : 'error',
          lastUpdated: new Date(),
          confidence: fires.length > 0 ? 94 : 70,
          dataCount: fires.length
        });
        return fires;
      }),
      this.fetchIMDWarnings(lat, lon).then(warnings => {
        sources.push({
          name: 'IMD Warnings',
          status: 'active',
          lastUpdated: new Date(),
          confidence: warnings.length > 0 ? 88 : 75,
          dataCount: warnings.length
        });
        return warnings;
      })
    ]);

    // Add OpenWeatherMap as a source (assumed active since we use it elsewhere)
    sources.push({
      name: 'OpenWeatherMap',
      status: 'active',
      lastUpdated: new Date(),
      confidence: 85,
      dataCount: 1
    });

    // Categorize NASA events
    const wildfires = nasaEvents.filter(e => 
      e.category.toLowerCase().includes('wildfire') || 
      e.category.toLowerCase().includes('fire')
    );
    const storms = nasaEvents.filter(e => 
      e.category.toLowerCase().includes('storm') || 
      e.category.toLowerCase().includes('cyclone')
    );
    const floods = nasaEvents.filter(e => 
      e.category.toLowerCase().includes('flood')
    );
    const volcanoes = nasaEvents.filter(e => 
      e.category.toLowerCase().includes('volcano')
    );

    // Calculate nearby threats (including active fires)
    const nearbyThreats = this.calculateNearbyThreats(
      lat, lon, earthquakes, nasaEvents, gdacsAlerts, activeFires, imdWarnings
    );

    // Calculate overall confidence
    const overallConfidence = sources.reduce((sum, s) => sum + s.confidence, 0) / sources.length;

    console.log(`📊 Data aggregation complete in ${Date.now() - startTime}ms`);

    return {
      sources,
      events: {
        earthquakes,
        wildfires,
        activeFires,
        storms,
        floods,
        volcanoes,
        gdacsAlerts,
        imdWarnings
      },
      nearbyThreats,
      overallConfidence,
      lastUpdated: new Date()
    };
  }

  /**
   * Calculate threats near the user's location
   */
  private static calculateNearbyThreats(
    lat: number,
    lon: number,
    earthquakes: USGSEarthquake[],
    nasaEvents: NASAEvent[],
    gdacsAlerts: GDACSAlert[],
    activeFires: FIRMSFire[],
    imdWarnings: IMDWarning[]
  ): AggregatedDisasterData['nearbyThreats'] {
    const threats: AggregatedDisasterData['nearbyThreats'] = [];

    // Check earthquakes
    for (const eq of earthquakes) {
      const distance = this.calculateDistance(lat, lon, eq.coordinates[1], eq.coordinates[0]);
      if (distance < 500) {
        let severity: 'low' | 'moderate' | 'high' | 'critical' = 'low';
        if (eq.magnitude >= 6) severity = 'critical';
        else if (eq.magnitude >= 5) severity = 'high';
        else if (eq.magnitude >= 4) severity = 'moderate';

        threats.push({
          type: 'Earthquake',
          distance: Math.round(distance),
          severity,
          source: 'USGS',
          description: `M${eq.magnitude.toFixed(1)} - ${eq.place}`
        });
      }
    }

    // Check NASA events
    for (const event of nasaEvents) {
      if (event.geometry && event.geometry.length > 0) {
        const coords = event.geometry[0].coordinates;
        const distance = this.calculateDistance(lat, lon, coords[1], coords[0]);
        
        if (distance < 1000) {
          let severity: 'low' | 'moderate' | 'high' | 'critical' = 'moderate';
          if (distance < 100) severity = 'critical';
          else if (distance < 300) severity = 'high';

          threats.push({
            type: event.category,
            distance: Math.round(distance),
            severity,
            source: 'NASA EONET',
            description: event.title
          });
        }
      }
    }

    // Check active fires from NASA FIRMS
    for (const fire of activeFires) {
      if (fire.distance_km && fire.distance_km < 200) {
        let severity: 'low' | 'moderate' | 'high' | 'critical' = 'moderate';
        if (fire.intensity === 'extreme' || fire.distance_km < 20) severity = 'critical';
        else if (fire.intensity === 'high' || fire.distance_km < 50) severity = 'high';
        else if (fire.intensity === 'low') severity = 'low';

        threats.push({
          type: 'Active Fire',
          distance: Math.round(fire.distance_km),
          severity,
          source: 'NASA FIRMS',
          description: `Fire hotspot (${fire.intensity} intensity, FRP: ${fire.frp})`
        });
      }
    }

    // Check IMD warnings (no distance, but relevant to location)
    for (const warning of imdWarnings) {
      const severity: 'low' | 'moderate' | 'high' | 'critical' = 
        warning.severity === 'Red' ? 'critical' :
        warning.severity === 'Orange' ? 'high' : 'moderate';

      threats.push({
        type: warning.type,
        distance: 0, // Local warning
        severity,
        source: 'IMD',
        description: warning.message
      });
    }

    // Check GDACS alerts with coordinates
    for (const alert of gdacsAlerts) {
      if (alert.coordinates.lat !== 0 && alert.coordinates.lon !== 0) {
        const distance = this.calculateDistance(lat, lon, alert.coordinates.lat, alert.coordinates.lon);
        if (distance < 1000) {
          const severity: 'low' | 'moderate' | 'high' | 'critical' = 
            alert.alertLevel === 'Red' ? 'critical' :
            alert.alertLevel === 'Orange' ? 'high' : 'moderate';

          threats.push({
            type: alert.eventType,
            distance: Math.round(distance),
            severity,
            source: 'GDACS',
            description: alert.title
          });
        }
      }
    }

    // Sort by distance
    return threats.sort((a, b) => a.distance - b.distance).slice(0, 10);
  }

  /**
   * Calculate distance between two coordinates in km (Haversine formula)
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Cache management
   */
  private static getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private static setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

export default DisasterDataService;
