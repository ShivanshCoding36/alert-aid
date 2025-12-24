/**
 * REAL SHELTER SERVICE
 * Uses Google Places API to find real emergency shelters, hospitals, and safe places
 * Also integrates with OpenStreetMap Nominatim for free geocoding
 */

export interface RealShelter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'shelter' | 'hospital' | 'fire_station' | 'police' | 'school' | 'community_center';
  phone?: string;
  rating?: number;
  isOpen?: boolean;
  distance?: number; // km
  placeId?: string;
}

// Cache for shelter data (15 minute cache)
const shelterCache = new Map<string, { data: RealShelter[]; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Search for real shelters using Google Places API
 */
export async function searchRealShelters(
  lat: number, 
  lng: number, 
  apiKey: string,
  radius: number = 5000 // 5km default
): Promise<RealShelter[]> {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)},${radius}`;
  
  // Check cache
  const cached = shelterCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 [ShelterService] Using cached shelters');
    return cached.data;
  }

  console.log(`🏠 [ShelterService] Searching for shelters near ${lat}, ${lng}`);
  
  // If no valid API key, use Overpass API (OpenStreetMap) as fallback
  if (!apiKey || apiKey === 'demo-key' || apiKey.includes('your_')) {
    console.log('⚠️ [ShelterService] No valid Google API key, using OpenStreetMap');
    return searchOpenStreetMapShelters(lat, lng, radius);
  }

  try {
    const shelters: RealShelter[] = [];
    
    // Search for different types of emergency facilities
    const placeTypes = [
      'hospital',
      'fire_station',
      'police',
      'school',
      'local_government_office'
    ];

    for (const type of placeTypes) {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) continue;
      
      const data = await response.json();
      if (data.status !== 'OK') continue;
      
      for (const place of data.results.slice(0, 5)) { // Limit to 5 per type
        const shelter: RealShelter = {
          id: place.place_id,
          name: place.name,
          address: place.vicinity || place.formatted_address || '',
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          type: mapGoogleTypeToShelterType(type),
          rating: place.rating,
          isOpen: place.opening_hours?.open_now,
          placeId: place.place_id,
          distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng)
        };
        shelters.push(shelter);
      }
    }

    // Sort by distance
    shelters.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    // Cache results
    shelterCache.set(cacheKey, { data: shelters, timestamp: Date.now() });
    
    console.log(`✅ [ShelterService] Found ${shelters.length} shelters via Google Places`);
    return shelters;
    
  } catch (error) {
    console.error('❌ [ShelterService] Google Places failed:', error);
    // Fallback to OpenStreetMap
    return searchOpenStreetMapShelters(lat, lng, radius);
  }
}

/**
 * OpenStreetMap Overpass API fallback (free, no API key required)
 */
async function searchOpenStreetMapShelters(
  lat: number, 
  lng: number, 
  radius: number
): Promise<RealShelter[]> {
  console.log('🗺️ [ShelterService] Using OpenStreetMap Overpass API');
  
  // Convert radius to bounding box (approximate)
  const delta = radius / 111000; // ~111km per degree
  const bbox = `${lat - delta},${lng - delta},${lat + delta},${lng + delta}`;
  
  // Overpass query for emergency facilities
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](${bbox});
      node["amenity"="fire_station"](${bbox});
      node["amenity"="police"](${bbox});
      node["amenity"="shelter"](${bbox});
      node["amenity"="school"](${bbox});
      node["emergency"="assembly_point"](${bbox});
      way["amenity"="hospital"](${bbox});
      way["amenity"="fire_station"](${bbox});
      way["amenity"="police"](${bbox});
    );
    out center;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    
    const shelters: RealShelter[] = data.elements.map((el: any, index: number) => {
      const elLat = el.lat || el.center?.lat;
      const elLng = el.lon || el.center?.lon;
      
      return {
        id: `osm-${el.id}`,
        name: el.tags?.name || `${mapOsmAmenityToName(el.tags?.amenity)} #${index + 1}`,
        address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || 'Address not available',
        lat: elLat,
        lng: elLng,
        type: mapOsmAmenityToType(el.tags?.amenity || el.tags?.emergency),
        phone: el.tags?.phone,
        isOpen: true, // Assume open for emergency facilities
        distance: calculateDistance(lat, lng, elLat, elLng)
      };
    }).filter((s: RealShelter) => s.lat && s.lng);

    // Sort by distance
    shelters.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    // Cache results
    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)},${radius}`;
    shelterCache.set(cacheKey, { data: shelters, timestamp: Date.now() });
    
    console.log(`✅ [ShelterService] Found ${shelters.length} shelters via OpenStreetMap`);
    return shelters.slice(0, 20); // Limit to 20
    
  } catch (error) {
    console.error('❌ [ShelterService] OpenStreetMap also failed:', error);
    return [];
  }
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal
}

function mapGoogleTypeToShelterType(type: string): RealShelter['type'] {
  const mapping: Record<string, RealShelter['type']> = {
    'hospital': 'hospital',
    'fire_station': 'fire_station',
    'police': 'police',
    'school': 'school',
    'local_government_office': 'community_center'
  };
  return mapping[type] || 'shelter';
}

function mapOsmAmenityToType(amenity: string): RealShelter['type'] {
  const mapping: Record<string, RealShelter['type']> = {
    'hospital': 'hospital',
    'fire_station': 'fire_station',
    'police': 'police',
    'school': 'school',
    'shelter': 'shelter',
    'assembly_point': 'shelter'
  };
  return mapping[amenity] || 'shelter';
}

function mapOsmAmenityToName(amenity: string): string {
  const mapping: Record<string, string> = {
    'hospital': 'Hospital',
    'fire_station': 'Fire Station',
    'police': 'Police Station',
    'school': 'School',
    'shelter': 'Emergency Shelter'
  };
  return mapping[amenity] || 'Emergency Facility';
}

/**
 * Get shelter icon based on type
 */
export function getShelterIcon(type: RealShelter['type']): string {
  const icons: Record<RealShelter['type'], string> = {
    'shelter': '🏠',
    'hospital': '🏥',
    'fire_station': '🚒',
    'police': '🚔',
    'school': '🏫',
    'community_center': '🏛️'
  };
  return icons[type] || '📍';
}

/**
 * Get shelter color based on type
 */
export function getShelterColor(type: RealShelter['type']): string {
  const colors: Record<RealShelter['type'], string> = {
    'shelter': '#22C55E',
    'hospital': '#EF4444',
    'fire_station': '#F97316',
    'police': '#3B82F6',
    'school': '#8B5CF6',
    'community_center': '#06B6D4'
  };
  return colors[type] || '#22C55E';
}

export default {
  searchRealShelters,
  getShelterIcon,
  getShelterColor
};
