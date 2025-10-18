import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Header, Footer } from '@/components/Layout';
import { useAuth } from '@/hooks';
import type { LoginRequest } from '@/services';

/**
 * LoginPage Component
 * Handles user authentication via email and password.
 * Features:
 * - Email and password input
 * - Form validation
 * - Error handling and display
 * - Redirect to intended page after login
 * - Link to registration page
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [validationError, setValidationError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Check for success message from registration redirect
  useEffect(() => {
    const message = (location.state as { message?: string })?.message;
    if (message) {
      setSuccessMessage(message);
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setValidationError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setValidationError('Please enter a valid email');
      return false;
    }
    if (!formData.password) {
      setValidationError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login(formData);
      // Redirect to home page after successful login
      // Don't use location.state.from for login, as it might be a protected route
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      const redirectTo = (from && !from.includes('/create') && !from.includes('/edit')) ? from : '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // Error is handled by useAuth and displayed via error state
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        logo="💡"
        title="Catalyst"
        actions={
          <Link to="/">
            <Button variant="outline" size="sm">
              Back to Home
            </Button>
          </Link>
        }
      />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Login Form Card */}
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
              <p className="text-gray-600">
                Sign in to your Catalyst account
              </p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm font-medium">
                  {successMessage}
                </p>
              </div>
            )}

            {/* Error Messages */}
            {(error || validationError) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-medium">
                  {error || validationError}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isLoading}
                  data-testid="login-email-input"
                />
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isLoading}
                  data-testid="login-password-input"
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Remember me</span>
                </label>
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
                data-testid="login-submit"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-gray-500 text-sm">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-700 text-sm">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Demo Credentials (for testing) */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-900 text-sm font-medium mb-2">
              💡 Demo Credentials (for testing):
            </p>
            <code className="text-blue-800 text-xs block">
              Email: demo@example.com
              <br />
              Password: Demo123!
            </code>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer
        columns={[
          {
            title: 'Product',
            links: [
              { label: 'Features', href: '#' },
              { label: 'Pricing', href: '#' },
              { label: 'Security', href: '#' },
            ],
          },
          {
            title: 'Company',
            links: [
              { label: 'About', href: '#' },
              { label: 'Blog', href: '#' },
              { label: 'Contact', href: '#' },
            ],
          },
          {
            title: 'Legal',
            links: [
              { label: 'Privacy', href: '#' },
              { label: 'Terms', href: '#' },
              { label: 'License', href: '#' },
            ],
          },
        ]}
        copyright="© 2025 Catalyst. All rights reserved."
      />
    </div>
  );
};

LoginPage.displayName = 'LoginPage';

export default LoginPage;
