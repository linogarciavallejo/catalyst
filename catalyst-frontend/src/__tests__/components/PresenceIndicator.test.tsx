import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PresenceIndicator from '../../components/PresenceIndicator';

describe('PresenceIndicator Component', () => {
  it('should not render when users array is empty', () => {
    const { container } = render(<PresenceIndicator users={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when users is undefined', () => {
    const { container } = render(
      <PresenceIndicator users={undefined as unknown as string[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render presence indicator with single user', () => {
    const { container } = render(
      <PresenceIndicator users={['Alice']} ideaId="idea-1" />
    );
    expect(container.querySelector('.presence-indicator-container')).toBeTruthy();
  });

  it('should render avatar badges', () => {
    const { container } = render(
      <PresenceIndicator users={['Alice']} ideaId="idea-1" />
    );
    const avatars = container.querySelectorAll('.presence-avatar');
    expect(avatars.length).toBeGreaterThan(0);
  });

  it('should show single user viewing correctly', () => {
    render(<PresenceIndicator users={['Alice']} ideaId="idea-1" />);
    expect(screen.getByText(/Alice viewing/)).toBeTruthy();
  });

  it('should show multiple users viewing correctly', () => {
    render(<PresenceIndicator users={['Alice', 'Bob']} ideaId="idea-1" />);
    expect(screen.getByText(/2 viewing/)).toBeTruthy();
  });

  it('should show user initials in avatars', () => {
    const { container } = render(
      <PresenceIndicator users={['Alice']} ideaId="idea-1" />
    );
    const avatars = container.querySelectorAll('.presence-avatar');
    expect(avatars[0]?.textContent).toBe('AL');
  });

  it('should show +N more when more than 4 users', () => {
    render(
      <PresenceIndicator
        users={['Alice', 'Bob', 'Charlie', 'Diana', 'Eve']}
        ideaId="idea-1"
      />
    );
    expect(screen.getByText(/\+1/)).toBeTruthy();
  });

  it('should have presence-indicator-container class', () => {
    const { container } = render(
      <PresenceIndicator users={['Alice']} ideaId="idea-1" />
    );
    expect(
      container.querySelector('.presence-indicator-container')?.className
    ).toContain('presence-indicator-container');
  });

  it('should have presence-avatars class', () => {
    const { container } = render(
      <PresenceIndicator users={['Alice']} ideaId="idea-1" />
    );
    expect(
      container.querySelector('.presence-avatars')?.className
    ).toContain('presence-avatars');
  });

  it('should have presence-label', () => {
    const { container } = render(
      <PresenceIndicator users={['Alice']} ideaId="idea-1" />
    );
    expect(
      container.querySelector('.presence-label')
    ).toBeTruthy();
  });
});
