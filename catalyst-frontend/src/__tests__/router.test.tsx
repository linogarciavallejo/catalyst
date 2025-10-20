import { render, screen, within, cleanup } from '@testing-library/react';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import AppRouter from '@/router';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => (
      <actual.MemoryRouter initialEntries={(globalThis as any).__routerEntries ?? ['/']}>
        {children}
      </actual.MemoryRouter>
    ),
  };
});

vi.mock('@/components/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

vi.mock('@/pages/HomePage', () => ({ default: () => <div data-testid="home-page" /> }));
vi.mock('@/pages/LoginPage', () => ({ default: () => <div data-testid="login-page" /> }));
vi.mock('@/pages/RegisterPage', () => ({ default: () => <div data-testid="register-page" /> }));
vi.mock('@/pages/IdeasBrowsingPage', () => ({ default: () => <div data-testid="ideas-page" /> }));
vi.mock('@/pages/IdeaDetailPage', () => ({ default: () => <div data-testid="idea-detail-page" /> }));
vi.mock('@/pages/CreateEditIdeaPage', () => ({ default: () => <div data-testid="create-edit-page" /> }));
vi.mock('@/pages/ChatPage', () => ({ default: () => <div data-testid="chat-page" /> }));
vi.mock('@/pages/UserProfilePage', () => ({ default: () => <div data-testid="profile-page" /> }));
vi.mock('@/pages/SettingsPage', () => ({ default: () => <div data-testid="settings-page" /> }));
vi.mock('@/pages/NotificationsPage', () => ({ default: () => <div data-testid="notifications-page" /> }));
vi.mock('@/pages/NotFoundPage', () => ({ default: () => <div data-testid="not-found-page" /> }));

const renderAt = (path: string) => {
  (globalThis as any).__routerEntries = [path];
  cleanup();
  return render(<AppRouter />);
};

describe('AppRouter', () => {
  beforeEach(() => {
    (globalThis as any).__routerEntries = ['/'];
  });

  afterEach(() => {
    delete (globalThis as any).__routerEntries;
  });

  it('renders public routes without protection', () => {
    renderAt('/');
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-route')).not.toBeInTheDocument();

    renderAt('/ideas');
    expect(screen.getByTestId('ideas-page')).toBeInTheDocument();
  });

  it('wraps protected routes and renders nested pages', () => {
    renderAt('/chat');
    const wrapper = screen.getByTestId('protected-route');
    expect(wrapper).toBeInTheDocument();
    expect(within(wrapper).getByTestId('chat-page')).toBeInTheDocument();

    renderAt('/notifications');
    const notificationsWrapper = screen.getAllByTestId('protected-route')[0];
    expect(within(notificationsWrapper).getByTestId('notifications-page')).toBeInTheDocument();
  });

  it('redirects shorthand routes and renders 404 for unknown paths', () => {
    renderAt('/home');
    expect(screen.getByTestId('home-page')).toBeInTheDocument();

    renderAt('/unknown');
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
  });
});
