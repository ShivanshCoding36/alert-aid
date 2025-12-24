import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import { Notification } from '../../types/notifications';
import { Button, Text, Flex } from '../../styles/components';

// Subtle fade-in animation (no fly-in behavior)
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Professional Critical Alert Container
const CriticalAlertContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 500px;
  background: ${({ theme }) => theme.colors.surface.default};
  border: 1px solid ${({ theme }) => theme.colors.danger[500]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: ${({ theme }) => theme.zIndex.notification};
  ${css`animation: ${fadeIn} 0.3s ease-out;`}
  opacity: ${({ isVisible }) => isVisible ? 1 : 0};
  visibility: ${({ isVisible }) => isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const AlertHeader = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.danger[500]}15,
    ${({ theme }) => theme.colors.danger[600]}10
  );
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg} 0 0;
`;

const AlertContent = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
`;

const AlertActions = styled.div`
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 0 0 ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const SeverityIndicator = styled.div`
  width: 4px;
  height: 100%;
  background: ${({ theme }) => theme.colors.danger[500]};
  position: absolute;
  left: 0;
  top: 0;
  border-radius: ${({ theme }) => theme.borderRadius.lg} 0 0 ${({ theme }) => theme.borderRadius.lg};
`;

const DismissButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing[3]};
  right: ${({ theme }) => theme.spacing[3]};
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.tertiary};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.surface.hover};
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const AutoDismissBar = styled.div<{ duration: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: ${({ theme }) => theme.colors.danger[500]};
  border-radius: 0 0 0 ${({ theme }) => theme.borderRadius.lg};
  animation: shrink ${({ duration }) => duration}ms linear;

  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;

interface CriticalAlertProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onAction?: (id: string) => void;
  autoDismiss?: number; // milliseconds
}

export const CriticalAlert: React.FC<CriticalAlertProps> = ({
  notification,
  onDismiss,
  onAction,
  autoDismiss = 8000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismiss);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for fade-out animation to complete
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  const handleAction = () => {
    if (notification.actions && notification.actions.length > 0) {
      notification.actions[0].action();
    }
    if (onAction) {
      onAction(notification.id);
    }
    handleDismiss();
  };

  // Only show for critical or high priority notifications
  if (!notification.priority || !['critical', 'high'].includes(notification.priority)) {
    return null;
  }

  return (
    <CriticalAlertContainer isVisible={isVisible}>
      <SeverityIndicator />
      
      <AlertHeader>
        <Flex align="center" gap="12px" style={{ paddingRight: '32px' }}>
          <AlertTriangle 
            size={20} 
            style={{ 
              color: '#ef4444',
              flexShrink: 0
            }} 
          />
          <div style={{ flex: 1 }}>
            <Text size="sm" weight="semibold" color="primary">
              {notification.title}
            </Text>
            {notification.source && (
              <Text size="xs" color="tertiary" style={{ marginTop: '2px' }}>
                {notification.source}
              </Text>
            )}
          </div>
        </Flex>
      </AlertHeader>

      {notification.message && (
        <AlertContent>
          <Text size="sm" color="secondary">
            {notification.message}
          </Text>
        </AlertContent>
      )}

      {notification.actions && notification.actions.length > 0 && (
        <AlertActions>
          <Flex justify="between" align="center">
            <Text size="xs" color="tertiary">
              Action required
            </Text>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAction}
            >
              {notification.actions[0].label || 'View Details'}
              <ArrowRight size={14} />
            </Button>
          </Flex>
        </AlertActions>
      )}

      <DismissButton onClick={handleDismiss}>
        <X size={14} />
      </DismissButton>

      {autoDismiss > 0 && (
        <AutoDismissBar duration={autoDismiss} />
      )}
    </CriticalAlertContainer>
  );
};

// Critical Alert Manager - Shows one critical alert at a time
interface CriticalAlertManagerProps {
  children?: React.ReactNode;
}

export const CriticalAlertManager: React.FC<CriticalAlertManagerProps> = () => {
  const [activeAlert, setActiveAlert] = useState<Notification | null>(null);
  const [alertQueue, setAlertQueue] = useState<Notification[]>([]);

  // Mock critical notifications - in real app this would come from context
  useEffect(() => {
    // Example critical notification
    const mockCritical: Notification = {
      id: 'critical-1',
      type: 'error',
      priority: 'critical',
      title: 'System Alert: High Earthquake Activity Detected',
      message: 'M7.2 earthquake detected 15km from downtown. Immediate evacuation recommended for coastal areas.',
      timestamp: new Date(),
      source: 'Seismic Monitoring System',
      actions: [{
        label: 'View Evacuation Routes',
        action: () => window.location.href = '/evacuation'
      }]
    };

    // Only show if truly critical
    if (mockCritical.priority === 'critical') {
      setActiveAlert(mockCritical);
    }
  }, []);

  const handleDismiss = (id: string) => {
    setActiveAlert(null);
    
    // Show next alert in queue if any
    if (alertQueue.length > 0) {
      const next = alertQueue[0];
      setAlertQueue(prev => prev.slice(1));
      setActiveAlert(next);
    }
  };

  const handleAction = (id: string) => {
    // Handle action - navigate, open modal, etc.
    console.log('Critical alert action:', id);
    handleDismiss(id);
  };

  if (!activeAlert) {
    return null;
  }

  return (
    <CriticalAlert
      notification={activeAlert}
      onDismiss={handleDismiss}
      onAction={handleAction}
      autoDismiss={10000} // 10 seconds for critical alerts
    />
  );
};

export default CriticalAlertManager;