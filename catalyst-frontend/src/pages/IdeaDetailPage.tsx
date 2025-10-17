import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Header, Footer } from '@/components/Layout';
import { VoteButton, UserProfile } from '@/components/features';
import type { Idea, Comment } from '@/types';
import { IdeaStatus } from '@/types';

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
  const [idea] = useState<Idea>({
    id: ideaId || '1',
    title: 'Implement dark mode UI',
    description:
      'Add comprehensive dark mode support across the entire application. This would include:\n\n' +
      '- Custom CSS variables for theme switching\n' +
      '- Automatic theme detection based on system preferences\n' +
      '- User preference persistence in local storage\n' +
      '- Smooth transitions between themes\n' +
      '- Accessibility compliance for both light and dark modes\n\n' +
      'Benefits:\n' +
      '- Reduced eye strain for night users\n' +
      '- Better battery life on OLED displays\n' +
      '- Modern user experience\n' +
      '- Competitive advantage',
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
  });

  const [comments] = useState<Comment[]>([
    {
      id: 'c1',
      ideaId: idea.id,
      authorId: 'u2',
      author: {
        id: 'u2',
        displayName: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Contributor',
        eipPoints: 95,
        createdAt: new Date('2025-08-15'),
      },
      content: 'Great idea! Dark mode is definitely needed.',
      createdAt: new Date('2025-10-11'),
      updatedAt: new Date('2025-10-11'),
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case IdeaStatus.Approved:
        return 'bg-green-100 text-green-800';
      case IdeaStatus.UnderReview:
        return 'bg-yellow-100 text-yellow-800';
      case IdeaStatus.Rejected:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              onVote={async () => {
                console.log(`Voted on idea ${idea.id}`);
              }}
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
                <textarea
                  placeholder="Share your thoughts..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-3 flex justify-end">
                  <Button variant="primary" size="sm">
                    Post Comment
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
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
