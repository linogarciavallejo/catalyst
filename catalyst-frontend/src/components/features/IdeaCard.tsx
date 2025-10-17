import React from "react";
import { Card, CardBody, CardFooter, Badge } from "../ui";
import { Button } from "../ui";
import type { Idea } from "../../types";

export interface IdeaCardProps {
  idea: Idea;
  onVote?: (ideaId: string, type: "upvote" | "downvote") => void;
  onComment?: (ideaId: string) => void;
  onEdit?: (ideaId: string) => void;
  onDelete?: (ideaId: string) => void;
  className?: string;
  isPending?: boolean; // Show pending badge for optimistic creates
  isPendingVote?: boolean; // Show pending vote state
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  onVote,
  onComment,
  onEdit,
  onDelete,
  className = "",
  isPending = false,
  isPendingVote = false,
}) => {
  const getStatusColor = (status: string): "primary" | "success" | "warning" | "danger" | "info" => {
    const statusMap: Record<string, "primary" | "success" | "warning" | "danger" | "info"> = {
      submitted: "info",
      under_review: "warning",
      approved: "success",
      rejected: "danger",
      implemented: "success",
    };
    return statusMap[status] || "primary";
  };

  return (
    <Card
      variant="outlined"
      hoverable
      padding="md"
      className={`flex flex-col ${className}`.trim()}
    >
      <CardBody>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {idea.title}
              {isPending && (
                <span className="ml-2 inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                  Posting...
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600">
              by {idea.author?.displayName || "Anonymous"} • {new Date(idea.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant={getStatusColor(idea.status)} size="sm" rounded>
              {idea.status.replace(/([A-Z])/g, " $1").trim()}
            </Badge>
            {isPendingVote && (
              <Badge variant="warning" size="sm" rounded>
                Updating...
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4 line-clamp-3">{idea.description}</p>

        {/* Tags/Category */}
        {idea.category && (
          <div className="mb-4">
            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
              {idea.category}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-900">{idea.upvotes || 0}</span>
            <span>👍 Upvotes</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-900">{idea.downvotes || 0}</span>
            <span>👎 Downvotes</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-900">{idea.commentCount || 0}</span>
            <span>💬 Comments</span>
          </div>
        </div>
      </CardBody>

      {/* Actions */}
      <CardFooter align="between">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onVote?.(idea.id, "upvote")}
          >
            👍 Upvote
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onVote?.(idea.id, "downvote")}
          >
            👎 Downvote
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onComment?.(idea.id)}
          >
            💬 Comment
          </Button>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(idea.id)}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => onDelete(idea.id)}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

IdeaCard.displayName = "IdeaCard";
