import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Divider, Checkbox, Row, Col } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { AppLayout } from '@/components/Layout';
import { useAuth } from '@/hooks';
import { improvingColors } from '@/theme/colors';

interface RegisterFormValues {
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  terms?: boolean;
}

/**
 * RegisterPage Component
 * Handles new user registration.
 * Features:
 * - Professional Ant Design form
 * - Email, display name, and password input
 * - Password confirmation validation
 * - Terms and conditions acceptance
 * - Error handling and display
 * - Redirect to intended page after registration
 * - Link to login page
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isLoading, error, isAuthenticated } = useAuth();
  const [form] = Form.useForm();
  const [localError, setLocalError] = useState<string>('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (values: RegisterFormValues) => {
    setLocalError('');

    try {
      await register({
        email: values.email,
        displayName: values.displayName,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      // Redirect to login page after successful registration
      navigate('/login', {
        replace: true,
        state: { message: 'Account created successfully! Please log in.' },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setLocalError(errorMessage);
      console.error('Registration error:', err);
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
                Join Catalyst
              </h1>
              <p style={{ color: improvingColors.gray500, fontSize: '14px' }}>
                Create your account and start sharing ideas
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

            {/* Registration Form */}
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
                  prefix={<MailOutlined style={{ color: improvingColors.primaryBlue }} />}
                  placeholder="you@example.com"
                  size="large"
                  disabled={isLoading}
                  style={{ borderRadius: '6px' }}
                />
              </Form.Item>

              <Form.Item
                name="displayName"
                label={<span style={{ fontWeight: 500, color: improvingColors.darkCharcoal }}>Display Name</span>}
                rules={[
                  { required: true, message: 'Display name is required' },
                  { min: 2, message: 'Display name must be at least 2 characters' },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: improvingColors.primaryBlue }} />}
                  placeholder="John Doe"
                  size="large"
                  disabled={isLoading}
                  style={{ borderRadius: '6px' }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span style={{ fontWeight: 500, color: improvingColors.darkCharcoal }}>Password</span>}
                rules={[
                  { required: true, message: 'Password is required' },
                  { min: 8, message: 'Password must be at least 8 characters' },
                ]}
                tooltip={{ title: 'At least 8 characters recommended', icon: <></> }}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: improvingColors.primaryBlue }} />}
                  placeholder="••••••••"
                  size="large"
                  disabled={isLoading}
                  style={{ borderRadius: '6px' }}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label={<span style={{ fontWeight: 500, color: improvingColors.darkCharcoal }}>Confirm Password</span>}
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: improvingColors.primaryBlue }} />}
                  placeholder="••••••••"
                  size="large"
                  disabled={isLoading}
                  style={{ borderRadius: '6px' }}
                />
              </Form.Item>

              <Form.Item
                name="terms"
                valuePropName="checked"
                rules={[{ required: true, message: 'You must agree to the terms' }]}
              >
                <Checkbox style={{ color: improvingColors.gray600 }}>
                  <span style={{ fontSize: '14px' }}>
                    I agree to the{' '}
                    <a href="#" style={{ color: improvingColors.primaryBlue }}>
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" style={{ color: improvingColors.primaryBlue }}>
                      Privacy Policy
                    </a>
                  </span>
                </Checkbox>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={isLoading}
                  style={{
                    background: improvingColors.primaryBlue,
                    borderColor: improvingColors.primaryBlue,
                    height: '40px',
                    fontSize: '16px',
                    fontWeight: 600,
                    borderRadius: '6px',
                  }}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </Form.Item>
            </Form>

            {/* Divider */}
            <Divider style={{ margin: '24px 0' }}>or</Divider>

            {/* Sign In Link */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ color: improvingColors.gray600, fontSize: '14px' }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{ color: improvingColors.primaryBlue, fontWeight: 600, textDecoration: 'none' }}
                >
                  Sign in
                </Link>
              </span>
            </div>
          </Card>

          {/* Features Section */}
          <div style={{ marginTop: '32px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Card
                  style={{
                    borderRadius: '8px',
                    border: `1px solid ${improvingColors.gray300}`,
                    textAlign: 'center',
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>💡</div>
                  <h4 style={{ color: improvingColors.darkCharcoal, marginBottom: '4px' }}>Submit Ideas</h4>
                  <p style={{ color: improvingColors.gray500, fontSize: '12px', marginBottom: 0 }}>
                    Share your innovative ideas
                  </p>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card
                  style={{
                    borderRadius: '8px',
                    border: `1px solid ${improvingColors.gray300}`,
                    textAlign: 'center',
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗳️</div>
                  <h4 style={{ color: improvingColors.darkCharcoal, marginBottom: '4px' }}>Vote & Discuss</h4>
                  <p style={{ color: improvingColors.gray500, fontSize: '12px', marginBottom: 0 }}>
                    Participate in discussions
                  </p>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card
                  style={{
                    borderRadius: '8px',
                    border: `1px solid ${improvingColors.gray300}`,
                    textAlign: 'center',
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
                  <h4 style={{ color: improvingColors.darkCharcoal, marginBottom: '4px' }}>Real-Time Chat</h4>
                  <p style={{ color: improvingColors.gray500, fontSize: '12px', marginBottom: 0 }}>
                    Collaborate in real-time
                  </p>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card
                  style={{
                    borderRadius: '8px',
                    border: `1px solid ${improvingColors.gray300}`,
                    textAlign: 'center',
                  }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                  <h4 style={{ color: improvingColors.darkCharcoal, marginBottom: '4px' }}>Track Progress</h4>
                  <p style={{ color: improvingColors.gray500, fontSize: '12px', marginBottom: 0 }}>
                    Monitor idea status
                  </p>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

RegisterPage.displayName = 'RegisterPage';

export default RegisterPage;
