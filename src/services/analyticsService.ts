/**
 * Analytics Dashboard Service
 * Comprehensive disaster analytics and reporting
 */

// Time range options
type TimeRange = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

// Metric types
type MetricType = 
  | 'alerts_count'
  | 'alerts_severity'
  | 'response_time'
  | 'evacuations'
  | 'shelters_capacity'
  | 'resources_deployed'
  | 'volunteers_active'
  | 'reports_submitted'
  | 'areas_affected'
  | 'population_impacted'
  | 'damage_estimate'
  | 'rescue_operations';

// Chart types
type ChartType = 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter' | 'heatmap' | 'gauge' | 'map';

// Dashboard widget
interface DashboardWidget {
  id: string;
  title: string;
  type: ChartType;
  metrics: MetricType[];
  timeRange: TimeRange;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { row: number; col: number };
  refreshInterval?: number; // seconds
  filters?: WidgetFilter[];
  config: WidgetConfig;
}

// Widget configuration
interface WidgetConfig {
  showLegend?: boolean;
  showLabels?: boolean;
  stacked?: boolean;
  colors?: string[];
  yAxisLabel?: string;
  xAxisLabel?: string;
  threshold?: { value: number; color: string; label: string }[];
  drillDown?: boolean;
}

// Widget filter
interface WidgetFilter {
  field: string;
  operator: '=' | '!=' | '>' | '<' | 'in' | 'between';
  value: unknown;
}

// Metric data point
interface DataPoint {
  timestamp: Date;
  value: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

// Aggregated metric
interface AggregatedMetric {
  metric: MetricType;
  timeRange: TimeRange;
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count';
  value: number;
  change?: number; // percentage change from previous period
  trend: 'up' | 'down' | 'stable';
  dataPoints: DataPoint[];
}

// Dashboard layout
interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Report definition
interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  metrics: MetricType[];
  timeRange: TimeRange;
  filters?: WidgetFilter[];
  format: 'pdf' | 'excel' | 'csv' | 'json';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
}

// Alert statistics
interface AlertStatistics {
  total: number;
  bySeverity: { critical: number; high: number; medium: number; low: number };
  byType: Record<string, number>;
  byRegion: { region: string; count: number }[];
  responseTimeAvg: number; // minutes
  acknowledged: number;
  resolved: number;
  active: number;
}

// Resource statistics
interface ResourceStatistics {
  totalDeployed: number;
  byType: Record<string, number>;
  utilization: number; // percentage
  shortages: { resource: string; needed: number; available: number }[];
  distribution: { location: string; resources: number }[];
}

// Shelter statistics
interface ShelterStatistics {
  totalShelters: number;
  totalCapacity: number;
  currentOccupancy: number;
  occupancyRate: number;
  byStatus: { open: number; full: number; closed: number };
  byRegion: { region: string; shelters: number; occupancy: number }[];
}

// Impact assessment
interface ImpactAssessment {
  populationAffected: number;
  areasAffected: number;
  infrastructureDamage: {
    roads: number;
    bridges: number;
    buildings: number;
    powerLines: number;
  };
  estimatedDamage: number; // currency
  evacuated: number;
  rescued: number;
  casualties: { injured: number; missing: number; deceased: number };
}

// Trend analysis
interface TrendAnalysis {
  metric: MetricType;
  period: TimeRange;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  changeRate: number;
  prediction: DataPoint[];
  confidence: number;
  seasonality?: { period: string; impact: number }[];
}

// Comparison data
interface ComparisonData {
  metric: MetricType;
  current: { period: string; value: number };
  previous: { period: string; value: number };
  change: number;
  changePercentage: number;
  historicalAvg: number;
}

// Default color palette
const COLOR_PALETTE = {
  primary: ['#2196F3', '#1976D2', '#1565C0', '#0D47A1'],
  danger: ['#F44336', '#E53935', '#D32F2F', '#C62828'],
  warning: ['#FF9800', '#FB8C00', '#F57C00', '#EF6C00'],
  success: ['#4CAF50', '#43A047', '#388E3C', '#2E7D32'],
  neutral: ['#9E9E9E', '#757575', '#616161', '#424242'],
  severity: { critical: '#F44336', high: '#FF9800', medium: '#FFC107', low: '#4CAF50' },
};

