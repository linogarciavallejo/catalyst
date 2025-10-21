import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import App from '@/App';

vi.mock('antd', () => ({
  ConfigProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="config-provider">{children}</div>
  ),
  App: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="ant-app">{children}</div>
  ),
}));

vi.mock('@/router', () => ({
  default: () => <div data-testid="app-router" />,
}));

const setMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe('App', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.className = '';
    document.body.className = '';
  });

  afterEach(() => {
    cleanup();
  });

  it('prefers stored dark theme and renders router', async () => {
    localStorage.setItem('theme-mode', 'dark');
    setMatchMedia(false);

    render(<App />);

    expect(await screen.findByTestId('app-router')).toBeInTheDocument();

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
      expect(document.body.classList.contains('dark-mode')).toBe(true);
    });

    expect(localStorage.getItem('theme-mode')).toBe('dark');
  });

  it('falls back to system preference when theme not stored', async () => {
    setMatchMedia(true);

    render(<App />);

    await waitFor(() => {
      expect(localStorage.getItem('theme-mode')).toBe('dark');
      expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    });
  });

  it('keeps light theme when system preference is light', async () => {
    localStorage.setItem('theme-mode', 'light');
    setMatchMedia(false);

    render(<App />);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
      expect(document.body.classList.contains('dark-mode')).toBe(false);
    });

    expect(localStorage.getItem('theme-mode')).toBe('light');
  });
});
