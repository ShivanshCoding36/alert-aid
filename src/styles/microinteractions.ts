import { css, keyframes } from 'styled-components';

// ============================================
// KEYFRAME ANIMATIONS
// ============================================

export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(0.95);
  }
`;

export const pulseDot = keyframes`
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 currentColor;
  }
  50% {
    opacity: 0.8;
    box-shadow: 0 0 0 4px currentColor;
  }
`;

export const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

export const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

export const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
`;

export const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-4px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(4px);
  }
`;

export const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px currentColor;
  }
  50% {
    box-shadow: 0 0 40px currentColor;
  }
`;

export const gradientShift = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`;

// ============================================
// MICROINTERACTION MIXINS
// ============================================

// Button Hover/Focus/Active States
export const buttonInteraction = css`
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  /* Hover State */
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.glowRed};
    filter: brightness(1.1);
  }
  
  /* Focus State */
  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.focusRing};
  }
  
  /* Active/Pressed State */
  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
    box-shadow: ${({ theme }) => theme.shadows.sm};
    transition: all 0.1s ease;
  }
  
  /* Disabled State */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(0.5);
  }
  
  /* Ripple Effect on Click */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:active::after {
    width: 300px;
    height: 300px;
    opacity: 0;
    transition: opacity 0.6s;
  }
`;

// Card Hover/Mount Animation
export const cardInteraction = css`
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  ${css`animation: ${fadeInScale} 0.4s ease-out;`}
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.glow};
    border-color: ${({ theme }) => theme.colors.border.accent};
  }
`;

// Input Focus States
export const inputInteraction = css`
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
    box-shadow: ${({ theme }) => theme.shadows.focusRing};
    background: ${({ theme }) => theme.colors.background.tertiary};
  }
  
  &:hover:not(:focus):not(:disabled) {
    border-color: ${({ theme }) => theme.colors.border.medium};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.surface.disabled};
  }
`;

// Live Status Indicator
export const liveIndicator = css`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary[500]};
    ${css`animation: ${pulseDot} 2s ease-in-out infinite;`}
  }
`;

// Animated Gradient Text
export const gradientText = css`
  background: ${({ theme }) => theme.colors.gradients.headingRed};
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  ${css`animation: ${gradientShift} 4s ease-in-out infinite;`}
`;

// Skeleton Loading Animation
export const skeletonLoading = css`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.surface.default} 0%,
    ${({ theme }) => theme.colors.surface.elevated} 50%,
    ${({ theme }) => theme.colors.surface.default} 100%
  );
  background-size: 2000px 100%;
  ${css`animation: ${shimmer} 2s infinite linear;`}
`;

// Toast/Notification Slide In
export const toastSlideIn = css`
  ${css`animation: ${slideInRight} 0.4s cubic-bezier(0.4, 0, 0.2, 1);`}
`;

// Modal/Dialog Fade In
export const modalFadeIn = css`
  ${css`animation: ${fadeInScale} 0.3s cubic-bezier(0.4, 0, 0.2, 1);`}
`;

// Checkmark Success Animation
export const checkmarkSuccess = keyframes`
  0% {
    stroke-dashoffset: 100;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
`;

// Confetti Burst (for order success)
export const confettiBurst = keyframes`
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(var(--x), var(--y)) rotate(720deg);
    opacity: 0;
  }
`;

// Cart Fly-in Animation
export const cartFlyIn = keyframes`
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(var(--cart-x), var(--cart-y)) scale(0.5);
    opacity: 0.5;
  }
  100% {
    transform: translate(var(--cart-x), var(--cart-y)) scale(0);
    opacity: 0;
  }
`;

// Status Badge Pulse
export const statusBadgePulse = css<{ status?: 'success' | 'warning' | 'danger' | 'info' }>`
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ theme, status }) => {
      switch (status) {
        case 'success': return theme.colors.success[500];
        case 'warning': return theme.colors.warning[500];
        case 'danger': return theme.colors.danger[500];
        case 'info': return theme.colors.info[500];
        default: return theme.colors.primary[500];
      }
    }};
    ${css`animation: ${pulseDot} 2s ease-in-out infinite;`}
  }
`;

// Heading Glow Effect
export const headingGlow = css`
  text-shadow: 
    0 0 10px rgba(239, 68, 68, 0.3),
    0 0 20px rgba(239, 68, 68, 0.2),
    0 0 30px rgba(239, 68, 68, 0.1);
  ${css`animation: ${glow} 3s ease-in-out infinite;`}
`;

// Link Hover Underline
export const linkUnderline = css`
  position: relative;
  text-decoration: none;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.primary[500]};
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
`;

// ============================================
// EXPORT ALL
// ============================================

export const microinteractions = {
  // Keyframes
  fadeIn,
  fadeInScale,
  slideInUp,
  slideInRight,
  pulse,
  pulseDot,
  spin,
  shimmer,
  ripple,
  bounce,
  shake,
  glow,
  gradientShift,
  checkmarkSuccess,
  confettiBurst,
  cartFlyIn,
  
  // Mixins
  buttonInteraction,
  cardInteraction,
  inputInteraction,
  liveIndicator,
  gradientText,
  skeletonLoading,
  toastSlideIn,
  modalFadeIn,
  statusBadgePulse,
  headingGlow,
  linkUnderline,
};

export default microinteractions;
