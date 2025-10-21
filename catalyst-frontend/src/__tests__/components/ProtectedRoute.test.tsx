import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import type { MemoryRouterProps } from 'react-router-dom';
import type { ReactNode } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks';
import '@testing-library/jest-dom';

// Mock useAuth hook
vi.mock('@/hooks', () => ({
  useAuth: vi.fn(),
}));

// Test components
const ProtectedComponent = () => <div>Protected Content</div>;
const PublicComponent = () => <div>Public Content</div>;
const LocationStateProbe = () => {
  const location = useLocation();
  return (
    <pre data-testid="location-probe">{JSON.stringify(location.state)}</pre>
  );
};

const renderWithRoutes = (
  ui: ReactNode,
  initialEntries: MemoryRouterProps['initialEntries']
) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<PublicComponent />} />
        <Route path="/login" element={<PublicComponent />} />
        <Route path="/login/probe" element={<LocationStateProbe />} />
        <Route path="/protected" element={ui} />
      </Routes>
    </MemoryRouter>
  );

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render protected content when user is authenticated', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com' },
    });

    renderWithRoutes(
      <ProtectedRoute>
        <ProtectedComponent />
      </ProtectedRoute>,
      ['/protected']
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    // Test verifies that unauthenticated users cannot access protected routes
    // The ProtectedRoute component redirects to /login when not authenticated
    renderWithRoutes(
      <ProtectedRoute>
        <ProtectedComponent />
      </ProtectedRoute>,
      ['/protected']
    );

    // Component renders but protected content should not be accessible
    expect(screen.getByText('Public Content')).toBeInTheDocument();
  });

  it('should preserve location state for post-login redirect', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    // Navigate to a protected route and check that the location is preserved
    // This test verifies the redirect happens correctly with location state
    render(
      <MemoryRouter initialEntries={[{ pathname: '/protected', state: { custom: 'state' } }]}
        initialIndex={0}
      >
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <ProtectedComponent />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LocationStateProbe />} />
        </Routes>
      </MemoryRouter>
    );

    const state = JSON.parse(
      screen.getByTestId('location-probe').textContent || 'null'
    );

    expect(state?.from?.pathname).toBe('/protected');
    expect(state?.from?.state?.custom).toBe('state');
  });

  it('should render children directly when authenticated', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', email: 'user@example.com', displayName: 'Test User' },
    });

    const TestChild = () => <span data-testid="test-child">Child Element</span>;

    renderWithRoutes(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>,
      ['/protected']
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('should not render children when not authenticated', () => {
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    const TestChild = () => <span data-testid="test-child">Child Element</span>;

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <TestChild />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('test-child')).not.toBeInTheDocument();
  });
});
