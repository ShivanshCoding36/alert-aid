import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Bell, X, Filter, CheckCheck, Settings, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Notification, NotificationFilter } from '../../types/notifications';
import { Card, Button, Heading, Text, Flex } from '../../styles/components';

// Professional Dark Notification Tray
const NotificationTray = styled(Card)<{ $isOpen: boolean }>`
  position: fixed;
  top: 70px;
  right: ${({ $isOpen }) => $isOpen ? '0' : '-420px'};
  width: 420px;
  height: calc(100vh - 70px);
  background: ${({ theme }) => theme.colors.surface.default};
  border-left: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  flex-direction: column;
  transition: ${({ theme }) => theme.transitions.normal};
  z-index: ${({ theme }) => theme.zIndex.modal};
  box-shadow: ${({ $isOpen, theme }) => 
    $isOpen ? `-8px 0 32px rgba(0, 0, 0, 0.3)` : 'none'};
`;

const TrayHeader = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  background: ${({ theme }) => theme.colors.background.secondary};
`;

const TrayContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing[2]};
`;

const TrayFooter = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  background: ${({ theme }) => theme.colors.background.secondary};
`;

const FilterRow = styled(Flex)`
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[3]};
`;

const FilterChip = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 1px solid ${({ theme, $active }) => 
    $active ? theme.colors.primary[500] : theme.colors.border.default};
  background: ${({ theme, $active }) => 
    $active ? theme.colors.primary[500] : theme.colors.surface.default};
  color: ${({ theme, $active }) => 
    $active ? theme.colors.text.inverse : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme, $active }) => 
      $active ? theme.colors.primary[600] : theme.colors.surface.hover};
    border-color: ${({ theme, $active }) => 
      $active ? theme.colors.primary[600] : theme.colors.border.light};
  }
`;

// Professional Notification Item
const NotificationItem = styled.div<{ severity: string; $isRead: boolean }>`
  padding: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
  background: ${({ theme, $isRead }) => 
    $isRead ? theme.colors.surface.default : theme.colors.surface.hover};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 3px solid ${({ severity, theme }) => {
    switch (severity) {
      case 'critical': return theme.colors.danger[500];
      case 'high': return theme.colors.warning[500];
      case 'medium': return theme.colors.info[500];
      case 'low': return theme.colors.success[500];
      default: return theme.colors.primary[500];
    }
  }};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.surface.hover};
  }
`;

const NotificationHeader = styled(Flex)`
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const SeverityIcon = ({ severity }: { severity: string }) => {
  const iconProps = { size: 14 };
  
  switch (severity) {
    case 'critical':
      return <AlertCircle {...iconProps} style={{ color: '#ef4444' }} />;
    case 'high':
      return <AlertTriangle {...iconProps} style={{ color: '#f59e0b' }} />;
    case 'medium':
      return <Info {...iconProps} style={{ color: '#06b6d4' }} />;
    case 'low':
      return <CheckCircle {...iconProps} style={{ color: '#10b981' }} />;
    default:
      return <Info {...iconProps} style={{ color: '#3b82f6' }} />;
  }
};

const NotificationMeta = styled(Flex)`
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing[8]};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

// Professional Bell Icon with Badge
const BellContainer = styled.button`
  position: relative;
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.surface.default};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.surface.hover};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.border.light};
  }
`;

const NotificationBadge = styled.div<{ count: number }>`
  position: absolute;
  top: -2px;
  right: -2px;
  background: ${({ theme }) => theme.colors.danger[500]};
  color: ${({ theme }) => theme.colors.text.inverse};
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  transform: ${({ count }) => count > 0 ? 'scale(1)' : 'scale(0)'};
  transition: transform 0.2s ease;
`;

// Overlay for mobile
const TrayOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.overlay.medium};
  backdrop-filter: blur(4px);
  z-index: ${({ theme }) => theme.zIndex.modal - 1};
  opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transition: all 0.2s ease;
  
  @media (min-width: 1024px) {
    display: none;
  }
