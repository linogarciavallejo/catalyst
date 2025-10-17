import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { Header, Footer } from '@/components/Layout';
import { IdeaCard } from '@/components/features';
import type { Idea } from '@/types';
import { IdeaStatus } from '@/types';

/**
 * IdeasBrowsingPage Component
 * Browse and filter ideas with search, sorting, and pagination.
 * Features:
 * - Search and filter ideas
 * - Sort by status, date, votes
 * - Pagination
 * - Status badges
 * - Direct links to idea details
 */
const IdeasBrowsingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [page, setPage] = useState(1);

  // Mock data - will be replaced with API calls
  const mockIdeas: Idea[] = [
    {
      id: '1',
      title: 'Implement dark mode UI',
      description: 'Add dark mode support for better user experience',
      category: 'Feature',
      authorId: 'u1',
      author: {
        id: 'u1',
        displayName: 'John Doe',
        email: 'john@example.com',
        role: 'Creator',
        eipPoints: 150,
        createdAt: new Date('2025-09-01'),
      },
      status: IdeaStatus.Approved,
      upvotes: 42,
      downvotes: 3,
      commentCount: 15,
      createdAt: new Date('2025-10-10'),
      updatedAt: new Date('2025-10-15'),
    },
    {
      id: '2',
      title: 'Mobile responsive design',
      description: 'Improve mobile responsiveness across all pages',
      category: 'Enhancement',
      authorId: 'u2',
      author: {
        id: 'u2',
        displayName: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Contributor',
        eipPoints: 95,
        createdAt: new Date('2025-08-15'),
      },
      status: IdeaStatus.UnderReview,
      upvotes: 28,
      downvotes: 2,
      commentCount: 8,
      createdAt: new Date('2025-10-12'),
      updatedAt: new Date('2025-10-16'),
    },
    {
      id: '3',
      title: 'API rate limiting',
      description: 'Implement rate limiting for API endpoints',
      category: 'Infrastructure',
      authorId: 'u3',
      author: {
        id: 'u3',
        displayName: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'Champion',
        eipPoints: 210,
        createdAt: new Date('2025-07-20'),
      },
      status: IdeaStatus.Submitted,
      upvotes: 15,
      downvotes: 1,
      commentCount: 5,
      createdAt: new Date('2025-10-14'),
      updatedAt: new Date('2025-10-17'),
    },
  ];

  const filteredIdeas = mockIdeas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || idea.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        logo="💡"
        title="Catalyst"
        actions={
          <div className="flex gap-2">
            <Link to="/">
              <Button variant="outline" size="sm">
                Home
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Browse Ideas
          </h1>
          <p className="text-gray-600">
            Explore {filteredIdeas.length} ideas from the community
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <Input
              placeholder="Search ideas..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.currentTarget.value);
                setPage(1);
              }}
              className="md:col-span-1"
            />

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.currentTarget.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="UnderReview">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.currentTarget.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="controversial">Most Discussed</option>
            </select>
          </div>
        </div>

        {/* Ideas List */}
        <div className="space-y-4 mb-8">
          {filteredIdeas.length > 0 ? (
            filteredIdeas.map((idea) => (
              <Link key={idea.id} to={`/ideas/${idea.id}`}>
                <IdeaCard
                  idea={idea}
                  onVote={(ideaId, type) => {
                    console.log(`Voted ${type} on idea ${ideaId}`);
                  }}
                  onComment={(ideaId) => {
                    console.log(`Comment on idea ${ideaId}`);
                  }}
                />
              </Link>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No ideas found</p>
              <Link to="/ideas/create">
                <Button variant="primary" size="md" className="mt-4">
                  Submit the First Idea
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredIdeas.length > 0 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="px-4 py-2 border border-gray-300 rounded-lg">
              Page {page}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
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

IdeasBrowsingPage.displayName = 'IdeasBrowsingPage';

export default IdeasBrowsingPage;
