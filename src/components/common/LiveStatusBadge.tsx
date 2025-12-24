import React from 'react';
import styled, { keyframes, css } from 'styled-components';

const pulseDot = keyframes`
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 currentColor;
  }
  50% {
    opacity: 0.8;
    box-shadow: 0 0 0 4px currentColor;
  }
`;

const LiveBadgeContainer = styled.div<{ size?: 'sm' | 'md' | 'lg' }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ size }) => {
    switch (size) {
      case 'sm': return '6px';
      case 'lg': return '10px';
      default: return '8px';
    }
  }};
  padding: ${({ size }) => {
    switch (size) {
      case 'sm': return '4px 8px';
      case 'lg': return '8px 16px';
      default: return '6px 12px';
    }
  }};
  background: rgba(10, 11, 15, 0.8);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  font-size: ${({ size }) => {
    switch (size) {
      case 'sm': return '11px';
      case 'lg': return '14px';
      default: return '12px';
    }
  }};
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(239, 68, 68, 0.4);
    background: rgba(10, 11, 15, 0.95);
  }
`;

const PulseDot = styled.div<{ color?: string; size?: 'sm' | 'md' | 'lg' }>`
  width: ${({ size }) => {
    switch (size) {
      case 'sm': return '6px';
      case 'lg': return '10px';
      default: return '8px';
    }
  }};
  height: ${({ size }) => {
    switch (size) {
      case 'sm': return '6px';
      case 'lg': return '10px';
      default: return '8px';
    }
  }};
  border-radius: 50%;
  background: ${({ color }) => color || '#EF4444'};
  box-shadow: 0 0 10px ${({ color }) => color || 'rgba(239, 68, 68, 0.6)'};
  ${css`animation: ${pulseDot} 2s ease-in-out infinite;`}
  flex-shrink: 0;
`;

interface LiveStatusBadgeProps {
  text?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LiveStatusBadge: React.FC<LiveStatusBadgeProps> = ({
  text = 'Live Data',
  color = '#EF4444',
  size = 'md',
  className
}) => {
  return (
    <LiveBadgeContainer size={size} className={className}>
      <PulseDot color={color} size={size} />
      <span>{text}</span>
    </LiveBadgeContainer>
  );
};

export default LiveStatusBadge;
