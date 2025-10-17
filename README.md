# Catalyst - Collaborative Innovation Platform

A full-stack application for collecting, managing, and discussing innovative ideas with real-time collaboration features.

---

## 📁 Project Structure

### Backend (C# / ASP.NET Core)
```
├── Catalyst.Application/          # Business logic & use cases
├── Catalyst.Application.Tests/     # Application layer tests (100+ tests)
├── Catalyst.CompositionRoot/       # Dependency injection configuration
├── Catalyst.Domain/                # Core domain entities & value objects
├── Catalyst.Infrastructure/        # Data access & external services
├── Catalyst.Infrastructure.Tests/  # Infrastructure tests (100+ tests)
├── Catalyst.WebApi/                # REST API & SignalR hubs
├── Catalyst.WebApi.Tests/          # API & hub tests (50+ tests)
└── Catalyst.sln                    # Visual Studio solution
```

### Frontend (React / TypeScript)
```
catalyst-frontend/
├── src/
│   ├── components/               # 13 reusable React components
│   │   ├── ui/                  # Base UI components (7)
│   │   ├── forms/               # Form components (3)
│   │   ├── Layout/              # Layout components (3)
│   │   └── features/            # Feature components (1)
│   ├── hooks/                   # 10 custom React hooks
│   ├── context/                 # 3 global context providers
│   ├── services/                # API & SignalR services
│   ├── utils/                   # 50+ utility functions
│   ├── types/                   # TypeScript interfaces
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Entry point
├── dist/                        # Production build
├── public/                      # Static assets
├── package.json                 # Dependencies
├── vite.config.ts               # Vite configuration
└── tsconfig.json                # TypeScript configuration
```

---

## 🚀 Quick Start

### Backend Setup
```bash
cd c:\Users\LinoG\source\repos\catalyst

# Restore dependencies
dotnet restore

# Build solution
dotnet build

# Run tests
dotnet test

# Start API server
cd Catalyst.WebApi
dotnet run
```

**API runs on**: `https://localhost:7241`

### Frontend Setup
```bash
cd catalyst-frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Run tests (when available)
npm run test
```

**Frontend runs on**: `http://localhost:5173`

---

## 📊 Project Metrics

### Backend
| Metric | Value |
|--------|-------|
| Total Tests | 285 |
| Pass Rate | 100% |
| Code Coverage | 88% |
| Test Files | 8 |
| Source Files | 64 |
| Total Lines | ~25,000 |

### Frontend
| Metric | Value |
|--------|-------|
| Components | 13 |
| Custom Hooks | 10 |
| Contexts | 3 |
| Utility Functions | 50+ |
| Build Time | ~1 second |
| Bundle Size | 195 kB (gzip: 61 kB) |
| Lines of Code | ~2,600 |

---

## 🏗️ Technology Stack

### Backend
- **Framework**: ASP.NET Core 8
- **Database**: MongoDB
- **Real-time**: SignalR
- **Testing**: xUnit, Moq
- **Architecture**: Clean Architecture, CQRS, DDD

### Frontend
- **Framework**: React 18
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **Real-time**: SignalR JavaScript client
- **Testing**: Jest, React Testing Library (Phase 7)

---

## 📚 Key Features

### Ideas Management
- ✅ Create, read, update, delete ideas
- ✅ Vote on ideas (upvote/downvote)
- ✅ Comment on ideas with nested replies
- ✅ Track idea status (submitted, under_review, approved, rejected)

### Real-time Collaboration
- ✅ Live notifications for activity
- ✅ Chat system for team discussions
- ✅ Instant updates via SignalR
- ✅ Connection state management

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, User, Guest)
- ✅ Secure token refresh
- ✅ Profile management

### User Experience
- ✅ Responsive design (TailwindCSS)
- ✅ Error handling & validation
- ✅ Loading states & spinners
- ✅ Toast notifications
- ✅ Form validation

---

## 🧪 Testing

### Backend Tests
```bash
# Run all tests
dotnet test

# Run specific test file
dotnet test --filter "Catalyst.Application.Tests"

# With coverage
dotnet test /p:CollectCoverageMetrics=true
```

**Current Status**: 285 tests, 100% pass rate, 88% coverage

### Frontend Tests
Coming in Phase 7 with Jest and React Testing Library

---

## 🚢 Deployment

### Development
```bash
# Backend
cd Catalyst.WebApi
dotnet run

# Frontend (in separate terminal)
cd catalyst-frontend
npm run dev
```

### Production
```bash
# Backend: Publish to Azure/Docker
dotnet publish -c Release

# Frontend: Build static assets
npm run build
# Output in: catalyst-frontend/dist/
```

---

## 🤝 Contributing

1. Create a feature branch
2. Implement changes following the Clean Architecture principles
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit pull request

---

## 📞 Support

For issues or questions:
1. Check the `Documentation/` directory for detailed guides
2. Review phase completion reports
3. Check test files for implementation examples

---

## 📝 License

[Add license information]

---

**Last Updated**: October 17, 2025
**Status**: Phase 6.3 Complete ✅ | All systems operational

For detailed documentation, see `Documentation/README.md`
