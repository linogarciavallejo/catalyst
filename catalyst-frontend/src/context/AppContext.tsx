import React, { createContext, useState, useCallback } from "react";

export interface AppSettings {
  theme: "light" | "dark";
  sidebarCollapsed: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export interface AppContextType {
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;

  // Search
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;

  // Loading state
  isAppLoading: boolean;
  setIsAppLoading: (loading: boolean) => void;

  // Modal management
  activeModal: string | null;
  openModal: (modalName: string) => void;
  closeModal: () => void;

  // Sidebar state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // User preferences
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
}

const defaultSettings: AppSettings = {
  theme: "light",
  sidebarCollapsed: false,
  notificationsEnabled: true,
  soundEnabled: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppContextProviderProps {
  children: React.ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({
  children,
}) => {
  // Settings
  const [settings, setSettingsState] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem("appSettings");
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("appSettings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsState(defaultSettings);
    localStorage.removeItem("appSettings");
  }, []);

  // Search
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  // Loading state
  const [isAppLoading, setIsAppLoading] = useState(false);

  // Modal management
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = useCallback((modalName: string) => {
    setActiveModal(modalName);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  // Sidebar state - derived from settings
  const [isSidebarOpen, setIsSidebarOpenState] = useState(
    !settings.sidebarCollapsed
  );

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpenState((prev) => {
      const newState = !prev;
      updateSettings({ sidebarCollapsed: !newState });
      return newState;
    });
  }, [updateSettings]);

  // User preferences
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem("itemsPerPage");
    return saved ? parseInt(saved) : 20;
  });

  const setItemsPerPageWithStorage = useCallback((count: number) => {
    setItemsPerPage(count);
    localStorage.setItem("itemsPerPage", count.toString());
  }, []);

  const value: AppContextType = {
    settings,
    updateSettings,
    resetSettings,
    globalSearchQuery,
    setGlobalSearchQuery,
    isAppLoading,
    setIsAppLoading,
    activeModal,
    openModal,
    closeModal,
    isSidebarOpen,
    toggleSidebar,
    itemsPerPage,
    setItemsPerPage: setItemsPerPageWithStorage,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext };
