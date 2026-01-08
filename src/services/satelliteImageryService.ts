/**
 * Satellite Imagery Integration Service
 * Real-time satellite data for disaster monitoring and assessment
 */

// Satellite data source
type SatelliteSource = 
  | 'sentinel-1' // Radar - flood/damage detection
  | 'sentinel-2' // Optical - vegetation, water bodies
  | 'landsat-8' // Thermal - fires, heat
  | 'modis' // Fire detection
  | 'viirs' // Night lights, fires
  | 'goes' // Weather
  | 'himawari' // Weather (Asia)
  | 'cartosat' // High-res (India)
  | 'resourcesat'; // Land use (India)

// Imagery type
type ImageryType = 
  | 'optical' // Standard RGB
  | 'radar' // SAR
  | 'infrared' // Thermal/IR
  | 'multispectral' // Multiple bands
  | 'night_lights'; // VIIRS night lights

// Analysis type
type AnalysisType = 
  | 'flood_extent'
  | 'fire_detection'
  | 'damage_assessment'
  | 'vegetation_health'
  | 'water_level'
  | 'landslide_detection'
  | 'urban_change'
  | 'smoke_plume'
  | 'thermal_anomaly';

// Satellite image metadata
interface SatelliteImage {
  id: string;
  source: SatelliteSource;
  type: ImageryType;
  acquisitionDate: Date;
  processingDate: Date;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  resolution: number; // meters per pixel
  cloudCover: number; // percentage
  url: string;
  thumbnailUrl: string;
  bands: string[];
  metadata: Record<string, unknown>;
}

// Analysis result
interface ImageAnalysisResult {
  id: string;
  imageId: string;
  analysisType: AnalysisType;
  timestamp: Date;
  bounds: SatelliteImage['bounds'];
  findings: AnalysisFinding[];
  statistics: AnalysisStatistics;
  confidenceScore: number;
  processingTime: number; // seconds
  visualizationUrl?: string;
}

// Analysis finding
interface AnalysisFinding {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: { lat: number; lng: number };
  area: number; // sq km
  description: string;
  confidence: number;
  polygon?: { lat: number; lng: number }[];
}

// Analysis statistics
interface AnalysisStatistics {
  totalArea: number; // sq km
  affectedArea: number; // sq km
  percentageAffected: number;
  comparisonWithBaseline?: {
    baselineDate: Date;
    change: number; // percentage
    changeType: 'increase' | 'decrease' | 'stable';
  };
  additionalMetrics: Record<string, number>;
}

// Time series data point
interface TimeSeriesPoint {
  date: Date;
  value: number;
  source: SatelliteSource;
  confidence: number;
}

// Change detection result
interface ChangeDetectionResult {
  preImage: SatelliteImage;
  postImage: SatelliteImage;
  changedAreas: {
    id: string;
    type: 'new' | 'removed' | 'modified';
    category: string;
    location: { lat: number; lng: number };
    area: number;
    confidence: number;
    polygon: { lat: number; lng: number }[];
  }[];
  totalChange: number; // sq km
  changePercentage: number;
}

// Satellite pass prediction
interface SatellitePass {
  satellite: SatelliteSource;
  passTime: Date;
  duration: number; // minutes
  maxElevation: number; // degrees
  acquisitionProbability: number; // weather-adjusted
  cloudForecast: number; // percentage
}

// Image order/request
interface ImageryRequest {
  id: string;
  requestDate: Date;
  bounds: SatelliteImage['bounds'];
  sources: SatelliteSource[];
  analysisTypes: AnalysisType[];
  priority: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedDelivery?: Date;
  results?: ImageAnalysisResult[];
}

// Satellite band configurations
const BAND_CONFIGURATIONS: Record<string, { name: string; bands: string[]; description: string }> = {
  trueColor: { name: 'True Color', bands: ['B4', 'B3', 'B2'], description: 'Natural color view' },
  falseColorVeg: { name: 'False Color Vegetation', bands: ['B8', 'B4', 'B3'], description: 'Vegetation health analysis' },
  waterBodies: { name: 'Water Bodies', bands: ['B3', 'B8', 'B12'], description: 'Water detection' },
  urbanAreas: { name: 'Urban Areas', bands: ['B12', 'B11', 'B4'], description: 'Built-up area detection' },
  agriculture: { name: 'Agriculture', bands: ['B11', 'B8', 'B2'], description: 'Crop and vegetation' },
  ndvi: { name: 'NDVI', bands: ['B8', 'B4'], description: 'Normalized vegetation index' },
  ndwi: { name: 'NDWI', bands: ['B3', 'B8'], description: 'Normalized water index' },
  thermalAnom: { name: 'Thermal Anomaly', bands: ['B10', 'B11'], description: 'Heat detection' },
};