// Default widgets
const DEFAULT_WIDGETS: Omit<DashboardWidget, 'id'>[] = [
  {
    title: 'Active Alerts',
    type: 'gauge',
    metrics: ['alerts_count'],
    timeRange: 'day',
    size: 'small',
    position: { row: 0, col: 0 },
    refreshInterval: 30,
    config: {
      threshold: [
        { value: 50, color: '#4CAF50', label: 'Normal' },
        { value: 100, color: '#FF9800', label: 'Elevated' },
        { value: 150, color: '#F44336', label: 'Critical' },
      ],
    },
  },
  {
    title: 'Alerts by Severity',
    type: 'donut',
    metrics: ['alerts_severity'],
    timeRange: 'day',
    size: 'small',
    position: { row: 0, col: 1 },
    refreshInterval: 60,
    config: {
      showLegend: true,
      colors: [COLOR_PALETTE.severity.critical, COLOR_PALETTE.severity.high, COLOR_PALETTE.severity.medium, COLOR_PALETTE.severity.low],
    },
  },
  {
    title: 'Response Time Trend',
    type: 'line',
    metrics: ['response_time'],
    timeRange: 'week',
    size: 'medium',
    position: { row: 0, col: 2 },
    refreshInterval: 300,
    config: {
      showLabels: true,
      yAxisLabel: 'Minutes',
      xAxisLabel: 'Time',
    },
  },
  {
    title: 'Shelter Occupancy',
    type: 'bar',
    metrics: ['shelters_capacity'],
    timeRange: 'day',
    size: 'medium',
    position: { row: 1, col: 0 },
    refreshInterval: 120,
    config: {
      showLabels: true,
      colors: COLOR_PALETTE.primary,
    },
  },
  {
    title: 'Evacuations Over Time',
    type: 'area',
    metrics: ['evacuations'],
    timeRange: 'week',
    size: 'large',
    position: { row: 1, col: 2 },
    refreshInterval: 300,
    config: {
      stacked: false,
      showLegend: true,
    },
  },
  {
    title: 'Resource Deployment',
    type: 'pie',
    metrics: ['resources_deployed'],
    timeRange: 'day',
    size: 'small',
    position: { row: 2, col: 0 },
    refreshInterval: 180,
    config: {
      showLegend: true,
      showLabels: true,
    },
  },
  {
    title: 'Affected Areas Map',
    type: 'map',
    metrics: ['areas_affected'],
    timeRange: 'day',
    size: 'large',
    position: { row: 2, col: 1 },
    refreshInterval: 120,
    config: {
      drillDown: true,
    },
  },
];

class AnalyticsService {
  private static instance: AnalyticsService;
  private dashboards: Map<string, DashboardLayout> = new Map();
  private reports: Map<string, ReportDefinition> = new Map();
  private cachedMetrics: Map<string, AggregatedMetric> = new Map();
  private listeners: ((dashboard: DashboardLayout) => void)[] = [];

