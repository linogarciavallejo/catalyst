import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Header, Footer } from '@/components/Layout';

/**
 * SettingsPage Component
 * User settings and preferences management.
 * Features:
 * - Profile settings
 * - Notification preferences
 * - Privacy settings
 * - Theme preferences
 */
const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    displayName: 'John Doe',
    email: 'john@example.com',
    bio: 'Passionate about innovation',
    language: 'en',
    theme: 'light',
    emailNotifications: true,
    pushNotifications: true,
    newsletter: false,
    privateProfile: false,
    showActivity: true,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.currentTarget;
    const checked = (e.currentTarget as HTMLInputElement).checked;

    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
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
              Home
            </Button>
          </Link>
        }
      />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Success Message */}
          {saved && (
            <div className="p-4 bg-green-100 border border-green-300 rounded-lg text-green-800">
              ✓ Settings saved successfully!
            </div>
          )}

          {/* Profile Settings */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Profile Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Display Name
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={settings.displayName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={settings.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={settings.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="language"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Language
                </label>
                <select
                  id="language"
                  name="language"
                  value={settings.language}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="theme"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Theme
                </label>
                <select
                  id="theme"
                  name="theme"
                  value={settings.theme}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Notifications
            </h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="ml-3 text-gray-700">
                  Email notifications
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="pushNotifications"
                  checked={settings.pushNotifications}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="ml-3 text-gray-700">Push notifications</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="newsletter"
                  checked={settings.newsletter}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="ml-3 text-gray-700">Newsletter</span>
              </label>
            </div>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Privacy
            </h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="privateProfile"
                  checked={settings.privateProfile}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="ml-3 text-gray-700">Private profile</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="showActivity"
                  checked={settings.showActivity}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="ml-3 text-gray-700">Show activity</span>
              </label>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <Link to="/">
              <Button variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
            >
              Save Settings
            </Button>
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

SettingsPage.displayName = 'SettingsPage';

export default SettingsPage;
