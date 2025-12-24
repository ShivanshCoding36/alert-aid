// Dashboard and ML Data Types

// Re-export weather types
export * from './weather';

export interface RiskPrediction {
  score: number;
  level: 'Low' | 'Moderate' | 'High' | 'Critical';
  confidence: number;
  timestamp: string;
  factors: string[];
}

export interface AlertData {
  id: string;
  type: 'Flood' | 'Fire' | 'Earthquake' | 'Storm' | 'Drought';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  location: string;
  description: string;
  timestamp: string;
  expected_peak?: string;
  isActive: boolean;
}

export interface RegionSeverity {
  region: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  percentage: number;
  color: string;
}

export interface ForecastData {
  day: string;
  riskScore: number;
  precipitation: number;
  temperature: number;
  windSpeed: number;
  conditions?: string;  // Weather conditions like 'Clear', 'Cloudy', 'Rain'
}

export interface IncidentData {
  id: string;
  type: 'Forest Fire' | 'Flooding' | 'Storm' | 'Earthquake';
  location: string;
  status: 'Active' | 'Monitoring' | 'Resolved';
  specification: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface TrendData {
  date: string;
  floodIncidents: number;
  fireIncidents: number;
  stormIncidents: number;
  totalIncidents: number;
}

export interface AnomalyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  location?: string;
}

// ML Model Integration Types
export interface MLModelRequest {
  features: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    soilMoisture: number;
    elevation: number;
    vegetation: number;
    population: number;
    // Add more features as needed
  };
  location: {
    latitude: number;
    longitude: number;
  };
  timeframe: '1h' | '6h' | '12h' | '24h' | '7d';
}

export interface MLModelResponse {
  prediction: RiskPrediction;
  recommendations: string[];
  confidence_interval: {
    lower: number;
    upper: number;
  };
  feature_importance: {
    [key: string]: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface DashboardData {
  currentAlerts: AlertData[];
  riskPrediction: RiskPrediction;
  regionSeverity: RegionSeverity[];
  modelAccuracy: number;
  forecast: ForecastData[];
  activeIncidents: IncidentData[];
  modelPerformance: ModelPerformance;
  historicalTrends: TrendData[];
  anomalyAlerts: AnomalyAlert[];
}

// Chart Data Types
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
}

export interface AccuracyTrendPoint {
  date: string;
  accuracy: number;
  target?: number;
}

// 3D Scene Types
export interface SceneData {
  terrain: {
    heightMap: number[][];
    texture?: string;
  };
  weather: {
    cloudCover: number;
    precipitation: number;
    temperature: number;
  };
  risks: {
    floodZones: Array<{
      coordinates: [number, number][];
      severity: number;
    }>;
    fireRisk: Array<{
      coordinates: [number, number];
      risk: number;
    }>;
  };
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  isActive?: boolean;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  avatar?: string;
}

// Settings Types
export interface UserSettings {
  theme: 'dark' | 'light';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    refreshInterval: number;
    defaultTimeframe: string;
    units: 'metric' | 'imperial';
  };
}