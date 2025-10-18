import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { UserActivity } from '../../services/signalr/hubs/activityHub';
import ActiveUsersList from '../../components/ActiveUsersList';

describe('ActiveUsersList Component', () => {
  const mockUsers: UserActivity[] = [
    {
      userId: 'user-1',
      userName: 'Alice',
      activityType: 'typing',
      ideaId: 'idea-1',
      timestamp: new Date(),
    },
    {
      userId: 'user-2',
      userName: 'Bob',
      activityType: 'viewing',
      ideaId: 'idea-2',
      timestamp: new Date(),
    },
  ];

  it('should not render when users array is empty', () => {
    const { container } = render(<ActiveUsersList users={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when users is undefined', () => {
    const { container } = render(
      <ActiveUsersList users={undefined as unknown as UserActivity[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render active users list container', () => {
    const { container } = render(<ActiveUsersList users={mockUsers} />);
    expect(
      container.querySelector('.active-users-list-container')
    ).toBeTruthy();
  });

  it('should display active users header with count', () => {
    render(<ActiveUsersList users={mockUsers} />);
    expect(screen.getByText(/Active Users \(2\)/)).toBeTruthy();
  });

  it('should render all users in the list', () => {
    const { container } = render(<ActiveUsersList users={mockUsers} />);
    const userItems = container.querySelectorAll('.active-user-item');
    expect(userItems.length).toBeGreaterThan(0);
  });

  it('should show user names', () => {
    render(<ActiveUsersList users={mockUsers} />);
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('should show activity types', () => {
    render(<ActiveUsersList users={mockUsers} />);
    expect(screen.getByText('typing')).toBeTruthy();
    expect(screen.getByText('viewing')).toBeTruthy();
  });

  it('should have correct status dot classes', () => {
    const { container } = render(<ActiveUsersList users={mockUsers} />);
    const statusDots = container.querySelectorAll('.user-status-dot');
    expect(statusDots.length).toBeGreaterThan(0);
  });

  it('should show +N more when exceeding maxDisplay', () => {
    const manyUsers = Array.from({ length: 15 }, (_, i) => ({
      userId: `user-${i}`,
      userName: `User${i}`,
      activityType: 'idle' as const,
      timestamp: new Date(),
    }));

    render(<ActiveUsersList users={manyUsers} maxDisplay={10} />);
    expect(screen.getByText(/\+5 more/)).toBeTruthy();
  });

  it('should render with default maxDisplay of 10', () => {
    const users = Array.from({ length: 15 }, (_, i) => ({
      userId: `user-${i}`,
      userName: `User${i}`,
      activityType: 'idle' as const,
      timestamp: new Date(),
    }));

    render(<ActiveUsersList users={users} />);
    // Should show +5 more by default
    expect(screen.getByText(/\+5 more/)).toBeTruthy();
  });

  it('should have active-users-list class', () => {
    const { container } = render(<ActiveUsersList users={mockUsers} />);
    expect(
      container.querySelector('.active-users-list')?.className
    ).toContain('active-users-list');
  });

  it('should show user info section', () => {
    const { container } = render(<ActiveUsersList users={mockUsers} />);
    const userInfo = container.querySelector('.user-info');
    expect(userInfo).toBeTruthy();
  });

  it('should display typing status with icon', () => {
    const typingUser: UserActivity[] = [
      {
        userId: 'user-1',
        userName: 'Alice',
        activityType: 'typing',
        ideaId: 'idea-1',
        timestamp: new Date(),
      },
    ];

    const { container } = render(<ActiveUsersList users={typingUser} />);
    const statusDot = container.querySelector(
      '.user-status-dot.status-typing'
    );
    expect(statusDot).toBeTruthy();
  });

  it('should display viewing status with icon', () => {
    const viewingUser: UserActivity[] = [
      {
        userId: 'user-2',
        userName: 'Bob',
        activityType: 'viewing',
        ideaId: 'idea-1',
        timestamp: new Date(),
      },
    ];

    const { container } = render(<ActiveUsersList users={viewingUser} />);
    const statusDot = container.querySelector(
      '.user-status-dot.status-viewing'
    );
    expect(statusDot).toBeTruthy();
  });

  it('should display idle status with icon', () => {
    const idleUser: UserActivity[] = [
      {
        userId: 'user-3',
        userName: 'Charlie',
        activityType: 'idle',
        timestamp: new Date(),
      },
    ];

    const { container } = render(<ActiveUsersList users={idleUser} />);
    const statusDot = container.querySelector('.user-status-dot.status-idle');
    expect(statusDot).toBeTruthy();
  });

  it('should show idea indicator when ideaId is present', () => {
    const { container } = render(<ActiveUsersList users={mockUsers} />);
    const ideaIndicators = container.querySelectorAll(
      '.user-idea-indicator'
    );
    expect(ideaIndicators.length).toBeGreaterThan(0);
  });
});
