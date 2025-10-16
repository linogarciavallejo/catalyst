# Value Objects Quick Reference

## What Was Implemented

### 9 Value Objects Created

1. **UserId** - Strongly-typed user identifier
2. **IdeaId** - Strongly-typed idea identifier  
3. **CommentId** - Strongly-typed comment identifier
4. **Email** - Email with RFC format validation
5. **EipPoints** - Non-negative integer with arithmetic
6. **IdeaTitle** - 1-200 character string
7. **IdeaDescription** - 1-5000 character string
8. **Category** - Fixed set (Technology, Process, Innovation, Efficiency, Culture)
9. **Tags** - 1-10 deduplicated strings, max 50 chars each

---

## Key Changes by File

### Domain Entities (5 files updated)

**Idea.cs**
- `string Id` → `IdeaId Id`
- `string Title` → `IdeaTitle Title`
- `string Description` → `IdeaDescription Description`
- `string Category` → `Category Category`
- `List<string> Tags` → `Tags Tags`
- `string CreatedBy` → `UserId CreatedBy`
- `List<string> Followers` → `List<UserId> Followers`
- `string ChampionId` → `UserId ChampionId`

**User.cs**
- `string Id` → `UserId Id`
- `string Email` → `Email Email`
- `int EipPoints` → `EipPoints EipPoints`

**Vote.cs**
- `string IdeaId` → `IdeaId IdeaId`
- `string UserId` → `UserId UserId`

**Comment.cs**
- `string Id` → `CommentId Id`
- `string IdeaId` → `IdeaId IdeaId`
- `string UserId` → `UserId UserId`
- `string ParentCommentId` → `CommentId ParentCommentId`

**Notification.cs**
- `string UserId` → `UserId UserId`
- `string RelatedIdeaId` → `IdeaId RelatedIdeaId`

### Repositories (5 files updated)

All repositories updated to use `.Create()` when comparing:
```csharp
// Before
public async Task<Vote> GetUserVoteOnIdeaAsync(string userId, string ideaId)
{
    return await _collection
        .Find(v => v.UserId == userId && v.IdeaId == ideaId)
        .FirstOrDefaultAsync();
}

// After
public async Task<Vote> GetUserVoteOnIdeaAsync(string userId, string ideaId)
{
    var usrId = UserId.Create(userId);
    var idId = IdeaId.Create(ideaId);
    return await _collection
        .Find(v => v.UserId == usrId && v.IdeaId == idId)
        .FirstOrDefaultAsync();
}
```

### Services (4 files updated)

- **IdeaService.cs** - Use `.Value` when passing IDs to other services
- **VotingService.cs** - Create value objects when building entities
- **GamificationService.cs** - Use `.Value` and `.Add()`/`.Subtract()` for EipPoints
- **NotificationService.cs** - Use value object null checks

### MongoDB Serializers (9 new files)

**Location:** `Catalyst.Infrastructure/MongoDB/Serializers/`

- UserIdSerializer.cs
- IdeaIdSerializer.cs
- CommentIdSerializer.cs
- EmailSerializer.cs
- EipPointsSerializer.cs
- IdeaTitleSerializer.cs
- IdeaDescriptionSerializer.cs
- CategorySerializer.cs
- TagsSerializer.cs

**Registered in:** `MongoDbContext.cs` static constructor via `BsonSerializerRegistration.RegisterValueObjectSerializers()`

---

## Validation Rules by Value Object

### UserId, IdeaId, CommentId
- ✓ Non-empty string
- ✓ Stores as string in MongoDB

### Email
- ✓ Non-empty
- ✓ Max 254 characters
- ✓ Format: `{text}@{text}.{text}`
- ✓ Normalized to lowercase

### EipPoints
- ✓ >= 0 (non-negative)
- ✓ Arithmetic: `.Add(n)`, `.Subtract(n)`
- ✓ Never returns negative

### IdeaTitle
- ✓ Non-empty after trim
- ✓ 1-200 characters
- ✓ Trimmed on creation

### IdeaDescription
- ✓ Non-empty after trim
- ✓ 1-5000 characters
- ✓ Trimmed on creation

### Category
- ✓ Case-insensitive matching
- ✓ Allowed: Technology, Process, Innovation, Efficiency, Culture
- ✓ Throws on unknown value

