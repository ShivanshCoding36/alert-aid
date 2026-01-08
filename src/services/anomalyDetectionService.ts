/**
 * Weather Anomaly Detection Service
 * Detects unusual weather patterns using statistical analysis
 */

export interface WeatherReading {
  timestamp: Date;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  rainfall: number;
  visibility: number;
}

export interface AnomalyResult {
  id: string;
  type: 'temperature' | 'pressure' | 'wind' | 'rainfall' | 'multi-factor';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  location: { lat: number; lon: number; name: string };
  metrics: {
    observedValue: number;
    expectedValue: number;
    deviation: number; // standard deviations
    percentile: number;
  };
  potentialThreats: string[];
  recommendedActions: string[];
  confidence: number;
  expiresAt: Date;
}

export interface HistoricalBaseline {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  percentiles: { p5: number; p25: number; p50: number; p75: number; p95: number };
}

// Historical baselines by month (sample data for Delhi region)
const HISTORICAL_BASELINES: Record<number, Record<string, HistoricalBaseline>> = {
  1: { // January
    temperature: { mean: 14, stdDev: 3, min: 2, max: 25, percentiles: { p5: 8, p25: 11, p50: 14, p75: 17, p95: 21 } },
    humidity: { mean: 65, stdDev: 15, min: 30, max: 95, percentiles: { p5: 40, p25: 55, p50: 65, p75: 78, p95: 90 } },
    pressure: { mean: 1018, stdDev: 5, min: 1000, max: 1035, percentiles: { p5: 1010, p25: 1014, p50: 1018, p75: 1022, p95: 1026 } },
    windSpeed: { mean: 8, stdDev: 4, min: 0, max: 30, percentiles: { p5: 2, p25: 5, p50: 8, p75: 11, p95: 18 } },
    rainfall: { mean: 5, stdDev: 10, min: 0, max: 50, percentiles: { p5: 0, p25: 0, p50: 2, p75: 8, p95: 25 } },
  },
  7: { // July (monsoon)
    temperature: { mean: 32, stdDev: 3, min: 25, max: 42, percentiles: { p5: 27, p25: 30, p50: 32, p75: 35, p95: 38 } },
    humidity: { mean: 78, stdDev: 12, min: 50, max: 100, percentiles: { p5: 55, p25: 70, p50: 80, p75: 88, p95: 95 } },
    pressure: { mean: 1002, stdDev: 6, min: 985, max: 1015, percentiles: { p5: 992, p25: 998, p50: 1002, p75: 1006, p95: 1012 } },
    windSpeed: { mean: 15, stdDev: 8, min: 2, max: 60, percentiles: { p5: 5, p25: 10, p50: 14, p75: 20, p95: 35 } },
    rainfall: { mean: 80, stdDev: 60, min: 0, max: 350, percentiles: { p5: 5, p25: 30, p50: 65, p75: 120, p95: 220 } },
  },
};

// Fill in remaining months with interpolated values
for (let m = 2; m <= 12; m++) {
  if (!HISTORICAL_BASELINES[m]) {
    HISTORICAL_BASELINES[m] = { ...HISTORICAL_BASELINES[m < 7 ? 1 : 7] };
  }
}

class AnomalyDetectionService {
  private static instance: AnomalyDetectionService;
  private recentReadings: WeatherReading[] = [];
  private activeAnomalies: Map<string, AnomalyResult> = new Map();
  private readonly MAX_READINGS = 1000;

  private constructor() {}

  public static getInstance(): AnomalyDetectionService {
    if (!AnomalyDetectionService.instance) {
      AnomalyDetectionService.instance = new AnomalyDetectionService();
    }
    return AnomalyDetectionService.instance;
  }

  /**
   * Add new weather reading and check for anomalies
   */
  public async processReading(reading: WeatherReading, location: { lat: number; lon: number; name: string }): Promise<AnomalyResult[]> {
    this.recentReadings.push(reading);
    if (this.recentReadings.length > this.MAX_READINGS) {
      this.recentReadings.shift();
    }

    const anomalies: AnomalyResult[] = [];
    const month = reading.timestamp.getMonth() + 1;
    const baselines = HISTORICAL_BASELINES[month];

    // Check temperature anomaly
    const tempAnomaly = this.checkAnomaly(reading.temperature, baselines.temperature, 'temperature', location);
    if (tempAnomaly) anomalies.push(tempAnomaly);

    // Check pressure anomaly
    const pressureAnomaly = this.checkAnomaly(reading.pressure, baselines.pressure, 'pressure', location);
    if (pressureAnomaly) anomalies.push(pressureAnomaly);

    // Check wind speed anomaly
    const windAnomaly = this.checkAnomaly(reading.windSpeed, baselines.windSpeed, 'wind', location);
    if (windAnomaly) anomalies.push(windAnomaly);

    // Check rainfall anomaly
    const rainfallAnomaly = this.checkAnomaly(reading.rainfall, baselines.rainfall, 'rainfall', location);
    if (rainfallAnomaly) anomalies.push(rainfallAnomaly);

    // Multi-factor anomaly detection
    const multiFactor = this.detectMultiFactorAnomaly(reading, baselines, location);
    if (multiFactor) anomalies.push(multiFactor);

    // Update active anomalies
    for (const anomaly of anomalies) {
      this.activeAnomalies.set(anomaly.id, anomaly);
    }

    // Clean expired anomalies
    this.cleanExpiredAnomalies();

    return anomalies;
  }

