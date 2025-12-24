import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { productionColors, productionAnimations } from '../../styles/production-ui-system';

// Slide in from top-right animation
const slideIn = keyframes`
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
`;

const progressBar = keyframes`
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
`;

// Toast Container
const ToastContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
  
  @media (max-width: 768px) {
    right: 16px;
    left: 16px;
  }
`;

const ToastItem = styled.div<{ type: 'success' | 'error' | 'warning' | 'info'; isExiting: boolean }>`
  min-width: 350px;
  max-width: 450px;
  background: linear-gradient(135deg, ${productionColors.background.secondary}, ${productionColors.background.tertiary});
  border: 1px solid ${({ type }) => {
    if (type === 'success') return productionColors.status.success;
    if (type === 'error') return productionColors.status.error;
    if (type === 'warning') return productionColors.status.warning;
    return productionColors.status.info;
  }};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  ${({ isExiting }) => isExiting ? css`animation: ${slideOut} 0.3s ${productionAnimations.easing.smooth};` : css`animation: ${slideIn} 0.3s ${productionAnimations.easing.smooth};`}
  
  @media (max-width: 768px) {
    min-width: unset;
    max-width: unset;
    width: 100%;
  }
`;

const ToastContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const IconWrapper = styled.div<{ type: 'success' | 'error' | 'warning' | 'info' }>`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: ${({ type }) => {
    if (type === 'success') return productionColors.status.success;
    if (type === 'error') return productionColors.status.error;
    if (type === 'warning') return productionColors.status.warning;
    return productionColors.status.info;
  }};
`;

const TextContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ToastTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${productionColors.text.primary};
`;

const ToastMessage = styled.div`
  font-size: 13px;
  color: ${productionColors.text.secondary};
  line-height: 1.4;
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${productionColors.text.tertiary};
  cursor: pointer;
  border-radius: 4px;
  transition: all ${productionAnimations.duration.fast};
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${productionColors.text.primary};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ProgressBar = styled.div<{ duration: number; type: 'success' | 'error' | 'warning' | 'info' }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: ${({ type }) => {
    if (type === 'success') return productionColors.status.success;
    if (type === 'error') return productionColors.status.error;
    if (type === 'warning') return productionColors.status.warning;
    return productionColors.status.info;
  }};
  ${({ duration }) => css`animation: ${progressBar} ${duration}ms linear;`}
`;

// Toast Type
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastNotificationProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const duration = toast.duration || 5000;

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <XCircle />;
      case 'warning':
        return <AlertTriangle />;
      default:
        return <Info />;
    }
  };

  return (
    <ToastItem type={toast.type} isExiting={isExiting}>
      <ToastContent>
        <IconWrapper type={toast.type}>{getIcon()}</IconWrapper>
        <TextContent>
          <ToastTitle>{toast.title}</ToastTitle>
          {toast.message && <ToastMessage>{toast.message}</ToastMessage>}
        </TextContent>
        <CloseButton onClick={handleClose}>
          <X />
        </CloseButton>
      </ToastContent>
      <ProgressBar duration={duration} type={toast.type} />
    </ToastItem>
  );
};

// Toast Manager Component
interface ToastManagerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export const ToastManager: React.FC<ToastManagerProps> = ({ toasts, onClose }) => {
  return (
    <ToastContainer>
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </ToastContainer>
  );
};

export default ToastManager;
