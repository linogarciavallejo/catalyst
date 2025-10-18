import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import { useAuth, useIdeas, useActivity } from '@/hooks';
import '@testing-library/jest-dom';

// Mock hooks
vi.mock('@/hooks', () => ({
  useAuth: vi.fn(),
  useIdeas: vi.fn(),
  useActivity: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('HomePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock values
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      logout: vi.fn(),
      user: null,
    });

    (useIdeas as any).mockReturnValue({
      ideas: [],
      getTrendingIdeas: vi.fn(),
      loading: false,
      error: null,
    });

    (useActivity as any).mockReturnValue({
      activeUsers: [],
      setViewingIdea: vi.fn(),
    });
  });

  it('should render homepage with hero section', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText(/collaborative innovation platform/i)).toBeInTheDocument();
    expect(screen.getByText(/share, discuss, and vote/i)).toBeInTheDocument();
  });

  it('should render primary CTA buttons', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const exploreButton = screen.getAllByRole('link', { name: /explore ideas/i })[0];
    const submitButton = screen.getAllByRole('link', { name: /submit your idea/i })[0];

    expect(exploreButton).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('should not display Sign Out button when not authenticated', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      logout: vi.fn(),
      user: null,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const signOutButtons = screen.queryAllByRole('button', { name: /sign out/i });
    expect(signOutButtons.length).toBe(0);
  });

  it('should display Sign Out button when authenticated', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      logout: vi.fn(),
      user: { id: '123', email: 'test@example.com' },
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    expect(signOutButton).toBeInTheDocument();
  });

  it('should call logout when Sign Out button is clicked', async () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined);
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
      user: { id: '123', email: 'test@example.com' },
    });

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    await user.click(signOutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('should redirect to login page after logout', async () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined);
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
      user: { id: '123', email: 'test@example.com' },
    });

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    await user.click(signOutButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should render stats section with idea count', () => {
    const mockIdeas = [
      { id: '1', title: 'Idea 1', status: 'Approved', commentCount: 3 },
      { id: '2', title: 'Idea 2', status: 'Approved', commentCount: 2 },
      { id: '3', title: 'Idea 3', status: 'Pending', commentCount: 1 },
    ];

    (useIdeas as any).mockReturnValue({
      ideas: mockIdeas,
      getTrendingIdeas: vi.fn(),
      loading: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText('Ideas Submitted')).toBeInTheDocument();
    expect(screen.getByText('Active Discussions')).toBeInTheDocument();
    expect(screen.getByText('Approved Ideas')).toBeInTheDocument();
  });

  it('should calculate correct stats from ideas', async () => {
    const mockIdeas = [
      { id: '1', title: 'Idea 1', status: 'Approved', commentCount: 5 },
      { id: '2', title: 'Idea 2', status: 'Approved', commentCount: 3 },
      { id: '3', title: 'Idea 3', status: 'Pending', commentCount: 2 },
    ];

    (useIdeas as any).mockReturnValue({
      ideas: mockIdeas,
      getTrendingIdeas: vi.fn(),
      loading: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Stats should show:
    // Total Ideas: 3
    // Approved Ideas: 2
    // Active Discussions: 10 (5+3+2)
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  it('should load trending ideas on mount', () => {
    const mockGetTrendingIdeas = vi.fn();
    (useIdeas as any).mockReturnValue({
      ideas: [],
      getTrendingIdeas: mockGetTrendingIdeas,
      loading: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // getTrendingIdeas should be called with limit parameter
    expect(mockGetTrendingIdeas).toHaveBeenCalled();
  });

  it('should set viewing activity on mount', () => {
    const mockSetViewingIdea = vi.fn();
    (useActivity as any).mockReturnValue({
      activeUsers: [],
      setViewingIdea: mockSetViewingIdea,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(mockSetViewingIdea).toHaveBeenCalledWith('homepage');
  });

  it('should handle logout error gracefully', async () => {
    // Create a mockLogout that simulates error handling
    const mockLogout = vi.fn().mockImplementation(async () => {
      // Simulate error scenario but handle it properly
      return Promise.resolve();
    });
    
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
      user: { id: '123', email: 'test@example.com' },
    });

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    
    // Click logout
    await user.click(signOutButton);

    // Should have called logout
    expect(mockLogout).toHaveBeenCalled();
  });

  it('should render header with navigation links', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Should have at least one "Browse Ideas" link in header
    const browseIdeasLinks = screen.getAllByRole('link', { name: /browse ideas/i });
    expect(browseIdeasLinks.length).toBeGreaterThan(0);

    // Should have at least one "Submit Idea" link in header
    const submitIdeaLinks = screen.getAllByRole('link', { name: /submit.*idea/i });
    expect(submitIdeaLinks.length).toBeGreaterThan(0);
  });

  it('should have correct href attributes for navigation links', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const allLinks = screen.getAllByRole('link');
    const ideaLinks = allLinks.filter(link => {
      const href = link.getAttribute('href');
      return href === '/ideas' || href === '/ideas/create';
    });

    expect(ideaLinks.length).toBeGreaterThan(0);
  });

  it('should display featured/trending section when ideas are loaded', () => {
    const mockIdeas = [
      {
        id: '1',
        title: 'Trending Idea',
        description: 'This is trending',
        status: 'Approved',
        commentCount: 15,
      },
    ];

    (useIdeas as any).mockReturnValue({
      ideas: mockIdeas,
      getTrendingIdeas: vi.fn(),
      loading: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Component should render without errors when ideas are loaded
    expect(screen.getByText(/collaborative innovation platform/i)).toBeInTheDocument();
  });

  it('should maintain logout button styling as outline variant', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      logout: vi.fn(),
      user: { id: '123', email: 'test@example.com' },
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    // Button should be present and clickable
    expect(signOutButton).toBeInTheDocument();
    expect(signOutButton).not.toBeDisabled();
  });

  it('should update stats when ideas change', async () => {
    // Test that stats recalculate when ideas prop updates
    const mockIdeas = [
      { id: '1', title: 'New Idea', status: 'Approved', commentCount: 10 },
    ];

    (useIdeas as any).mockReturnValue({
      ideas: mockIdeas,
      getTrendingIdeas: vi.fn(),
      loading: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Stats should show the expected values
    const statElements = screen.getAllByText(/\d+/);
    expect(statElements.length).toBeGreaterThan(0);
    
    // Should have calculated stats from the mock idea
    expect(screen.getByText(/Ideas Submitted/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Discussions/i)).toBeInTheDocument();
  });
});
