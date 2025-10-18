import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import IdeasBrowsingPage from '@/pages/IdeasBrowsingPage';
import IdeaDetailPage from '@/pages/IdeaDetailPage';
import CreateEditIdeaPage from '@/pages/CreateEditIdeaPage';
import ChatPage from '@/pages/ChatPage';
import UserProfilePage from '@/pages/UserProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import NotFoundPage from '@/pages/NotFoundPage';

/**
 * AppRouter Component
 * Defines all application routes and page structure.
 * Features:
 * - Public routes (accessible without authentication)
 * - Protected routes (requires authentication)
 * - Nested routes for organization
 * - 404 handling
 */
const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/ideas" element={<IdeasBrowsingPage />} />
        <Route path="/ideas/:ideaId" element={<IdeaDetailPage />} />

        {/* Protected Routes */}
        <Route
          path="/ideas/create"
          element={
            <ProtectedRoute>
              <CreateEditIdeaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ideas/:ideaId/edit"
          element={
            <ProtectedRoute>
              <CreateEditIdeaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Redirects */}
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />

        {/* 404 - Must be last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