// Sample satellite data
const SAMPLE_SATELLITE_DATA: SatelliteImage[] = [
  {
    id: 'sat-001',
    source: 'sentinel-2',
    type: 'optical',
    acquisitionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    processingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    bounds: { north: 10.6, south: 10.4, east: 76.3, west: 76.1 },
    resolution: 10,
    cloudCover: 15,
    url: 'https://example.com/satellite/sentinel2-001.tif',
    thumbnailUrl: 'https://example.com/satellite/sentinel2-001-thumb.jpg',
    bands: ['B2', 'B3', 'B4', 'B8'],
    metadata: { platform: 'Sentinel-2A', productType: 'L2A' },
  },
  {
    id: 'sat-002',
    source: 'sentinel-1',
    type: 'radar',
    acquisitionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    processingDate: new Date(),
    bounds: { north: 10.6, south: 10.4, east: 76.3, west: 76.1 },
    resolution: 5,
    cloudCover: 0, // Radar not affected by clouds
    url: 'https://example.com/satellite/sentinel1-001.tif',
    thumbnailUrl: 'https://example.com/satellite/sentinel1-001-thumb.jpg',
    bands: ['VV', 'VH'],
    metadata: { platform: 'Sentinel-1B', productType: 'GRD' },
  },
  {
    id: 'sat-003',
    source: 'modis',
    type: 'infrared',
    acquisitionDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
    processingDate: new Date(Date.now() - 5 * 60 * 60 * 1000),
    bounds: { north: 15, south: 8, east: 80, west: 74 },
    resolution: 250,
    cloudCover: 25,
    url: 'https://example.com/satellite/modis-001.tif',
    thumbnailUrl: 'https://example.com/satellite/modis-001-thumb.jpg',
    bands: ['Band1', 'Band2', 'Band31', 'Band32'],
    metadata: { platform: 'Terra', productType: 'MOD14' },
  },
];

class SatelliteImageryService {
  private static instance: SatelliteImageryService;
  private images: Map<string, SatelliteImage> = new Map();
  private analysisResults: Map<string, ImageAnalysisResult> = new Map();
  private requests: Map<string, ImageryRequest> = new Map();
  private listeners: ((images: SatelliteImage[]) => void)[] = [];

  private constructor() {
    this.initializeData();
  }

  public static getInstance(): SatelliteImageryService {
    if (!SatelliteImageryService.instance) {
      SatelliteImageryService.instance = new SatelliteImageryService();
    }
    return SatelliteImageryService.instance;
  }

  /**
   * Initialize with sample data
   */
  private initializeData(): void {
    SAMPLE_SATELLITE_DATA.forEach((image) => {
      this.images.set(image.id, image);
    });
  }

  /**
   * Search for available satellite imagery
   */
  public searchImagery(params: {
    bounds: SatelliteImage['bounds'];
    startDate: Date;
    endDate: Date;
    sources?: SatelliteSource[];
    types?: ImageryType[];
    maxCloudCover?: number;
  }): SatelliteImage[] {
    return Array.from(this.images.values()).filter((image) => {
      // Check bounds overlap
      const boundsOverlap =
        image.bounds.south <= params.bounds.north &&
        image.bounds.north >= params.bounds.south &&
        image.bounds.west <= params.bounds.east &&
        image.bounds.east >= params.bounds.west;

      if (!boundsOverlap) return false;

      // Check date range
      if (image.acquisitionDate < params.startDate || image.acquisitionDate > params.endDate) {
        return false;
      }

      // Check sources
      if (params.sources && !params.sources.includes(image.source)) {
        return false;
      }

      // Check types
      if (params.types && !params.types.includes(image.type)) {
        return false;
      }

      // Check cloud cover
      if (params.maxCloudCover !== undefined && image.cloudCover > params.maxCloudCover) {
        return false;
      }

      return true;
    });
  }

