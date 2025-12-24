import styled, { keyframes, css } from 'styled-components';
import { productionColors } from '../../styles/production-ui-system';

/**
 * ANIMATED GLOW COMPONENTS
 * Pulsing glow effects for active/live status indicators
 */

// Pulsing glow animation
const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;
    opacity: 1;
  }
  50% {
    box-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor;
    opacity: 0.8;
  }
`;

// Subtle breathing glow
const breatheGlow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 8px currentColor);
    opacity: 0.8;
  }
  50% {
    filter: drop-shadow(0 0 16px currentColor);
    opacity: 1;
  }
`;

// Rotating hue glow (for special indicators)
const rainbowGlow = keyframes`
  0% {
    filter: drop-shadow(0 0 10px ${productionColors.status.success});
  }
  33% {
    filter: drop-shadow(0 0 10px ${productionColors.status.info});
  }
  66% {
    filter: drop-shadow(0 0 10px ${productionColors.brand.primary});
  }
  100% {
    filter: drop-shadow(0 0 10px ${productionColors.status.success});
  }
`;

// Base glow wrapper
export const GlowWrapper = styled.div<{ 
  variant?: 'pulse' | 'breathe' | 'rainbow';
  intensity?: 'low' | 'medium' | 'high';
  color?: string;
}>`
  display: inline-flex;
  position: relative;
  
  color: ${({ color }) => color || 'currentColor'};
  
  ${({ variant, intensity }) => {
    const anim = variant === 'pulse' ? pulseGlow : variant === 'rainbow' ? rainbowGlow : breatheGlow;
    const dur = intensity === 'low' ? '4s' : intensity === 'high' ? '1.5s' : '2.5s';
    return css`animation: ${anim} ${dur} ease-in-out infinite;`;
  }}
`;

// Status indicator with glow
export const GlowingStatusDot = styled.div<{ 
  color: string;
  size?: number;
  variant?: 'pulse' | 'breathe';
}>`
  width: ${({ size }) => size || 8}px;
  height: ${({ size }) => size || 8}px;
  border-radius: 50%;
  background: ${({ color }) => color};
  
  ${({ variant }) => variant === 'pulse' 
    ? css`animation: ${pulseGlow} 2s ease-in-out infinite;` 
    : css`animation: ${breatheGlow} 2s ease-in-out infinite;`}
  
  box-shadow: 
    0 0 8px ${({ color }) => color},
    0 0 16px ${({ color }) => color},
    0 0 24px ${({ color }) => color};
`;

// Glowing border container
export const GlowingBorder = styled.div<{
  borderColor: string;
  intensity?: 'low' | 'medium' | 'high';
}>`
  border: 2px solid ${({ borderColor }) => borderColor};
  border-radius: 12px;
  padding: 16px;
  
  ${({ intensity }) => {
    const dur = intensity === 'low' ? '4s' : intensity === 'high' ? '1.5s' : '2.5s';
    return css`animation: ${pulseGlow} ${dur} ease-in-out infinite;`;
  }}
  
  color: ${({ borderColor }) => borderColor};
`;

// Glowing text (for emphasis)
export const GlowingText = styled.span<{
  glowColor?: string;
  variant?: 'pulse' | 'breathe';
}>`
  color: ${({ glowColor }) => glowColor || productionColors.text.primary};
  
  ${({ variant }) => variant === 'pulse' 
    ? css`animation: ${pulseGlow} 3s ease-in-out infinite;` 
    : css`animation: ${breatheGlow} 3s ease-in-out infinite;`}
  
  text-shadow: 
    0 0 8px currentColor,
    0 0 16px currentColor;
`;

// Glowing icon wrapper
export const GlowingIcon = styled.div<{
  glowColor?: string;
  size?: number;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size || 24}px;
  height: ${({ size }) => size || 24}px;
  
  color: ${({ glowColor }) => glowColor || productionColors.brand.primary};
  
  ${css`animation: ${breatheGlow} 2.5s ease-in-out infinite;`}
  
  svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 0 8px currentColor);
  }
`;

// Accent glow for card headers
export const CardHeaderGlow = styled.div<{ accentColor: string }>`
  position: relative;
  padding: 20px 24px;
  border-radius: 12px 12px 0 0;
  background: linear-gradient(135deg, 
    ${({ accentColor }) => accentColor}15 0%, 
    ${({ accentColor }) => accentColor}05 100%
  );
  border-bottom: 1px solid ${({ accentColor }) => accentColor}40;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ accentColor }) => accentColor};
    
    ${css`animation: ${pulseGlow} 3s ease-in-out infinite;`}
    box-shadow: 
      0 0 8px ${({ accentColor }) => accentColor},
      0 0 16px ${({ accentColor }) => accentColor};
  }
`;

// Ambient background glow
export const AmbientGlow = styled.div<{ 
  glowColor: string;
  intensity?: 'low' | 'medium' | 'high';
}>`
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: -20px;
    background: radial-gradient(
      circle at center,
      ${({ glowColor }) => glowColor}${({ intensity }) => {
        if (intensity === 'low') return '10';
        if (intensity === 'high') return '30';
        return '20';
      }} 0%,
      transparent 70%
    );
    border-radius: inherit;
    pointer-events: none;
    z-index: -1;
    
    ${css`animation: ${breatheGlow} 4s ease-in-out infinite;`}
  }
`;

export default GlowWrapper;
