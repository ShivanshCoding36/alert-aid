import React from 'react';
import styled, { keyframes, css } from 'styled-components';

// Enhanced Skeleton Loading Animations
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.6;
  }
`;

const wave = keyframes`
  0%, 60%, 100% {
    transform: initial;
  }
  30% {
    transform: translateY(-15px);
  }
`;

// Skeleton Components
const SkeletonBase = styled.div<{ width?: string; height?: string; borderRadius?: string }>`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.surface.default} 0%,
    ${({ theme }) => theme.colors.surface.hover} 50%,
    ${({ theme }) => theme.colors.surface.default} 100%
  );
  background-size: 200px 100%;
  ${css`animation: ${shimmer} 1.5s ease-in-out infinite;`}
  border-radius: ${({ borderRadius, theme }) => borderRadius || theme.borderRadius.md};
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height || '1rem'};
`;

export const SkeletonText = styled(SkeletonBase)`
  height: 1rem;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
    width: 75%;
  }
`;

export const SkeletonCard = styled(SkeletonBase)`
  height: 8rem;
  width: 100%;
  margin-bottom: 1rem;
`;

export const SkeletonChart = styled(SkeletonBase)`
  height: 12rem;
  width: 100%;
`;

export const SkeletonButton = styled(SkeletonBase)`
  height: 2.5rem;
  width: 8rem;
`;

// Pulse Loaders
const PulseContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const PulseDot = styled.div<{ delay?: number }>`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary[500]};
  ${css`animation: ${pulse} 1.5s ease-in-out infinite;`}
  animation-delay: ${({ delay }) => delay || 0}s;
`;

export const PulseLoader: React.FC = () => (
  <PulseContainer>
    <PulseDot />
    <PulseDot delay={0.1} />
    <PulseDot delay={0.2} />
  </PulseContainer>
);

// Wave Loader
const WaveContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
`;

const WaveBar = styled.div<{ delay?: number }>`
  width: 0.25rem;
  height: 2rem;
  background: ${({ theme }) => theme.colors.primary[500]};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  ${css`animation: ${wave} 1.2s ease-in-out infinite;`}
  animation-delay: ${({ delay }) => delay || 0}s;
`;

export const WaveLoader: React.FC = () => (
  <WaveContainer>
    <WaveBar />
    <WaveBar delay={0.1} />
    <WaveBar delay={0.2} />
    <WaveBar delay={0.3} />
    <WaveBar delay={0.4} />
  </WaveContainer>
);

// Spinner Loader
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const SpinnerContainer = styled.div<{ size?: 'sm' | 'md' | 'lg' }>`
  ${({ size }) => {
    switch (size) {
      case 'sm': return css`width: 1rem; height: 1rem;`;
      case 'lg': return css`width: 3rem; height: 3rem;`;
      default: return css`width: 2rem; height: 2rem;`;
    }
  }}
  border: 2px solid ${({ theme }) => theme.colors.surface.border};
  border-left: 2px solid ${({ theme }) => theme.colors.primary[500]};
  border-radius: 50%;
  ${css`animation: ${spin} 1s linear infinite;`}
`;

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => (
  <SpinnerContainer size={size} />
);

// Loading Overlay
const OverlayContainer = styled.div<{ fullScreen?: boolean }>`
  position: ${({ fullScreen }) => fullScreen ? 'fixed' : 'absolute'};
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.overlay.backdrop};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
  backdrop-filter: blur(4px);
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.surface.elevated};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  box-shadow: ${({ theme }) => theme.shadows.xl};
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin: 0;
`;

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'Loading...', 
  fullScreen = false 
}) => (
  <OverlayContainer fullScreen={fullScreen}>
    <LoadingContent>
      <Spinner size="lg" />
      <LoadingText>{message}</LoadingText>
    </LoadingContent>
  </OverlayContainer>
);

// Skeleton Dashboard Layout
export const SkeletonDashboard: React.FC = () => (
  <div style={{ padding: '1.5rem', display: 'grid', gap: '1.5rem' }}>
    {/* Header skeleton */}
    <div>
      <SkeletonText width="60%" height="2rem" />
      <SkeletonText width="40%" />
    </div>
    
    {/* Cards skeleton */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
    
    {/* Chart skeleton */}
    <SkeletonChart />
    
    {/* List skeleton */}
    <div>
      <SkeletonText width="30%" height="1.5rem" />
      <div style={{ marginTop: '1rem' }}>
        <SkeletonText />
        <SkeletonText />
        <SkeletonText width="80%" />
      </div>
    </div>
  </div>
);

const LoadingStatesComponents = {
  SkeletonText,
  SkeletonCard,
  SkeletonChart,
  SkeletonButton,
  PulseLoader,
  WaveLoader,
  Spinner,
  LoadingOverlay,
  SkeletonDashboard,
};

export default LoadingStatesComponents;