import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, MapPin, Clock, Activity } from 'lucide-react';
import { Card, Heading, Text, StatusIndicator, Flex } from '../../styles/components';
import { IncidentData } from '../../types';

const IncidentsContainer = styled(Card)`
  max-height: 300px;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const IncidentsHeader = styled(Flex)`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  padding-bottom: ${({ theme }) => theme.spacing[3]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const IncidentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const IncidentItem = styled.div<{ $riskLevel: string }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.default};
  background: ${({ $riskLevel, theme }) => {
    switch ($riskLevel) {
      case 'HIGH':
        return theme.colors.danger[50];
      case 'MEDIUM':
        return theme.colors.warning[50];
      default:
        return '#f0f9ff';
    }
  }};
  border: 1px solid ${({ $riskLevel, theme }) => {
    switch ($riskLevel) {
      case 'HIGH':
        return theme.colors.danger[500];
      case 'MEDIUM':
        return theme.colors.warning[500];
      default:
        return '#3b82f6';
    }
  }};
  border-left: 3px solid ${({ $riskLevel, theme }) => {
    switch ($riskLevel) {
      case 'HIGH':
        return theme.colors.danger[500];
      case 'MEDIUM':
        return theme.colors.warning[500];
      default:
        return '#3b82f6';
    }
  }};
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    background: ${({ $riskLevel, theme }) => {
      switch ($riskLevel) {
        case 'HIGH':
          return theme.colors.danger[50];
        case 'MEDIUM':
          return theme.colors.warning[50];
        default:
          return '#e0f2fe';
      }
    }};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const IncidentIcon = styled.div<{ type: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ type }) => {
    switch (type) {
      case 'Forest Fire':
        return '#fef2f2';
      case 'Flooding':
        return '#f0f9ff';
      case 'Storm':
        return '#fff7ed';
      default:
        return '#f8fafc';
    }
  }};
  color: ${({ type }) => {
    switch (type) {
      case 'Forest Fire':
        return '#dc2626';
      case 'Flooding':
        return '#0ea5e9';
      case 'Storm':
        return '#ea580c';
      default:
        return '#64748b';
    }
  }};
  border: 1px solid ${({ type }) => {
    switch (type) {
      case 'Forest Fire':
        return '#fecaca';
      case 'Flooding':
        return '#bae6fd';
      case 'Storm':
        return '#fed7aa';
      default:
        return '#e2e8f0';
    }
  }};
  flex-shrink: 0;
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const IncidentContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const IncidentHeader = styled(Flex)`
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const IncidentMeta = styled(Flex)`
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const StatusBadge = styled.div<{ $status: string }>`
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background: ${({ $status, theme }) => {
    switch ($status) {
      case 'Active':
        return theme.colors.danger + '30';
      case 'Monitoring':
        return theme.colors.warning + '30';
      default:
        return theme.colors.success + '30';
    }
  }};
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'Active':
        return theme.colors.danger;
      case 'Monitoring':
        return theme.colors.warning;
      default:
        return theme.colors.success;
    }
  }};
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const RiskBadge = styled.div<{ $riskLevel: string }>`
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  background: ${({ $riskLevel, theme }) => {
    switch ($riskLevel) {
      case 'HIGH':
        return theme.colors.danger;
      case 'MEDIUM':
        return theme.colors.warning;
      default:
        return theme.colors.info;
    }
  }};
  color: ${({ theme }) => theme.colors.text.primary};
`;

interface ActiveIncidentsProps {
  incidents?: IncidentData[];
}

const mockIncidents: IncidentData[] = [
  {
    id: '1',
    type: 'Forest Fire',
    location: 'Northfix risk',
    status: 'Active',
    specification: 'Specification Peaks (HIGH)',
    riskLevel: 'HIGH',
    timestamp: '2025-10-13T08:30:00Z'
  },
  {
    id: '2',
    type: 'Flooding',
    location: 'Central Valley',
    status: 'Monitoring',
    specification: 'River overflow detected',
    riskLevel: 'MEDIUM',
    timestamp: '2025-10-13T07:15:00Z'
  },
  {
    id: '3',
    type: 'Storm',
    location: 'Coastal Region',
    status: 'Active',
    specification: 'High wind conditions',
    riskLevel: 'HIGH',
    timestamp: '2025-10-13T06:45:00Z'
  },
  {
    id: '4',
    type: 'Earthquake',
    location: 'Mountain Range',
    status: 'Resolved',
    specification: 'Minor seismic activity',
    riskLevel: 'LOW',
    timestamp: '2025-10-13T05:00:00Z'
  }
];

const ActiveIncidents: React.FC<ActiveIncidentsProps> = ({ 
  incidents = mockIncidents 
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Forest Fire':
        return <AlertTriangle />;
      case 'Flooding':
        return <Activity />;
      case 'Storm':
        return <Activity />;
      default:
        return <MapPin />;
    }
  };

  const getRiskStatus = (riskLevel: string): 'success' | 'warning' | 'danger' | 'info' => {
    switch (riskLevel) {
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'info';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const incidentTime = new Date(timestamp);
    const diffMs = now.getTime() - incidentTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return `${diffMinutes}m ago`;
    }
  };

  const activeIncidentsCount = (incidents || []).filter(incident => incident.status === 'Active').length;

  return (
    <IncidentsContainer>
      <IncidentsHeader justify="between" align="center">
        <Flex align="center" gap="8px">
          <Activity size={16} />
          <Heading level={5} weight="semibold">Active Incidents</Heading>
        </Flex>
        <StatusIndicator 
          status={activeIncidentsCount > 0 ? 'danger' : 'success'} 
          size="sm" 
        />
      </IncidentsHeader>
      
      <IncidentsList>
        {(incidents || []).slice(0, 5).map((incident) => (
          <IncidentItem key={incident.id} $riskLevel={incident.riskLevel}>
            <IncidentIcon type={incident.type}>
              {getTypeIcon(incident.type)}
            </IncidentIcon>
            <IncidentContent>
              <IncidentHeader justify="between" align="start">
                <div>
                  <Text size="sm" weight="medium">{incident.type}</Text>
                  <Flex align="center" gap="4px" style={{ marginTop: '2px' }}>
                    <MapPin size={10} />
                    <Text size="xs" color="secondary">{incident.location}</Text>
                  </Flex>
                </div>
                <RiskBadge $riskLevel={incident.riskLevel}>
                  {incident.riskLevel}
                </RiskBadge>
              </IncidentHeader>
              
              <Text size="xs" color="secondary" style={{ marginBottom: '4px' }}>
                {incident.specification}
              </Text>
              
              <IncidentMeta justify="between" align="center">
                <StatusBadge $status={incident.status}>
                  <StatusIndicator 
                    status={getRiskStatus(incident.riskLevel)} 
                    size="sm" 
                  />
                  {incident.status}
                </StatusBadge>
                <Flex align="center" gap="4px">
                  <Clock size={10} />
                  <Text size="xs" color="secondary">
                    {formatTimeAgo(incident.timestamp)}
                  </Text>
                </Flex>
              </IncidentMeta>
            </IncidentContent>
          </IncidentItem>
        ))}
      </IncidentsList>
    </IncidentsContainer>
  );
};

export default ActiveIncidents;