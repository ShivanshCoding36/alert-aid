// ================================
// File: src/components/Footer.tsx
// ================================

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Mail, Github } from 'lucide-react';
import { productionColors } from '../styles/production-ui-system';

const FooterWrapper = styled.footer`
  margin-top: 80px;
  padding: 48px 24px 24px;
  background: linear-gradient(135deg, #020617, #020617ee);
  border-top: 1px solid rgba(99, 102, 241, 0.2);
`;

const FooterGrid = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FooterColumn = styled.div`
  color: ${productionColors.text.secondary};

  h4 {
    color: ${productionColors.text.primary};
    font-size: 16px;
    margin-bottom: 12px;
  }

  a {
    display: block;
    color: ${productionColors.text.secondary};
    text-decoration: none;
    font-size: 14px;
    margin-bottom: 8px;

    &:hover {
      color: ${productionColors.brand.primary};
    }
  }
`;

const FooterBottom = styled.div`
  max-width: 1400px;
  margin: 32px auto 0;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`;

const Footer: React.FC = () => (
  <FooterWrapper>
    <FooterGrid>
      <FooterColumn>
        <h4>Alert Aid</h4>
        <p style={{ fontSize: '14px', lineHeight: 1.6 }}>
          AI-powered disaster prediction and emergency response platform
          delivering early warnings, real-time risk analysis, and evacuation
          guidance to protect lives.
        </p>
      </FooterColumn>

      <FooterColumn>
        <h4>Platform</h4>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/alerts">Alerts</Link>
        <Link to="/evacuation">Evacuation</Link>
        <Link to="/predictions">Predictions</Link>
      </FooterColumn>

      <FooterColumn>
        <h4>Legal</h4>
        <Link to="/privacy-policy">Privacy Policy</Link>
        <Link to="/terms">Terms & Conditions</Link>
      </FooterColumn>

      <FooterColumn>
        <h4>Contact</h4>
        <a href="mailto:alertaid.support@gmail.com"><Mail size={14} /> Email</a>
        <a href="https://github.com/Anshiii-01/alert-aid" target="_blank" rel="noreferrer">
          <Github size={14} /> GitHub
        </a>
      </FooterColumn>
    </FooterGrid>

    <FooterBottom>
      <span>© {new Date().getFullYear()} Alert Aid</span>
      <span>Disaster preparedness • Public safety • AI</span>
    </FooterBottom>
  </FooterWrapper>
);

export default Footer;