  private constructor() {
    this.initializeDefaults();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize default dashboard
   */
  private initializeDefaults(): void {
    const defaultDashboard: DashboardLayout = {
      id: 'default',
      name: 'Main Dashboard',
      description: 'Primary disaster monitoring dashboard',
      widgets: DEFAULT_WIDGETS.map((w, i) => ({ ...w, id: `widget-${i}` })),
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.dashboards.set('default', defaultDashboard);
  }

  /**
   * Get aggregated metric data
   */
  public async getMetric(
    metric: MetricType,
    timeRange: TimeRange,
    aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count' = 'sum',
    filters?: WidgetFilter[]
  ): Promise<AggregatedMetric> {
    const cacheKey = `${metric}-${timeRange}-${aggregation}`;
    
    // Generate simulated data
    const dataPoints = this.generateDataPoints(metric, timeRange);
    const values = dataPoints.map((dp) => dp.value);
    
    let value: number;
    switch (aggregation) {
      case 'sum':
        value = values.reduce((a, b) => a + b, 0);
        break;
      case 'avg':
        value = values.reduce((a, b) => a + b, 0) / values.length;
        break;
      case 'min':
        value = Math.min(...values);
        break;
      case 'max':
        value = Math.max(...values);
        break;
      case 'count':
        value = values.length;
        break;
    }

    const previousValue = value * (0.8 + Math.random() * 0.4);
    const change = ((value - previousValue) / previousValue) * 100;

    const result: AggregatedMetric = {
      metric,
      timeRange,
      aggregation,
      value: Math.round(value * 100) / 100,
      change: Math.round(change * 10) / 10,
      trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      dataPoints,
    };

    this.cachedMetrics.set(cacheKey, result);
    return result;
  }

  /**
   * Generate data points for metric
   */
  private generateDataPoints(metric: MetricType, timeRange: TimeRange): DataPoint[] {
    const points: DataPoint[] = [];
    const now = new Date();
    
    const intervals: Record<TimeRange, { count: number; msPerInterval: number }> = {
      hour: { count: 12, msPerInterval: 5 * 60 * 1000 },
      day: { count: 24, msPerInterval: 60 * 60 * 1000 },
      week: { count: 7, msPerInterval: 24 * 60 * 60 * 1000 },
      month: { count: 30, msPerInterval: 24 * 60 * 60 * 1000 },
      quarter: { count: 12, msPerInterval: 7 * 24 * 60 * 60 * 1000 },
      year: { count: 12, msPerInterval: 30 * 24 * 60 * 60 * 1000 },
      custom: { count: 10, msPerInterval: 24 * 60 * 60 * 1000 },
    };

    const { count, msPerInterval } = intervals[timeRange];
    const baseValues: Record<MetricType, { base: number; variance: number }> = {
      alerts_count: { base: 50, variance: 30 },
      alerts_severity: { base: 25, variance: 15 },
      response_time: { base: 15, variance: 10 },
      evacuations: { base: 200, variance: 100 },
      shelters_capacity: { base: 500, variance: 200 },
      resources_deployed: { base: 100, variance: 50 },
      volunteers_active: { base: 150, variance: 75 },
      reports_submitted: { base: 80, variance: 40 },
      areas_affected: { base: 10, variance: 5 },
      population_impacted: { base: 5000, variance: 2000 },
      damage_estimate: { base: 10000000, variance: 5000000 },
      rescue_operations: { base: 30, variance: 20 },
    };

    const { base, variance } = baseValues[metric];

    for (let i = count - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * msPerInterval);
      const value = base + (Math.random() - 0.5) * 2 * variance;
      
      points.push({
        timestamp,
        value: Math.max(0, Math.round(value)),
        label: this.formatTimestamp(timestamp, timeRange),
      });
    }

    return points;
  }

  /**
   * Format timestamp for display
   */
  private formatTimestamp(date: Date, timeRange: TimeRange): string {
    switch (timeRange) {
      case 'hour':
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      case 'day':
        return date.toLocaleTimeString('en-IN', { hour: '2-digit' });
      case 'week':
        return date.toLocaleDateString('en-IN', { weekday: 'short' });
      case 'month':
        return date.toLocaleDateString('en-IN', { day: '2-digit' });
      case 'quarter':
      case 'year':
        return date.toLocaleDateString('en-IN', { month: 'short' });
      default:
        return date.toLocaleDateString('en-IN');
    }
  }

  /**
   * Get alert statistics
   */
  public async getAlertStatistics(timeRange: TimeRange = 'day'): Promise<AlertStatistics> {
    const total = 50 + Math.floor(Math.random() * 100);
    const critical = Math.floor(total * 0.1);
    const high = Math.floor(total * 0.2);
    const medium = Math.floor(total * 0.4);
    const low = total - critical - high - medium;

    return {
      total,
      bySeverity: { critical, high, medium, low },
      byType: {
        flood: Math.floor(total * 0.3),
        fire: Math.floor(total * 0.15),
        earthquake: Math.floor(total * 0.1),
        cyclone: Math.floor(total * 0.15),
        landslide: Math.floor(total * 0.1),
        other: Math.floor(total * 0.2),
      },
      byRegion: [
        { region: 'Kerala', count: Math.floor(total * 0.25) },
        { region: 'Maharashtra', count: Math.floor(total * 0.2) },
        { region: 'Tamil Nadu', count: Math.floor(total * 0.15) },
        { region: 'West Bengal', count: Math.floor(total * 0.15) },
        { region: 'Others', count: Math.floor(total * 0.25) },
      ],
      responseTimeAvg: 10 + Math.random() * 20,
      acknowledged: Math.floor(total * 0.8),
      resolved: Math.floor(total * 0.6),
      active: Math.floor(total * 0.4),
    };
  }

  /**
   * Get resource statistics
   */
  public async getResourceStatistics(): Promise<ResourceStatistics> {
    return {
      totalDeployed: 500 + Math.floor(Math.random() * 300),
      byType: {
        ambulances: 50 + Math.floor(Math.random() * 30),
        fire_trucks: 30 + Math.floor(Math.random() * 20),
        boats: 40 + Math.floor(Math.random() * 25),
        helicopters: 5 + Math.floor(Math.random() * 5),
        relief_trucks: 100 + Math.floor(Math.random() * 50),
        medical_teams: 80 + Math.floor(Math.random() * 40),
      },
      utilization: 60 + Math.random() * 30,
      shortages: [
        { resource: 'Medical Supplies', needed: 1000, available: 600 },
        { resource: 'Drinking Water', needed: 5000, available: 3500 },
        { resource: 'Blankets', needed: 2000, available: 1200 },
      ],
      distribution: [
        { location: 'District A', resources: 150 },
        { location: 'District B', resources: 120 },
        { location: 'District C', resources: 100 },
        { location: 'District D', resources: 80 },
      ],
    };
  }

  /**
   * Get shelter statistics
   */
  public async getShelterStatistics(): Promise<ShelterStatistics> {
    const totalShelters = 50 + Math.floor(Math.random() * 30);
    const totalCapacity = totalShelters * (200 + Math.floor(Math.random() * 100));
    const currentOccupancy = Math.floor(totalCapacity * (0.5 + Math.random() * 0.4));

    return {
      totalShelters,
      totalCapacity,
      currentOccupancy,
      occupancyRate: (currentOccupancy / totalCapacity) * 100,
      byStatus: {
        open: Math.floor(totalShelters * 0.7),
        full: Math.floor(totalShelters * 0.2),
        closed: Math.floor(totalShelters * 0.1),
      },
      byRegion: [
        { region: 'North', shelters: Math.floor(totalShelters * 0.3), occupancy: 75 },
        { region: 'South', shelters: Math.floor(totalShelters * 0.25), occupancy: 85 },
        { region: 'East', shelters: Math.floor(totalShelters * 0.25), occupancy: 60 },
        { region: 'West', shelters: Math.floor(totalShelters * 0.2), occupancy: 70 },
      ],
    };
  }

  /**
   * Get impact assessment
   */
  public async getImpactAssessment(): Promise<ImpactAssessment> {
    return {
      populationAffected: 50000 + Math.floor(Math.random() * 100000),
      areasAffected: 10 + Math.floor(Math.random() * 20),
      infrastructureDamage: {
        roads: 50 + Math.floor(Math.random() * 50),
        bridges: 5 + Math.floor(Math.random() * 10),
        buildings: 200 + Math.floor(Math.random() * 300),
        powerLines: 30 + Math.floor(Math.random() * 40),
      },
      estimatedDamage: 100000000 + Math.floor(Math.random() * 500000000),
      evacuated: 10000 + Math.floor(Math.random() * 20000),
      rescued: 500 + Math.floor(Math.random() * 1000),
      casualties: {
        injured: 100 + Math.floor(Math.random() * 200),
        missing: 20 + Math.floor(Math.random() * 50),
        deceased: 5 + Math.floor(Math.random() * 20),
      },
    };
  }

  /**
   * Analyze trend
   */
  public async analyzeTrend(metric: MetricType, timeRange: TimeRange): Promise<TrendAnalysis> {
    const dataPoints = this.generateDataPoints(metric, timeRange);
    const values = dataPoints.map((dp) => dp.value);
    
    // Simple linear regression for trend
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, i) => sum + i * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const changeRate = (slope / (sumY / n)) * 100;
    
    // Generate predictions
    const predictions: DataPoint[] = [];
    const lastTimestamp = dataPoints[dataPoints.length - 1].timestamp;
    
    for (let i = 1; i <= 5; i++) {
      const futureValue = intercept + slope * (n + i - 1);
      predictions.push({
        timestamp: new Date(lastTimestamp.getTime() + i * 24 * 60 * 60 * 1000),
        value: Math.max(0, Math.round(futureValue)),
        label: `Day +${i}`,
      });
    }

    return {
      metric,
      period: timeRange,
      trend: changeRate > 10 ? 'increasing' : changeRate < -10 ? 'decreasing' : Math.abs(changeRate) < 5 ? 'stable' : 'volatile',
      changeRate: Math.round(changeRate * 10) / 10,
      prediction: predictions,
      confidence: 0.7 + Math.random() * 0.2,
      seasonality: [
        { period: 'Monsoon', impact: 0.4 },
        { period: 'Summer', impact: 0.2 },
      ],
    };
  }

