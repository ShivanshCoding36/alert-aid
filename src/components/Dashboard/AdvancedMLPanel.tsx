/**
 * AdvancedMLPanel Component
 * Displays ensemble ML predictions, anomaly detection, and smart alerts
 * Showcases LSTM, XGBoost, GNN models for hackathon judges
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { advancedMLApi, FloodPredictionResponse, AnomalyResponse, SmartAlertResponse, ModelStatus } from '../../services/advancedMLApi';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const PanelContainer = styled.div`
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%);
  border-radius: 20px;
  padding: 24px;
  color: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  ${css`animation: ${fadeIn} 0.5s ease-out;`}
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const RefreshButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
`;

const CardTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
`;

const ModelBadge = styled.span<{ $type: string }>`
  background: ${props => {
    const colors: Record<string, string> = {
      lstm: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      xgboost: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      gnn: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      ensemble: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    };
    return colors[props.$type] || colors.ensemble;
  }};
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RiskGauge = styled.div`
  position: relative;
  width: 100%;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const GaugeCircle = styled.div<{ $probability: number; $riskLevel: string }>`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: conic-gradient(
    ${props => {
      const colors: Record<string, string> = {
        'Critical': '#ff4757',
        'High': '#ff6b35',
        'Moderate': '#ffa502',
        'Low': '#2ed573',
      };
      return colors[props.$riskLevel] || colors.Low;
    }} ${props => props.$probability * 360}deg,
    rgba(255, 255, 255, 0.1) 0deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '';
    width: 70px;
    height: 70px;
    background: rgba(26, 26, 46, 0.95);
    border-radius: 50%;
    position: absolute;
  }
`;

const GaugeValue = styled.span`
  position: relative;
  font-size: 24px;
  font-weight: 700;
  z-index: 1;
`;

const GaugeLabel = styled.span`
  margin-top: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

const ModelOutputs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ModelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

const ModelName = styled.span`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
`;

const ModelValue = styled.span<{ $highlight?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$highlight ? '#4facfe' : '#fff'};
`;

const ProgressBar = styled.div`
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  width: 100%;
  margin-top: 8px;
`;

const ProgressFill = styled.div<{ $value: number; $color: string }>`
  height: 100%;
  width: ${props => props.$value * 100}%;
  background: ${props => props.$color};
  transition: width 0.5s ease;
`;

const AlertBox = styled.div<{ $severity: string }>`
  background: ${props => {
    const colors: Record<string, string> = {
      critical: 'rgba(255, 71, 87, 0.2)',
      severe: 'rgba(255, 107, 53, 0.2)',
      warning: 'rgba(255, 165, 2, 0.2)',
      watch: 'rgba(46, 213, 115, 0.2)',
      info: 'rgba(100, 100, 100, 0.2)',
    };
    return colors[props.$severity] || colors.info;
  }};
  border-left: 4px solid ${props => {
    const colors: Record<string, string> = {
      critical: '#ff4757',
      severe: '#ff6b35',
      warning: '#ffa502',
      watch: '#2ed573',
      info: '#666',
    };
    return colors[props.$severity] || colors.info;
  }};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
`;

const AlertTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 15px;
`;

const AlertDescription = styled.p`
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
`;

const InstructionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 12px 0 0 0;
`;

const InstructionItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 13px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const AnomalyIndicator = styled.div<{ $score: number }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${props => {
    if (props.$score > 0.7) return 'rgba(255, 71, 87, 0.2)';
    if (props.$score > 0.5) return 'rgba(255, 165, 2, 0.2)';
    return 'rgba(46, 213, 115, 0.2)';
  }};
  border-radius: 8px;
`;

const StatusDot = styled.span<{ $active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.$active ? '#2ed573' : '#ff4757'};
  ${props => props.$active && css`animation: ${pulse} 2s ease infinite;`}
`;

const SMSPreview = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  font-family: monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  white-space: pre-wrap;
  word-break: break-word;
`;

const Loading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);
`;

const ErrorMessage = styled.div`
  background: rgba(255, 71, 87, 0.2);
  border: 1px solid #ff4757;
  border-radius: 8px;
  padding: 16px;
  color: #ff4757;
  text-align: center;
`;

const HorizonPredictions = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
`;

const HorizonItem = styled.div`
  text-align: center;
`;

const HorizonTime = styled.span`
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
`;

const HorizonValue = styled.span<{ $value: number }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => {
    if (props.$value > 0.7) return '#ff4757';
    if (props.$value > 0.5) return '#ffa502';
    return '#2ed573';
  }};
`;

const FeatureAnomalies = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 12px;
`;

const FeatureItem = styled.div<{ $score: number }>`
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  font-size: 11px;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    background: ${props => {
      if (props.$score > 0.5) return '#ff4757';
      if (props.$score > 0.3) return '#ffa502';
      return '#2ed573';
    }};
  }
`;

// Props
interface AdvancedMLPanelProps {
  latitude: number;
  longitude: number;
  district?: string;
  state?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// Component
const AdvancedMLPanel: React.FC<AdvancedMLPanelProps> = ({
  latitude,
  longitude,
  district = 'Unknown',
  state = 'Unknown',
  autoRefresh = false,
  refreshInterval = 60000,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<FloodPredictionResponse | null>(null);
  const [anomaly, setAnomaly] = useState<AnomalyResponse | null>(null);
  const [alert, setAlert] = useState<SmartAlertResponse | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const location = { latitude, longitude, district, state };
      
      const [predResponse, anomResponse, alertResponse, statusResponse] = await Promise.all([
        advancedMLApi.getEnsemblePrediction(location),
        advancedMLApi.getAnomalyDetection(latitude, longitude),
        advancedMLApi.getSmartAlert(location),
        advancedMLApi.getModelStatus(),
      ]);

      setPrediction(predResponse);
      setAnomaly(anomResponse);
      setAlert(alertResponse);
      setModelStatus(statusResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ML data');
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, district, state]);

  useEffect(() => {
    fetchData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, autoRefresh, refreshInterval]);

  if (loading) {
    return (
      <PanelContainer>
        <Loading>🔄 Loading ML Analysis...</Loading>
      </PanelContainer>
    );
  }

  if (error) {
    return (
      <PanelContainer>
        <ErrorMessage>❌ {error}</ErrorMessage>
        <RefreshButton onClick={fetchData} style={{ marginTop: 16 }}>
          Retry
        </RefreshButton>
      </PanelContainer>
    );
  }

  const ensemblePred = prediction?.prediction.ensemble_prediction;
  const modelOutputs = prediction?.prediction.model_outputs;
  const anomalyResult = anomaly?.anomaly_result;
  const alertData = alert?.alert;

  return (
    <PanelContainer>
      <Header>
        <Title>🤖 Advanced ML Analysis</Title>
        <RefreshButton onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : '🔄 Refresh'}
        </RefreshButton>
      </Header>

      <Grid>
        {/* Ensemble Prediction Card */}
        <Card>
          <CardTitle>
            📊 Ensemble Flood Prediction
            <ModelBadge $type="ensemble">ENSEMBLE</ModelBadge>
          </CardTitle>
          
          <RiskGauge>
            <GaugeCircle
              $probability={ensemblePred?.flood_probability || 0}
              $riskLevel={ensemblePred?.risk_level || 'Low'}
            >
              <GaugeValue>
                {((ensemblePred?.flood_probability || 0) * 100).toFixed(0)}%
              </GaugeValue>
            </GaugeCircle>
            <GaugeLabel>
              {ensemblePred?.risk_level || 'Low'} Risk · {((ensemblePred?.confidence || 0) * 100).toFixed(0)}% Confidence
            </GaugeLabel>
          </RiskGauge>

          <HorizonPredictions>
            <HorizonItem>
              <HorizonTime>6 Hours</HorizonTime>
              <HorizonValue $value={ensemblePred?.predictions_by_horizon?.['6h'] || 0}>
                {((ensemblePred?.predictions_by_horizon?.['6h'] || 0) * 100).toFixed(0)}%
              </HorizonValue>
            </HorizonItem>
            <HorizonItem>
              <HorizonTime>12 Hours</HorizonTime>
              <HorizonValue $value={ensemblePred?.predictions_by_horizon?.['12h'] || 0}>
                {((ensemblePred?.predictions_by_horizon?.['12h'] || 0) * 100).toFixed(0)}%
              </HorizonValue>
            </HorizonItem>
            <HorizonItem>
              <HorizonTime>24 Hours</HorizonTime>
              <HorizonValue $value={ensemblePred?.predictions_by_horizon?.['24h'] || 0}>
                {((ensemblePred?.predictions_by_horizon?.['24h'] || 0) * 100).toFixed(0)}%
              </HorizonValue>
            </HorizonItem>
          </HorizonPredictions>
        </Card>

        {/* Individual Model Outputs */}
        <Card>
          <CardTitle>🧠 Model Breakdown</CardTitle>
          <ModelOutputs>
            <ModelRow>
              <ModelName>
                <ModelBadge $type="lstm">LSTM</ModelBadge> Time-Series
              </ModelName>
              <ModelValue $highlight>
                {((modelOutputs?.lstm?.predictions?.['24h'] || 0) * 100).toFixed(0)}%
              </ModelValue>
            </ModelRow>
            <ProgressBar>
              <ProgressFill
                $value={modelOutputs?.lstm?.predictions?.['24h'] || 0}
                $color="linear-gradient(90deg, #f093fb, #f5576c)"
              />
            </ProgressBar>

            <ModelRow>
              <ModelName>
                <ModelBadge $type="xgboost">XGBoost</ModelBadge> Risk Class
              </ModelName>
              <ModelValue>
                {modelOutputs?.xgboost?.risk_class || 'Low'}
              </ModelValue>
            </ModelRow>
            <ProgressBar>
              <ProgressFill
                $value={modelOutputs?.xgboost?.risk_score || 0}
                $color="linear-gradient(90deg, #4facfe, #00f2fe)"
              />
            </ProgressBar>

            <ModelRow>
              <ModelName>
                <ModelBadge $type="gnn">GNN</ModelBadge> Propagation
              </ModelName>
              <ModelValue $highlight>
                {((modelOutputs?.gnn?.propagation_probability || 0) * 100).toFixed(0)}%
              </ModelValue>
            </ModelRow>
            <ProgressBar>
              <ProgressFill
                $value={modelOutputs?.gnn?.propagation_probability || 0}
                $color="linear-gradient(90deg, #43e97b, #38f9d7)"
              />
            </ProgressBar>
          </ModelOutputs>
        </Card>

        {/* Anomaly Detection */}
        <Card>
          <CardTitle>🔍 Anomaly Detection</CardTitle>
          
          <AnomalyIndicator $score={anomalyResult?.combined_anomaly_score || 0}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>
                {((anomalyResult?.combined_anomaly_score || 0) * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                Anomaly Score
              </div>
            </div>
            <div style={{ 
              padding: '8px 16px', 
              borderRadius: 20, 
              background: 'rgba(0,0,0,0.3)',
              textTransform: 'uppercase',
              fontSize: 12,
              fontWeight: 700
            }}>
              {anomalyResult?.alert_level || 'normal'}
            </div>
          </AnomalyIndicator>

          {anomalyResult?.early_warnings && anomalyResult.early_warnings.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}>
                ⚡ Early Warning Signals
              </div>
              {anomalyResult.early_warnings.map((warning, idx) => (
                <div key={idx} style={{
                  padding: '8px 12px',
                  background: 'rgba(255, 165, 2, 0.15)',
                  borderRadius: 6,
                  marginBottom: 6,
                  fontSize: 12
                }}>
                  {warning.message}
                </div>
              ))}
            </div>
          )}

          <FeatureAnomalies>
            {anomalyResult?.isolation_forest?.feature_scores && Object.entries(anomalyResult.isolation_forest.feature_scores).map(([feature, data]) => (
              <FeatureItem key={feature} $score={(data as any).score || 0}>
                {feature}: {(((data as any).score || 0) * 100).toFixed(0)}%
              </FeatureItem>
            ))}
          </FeatureAnomalies>
        </Card>

        {/* Smart Alert */}
        <Card>
          <CardTitle>🚨 Smart Alert</CardTitle>
          
          {alertData && (
            <>
              <AlertBox $severity={alertData.severity || 'Low'}>
                <AlertTitle>{alertData.title || 'No Alert'}</AlertTitle>
                <AlertDescription>{alertData.description || 'No active alerts at this time.'}</AlertDescription>
              </AlertBox>

              {alertData.instructions && alertData.instructions.length > 0 && (
                <>
                  <div style={{ fontSize: 13, marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}>
                    📋 Recommended Actions
                  </div>
                  <InstructionList>
                    {alertData.instructions.slice(0, 4).map((inst, idx) => (
                      <InstructionItem key={idx}>
                        <span>{inst.icon}</span>
                        <span>{inst.action}</span>
                      </InstructionItem>
                    ))}
                  </InstructionList>
                </>
              )}

              {alertData.sms_payload && (
                <>
                  <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                    📱 SMS Alert Preview
                  </div>
                  <SMSPreview>{alertData.sms_payload}</SMSPreview>
                </>
              )}
            </>
          )}
          
          {!alertData && (
            <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '20px' }}>
              No alert data available
            </div>
          )}
        </Card>

        {/* Model Status */}
        <Card>
          <CardTitle>⚙️ ML System Status</CardTitle>
          
          {modelStatus && (
            <ModelOutputs>
              <ModelRow>
                <ModelName>Ensemble Predictor</ModelName>
                <StatusDot $active={modelStatus.models.ensemble_predictor.status === 'active'} />
              </ModelRow>
              <ModelRow>
                <ModelName>Anomaly Detector</ModelName>
                <StatusDot $active={modelStatus.models.anomaly_detector.status === 'active'} />
              </ModelRow>
              <ModelRow>
                <ModelName>Smart Alert Engine</ModelName>
                <StatusDot $active={modelStatus.models.smart_alert_engine.status === 'active'} />
              </ModelRow>
              <ModelRow>
                <ModelName>Active Alerts</ModelName>
                <ModelValue>{modelStatus.models.smart_alert_engine.active_alerts}</ModelValue>
              </ModelRow>
            </ModelOutputs>
          )}

          <div style={{ 
            marginTop: 16, 
            padding: 12, 
            background: 'rgba(102, 126, 234, 0.1)', 
            borderRadius: 8,
            fontSize: 11,
            color: 'rgba(255,255,255,0.6)'
          }}>
            ℹ️ Using simulated ML models for hackathon demo. Production would use TensorFlow/PyTorch trained models.
          </div>
        </Card>

        {/* AI Reasoning */}
        <Card>
          <CardTitle>💡 AI Reasoning</CardTitle>
          <div style={{ 
            fontSize: 13, 
            lineHeight: 1.6, 
            color: 'rgba(255,255,255,0.8)',
            background: 'rgba(0,0,0,0.2)',
            padding: 16,
            borderRadius: 8
          }}>
            {prediction?.prediction.reasoning || 'No reasoning available'}
          </div>
          
          {prediction?.prediction.recommended_actions && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}>
                🎯 AI Recommendations
              </div>
              {prediction.prediction.recommended_actions.map((action, idx) => (
                <div key={idx} style={{
                  padding: '8px 12px',
                  background: 'rgba(102, 126, 234, 0.15)',
                  borderRadius: 6,
                  marginBottom: 6,
                  fontSize: 12,
                  borderLeft: '3px solid #667eea'
                }}>
                  {action}
                </div>
              ))}
            </div>
          )}
        </Card>
      </Grid>
    </PanelContainer>
  );
};

export default AdvancedMLPanel;
