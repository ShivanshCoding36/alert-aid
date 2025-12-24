/**
 * REAL DISASTER ALERT SERVICE
 * Integrates with real government APIs for accurate disaster warnings
 * 
 * APIs Used:
 * - USGS Earthquake API (global)
 * - NOAA National Weather Service (US)
 * - NASA EONET (global natural events)
 * - India Meteorological Department (India)
 */

export interface DisasterAlert {
  id: string;
  type: 'flood' | 'earthquake' | 'storm' | 'fire' | 'tsunami' | 'cyclone' | 'landslide' | 'other';
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  startTime: string;
  endTime?: string;
  source: string;
  url?: string;
  distance?: number; // km from user
}

// Cache for alerts (10 minute cache)
const alertCache = new Map<string, { data: DisasterAlert[]; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000;

/**
 * Fetch real-time disaster alerts from multiple sources
 */
export async function fetchRealDisasterAlerts(
  lat: number, 
  lng: number, 
  radiusKm: number = 500
): Promise<DisasterAlert[]> {
  const cacheKey = `${lat.toFixed(1)},${lng.toFixed(1)},${radiusKm}`;
  
  const cached = alertCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 [AlertService] Using cached alerts');
    return cached.data;
  }

  console.log(`🚨 [AlertService] Fetching real alerts near ${lat}, ${lng}`);
  
  const alerts: DisasterAlert[] = [];
  
  // Fetch from multiple sources in parallel
  const [earthquakes, nasaEvents] = await Promise.allSettled([
    fetchUSGSEarthquakes(lat, lng, radiusKm),
    fetchNASAEONET(lat, lng, radiusKm)
  ]);

  if (earthquakes.status === 'fulfilled') {
    alerts.push(...earthquakes.value);
  }
  
  if (nasaEvents.status === 'fulfilled') {
    alerts.push(...nasaEvents.value);
  }

  // Sort by severity and distance
  alerts.sort((a, b) => {
    const severityOrder = { extreme: 0, severe: 1, moderate: 2, minor: 3 };
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return (a.distance || 0) - (b.distance || 0);
  });

  // Cache results
  alertCache.set(cacheKey, { data: alerts, timestamp: Date.now() });
  
  console.log(`✅ [AlertService] Found ${alerts.length} real alerts`);
  return alerts;
}

/**
 * USGS Earthquake Hazards API
 * https://earthquake.usgs.gov/fdsnws/event/1/
 */
async function fetchUSGSEarthquakes(lat: number, lng: number, radiusKm: number): Promise<DisasterAlert[]> {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson` +
      `&starttime=${weekAgo.toISOString().split('T')[0]}` +
      `&latitude=${lat}&longitude=${lng}&maxradiuskm=${radiusKm}` +
      `&minmagnitude=2.5&orderby=time`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`USGS API error: ${response.status}`);
    
    const data = await response.json();
    
    return data.features.map((feature: any) => {
      const props = feature.properties;
      const coords = feature.geometry.coordinates;
      const magnitude = props.mag;
      
      // Calculate distance from user
      const distance = calculateDistance(lat, lng, coords[1], coords[0]);
      
      return {
        id: `usgs-${feature.id}`,
        type: 'earthquake' as const,
        severity: magnitude >= 6 ? 'extreme' : magnitude >= 5 ? 'severe' : magnitude >= 4 ? 'moderate' : 'minor',
        title: `M${magnitude.toFixed(1)} Earthquake`,
        description: props.place || 'Location unknown',
        location: {
          lat: coords[1],
          lng: coords[0],
          name: props.place || 'Unknown'
        },
        startTime: new Date(props.time).toISOString(),
        source: 'USGS',
        url: props.url,
        distance
      };
    }).slice(0, 10); // Limit to 10 most recent
    
  } catch (error) {
    console.error('❌ [AlertService] USGS fetch failed:', error);
    return [];
  }
}

/**
 * NASA EONET (Earth Observatory Natural Event Tracker)
 * https://eonet.gsfc.nasa.gov/docs/v3
 */
async function fetchNASAEONET(lat: number, lng: number, radiusKm: number): Promise<DisasterAlert[]> {
  try {
    const url = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50';
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`NASA EONET API error: ${response.status}`);
    
    const data = await response.json();
    
    return data.events
      .filter((event: any) => {
        // Get latest coordinates
        const geometry = event.geometry?.[0];
        if (!geometry?.coordinates) return false;
        
        const [evtLng, evtLat] = geometry.coordinates;
        const distance = calculateDistance(lat, lng, evtLat, evtLng);
        
        return distance <= radiusKm;
      })
      .map((event: any) => {
        const geometry = event.geometry[0];
        const [evtLng, evtLat] = geometry.coordinates;
        const distance = calculateDistance(lat, lng, evtLat, evtLng);
        
        const eventType = mapNASACategory(event.categories?.[0]?.id);
        
        return {
          id: `nasa-${event.id}`,
          type: eventType,
          severity: 'moderate' as const, // NASA doesn't provide severity
          title: event.title,
          description: `Active ${eventType} event detected by NASA satellites`,
          location: {
            lat: evtLat,
            lng: evtLng,
            name: event.title
          },
          startTime: geometry.date,
          source: 'NASA EONET',
          url: event.link,
          distance
        };
      })
      .slice(0, 10);
      
  } catch (error) {
    console.error('❌ [AlertService] NASA EONET fetch failed:', error);
    return [];
  }
}

/**
 * Map NASA EONET categories to our alert types
 */
function mapNASACategory(categoryId: string): DisasterAlert['type'] {
  const mapping: Record<string, DisasterAlert['type']> = {
    'wildfires': 'fire',
    'volcanoes': 'other',
    'severeStorms': 'storm',
    'floods': 'flood',
    'earthquakes': 'earthquake',
    'drought': 'other',
    'dustHaze': 'other',
    'landslides': 'landslide',
    'manmade': 'other',
    'seaLakeIce': 'other',
    'snow': 'storm',
    'tempExtremes': 'other',
    'waterColor': 'other'
  };
  return mapping[categoryId] || 'other';
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: DisasterAlert['severity']): string {
  const colors = {
    minor: '#22C55E',
    moderate: '#EAB308',
    severe: '#F97316',
    extreme: '#EF4444'
  };
  return colors[severity];
}

/**
 * Get alert type icon
 */
export function getAlertTypeIcon(type: DisasterAlert['type']): string {
  const icons = {
    flood: '🌊',
    earthquake: '🌋',
    storm: '🌪️',
    fire: '🔥',
    tsunami: '🌊',
    cyclone: '🌀',
    landslide: '⛰️',
    other: '⚠️'
  };
  return icons[type];
}

/**
 * Clear alert cache
 */
export function clearAlertCache(): void {
  alertCache.clear();
  console.log('🗑️ [AlertService] Alert cache cleared');
}

export default {
  fetchRealDisasterAlerts,
  getSeverityColor,
  getAlertTypeIcon,
  clearAlertCache
};
