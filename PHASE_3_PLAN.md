# Phase 3: Authentication, Real-time, & Tests

**Current State:** Value Objects implementation complete ✅ - 0 build errors  
**Foundation:** Strongly-typed domain entities with validation  
**Build Status:** Ready for Phase 3 features

---

## Phase 3 Objectives

### 1. Authentication (Microsoft + JWT) 🔐
**Goal:** Secure endpoints with Microsoft authentication and JWT tokens

**Tasks:**
- [ ] 1.1 - Install NuGet packages
  - `Microsoft.Identity.Web`
  - `Microsoft.Identity.Web.MicrosoftGraph`
  - `System.IdentityModel.Tokens.Jwt`
  
- [ ] 1.2 - Configure Azure AD / Microsoft Identity
  - Update appsettings.json with Azure AD config
  - Register authentication scheme (Microsoft)
  - Setup JWT token validation
  
- [ ] 1.3 - Add Authentication Middleware
  - Add authentication to CompositionRoot
  - Add authorization policies
  - Configure token claims handling
  
- [ ] 1.4 - Protect Endpoints
  - Add `[Authorize]` attributes to endpoints
  - Extract UserId from token claims
  - Setup role-based authorization (if needed)
  
- [ ] 1.5 - Add Auth Services
  - Create `IAuthenticationService` interface
  - Implement token generation/validation
  - Handle Microsoft Graph integration (user profile sync)

**Estimated Effort:** 6-8 hours
**Dependencies:** None (can start immediately)

---

### 2. Real-time Features (WebSocket/SignalR) 🔄
**Goal:** Enable live updates for votes, comments, and notifications

**Tasks:**
- [ ] 2.1 - Setup SignalR Hub
  - Create `IdeaHub.cs` for idea-related updates
  - Create `NotificationHub.cs` for user notifications
  - Configure hub routing
  
- [ ] 2.2 - Add SignalR to Infrastructure
  - Create hub event publishers
  - Implement `IRealtimeService` interface
  - Register hubs in CompositionRoot
  
- [ ] 2.3 - Integrate with Existing Services
  - Call hub methods from IdeaService on upvote/downvote
  - Call hub methods from CommentService on new comment
  - Call hub methods from NotificationService on notification
  
- [ ] 2.4 - Add Client-side Hooks
  - Add SignalR connection setup
  - Add event listeners in frontend
  - Handle reconnection logic
  
- [ ] 2.5 - Test Real-time Features
  - Multiple client simulation
  - Connection resilience
  - Message delivery guarantee

**Estimated Effort:** 4-6 hours
**Dependencies:** Authentication (need UserId for hub groups)

---

### 3. Unit Tests 🧪
**Goal:** Comprehensive test coverage for repositories, services, and endpoints

**Tasks:**
- [ ] 3.1 - Test Infrastructure Setup
  - Create in-memory MongoDB mock (MongoDbMockContext)
  - Create test data builders/fixtures
  - Add xUnit + Moq configuration
  
- [ ] 3.2 - Repository Tests (Infrastructure.Tests)
  - Test: GetByIdAsync, GetAllAsync, CreateAsync, UpdateAsync, DeleteAsync
  - Test: GetByCategoryAsync, SearchAsync, GetTopAsync
  - Test: Null/invalid input handling
  - **Target:** 5 test files (IdeaRepository, UserRepository, VoteRepository, CommentRepository, NotificationRepository)
  
- [ ] 3.3 - Service Tests (Application.Tests)
  - Test: IdeaService (CRUD + business logic)
  - Test: VotingService (upvote/downvote logic, validation)
  - Test: GamificationService (points awarding, deduction)
  - Test: CommentService (threading, parent validation)
  - Test: NotificationService (creation, delivery)
  - **Target:** 5 test files, 50+ test cases
  
- [ ] 3.4 - Endpoint Integration Tests
  - Test: Happy path (valid inputs)
  - Test: Error handling (invalid inputs, not found, unauthorized)
  - Test: Authentication + authorization
  - **Target:** 3 test files (IdeaEndpoints, VoteEndpoints, NotificationEndpoints)
  
- [ ] 3.5 - Value Object Tests
  - Test: IdeaTitle validation (length, empty, trim)
  - Test: Email validation (format, normalization)
  - Test: Category validation (allowed values)
  - Test: Tags validation (dedup, min/max, length)
  - Test: EipPoints validation (non-negative, arithmetic)
  - **Target:** 9 test files (one per value object)

