/**
 * Alert Summary Card Component
 * NLP-powered alert summarization with sentiment analysis
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FileText, TrendingUp, MapPin, Tag, Clock, AlertCircle, CheckCircle, MinusCircle } from 'lucide-react';
import { nlpService, AlertSummary } from '../../services/nlpService';
import { productionColors } from '../../styles/production-ui-system';

interface Props {
  alertText: string;
  showOriginal?: boolean;
}

const Container = styled.div`
  background: ${productionColors.background.secondary};
  border: 1px solid ${productionColors.border.primary};
  border-radius: 16px;
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
  color: ${productionColors.text.primary};
`;

const NLPBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: linear-gradient(135deg, #06B6D4, #8B5CF6);
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  color: white;
`;

const UrgencyBadge = styled.span<{ $urgency: string }>`
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  background: ${props => {
    switch (props.$urgency) {
      case 'critical': return 'rgba(220, 38, 38, 0.2)';
      case 'high': return 'rgba(249, 115, 22, 0.2)';
      case 'medium': return 'rgba(234, 179, 8, 0.2)';
      default: return 'rgba(34, 197, 94, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.$urgency) {
      case 'critical': return '#DC2626';
      case 'high': return '#F97316';
      case 'medium': return '#EAB308';
      default: return '#22C55E';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$urgency) {
      case 'critical': return 'rgba(220, 38, 38, 0.3)';
      case 'high': return 'rgba(249, 115, 22, 0.3)';
      case 'medium': return 'rgba(234, 179, 8, 0.3)';
      default: return 'rgba(34, 197, 94, 0.3)';
    }
  }};
`;

const SummaryBox = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${productionColors.border.secondary};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const SummaryText = styled.p`
  font-size: 16px;
  line-height: 1.7;
  color: ${productionColors.text.primary};
  margin: 0;
`;

const KeyPointsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 16px 0 0 0;
`;

const KeyPoint = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  color: ${productionColors.text.secondary};
  font-size: 14px;
  line-height: 1.5;

  &::before {
    content: "•";
    color: ${productionColors.brand.primary};
    font-weight: bold;
    flex-shrink: 0;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid ${productionColors.border.secondary};
  border-radius: 10px;
  padding: 12px;
  text-align: center;
`;

const MetricIcon = styled.div<{ $type: string }>`
  width: 32px;
  height: 32px;
  margin: 0 auto 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch (props.$type) {
      case 'negative': return 'rgba(239, 68, 68, 0.2)';
      case 'positive': return 'rgba(34, 197, 94, 0.2)';
      default: return 'rgba(148, 163, 184, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'negative': return '#EF4444';
      case 'positive': return '#22C55E';
      default: return '#94A3B8';
    }
  }};
`;

const MetricLabel = styled.div`
  font-size: 11px;
  color: ${productionColors.text.tertiary};
  margin-bottom: 4px;
`;

const MetricValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${productionColors.text.primary};
`;

const Section = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h4`
  font-size: 13px;
  font-weight: 600;
  color: ${productionColors.text.secondary};
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const EntityTag = styled.span<{ $type: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  background: ${props => {
    switch (props.$type) {
      case 'location': return 'rgba(59, 130, 246, 0.15)';
      case 'disaster': return 'rgba(239, 68, 68, 0.15)';
      case 'org': return 'rgba(34, 197, 94, 0.15)';
      default: return 'rgba(148, 163, 184, 0.15)';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'location': return '#3B82F6';
      case 'disaster': return '#EF4444';
      case 'org': return '#22C55E';
      default: return '#94A3B8';
    }
  }};
`;

const KeywordTag = styled.span`
  padding: 4px 10px;
  background: rgba(139, 92, 246, 0.15);
  color: #A78BFA;
  border-radius: 6px;
  font-size: 12px;
`;

const NumbersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NumberItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
`;

const NumberValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${productionColors.text.primary};
`;

const NumberContext = styled.span`
  font-size: 12px;
  color: ${productionColors.text.tertiary};
`;

const OriginalText = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid ${productionColors.border.secondary};
`;

const OriginalTextTitle = styled.div`
  font-size: 12px;
  color: ${productionColors.text.tertiary};
  margin-bottom: 8px;
`;

const OriginalTextContent = styled.p`
  font-size: 13px;
  color: ${productionColors.text.tertiary};
  line-height: 1.6;
  margin: 0;
  font-style: italic;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${productionColors.border.secondary};
  font-size: 12px;
  color: ${productionColors.text.tertiary};
`;

export const AlertSummaryCard: React.FC<Props> = ({ alertText, showOriginal = false }) => {
  const [summary, setSummary] = useState<AlertSummary | null>(null);

  useEffect(() => {
    if (alertText) {
      const result = nlpService.summarizeAlert(alertText);
      setSummary(result);
    }
  }, [alertText]);

  if (!summary) return null;

  const getSentimentIcon = () => {
    switch (summary.sentiment.label) {
      case 'negative': return <AlertCircle size={16} />;
      case 'positive': return <CheckCircle size={16} />;
      default: return <MinusCircle size={16} />;
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <FileText size={20} />
          Alert Summary
          <NLPBadge>NLP</NLPBadge>
        </Title>
        <UrgencyBadge $urgency={summary.sentiment.urgency}>
          {summary.sentiment.urgency} Urgency
        </UrgencyBadge>
      </Header>

      <SummaryBox>
        <SummaryText>{summary.summary}</SummaryText>
        {summary.keyPoints.length > 0 && (
          <KeyPointsList>
            {summary.keyPoints.slice(0, 3).map((point, index) => (
              <KeyPoint key={index}>{point}</KeyPoint>
            ))}
          </KeyPointsList>
        )}
      </SummaryBox>

      <MetricsGrid>
        <MetricCard>
          <MetricIcon $type={summary.sentiment.label}>
            {getSentimentIcon()}
          </MetricIcon>
          <MetricLabel>Sentiment</MetricLabel>
          <MetricValue style={{ textTransform: 'capitalize' }}>{summary.sentiment.label}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricIcon $type="neutral">
            <TrendingUp size={16} />
          </MetricIcon>
          <MetricLabel>Score</MetricLabel>
          <MetricValue>{(summary.sentiment.score * 100).toFixed(0)}%</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricIcon $type="neutral">
            <Clock size={16} />
          </MetricIcon>
          <MetricLabel>Read Time</MetricLabel>
          <MetricValue>{summary.readingTime}s</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricIcon $type="neutral">
            <Tag size={16} />
          </MetricIcon>
          <MetricLabel>Keywords</MetricLabel>
          <MetricValue>{summary.keywords.length}</MetricValue>
        </MetricCard>
      </MetricsGrid>

      {(summary.entities.locations.length > 0 || summary.entities.disasters.length > 0) && (
        <Section>
          <SectionTitle>
            <MapPin size={14} />
            Extracted Entities
          </SectionTitle>
          <TagsContainer>
            {summary.entities.locations.map((loc, i) => (
              <EntityTag key={`loc-${i}`} $type="location">
                <MapPin size={12} /> {loc}
              </EntityTag>
            ))}
            {summary.entities.disasters.map((disaster, i) => (
              <EntityTag key={`dis-${i}`} $type="disaster">
                <AlertCircle size={12} /> {disaster}
              </EntityTag>
            ))}
            {summary.entities.organizations.map((org, i) => (
              <EntityTag key={`org-${i}`} $type="org">
                {org}
              </EntityTag>
            ))}
          </TagsContainer>
        </Section>
      )}

      {summary.entities.numbers.length > 0 && (
        <Section>
          <SectionTitle>
            <TrendingUp size={14} />
            Key Statistics
          </SectionTitle>
          <NumbersList>
            {summary.entities.numbers.slice(0, 4).map((num, i) => (
              <NumberItem key={i}>
                <NumberValue>{num.value}</NumberValue>
                <NumberContext>{num.context}</NumberContext>
              </NumberItem>
            ))}
          </NumbersList>
        </Section>
      )}

      <Section>
        <SectionTitle>
          <Tag size={14} />
          Keywords
        </SectionTitle>
        <TagsContainer>
          {summary.keywords.slice(0, 8).map((keyword, i) => (
            <KeywordTag key={i}>{keyword}</KeywordTag>
          ))}
        </TagsContainer>
      </Section>

      {showOriginal && (
        <OriginalText>
          <OriginalTextTitle>Original Text</OriginalTextTitle>
          <OriginalTextContent>{summary.originalText}</OriginalTextContent>
        </OriginalText>
      )}

      <Footer>
        <span>Processed at {summary.timestamp.toLocaleTimeString()}</span>
        <span>{summary.originalText.split(/\s+/).length} words analyzed</span>
      </Footer>
    </Container>
  );
};

export default AlertSummaryCard;
