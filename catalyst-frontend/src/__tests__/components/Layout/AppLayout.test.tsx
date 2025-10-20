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

  return {
    ...actual,
    Dropdown,
    Drawer,
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
  });

  it('renders authenticated menu and handles logout flow', async () => {
    authState.isAuthenticated = true;
    authState.user = { name: 'Ada Lovelace' };
    currentPath = '/ideas';

    renderLayout();

    expect(screen.getByText('Browse Ideas')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();

    const logoutButton = screen.getByTestId('dropdown-item-logout');
    await act(async () => {
      fireEvent.click(logoutButton);
      await Promise.resolve();
    });

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
});
