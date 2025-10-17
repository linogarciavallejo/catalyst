# Phase 6 - Frontend Development Implementation Plan

**Status**: 🚀 **IN PROGRESS**  
**Date Started**: October 17, 2025  
**Estimated Duration**: 4-6 hours  
**Complexity**: High  
**Scope**: 40+ React component files

---

## 1. Project Overview

### Objectives
- ✅ Build a modern React frontend for the Catalyst ideas platform
- ✅ Integrate with backend SignalR hubs for real-time functionality
- ✅ Implement ideas browsing, voting, commenting, and live chat
- ✅ Create responsive, maintainable component architecture
- ✅ Establish TypeScript typing for type safety
- ✅ Connect to ASP.NET Core backend APIs

### Technology Stack

**Frontend Framework**:
- React 18.x (hooks-based)
- TypeScript for type safety
- React Router v6 for routing
- TailwindCSS for styling

**State Management**:
- React Context + useReducer for global state
- Custom hooks for complex logic
- Local component state where appropriate

**Real-Time Communication**:
- @microsoft/signalr for SignalR client
- Custom hooks for hub connections
- Event-driven architecture

**API Communication**:
- Axios for HTTP requests
- Typed API layer
- Error handling and retry logic

**Development Tools**:
- Vite for fast builds
- ESLint for code quality
- Prettier for formatting

---

## 2. Directory Structure

```
catalyst-frontend/
├── src/
│   ├── components/              # React components (40+ files)
│   │   ├── Ideas/               # Ideas browsing and management
│   │   │   ├── IdeasList.tsx
│   │   │   ├── IdeaCard.tsx
│   │   │   ├── IdeaDetail.tsx
│   │   │   ├── CreateIdeaForm.tsx
│   │   │   ├── IdeaFilters.tsx
│   │   │   └── IdeaSearch.tsx
│   │   ├── Voting/              # Voting components
│   │   │   ├── VoteButton.tsx
│   │   │   ├── VoteCounter.tsx
│   │   │   └── VoteAnalytics.tsx
│   │   ├── Comments/            # Comment components
│   │   │   ├── CommentsList.tsx
│   │   │   ├── CommentCard.tsx
│   │   │   ├── AddCommentForm.tsx
│   │   │   └── CommentThread.tsx
│   │   ├── Chat/                # Real-time chat
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── ActiveUsers.tsx
│   │   ├── Auth/                # Authentication
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── Layout/              # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── Common/              # Reusable components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── Toast.tsx
│   │   └── Dashboard/           # Dashboard views
│   │       ├── Dashboard.tsx
│   │       ├── UserStats.tsx
│   │       └── IdeaMetrics.tsx
│   ├── services/                # API and SignalR services
│   │   ├── api/
│   │   │   ├── client.ts        # Axios configured instance
│   │   │   ├── ideas.ts         # Ideas API
│   │   │   ├── votes.ts         # Votes API
│   │   │   ├── comments.ts      # Comments API
│   │   │   ├── auth.ts          # Authentication API
│   │   │   └── users.ts         # Users API
│   │   ├── signalr/
│   │   │   ├── connectionManager.ts
│   │   │   ├── hubs/
│   │   │   │   ├── ideasHub.ts
│   │   │   │   ├── chatHub.ts
│   │   │   │   └── notificationsHub.ts
│   │   │   └── useSignalR.ts    # Hook for SignalR
│   │   └── storage.ts           # LocalStorage wrapper
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts           # Authentication hook
│   │   ├── useIdeas.ts          # Ideas management hook
│   │   ├── useVoting.ts         # Voting logic hook
│   │   ├── useComments.ts       # Comments management hook
│   │   ├── useChat.ts           # Chat management hook
│   │   ├── useNotifications.ts  # Notifications hook
│   │   └── useAsync.ts          # Async data fetching hook
│   ├── context/                 # React Context
│   │   ├── AuthContext.tsx
│   │   ├── AppContext.tsx
│   │   └── NotificationContext.tsx
│   ├── types/                   # TypeScript types
│   │   ├── index.ts
│   │   ├── ideas.ts
│   │   ├── votes.ts
│   │   ├── comments.ts
│   │   ├── users.ts
│   │   ├── chat.ts
│   │   └── api.ts
│   ├── utils/                   # Utility functions
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   └── dateUtils.ts
│   ├── styles/                  # Global styles
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── utilities.css
│   ├── pages/                   # Page components (routes)
│   │   ├── Home.tsx
│   │   ├── IdeasPage.tsx
│   │   ├── IdeaDetailPage.tsx
│   │   ├── ChatPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   └── ErrorPage.tsx
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Vite entry point
│   └── index.css                # Tailwind imports
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── .env.example
```

