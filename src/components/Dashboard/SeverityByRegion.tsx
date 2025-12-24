import React from 'react';
import styled from 'styled-components';
import { MapPin, Info } from 'lucide-react';
import { Card, Heading, Text, Flex, StatusIndicator } from '../../styles/components';
import { RegionSeverity } from '../../types';

const SeverityContainer = styled(Card)`
  max-height: 250px;
`;

const SeverityHeader = styled(Flex)`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  padding-bottom: ${({ theme }) => theme.spacing[3]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const RegionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const RegionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface.default};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.surface.hover};
    transform: translateX(2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const RegionInfo = styled(Flex)`
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  flex: 1;
`;

const RegionIcon = styled.div<{ $riskLevel: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $riskLevel, theme }) => {
    switch ($riskLevel) {
      case 'Critical':
        return `${theme.colors.danger[500]}20`;
      case 'High':
        return `${theme.colors.warning[500]}20`;
      case 'Moderate':
        return `${theme.colors.info[500]}20`;
      default:
        return theme.colors.success[50];
    }
  }};
  color: ${({ $riskLevel, theme }) => {
    switch ($riskLevel) {
      case 'Critical':
        return theme.colors.danger[500];
      case 'High':
        return theme.colors.warning[500];
      case 'Moderate':
        return '#3b82f6';
      default:
        return theme.colors.success[500];
    }
  }};
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const RegionDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const RegionStats = styled(Flex)`
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const PercentageBar = styled.div<{ $percentage: number; $riskLevel: string }>`
  width: 40px;
  height: 4px;
  background: ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${({ $percentage }) => $percentage}%;
    background: ${({ $riskLevel, theme }) => {
      switch ($riskLevel) {
        case 'Critical':
          return theme.colors.danger[500];
        case 'High':
          return theme.colors.warning[500];
        case 'Moderate':
          return '#3b82f6';
        default:
          return theme.colors.success[500];
      }
    }};
    border-radius: inherit;
    transition: ${({ theme }) => theme.transitions.normal};
  }
`;

const PercentageValue = styled(Text)`
  min-width: 35px;
  text-align: right;
`;

interface SeverityByRegionProps {
  regions?: RegionSeverity[];
}

const mockRegions: RegionSeverity[] = [
  {
    region: 'High Fire Risk',
    riskLevel: 'Critical',
    percentage: 85,
    color: '#f44336'
  },
  {
    region: 'Storm Alert',
    riskLevel: 'High',
    percentage: 72,
    color: '#ff9800'
  },
  {
    region: 'Flood/storm',
    riskLevel: 'Moderate',
    percentage: 58,
    color: '#2196f3'
  },
  {
    region: 'Moderate Storm',
    riskLevel: 'Moderate',
    percentage: 45,
    color: '#2196f3'
  },
  {
    region: 'Emergency',
    riskLevel: 'Critical',
    percentage: 90,
    color: '#f44336'
  }
];

const SeverityByRegion: React.FC<SeverityByRegionProps> = ({ 
  regions = mockRegions 
}) => {
  const getRiskStatus = (riskLevel: string): 'success' | 'warning' | 'danger' | 'info' => {
    switch (riskLevel) {
      case 'Critical':
        return 'danger';
      case 'High':
        return 'warning';
      case 'Moderate':
        return 'info';
      default:
        return 'success';
    }
  };

  return (
    <SeverityContainer>
      <SeverityHeader justify="between" align="center">
        <Heading level={5} weight="semibold">Severity by Region</Heading>
        <Info size={16} color="#64748b" />
      </SeverityHeader>
      
      <RegionList>
        {(regions || []).slice(0, 4).map((region, index) => (
          <RegionItem key={index}>
            <RegionInfo>
              <RegionIcon $riskLevel={region.riskLevel}>
                <MapPin />
              </RegionIcon>
              <RegionDetails>
                <Text size="sm" weight="medium">{region.region}</Text>
                <Flex align="center" gap="4px" style={{ marginTop: '2px' }}>
                  <StatusIndicator status={getRiskStatus(region.riskLevel)} size="sm" />
                  <Text size="xs" color="secondary">{region.riskLevel} Risk</Text>
                </Flex>
              </RegionDetails>
            </RegionInfo>
            
            <RegionStats>
              <PercentageBar 
                $percentage={region.percentage} 
                $riskLevel={region.riskLevel}
              />
              <PercentageValue size="xs" weight="medium">
                {region.percentage}%
              </PercentageValue>
            </RegionStats>
          </RegionItem>
        ))}
      </RegionList>
    </SeverityContainer>
  );
};

export default SeverityByRegion;