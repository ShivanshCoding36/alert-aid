import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import EvacuationSafetyModule from '../components/Safety/EvacuationSafetyModule';
import LeafletEvacuationMap from '../components/Map/LeafletEvacuationMap';
import { productionColors, productionCard } from '../styles/production-ui-system';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const EvacuationContainer = styled.div`
  min-height: 100vh;
  padding: 88px 24px 24px;
  background: ${productionColors.background.primary};
  color: ${productionColors.text.primary};
  position: relative;
  z-index: 1;
`;

const PageHeader = styled.div`
  max-width: 1400px;
  margin: 0 auto 32px;
`;

const PageTitle = styled.h1`
  font-size: 42px;
  font-weight: 800;
  background: linear-gradient(135deg, ${productionColors.brand.primary}, ${productionColors.brand.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AlertBadge = styled.span<{ $active: boolean }>`
  font-size: 14px;
  padding: 6px 14px;
  border-radius: 20px;
  background: ${props => props.$active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'};
  color: ${props => props.$active ? '#EF4444' : '#22C55E'};
  border: 1px solid ${props => props.$active ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'};
  -webkit-background-clip: unset;
  -webkit-text-fill-color: unset;
  animation: ${props => props.$active ? pulse : 'none'} 2s infinite;
`;

const PageDescription = styled.p`
  font-size: 16px;
  color: ${productionColors.text.secondary};
  max-width: 800px;
  line-height: 1.6;
`;

const TabContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto 24px;
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  padding: 6px;
  border-radius: 12px;
  width: fit-content;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, #3B82F6, #6366F1)' 
    : 'transparent'};
  color: ${props => props.$active 
    ? 'white' 
    : productionColors.text.secondary};
  
  &:hover {
    background: ${props => props.$active 
      ? 'linear-gradient(135deg, #3B82F6, #6366F1)' 
      : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const EvacuationContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const MapCard = styled.div`
  ${productionCard}
  padding: 24px;
  margin-bottom: 24px;
`;

const MapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const MapTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${productionColors.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ $variant?: 'danger' | 'primary' }>`
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  ${props => props.$variant === 'danger' ? `
    background: linear-gradient(135deg, #EF4444, #DC2626);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    }
  ` : `
    background: rgba(255, 255, 255, 0.05);
    color: ${productionColors.text.primary};
    border: 1px solid ${productionColors.border.secondary};
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`;

const EvacuationCard = styled.div`
  ${productionCard}
  padding: 24px;
`;

const EvacuationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'routes' | 'checklist'>('map');
  
  return (
    <EvacuationContainer>
      <PageHeader>
        <PageTitle>
          🚨 Evacuation Routes
          <AlertBadge $active={false}>
            ✓ ALL CLEAR
          </AlertBadge>
        </PageTitle>
        <PageDescription>
          Find the safest evacuation routes from your current location in case of emergency.
          Get real-time updates on route conditions, traffic, and shelter availability.
        </PageDescription>
      </PageHeader>

      <TabContainer>
        <Tab $active={activeTab === 'map'} onClick={() => setActiveTab('map')}>
          🗺️ Interactive Map
        </Tab>
        <Tab $active={activeTab === 'routes'} onClick={() => setActiveTab('routes')}>
          🛤️ Route Details
        </Tab>
        <Tab $active={activeTab === 'checklist'} onClick={() => setActiveTab('checklist')}>
          ✅ Safety Checklist
        </Tab>
      </TabContainer>

      <EvacuationContent>
        {activeTab === 'map' && (
          <MapCard>
            <MapHeader>
              <MapTitle>
                📍 Live Evacuation Map (OpenStreetMap)
              </MapTitle>
              <QuickActions>
                <ActionButton>
                  📍 Recenter
                </ActionButton>
                <ActionButton>
                  🔄 Refresh Routes
                </ActionButton>
                <ActionButton $variant="danger">
                  🆘 Emergency Call
                </ActionButton>
              </QuickActions>
            </MapHeader>
            <LeafletEvacuationMap />
          </MapCard>
        )}

        {activeTab === 'routes' && (
          <EvacuationCard>
            <EvacuationSafetyModule />
          </EvacuationCard>
        )}

        {activeTab === 'checklist' && (
          <EvacuationCard>
            <EvacuationSafetyModule />
          </EvacuationCard>
        )}
      </EvacuationContent>
    </EvacuationContainer>
  );
};

export default EvacuationPage;
