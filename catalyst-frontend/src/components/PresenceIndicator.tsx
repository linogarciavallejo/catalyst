import React from "react";
import "./PresenceIndicator.css";

interface PresenceIndicatorProps {
  users: string[];
  ideaId?: string;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  users,
  ideaId,
}) => {
  if (!users || users.length === 0) {
    return null;
  }

  return (
    <div className="presence-indicator-container">
      <div className="presence-avatars">
        {users.slice(0, 4).map((user, index) => (
          <div
            key={`${ideaId}-${user}-${index}`}
            className="presence-avatar"
            title={user}
          >
            {user.substring(0, 2).toUpperCase()}
          </div>
        ))}
        {users.length > 4 && (
          <div className="presence-avatar presence-more">
            +{users.length - 4}
          </div>
        )}
      </div>
      <span className="presence-label">
        {users.length === 1
          ? `${users[0]} viewing`
          : `${users.length} viewing`}
      </span>
    </div>
  );
};

export default PresenceIndicator;
