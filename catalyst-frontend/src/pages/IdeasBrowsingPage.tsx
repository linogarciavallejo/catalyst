import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { Header, Footer } from '@/components/Layout';
import { IdeaCard } from '@/components/features';
import { useIdeas, useVoting } from '../hooks';
import type { Idea } from '@/types';

/**
 * IdeasBrowsingPage Component
 * Browse and filter ideas with search, sorting, and pagination.
 * Features:
 * - Search and filter ideas (real data from backend)
 * - Sort by status, date, votes
 * - Pagination
 * - Status badges
 * - Direct links to idea details
 * - Real-time voting
 */
const IdeasBrowsingPage: React.FC = () => {
  const { ideas, pendingIdeas, isPending, getIdeas, searchIdeas, isLoading } = useIdeas();
  const { submitVote, isPending: isVotePending } = useVoting();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [page, setPage] = useState(1);
  const [displayedIdeas, setDisplayedIdeas] = useState<Idea[]>([]);

  // Load ideas on mount
  useEffect(() => {
    const loadIdeas = async () => {
      try {
        await getIdeas();
      } catch (err) {
        console.error('Failed to load ideas:', err);
      }
    };

    loadIdeas();
  }, [getIdeas]);

  // Filter and sort ideas
  useEffect(() => {
    // Combine pending and confirmed ideas (pending first)
    const allIdeas = [...pendingIdeas, ...ideas];
    let filtered = allIdeas;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (idea) =>
          idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter (skip for pending ideas to show them always)
    if (statusFilter !== 'all') {
      filtered = filtered.filter((idea) => {
        // Always show pending ideas
        if (idea.id.startsWith('pending-')) return true;
        return idea.status === statusFilter;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => {
          // Pending ideas float to top
          if (a.id.startsWith('pending-')) return -1;
          if (b.id.startsWith('pending-')) return 1;
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        });
        break;
      case 'controversial':
        filtered.sort((a, b) => {
          // Pending ideas float to top
          if (a.id.startsWith('pending-')) return -1;
          if (b.id.startsWith('pending-')) return 1;
          return (b.commentCount - a.commentCount);
        });
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => {
          // Pending ideas float to top
          if (a.id.startsWith('pending-')) return -1;
          if (b.id.startsWith('pending-')) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }

    setDisplayedIdeas(filtered);
    setPage(1);
  }, [ideas, pendingIdeas, searchTerm, statusFilter, sortBy]);

  // Handle search
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      try {
        await searchIdeas(term);
      } catch (err) {
        console.error('Search failed:', err);
      }
    }
  };

  // Handle voting
  const handleVote = async (ideaId: string, voteType: string) => {
    try {
      const type = voteType.charAt(0).toUpperCase() + voteType.slice(1) as 'Upvote' | 'Downvote';
      await submitVote(ideaId, type);
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

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
            Explore {displayedIdeas.length} ideas from the community
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
                handleSearch(e.currentTarget.value);
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

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading ideas...</p>
          </div>
        )}

        {/* Ideas List */}
        {!isLoading && (
          <div className="space-y-4 mb-8">
            {displayedIdeas.length > 0 ? (
              displayedIdeas.map((idea) => (
                <Link key={idea.id} to={`/ideas/${idea.id}`}>
                  <IdeaCard
                    idea={idea}
                    isPending={isPending(idea.id)}
                    isPendingVote={isVotePending(idea.id)}
                    onVote={(ideaId, type) => {
                      handleVote(ideaId, type);
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
        )}

        {/* Pagination */}
        {!isLoading && displayedIdeas.length > 0 && (
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
