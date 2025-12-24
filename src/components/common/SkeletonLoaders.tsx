import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { productionColors } from '../../styles/production-ui-system';

// Shimmer animation
const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

// Base skeleton element
const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    ${productionColors.background.secondary} 0%,
    ${productionColors.background.tertiary} 50%,
    ${productionColors.background.secondary} 100%
  );
  background-size: 1000px 100%;
  ${css`animation: ${shimmer} 2s infinite linear;`}
  border-radius: 8px;
`;

// Skeleton for Risk Score Panel
const SkeletonRiskContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  background: linear-gradient(135deg, #1a1b23 0%, #25262f 100%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  gap: 24px;
`;

const SkeletonCircle = styled(SkeletonBase)`
  width: 280px;
  height: 280px;
  border-radius: 50%;
`;

const SkeletonRiskBadge = styled(SkeletonBase)`
  width: 180px;
  height: 48px;
  border-radius: 16px;
`;

const SkeletonText = styled(SkeletonBase)<{ width?: string; height?: string }>`
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height || '16px'};
`;

export const SkeletonRiskScore: React.FC = () => (
  <SkeletonRiskContainer>
    <SkeletonCircle />
    <SkeletonRiskBadge />
    <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <SkeletonText height="20px" />
      <SkeletonText height="16px" width="90%" />
    </div>
  </SkeletonRiskContainer>
);

// Skeleton for Weather Widget
const SkeletonWeatherContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 32px;
  padding: 32px;
  background: linear-gradient(135deg, #1a1b23 0%, #25262f 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const SkeletonWeatherLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
`;

const SkeletonWeatherIcon = styled(SkeletonBase)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
`;

const SkeletonWeatherRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SkeletonMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const SkeletonMetricCard = styled(SkeletonBase)`
  height: 80px;
  border-radius: 12px;
`;

export const SkeletonWeatherWidget: React.FC = () => (
  <SkeletonWeatherContainer>
    <SkeletonWeatherLeft>
      <SkeletonWeatherIcon />
      <SkeletonText width="120px" height="56px" />
      <SkeletonText width="150px" height="20px" />
      <SkeletonText width="180px" height="32px" />
    </SkeletonWeatherLeft>
    
    <SkeletonWeatherRight>
      <SkeletonMetricsGrid>
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
      </SkeletonMetricsGrid>
      <SkeletonText height="100px" />
    </SkeletonWeatherRight>
  </SkeletonWeatherContainer>
);

// Skeleton for Dashboard Cards
const SkeletonCardContainer = styled.div`
  background: linear-gradient(135deg, #16181D 0%, #1C1F26 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const SkeletonCard: React.FC<{ lines?: number }> = ({ lines = 5 }) => (
  <SkeletonCardContainer>
    <SkeletonText height="24px" width="60%" />
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonText 
        key={i} 
        height="16px" 
        width={`${Math.random() * 30 + 60}%`} 
      />
    ))}
  </SkeletonCardContainer>
);

// Generic skeleton loader with fade in
const FadeInContainer = styled.div<{ delay?: number }>`
  animation: fadeIn 0.3s ease-out;
  animation-delay: ${({ delay }) => delay || 0}ms;
  animation-fill-mode: both;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const SkeletonLoader: React.FC<{ 
  type?: 'card' | 'weather' | 'risk';
  delay?: number;
}> = ({ type = 'card', delay = 0 }) => (
  <FadeInContainer delay={delay}>
    {type === 'risk' && <SkeletonRiskScore />}
    {type === 'weather' && <SkeletonWeatherWidget />}
    {type === 'card' && <SkeletonCard />}
  </FadeInContainer>
);

export default SkeletonLoader;