  /**
   * Perform flood extent analysis
   */
  public async analyzeFloodExtent(
    imageId: string,
    baselineImageId?: string
  ): Promise<ImageAnalysisResult> {
    const image = this.images.get(imageId);
    if (!image) throw new Error('Image not found');

    const startTime = Date.now();

    // Simulate flood detection analysis
    const findings: AnalysisFinding[] = [];
    const numFindings = 3 + Math.floor(Math.random() * 5);

    for (let i = 0; i < numFindings; i++) {
      const lat = image.bounds.south + Math.random() * (image.bounds.north - image.bounds.south);
      const lng = image.bounds.west + Math.random() * (image.bounds.east - image.bounds.west);
      const area = 0.1 + Math.random() * 5;

      findings.push({
        id: `finding-${Date.now()}-${i}`,
        type: 'flooded_area',
        severity: area > 3 ? 'critical' : area > 1 ? 'high' : 'medium',
        location: { lat, lng },
        area,
        description: `Flooded area detected - ${area.toFixed(2)} sq km`,
        confidence: 0.7 + Math.random() * 0.25,
        polygon: this.generatePolygon(lat, lng, Math.sqrt(area) * 0.5),
      });
    }

    const totalArea =
      (image.bounds.north - image.bounds.south) *
      (image.bounds.east - image.bounds.west) *
      111 *
      111; // Approximate conversion
    const affectedArea = findings.reduce((sum, f) => sum + f.area, 0);

    const result: ImageAnalysisResult = {
      id: `analysis-${Date.now()}`,
      imageId,
      analysisType: 'flood_extent',
      timestamp: new Date(),
      bounds: image.bounds,
      findings,
      statistics: {
        totalArea: Math.round(totalArea * 100) / 100,
        affectedArea: Math.round(affectedArea * 100) / 100,
        percentageAffected: Math.round((affectedArea / totalArea) * 10000) / 100,
        additionalMetrics: {
          waterDepthEstimate: 0.5 + Math.random() * 2, // meters
          flowDirection: Math.random() * 360, // degrees
        },
      },
      confidenceScore: 0.85,
      processingTime: (Date.now() - startTime) / 1000,
    };

    this.analysisResults.set(result.id, result);
    return result;
  }

  /**
   * Perform fire detection analysis
   */
  public async analyzeFireDetection(imageId: string): Promise<ImageAnalysisResult> {
    const image = this.images.get(imageId);
    if (!image) throw new Error('Image not found');

    const startTime = Date.now();

    // Simulate fire detection
    const findings: AnalysisFinding[] = [];
    const numFindings = Math.floor(Math.random() * 4);

    for (let i = 0; i < numFindings; i++) {
      const lat = image.bounds.south + Math.random() * (image.bounds.north - image.bounds.south);
      const lng = image.bounds.west + Math.random() * (image.bounds.east - image.bounds.west);
      const area = 0.01 + Math.random() * 0.5;
      const frp = 10 + Math.random() * 500; // Fire Radiative Power

      findings.push({
        id: `finding-${Date.now()}-${i}`,
        type: 'active_fire',
        severity: frp > 200 ? 'critical' : frp > 100 ? 'high' : frp > 50 ? 'medium' : 'low',
        location: { lat, lng },
        area,
        description: `Active fire detected - FRP: ${frp.toFixed(0)} MW`,
        confidence: 0.8 + Math.random() * 0.15,
      });
    }

    const result: ImageAnalysisResult = {
      id: `analysis-${Date.now()}`,
      imageId,
      analysisType: 'fire_detection',
      timestamp: new Date(),
      bounds: image.bounds,
      findings,
      statistics: {
        totalArea:
          (image.bounds.north - image.bounds.south) *
          (image.bounds.east - image.bounds.west) *
          111 *
          111,
        affectedArea: findings.reduce((sum, f) => sum + f.area, 0),
        percentageAffected: 0,
        additionalMetrics: {
          totalFRP: findings.reduce((sum, f) => sum + Math.random() * 100, 0),
          activeFireCount: findings.length,
          estimatedSmokeExtent: findings.length * 2 + Math.random() * 10,
        },
      },
      confidenceScore: 0.9,
      processingTime: (Date.now() - startTime) / 1000,
    };

    this.analysisResults.set(result.id, result);
    return result;
  }

