import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Header, Footer } from '@/components/Layout';

/**
 * NotFoundPage Component
 * 404 error page for missing routes.
 */
const NotFoundPage: React.FC = () => {
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
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {/* Large 404 */}
          <div className="text-9xl font-bold text-gray-200 mb-4">404</div>

          {/* Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>

          {/* Suggestions */}
          <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">
              Where would you like to go?
            </h2>
            <div className="space-y-2 text-sm">
              <Link to="/" className="block text-blue-600 hover:underline">
                → Back to Home
              </Link>
              <Link to="/ideas" className="block text-blue-600 hover:underline">
                → Browse Ideas
              </Link>
              <Link
                to="/ideas/create"
                className="block text-blue-600 hover:underline"
              >
                → Submit an Idea
              </Link>
              <Link to="/chat" className="block text-blue-600 hover:underline">
                → Community Chat
              </Link>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/">
              <Button variant="primary" size="md">
                Go Home
              </Button>
            </Link>
            <Link to="/ideas">
              <Button variant="outline" size="md">
                Browse Ideas
              </Button>
            </Link>
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

NotFoundPage.displayName = 'NotFoundPage';

export default NotFoundPage;
