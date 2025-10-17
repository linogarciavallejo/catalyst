import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Header, Footer } from '@/components/Layout';
import { Card, CardBody } from '@/components/ui';
import { useIdeas } from '../hooks';
import type { Idea } from '@/types';

interface StatsData {
  totalIdeas: number;
  approvedIdeas: number;
  discussionCount: number;
}

/**
 * HomePage Component
 * Landing page / dashboard for the application.
 * Features:
 * - Hero section with call to action
 * - Real stats overview loaded from backend
 * - Featured/trending ideas carousel
 * - Navigation links
 */
const HomePage: React.FC = () => {
  const { ideas, getTrendingIdeas } = useIdeas();
  const [stats, setStats] = useState<StatsData>({
    totalIdeas: 0,
    approvedIdeas: 0,
    discussionCount: 0,
  });

  // Load trending ideas on mount
  useEffect(() => {
    const loadTrendingIdeas = async () => {
      try {
        await getTrendingIdeas(6);
      } catch (err) {
        console.error('Failed to load trending ideas:', err);
      }
    };

    loadTrendingIdeas();
  }, [getTrendingIdeas]);

  // Update stats based on loaded ideas
  useEffect(() => {
    if (ideas.length > 0) {
      const approved = ideas.filter((idea: Idea) => idea.status === 'Approved').length;
      const totalComments = ideas.reduce((sum: number, idea: Idea) => sum + idea.commentCount, 0);

      setStats({
        totalIdeas: ideas.length,
        approvedIdeas: approved,
        discussionCount: totalComments,
      });
    }
  }, [ideas]);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        logo="💡"
        title="Catalyst"
        actions={
          <div className="flex gap-2">
            <Link to="/ideas">
              <Button variant="outline" size="sm">
                Browse Ideas
              </Button>
            </Link>
            <Link to="/ideas/create">
              <Button variant="primary" size="sm">
                Submit Idea
              </Button>
            </Link>
          </div>
        }
      />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12 py-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Collaborative Innovation Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Share, discuss, and vote on innovative ideas in real-time
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/ideas">
              <Button variant="primary" size="lg">
                Explore Ideas
              </Button>
            </Link>
            <Link to="/ideas/create">
              <Button variant="secondary" size="lg">
                Submit Your Idea
              </Button>
            </Link>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardBody>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">{stats.totalIdeas}</p>
                <p className="text-gray-600 mt-2">Ideas Submitted</p>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600">{stats.discussionCount}</p>
                <p className="text-gray-600 mt-2">Active Discussions</p>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-600">{stats.approvedIdeas}</p>
                <p className="text-gray-600 mt-2">Approved Ideas</p>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Features Section */}
        <section className="bg-white rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="font-semibold text-gray-900 mb-2">Submit Ideas</h3>
              <p className="text-gray-600 text-sm">
                Share your innovative ideas with the community
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🗳️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Vote & Discuss</h3>
              <p className="text-gray-600 text-sm">
                Upvote ideas and participate in discussions
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-Time Chat</h3>
              <p className="text-gray-600 text-sm">
                Collaborate with team members in real-time
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-gray-600 text-sm">
                Follow ideas from submission to approval
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 text-white rounded-lg p-8 text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of innovators sharing and collaborating on ideas
          </p>
          <Link to="/ideas/create">
            <Button variant="primary" size="lg" className="bg-white text-blue-600">
              Submit Your First Idea
            </Button>
          </Link>
        </section>
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

HomePage.displayName = 'HomePage';

export default HomePage;
