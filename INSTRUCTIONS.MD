# Instructions for Building an Idea Portal Using .NET 10, ReactJS, and MongoDB

## Overview

This document provides guidance for developing an **Idea Portal** (codename **Catalyst**) where employees can submit, vote, and manage innovative ideas. The tech stack includes:

* **Backend:** .NET 10 (ASP.NET Core Web API)
* **Frontend:** ReactJS with TypeScript
* **Database:** MongoDB
* **Architecture:** Clean Architecture principles

## Features Overview

1. **Idea Submission:** Title, Description (Markdown), Category, Attachments
2. **Search and Filter:** Full-text search on ideas, filter by category/status
3. **Voting and Comments:** Upvoting ideas, threaded comments
4. **Gamification:** EIP points, Leaderboard, Notifications
5. **User Roles:** Admin, Creator, Contributor, Champion, Visitor
6. **Idea Lifecycle:** Status updates from submission to implementation
7. **Notifications:** Bell icon updates for mentions, votes, and status changes
8. **Profile Dashboard:** Track submitted ideas, points, and activity

---

## 1. Project Structure (Clean Architecture)

```
src/
├── Application/          # Use Cases, Interfaces
├── Domain/               # Core entities and business rules
├── Infrastructure/       # MongoDB implementation, external APIs
├── WebApi/               # ASP.NET Core project
├── Frontend/             # ReactJS frontend
```

## 2. Backend Setup (.NET 10)

* Use ASP.NET Core Minimal APIs
* Implement dependency injection for all services
* Setup MongoDB collections with indexes for search and performance
* Use the official MongoDB .NET/C# Driver for application-level commands and queries

### Core Domains

```csharp
class Idea {
    string Id;
    string Title;
    string Description;
    string Category;
    List<string> Tags;
    string CreatedBy;
    DateTime CreatedAt;
    IdeaStatus Status;
    List<Comment> Comments;
    List<Vote> Votes;
    List<string> Followers;
}
```

### Sample Endpoint

```csharp
[HttpPost("/ideas")]
public async Task<IActionResult> CreateIdea([FromBody] CreateIdeaRequest request) {
    // Validation, mapping, save to DB
    return Ok();
}
```

## 3. MongoDB Schema

* Collections: `Ideas`, `Users`, `Votes`, `Notifications`
* Indexing: Full-text on `Title`, `Description`, compound index on `CreatedBy + CreatedAt`

## 4. Frontend (ReactJS)

* React Router for SPA navigation
* Redux or Zustand for state management
* Markdown Editor (e.g. `react-markdown` or `react-mde`)
* File uploader with preview and max size validation

### Page Components

* `/`: Home + Search + Leaderboard + Notifications
* `/idea/:id`: Idea detail + comments + vote + follow
* `/create`: New Idea form
* `/profile`: My Ideas + points

## 5. Gamification (EIP Points)

* Award 50 EIP points for every valid idea submission
* Deduct points if user deletes the idea
* Leaderboard (top ideas by votes, top users by points)
* Show rank badges and total points on user profile

## 6. User Roles

| Role        | Permissions                                                    |
| ----------- | -------------------------------------------------------------- |
| Admin       | Full CRUD access, manage categories & roles                    |
| Creator     | Submit/edit/delete own ideas, comment, follow                  |
| Contributor | Comment only                                                   |
| Champion    | Change idea status, edit championed idea, drive implementation |
| Visitor     | Browse and follow ideas only                                   |

## 7. Notifications

* Use a `Notifications` collection
* Display unread count in the bell icon
* Trigger events: new comment, vote, idea status change

## 8. Integration (DON'T IMPLEMENT YET)

* **Microsoft Teams**: Send webhook notifications when idea status changes
* **Workday**: Sync user roles and basic profile data

## 9. Security & Auth

* Use Microsoft authentication
* Authorization by role
* Rate limiting on submission APIs

## 10. Testing

* Use xUnit or NUnit for unit/integration tests
* Jest for frontend testing
* Mock MongoDB using in-memory alternatives

## 11. Deployment (DON'T WORRY ABOUT DEPLOYMENT, I'LL HANDLE ON MY OWN LATER)

* Use Docker for containerization
* Setup CI/CD pipelines with GitHub Actions or Azure DevOps
* Use Azure Cosmos DB (Mongo API) or MongoDB Atlas in production

---

## Getting Started

1. Scaffold .NET Web API project and apply Clean Architecture folder structure
2. Create core domain entities: `Idea`, `User`, `Vote`, `Comment`, etc.
3. Build MongoDB repositories and services
4. Setup ReactJS frontend with TypeScript, routing and components. Use the `react-bootstrap` components suite.
5. Integrate authentication, file upload, and notifications
6. Launch MVP internally and gather feedback

Let me know if you'd like this split into multiple implementation guides or code scaffolding.
