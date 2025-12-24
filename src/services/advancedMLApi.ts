/**
 * Advanced ML API Service
 * Connects to ensemble flood prediction, anomaly detection, and smart alerts
 * Includes caching to avoid hitting ML endpoints on every render
 */

const getBackendUrl = (): string => {
  // Check for environment variable first
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  // Default to localhost in development
  return 'http://localhost:8000';
};

const API_BASE_URL = getBackendUrl();

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache: Map<string, { data: any; timestamp: number }> = new Map();

function getCacheKey(endpoint: string, params: Record<string, any>): string {
  return `${endpoint}:${JSON.stringify(params)}`;
}

function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📦 Cache hit: ${key.split(':')[0]}`);
    return cached.data as T;
  }
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
  console.log(`💾 Cached: ${key.split(':')[0]}`);
}

function clearCache(): void {
  cache.clear();
  console.log('🗑️ ML API cache cleared');
}

interface Location {
  latitude: number;
  longitude: number;
  district?: string;
  state?: string;
  region_type?: string;
}

interface EnsemblePrediction {
  flood_probability: number;
  confidence: number;
  risk_level: string;
  predictions_by_horizon: {
    '6h': number;
    '12h': number;
    '24h': number;
  };
}

interface FloodPredictionResponse {
  success: boolean;
  prediction: {
    timestamp: string;
    location: {
      latitude: number;
      longitude: number;
      district: string | null;
      state: string | null;
      region_type: string;
    };
    ensemble_prediction: EnsemblePrediction;
    model_outputs: {
      lstm: {
        model: string;
        predictions: { '6h': number; '12h': number; '24h': number };
        features_used: Record<string, number>;
        confidence: number;
      };
      xgboost: {
        model: string;
        risk_class: string;
        risk_score: number;
        class_probabilities: Record<string, number>;
        feature_importance: Record<string, number>;
        confidence: number;
      };
      gnn: {
        model: string;
        propagation_probability: number;
        estimated_arrival: string | null;
        confidence: number;
        message: string;
      };
    };
    reasoning: string;
    recommended_actions: string[];
    uncertainty: {
      model_disagreement: number;
      data_quality_score: number;
      limitations: string[];
    };
    weather_source: string;
    api_version: string;
  };
}

interface AnomalyResponse {
  success: boolean;
  anomaly_result: {
    timestamp: string;
    combined_anomaly_score: number;
    alert_level: string;
    alert_message: string;
    is_anomalous: boolean;
    isolation_forest: {
      model: string;
      overall_anomaly_score: number;
      is_anomalous: boolean;
      feature_scores: Record<string, {
        score: number;
        value: number;
        baseline_mean: number;
        is_anomaly: boolean;
      }>;
      anomalies_detected: string[];
      confidence: number;
    };
    autoencoder: {
      model: string;
      reconstruction_error: number;
      is_anomalous: boolean;
      threshold: number;
      pattern_similarity: number;
    };
    early_warnings: Array<{
      type: string;
      severity: string;
      message: string;
    }>;
    trend: {
      direction: string;
      change: number;
      samples: number;
    };
    recommended_action: string;
  };
}

interface SmartAlertResponse {
  success: boolean;
  alert: {
    alert_id: string;
    severity: string;
    type: string;
    title: string;
    description: string;
    instructions: Array<{
      priority: number;
      action: string;
      icon: string;
    }>;
    resources: {
      evacuation_centers: Array<{
        name: string;
        distance_km: number;
        capacity: number;
      }>;
      emergency_contacts: Record<string, string>;
    };
    sms_payload: string;
    metrics: {
      flood_probability: number;
      confidence: number;
      anomaly_score: number;
    };
  };
  underlying_data: {
    flood_prediction_summary: {
      probability: number;
      confidence: number;
      risk_level: string;
    };
    anomaly_summary: {
      score: number;
      alert_level: string;
      early_warnings_count: number;
    };
  };
}

interface ModelStatus {
  success: boolean;
  models: {
    ensemble_predictor: {
      status: string;
      components: Record<string, string>;
      weights: Record<string, number>;
    };
    anomaly_detector: {
      status: string;
      components: Record<string, string>;
    };
    smart_alert_engine: {
      status: string;
      active_alerts: number;
    };
  };
}

class AdvancedMLApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Clear the cache (useful when location changes significantly)
   */
  clearCache(): void {
    clearCache();
  }

  /**
   * Get ensemble flood prediction with LSTM, XGBoost, and GNN
   * Results are cached for 5 minutes
   */
  async getEnsemblePrediction(location: Location): Promise<FloodPredictionResponse> {
    const cacheKey = getCacheKey('ensemble', { lat: location.latitude, lon: location.longitude });
    const cached = getFromCache<FloodPredictionResponse>(cacheKey);
    if (cached) return cached;

    const response = await fetch(`${this.baseUrl}/api/flood/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
    });

    if (!response.ok) {
      throw new Error(`Ensemble prediction failed: ${response.statusText}`);
    }

    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  }

  /**
   * Get ensemble prediction via GET (for easier testing)
   * Results are cached for 5 minutes
   */
  async getEnsemblePredictionGet(
    latitude: number,
    longitude: number,
    district?: string,
    state?: string
  ): Promise<FloodPredictionResponse> {
    const cacheKey = getCacheKey('ensemble-get', { latitude, longitude, district, state });
    const cached = getFromCache<FloodPredictionResponse>(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });

    if (district) params.append('district', district);
    if (state) params.append('state', state);

    const response = await fetch(`${this.baseUrl}/api/flood/predict?${params}`);

    if (!response.ok) {
      throw new Error(`Ensemble prediction failed: ${response.statusText}`);
    }

    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  }

  /**
   * Get anomaly detection results
   * Results are cached for 5 minutes
   */
  async getAnomalyDetection(
    latitude: number,
    longitude: number,
    timeWindowHours: number = 24
  ): Promise<AnomalyResponse> {
    const cacheKey = getCacheKey('anomaly', { latitude, longitude, timeWindowHours });
    const cached = getFromCache<AnomalyResponse>(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      time_window_hours: timeWindowHours.toString(),
    });

    const response = await fetch(`${this.baseUrl}/api/anomaly/detect?${params}`);

    if (!response.ok) {
      throw new Error(`Anomaly detection failed: ${response.statusText}`);
    }

    const data = await response.json();
    setCache(cacheKey, data);
    return data;
  }

  /**
   * Get smart ML-triggered alerts
   */
  async getSmartAlert(location: Location): Promise<SmartAlertResponse> {
    const response = await fetch(`${this.baseUrl}/api/alert/smart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
    });

    if (!response.ok) {
      throw new Error(`Smart alert failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get smart alert via GET
   */
  async getSmartAlertGet(
    latitude: number,
    longitude: number,
    district?: string,
    state?: string
  ): Promise<SmartAlertResponse> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });

    if (district) params.append('district', district);
    if (state) params.append('state', state);

    const response = await fetch(`${this.baseUrl}/api/alert/smart?${params}`);

    if (!response.ok) {
      throw new Error(`Smart alert failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all active alerts
   */
  async getActiveAlerts(latitude?: number, longitude?: number): Promise<{
    success: boolean;
    active_alerts_count: number;
    alerts: any[];
  }> {
    const params = new URLSearchParams();
    if (latitude !== undefined) params.append('latitude', latitude.toString());
    if (longitude !== undefined) params.append('longitude', longitude.toString());

    const response = await fetch(`${this.baseUrl}/api/alerts/active?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to get active alerts: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/api/flood/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to acknowledge alert: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Clear/deactivate an alert
   */
  async clearAlert(alertId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/api/flood/alerts/${alertId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to clear alert: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get ML model status
   */
  async getModelStatus(): Promise<ModelStatus> {
    const response = await fetch(`${this.baseUrl}/api/ml/status`);

    if (!response.ok) {
      throw new Error(`Failed to get model status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Comprehensive analysis combining all ML outputs
   */
  async getComprehensiveAnalysis(location: Location): Promise<{
    prediction: FloodPredictionResponse;
    anomaly: AnomalyResponse;
    alert: SmartAlertResponse;
    modelStatus: ModelStatus;
  }> {
    const [prediction, anomaly, alert, modelStatus] = await Promise.all([
      this.getEnsemblePrediction(location),
      this.getAnomalyDetection(location.latitude, location.longitude),
      this.getSmartAlert(location),
      this.getModelStatus(),
    ]);

    return {
      prediction,
      anomaly,
      alert,
      modelStatus,
    };
  }
}

// Export singleton instance
export const advancedMLApi = new AdvancedMLApiService();

// Export types
export type {
  Location,
  EnsemblePrediction,
  FloodPredictionResponse,
  AnomalyResponse,
  SmartAlertResponse,
  ModelStatus,
};
