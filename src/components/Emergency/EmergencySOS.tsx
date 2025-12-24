/**
 * EmergencySOS - One-Click Emergency Alert System
 * Critical feature for disaster response applications
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { productionColors } from '../../styles/production-ui-system';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  type: 'family' | 'friend' | 'emergency' | 'medical';
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface EmergencySOSProps {
  onSOSActivated?: (data: SOSData) => void;
  emergencyContacts?: EmergencyContact[];
  userName?: string;
}

interface SOSData {
  timestamp: Date;
  location: LocationData | null;
  contacts: EmergencyContact[];
  status: 'pending' | 'sent' | 'failed';
  message: string;
}

// Animations
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`;

const ripple = keyframes`
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.5); opacity: 0; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const breathe = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components
const Container = styled.div`
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.1) 0%, 
    ${productionColors.background.secondary} 100%
  );
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 20px;
  padding: 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${productionColors.brand.primary};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  color: ${productionColors.text.secondary};
  font-size: 14px;
  margin: 0;
`;

const SOSButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 32px 0;
  position: relative;
`;

const SOSButtonOuter = styled.div<{ $active: boolean }>`
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => props.$active && css`
    &::before, &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 3px solid rgba(239, 68, 68, 0.5);
      ${css`animation: ${ripple} 1.5s infinite;`}
    }
    
    &::after {
      animation-delay: 0.75s;
    }
  `}
`;

const SOSButton = styled.button<{ $holding: boolean; $countdown: number }>`
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(145deg, 
    ${productionColors.brand.primary} 0%, 
    #DC2626 100%
  );
  color: white;
  font-size: 28px;
  font-weight: 800;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  ${props => !props.$holding && css`animation: ${pulse} 2s infinite;`}
  transition: all 0.3s ease;
  box-shadow: 
    0 10px 40px rgba(239, 68, 68, 0.5),
    inset 0 -5px 20px rgba(0, 0, 0, 0.2),
    inset 0 5px 20px rgba(255, 255, 255, 0.2);
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.98);
  }

  ${props => props.$holding && css`
    ${css`animation: ${breathe} 0.5s ease-in-out infinite;`}
  `}

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: ${props => (props.$countdown / 3) * 100}%;
    background: rgba(255, 255, 255, 0.3);
    transition: height 0.1s linear;
  }
`;

const SOSText = styled.span`
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const CountdownOverlay = styled.div<{ $show: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  font-weight: 800;
  color: white;
  z-index: 2;
  opacity: ${props => props.$show ? 1 : 0};
  transition: opacity 0.2s ease;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
`;

const InstructionText = styled.p`
  text-align: center;
  color: ${productionColors.text.tertiary};
  font-size: 12px;
  margin: 20px 0 0 0;
`;

const StatusPanel = styled.div<{ $status: 'idle' | 'active' | 'sent' }>`
  background: ${props => {
    switch (props.$status) {
      case 'active': return 'rgba(239, 68, 68, 0.2)';
      case 'sent': return 'rgba(34, 197, 94, 0.2)';
      default: return 'rgba(255, 255, 255, 0.03)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$status) {
      case 'active': return 'rgba(239, 68, 68, 0.5)';
      case 'sent': return 'rgba(34, 197, 94, 0.5)';
      default: return productionColors.border.secondary;
    }
  }};
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
  ${css`animation: ${fadeIn} 0.3s ease-out;`}
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const StatusTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${productionColors.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusBadge = styled.span<{ $type: string }>`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${props => {
    switch (props.$type) {
      case 'active': return 'rgba(239, 68, 68, 0.3)';
      case 'sent': return 'rgba(34, 197, 94, 0.3)';
      default: return 'rgba(100, 116, 139, 0.3)';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'active': return '#EF4444';
      case 'sent': return '#22C55E';
      default: return productionColors.text.secondary;
    }
  }};
`;

const LocationDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  color: ${productionColors.text.secondary};
`;

const LocationIcon = styled.span`
  font-size: 16px;
`;

const LocationCoords = styled.span`
  flex: 1;
`;

const LocationAccuracy = styled.span`
  color: ${productionColors.text.tertiary};
  font-size: 10px;
`;

const ContactsSection = styled.div`
  margin-top: 20px;
`;

const ContactsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ContactsTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${productionColors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AddContactButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid ${productionColors.border.secondary};
  background: transparent;
  color: ${productionColors.text.secondary};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${productionColors.brand.primary};
    color: ${productionColors.brand.primary};
  }
`;

const ContactsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ContactCard = styled.div<{ $type: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${productionColors.border.secondary};
  border-radius: 10px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: ${props => {
      switch (props.$type) {
        case 'emergency': return '#EF4444';
        case 'family': return '#3B82F6';
        case 'medical': return '#22C55E';
        default: return '#8B5CF6';
      }
    }};
  }
`;

const ContactIcon = styled.div<{ $type: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: ${props => {
    switch (props.$type) {
      case 'emergency': return 'rgba(239, 68, 68, 0.2)';
      case 'family': return 'rgba(59, 130, 246, 0.2)';
      case 'medical': return 'rgba(34, 197, 94, 0.2)';
      default: return 'rgba(139, 92, 246, 0.2)';
    }
  }};
`;

const ContactInfo = styled.div`
  flex: 1;
`;

const ContactName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${productionColors.text.primary};
`;

const ContactPhone = styled.div`
  font-size: 11px;
  color: ${productionColors.text.tertiary};
`;

const ContactStatus = styled.div<{ $sent?: boolean }>`
  font-size: 11px;
  color: ${props => props.$sent ? '#22C55E' : productionColors.text.tertiary};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const AlertSentAnimation = styled.div`
  ${css`animation: ${shake} 0.5s ease-out;`}
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-top-color: ${productionColors.brand.primary};
  border-radius: 50%;
  ${css`animation: ${spin} 0.8s linear infinite;`}
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 20px;
`;

const QuickAction = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${productionColors.border.secondary};
  border-radius: 12px;
  color: ${productionColors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: ${productionColors.brand.primary};
    color: ${productionColors.text.primary};
  }
`;

const QuickActionIcon = styled.span`
  font-size: 24px;
`;

const QuickActionLabel = styled.span`
  font-size: 11px;
  font-weight: 500;
`;

const EmergencySOS: React.FC<EmergencySOSProps> = ({
  onSOSActivated,
  emergencyContacts = [],
  userName = 'User',
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [sosStatus, setSOSStatus] = useState<'idle' | 'active' | 'sent'>('idle');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [sentContacts, setSentContacts] = useState<Set<string>>(new Set());
  const [showCancelOption, setShowCancelOption] = useState(false);
  
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Default emergency contacts - memoized to prevent useCallback dependency issues
  const defaultContacts: EmergencyContact[] = useMemo(() => 
    emergencyContacts.length > 0 ? emergencyContacts : [
      { id: '1', name: 'Emergency Services', phone: '911', type: 'emergency' },
      { id: '2', name: 'Family Contact', phone: '+1 555-0123', type: 'family' },
      { id: '3', name: 'Medical Emergency', phone: '108', type: 'medical' },
    ], [emergencyContacts]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  }, []);

  const handleSOSActivate = useCallback(() => {
    setSOSStatus('active');
    setShowCancelOption(true);
    
    // Simulate sending alerts to contacts
    let contactIndex = 0;
    const sendInterval = setInterval(() => {
      if (contactIndex < defaultContacts.length) {
        setSentContacts(prev => new Set(prev).add(defaultContacts[contactIndex].id));
        contactIndex++;
      } else {
        clearInterval(sendInterval);
        setSOSStatus('sent');
        
        if (onSOSActivated) {
          onSOSActivated({
            timestamp: new Date(),
            location,
            contacts: defaultContacts,
            status: 'sent',
            message: `Emergency SOS from ${userName}`,
          });
        }
      }
    }, 800);

    // Auto-reset after 30 seconds
    setTimeout(() => {
      setSOSStatus('idle');
      setSentContacts(new Set());
      setShowCancelOption(false);
    }, 30000);
  }, [location, userName, defaultContacts, onSOSActivated]);

  const handleMouseDown = useCallback(() => {
    setIsHolding(true);
    setCountdown(3);
    
    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      
      if (count <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setIsHolding(false);
        handleSOSActivate();
      }
    }, 1000);
  }, [handleSOSActivate]);

  const handleMouseUp = useCallback(() => {
    setIsHolding(false);
    setCountdown(3);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
  }, []);

  const handleCancel = useCallback(() => {
    setSOSStatus('idle');
    setSentContacts(new Set());
    setShowCancelOption(false);
  }, []);

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'emergency': return '🚨';
      case 'family': return '👨‍👩‍👧';
      case 'medical': return '🏥';
      default: return '👤';
    }
  };

  return (
    <Container>
      <Header>
        <Title>🆘 Emergency SOS</Title>
        <Subtitle>Press and hold the button for 3 seconds to send emergency alerts</Subtitle>
      </Header>

      <SOSButtonContainer>
        <SOSButtonOuter $active={sosStatus === 'active'}>
          <SOSButton
            $holding={isHolding}
            $countdown={countdown}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            disabled={sosStatus === 'active' || sosStatus === 'sent'}
          >
            <CountdownOverlay $show={isHolding}>
              {countdown}
            </CountdownOverlay>
            {!isHolding && <SOSText>SOS</SOSText>}
          </SOSButton>
        </SOSButtonOuter>
      </SOSButtonContainer>

      <InstructionText>
        {sosStatus === 'idle' && 'Hold for 3 seconds to activate emergency alert'}
        {sosStatus === 'active' && 'Sending emergency alerts to your contacts...'}
        {sosStatus === 'sent' && 'Emergency alerts sent successfully!'}
      </InstructionText>

      {showCancelOption && sosStatus === 'active' && (
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button 
            onClick={handleCancel}
            style={{
              padding: '10px 20px',
              background: 'rgba(100, 116, 139, 0.3)',
              border: 'none',
              borderRadius: '8px',
              color: productionColors.text.primary,
              cursor: 'pointer',
            }}
          >
            Cancel Alert
          </button>
        </div>
      )}

      <StatusPanel $status={sosStatus}>
        <StatusHeader>
          <StatusTitle>
            📍 Your Location
          </StatusTitle>
          <StatusBadge $type={location ? 'sent' : 'idle'}>
            {location ? 'Detected' : 'Detecting...'}
          </StatusBadge>
        </StatusHeader>
        <LocationDisplay>
          <LocationIcon>🌐</LocationIcon>
          <LocationCoords>
            {location 
              ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
              : 'Getting location...'
            }
          </LocationCoords>
          {location && (
            <LocationAccuracy>±{Math.round(location.accuracy)}m</LocationAccuracy>
          )}
        </LocationDisplay>
      </StatusPanel>

      <ContactsSection>
        <ContactsHeader>
          <ContactsTitle>
            📞 Emergency Contacts
          </ContactsTitle>
          <AddContactButton>+ Add Contact</AddContactButton>
        </ContactsHeader>
        <ContactsList>
          {defaultContacts.map(contact => (
            <ContactCard key={contact.id} $type={contact.type}>
              <ContactIcon $type={contact.type}>
                {getContactIcon(contact.type)}
              </ContactIcon>
              <ContactInfo>
                <ContactName>{contact.name}</ContactName>
                <ContactPhone>{contact.phone}</ContactPhone>
              </ContactInfo>
              <ContactStatus $sent={sentContacts.has(contact.id)}>
                {sentContacts.has(contact.id) ? (
                  <AlertSentAnimation>✓ Notified</AlertSentAnimation>
                ) : sosStatus === 'active' && !sentContacts.has(contact.id) ? (
                  <Spinner />
                ) : (
                  'Ready'
                )}
              </ContactStatus>
            </ContactCard>
          ))}
        </ContactsList>
      </ContactsSection>

      <QuickActions>
        <QuickAction>
          <QuickActionIcon>🚔</QuickActionIcon>
          <QuickActionLabel>Call Police</QuickActionLabel>
        </QuickAction>
        <QuickAction>
          <QuickActionIcon>🚑</QuickActionIcon>
          <QuickActionLabel>Medical Help</QuickActionLabel>
        </QuickAction>
        <QuickAction>
          <QuickActionIcon>🚒</QuickActionIcon>
          <QuickActionLabel>Fire Service</QuickActionLabel>
        </QuickAction>
      </QuickActions>
    </Container>
  );
};

export default EmergencySOS;