### Tags
- ✓ Min 1, Max 10 tags
- ✓ Each tag: 1-50 characters
- ✓ Auto-deduplicated
- ✓ Normalized to lowercase
- ✓ Empty strings removed

---

## Usage Examples

### Creating Entities

```csharp
// Create Idea with validation
var idea = new Idea
{
    Id = IdeaId.Create(ObjectId.GenerateNewId().ToString()),
    Title = IdeaTitle.Create("My Idea"),
    Description = IdeaDescription.Create("Description..."),
    Category = Category.Create("technology"),
    Tags = Tags.Create(new[] { "csharp", "dotnet" }),
    CreatedBy = UserId.Create(currentUserId),
};

// Create User with validation
var user = new User
{
    Id = UserId.Create(ObjectId.GenerateNewId().ToString()),
    Email = Email.Create("user@example.com"),
    EipPoints = EipPoints.Create(0),
};
```

### Repository Queries

```csharp
// Type-safe queries
var idea = await ideaRepository.GetByIdAsync(ideaId);  // Pass string, Create inside
var byCreator = await ideaRepository.GetByCreatorAsync(userId);
var byCategory = await ideaRepository.GetByCategoryAsync("innovation");

// Vote validation
var existingVote = await voteRepository.GetUserVoteOnIdeaAsync(userId, ideaId);
```

### Points Operations

```csharp
// Award points
var newPoints = user.EipPoints.Add(50);  // Returns new EipPoints
user.EipPoints = newPoints;

// Deduct points (safe minimum)
var reduced = user.EipPoints.Subtract(100);  // Never goes negative
user.EipPoints = reduced;
```

---

## MongoDB Document Example

**Before:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "  My Idea  ",
  "description": "",
  "category": "tech",
  "tags": ["c#", "", "c#", "spam"],
  "createdBy": "some-random-id",
  "followers": ["user1", "user1", "idea1"]
}
```

**After (with validation):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "My Idea",
  "description": "Valid description...",
  "category": "Technology",
  "tags": ["c#", "spam"],
  "createdBy": "507f191a9a9c09e2d4000001",
  "followers": ["507f191a9a9c09e2d4000002", "507f191a9a9c09e2d4000003"]
}
```

---

## Error Examples

### Type Mismatch (Caught by Compiler)
```csharp
// These now fail at compile time ✓

// Mixing IDs
var idea = new Idea { Id = userId };  // ❌ Type mismatch

// Invalid assignment
idea.CreatedBy = ideaId;  // ❌ Type mismatch

// Collection type mismatch
idea.Followers.Add(ideaId);  // ❌ Can't add IdeaId to List<UserId>
```

### Validation Errors (Caught at Runtime)
```csharp
// These throw ArgumentException ✓

IdeaTitle.Create("");  // ❌ "Title cannot be empty"
IdeaTitle.Create(new string('x', 201));  // ❌ "Title cannot exceed 200 characters"

Email.Create("not-an-email");  // ❌ "Email format is invalid"

EipPoints.Create(-50);  // ❌ "EIP Points cannot be negative"

Category.Create("random");  // ❌ "Unknown category: random"

Tags.Create(new[] { "", "", "" });  // ❌ "At least 1 tag is required"
```

---

## Build Status

**Infrastructure Layer:** ✅ Complete (repositories, services, serializers)
**Domain Layer:** ✅ Complete (entities, value objects)  
**WebApi Layer:** 🟡 Needs `.Value` conversions in endpoints/DTOs

**Remaining work:** Update 5 endpoint files to use `.Value` when extracting strings from value objects for DTOs.

---

## Next Steps

1. **Fix Endpoints** - Add `.Value` conversions in DTO mapping (20 endpoint-related errors)
2. **Test Build** - Run `dotnet build` to verify all changes
3. **Phase 3** - Proceed to Authentication & Unit Tests with robust domain foundation

---

## Files Changed Summary

| Category | Count | Files |
|---|---|---|
| Value Objects Created | 9 | Catalyst.Domain/ValueObjects/*.cs |
| Domain Entities Updated | 5 | Catalyst.Domain/Entities/*.cs |
| Repositories Updated | 5 | Catalyst.Infrastructure/Repositories/*.cs |
| Services Updated | 4 | Catalyst.Infrastructure/Services/*.cs |
| Serializers Created | 9 | Catalyst.Infrastructure/MongoDB/Serializers/*.cs |
| **Total Changes** | **32** | Core infrastructure complete |

