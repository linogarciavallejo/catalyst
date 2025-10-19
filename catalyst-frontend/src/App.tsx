import { useState, useEffect } from 'react';
import { ConfigProvider, App as AntApp } from 'antd';
import { lightTheme, darkTheme } from './theme/theme';
import AppRouter from './router';
import './App.css';

function App() {
  const [isDarkMode] = useState(() => {
    // Check system preference or localStorage
    const saved = localStorage.getItem('theme-mode');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Update localStorage and document class
    localStorage.setItem('theme-mode', isDarkMode ? 'dark' : 'light');
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      htmlElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ConfigProvider theme={currentTheme}>
      <AntApp>
        <AppRouter />
      </AntApp>
    </ConfigProvider>
  );
}

export default App;