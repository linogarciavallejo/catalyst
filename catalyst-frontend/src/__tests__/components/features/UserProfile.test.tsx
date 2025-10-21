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

  it('omits optional sections for guest profiles without stats', () => {
    const { container } = render(
      <UserProfile
        user={{
          ...user,
          role: 'Guest',
          bio: undefined,
          ideasCount: undefined,
          commentsCount: undefined,
          followersCount: undefined,
          followingCount: undefined,
        } as any}
      />
    );

    const avatar = container.querySelector('.w-20');
    expect(avatar).toHaveClass('bg-gray-500');
    expect(screen.queryByText('Ideas')).not.toBeInTheDocument();
    expect(screen.queryByText('Follow')).not.toBeInTheDocument();
  });

  it('uses default avatar styling and disables actions while loading', () => {
    const onFollowClick = vi.fn();
    const onMessageClick = vi.fn();

    const { container } = render(
      <UserProfile
        user={{
          ...user,
          role: 'Creator' as any,
          displayName: 'Morgan Rivers',
          email: 'morgan@example.com',
        } as any}
        onFollowClick={onFollowClick}
        onMessageClick={onMessageClick}
        loading
      />
    );

    const avatar = container.querySelector('.w-20');
    expect(avatar).toHaveClass('bg-blue-500');

    const follow = screen.getByText('Follow');
    const message = screen.getByText('Message');
    expect(follow).toBeDisabled();
    expect(message).toBeDisabled();

    fireEvent.click(follow);
    fireEvent.click(message);

    expect(onFollowClick).not.toHaveBeenCalled();
    expect(onMessageClick).not.toHaveBeenCalled();
  });
});
