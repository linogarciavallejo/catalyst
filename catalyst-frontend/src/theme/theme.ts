import type { ThemeConfig } from 'antd';
import { improvingColors, fontSizes } from './colors';

/**
 * Ant Design Theme Configuration
 * Based on Improving.com Design System with Improving Colors
 * Supports light and dark modes
 */

export const lightTheme: ThemeConfig = {
  token: {
    // Brand Colors
    colorPrimary: improvingColors.primaryBlue,
    colorSuccess: improvingColors.success,
    colorWarning: improvingColors.warning,
    colorError: improvingColors.error,
    colorInfo: improvingColors.info,

    // Typography
    fontSize: parseInt(fontSizes.base),
    fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif`,
    fontWeightStrong: 600,
    lineHeight: 1.6,
    lineHeightHeading1: 1.2,
    lineHeightHeading2: 1.3,

    // Spacing
    margin: 16,
    marginXS: 8,
    marginSM: 12,
    marginMD: 16,
    marginLG: 24,
    marginXL: 32,
    marginXXL: 48,

    padding: 16,
    paddingXS: 8,
    paddingSM: 12,
    paddingMD: 16,
    paddingLG: 24,
    paddingXL: 32,

    // Border Radius
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,

    // Colors
    colorBgBase: improvingColors.white,
    colorBgContainer: improvingColors.white,
    colorBgElevated: improvingColors.white,
    colorBgLayout: improvingColors.lightGray,
    colorBorder: improvingColors.gray300,
    colorBorderSecondary: improvingColors.gray200,
    colorText: improvingColors.darkCharcoal,
    colorTextSecondary: improvingColors.gray500,
    colorTextTertiary: improvingColors.gray400,
    colorTextQuaternary: improvingColors.gray300,
    colorLinkHover: improvingColors.primaryBlueDark,

    // Component-specific
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    boxShadowSecondary: '0 1px 4px rgba(0, 0, 0, 0.08)',

    // Motion/Animation
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motionEaseInOutCirc: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
    motionEaseOutCirc: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
    motionUnit: 0.1, // 100ms base unit
  },
  components: {
    Button: {
      colorPrimary: improvingColors.primaryBlue,
      controlHeight: 40,
      fontSize: parseInt(fontSizes.base),
      borderRadius: 6,
      colorBgContainer: improvingColors.white,
      colorBorder: improvingColors.gray300,
    },
    Input: {
      controlHeight: 40,
      fontSize: parseInt(fontSizes.base),
      borderRadius: 6,
      colorBorder: improvingColors.gray300,
      colorBgContainer: improvingColors.white,
    },
    Select: {
      controlHeight: 40,
      fontSize: parseInt(fontSizes.base),
      borderRadius: 6,
    },
    Card: {
      colorBgContainer: improvingColors.white,
      borderRadiusLG: 8,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    Layout: {
      colorBgHeader: improvingColors.white,
      colorBgBody: improvingColors.lightGray,
      colorBgLayout: improvingColors.lightGray,
    },
    Menu: {
      colorItemBg: improvingColors.white,
      colorItemBgHover: improvingColors.lightGray,
      colorItemBgSelectedHorizontal: improvingColors.lightGray,
    },
    Pagination: {
      colorPrimary: improvingColors.primaryBlue,
      colorPrimaryBorder: improvingColors.primaryBlue,
    },
    Table: {
      colorBgContainer: improvingColors.white,
      colorBgElevated: improvingColors.white,
      colorBorder: improvingColors.gray300,
      rowHoverBg: improvingColors.lightGray,
    },
    Form: {
      labelFontSize: parseInt(fontSizes.base),
      labelColor: improvingColors.darkCharcoal,
    },
    Modal: {
      colorBgElevated: improvingColors.white,
      boxShadowSecondary: '0 8px 24px rgba(0, 0, 0, 0.15)',
    },
    Drawer: {
      colorBgElevated: improvingColors.white,
    },
    Message: {
      contentBg: improvingColors.white,
      colorText: improvingColors.darkCharcoal,
    },
    Notification: {
      colorBgElevated: improvingColors.white,
      colorText: improvingColors.darkCharcoal,
    },
  },
};

export const darkTheme: ThemeConfig = {
  token: {
    // Brand Colors
    colorPrimary: improvingColors.teal, // Use teal as accent in dark mode
    colorSuccess: improvingColors.success,
    colorWarning: improvingColors.warning,
    colorError: improvingColors.error,
    colorInfo: improvingColors.teal,

    // Typography
    fontSize: parseInt(fontSizes.base),
    fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif`,
    fontWeightStrong: 600,
    lineHeight: 1.6,

    // Colors
    colorBgBase: improvingColors.darkBg,
    colorBgContainer: improvingColors.darkCardBg,
    colorBgElevated: improvingColors.darkBgSecondary,
    colorBgLayout: improvingColors.darkBg,
    colorBorder: improvingColors.darkBorder,
    colorBorderSecondary: '#303030',
    colorText: improvingColors.darkText,
    colorTextSecondary: improvingColors.darkTextSecondary,
    colorTextTertiary: '#595959',
    colorTextQuaternary: '#434343',
    colorLinkHover: improvingColors.teal,

    // Component-specific
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45)',
    boxShadowSecondary: '0 1px 4px rgba(0, 0, 0, 0.45)',

    // Motion/Animation
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motionUnit: 0.1,
  },
  components: {
    Button: {
      colorPrimary: improvingColors.teal,
      controlHeight: 40,
      fontSize: parseInt(fontSizes.base),
      borderRadius: 6,
      colorBgContainer: improvingColors.darkCardBg,
      colorBorder: improvingColors.darkBorder,
    },
    Input: {
      controlHeight: 40,
      fontSize: parseInt(fontSizes.base),
      borderRadius: 6,
      colorBorder: improvingColors.darkBorder,
      colorBgContainer: improvingColors.darkCardBg,
      colorTextPlaceholder: '#595959',
    },
    Select: {
      controlHeight: 40,
      fontSize: parseInt(fontSizes.base),
      borderRadius: 6,
      colorBgContainer: improvingColors.darkCardBg,
    },
    Card: {
      colorBgContainer: improvingColors.darkCardBg,
      borderRadiusLG: 8,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45)',
    },
    Layout: {
      colorBgHeader: improvingColors.darkCardBg,
      colorBgBody: improvingColors.darkBg,
      colorBgLayout: improvingColors.darkBg,
    },
    Menu: {
      colorItemBg: improvingColors.darkCardBg,
      colorItemBgHover: improvingColors.darkBgSecondary,
      colorItemBgSelectedHorizontal: improvingColors.darkBgSecondary,
    },
    Table: {
      colorBgContainer: improvingColors.darkCardBg,
      colorBgElevated: improvingColors.darkBgSecondary,
      colorBorder: improvingColors.darkBorder,
      rowHoverBg: improvingColors.darkBgSecondary,
    },
    Modal: {
      colorBgElevated: improvingColors.darkCardBg,
      boxShadowSecondary: '0 8px 24px rgba(0, 0, 0, 0.45)',
    },
    Drawer: {
      colorBgElevated: improvingColors.darkCardBg,
    },
    Message: {
      contentBg: improvingColors.darkCardBg,
      colorText: improvingColors.darkText,
    },
    Notification: {
      colorBgElevated: improvingColors.darkCardBg,
      colorText: improvingColors.darkText,
    },
  },
};
