import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import HomePage from './pages/HomePage';
import IdeasBrowsingPage from './pages/IdeasBrowsingPage';
import IdeaDetailPage from './pages/IdeaDetailPage';
import CreateEditIdeaPage from './pages/CreateEditIdeaPage';
import ChatPage from './pages/ChatPage';
import UserProfilePage from './pages/UserProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

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
        <Route path="/ideas" element={<IdeasBrowsingPage />} />
        <Route path="/ideas/:ideaId" element={<IdeaDetailPage />} />

        {/* Protected Routes (will add guards later) */}
        <Route path="/ideas/create" element={<CreateEditIdeaPage />} />
        <Route path="/ideas/:ideaId/edit" element={<CreateEditIdeaPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile/:userId" element={<UserProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />

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
