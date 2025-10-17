import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Header, Footer } from '@/components/Layout';
import { UserProfile } from '@/components/features';

/**
 * UserProfilePage Component
 * Display user profile with their ideas and activity.
 * Features:
 * - User information and statistics
 * - User's submitted ideas
 * - Follow/Message buttons
 * - Recent activity
 */
const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  const user = {
    id: userId || 'u1',
    displayName: 'John Doe',
    email: 'john@example.com',
    role: 'Creator' as const,
    joinDate: new Date('2025-09-01'),
    ideasCount: 12,
    commentsCount: 45,
    followersCount: 234,
    followingCount: 89,
    bio: 'Passionate about innovation and technology. Always looking for ways to improve the world.',
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        logo="💡"
        title="Catalyst"
        actions={
          <Link to="/ideas">
            <Button variant="outline" size="sm">
              Back
            </Button>
          </Link>
        }
      />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Section */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          {/* Sidebar */}
          <div className="col-span-1">
            <UserProfile
              user={{
                id: user.id,
                displayName: user.displayName,
                email: user.email,
                role: 'User',
                joinDate: user.joinDate,
                ideasCount: user.ideasCount,
                commentsCount: user.commentsCount,
                followersCount: user.followersCount,
                followingCount: user.followingCount,
              }}
              isOwnProfile={false}
              onFollowClick={() => {
                console.log('Follow clicked');
              }}
            />
          </div>

          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                About
              </h2>
              <p className="text-gray-700">{user.bio}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-gray-600 text-sm">Ideas Submitted</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {user.ideasCount}
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-gray-600 text-sm">Comments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {user.commentsCount}
                </p>
              </div>
            </div>

            {/* Recent Ideas */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Ideas
              </h2>
              <div className="space-y-3">
                {[1, 2, 3].map((idea) => (
                  <div
                    key={idea}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="font-medium text-gray-900">
                      Idea #{idea}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Brief description of the idea
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">2 days ago</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Approved
                      </span>
                    </div>
                  </div>
                ))}
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

UserProfilePage.displayName = 'UserProfilePage';

export default UserProfilePage;