---

## 3. Component Architecture

### Component Hierarchy

```
App
├── Router
│   ├── MainLayout
│   │   ├── Header
│   │   ├── Sidebar
│   │   └── Outlet (Pages)
│   │       ├── Home
│   │       ├── IdeasPage
│   │       │   ├── IdeaFilters
│   │       │   ├── IdeaSearch
│   │       │   └── IdeasList
│   │       │       └── IdeaCard
│   │       │           ├── VoteButton
│   │       │           └── CommentPreview
│   │       ├── IdeaDetailPage
│   │       │   ├── IdeaDetail
│   │       │   ├── CommentsList
│   │       │   │   └── CommentCard
│   │       │   │       └── AddCommentForm
│   │       │   └── VoteAnalytics
│   │       ├── ChatPage
│   │       │   └── ChatWindow
│   │       │       ├── ActiveUsers
│   │       │       └── ChatMessage
│   │       └── DashboardPage
│   │           ├── UserStats
│   │           └── IdeaMetrics
│   └── Footer
├── AuthContext
│   ├── AppContext
│   └── NotificationContext
└── Toast/Notification Provider
```

---

## 4. Implementation Phases

### Phase 6.1: Project Setup & Foundation (30 min)
- [ ] Create React + TypeScript + Vite project
- [ ] Install dependencies (react-router, axios, @microsoft/signalr, tailwindcss)
- [ ] Configure TypeScript
- [ ] Set up project structure
- [ ] Create base types/interfaces

### Phase 6.2: Core Services & Hooks (1 hour)
- [ ] Create API client (Axios instance)
- [ ] Implement API service layer (ideas, votes, comments, auth, users)
- [ ] Create SignalR connection manager
- [ ] Implement SignalR hubs (IdeasHub, ChatHub, NotificationsHub)
- [ ] Create custom hooks (useAuth, useIdeas, useVoting, useComments, useChat)

### Phase 6.3: Context & State Management (30 min)
- [ ] Create AuthContext
- [ ] Create AppContext (global state)
- [ ] Create NotificationContext
- [ ] Implement context providers

### Phase 6.4: Reusable Components (1.5 hours)
- [ ] Build common components (Button, Input, Card, Modal, etc.)
- [ ] Create layout components (Header, Sidebar, Footer)
- [ ] Implement LoadingSpinner and ErrorBoundary
- [ ] Create Toast/Notification system

### Phase 6.5: Feature Components (2 hours)
- [ ] **Ideas Module** (IdeasList, IdeaCard, IdeaDetail, Filters, Search)
- [ ] **Voting Module** (VoteButton, VoteCounter, VoteAnalytics)
- [ ] **Comments Module** (CommentsList, CommentCard, AddCommentForm)
- [ ] **Chat Module** (ChatWindow, ChatMessage, ChatInput, ActiveUsers)
- [ ] **Auth Module** (Login, Register, ProtectedRoute)
- [ ] **Dashboard** (Dashboard, UserStats, IdeaMetrics)

### Phase 6.6: Pages & Routing (1 hour)
- [ ] Create page components
- [ ] Configure React Router
- [ ] Implement route protection
- [ ] Add 404 and error pages

### Phase 6.7: Real-Time Integration (1.5 hours)
- [ ] Connect SignalR hubs
- [ ] Implement real-time idea updates
- [ ] Implement live chat messaging
- [ ] Implement real-time vote updates
- [ ] Implement notifications

### Phase 6.8: Styling & Polish (1 hour)
- [ ] Apply TailwindCSS styling
- [ ] Implement responsive design
- [ ] Add animations and transitions
- [ ] Dark mode support (optional)

---

## 5. Key Integration Points

### Backend API Endpoints to Use

**Ideas**:
- `GET /api/ideas` - List ideas
- `GET /api/ideas/{id}` - Get idea details
- `POST /api/ideas` - Create idea
- `PUT /api/ideas/{id}` - Update idea
- `DELETE /api/ideas/{id}` - Delete idea

