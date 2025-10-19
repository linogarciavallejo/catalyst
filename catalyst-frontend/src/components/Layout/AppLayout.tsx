import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Space, Avatar, Drawer } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  BulbOutlined,
  MessageOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { improvingColors } from '@/theme/colors';
import styles from './AppLayout.module.css';

const { Header, Content, Footer, Sider } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * AppLayout Component
 * Professional, responsive layout matching Improving.com design
 * Features:
 * - Sticky header with logo and navigation
 * - Responsive sidebar/menu
 * - Auth section with user dropdown
 * - Dark mode toggle
 * - Professional footer
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme-mode') === 'dark';
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme-mode', newMode ? 'dark' : 'light');
    const htmlElement = document.documentElement;
    if (newMode) {
      htmlElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      htmlElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseMenuItems: any[] = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => navigate('/'),
    },
    {
      key: '/ideas',
      icon: <BulbOutlined />,
      label: 'Browse Ideas',
      onClick: () => navigate('/ideas'),
    },
    isAuthenticated && {
      key: '/chat',
      icon: <MessageOutlined />,
      label: 'Chat',
      onClick: () => navigate('/chat'),
    },
    isAuthenticated && {
      key: '/notifications',
      icon: <BellOutlined />,
      label: 'Notifications',
      onClick: () => navigate('/notifications'),
    },
  ];

  const menuItems = baseMenuItems.filter(Boolean);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMenuItems: any[] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const headerActions = (
    <Space size="large" align="center">
      {/* Theme Toggle */}
      <Button
        type="text"
        icon={isDarkMode ? <SunOutlined style={{ fontSize: '18px' }} /> : <MoonOutlined style={{ fontSize: '18px' }} />}
        onClick={toggleDarkMode}
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      />

      {isAuthenticated && user ? (
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <Avatar
            size="large"
            icon={<UserOutlined />}
            style={{
              backgroundColor: improvingColors.primaryBlue,
              cursor: 'pointer',
            }}
          />
        </Dropdown>
      ) : (
        <Button
          type="primary"
          onClick={() => navigate('/login')}
          style={{
            backgroundColor: improvingColors.primaryBlue,
            borderColor: improvingColors.primaryBlue,
          }}
        >
          Login
        </Button>
      )}
    </Space>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <Sider
        collapsible
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        breakpoint="lg"
        collapsedWidth={0}
        trigger={null}
        className={styles.sider}
        style={{
          backgroundColor: isDarkMode ? improvingColors.darkCardBg : improvingColors.white,
          borderRight: `1px solid ${isDarkMode ? improvingColors.darkBorder : improvingColors.gray300}`,
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{
            backgroundColor: isDarkMode ? improvingColors.darkCardBg : improvingColors.white,
            border: 'none',
          }}
        />
      </Sider>

      {/* Main Layout */}
      <Layout>
        {/* Sticky Header */}
        <Header
          style={{
            backgroundColor: isDarkMode ? improvingColors.darkCardBg : improvingColors.white,
            borderBottom: `1px solid ${isDarkMode ? improvingColors.darkBorder : improvingColors.gray300}`,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 999,
          }}
        >
          <Space size="large" align="center">
            {/* Mobile Menu Toggle */}
            <Button
              type="text"
              icon={mobileMenuOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={styles.mobileMenuBtn}
              style={{ display: 'none' }}
            />

            {/* Logo/Branding */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: improvingColors.primaryBlue,
                }}
              >
                💡
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '700',
                  color: isDarkMode ? improvingColors.darkText : improvingColors.darkCharcoal,
                }}
              >
                Catalyst
              </h1>
            </div>
          </Space>

          {headerActions}
        </Header>

        {/* Mobile Drawer Menu */}
        <Drawer
          title="Menu"
          placement="left"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            mode="vertical"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={() => setMobileMenuOpen(false)}
          />
        </Drawer>

        {/* Main Content */}
        <Content
          style={{
            padding: '24px',
            backgroundColor: isDarkMode ? improvingColors.darkBg : improvingColors.lightGray,
            minHeight: 'calc(100vh - 64px - 80px)', // Subtract header and footer
          }}
        >
          {children}
        </Content>

        {/* Footer */}
        <Footer
          style={{
            backgroundColor: isDarkMode ? improvingColors.darkCardBg : improvingColors.white,
            borderTop: `1px solid ${isDarkMode ? improvingColors.darkBorder : improvingColors.gray300}`,
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              textAlign: 'center',
              color: isDarkMode ? improvingColors.darkTextSecondary : improvingColors.gray500,
            }}
          >
            <p style={{ marginBottom: 0 }}>
              © 2025 Catalyst. A collaborative platform for innovative ideas.
            </p>
            <p style={{ marginTop: '8px', fontSize: '12px' }}>
              Built with React, Ant Design & ❤️
            </p>
          </div>
        </Footer>
      </Layout>
    </Layout>
  );
};

AppLayout.displayName = 'AppLayout';

export default AppLayout;
