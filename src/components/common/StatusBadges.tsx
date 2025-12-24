import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Clock, MapPin, WifiOff, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { productionColors, productionAnimations } from '../../styles/production-ui-system';

// Pulse animation for live indicators
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

// Base Badge
const Badge = styled.div<{ $variant: 'success' | 'error' | 'warning' | 'info' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
  transition: all ${productionAnimations.duration.normal} ${productionAnimations.easing.smooth};
  
  background: ${({ $variant }) => {
    if ($variant === 'success') return 'rgba(34, 197, 94, 0.1)';
    if ($variant === 'error') return 'rgba(239, 68, 68, 0.1)';
    if ($variant === 'warning') return 'rgba(251, 191, 36, 0.1)';
    if ($variant === 'info') return 'rgba(59, 130, 246, 0.1)';
    return 'rgba(255, 255, 255, 0.05)';
  }};
  
  border-color: ${({ $variant }) => {
    if ($variant === 'success') return 'rgba(34, 197, 94, 0.3)';
    if ($variant === 'error') return 'rgba(239, 68, 68, 0.3)';
    if ($variant === 'warning') return 'rgba(251, 191, 36, 0.3)';
    if ($variant === 'info') return 'rgba(59, 130, 246, 0.3)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  
  color: ${({ $variant }) => {
    if ($variant === 'success') return productionColors.status.success;
    if ($variant === 'error') return productionColors.status.error;
    if ($variant === 'warning') return productionColors.status.warning;
    if ($variant === 'info') return productionColors.status.info;
    return productionColors.text.secondary;
  }};
  
  svg {
    width: 14px;
    height: 14px;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const PulsingDot = styled.div<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color};
  ${css`animation: ${pulse} 2s ease-in-out infinite;`}
`;

// Last Updated Badge
interface LastUpdatedBadgeProps {
  timestamp: Date;
  className?: string;
}

export const LastUpdatedBadge: React.FC<LastUpdatedBadgeProps> = ({ timestamp, className }) => {
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Badge $variant="neutral" className={className}>
      <Clock />
      <span>{getTimeAgo(timestamp)}</span>
    </Badge>
  );
};

// Live Status Badge
interface LiveStatusBadgeProps {
  isLive: boolean;
  label?: string;
  className?: string;
}

export const LiveStatusBadge: React.FC<LiveStatusBadgeProps> = ({ 
  isLive, 
  label = 'Live',
  className 
}) => {
  return (
    <Badge $variant={isLive ? 'success' : 'error'} className={className}>
      {isLive && <PulsingDot color={productionColors.status.success} />}
      {!isLive && <WifiOff />}
      <span>{isLive ? label : 'Offline'}</span>
    </Badge>
  );
};

// GPS Status Badge
interface GPSStatusBadgeProps {
  enabled: boolean;
  location?: string;
  className?: string;
}

export const GPSStatusBadge: React.FC<GPSStatusBadgeProps> = ({ 
  enabled, 
  location,
  className 
}) => {
  return (
    <Badge $variant={enabled ? 'info' : 'neutral'} className={className}>
      <MapPin />
      <span>{location || (enabled ? 'GPS Active' : 'Manual Location')}</span>
    </Badge>
  );
};

// System Status Badge
interface SystemStatusBadgeProps {
  status: 'healthy' | 'degraded' | 'critical';
  percentage?: number;
  className?: string;
}

export const SystemStatusBadge: React.FC<SystemStatusBadgeProps> = ({ 
  status, 
  percentage,
  className 
}) => {
  const getVariant = () => {
    if (status === 'healthy') return 'success';
    if (status === 'degraded') return 'warning';
    return 'error';
  };

  const getIcon = () => {
    if (status === 'healthy') return <CheckCircle />;
    if (status === 'degraded') return <AlertTriangle />;
    return <XCircle />;
  };

  const getLabel = () => {
    if (percentage !== undefined) {
      return `${percentage}% Operational`;
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Badge $variant={getVariant()} className={className}>
      {getIcon()}
      <span>{getLabel()}</span>
    </Badge>
  );
};

// API Status Badge
interface APIStatusBadgeProps {
  name: string;
  isOperational: boolean;
  className?: string;
}

export const APIStatusBadge: React.FC<APIStatusBadgeProps> = ({ 
  name, 
  isOperational,
  className 
}) => {
  return (
    <Badge $variant={isOperational ? 'success' : 'error'} className={className}>
      {isOperational ? <CheckCircle /> : <XCircle />}
      <span>{name}</span>
    </Badge>
  );
};

// Generic Status Badge
interface StatusBadgeProps {
  label: string;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  icon?: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  label, 
  variant = 'neutral',
  icon,
  pulse = false,
  className 
}) => {
  return (
    <Badge $variant={variant} className={className}>
      {pulse && <PulsingDot color={
        variant === 'success' ? productionColors.status.success :
        variant === 'error' ? productionColors.status.error :
        variant === 'warning' ? productionColors.status.warning :
        variant === 'info' ? productionColors.status.info :
        productionColors.text.secondary
      } />}
      {icon}
      <span>{label}</span>
    </Badge>
  );
};

export default StatusBadge;