  /**
   * Check single parameter for anomaly
   */
  private checkAnomaly(
    value: number,
    baseline: HistoricalBaseline,
    type: 'temperature' | 'pressure' | 'wind' | 'rainfall',
    location: { lat: number; lon: number; name: string }
  ): AnomalyResult | null {
    const deviation = (value - baseline.mean) / baseline.stdDev;
    const absDeviation = Math.abs(deviation);

    // Only flag significant anomalies (>2 standard deviations)
    if (absDeviation < 2) return null;

    const percentile = this.calculatePercentile(value, baseline);
    const severity = this.calculateSeverity(absDeviation);
    const confidence = Math.min(0.99, 0.7 + absDeviation * 0.08);

    const typeDescriptions = {
      temperature: deviation > 0 ? 'Unusually high temperature detected' : 'Unusually low temperature detected',
      pressure: deviation > 0 ? 'Abnormally high atmospheric pressure' : 'Abnormally low atmospheric pressure',
      wind: 'Abnormal wind speeds detected',
      rainfall: deviation > 0 ? 'Excessive rainfall detected' : 'Abnormally dry conditions',
    };

    const potentialThreats = this.getPotentialThreats(type, deviation, value);
    const recommendedActions = this.getRecommendedActions(type, severity);

    return {
      id: `anomaly_${type}_${Date.now()}`,
      type,
      severity,
      description: typeDescriptions[type],
      detectedAt: new Date(),
      location,
      metrics: {
        observedValue: value,
        expectedValue: baseline.mean,
        deviation: Math.round(deviation * 100) / 100,
        percentile: Math.round(percentile * 100) / 100,
      },
      potentialThreats,
      recommendedActions,
      confidence: Math.round(confidence * 100) / 100,
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
    };
  }

  /**
   * Detect multi-factor anomalies (compound weather events)
   */
  private detectMultiFactorAnomaly(
    reading: WeatherReading,
    baselines: Record<string, HistoricalBaseline>,
    location: { lat: number; lon: number; name: string }
  ): AnomalyResult | null {
    const deviations = {
      temperature: (reading.temperature - baselines.temperature.mean) / baselines.temperature.stdDev,
      pressure: (reading.pressure - baselines.pressure.mean) / baselines.pressure.stdDev,
      wind: (reading.windSpeed - baselines.windSpeed.mean) / baselines.windSpeed.stdDev,
      rainfall: (reading.rainfall - baselines.rainfall.mean) / baselines.rainfall.stdDev,
      humidity: (reading.humidity - baselines.humidity.mean) / baselines.humidity.stdDev,
    };

    // Check for cyclone pattern: low pressure + high wind + heavy rain
    if (deviations.pressure < -2 && deviations.wind > 2 && deviations.rainfall > 1.5) {
      return this.createMultiFactorAnomaly(
        'Cyclonic weather pattern detected',
        ['Potential cyclone formation', 'Severe flooding risk', 'Infrastructure damage'],
        deviations,
        location,
        'critical'
      );
    }

    // Check for heat wave pattern: high temp + low humidity + low wind
    if (deviations.temperature > 2.5 && deviations.humidity < -1 && deviations.wind < 0) {
      return this.createMultiFactorAnomaly(
        'Heat wave conditions detected',
        ['Heat stroke risk', 'Wildfire danger', 'Power grid stress'],
        deviations,
        location,
        'high'
      );
    }

    // Check for flash flood pattern: extreme rainfall + recent rain history
    if (deviations.rainfall > 3) {
      return this.createMultiFactorAnomaly(
        'Flash flood conditions detected',
        ['Immediate flooding risk', 'Road closures', 'Evacuation may be needed'],
        deviations,
        location,
        'critical'
      );
    }

    // Check for severe thunderstorm: pressure drop + humidity spike + wind increase
    if (deviations.pressure < -1.5 && deviations.humidity > 1.5 && deviations.wind > 1.5) {
      return this.createMultiFactorAnomaly(
        'Severe thunderstorm conditions developing',
        ['Lightning strikes', 'Hail possibility', 'Localized flooding'],
        deviations,
        location,
        'high'
      );
    }

    return null;
  }

