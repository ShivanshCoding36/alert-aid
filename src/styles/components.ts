import styled from 'styled-components';

// Helper to filter out custom props from DOM
const shouldForwardProp = (prop: string) => {
  const customProps = [
    'level', 'weight', 'color', 'size', 'direction', 'align', 'justify', 'gap', 'wrap',
    'columns', 'responsive', 'hasError', 'status', 'variant', 'fullWidth', 'isLoading',
    'vertical', 'gradient', 'severity', 'isActive', 'difficulty', 'priority', 'stockLevel',
    'isRead', 'animationDelay', 'shouldPulse', 'trend', 'riskLevel', 'fullScreen',
    '$level', '$weight', '$color', '$size', '$direction', '$align', '$justify', '$gap', '$wrap',
    '$columns', '$responsive', '$hasError', '$status', '$variant', '$fullWidth', '$isLoading'
  ];
  return !customProps.includes(prop);
};

// Professional Dark Mode Components with Enterprise Aesthetics

// Exclusive Dark Mode Card - Professional dark elevation
export const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface.elevated}; /* Dark card background */
  border: 1px solid ${({ theme }) => theme.colors.border.default}; /* Dark borders */
  border-radius: ${({ theme }) => theme.borderRadius.md}; /* 12px rounded corners */
  box-shadow: ${({ theme }) => theme.shadows.soft}; /* Dark-optimized shadows */
  padding: ${({ theme }) => theme.spacing.lg}; /* Generous padding */
  transition: all 0.3s ease;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  color: ${({ theme }) => theme.colors.text.primary}; /* High-contrast text */
  
  /* Enhanced dark mode hover with stronger shadows */
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    transform: translateY(-2px);
    background: ${({ theme }) => theme.colors.surface.hover}; /* Subtle dark hover */
  }
  
  /* Interactive dark card variant */
  &[data-interactive="true"] {
    cursor: pointer;
    
    &:hover {
      border-color: ${({ theme }) => theme.colors.primary[400]}; /* Red accent border */
      background: ${({ theme }) => theme.colors.surface.hover};
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }
  }
`;

// Enhanced Button Component - Red/coral focused with smooth transitions and gradients
export const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant', 'size', 'fullWidth'].includes(prop)
})<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* Smooth enhanced transitions */
  cursor: pointer;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  
  /* Enhanced smooth hover effects */
  &:hover {
    transform: translateY(-2px); /* Enhanced lift effect */
    box-shadow: ${({ theme }) => theme.shadows.lg}; /* Enhanced shadow depth */
  }
  
  &:active {
    transform: translateY(0);
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }
  white-space: nowrap;
  user-select: none;
  position: relative;
  overflow: hidden;
  
  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.focusRing}; /* Coral focus ring */
  }
  
  &:active {
    transform: translateY(1px); /* Press-in effect */
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  ${({ fullWidth }) => fullWidth && 'width: 100%;'}
  
  ${({ size, theme }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${theme.spacing[2]} ${theme.spacing[4]};
          font-size: ${theme.typography.fontSize.sm};
          min-height: 36px; /* Slightly larger for friendliness */
        `;
      case 'lg':
        return `
          padding: ${theme.spacing[4]} ${theme.spacing[8]};
          font-size: ${theme.typography.fontSize.lg};
          min-height: 52px; /* Larger and more friendly */
        `;
      default:
        return `
          padding: ${theme.spacing[3]} ${theme.spacing[6]};
          font-size: ${theme.typography.fontSize.base};
          min-height: 44px; /* Increased from 40px */
        `;
    }
  }}
  
  ${({ variant, theme }) => {
    switch (variant) {
      case 'primary':
        return `
          background: ${theme.colors.gradients.primary}; /* Enhanced gradient background */
          color: ${theme.colors.text.primary};
          border-color: transparent;
          box-shadow: ${theme.shadows.soft};
          font-weight: ${theme.typography.fontWeight.semibold};

          &:hover:not(:disabled) {
            background: ${theme.colors.gradients.primaryHover}; /* Enhanced gradient hover */
            box-shadow: ${theme.shadows.lg};
            box-shadow: ${theme.shadows.glow}; /* Red glow effect */
            transform: translateY(-2px);
          }

          &:active:not(:disabled) {
            background: ${theme.colors.primary[700]};
            transform: translateY(0);
          }
        `;
      case 'secondary':
        return `
          background: ${theme.colors.surface.default}; /* Dark secondary background */
          color: ${theme.colors.text.primary}; /* High-contrast text */
          border-color: ${theme.colors.surface.border};
          font-weight: ${theme.typography.fontWeight.medium};

          &:hover:not(:disabled) {
            background: ${theme.colors.surface.hover};
            border-color: ${theme.colors.primary[200]};
            color: ${theme.colors.text.primary};
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${theme.colors.primary[600]};
          border-color: ${theme.colors.primary[300]};

          &:hover:not(:disabled) {
            background: ${theme.colors.surface.stripe};
            border-color: ${theme.colors.primary[500]};
            color: ${theme.colors.primary[700]};
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: ${theme.colors.text.secondary};
          border-color: transparent;

          &:hover:not(:disabled) {
            background: ${theme.colors.surface.hover};
            color: ${theme.colors.text.primary};
          }
        `;
      case 'danger':
        return `
          background: ${theme.colors.danger[500]};
          color: ${theme.colors.text.inverse};
          border-color: ${theme.colors.danger[500]};

          &:hover:not(:disabled) {
            background: ${theme.colors.danger[600]};
            border-color: ${theme.colors.danger[600]};
            box-shadow: ${theme.shadows.glow};
          }
        `;
      default:
        return `
          background: ${theme.colors.gradients.primary};
          color: ${theme.colors.text.inverse};
          border-color: ${theme.colors.primary[500]};

          &:hover:not(:disabled) {
            background: ${theme.colors.primary[600]};
            box-shadow: ${theme.shadows.warmGlow};
          }
        `;
    }
  }}
