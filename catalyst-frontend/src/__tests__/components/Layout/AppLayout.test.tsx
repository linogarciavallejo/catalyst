import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';

const navigateMock = vi.fn();
const logoutMock = vi.fn(() => Promise.resolve());
let currentPath = '/';

vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ pathname: currentPath }),
  };
});

const authState: {
  isAuthenticated: boolean;
  user: { name: string } | null;
} = {
  isAuthenticated: false,
  user: null,
};

vi.mock('@/hooks', () => ({
  useAuth: () => ({
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    logout: logoutMock,
  }),
}));

vi.mock('antd', async (importActual) => {
  const actual = await importActual<typeof import('antd')>();

  const Dropdown = ({ menu, children }: any) => (
    <div>
      <div data-testid="dropdown-trigger">{children}</div>
      <div>
        {menu?.items
          ?.filter(Boolean)
          .map((item: any) =>
            item.type === 'divider' ? null : (
              <button
                key={item.key}
                data-testid={`dropdown-item-${item.key}`}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            )
          )}
      </div>
    </div>
  );

  const Drawer = ({ open, children }: any) => (
    <div data-testid="drawer" data-open={open}>
      {open ? children : null}
    </div>
  );

  const Menu = ({ items }: any) => (
    <nav>
      {items
        ?.filter(Boolean)
        .map((item: any) => (
          <button
            key={item.key}
            type="button"
            data-testid={`menu-item-${item.key}`}
            onClick={() => {
              item.onClick?.({ key: item.key });
            }}
          >
            {item.label}
          </button>
        ))}
    </nav>
  );

  return {
    ...actual,
    Dropdown,
    Drawer,
    Menu,
  };
});

const renderLayout = () =>
  render(
    <MemoryRouter>
      <AppLayout>
        <div>content</div>
      </AppLayout>
    </MemoryRouter>
  );

describe('AppLayout', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    logoutMock.mockClear();
    localStorage.clear();
    document.body.className = '';
    document.documentElement.className = '';
    authState.isAuthenticated = false;
    authState.user = null;
    currentPath = '/';
  });

  afterEach(() => {
    document.body.className = '';
    document.documentElement.className = '';
  });

  it('renders navigation for guests and allows theme toggle', async () => {
    renderLayout();

    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();

    const toggle = screen.getByTitle('Switch to dark mode');
    await act(async () => {
      fireEvent.click(toggle);
    });

    expect(localStorage.getItem('theme-mode')).toBe('dark');
    expect(document.body.classList.contains('dark-mode')).toBe(true);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);

    await act(async () => {
      fireEvent.click(screen.getByTitle('Switch to light mode'));
    });

    expect(localStorage.getItem('theme-mode')).toBe('light');
    expect(document.body.classList.contains('dark-mode')).toBe(false);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
  });

  it('navigates through sidebar menu items for guests', () => {
    renderLayout();

    fireEvent.click(screen.getByTestId('menu-item-/'));
    expect(navigateMock).toHaveBeenCalledWith('/');

    fireEvent.click(screen.getByTestId('menu-item-/ideas'));
    expect(navigateMock).toHaveBeenCalledWith('/ideas');
  });

  it('renders authenticated menu and handles logout flow', async () => {
    authState.isAuthenticated = true;
    authState.user = { name: 'Ada Lovelace' };
    currentPath = '/ideas';

    renderLayout();

    expect(screen.getByTestId('menu-item-/ideas')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-/chat')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-/notifications')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('menu-item-/chat'));
    expect(navigateMock).toHaveBeenCalledWith('/chat');

    fireEvent.click(screen.getByTestId('menu-item-/notifications'));
    expect(navigateMock).toHaveBeenCalledWith('/notifications');

    const logoutButton = screen.getByTestId('dropdown-item-logout');
    await act(async () => {
      fireEvent.click(logoutButton);
      await Promise.resolve();
    });

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login');

    fireEvent.click(screen.getByTestId('dropdown-item-profile'));
    expect(navigateMock).toHaveBeenCalledWith('/profile');

    fireEvent.click(screen.getByTestId('dropdown-item-settings'));
    expect(navigateMock).toHaveBeenCalledWith('/settings');
  });
});
