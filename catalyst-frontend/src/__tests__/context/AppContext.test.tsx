import type { FC, ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react';
import { AppContextProvider } from '@/context/AppContext';
import { useAppContext } from '@/hooks/useAppContext';

describe('AppContextProvider', () => {
  const wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <AppContextProvider>{children}</AppContextProvider>
  );

  beforeEach(() => {
    localStorage.clear();
  });

  it('throws when the hook is used without a provider', () => {
    expect(() => renderHook(() => useAppContext())).toThrow(
      'useAppContext must be used within AppContextProvider'
    );
  });

  it('persists settings updates and toggles sidebar state', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.settings.theme).toBe('light');
    expect(result.current.isSidebarOpen).toBe(true);

    act(() => {
      result.current.updateSettings({ theme: 'dark' });
    });

    expect(result.current.settings.theme).toBe('dark');
    expect(JSON.parse(localStorage.getItem('appSettings') ?? '{}').theme).toBe(
      'dark'
    );

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.isSidebarOpen).toBe(false);
    expect(
      JSON.parse(localStorage.getItem('appSettings') ?? '{}').sidebarCollapsed
    ).toBe(true);

    act(() => {
      result.current.resetSettings();
    });

    expect(result.current.settings.theme).toBe('light');
    expect(localStorage.getItem('appSettings')).toBeNull();
  });

  it('manages modal, loading, search, and pagination helpers', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.openModal('invite');
    });

    expect(result.current.activeModal).toBe('invite');

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.activeModal).toBeNull();

    act(() => {
      result.current.setIsAppLoading(true);
      result.current.setGlobalSearchQuery('innovation');
      result.current.setItemsPerPage(50);
    });

    expect(result.current.isAppLoading).toBe(true);
    expect(result.current.globalSearchQuery).toBe('innovation');
    expect(result.current.itemsPerPage).toBe(50);
    expect(localStorage.getItem('itemsPerPage')).toBe('50');
  });
});
