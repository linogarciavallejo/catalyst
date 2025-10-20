import { render, screen, fireEvent } from '@testing-library/react';
import UserProfile from '@/components/features/UserProfile';

const user = {
  id: 'user-1',
  displayName: 'Alex Johnson',
  email: 'alex@example.com',
  joinDate: new Date('2023-06-15T00:00:00Z'),
  role: 'Admin',
  bio: 'Product lead',
  ideasCount: 5,
  commentsCount: 12,
  followersCount: 20,
  followingCount: 8,
};

describe('UserProfile', () => {
  it('renders own profile actions', () => {
    const onEditClick = vi.fn();
    const onLogoutClick = vi.fn();

    render(
      <UserProfile
        user={user as any}
        isOwnProfile
        onEditClick={onEditClick}
        onLogoutClick={onLogoutClick}
      />
    );

    expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
    expect(screen.getByText('Product lead')).toBeInTheDocument();
    expect(screen.getByText(/Joined/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Edit Profile'));
    fireEvent.click(screen.getByText('Logout'));

    expect(onEditClick).toHaveBeenCalled();
    expect(onLogoutClick).toHaveBeenCalled();
  });

  it('renders other profile actions', () => {
    const onFollowClick = vi.fn();
    const onMessageClick = vi.fn();

    render(
      <UserProfile
        user={{ ...user, role: 'User' } as any}
        onFollowClick={onFollowClick}
        onMessageClick={onMessageClick}
      />
    );

    fireEvent.click(screen.getByText('Follow'));
    fireEvent.click(screen.getByText('Message'));

    expect(onFollowClick).toHaveBeenCalled();
    expect(onMessageClick).toHaveBeenCalled();
  });
});
