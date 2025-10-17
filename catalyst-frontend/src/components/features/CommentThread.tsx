import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Input, Button, Spinner } from '@/components/ui';

export interface Comment {
  id: string;
  ideaId: string;
  author: {
    id: string;
    displayName: string;
    email: string;
  };
  content: string;
  createdAt: Date;
  updatedAt: Date;
  replies?: Comment[];
  likeCount: number;
  isLiked?: boolean;
}

export interface CommentThreadProps {
  comments: Comment[];
  ideaId: string;
  loading?: boolean;
  onAddComment?: (content: string, parentCommentId?: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onLikeComment?: (commentId: string) => Promise<void>;
  onReplyClick?: (parentCommentId: string) => void;
  className?: string;
}

/**
 * CommentThread Component
 * Displays hierarchical comment threads with reply functionality.
 * Features:
 * - Nested comment display with indentation
 * - Reply functionality with reply form
 * - Like/unlike comments
 * - Delete comments
 * - Timestamps with relative format
 * - Loading states
 */
const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  loading = false,
  onAddComment,
  onDeleteComment,
  onLikeComment,
  onReplyClick,
  className = '',
}) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReplySubmit = async (parentCommentId: string) => {
    if (!replyContent.trim() || !onAddComment) return;

    setIsSubmitting(true);
    try {
      await onAddComment(replyContent, parentCommentId);
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to add reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCommentItem = (comment: Comment, depth = 0): React.ReactNode => {
    const isReplying = replyingTo === comment.id;
    const paddingClass = depth === 0 ? 'pl-0' : `pl-${Math.min(depth * 4, 12)}`;

    return (
      <div key={comment.id} className={`${paddingClass} mb-4 border-l-2 border-gray-200 pl-4`}>
        {/* Comment Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
              {comment.author.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{comment.author.displayName}</p>
              <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.createdAt))} ago</p>
            </div>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center gap-1">
            {onDeleteComment && (
              <button
                onClick={() => onDeleteComment(comment.id)}
                className="text-gray-400 hover:text-red-600 text-sm transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Comment Content */}
        <p className="mt-2 text-sm text-gray-700 leading-relaxed">{comment.content}</p>

        {/* Comment Footer */}
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={() => onLikeComment?.(comment.id)}
            className={`text-sm font-medium transition-colors ${
              comment.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
            }`}
          >
            {comment.isLiked ? '❤️' : '🤍'} {comment.likeCount}
          </button>

          <button
            onClick={() => {
              setReplyingTo(isReplying ? null : comment.id);
              onReplyClick?.(comment.id);
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {isReplying ? 'Cancel' : 'Reply'}
          </button>
        </div>

        {/* Reply Form */}
        {isReplying && onAddComment && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <Input
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.currentTarget.value)}
              className="mb-2"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleReplySubmit(comment.id)}
                isLoading={isSubmitting}
                disabled={!replyContent.trim()}
              >
                Reply
              </Button>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map((reply) => renderCommentItem(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <Spinner size="md" />
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <p className="text-sm">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {comments.map((comment) => renderCommentItem(comment))}
    </div>
  );
};

export default CommentThread;