`;

// Typography components - Enhanced with warm colors and improved readability
export const Heading = styled.h1.withConfig({
  shouldForwardProp: (prop) => !['level', 'weight', 'color', '$level', '$weight', '$color'].includes(prop)
})<{
  $level?: 1 | 2 | 3 | 4 | 5 | 6;
  $weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  $color?: 'primary' | 'secondary' | 'disabled' | 'inverse' | 'coral';
  // Legacy props for backward compatibility
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'disabled' | 'inverse' | 'coral';
}>`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ $weight, weight, theme }) => {
    const val = $weight || weight;
    switch (val) {
      case 'normal': return theme.typography.fontWeight.normal;
      case 'medium': return theme.typography.fontWeight.medium;
      case 'bold': return theme.typography.fontWeight.bold;
      default: return theme.typography.fontWeight.semibold;
    }
  }};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  margin: 0;
  
  ${({ $color, color, theme }) => {
    const val = $color || color;
    switch (val) {
      case 'primary': return `color: ${theme.colors.text.primary};`;
      case 'secondary': return `color: ${theme.colors.text.secondary};`;
      case 'disabled': return `color: ${theme.colors.text.disabled};`;
      case 'inverse': return `color: ${theme.colors.text.inverse};`;
      case 'coral': return `color: ${theme.colors.primary[500]}; text-shadow: 0 1px 2px ${theme.colors.primary[100]};`;
      default: return `color: ${theme.colors.text.primary};`;
    }
  }};
  
  ${({ $level, level, theme }) => {
    const val = $level || level;
    switch (val) {
      case 1:
        return `font-size: ${theme.typography.fontSize['5xl']};`;
      case 2:
        return `font-size: ${theme.typography.fontSize['4xl']};`;
      case 3:
        return `font-size: ${theme.typography.fontSize['3xl']};`;
      case 4:
        return `font-size: ${theme.typography.fontSize['2xl']};`;
      case 5:
        return `font-size: ${theme.typography.fontSize.xl};`;
      default:
        return `font-size: ${theme.typography.fontSize.lg};`;
    }
  }}
