import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { AlertTriangle, TrendingUp, Shield, Activity } from 'lucide-react';
import InteractiveGlobe from '../ThreeD/InteractiveGlobe';

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

const glowPulse = keyframes`
  0%, 100% { 
    box-shadow: 
      0 0 20px rgba(239, 68, 68, 0.4),
      0 0 40px rgba(239, 68, 68, 0.2),
      0 0 60px rgba(239, 68, 68, 0.1);
  }
  50% { 
    box-shadow: 
      0 0 30px rgba(239, 68, 68, 0.6),
      0 0 60px rgba(239, 68, 68, 0.4),
      0 0 90px rgba(239, 68, 68, 0.2);
  }
`;

// Main Hero Container
const HeroContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 900px;
  min-height: 600px;
  background: linear-gradient(135deg, #1a1b23 0%, #25262f 100%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 80px rgba(239, 68, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  overflow: hidden;
  padding: 32px;
  ${css`animation: ${fadeIn} 0.6s ease-out;`}
  
  /* Animated background gradient */
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
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    min-height: 500px;
    padding: 24px;
  }
`;

// Content Layout
const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  height: 100%;
`;

// Risk Overlay - Positioned at top
const RiskOverlay = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

// Compact Risk Score Circle
const RiskScoreCircle = styled.div<{ $risk: number }>`
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${({ $risk }) => $risk >= 7 ? glowPulse : 'none'} 2s ease-in-out infinite;
  
  @media (max-width: 768px) {
    width: 140px;
    height: 140px;
  }
`;

const CircleSvg = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  transform: rotate(-90deg);
  filter: drop-shadow(0 0 20px currentColor);
`;

const CircleBackground = styled.circle`
  fill: none;
  stroke: rgba(255, 255, 255, 0.05);
  stroke-width: 10;
`;

const CircleProgress = styled.circle<{ $risk: number }>`
  fill: none;
  stroke-width: 10;
  stroke-linecap: round;
  stroke: ${({ $risk }) => {
    if ($risk >= 7) return 'url(#highRiskGradient)';
    if ($risk >= 4) return 'url(#moderateRiskGradient)';
    return 'url(#lowRiskGradient)';
  }};
  stroke-dasharray: ${2 * Math.PI * 70};
  stroke-dashoffset: ${({ $risk }) => {
    const circumference = 2 * Math.PI * 70;
    return circumference - ($risk / 10) * circumference;
  }};
  transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1),
              stroke 0.3s ease;
  ${css`animation: ${pulseRing} 3s ease-in-out infinite;`}
`;

const ScoreDisplay = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
`;

const ScoreNumber = styled.div<{ $risk: number }>`
  font-size: 48px;
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
`;

const ScoreLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 4px;
`;

// Risk Status Badge
const RiskStatusBadge = styled.div<{ $risk: number }>`
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
  ${css`animation: ${fadeIn} 0.8s ease-out 0.2s both;`}
  
  svg {
    width: 20px;
    height: 20px;
    color: ${({ $risk }) => {
      if ($risk >= 7) return '#EF4444';
      if ($risk >= 4) return '#F59E0B';
      return '#22C55E';
    }};
  }
`;

const RiskStatusText = styled.div<{ $risk: number }>`
  font-size: 16px;
  font-weight: 700;
  color: ${({ $risk }) => {
    if ($risk >= 7) return '#EF4444';
    if ($risk >= 4) return '#F59E0B';
    return '#22C55E';
  }};
  white-space: nowrap;
`;

// Risk Description
const RiskDescription = styled.div`
  text-align: center;
  max-width: 600px;
  padding: 0 16px;
  ${css`animation: ${fadeIn} 0.8s ease-out 0.3s both;`}
`;

const RiskDescTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const RiskDescText = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

// Globe Container
const GlobeWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    height: 350px;
  }
  
  @media (max-width: 480px) {
    height: 300px;
  }
`;

// Live Data Indicator
const LiveIndicator = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(10, 11, 15, 0.8);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  z-index: 10;
  ${css`animation: ${fadeIn} 0.8s ease-out 0.5s both;`}
`;

const PulseDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #EF4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
  ${css`animation: ${pulseRing} 2s ease-in-out infinite;`}
`;

const LiveText = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
`;

// Component
interface GlobeRiskHeroProps {
  score: number;
  isCalculating?: boolean;
  alerts?: any[];
  className?: string;
}

export const GlobeRiskHero: React.FC<GlobeRiskHeroProps> = ({ 
  score, 
  isCalculating = false,
  alerts = [],
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
      text: 'Multiple severe factors elevating risk significantly. Immediate attention and preparation recommended.'
    };
    if (risk >= 7) return {
      title: 'Elevated Global Risk Level',
      text: 'Weather and incident factors raising risk levels. Monitor conditions closely and review safety protocols.'
    };
    if (risk >= 4) return {
      title: 'Moderate Risk Conditions',
      text: 'Some factors indicate elevated risk potential. Stay informed and maintain normal preparedness.'
    };
    return {
      title: 'Low Risk Environment',
      text: 'Current conditions show minimal disaster risk. Continue normal activities with standard awareness.'
    };
  };

  const riskLevel = getRiskLevel(score);
  const riskDesc = getRiskDescription(score);
  const RiskIcon = riskLevel.icon;

  return (
    <HeroContainer className={className}>
      <HeroContent>
        {/* Live Indicator */}
        <LiveIndicator>
          <PulseDot />
          <LiveText>Live Data</LiveText>
        </LiveIndicator>

        {/* Risk Score Overlay at Top */}
        <RiskOverlay>
          {/* Circular Risk Score */}
          <RiskScoreCircle $risk={score}>
            <CircleSvg width="160" height="160" viewBox="0 0 160 160">
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
              <CircleBackground cx="80" cy="80" r="70" />
              <CircleProgress cx="80" cy="80" r="70" $risk={score} />
            </CircleSvg>
            <ScoreDisplay>
              <ScoreNumber $risk={score}>
                {isCalculating ? '—' : score.toFixed(1)}
              </ScoreNumber>
              <ScoreLabel>Risk Score</ScoreLabel>
            </ScoreDisplay>
          </RiskScoreCircle>

          {/* Risk Status Badge */}
          <RiskStatusBadge $risk={score}>
            <RiskIcon />
            <RiskStatusText $risk={score}>{riskLevel.label}</RiskStatusText>
          </RiskStatusBadge>
        </RiskOverlay>

        {/* Risk Description */}
        <RiskDescription>
          <RiskDescTitle>{riskDesc.title}</RiskDescTitle>
          <RiskDescText>{riskDesc.text}</RiskDescText>
        </RiskDescription>

        {/* Interactive Globe */}
        <GlobeWrapper>
          <InteractiveGlobe 
            riskScore={score}
            alerts={alerts} 
            width={600}
            height={450}
          />
        </GlobeWrapper>
      </HeroContent>
    </HeroContainer>
  );
};

export default GlobeRiskHero;
