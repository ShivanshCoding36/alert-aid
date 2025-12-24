import styled, { keyframes, css } from 'styled-components';
import { productionColors, productionAnimations } from '../../styles/production-ui-system';

// Pulse animation for high-risk buttons
const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
`;

// Base button styles
export const BaseButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger'; size?: 'small' | 'medium' | 'large' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: ${({ size }) => {
    if (size === 'small') return '8px 16px';
    if (size === 'large') return '16px 32px';
    return '12px 24px';
  }};
  border-radius: 12px;
  border: 1px solid transparent;
  font-size: ${({ size }) => {
    if (size === 'small') return '14px';
    if (size === 'large') return '18px';
    return '16px';
  }};
  font-weight: 600;
  cursor: pointer;
  transition: all ${productionAnimations.duration.normal} ${productionAnimations.easing.smooth};
  position: relative;
  overflow: hidden;
  
  /* Minimum touch target size for accessibility */
  min-height: 44px;
  min-width: 44px;
  
  /* Subtle shadow */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  /* Visible focus indicator for keyboard navigation */
  &:focus-visible {
    outline: 3px solid ${productionColors.status.info};
    outline-offset: 2px;
    z-index: 10;
  }
  
  /* Hover effect */
  &:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: ${({ size }) => {
      if (size === 'small') return '16px';
      if (size === 'large') return '24px';
      return '20px';
    }};
    height: ${({ size }) => {
      if (size === 'small') return '16px';
      if (size === 'large') return '24px';
      return '20px';
    }};
  }
`;

export const PrimaryButton = styled(BaseButton)`
  background: linear-gradient(135deg, ${productionColors.brand.primary} 0%, ${productionColors.brand.secondary} 100%);
  color: white;
  border-color: ${productionColors.brand.primary};
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, ${productionColors.brand.secondary} 0%, ${productionColors.brand.dark} 100%);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
    opacity: 0;
    transition: opacity ${productionAnimations.duration.normal};
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

export const SecondaryButton = styled(BaseButton)`
  background: ${productionColors.background.tertiary};
  color: ${productionColors.text.primary};
  border-color: ${productionColors.border.primary};
  
  &:hover:not(:disabled) {
    background: ${productionColors.interactive.hover};
    border-color: ${productionColors.border.accent};
  }
`;

export const DangerButton = styled(BaseButton)`
  background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
  color: white;
  border-color: #DC2626;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #991B1B 0%, #7F1D1D 100%);
  }
`;

// Special pulsing button for high-risk scenarios
export const PulseButton = styled(PrimaryButton)<{ shouldPulse?: boolean }>`
  ${({ shouldPulse }) => shouldPulse && css`
    ${css`animation: ${pulse} 2s infinite;`}
  `}
`;

// Emergency alert button with persistent pulse
export const EmergencyButton = styled(BaseButton)`
  background: linear-gradient(135deg, ${productionColors.brand.primary} 0%, #DC2626 100%);
  color: white;
  border: 2px solid ${productionColors.brand.primary};
  font-weight: 700;
  font-size: 18px;
  padding: 16px 32px;
  box-shadow: 
    0 4px 12px rgba(239, 68, 68, 0.4),
    0 0 0 0 rgba(239, 68, 68, 0.7);
  ${css`animation: ${pulse} 2s infinite;`}
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
    box-shadow: 
      0 8px 24px rgba(239, 68, 68, 0.5),
      0 0 0 0 rgba(239, 68, 68, 0);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    border-radius: 12px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:hover::after {
    opacity: 1;
  }
`;

// Icon button for toolbar actions
export const IconButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${productionColors.background.tertiary};
  border: 1px solid ${productionColors.border.primary};
  border-radius: 10px;
  color: ${productionColors.text.secondary};
  cursor: pointer;
  transition: all ${productionAnimations.duration.normal} ${productionAnimations.easing.smooth};
  
  &:hover:not(:disabled) {
    background: ${productionColors.interactive.hover};
    border-color: ${productionColors.border.accent};
    color: ${productionColors.brand.primary};
    transform: translateY(-2px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

// Button group container
export const ButtonGroup = styled.div<{ vertical?: boolean }>`
  display: flex;
  flex-direction: ${({ vertical }) => vertical ? 'column' : 'row'};
  gap: 12px;
  align-items: ${({ vertical }) => vertical ? 'stretch' : 'center'};
`;
