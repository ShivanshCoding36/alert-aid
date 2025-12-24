import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Notification, NotificationType } from '../../types/notifications';
import { Button } from '../../styles/components';

// Animations
const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOutRight = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const slideInLeft = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOutLeft = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10px); }
`;

// Progress bar animation
const progressAnimation = keyframes`
  from { width: 100%; }
  to { width: 0%; }
`;

// Toast container
const ToastContainer = styled.div<{ 
  type: NotificationType; 
  isExiting: boolean; 
  position: string; 
  showProgress: boolean;
  duration?: number;
}>`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-left: 4px solid ${({ type, theme }) => {
    switch (type) {
      case 'success': return theme.colors.success[500];
      case 'error': return theme.colors.danger[500];
      case 'warning': return theme.colors.warning[500];
      case 'info': return '#3b82f6';
      default: return theme.colors.primary[500];
    }
  }};
  min-width: 320px;
  max-width: 480px;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  transition: all 0.3s ease;
  overflow: hidden;

  ${({ isExiting, position }) => {
    if (isExiting) {
      if (position.includes('right')) {
        return css`animation: ${slideOutRight} 0.3s ease forwards;`;
      } else if (position.includes('left')) {
        return css`animation: ${slideOutLeft} 0.3s ease forwards;`;
      } else {
        return css`animation: ${fadeOut} 0.3s ease forwards;`;
      }
    } else {
      if (position.includes('right')) {
        return css`animation: ${slideInRight} 0.3s ease forwards;`;
      } else if (position.includes('left')) {
        return css`animation: ${slideInLeft} 0.3s ease forwards;`;
      } else {
        return css`animation: ${fadeIn} 0.3s ease forwards;`;
      }
    }
  }}

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg}, 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  ${({ showProgress, duration, type, theme }) => showProgress && duration && duration > 0 && css`
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      width: 100%;
      background: ${(() => {
        switch (type) {
          case 'success': return theme.colors.success[500];
          case 'error': return theme.colors.danger[500];
          case 'warning': return theme.colors.warning[500];
          case 'info': return '#3b82f6';
          default: return theme.colors.primary[500];
        }
      })()};
      ${css`animation: ${progressAnimation} ${duration}ms linear forwards;`}
    }
  `}
`;

const ToastIcon = styled.div<{ type: NotificationType }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ type, theme }) => {
    switch (type) {
      case 'success': return theme.colors.success[50];
      case 'error': return theme.colors.danger[50];
      case 'warning': return theme.colors.warning[50];
      case 'info': return '#eff6ff';
      default: return theme.colors.primary[50];
    }
  }};
  color: ${({ type, theme }) => {
    switch (type) {
      case 'success': return theme.colors.success[500];
      case 'error': return theme.colors.danger[500];
      case 'warning': return theme.colors.warning[500];
      case 'info': return '#3b82f6';
      default: return theme.colors.primary[500];
    }
  }};
  flex-shrink: 0;
  margin-top: ${({ theme }) => theme.spacing[1]};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ToastContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ToastTitle = styled.h4`
  margin: 0 0 ${({ theme }) => theme.spacing[1]} 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

const ToastMessage = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

const ToastActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[3]};
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing[2]};
  right: ${({ theme }) => theme.spacing[2]};
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.tertiary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing[1]};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.surface.hover};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ToastTimestamp = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

// Icon mapping
const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle />;
    case 'error':
      return <AlertCircle />;
    case 'warning':
      return <AlertTriangle />;
    case 'info':
      return <Info />;
    default:
      return <Info />;
  }
};

interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  position: string;
  showProgress?: boolean;
  pauseOnHover?: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  notification,
  onDismiss,
  position,
  showProgress = true,
  pauseOnHover = true
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  }, [onDismiss, notification.id]);

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return timestamp.toLocaleDateString();
  };

  // Auto-dismiss with pause support
  useEffect(() => {
    if (notification.duration && notification.duration > 0 && !isPaused) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, isPaused, handleDismiss]);

  return (
    <ToastContainer
      type={notification.type}
      isExiting={isExiting}
      position={position}
      showProgress={showProgress && !isPaused}
      duration={notification.duration}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ToastIcon type={notification.type}>
        {getIcon(notification.type)}
      </ToastIcon>
      
      <ToastContent>
        <ToastTitle>{notification.title}</ToastTitle>
        {notification.message && (
          <ToastMessage>{notification.message}</ToastMessage>
        )}
        
        {notification.actions && notification.actions.length > 0 && (
          <ToastActions>
            {notification.actions.map((action: any, index: number) => (
              <Button
                key={index}
                variant={action.variant || 'ghost'}
                size="sm"
                onClick={() => {
                  action.action();
                  handleDismiss();
                }}
              >
                {action.label}
              </Button>
            ))}
          </ToastActions>
        )}
        
        <ToastTimestamp>
          {formatTimestamp(notification.timestamp)}
        </ToastTimestamp>
      </ToastContent>

      {notification.dismissible && (
        <CloseButton onClick={handleDismiss}>
          <X />
        </CloseButton>
      )}
    </ToastContainer>
  );
};

export default Toast;