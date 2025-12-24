import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { AlertTriangle, TrendingUp, Shield, Activity } from 'lucide-react';

// Animations
const pulseRing = keyframes`
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const rotateGradient = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Container
const RiskScoreContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  background: linear-gradient(135deg, #1a1b23 0%, #25262f 100%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 80px rgba(239, 68, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
  ${css`animation: ${fadeIn} 0.6s ease-out;`}
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(239, 68, 68, 0.08) 0%, transparent 70%);
    ${css`animation: ${rotateGradient} 20s linear infinite;`}
    pointer-events: none;
  }
`;

// SVG Circle Progress
const CircleContainer = styled.div`
  position: relative;
  width: 280px;
  height: 280px;
  margin-bottom: 32px;
`;

const CircleSvg = styled.svg`
  transform: rotate(-90deg);
  filter: drop-shadow(0 0 20px currentColor);
`;

const CircleBackground = styled.circle`
  fill: none;
  stroke: rgba(255, 255, 255, 0.05);
  stroke-width: 12;
`;

const CircleProgress = styled.circle<{ $risk: number }>`
  fill: none;
  stroke-width: 12;
  stroke-linecap: round;
  stroke: ${({ $risk }) => {
    if ($risk >= 7) return 'url(#highRiskGradient)';
    if ($risk >= 4) return 'url(#moderateRiskGradient)';
    return 'url(#lowRiskGradient)';
  }};
  stroke-dasharray: ${2 * Math.PI * 130};
  stroke-dashoffset: ${({ $risk }) => {
    const circumference = 2 * Math.PI * 130;
    return circumference - ($risk / 10) * circumference;
  }};
  transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1),
              stroke 0.3s ease;
  ${css`animation: ${pulseRing} 3s ease-in-out infinite;`}
`;

// Score Display
const ScoreDisplay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 2;
`;

const ScoreNumber = styled.div<{ $risk: number }>`
  font-size: 72px;
  font-weight: 800;
  line-height: 1;
  background: ${({ $risk }) => {
    if ($risk >= 7) return 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)';
    if ($risk >= 4) return 'linear-gradient(135deg, #F59E0B 0%, #EAB308 100%)';
    return 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)';
  }};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 4px 12px rgba(239, 68, 68, 0.3));
  ${css`animation: ${fadeIn} 0.8s ease-out 0.2s both;`}
`;

const ScoreLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 8px;
  ${css`animation: ${fadeIn} 0.8s ease-out 0.3s both;`}
`;

// Risk Status
const RiskStatus = styled.div<{ $risk: number }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  border-radius: 16px;
  background: ${({ $risk }) => {
    if ($risk >= 7) return 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.15))';
    if ($risk >= 4) return 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 179, 8, 0.15))';
    return 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))';
  }};
  border: 1px solid ${({ $risk }) => {
    if ($risk >= 7) return 'rgba(239, 68, 68, 0.3)';
    if ($risk >= 4) return 'rgba(245, 158, 11, 0.3)';
    return 'rgba(34, 197, 94, 0.3)';
  }};
  box-shadow: ${({ $risk }) => {
    if ($risk >= 7) return '0 8px 24px rgba(239, 68, 68, 0.2)';
    if ($risk >= 4) return '0 8px 24px rgba(245, 158, 11, 0.2)';
    return '0 8px 24px rgba(34, 197, 94, 0.2)';
  }};
  margin-bottom: 24px;
  ${css`animation: ${fadeIn} 0.8s ease-out 0.4s both;`}
  
  svg {
    width: 24px;
    height: 24px;
    color: ${({ $risk }) => {
      if ($risk >= 7) return '#EF4444';
      if ($risk >= 4) return '#F59E0B';
      return '#22C55E';
    }};
  }
`;

const RiskStatusText = styled.div<{ $risk: number }>`
  font-size: 18px;
  font-weight: 700;
  color: ${({ $risk }) => {
    if ($risk >= 7) return '#EF4444';
    if ($risk >= 4) return '#F59E0B';
    return '#22C55E';
  }};
`;

// Description
const RiskDescription = styled.div`
  text-align: center;
  max-width: 500px;
  line-height: 1.6;
  ${css`animation: ${fadeIn} 0.8s ease-out 0.5s both;`}
`;

const RiskDescTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
`;

const RiskDescText = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
`;

// Component
interface GlobalRiskScoreProps {
  score: number;
  isCalculating?: boolean;
  className?: string;
}

export const GlobalRiskScore: React.FC<GlobalRiskScoreProps> = ({ 
  score, 
  isCalculating = false,
  className 
}) => {
  const getRiskLevel = (risk: number) => {
    if (risk >= 8) return { label: 'Critical Risk', icon: AlertTriangle };
    if (risk >= 7) return { label: 'High Risk', icon: TrendingUp };
    if (risk >= 4) return { label: 'Moderate Risk', icon: Activity };
    return { label: 'Low Risk', icon: Shield };
  };

  const getRiskDescription = (risk: number) => {
    if (risk >= 8) return {
      title: 'Critical Disaster Risk Detected',
      text: 'Multiple severe factors are elevating risk significantly. Immediate attention and preparation recommended. Check alerts for specific threats.'
    };
    if (risk >= 7) return {
      title: 'Elevated Global Risk Level',
      text: 'Weather and incident factors are raising risk levels. Monitor conditions closely and review safety protocols. See alerts for details.'
    };
    if (risk >= 4) return {
      title: 'Moderate Risk Conditions',
      text: 'Some factors indicate elevated risk potential. Stay informed of changing conditions and maintain normal preparedness levels.'
    };
    return {
      title: 'Low Risk Environment',
      text: 'Current conditions show minimal disaster risk. Continue normal activities with standard safety awareness.'
    };
  };

  const riskLevel = getRiskLevel(score);
  const riskDesc = getRiskDescription(score);
  const RiskIcon = riskLevel.icon;

  return (
    <RiskScoreContainer className={className}>
      <CircleContainer>
        <CircleSvg width="280" height="280" viewBox="0 0 280 280">
          <defs>
            {/* High Risk Gradient */}
            <linearGradient id="highRiskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
            {/* Moderate Risk Gradient */}
            <linearGradient id="moderateRiskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>
            {/* Low Risk Gradient */}
            <linearGradient id="lowRiskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          <CircleBackground cx="140" cy="140" r="130" />
          <CircleProgress cx="140" cy="140" r="130" $risk={score} />
        </CircleSvg>
        
        <ScoreDisplay>
          <ScoreNumber $risk={score}>
            {isCalculating ? '...' : score.toFixed(1)}
          </ScoreNumber>
          <ScoreLabel>Risk Score</ScoreLabel>
        </ScoreDisplay>
      </CircleContainer>

      <RiskStatus $risk={score}>
        <RiskIcon />
        <RiskStatusText $risk={score}>
          {isCalculating ? 'Calculating...' : riskLevel.label}
        </RiskStatusText>
      </RiskStatus>

      <RiskDescription>
        <RiskDescTitle>{riskDesc.title}</RiskDescTitle>
        <RiskDescText>{riskDesc.text}</RiskDescText>
      </RiskDescription>
    </RiskScoreContainer>
  );
};

export default GlobalRiskScore;