`;

export const Text = styled.p.withConfig({
  shouldForwardProp: (prop) => !['size', 'weight', 'color', '$size', '$weight', '$color'].includes(prop)
})<{
  $size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  $weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  $color?: 'primary' | 'secondary' | 'tertiary' | 'muted' | 'disabled' | 'inverse' | 'coral';
  // Legacy props for backward compatibility
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'tertiary' | 'muted' | 'disabled' | 'inverse' | 'coral';
}>`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ $size, size, theme }) => {
    const val = $size || size;
    switch (val) {
      case 'xs': return theme.typography.fontSize.xs;
      case 'sm': return theme.typography.fontSize.sm;
      case 'lg': return theme.typography.fontSize.lg;
      case 'xl': return theme.typography.fontSize.xl;
      default: return theme.typography.fontSize.base;
    }
  }};
  font-weight: ${({ $weight, weight, theme }) => {
    const val = $weight || weight;
    switch (val) {
      case 'medium': return theme.typography.fontWeight.medium;
      case 'semibold': return theme.typography.fontWeight.semibold;
      case 'bold': return theme.typography.fontWeight.bold;
      default: return theme.typography.fontWeight.normal;
    }
  }};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed}; /* More readable */
  margin: 0;
  
  ${({ $color, color, theme }) => {
    const val = $color || color;
    switch (val) {
      case 'secondary':
        return `color: ${theme.colors.text.secondary};`;
      case 'tertiary':
        return `color: ${theme.colors.text.tertiary};`;
      case 'muted':
        return `color: ${theme.colors.text.tertiary};`;
      case 'disabled':
        return `color: ${theme.colors.text.disabled};`;
      case 'inverse':
        return `color: ${theme.colors.text.inverse};`;
      case 'coral':
        return `color: ${theme.colors.primary[600]}; font-weight: ${theme.typography.fontWeight.medium};`;
      default:
        return `color: ${theme.colors.text.primary};`;
    }
  }}
`;

// Layout components - Enhanced with warm aesthetics
export const Container = styled.div.withConfig({
  shouldForwardProp: (prop) => !['maxWidth', 'padding', '$maxWidth', '$padding'].includes(prop)
})<{
  $maxWidth?: string;
  $padding?: string;
  // Legacy props for backward compatibility
  maxWidth?: string;
  padding?: string;
}>`
  width: 100%;
  max-width: ${({ $maxWidth, maxWidth }) => $maxWidth || maxWidth || '1920px'};
  margin: 0 auto;
  padding: ${({ $padding, padding, theme }) => $padding || padding || `0 ${theme.spacing[6]}`};
  background: ${({ theme }) => theme.colors.surface.default}; /* Warm background */
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => `0 ${theme.spacing[4]}`};
  }
`;

export const Grid = styled.div.withConfig({
  shouldForwardProp: (prop) => !['columns', 'gap', 'responsive', '$columns', '$gap', '$responsive'].includes(prop)
})<{
  $columns?: number;
  $gap?: string;
  $responsive?: boolean;
  // Legacy props for backward compatibility
  columns?: number;
  gap?: string;
  responsive?: boolean;
}>`
  display: grid;
  grid-template-columns: repeat(${({ $columns, columns = 1 }) => $columns || columns}, 1fr);
  gap: ${({ $gap, gap, theme }) => $gap || gap || theme.spacing[6]};
  
  ${({ $responsive, responsive, $columns, columns, theme }) => ($responsive || responsive) && `
    @media (max-width: ${theme.breakpoints.lg}) {
      grid-template-columns: repeat(${Math.max(1, ($columns || columns || 1) - 1)}, 1fr);
    }
    
    @media (max-width: ${theme.breakpoints.md}) {
      grid-template-columns: 1fr;
    }
  `}
