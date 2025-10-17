import React from "react";
import type { UserActivity } from "../services/signalr/hubs/activityHub";
import "./ActiveUsersList.css";

interface ActiveUsersListProps {
  users: UserActivity[];
  maxDisplay?: number;
}

export const ActiveUsersList: React.FC<ActiveUsersListProps> = ({
  users,
  maxDisplay = 10,
}) => {
  if (!users || users.length === 0) {
    return null;
  }

  const displayedUsers = users.slice(0, maxDisplay);
  const hasMore = users.length > maxDisplay;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "typing":
        return "status-typing";
      case "viewing":
        return "status-viewing";
      case "idle":
        return "status-idle";
      default:
        return "status-idle";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "typing":
        return "✎";
      case "viewing":
        return "👁";
      case "idle":
        return "●";
      default:
        return "●";
    }
  };

  return (
    <div className="active-users-list-container">
      <div className="active-users-header">
        <h4>Active Users ({users.length})</h4>
      </div>
      <div className="active-users-list">
        {displayedUsers.map((user) => (
          <div key={user.userId} className="active-user-item">
            <div className={`user-status-dot ${getStatusColor(user.activityType)}`}>
              {getStatusIcon(user.activityType)}
            </div>
            <div className="user-info">
              <span className="user-name">{user.userName}</span>
              <span className="user-status">{user.activityType}</span>
            </div>
            {user.ideaId && (
              <span className="user-idea-indicator" title={`Viewing idea`}>
                #
              </span>
            )}
          </div>
        ))}
        {hasMore && (
          <div className="active-user-item more">
            <span>+{users.length - maxDisplay} more</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveUsersList;
