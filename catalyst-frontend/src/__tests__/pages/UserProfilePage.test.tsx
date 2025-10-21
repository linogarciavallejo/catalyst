import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import UserProfilePage from '@/pages/UserProfilePage';
import { useIdeas } from '@/hooks';
import type { Idea } from '@/types';
import '@testing-library/jest-dom';

const userProfileMock = vi.hoisted(() =>
  vi.fn((props) => {
    // capture props for assertions
    return <div data-testid="user-profile" data-props={JSON.stringify(props)} />;
  })
);

vi.mock('@/components/features', () => ({
  UserProfile: (props: any) => userProfileMock(props),
}));

vi.mock('@/hooks', () => ({
  useIdeas: vi.fn(),
}));

const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

afterAll(() => {
  mockConsoleError.mockRestore();
});

const createIdea = (overrides: Partial<Idea>): Idea => ({
  id: 'idea-1',
  title: 'Idea title',
  description: 'Idea description',
  category: 'Feature',
  status: 'Approved',
  authorId: 'user-1',
  author: {
    id: 'user-1',
    displayName: 'Author',
    email: 'author@example.com',
    role: 'Creator',
    eipPoints: 10,
    createdAt: new Date('2024-01-01T00:00:00Z'),
  },
  upvotes: 1,
  downvotes: 0,
  commentCount: 0,
  createdAt: new Date('2024-02-01T00:00:00Z'),
  updatedAt: new Date('2024-02-02T00:00:00Z'),
  ...overrides,
});

const renderPage = (userId = 'user-1') =>
  render(
    <MemoryRouter initialEntries={[`/users/${userId}`]}>
      <Routes>
        <Route path="/users/:userId" element={<UserProfilePage />} />
      </Routes>
    </MemoryRouter>
  );

const renderFallback = () =>
  render(
    <MemoryRouter initialEntries={['/profile']}>
      <Routes>
        <Route path="/profile" element={<UserProfilePage />} />
      </Routes>
    </MemoryRouter>
  );

describe('UserProfilePage', () => {
  const getIdeas = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();
    userProfileMock.mockClear();

    getIdeas.mockResolvedValue(undefined);

    (useIdeas as unknown as vi.Mock).mockReturnValue({
      ideas: [
        createIdea({ id: 'idea-1', title: 'My idea', authorId: 'user-1' }),
        createIdea({ id: 'idea-2', title: 'Other idea', authorId: 'other-user' }),
      ],
      getIdeas,
    });
  });

  it('loads ideas on mount and renders ideas for the requested user', async () => {
    renderPage('user-1');

    await waitFor(() => {
      expect(getIdeas).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('My idea')).toBeInTheDocument();
    expect(screen.queryByText('Other idea')).not.toBeInTheDocument();
  });

  it('shows a fallback when the user has no ideas', () => {
    (useIdeas as unknown as vi.Mock).mockReturnValueOnce({
      ideas: [],
      getIdeas,
    });

    renderPage('user-2');

    expect(screen.getByText('No ideas yet')).toBeInTheDocument();
  });

  it('logs an error when idea loading fails', async () => {
    getIdeas.mockRejectedValueOnce(new Error('failed'));

    renderPage('user-1');

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to load ideas:', expect.any(Error));
    });
  });

  it('falls back to the default user id when the route is missing the param', () => {
    (useIdeas as unknown as vi.Mock).mockReturnValue({
      ideas: [
        createIdea({ id: 'idea-u1', title: 'Fallback idea', authorId: 'u1' }),
      ],
      getIdeas,
    });

    renderFallback();

    renderFallback();

    expect(userProfileMock).toHaveBeenCalled();
    const props = userProfileMock.mock.calls[0][0];
    expect(props.user.id).toBe('u1');
  });

  it('uses the alternate status styling when ideas are not approved', () => {
    (useIdeas as unknown as vi.Mock).mockReturnValue({
      ideas: [
        createIdea({ id: 'idea-3', title: 'Pending idea', authorId: 'user-1', status: 'Rejected' }),
      ],
      getIdeas,
    });

    renderPage('user-1');

    const status = screen.getByText('Rejected');
    expect(status).toHaveClass('bg-yellow-100', { exact: false });
  });
});