**Votes**:
- `GET /api/votes?ideaId={id}` - Get vote counts
- `POST /api/votes` - Submit vote
- `DELETE /api/votes/{id}` - Remove vote

**Comments**:
- `GET /api/ideas/{ideaId}/comments` - List comments
- `POST /api/ideas/{ideaId}/comments` - Add comment
- `DELETE /api/comments/{id}` - Delete comment

**Users**:
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/profile` - Get profile
- `POST /api/auth/logout` - Logout

### SignalR Hub Events

**IdeasHub**:
- `OnIdeaCreated` - Broadcast new idea
- `OnIdeaUpdated` - Broadcast idea update
- `OnIdeaDeleted` - Broadcast idea deletion
- `OnVoteUpdated` - Broadcast vote changes

**ChatHub**:
- `ReceiveMessage` - Receive chat message
- `UserJoined` - User joined chat
- `UserLeft` - User left chat
- `UserTyping` - User is typing indicator

**NotificationsHub**:
- `ReceiveNotification` - Receive notification
- `NotificationRead` - Mark notification read

---

## 6. TypeScript Interfaces

### Core Types

```typescript
// User
interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  eipPoints: number;
  createdAt: Date;
}

enum UserRole {
  Admin = "Admin",
  Creator = "Creator",
  Contributor = "Contributor",
  Champion = "Champion",
  Visitor = "Visitor"
}

// Idea
interface Idea {
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

enum IdeaStatus {
  Submitted = "Submitted",
  UnderReview = "UnderReview",
  Approved = "Approved",
  InProgress = "InProgress",
  Completed = "Completed",
  Rejected = "Rejected",
  OnHold = "OnHold"
}

// Vote
interface Vote {
  id: string;
  ideaId: string;
  userId: string;
  voteType: VoteType;
  createdAt: Date;
}

enum VoteType {
  Upvote = "Upvote",
  Downvote = "Downvote"
}

// Comment
interface Comment {
  id: string;
  ideaId: string;
  authorId: string;
  author: User;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Chat Message
interface ChatMessage {
  id: string;
  userId: string;
  user: User;
  content: string;
  createdAt: Date;
  room: string;
}

// Notification
interface Notification {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}

enum NotificationType {
  IdeaVoted = "IdeaVoted",
  IdeaCommented = "IdeaCommented",
  IdeaUpdated = "IdeaUpdated",
  ChatMessage = "ChatMessage"
}
```

---

## 7. Environment Configuration

### .env.example
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SIGNALR_HUB_URL=http://localhost:5000/signalr
VITE_APP_NAME=Catalyst Ideas Platform
VITE_APP_VERSION=1.0.0
```

---

## 8. Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start Vite dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Run tests (when ready)
npm run test

# Lint code
npm run lint
```

### Backend Connection
- Ensure backend is running on `http://localhost:5000`
- SignalR hubs available at `http://localhost:5000/signalr`
- CORS configured on backend

---

## 9. Success Criteria

- ✅ React project created with TypeScript and Vite
- ✅ All 40+ components implemented
- ✅ API service layer working
- ✅ SignalR connections established
- ✅ Real-time updates working (votes, comments, chat)
- ✅ Routing configured
- ✅ Styling complete with TailwindCSS
- ✅ Responsive on mobile, tablet, desktop
- ✅ No console errors
- ✅ Smooth user experience

---

## 10. Estimated Timeline

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| 6.1 | Project Setup | 30 min | ⏳ Ready |
| 6.2 | Services & Hooks | 1 hour | ⏳ Ready |
| 6.3 | Context & State | 30 min | ⏳ Ready |
| 6.4 | Reusable Components | 1.5 hours | ⏳ Ready |
| 6.5 | Feature Components | 2 hours | ⏳ Ready |
| 6.6 | Pages & Routing | 1 hour | ⏳ Ready |
| 6.7 | Real-Time Integration | 1.5 hours | ⏳ Ready |
| 6.8 | Styling & Polish | 1 hour | ⏳ Ready |
| **TOTAL** | | **9 hours** | |

---

## 11. Next Action

Ready to begin Phase 6.1: Project Setup & Foundation

Confirm to proceed with React project creation.