  /**
   * Perform damage assessment
   */
  public async analyzeDamageAssessment(
    preImageId: string,
    postImageId: string
  ): Promise<ChangeDetectionResult> {
    const preImage = this.images.get(preImageId);
    const postImage = this.images.get(postImageId);

    if (!preImage || !postImage) throw new Error('Images not found');

    // Simulate change detection
    const changedAreas: ChangeDetectionResult['changedAreas'] = [];
    const numChanges = 5 + Math.floor(Math.random() * 10);

    const categories = ['building_damage', 'road_damage', 'vegetation_loss', 'water_intrusion', 'debris'];

    for (let i = 0; i < numChanges; i++) {
      const lat = preImage.bounds.south + Math.random() * (preImage.bounds.north - preImage.bounds.south);
      const lng = preImage.bounds.west + Math.random() * (preImage.bounds.east - preImage.bounds.west);
      const area = 0.001 + Math.random() * 0.1;

      changedAreas.push({
        id: `change-${Date.now()}-${i}`,
        type: Math.random() > 0.7 ? 'new' : 'modified',
        category: categories[Math.floor(Math.random() * categories.length)],
        location: { lat, lng },
        area,
        confidence: 0.7 + Math.random() * 0.25,
        polygon: this.generatePolygon(lat, lng, Math.sqrt(area) * 0.1),
      });
    }

    const totalChange = changedAreas.reduce((sum, c) => sum + c.area, 0);
    const totalArea =
      (preImage.bounds.north - preImage.bounds.south) *
      (preImage.bounds.east - preImage.bounds.west) *
      111 *
      111;

    return {
      preImage,
      postImage,
      changedAreas,
      totalChange: Math.round(totalChange * 1000) / 1000,
      changePercentage: Math.round((totalChange / totalArea) * 10000) / 100,
    };
  }

  /**
   * Calculate NDVI (vegetation index)
   */
  public async calculateNDVI(
    imageId: string
  ): Promise<{
    min: number;
    max: number;
    mean: number;
    healthyVegetation: number;
    stressedVegetation: number;
    noVegetation: number;
  }> {
    const image = this.images.get(imageId);
    if (!image) throw new Error('Image not found');

    // Simulate NDVI calculation
    const mean = 0.2 + Math.random() * 0.4;
    const min = -0.2 + Math.random() * 0.2;
    const max = 0.6 + Math.random() * 0.3;

    return {
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      mean: Math.round(mean * 100) / 100,
      healthyVegetation: Math.round((30 + Math.random() * 30) * 100) / 100, // percentage
      stressedVegetation: Math.round((20 + Math.random() * 20) * 100) / 100,
      noVegetation: Math.round((10 + Math.random() * 30) * 100) / 100,
    };
  }

  /**
   * Calculate NDWI (water index)
   */
  public async calculateNDWI(
    imageId: string
  ): Promise<{
    waterBodyArea: number;
    waterPercentage: number;
    waterBodies: { lat: number; lng: number; area: number }[];
  }> {
    const image = this.images.get(imageId);
    if (!image) throw new Error('Image not found');

    const waterBodies: { lat: number; lng: number; area: number }[] = [];
    const numBodies = 2 + Math.floor(Math.random() * 5);

    for (let i = 0; i < numBodies; i++) {
      waterBodies.push({
        lat: image.bounds.south + Math.random() * (image.bounds.north - image.bounds.south),
        lng: image.bounds.west + Math.random() * (image.bounds.east - image.bounds.west),
        area: 0.1 + Math.random() * 2,
      });
    }

    const totalArea =
      (image.bounds.north - image.bounds.south) *
      (image.bounds.east - image.bounds.west) *
      111 *
      111;
    const waterBodyArea = waterBodies.reduce((sum, w) => sum + w.area, 0);

    return {
      waterBodyArea: Math.round(waterBodyArea * 100) / 100,
      waterPercentage: Math.round((waterBodyArea / totalArea) * 10000) / 100,
      waterBodies,
    };
  }

  /**
   * Get time series data for location
   */
  public async getTimeSeries(
    lat: number,
    lng: number,
    startDate: Date,
    endDate: Date,
    metric: 'ndvi' | 'ndwi' | 'temperature' | 'brightness'
  ): Promise<TimeSeriesPoint[]> {
    const points: TimeSeriesPoint[] = [];
    const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const numPoints = Math.min(Math.floor(daysDiff / 5), 50); // One point per ~5 days

    for (let i = 0; i < numPoints; i++) {
      const date = new Date(startDate.getTime() + (daysDiff / numPoints) * i * 24 * 60 * 60 * 1000);
      let value: number;

      switch (metric) {
        case 'ndvi':
          value = 0.3 + Math.sin(i / 10) * 0.2 + Math.random() * 0.1;
          break;
        case 'ndwi':
          value = -0.2 + Math.random() * 0.6;
          break;
        case 'temperature':
          value = 20 + Math.sin(i / 15) * 10 + Math.random() * 5;
          break;
        case 'brightness':
          value = 50 + Math.random() * 150;
          break;
        default:
          value = Math.random();
      }

      points.push({
        date,
        value: Math.round(value * 100) / 100,
        source: 'sentinel-2',
        confidence: 0.8 + Math.random() * 0.15,
      });
    }

    return points;
  }