`;

export const Flex = styled.div.withConfig({
  shouldForwardProp: (prop) => !['direction', 'align', 'justify', 'gap', 'wrap', '$direction', '$align', '$justify', '$gap', '$wrap'].includes(prop)
})<{
  $direction?: 'row' | 'column';
  $align?: 'start' | 'center' | 'end' | 'stretch';
  $justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  $gap?: string;
  $wrap?: boolean;
  // Legacy props for backward compatibility (will be deprecated)
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: string;
  wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${({ $direction, direction = 'row' }) => $direction || direction};
  align-items: ${({ $align, align = 'start' }) => {
    const val = $align || align;
    switch (val) {
      case 'start': return 'flex-start';
      case 'end': return 'flex-end';
      case 'center': return 'center';
      case 'stretch': return 'stretch';
      default: return 'flex-start';
    }
  }};
  justify-content: ${({ $justify, justify = 'start' }) => {
    const val = $justify || justify;
    switch (val) {
      case 'start': return 'flex-start';
      case 'end': return 'flex-end';
      case 'center': return 'center';
      case 'between': return 'space-between';
      case 'around': return 'space-around';
      default: return 'flex-start';
    }
  }};
  gap: ${({ $gap, gap, theme }) => $gap || gap || theme.spacing[4]};
  ${({ $wrap, wrap }) => ($wrap || wrap) && 'flex-wrap: wrap;'}
`;

// Input Components - Warm, friendly styling with coral accents
export const Input = styled.input.withConfig({
  shouldForwardProp: (prop) => !['hasError', 'size'].includes(prop)
})<{
  hasError?: boolean;
  size?: 'sm' | 'md' | 'lg';
}>`
  width: 100%;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.surface.default};
  border: 1px solid ${({ theme, hasError }) => 
    hasError ? theme.colors.danger[500] : theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.lg}; /* More rounded */
  transition: ${({ theme }) => theme.transitions.bounce}; /* Bouncy feel */
  box-shadow: ${({ theme }) => theme.shadows.sm};
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
    font-style: italic; /* Gentler placeholder */
  }
  
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary[300]}; /* Coral hover */
    box-shadow: ${({ theme }) => theme.shadows.md}; /* Elevated feel */
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme, hasError }) => 
      hasError ? theme.colors.danger[500] : theme.colors.primary[500]};
    box-shadow: ${({ theme, hasError }) => 
      hasError ? theme.shadows.glow : theme.shadows.focusRing}; /* Warm glow */
  }
  
  &:disabled {
    background: ${({ theme }) => theme.colors.surface.disabled};
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  ${({ size, theme }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${theme.spacing[2]} ${theme.spacing[3]};
          font-size: ${theme.typography.fontSize.sm};
          min-height: 32px;
        `;
      case 'lg':
        return `
          padding: ${theme.spacing[4]} ${theme.spacing[4]};
          font-size: ${theme.typography.fontSize.lg};
          min-height: 48px;
        `;
      default:
        return `
          padding: ${theme.spacing[3]} ${theme.spacing[3]};
          font-size: ${theme.typography.fontSize.base};
          min-height: 40px;
        `;
    }
  }}
`;

export const Label = styled.label<{
  required?: boolean;
  disabled?: boolean;
}>`
  display: block;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base}; /* Larger for readability */
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold}; /* More emphasis */
  color: ${({ theme, disabled }) => 
    disabled ? theme.colors.text.disabled : theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
  
  ${({ required, theme }) => required && `
    &::after {
      content: ' *';
      color: ${theme.colors.primary[500]}; /* Coral required indicator */
      font-weight: ${theme.typography.fontWeight.bold};
    }
  `}
`;

// Table Components - Warm, friendly styling with coral accents
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base}; /* Larger text */
  background: ${({ theme }) => theme.colors.surface.default};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.xl}; /* More rounded */
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm}; /* Elevated feel */
`;

export const TableHeader = styled.thead`
  background: ${({ theme }) => theme.colors.primary[50]}; /* Light coral header */
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary[200]}; /* Coral border */
`;

export const TableBody = styled.tbody`
  & tr:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  }
  
  & tr:hover {
    background: ${({ theme }) => theme.colors.surface.hover}; /* Light coral hover */
    transform: translateY(-1px); /* Subtle lift effect */
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

export const TableRow = styled.tr`
  transition: ${({ theme }) => theme.transitions.bounce}; /* Bouncy feel */
`;

export const TableHeaderCell = styled.th`
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[4]}; /* More padding */
  text-align: left;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold}; /* Stronger emphasis */
  color: ${({ theme }) => theme.colors.primary[700]}; /* Coral text */
  background: transparent;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary[300]};
`;

export const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[4]}; /* More padding */
  color: ${({ theme }) => theme.colors.text.primary}; /* Stronger text */
  vertical-align: middle;
`;

