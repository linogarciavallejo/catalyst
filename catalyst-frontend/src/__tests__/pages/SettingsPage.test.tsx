import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SettingsPage from '@/pages/SettingsPage';
import { useAuth } from '@/hooks';
import '@testing-library/jest-dom';

vi.mock('@/hooks', () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

afterAll(() => {
  mockConsoleError.mockRestore();
});

describe('SettingsPage', () => {
  const logout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();

    logout.mockResolvedValue(undefined);
    mockNavigate.mockClear();

    (useAuth as unknown as vi.Mock).mockReturnValue({
      user: {
        id: 'user-1',
        displayName: 'Casey',
        email: 'casey@example.com',
        role: 'Creator',
        eipPoints: 0,
        createdAt: new Date('2024-01-01T00:00:00Z'),
      },
      logout,
    });
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

  it('pre-fills user data and updates settings when inputs change', async () => {
    const user = userEvent.setup();
    renderPage();

    const displayNameInput = screen.getByLabelText('Display Name');
    const emailInput = screen.getByLabelText('Email');
    const bioTextarea = screen.getByLabelText('Bio');
    const languageSelect = screen.getByLabelText('Language');
    const themeSelect = screen.getByLabelText('Theme');
    const newsletterCheckbox = screen.getByLabelText('Newsletter');

    expect(displayNameInput).toHaveValue('Casey');
    expect(emailInput).toHaveValue('casey@example.com');

    await user.clear(displayNameInput);
    await user.type(displayNameInput, 'Casey Updated');
    await user.clear(emailInput);
    await user.type(emailInput, 'updated@example.com');
    await user.type(bioTextarea, 'Loves testing');
    await user.selectOptions(languageSelect, 'es');
    await user.selectOptions(themeSelect, 'dark');
    await user.click(newsletterCheckbox);

    await user.click(screen.getByRole('button', { name: 'Save Settings' }));

    expect(screen.getByText(/Settings saved successfully!/)).toBeInTheDocument();
  });

  it('logs out and redirects to the login page', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('logs errors when logout fails', async () => {
    logout.mockRejectedValueOnce(new Error('logout failed'));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith('Failed to logout:', expect.any(Error));
    });
  });
});