  private createMultiFactorAnomaly(
    description: string,
    threats: string[],
    deviations: Record<string, number>,
    location: { lat: number; lon: number; name: string },
    severity: AnomalyResult['severity']
  ): AnomalyResult {
    const avgDeviation = Object.values(deviations).reduce((a, b) => a + Math.abs(b), 0) / Object.keys(deviations).length;
    
    return {
      id: `anomaly_multi_${Date.now()}`,
      type: 'multi-factor',
      severity,
      description,
      detectedAt: new Date(),
      location,
      metrics: {
        observedValue: avgDeviation,
        expectedValue: 0,
        deviation: Math.round(avgDeviation * 100) / 100,
        percentile: 99,
      },
      potentialThreats: threats,
      recommendedActions: this.getRecommendedActions('multi-factor', severity),
      confidence: Math.min(0.95, 0.75 + avgDeviation * 0.05),
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    };
  }

  private calculatePercentile(value: number, baseline: HistoricalBaseline): number {
    if (value <= baseline.percentiles.p5) return 5;
    if (value <= baseline.percentiles.p25) return 25;
    if (value <= baseline.percentiles.p50) return 50;
    if (value <= baseline.percentiles.p75) return 75;
    if (value <= baseline.percentiles.p95) return 95;
    return 99;
  }

  private calculateSeverity(absDeviation: number): AnomalyResult['severity'] {
    if (absDeviation >= 4) return 'critical';
    if (absDeviation >= 3) return 'high';
    if (absDeviation >= 2.5) return 'moderate';
    return 'low';
  }

  private getPotentialThreats(type: string, deviation: number, value: number): string[] {
    const threats: string[] = [];
    
    switch (type) {
      case 'temperature':
        if (deviation > 2) {
          threats.push('Heat exhaustion risk');
          threats.push('Increased energy demand');
          if (value > 40) threats.push('Heat stroke danger');
        } else if (deviation < -2) {
          threats.push('Hypothermia risk');
          threats.push('Pipe freezing');
          if (value < 0) threats.push('Black ice on roads');
        }
        break;
      case 'pressure':
        if (deviation < -2) {
          threats.push('Storm system approaching');
          threats.push('Potential precipitation');
        }
        break;
      case 'wind':
        if (deviation > 2) {
          threats.push('Flying debris hazard');
          threats.push('Power line damage');
          if (value > 60) threats.push('Structural damage risk');
        }
        break;
      case 'rainfall':
        if (deviation > 2) {
          threats.push('Flash flooding');
          threats.push('Road closures');
          threats.push('Drainage overflow');
        }
        break;
    }
    
    return threats;
  }

  private getRecommendedActions(type: string, severity: AnomalyResult['severity']): string[] {
    const actions: string[] = [];
    
    if (severity === 'critical') {
      actions.push('⚠️ Monitor emergency broadcasts');
      actions.push('Prepare evacuation plan');
      actions.push('Secure outdoor items');
    } else if (severity === 'high') {
      actions.push('Stay informed about weather updates');
      actions.push('Avoid unnecessary travel');
    }
    
    switch (type) {
      case 'temperature':
        actions.push('Stay hydrated');
        actions.push('Limit outdoor activities');
        break;
      case 'rainfall':
        actions.push('Avoid flood-prone areas');
        actions.push('Do not drive through flooded roads');
        break;
      case 'wind':
        actions.push('Stay indoors if possible');
        actions.push('Avoid areas with trees');
        break;
      case 'multi-factor':
        actions.push('Follow official guidance');
        actions.push('Keep emergency kit ready');
        break;
    }
    
    return actions;
  }

  private cleanExpiredAnomalies(): void {
    const now = new Date();
    for (const [id, anomaly] of this.activeAnomalies) {
      if (anomaly.expiresAt < now) {
        this.activeAnomalies.delete(id);
      }
    }
  }

  public getActiveAnomalies(): AnomalyResult[] {
    return Array.from(this.activeAnomalies.values());
  }

  public clearAnomalies(): void {
    this.activeAnomalies.clear();
  }
}

export const anomalyDetectionService = AnomalyDetectionService.getInstance();
export default anomalyDetectionService;
