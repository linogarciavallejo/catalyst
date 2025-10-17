import React from "react";
import "./TypingIndicator.css";

interface TypingIndicatorProps {
  users: string[];
  showLabel?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  users,
  showLabel = true,
}) => {
  if (!users || users.length === 0) {
    return null;
  }

  const userList = users.slice(0, 3).join(", ");
  const hasMore = users.length > 3;
  const label = hasMore
    ? `${userList}, and ${users.length - 3} more`
    : userList;

  return (
    <div className="typing-indicator-container">
      <div className="typing-dots">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
      {showLabel && (
        <span className="typing-label">
          {label} {users.length === 1 ? "is" : "are"} typing...
        </span>
      )}
    </div>
  );
};

export default TypingIndicator;