**Estimated Effort:** 10-12 hours
**Dependencies:** None (can run in parallel with Auth/Real-time)

---

## Implementation Order Recommendation

```
WEEK 1:
├─ Authentication (parallel with Tests)
│  ├─ Day 1-2: Setup Microsoft Identity + JWT
│  ├─ Day 2-3: Add auth middleware + attributes
│  └─ Day 3: Secure endpoints
│
├─ Unit Tests (parallel with Authentication)
│  ├─ Day 1: Test infrastructure setup
│  ├─ Day 2-3: Repository + Service tests
│  └─ Day 3: Endpoint integration tests
│
WEEK 2:
├─ Real-time (depends on Auth)
│  ├─ Day 1: SignalR hubs setup
│  ├─ Day 2: Integrate with services
│  └─ Day 3: Client-side + testing
│
└─ Polish & Bug Fixes
   ├─ Performance testing
   ├─ Edge case handling
   └─ Documentation updates
```

---

## Priority Recommendation

**High Priority (Start Now):**
1. **Authentication** - Blocks real-time features, needed for security
2. **Repository Tests** - Foundation for all other tests
3. **Service Tests** - Validates business logic

**Medium Priority (After Auth):**
4. **Real-time Integration** - Adds value but not critical for core functionality
5. **Endpoint Tests** - Validates API contract

**Nice to Have:**
6. **Performance Optimization** - Can be done iteratively
7. **Advanced Logging** - Can be added later

---

## Success Criteria

### Authentication ✅
- [ ] Microsoft login works in browser
- [ ] JWT tokens generated and validated
- [ ] Unauthorized requests return 401
- [ ] Expired tokens handled gracefully

### Real-time ✅
- [ ] Multiple clients receive vote updates instantly
- [ ] Comments visible to all viewers in real-time
- [ ] Notifications delivered to correct users
- [ ] Reconnection works without data loss

### Tests ✅
- [ ] 80%+ code coverage for critical paths
- [ ] All repository operations tested
- [ ] All business logic validated
- [ ] Endpoint error cases covered

---

## Questions Before We Start

1. **Authentication Backend:** Which is preferred?
   - ✅ Microsoft Entra ID (Azure AD)
   - [ ] Alternative (specify)?

2. **Real-time Technology:** Preference?
   - ✅ SignalR (.NET standard)
   - [ ] WebSocket (raw)
   - [ ] Other?

3. **Test Framework:** Already chosen?
   - ✅ xUnit + Moq (standard .NET)
   - [ ] NUnit
   - [ ] Other?

4. **Database Mocking:** Preferred approach?
   - [ ] In-memory MongoDB (testcontainers)
   - ✅ Mock IMongoCollection
   - [ ] Both?

5. **Start With:** Which feature first?
   - [ ] Authentication (highest priority)
   - [ ] Tests (broadest impact)
   - [ ] Both in parallel?

---

## Expected Deliverables

### By End of Phase 3

**Code:**
- ✅ Authentication fully integrated
- ✅ SignalR hubs operational
- ✅ 80%+ test coverage
- ✅ All endpoints secured

**Documentation:**
- ✅ Authentication setup guide
- ✅ Real-time integration guide
- ✅ Test writing guide
- ✅ API security documentation

**Build Status:**
- ✅ 0 compilation errors
- ✅ All tests passing
- ✅ Ready for production

---

## Estimated Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Value Objects | ✅ Complete | Done |
| **Authentication** | **2-3 days** | Ready to start |
| **Real-time** | **2 days** | Ready after Auth |
| **Unit Tests** | **3-4 days** | Can start now |
| **Polish & Deploy** | **1 day** | Final polish |
| **Total Phase 3** | **~8-10 days** | 2 weeks |

---

## Ready to Proceed?

Choose starting point:

### Option A: Start with Authentication 🔐
```
Benefits:
- Blocks all other features
- Critical for production
- Makes real-time easier

Next: I'll setup Microsoft Entra ID configuration
```

### Option B: Start with Unit Tests 🧪
```
Benefits:
- No external dependencies
- Validates existing code
- Faster to complete

Next: I'll create test infrastructure and repository tests
```

### Option C: Parallel (Both) 💪
```
Benefits:
- Maximum progress
- Less waiting
- Two-thread approach

Next: I'll start Auth while you review test strategy
```

---

**Which would you prefer? A, B, or C?**
