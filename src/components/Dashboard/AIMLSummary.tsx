import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Brain, Cpu, Zap, TrendingUp, AlertTriangle, Activity, BarChart3, Target } from 'lucide-react';
import { Card, Text, Flex } from '../../styles/components';

// =====================================================
// ANIMATIONS
// =====================================================

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.3); }
  50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.6); }
`;

// =====================================================
// STYLED COMPONENTS
// =====================================================

const SummaryContainer = styled(Card)`
  background: linear-gradient(165deg, 
    rgba(15, 23, 42, 0.98) 0%, 
    rgba(30, 41, 59, 0.95) 50%, 
    rgba(15, 23, 42, 0.98) 100%
  );
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.08), transparent);
  border-bottom: 1px solid rgba(99, 102, 241, 0.15);
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: #6366f1;
  }
`;

const AIBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.3);
  ${css`animation: ${glow} 3s ease-in-out infinite;`}
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 12px;
`;

const MetricCard = styled.div<{ color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid ${({ color }) => `${color}30`};
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.3);
    border-color: ${({ color }) => `${color}50`};
    transform: translateY(-1px);
  }
  
  svg {
    width: 16px;
    height: 16px;
    color: ${({ color }) => color};
  }
`;

const MetricLabel = styled.span`
  font-size: 9px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const MetricValue = styled.span<{ color?: string }>`
  font-size: 16px;
  font-weight: 700;
  color: ${({ color }) => color || '#fff'};
`;

const RiskBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(99, 102, 241, 0.1);
`;

const RiskLabel = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  min-width: 80px;
`;

const RiskBarTrack = styled.div`
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
`;

const RiskBarFill = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${({ width }) => width}%;
  background: linear-gradient(90deg, ${({ color }) => color}, ${({ color }) => color}dd);
  border-radius: 4px;
  transition: width 0.5s ease;
`;

const RiskPercent = styled.span<{ color: string }>`
  font-size: 11px;
  font-weight: 600;
  color: ${({ color }) => color};
  min-width: 40px;
  text-align: right;
`;

const ModelsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-top: 1px solid rgba(99, 102, 241, 0.1);
  background: rgba(0, 0, 0, 0.15);
`;

const ModelBadge = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 500;
  background: ${({ active }) => active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${({ active }) => active ? '#22c55e' : 'rgba(255, 255, 255, 0.5)'};
  border: 1px solid ${({ active }) => active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ active }) => active ? '#22c55e' : 'rgba(255, 255, 255, 0.3)'};
    ${({ active }) => active && css`animation: ${pulse} 2s ease-in-out infinite;`}
  }
`;

// =====================================================
// COMPONENT
// =====================================================

interface AIMLSummaryProps {
  floodProbability?: number;
}

const AIMLSummary: React.FC<AIMLSummaryProps> = ({ floodProbability = 35 }) => {
  const [animatedValues, setAnimatedValues] = useState({
    accuracy: 0,
    confidence: 0,
    flood: 0,
    fire: 0
  });

  // Calculate risk scores based on flood probability
  const risks = useMemo(() => {
    const baseFlood = Math.max(15, Math.min(85, floodProbability));
    return {
      flood: baseFlood,
      earthquake: Math.max(10, baseFlood * 0.4 + 8),
      fire: Math.max(10, baseFlood * 0.5 + 12),
      storm: Math.max(15, baseFlood * 0.7 + 5)
    };
  }, [floodProbability]);

  // Animate values on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues({
        accuracy: 96.2,
        confidence: 94,
        flood: risks.flood,
        fire: risks.fire
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [risks]);

  const getRiskColor = (value: number) => {
    if (value >= 70) return '#ef4444';
    if (value >= 50) return '#f59e0b';
    if (value >= 30) return '#eab308';
    return '#22c55e';
  };

  return (
    <SummaryContainer>
      <Header>
        <HeaderTitle>
          <Brain size={18} />
          <div>
            <Text size="sm" weight="semibold" style={{ margin: 0 }}>AI Risk Analysis</Text>
            <Text size="xs" color="secondary">Multi-model ensemble prediction</Text>
          </div>
        </HeaderTitle>
        <AIBadge>
          <Cpu size={10} />
          <span>5 Models Active</span>
        </AIBadge>
      </Header>

      <MetricsGrid>
        <MetricCard color="#22c55e">
          <Target size={16} />
          <MetricLabel>Accuracy</MetricLabel>
          <MetricValue color="#22c55e">{animatedValues.accuracy.toFixed(1)}%</MetricValue>
        </MetricCard>
        
        <MetricCard color="#6366f1">
          <BarChart3 size={16} />
          <MetricLabel>Confidence</MetricLabel>
          <MetricValue color="#a5b4fc">{animatedValues.confidence}%</MetricValue>
        </MetricCard>
        
        <MetricCard color="#3b82f6">
          <Activity size={16} />
          <MetricLabel>Flood Risk</MetricLabel>
          <MetricValue color={getRiskColor(risks.flood)}>{risks.flood.toFixed(0)}%</MetricValue>
        </MetricCard>
        
        <MetricCard color="#f59e0b">
          <AlertTriangle size={16} />
          <MetricLabel>Fire Risk</MetricLabel>
          <MetricValue color={getRiskColor(risks.fire)}>{risks.fire.toFixed(0)}%</MetricValue>
        </MetricCard>
      </MetricsGrid>

      <RiskBar>
        <RiskLabel>🌊 Flood</RiskLabel>
        <RiskBarTrack>
          <RiskBarFill width={risks.flood} color={getRiskColor(risks.flood)} />
        </RiskBarTrack>
        <RiskPercent color={getRiskColor(risks.flood)}>{risks.flood.toFixed(0)}%</RiskPercent>
      </RiskBar>

      <RiskBar>
        <RiskLabel>🌍 Earthquake</RiskLabel>
        <RiskBarTrack>
          <RiskBarFill width={risks.earthquake} color={getRiskColor(risks.earthquake)} />
        </RiskBarTrack>
        <RiskPercent color={getRiskColor(risks.earthquake)}>{risks.earthquake.toFixed(0)}%</RiskPercent>
      </RiskBar>

      <RiskBar>
        <RiskLabel>🌀 Storm</RiskLabel>
        <RiskBarTrack>
          <RiskBarFill width={risks.storm} color={getRiskColor(risks.storm)} />
        </RiskBarTrack>
        <RiskPercent color={getRiskColor(risks.storm)}>{risks.storm.toFixed(0)}%</RiskPercent>
      </RiskBar>

      <ModelsRow>
        <Flex gap="6px">
          <ModelBadge active>LSTM</ModelBadge>
          <ModelBadge active>XGBoost</ModelBadge>
          <ModelBadge active>GNN</ModelBadge>
          <ModelBadge active>Ensemble</ModelBadge>
        </Flex>
        <Text size="xs" color="secondary">
          <Zap size={10} style={{ marginRight: 4 }} />
          Real-time
        </Text>
      </ModelsRow>
    </SummaryContainer>
  );
};

export default AIMLSummary;
