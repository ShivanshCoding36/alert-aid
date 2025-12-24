import styled, { keyframes, css } from 'styled-components';

// Production-quality color palette
const colors = {
  // Deep black background
  background: '#0F1115',
  
  // Dark slate card backgrounds
  cardPrimary: '#181A20',
  cardSecondary: '#20232B',
  cardTertiary: '#1E2126',
  
  // Enhanced accent colors
  primary: '#4FD1C7',
  success: '#68D391',
  warning: '#F6AD55',
  danger: '#FC8181',
  info: '#63B3ED',
  
  // Text colors
  textPrimary: '#F7FAFC',
  textSecondary: '#E2E8F0',
  textMuted: '#A0AEC0',
  
  // Border colors
  borderLight: 'rgba(255, 255, 255, 0.1)',
  borderMedium: 'rgba(255, 255, 255, 0.2)',
  borderAccent: 'rgba(79, 209, 199, 0.3)',
};

export const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

export const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
`;

export const pulse = keyframes`
  0%, 100% { opacity: 0.85; }
  50% { opacity: 1; }
`;

export const glow = keyframes`
  0%, 100% {
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.45),
      0 0 0 1px rgba(79, 209, 199, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
  50% {
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(79, 209, 199, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }
`;

export const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

export const Card = styled.div<{ 
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium' | 'large';
  animate?: boolean;
  glow?: boolean;
}>`
  background: ${props => {
    const base = colors.cardPrimary;
    switch (props.variant) {
      case 'success':
        return `linear-gradient(135deg, ${base} 0%, ${colors.cardSecondary} 50%, ${base} 100%)`;
      case 'warning':
        return `linear-gradient(135deg, ${base} 0%, rgba(246, 173, 85, 0.05) 25%, ${base} 100%)`;
      case 'danger':
        return `linear-gradient(135deg, ${base} 0%, rgba(252, 129, 129, 0.05) 25%, ${base} 100%)`;
      case 'info':
        return `linear-gradient(135deg, ${base} 0%, rgba(79, 209, 199, 0.05) 25%, ${base} 100%)`;
      default:
        return `linear-gradient(135deg, ${base} 0%, ${colors.cardSecondary} 100%)`;
    }
  }};
  
  border: 1px solid ${colors.borderLight};
  border-radius: clamp(12px, 2vw, 16px);
  padding: ${props => {
    switch (props.size) {
      case 'small': return 'clamp(1rem, 2vw, 1.5rem)';
      case 'large': return 'clamp(1.5rem, 3vw, 3rem)';
      default: return 'clamp(1.25rem, 2.5vw, 2rem)';
    }
  }};
  
  width: 100%;
  box-sizing: border-box;
  
  /* Enhanced shadow system */
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  
  ${props => props.animate && css`
    animation: ${slideUp} 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  `}
  
  ${props => props.glow && css`
    animation: ${glow} 3s ease-in-out infinite;
  `}
  
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  
  /* Desktop hover effects */
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-4px);
      box-shadow: 
        0 12px 48px rgba(0, 0, 0, 0.6),
        0 0 0 1px rgba(255, 255, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }
  }
  
  /* Mobile optimizations */
  @media (max-width: 640px) {
    border-radius: 12px;
    padding: ${props => {
      switch (props.size) {
        case 'small': return '1rem';
        case 'large': return '1.5rem';
        default: return '1.25rem';
      }
    }};
    
    /* Reduce shadows on mobile for better performance */
    box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.05);
  }
  
  /* Tablet optimization */
  @media (min-width: 641px) and (max-width: 1024px) {
    padding: ${props => {
      switch (props.size) {
        case 'small': return '1.25rem';
        case 'large': return '2rem';
        default: return '1.75rem';
      }
    }};
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: clamp(1rem, 2vw, 1.5rem);
  gap: 0.75rem;
  flex-wrap: wrap;
  
  h3 {
    margin: 0;
    font-size: clamp(1rem, 2vw, 1.1rem);
    font-weight: 600;
    color: #e2e8f0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 0; /* Allows text to wrap */
  }
  
  @media (max-width: 640px) {
    margin-bottom: 1rem;
    
    h3 {
      font-size: 0.95rem;
    }
  }
`;

export const CardContent = styled.div`
  color: #cbd5e0;
  line-height: 1.6;
  width: 100%;
  overflow: hidden;
`;

export const MetricValue = styled.div<{ size?: 'small' | 'medium' | 'large' }>`
  font-size: ${props => {
    switch (props.size) {
      case 'small': return 'clamp(1.25rem, 3vw, 1.5rem)';
      case 'large': return 'clamp(2rem, 5vw, 3rem)';
      default: return 'clamp(1.75rem, 4vw, 2.5rem)';
    }
  }};
  font-weight: 700;
  color: #e2e8f0;
  line-height: 1.2;
  margin-bottom: 0.5rem;
  
  @media (max-width: 640px) {
    font-size: ${props => {
      switch (props.size) {
        case 'small': return '1.25rem';
        case 'large': return '2rem';
        default: return '1.75rem';
      }
    }};
  }
`;

export const MetricLabel = styled.div`
  font-size: clamp(0.75rem, 1.5vw, 0.9rem);
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  
  @media (max-width: 640px) {
    font-size: 0.75rem;
    letter-spacing: 0.3px;
  }
`;

export const Badge = styled.span<{ variant?: 'success' | 'warning' | 'danger' | 'info' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background: ${props => {
    switch (props.variant) {
      case 'success': return 'rgba(72, 187, 120, 0.2)';
      case 'warning': return 'rgba(251, 191, 36, 0.2)';
      case 'danger': return 'rgba(245, 101, 101, 0.2)';
      case 'info': return 'rgba(76, 209, 199, 0.2)';
      default: return 'rgba(160, 174, 192, 0.2)';
    }
  }};
  
  color: ${props => {
    switch (props.variant) {
      case 'success': return '#68d391';
      case 'warning': return '#fbd38d';
      case 'danger': return '#fc8181';
      case 'info': return '#4fd1c7';
      default: return '#a0aec0';
    }
  }};
  
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'success': return 'rgba(72, 187, 120, 0.3)';
      case 'warning': return 'rgba(251, 191, 36, 0.3)';
      case 'danger': return 'rgba(245, 101, 101, 0.3)';
      case 'info': return 'rgba(76, 209, 199, 0.3)';
      default: return 'rgba(160, 174, 192, 0.3)';
    }
  }};
`;

export const ProgressRing = styled.div<{ 
  percentage: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  svg {
    transform: rotate(-90deg);
    filter: drop-shadow(0 0 8px rgba(76, 209, 199, 0.3));
  }
  
  .progress-ring-background {
    fill: none;
    stroke: rgba(255, 255, 255, 0.1);
    stroke-width: ${props => props.strokeWidth || 8};
  }
  
  .progress-ring-progress {
    fill: none;
    stroke: ${props => props.color || '#4fd1c7'};
    stroke-width: ${props => props.strokeWidth || 8};
    stroke-linecap: round;
    stroke-dasharray: ${props => {
      const radius = (props.size || 80) / 2 - (props.strokeWidth || 8);
      const circumference = 2 * Math.PI * radius;
      return circumference;
    }};
    stroke-dashoffset: ${props => {
      const radius = (props.size || 80) / 2 - (props.strokeWidth || 8);
      const circumference = 2 * Math.PI * radius;
      return circumference - (props.percentage / 100) * circumference;
    }};
    transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

export const IconWrapper = styled.div<{ variant?: 'success' | 'warning' | 'danger' | 'info' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => {
    switch (props.variant) {
      case 'success': return 'rgba(72, 187, 120, 0.2)';
      case 'warning': return 'rgba(251, 191, 36, 0.2)';
      case 'danger': return 'rgba(245, 101, 101, 0.2)';
      case 'info': return 'rgba(76, 209, 199, 0.2)';
      default: return 'rgba(160, 174, 192, 0.2)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'success': return 'rgba(72, 187, 120, 0.3)';
      case 'warning': return 'rgba(251, 191, 36, 0.3)';
      case 'danger': return 'rgba(245, 101, 101, 0.3)';
      case 'info': return 'rgba(76, 209, 199, 0.3)';
      default: return 'rgba(160, 174, 192, 0.3)';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'success': return '#68d391';
      case 'warning': return '#fbd38d';
      case 'danger': return '#fc8181';
      case 'info': return '#4fd1c7';
      default: return '#a0aec0';
    }
  }};
`;

export const Grid = styled.div<{ columns?: number; gap?: string }>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 2}, 1fr);
  gap: ${props => props.gap || '1rem'};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FlexRow = styled.div<{ gap?: string; align?: string; justify?: string }>`
  display: flex;
  align-items: ${props => props.align || 'center'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => props.gap || '1rem'};
  flex-wrap: wrap;
`;

export const ChartContainer = styled.div`
  width: 100%;
  height: 200px;
  position: relative;
  
  .recharts-wrapper {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  }
`;

export const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background: ${props => {
    switch (props.variant) {
      case 'primary': return 'linear-gradient(135deg, #4fd1c7 0%, #38b2ac 100%)';
      case 'danger': return 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)';
      default: return 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)';
    }
  }};
  
  color: #ffffff;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;