import React from 'react';
import { Button, Badge, Card, CardHeader, CardBody, CardFooter } from '@/components/ui';

export interface User {
  id: string;
  displayName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  joinDate: Date;
  role: 'Admin' | 'User' | 'Guest';
  ideasCount?: number;
  commentsCount?: number;
  followersCount?: number;
  followingCount?: number;
}

export interface UserProfileProps {
  user: User;
  isOwnProfile?: boolean;
  onEditClick?: () => void;
  onFollowClick?: () => void;
  onMessageClick?: () => void;
  onLogoutClick?: () => void;
  loading?: boolean;
  className?: string;
}

const roleColorMap: Record<User['role'], 'primary' | 'success' | 'warning' | 'info'> = {
  Admin: 'warning',
  User: 'primary',
  Guest: 'info',
};

/**
 * UserProfile Component
 * Displays user profile information and statistics.
 * Features:
 * - User avatar with fallback initial
 * - Display name, email, bio
 * - Role badge with color coding
 * - Join date
 * - Statistics (ideas, comments, followers, following)
 * - Action buttons (edit, follow, message, logout)
 * - Different UI for own profile vs others
 * - Responsive design
 */
const UserProfile: React.FC<UserProfileProps> = ({
  user,
  isOwnProfile = false,
  onEditClick,
  onFollowClick,
  onMessageClick,
  onLogoutClick,
  loading = false,
  className = '',
}) => {
  const joinDateFormatted = new Date(user.joinDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getAvatarColor = (role: User['role']): string => {
    switch (role) {
      case 'Admin':
        return 'bg-red-500';
      case 'User':
        return 'bg-blue-500';
      case 'Guest':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <Card variant="elevated" className={className}>
      {/* Header Section */}
      <CardHeader className="text-center">
        {/* Avatar */}
        <div className={`w-20 h-20 rounded-full ${getAvatarColor(user.role)} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4`}>
          {user.displayName.charAt(0).toUpperCase()}
        </div>

        {/* Name and Role */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">{user.displayName}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="flex justify-center">
            <Badge variant={roleColorMap[user.role]} size="md">
              {user.role}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Bio and Join Date */}
      <CardBody>
        {user.bio && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 text-center italic">{user.bio}</p>
          </div>
        )}

        <div className="text-center mb-4 text-xs text-gray-500">
          <p>Joined {joinDateFormatted}</p>
        </div>

        {/* Statistics Grid */}
        {(user.ideasCount !== undefined ||
          user.commentsCount !== undefined ||
          user.followersCount !== undefined ||
          user.followingCount !== undefined) && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            {user.ideasCount !== undefined && (
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{user.ideasCount}</p>
                <p className="text-xs text-gray-600">Ideas</p>
              </div>
            )}
            {user.commentsCount !== undefined && (
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{user.commentsCount}</p>
                <p className="text-xs text-gray-600">Comments</p>
              </div>
            )}
            {user.followersCount !== undefined && (
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{user.followersCount}</p>
                <p className="text-xs text-gray-600">Followers</p>
              </div>
            )}
            {user.followingCount !== undefined && (
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{user.followingCount}</p>
                <p className="text-xs text-gray-600">Following</p>
              </div>
            )}
          </div>
        )}
      </CardBody>

      {/* Action Buttons */}
      <CardFooter>
        <div className="flex gap-2 justify-center w-full flex-wrap">
          {isOwnProfile ? (
            <>
              {onEditClick && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onEditClick}
                  disabled={loading}
                >
                  Edit Profile
                </Button>
              )}
              {onLogoutClick && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogoutClick}
                  disabled={loading}
                >
                  Logout
                </Button>
              )}
            </>
          ) : (
            <>
              {onFollowClick && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onFollowClick}
                  disabled={loading}
                >
                  Follow
                </Button>
              )}
              {onMessageClick && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMessageClick}
                  disabled={loading}
                >
                  Message
                </Button>
              )}
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default UserProfile;
