import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Header, Footer } from '@/components/Layout';
import { VoteButton, UserProfile } from '@/components/features';
import TypingIndicator from '@/components/TypingIndicator';
import PresenceIndicator from '@/components/PresenceIndicator';
import type { Idea } from '@/types';
import { useIdeas, useVoting, useComments, useActivity } from '@/hooks';

/**
 * IdeaDetailPage Component
 * Display detailed view of a single idea with comments and voting.
 * Features:
 * - Full idea details and description
 * - Vote count and voting interaction
 * - Comment thread
 * - Author profile
 * - Status badge
 * - Edit/Delete actions for own ideas
 */
const IdeaDetailPage: React.FC = () => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const { getIdeaById: loadIdea } = useIdeas();
  const { submitVote } = useVoting();
  const { getComments, addComment, comments, pendingComments } = useComments();
  const { typingUsers, viewingUsers, startTyping, stopTyping, setViewingIdea } = useActivity();

  const [idea, setIdea] = useState<Idea | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track viewing activity
  useEffect(() => {
    if (ideaId) {
      setViewingIdea(ideaId);
    }
  }, [ideaId, setViewingIdea]);

  // Load idea and comments on mount
  useEffect(() => {
    const loadData = async () => {
      if (!ideaId) return;
      try {
        setLoading(true);
        setError(null);
        const loadedIdea = await loadIdea(ideaId);
        if (loadedIdea) {
          setIdea(loadedIdea);
          await getComments(ideaId);
        } else {
          setError('Idea not found');
        }
      } catch (err) {
        console.error('Failed to load idea:', err);
        setError('Failed to load idea');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ideaId, loadIdea, getComments]);

  const handleVote = async (voteType: string) => {
    if (!idea) return;
    try {
      // Convert vote type string to proper VoteType (Upvote | Downvote)
      const voteTypeMap: Record<string, 'Upvote' | 'Downvote'> = {
        'upvote': 'Upvote',
        'downvote': 'Downvote',
      };
      const normalizedType = voteTypeMap[voteType.toLowerCase()];
      if (!normalizedType) throw new Error('Invalid vote type');
      
      await submitVote(idea.id, normalizedType);
      // Reload idea to get updated vote counts
      const updatedIdea = await loadIdea(idea.id);
      if (updatedIdea) setIdea(updatedIdea);
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !idea) return;

    try {
      setIsSubmittingComment(true);
      await addComment({ ideaId: idea.id, content: newComment });
      setNewComment('');
      // Reload comments
      await getComments(idea.id);
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'UnderReview':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header logo="💡" title="Catalyst" actions={<Link to="/ideas"><Button variant="outline" size="sm">Back</Button></Link>} />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Loading idea...</p>
        </main>
        <Footer columns={[]} copyright="© 2025 Catalyst. All rights reserved." />
      </div>
    );
  }

  // Show error state
  if (error || !idea) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header logo="💡" title="Catalyst" actions={<Link to="/ideas"><Button variant="outline" size="sm">Back</Button></Link>} />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <p className="text-red-600">{error || 'Idea not found'}</p>
        </main>
        <Footer columns={[]} copyright="© 2025 Catalyst. All rights reserved." />
      </div>
    );
  }

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
                Back
              </Button>
            </Link>
            <Link to={`/ideas/${idea.id}/edit`}>
              <Button variant="primary" size="sm">
                Edit
              </Button>
            </Link>
          </div>
        }
      />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Presence Indicator */}
        {ideaId && (
          <div className="mb-6">
            <PresenceIndicator
              users={ideaId ? viewingUsers[ideaId] : []}
              ideaId={ideaId}
            />
          </div>
        )}

        {/* Idea Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {idea.title}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(idea.status)}`}
                >
                  {idea.status}
                </span>
                <span className="text-gray-600">
                  Category: <strong>{idea.category}</strong>
                </span>
              </div>
            </div>
            <VoteButton
              upvotes={idea.upvotes}
              downvotes={idea.downvotes}
              vertical={true}
              onVote={handleVote}
            />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="col-span-2">
            {/* Description */}
            <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {idea.description}
              </p>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Discussion ({idea.commentCount} comments)
              </h2>

              {/* Comment Form */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <form onSubmit={handleAddComment}>
                  <textarea
                    placeholder="Share your thoughts..."
                    rows={4}
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      if (ideaId && e.target.value.trim()) startTyping(ideaId);
                    }}
                    onBlur={() => {
                      if (ideaId) stopTyping(ideaId);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="comment-input"
                  />
                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex-1">
                      <TypingIndicator
                        users={ideaId ? typingUsers[ideaId] : []}
                        showLabel={true}
                      />
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      data-testid="submit-comment"
                    >
                      {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {/* Optimistic comments first (showing pending state) */}
                {pendingComments && pendingComments.length > 0 && (
                  <div className="space-y-4">
                    {pendingComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 opacity-70"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {comment.author.displayName}
                            </p>
                            <p className="text-sm text-gray-500">Posting...</p>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                {/* Real comments */}
                {comments && comments.map((comment) => (
                  <div key={comment.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {comment.author.displayName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {comment.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                    <p className="text-gray-700 mb-3">{comment.content}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        👍 Like
                      </Button>
                      <Button variant="outline" size="sm">
                        Reply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-1 space-y-6">
            {/* Author Card */}
            <UserProfile
              user={{
                id: idea.author.id,
                displayName: idea.author.displayName,
                email: idea.author.email,
                role: 'User',
                joinDate: idea.author.createdAt,
                ideasCount: 5,
                commentsCount: 12,
                followersCount: 45,
                followingCount: 23,
              }}
              isOwnProfile={false}
              onFollowClick={() => {
                console.log('Follow clicked');
              }}
            />

            {/* Info Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Details
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Created</span>
                  <p className="text-gray-900 font-medium">
                    {idea.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Last Updated</span>
                  <p className="text-gray-900 font-medium">
                    {idea.updatedAt.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Status</span>
                  <p className="text-gray-900 font-medium">{idea.status}</p>
                </div>
              </div>
            </div>
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

IdeaDetailPage.displayName = 'IdeaDetailPage';

export default IdeaDetailPage;
