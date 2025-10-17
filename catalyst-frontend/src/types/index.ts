// User types
export const UserRole = {
  Admin: "Admin",
  Creator: "Creator",
  Contributor: "Contributor",
  Champion: "Champion",
  Visitor: "Visitor",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  eipPoints: number;
  createdAt: Date;
}

// Idea types
export const IdeaStatus = {
  Submitted: "Submitted",
  UnderReview: "UnderReview",
  Approved: "Approved",
  InProgress: "InProgress",
  Completed: "Completed",
  Rejected: "Rejected",
  OnHold: "OnHold",
} as const;

export type IdeaStatus = (typeof IdeaStatus)[keyof typeof IdeaStatus];

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  status: IdeaStatus;
  authorId: string;
  author: User;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIdeaRequest {
  title: string;
  description: string;
  category: string;
}

// Vote types
export const VoteType = {
  Upvote: "Upvote",
  Downvote: "Downvote",
} as const;

export type VoteType = (typeof VoteType)[keyof typeof VoteType];

export interface Vote {
  id: string;
  ideaId: string;
  userId: string;
  voteType: VoteType;
  createdAt: Date;
}

export interface CreateVoteRequest {
  ideaId: string;
  voteType: VoteType;
}

// Comment types
export interface Comment {
  id: string;
  ideaId: string;
  authorId: string;
  author: User;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentRequest {
  ideaId: string;
  content: string;
}

// Chat types
export interface ChatMessage {
  id: string;
  userId: string;
  user: User;
  content: string;
  createdAt: Date;
  room: string;
}

export interface SendMessageRequest {
  content: string;
  room: string;
}

// Notification types
export const NotificationType = {
  IdeaVoted: "IdeaVoted",
  IdeaCommented: "IdeaCommented",
  IdeaUpdated: "IdeaUpdated",
  ChatMessage: "ChatMessage",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Filter types
export interface IdeaFilters {
  status?: IdeaStatus;
  category?: string;
  sortBy?: "newest" | "trending" | "topRated";
  search?: string;
  page?: number;
  pageSize?: number;
}