  /**
   * Compare metrics across periods
   */
  public async compareMetrics(
    metric: MetricType,
    currentPeriod: TimeRange,
    previousPeriod: TimeRange
  ): Promise<ComparisonData> {
    const currentData = await this.getMetric(metric, currentPeriod, 'sum');
    const previousData = await this.getMetric(metric, previousPeriod, 'sum');

    const change = currentData.value - previousData.value;
    const changePercentage = (change / previousData.value) * 100;

    return {
      metric,
      current: { period: currentPeriod, value: currentData.value },
      previous: { period: previousPeriod, value: previousData.value },
      change,
      changePercentage: Math.round(changePercentage * 10) / 10,
      historicalAvg: (currentData.value + previousData.value) / 2,
    };
  }

  /**
   * Get dashboard
   */
  public getDashboard(dashboardId: string = 'default'): DashboardLayout | undefined {
    return this.dashboards.get(dashboardId);
  }

  /**
   * Get all dashboards
   */
  public getAllDashboards(): DashboardLayout[] {
    return Array.from(this.dashboards.values());
  }

  /**
   * Create dashboard
   */
  public createDashboard(name: string, description?: string): DashboardLayout {
    const id = `dashboard-${Date.now()}`;
    const dashboard: DashboardLayout = {
      id,
      name,
      description,
      widgets: [],
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.dashboards.set(id, dashboard);
    return dashboard;
  }

  /**
   * Add widget to dashboard
   */
  public addWidget(dashboardId: string, widget: Omit<DashboardWidget, 'id'>): DashboardWidget | null {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    const newWidget: DashboardWidget = {
      ...widget,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    };

    dashboard.widgets.push(newWidget);
    dashboard.updatedAt = new Date();
    this.notifyListeners(dashboard);

    return newWidget;
  }

  /**
   * Remove widget from dashboard
   */
  public removeWidget(dashboardId: string, widgetId: string): boolean {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return false;

    const index = dashboard.widgets.findIndex((w) => w.id === widgetId);
    if (index === -1) return false;

    dashboard.widgets.splice(index, 1);
    dashboard.updatedAt = new Date();
    this.notifyListeners(dashboard);

    return true;
  }

  /**
   * Update widget
   */
  public updateWidget(
    dashboardId: string,
    widgetId: string,
    updates: Partial<DashboardWidget>
  ): DashboardWidget | null {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    const widget = dashboard.widgets.find((w) => w.id === widgetId);
    if (!widget) return null;

    Object.assign(widget, updates);
    dashboard.updatedAt = new Date();
    this.notifyListeners(dashboard);

    return widget;
  }

  /**
   * Generate report
   */
  public async generateReport(definition: ReportDefinition): Promise<Blob> {
    const reportData: Record<string, unknown> = {
      title: definition.name,
      description: definition.description,
      generatedAt: new Date().toISOString(),
      timeRange: definition.timeRange,
      metrics: {},
    };

    for (const metric of definition.metrics) {
      const data = await this.getMetric(metric, definition.timeRange, 'sum');
      (reportData.metrics as Record<string, unknown>)[metric] = data;
    }

    // Add statistics
    reportData.alertStatistics = await this.getAlertStatistics(definition.timeRange);
    reportData.resourceStatistics = await this.getResourceStatistics();
    reportData.shelterStatistics = await this.getShelterStatistics();
    reportData.impactAssessment = await this.getImpactAssessment();

    const content = JSON.stringify(reportData, null, 2);
    return new Blob([content], { type: 'application/json' });
  }

  /**
   * Export dashboard data
   */
  public async exportDashboardData(dashboardId: string): Promise<string> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error('Dashboard not found');

    const data: Record<string, unknown> = {
      dashboard: {
        id: dashboard.id,
        name: dashboard.name,
        exportedAt: new Date().toISOString(),
      },
      widgets: {},
    };

    for (const widget of dashboard.widgets) {
      const widgetData: Record<string, unknown> = { title: widget.title, metrics: {} };
      
      for (const metric of widget.metrics) {
        const metricData = await this.getMetric(metric, widget.timeRange, 'sum');
        (widgetData.metrics as Record<string, unknown>)[metric] = metricData;
      }
      
      (data.widgets as Record<string, unknown>)[widget.id] = widgetData;
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * Get color palette
   */
  public getColorPalette(): typeof COLOR_PALETTE {
    return COLOR_PALETTE;
  }

  /**
   * Subscribe to dashboard updates
   */
  public subscribe(callback: (dashboard: DashboardLayout) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  /**
   * Notify listeners
   */
  private notifyListeners(dashboard: DashboardLayout): void {
    this.listeners.forEach((callback) => callback(dashboard));
  }

  /**
   * Format number for display
   */
  public formatNumber(value: number): string {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)} Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(1)} L`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)} K`;
    return value.toFixed(0);
  }

  /**
   * Format currency
   */
  public formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }
}

export const analyticsService = AnalyticsService.getInstance();
export type {
  TimeRange,
  MetricType,
  ChartType,
  DashboardWidget,
  WidgetConfig,
  WidgetFilter,
  DataPoint,
  AggregatedMetric,
  DashboardLayout,
  ReportDefinition,
  AlertStatistics,
  ResourceStatistics,
  ShelterStatistics,
  ImpactAssessment,
  TrendAnalysis,
  ComparisonData,
};