// Status Badge - Warm, friendly styling with coral accents
export const Badge = styled.span<{
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold}; /* More emphasis */
  line-height: 1.2; /* Slightly looser */
  white-space: nowrap;
  box-shadow: ${({ theme }) => theme.shadows.sm}; /* Elevated feel */
  transition: ${({ theme }) => theme.transitions.bounce};
  
  ${({ size, theme }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${theme.spacing[1]} ${theme.spacing[2]};
          font-size: ${theme.typography.fontSize.xs};
          min-height: 20px;
        `;
      default:
        return `
          padding: ${theme.spacing[1]} ${theme.spacing[3]};
          font-size: ${theme.typography.fontSize.sm};
          min-height: 24px;
        `;
    }
  }}
  
  ${({ variant, theme }) => {
    switch (variant) {
      case 'primary':
        return `
          background: ${theme.colors.gradients.primary}; /* Coral gradient */
          color: ${theme.colors.text.inverse};
          border: 1px solid ${theme.colors.primary[500]};
        `;
      case 'success':
        return `
          background: ${theme.colors.success[100]}; /* Lighter background */
          color: ${theme.colors.success[700]}; /* Stronger text */
          border: 1px solid ${theme.colors.success[300]};
        `;
      case 'warning':
        return `
          background: ${theme.colors.warning[100]};
          color: ${theme.colors.warning[700]};
          border: 1px solid ${theme.colors.warning[300]};
        `;
      case 'danger':
        return `
          background: ${theme.colors.danger[100]};
          color: ${theme.colors.danger[700]};
          border: 1px solid ${theme.colors.danger[300]};
        `;
      case 'info':
        return `
          background: ${theme.colors.info[100]};
          color: ${theme.colors.info[700]};
          border: 1px solid ${theme.colors.info[300]};
        `;
      default:
        return `
          background: ${theme.colors.surface.hover};
          color: ${theme.colors.text.primary}; /* Stronger default text */
          border: 1px solid ${theme.colors.border.default};
        `;
    }
  }}
`;

// Loading Spinner - Warm coral animation
export const Spinner = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size'].includes(prop)
})<{ size?: 'sm' | 'md' | 'lg' }>`
  border: 3px solid ${({ theme }) => theme.colors.primary[100]}; /* Light coral base */
  border-top: 3px solid ${({ theme }) => theme.colors.primary[500]}; /* Coral spinner */
  border-radius: 50%;
  animation: spin 0.8s ease-in-out infinite; /* Smoother animation */
  box-shadow: ${({ theme }) => theme.shadows.sm}; /* Subtle elevation */
  
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `width: 16px; height: 16px;`;
      case 'lg':
        return `width: 32px; height: 32px;`;
      default:
        return `width: 24px; height: 24px;`;
    }
  }}
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Professional Divider
export const Divider = styled.hr`
  border: none;
  height: 1px;
  background: ${({ theme }) => theme.colors.border.default};
  margin: ${({ theme }) => theme.spacing[4]} 0;
`;

const components = {
  Card,
  Button,
  Heading,
  Text,
  Container,
  Grid,
  Flex,
  Input,
  Label,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Badge,
  Spinner,
  Divider
};

export default components;

// Status indicator
export const StatusIndicator = styled.div.withConfig({
  shouldForwardProp: (prop) => !['status', 'size'].includes(prop)
})<{
  status?: 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
}>`
  width: ${({ size = 'md' }) => {
    switch (size) {
      case 'sm': return '8px';
      case 'lg': return '16px';
      default: return '12px';
    }
  }};
  height: ${({ size = 'md' }) => {
    switch (size) {
      case 'sm': return '8px';
      case 'lg': return '16px';
      default: return '12px';
    }
  }};
  border-radius: 50%;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'success': return theme.success;
      case 'warning': return theme.warning;
      case 'danger': return theme.danger;
      default: return theme.colors.info;
    }
  }};
  box-shadow: 0 0 8px ${({ status, theme }) => {
    switch (status) {
      case 'success': return theme.success;
      case 'warning': return theme.warning;
      case 'danger': return theme.danger;
      default: return theme.colors.info;
    }
  }}40;
`;