  /**
   * Predict next satellite passes
   */
  public predictSatellitePasses(
    bounds: SatelliteImage['bounds'],
    days: number = 7
  ): SatellitePass[] {
    const passes: SatellitePass[] = [];
    const satellites: SatelliteSource[] = ['sentinel-1', 'sentinel-2', 'landsat-8', 'modis'];

    satellites.forEach((satellite) => {
      const revisitPeriod =
        satellite === 'sentinel-1' ? 6 :
        satellite === 'sentinel-2' ? 5 :
        satellite === 'landsat-8' ? 16 :
        1; // MODIS daily

      for (let d = 0; d < days; d += revisitPeriod) {
        const passTime = new Date(Date.now() + d * 24 * 60 * 60 * 1000);
        passTime.setHours(10 + Math.floor(Math.random() * 4)); // Typical daytime pass

        passes.push({
          satellite,
          passTime,
          duration: 5 + Math.floor(Math.random() * 5),
          maxElevation: 60 + Math.random() * 30,
          acquisitionProbability: 0.6 + Math.random() * 0.3,
          cloudForecast: Math.random() * 50,
        });
      }
    });

    return passes.sort((a, b) => a.passTime.getTime() - b.passTime.getTime());
  }

  /**
   * Request emergency imagery tasking
   */
  public async requestEmergencyImagery(
    bounds: SatelliteImage['bounds'],
    analysisTypes: AnalysisType[],
    description: string
  ): Promise<ImageryRequest> {
    const request: ImageryRequest = {
      id: `req-${Date.now()}`,
      requestDate: new Date(),
      bounds,
      sources: ['sentinel-1', 'sentinel-2'], // Default to Sentinel
      analysisTypes,
      priority: 'emergency',
      status: 'pending',
      estimatedDelivery: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours for emergency
    };

    this.requests.set(request.id, request);

    // Simulate processing
    setTimeout(() => {
      const storedRequest = this.requests.get(request.id);
      if (storedRequest) {
        storedRequest.status = 'processing';
        this.notifyListeners();
      }
    }, 5000);

    return request;
  }

  /**
   * Generate polygon around point
   */
  private generatePolygon(
    centerLat: number,
    centerLng: number,
    radiusKm: number
  ): { lat: number; lng: number }[] {
    const points: { lat: number; lng: number }[] = [];
    const numPoints = 8;

    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      const r = radiusKm * (0.8 + Math.random() * 0.4); // Slightly irregular

      points.push({
        lat: centerLat + (r / 111) * Math.cos(angle),
        lng: centerLng + (r / (111 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle),
      });
    }

    return points;
  }

  /**
   * Get image by ID
   */
  public getImage(imageId: string): SatelliteImage | undefined {
    return this.images.get(imageId);
  }

  /**
   * Get all images
   */
  public getAllImages(): SatelliteImage[] {
    return Array.from(this.images.values());
  }

  /**
   * Get analysis result
   */
  public getAnalysisResult(resultId: string): ImageAnalysisResult | undefined {
    return this.analysisResults.get(resultId);
  }

  /**
   * Get band configurations
   */
  public getBandConfigurations(): typeof BAND_CONFIGURATIONS {
    return BAND_CONFIGURATIONS;
  }

  /**
   * Get request status
   */
  public getRequestStatus(requestId: string): ImageryRequest | undefined {
    return this.requests.get(requestId);
  }

  /**
   * Subscribe to updates
   */
  public subscribe(callback: (images: SatelliteImage[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  /**
   * Notify listeners
   */
  private notifyListeners(): void {
    const images = Array.from(this.images.values());
    this.listeners.forEach((callback) => callback(images));
  }

  /**
   * Format resolution
   */
  public formatResolution(meters: number): string {
    if (meters < 1) return `${Math.round(meters * 100)} cm`;
    return `${meters} m`;
  }

  /**
   * Format area
   */
  public formatArea(sqKm: number): string {
    if (sqKm < 0.01) return `${Math.round(sqKm * 1000000)} sq m`;
    if (sqKm < 1) return `${Math.round(sqKm * 100) / 100} sq km`;
    return `${Math.round(sqKm * 10) / 10} sq km`;
  }
}

export const satelliteImageryService = SatelliteImageryService.getInstance();
export type {
  SatelliteImage,
  SatelliteSource,
  ImageryType,
  AnalysisType,
  ImageAnalysisResult,
  AnalysisFinding,
  AnalysisStatistics,
  TimeSeriesPoint,
  ChangeDetectionResult,
  SatellitePass,
  ImageryRequest,
};
