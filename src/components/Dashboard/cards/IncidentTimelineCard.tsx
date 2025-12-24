import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardContent, Badge, IconWrapper, FlexRow } from './CardStyles';

interface IncidentTimelineCardProps {
  incidents: any[];
}

const IncidentTimelineCard: React.FC<IncidentTimelineCardProps> = ({ incidents }) => {
  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'flood': return '🌊';
      case 'storm': return '⛈️';
      case 'earthquake': return '🏔️';
      case 'fire': return '🔥';
      default: return '⚠️';
    }
  };

  const getIncidentVariant = (severity: string) => {
    switch (severity) {
      case 'high': return 'danger';
      case 'moderate': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const hours = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card variant="info" size="medium">
      <CardHeader>
        <h3>
          <IconWrapper variant="info">
            <BarChart3 size={20} />
          </IconWrapper>
          Recent Incidents
        </h3>
        <Badge variant="info">
          <TrendingUp size={14} />
          Live Tracking
        </Badge>
      </CardHeader>
      
      <CardContent>
        {/* Timeline Chart Placeholder */}
        <div style={{ 
          height: '120px', 
          background: 'linear-gradient(135deg, rgba(76, 209, 199, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(76, 209, 199, 0.2)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Mock chart bars */}
          <div style={{ display: 'flex', alignItems: 'end', gap: '8px', height: '80px' }}>
            {[30, 45, 25, 60, 35, 50, 40].map((height, index) => (
              <div
                key={index}
                style={{
                  width: '20px',
                  height: `${height}%`,
                  background: `linear-gradient(180deg, #4fd1c7 0%, #38b2ac ${height}%)`,
                  borderRadius: '4px 4px 0 0',
                  opacity: 0.8
                }}
              />
            ))}
          </div>
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            fontSize: '0.7rem',
            color: '#a0aec0'
          }}>
            Last 7 days
          </div>
        </div>

        {/* Recent Incidents List */}
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#cbd5e0' }}>
            Recent Events
          </h4>
          
          {(incidents || []).slice(0, 3).map((incident, index) => (
            <FlexRow 
              key={index} 
              gap="1rem" 
              style={{ 
                padding: '0.75rem',
                marginBottom: '0.5rem',
                background: 'rgba(45, 55, 72, 0.5)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ fontSize: '1.2rem' }}>
                {getIncidentIcon(incident.type)}
              </div>
              <div style={{ flex: 1 }}>
                <FlexRow gap="0.5rem" justify="space-between">
                  <span style={{ fontSize: '0.9rem', color: '#e2e8f0', textTransform: 'capitalize' }}>
                    {incident.type} Event
                  </span>
                  <Badge variant={getIncidentVariant(incident.severity)}>
                    {incident.severity}
                  </Badge>
                </FlexRow>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#a0aec0' }}>
                  {getTimeAgo(incident.time)}
                </p>
              </div>
            </FlexRow>
          ))}
        </div>

        {/* Summary Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '1rem',
          padding: '1rem',
          background: 'rgba(76, 209, 199, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(76, 209, 199, 0.2)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#4fd1c7' }}>
              {incidents.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Total</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fbd38d' }}>
              {incidents.filter(i => i.severity === 'high').length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>High Risk</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#68d391' }}>
              24h
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Tracking</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncidentTimelineCard;