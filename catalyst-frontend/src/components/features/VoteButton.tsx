import React, { useState } from 'react';

export type VoteType = 'upvote' | 'downvote';

export interface VoteButtonProps {
  upvotes: number;
  downvotes: number;
  userVote?: VoteType | null;
  onVote?: (voteType: VoteType) => Promise<void>;
  onUnvote?: (voteType: VoteType) => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  vertical?: boolean;
}

/**
 * VoteButton Component
 * Reusable voting interface component for ideas and content.
 * Features:
 * - Upvote and downvote buttons
 * - Vote count display
 * - Active vote tracking
 * - Loading states
 * - Customizable sizing
 * - Vertical or horizontal layout
 * - Async vote handling
 */
const VoteButton: React.FC<VoteButtonProps> = ({
  upvotes,
  downvotes,
  userVote = null,
  onVote,
  onUnvote,
  disabled = false,
  loading = false,
  className = '',
  size = 'md',
  vertical = false,
}) => {
  const [isVoting, setIsVoting] = useState(false);

  const handleUpvote = async () => {
    if (isVoting || !onVote || !onUnvote) return;

    setIsVoting(true);
    try {
      if (userVote === 'upvote') {
        await onUnvote('upvote');
      } else {
        await onVote('upvote');
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleDownvote = async () => {
    if (isVoting || !onVote || !onUnvote) return;

    setIsVoting(true);
    try {
      if (userVote === 'downvote') {
        await onUnvote('downvote');
      } else {
        await onVote('downvote');
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const sizeMap = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2',
  };

  const layoutClass = vertical ? 'flex flex-col gap-1' : 'flex gap-1';

  return (
    <div className={`${layoutClass} ${className}`}>
      {/* Upvote Button */}
      <button
        onClick={handleUpvote}
        disabled={disabled || loading || isVoting}
        className={`
          flex items-center justify-center gap-1 rounded-lg transition-colors font-medium
          ${userVote === 'upvote'
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeMap[size]}
        `}
        title="Upvote"
      >
        <span>👍</span>
        <span>{upvotes}</span>
      </button>

      {/* Downvote Button */}
      <button
        onClick={handleDownvote}
        disabled={disabled || loading || isVoting}
        className={`
          flex items-center justify-center gap-1 rounded-lg transition-colors font-medium
          ${userVote === 'downvote'
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeMap[size]}
        `}
        title="Downvote"
      >
        <span>👎</span>
        <span>{downvotes}</span>
      </button>
    </div>
  );
};

export default VoteButton;
