/**
 * Services Index
 * Central export point for all API and real-time services
 */

export * from './api';
export { default as IdeasService } from './ideasService';
export { default as VotesService } from './votesService';
export { default as AuthService } from './authService';
export { default as ChatService } from './chatService';
export { default as NotificationsService } from './notificationsService';

// Re-export types
export type { ApiError } from './api';
export type { Vote } from './votesService';
export type { LoginRequest, RegisterRequest, AuthResponse } from './authService';
export type { Notification, NotificationEventCallback } from './notificationsService';
export type { ChatEventCallback } from './chatService';