`;

interface NotificationTraySystemProps {
  children?: React.ReactNode;
}

export const NotificationTraySystem: React.FC<NotificationTraySystemProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>({});
  const { notifications, markAsRead, markAllAsRead, clearAll, getUnreadCount } = useNotifications();

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    if (filter.type && filter.type.length > 0) {
      filtered = filtered.filter(n => filter.type?.includes(n.type));
    }

    if (filter.priority && filter.priority.length > 0) {
      filtered = filtered.filter(n => filter.priority?.includes(n.priority || 'normal'));
    }

    if (filter.read !== undefined) {
      filtered = filtered.filter(n => n.read === filter.read);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [notifications, filter]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const toggleFilter = (key: keyof NotificationFilter, value: any) => {
    setFilter(prev => {
      if (key === 'read') {
        return { ...prev, [key]: prev[key] === value ? undefined : value };
      }
      
      const currentArray = prev[key] as any[] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return { ...prev, [key]: newArray.length > 0 ? newArray : undefined };
    });
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString();
  };

  const unreadCount = getUnreadCount();

  return (
    <>
      {/* Notification Bell */}
      <BellContainer onClick={() => setIsOpen(!isOpen)}>
        <Bell size={18} />
        <NotificationBadge count={unreadCount}>
          {unreadCount > 99 ? '99+' : unreadCount || 0}
        </NotificationBadge>
      </BellContainer>

      {/* Overlay for mobile */}
      <TrayOverlay 
        $isOpen={isOpen} 
        onClick={() => setIsOpen(false)}
      />

      {/* Professional Notification Tray */}
      <NotificationTray $isOpen={isOpen}>
        <TrayHeader>
          <Flex justify="between" align="center">
            <Flex align="center" gap="8px">
              <Bell size={18} />
              <Heading level={5} weight="semibold">
                Notifications
              </Heading>
              {unreadCount > 0 && (
                <Text size="xs" style={{ 
                  background: '#ef4444', 
                  color: 'white', 
                  padding: '2px 6px', 
                  borderRadius: '10px',
                  fontWeight: '600'
                }}>
                  {unreadCount}
                </Text>
              )}
            </Flex>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </Button>
          </Flex>

          {/* Filter Controls */}
          <FilterRow>
            <FilterChip
              $active={filter.read === false}
              onClick={() => toggleFilter('read', false)}
            >
              Unread
            </FilterChip>
            <FilterChip
              $active={filter.priority?.includes('critical') || false}
              onClick={() => toggleFilter('priority', 'critical')}
            >
              Critical
            </FilterChip>
            <FilterChip
              $active={filter.priority?.includes('high') || false}
              onClick={() => toggleFilter('priority', 'high')}
            >
              High
            </FilterChip>
            <FilterChip
              $active={filter.type?.includes('error') || false}
              onClick={() => toggleFilter('type', 'error')}
            >
              Errors
            </FilterChip>
          </FilterRow>
        </TrayHeader>

        <TrayContent>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                severity={notification.priority || 'normal'}
                $isRead={notification.read || false}
                onClick={() => handleNotificationClick(notification)}
              >
                <NotificationHeader>
                  <SeverityIcon severity={notification.priority || 'normal'} />
                  <Text size="sm" weight="medium" style={{ flex: 1 }}>
                    {notification.title}
                  </Text>
                  <Text size="xs" color="tertiary">
                    {formatTimeAgo(notification.timestamp)}
                  </Text>
                </NotificationHeader>
                
                {notification.message && (
                  <Text size="xs" color="secondary" style={{ marginLeft: '22px' }}>
                    {notification.message}
                  </Text>
                )}

                <NotificationMeta>
                  {notification.source && (
                    <Text size="xs" color="muted">
                      {notification.source}
                    </Text>
                  )}
                  {!notification.read && (
                    <div style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      background: '#3b82f6' 
                    }} />
                  )}
                </NotificationMeta>
              </NotificationItem>
            ))
          ) : (
            <EmptyState>
              <Bell size={32} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <Text size="sm" color="tertiary">
                {Object.keys(filter).length > 0 
                  ? 'No notifications match your filters'
                  : 'No notifications yet'
                }
              </Text>
            </EmptyState>
          )}
        </TrayContent>

        {notifications.length > 0 && (
          <TrayFooter>
            <Flex justify="between" align="center">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck size={14} />
                Mark all read
              </Button>
              
              <Flex gap="8px">
                <Button variant="ghost" size="sm">
                  <Settings size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                >
                  Clear all
                </Button>
              </Flex>
            </Flex>
          </TrayFooter>
        )}
      </NotificationTray>
    </>
  );
};

export default NotificationTraySystem;