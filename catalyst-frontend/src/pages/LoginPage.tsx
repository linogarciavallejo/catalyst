import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Divider, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { AppLayout } from '@/components/Layout';
import { useAuth } from '@/hooks';
import { improvingColors } from '@/theme/colors';
import type { LoginRequest } from '@/services';

interface LoginFormValues {
  email: string;
  password: string;
  remember?: boolean;
}

/**
 * LoginPage Component
 * Handles user authentication via email and password.
 * Features:
 * - Professional Ant Design form
 * - Email and password input with validation
 * - Error handling and display
 * - Redirect to intended page after login
 * - Link to registration page
 * - Responsive layout with AppLayout
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const [form] = Form.useForm();
  const [localError, setLocalError] = useState<string>('');

  // Check for success message from registration redirect
  useEffect(() => {
    const message_text = (location.state as { message?: string })?.message;
    if (message_text) {
      message.success(message_text);
    }
  }, [location.state]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (values: LoginFormValues) => {
    setLocalError('');

    try {
      const loginData: LoginRequest = {
        email: values.email,
        password: values.password,
      };

      await login(loginData);

      // Redirect to home page after successful login
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      const redirectTo = (from && !from.includes('/create') && !from.includes('/edit')) ? from : '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const errorMessage = error || (err instanceof Error ? err.message : 'Login failed. Please try again.');
      setLocalError(errorMessage);
      console.error('Login error:', err);
    }
  };

  return (
    <AppLayout>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px - 80px)',
          padding: '24px',
          background: `linear-gradient(135deg, ${improvingColors.primaryBlue}15 0%, ${improvingColors.teal}15 100%)`,
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <Card
            style={{
              boxShadow: '0 2px 12px rgba(0, 61, 165, 0.1)',
              borderRadius: '12px',
              border: 'none',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  color: improvingColors.darkCharcoal,
                  marginBottom: '8px',
                }}
              >
                Welcome Back
              </h1>
              <p style={{ color: improvingColors.gray500, fontSize: '14px' }}>
                Sign in to your Catalyst account
              </p>
            </div>

            {/* Error Message */}
            {(error || localError) && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#fff2f0',
                  border: `1px solid ${improvingColors.error}`,
                  borderRadius: '6px',
                  color: '#c5192d',
                  fontSize: '14px',
                }}
              >
                {error || localError}
              </div>
            )}

            {/* Login Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              style={{ marginBottom: '16px' }}
            >
              <Form.Item
                name="email"
                label={<span style={{ fontWeight: 500, color: improvingColors.darkCharcoal }}>Email Address</span>}
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input
                  data-testid="login-email-input"
                  prefix={<MailOutlined style={{ color: improvingColors.primaryBlue }} />}
                  placeholder="you@example.com"
                  size="large"
                  disabled={isLoading}
                  style={{ borderRadius: '6px' }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span style={{ fontWeight: 500, color: improvingColors.darkCharcoal }}>Password</span>}
                rules={[{ required: true, message: 'Password is required' }]}
              >
                <Input.Password
                  data-testid="login-password-input"
                  prefix={<LockOutlined style={{ color: improvingColors.primaryBlue }} />}
                  placeholder="••••••••"
                  size="large"
                  disabled={isLoading}
                  style={{ borderRadius: '6px' }}
                />
              </Form.Item>

              <Form.Item
                name="remember"
                valuePropName="checked"
                style={{ marginBottom: '16px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: improvingColors.gray600 }}>
                    <input type="checkbox" /> Remember me
                  </span>
                  <a href="#" style={{ color: improvingColors.primaryBlue, fontSize: '14px' }}>
                    Forgot password?
                  </a>
                </div>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  data-testid="login-submit"
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={isLoading}
                  disabled={isLoading}
                  style={{
                    background: improvingColors.primaryBlue,
                    borderColor: improvingColors.primaryBlue,
                    height: '40px',
                    fontSize: '16px',
                    fontWeight: 600,
                    borderRadius: '6px',
                  }}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Form.Item>
            </Form>

            {/* Divider */}
            <Divider style={{ margin: '24px 0' }}>or</Divider>

            {/* Sign Up Link */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ color: improvingColors.gray600, fontSize: '14px' }}>
                Don't have an account?{' '}
                <Link
                  to="/register"
                  style={{ color: improvingColors.primaryBlue, fontWeight: 600, textDecoration: 'none' }}
                >
                  Sign up
                </Link>
              </span>
            </div>

            {/* Demo Credentials (Less Prominent) */}
            <div
              style={{
                marginTop: '24px',
                padding: '12px',
                backgroundColor: `${improvingColors.primaryBlue}10`,
                border: `1px solid ${improvingColors.primaryBlue}20`,
                borderRadius: '6px',
                fontSize: '12px',
                color: improvingColors.gray600,
              }}
            >
              <strong style={{ color: improvingColors.darkCharcoal }}>Demo Credentials (testing):</strong>
              <br />
              demo@example.com / Demo123!
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

LoginPage.displayName = 'LoginPage';

export default LoginPage;
