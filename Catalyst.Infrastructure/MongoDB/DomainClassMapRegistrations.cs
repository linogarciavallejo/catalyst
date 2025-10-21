using Catalyst.Domain.Entities;
using MongoDB.Bson.Serialization;

namespace Catalyst.Infrastructure.MongoDB;

internal static class DomainClassMapRegistrations
{
    private static bool _registered;

    internal static void Register()
    {
        if (_registered)
        {
            return;
        }

        RegisterAttachment();
        RegisterIdea();
        RegisterUser();
        RegisterComment();
        RegisterNotification();
        RegisterVote();

        _registered = true;
    }

    private static void RegisterIdea()
    {
        if (BsonClassMap.IsClassMapRegistered(typeof(Idea)))
        {
            return;
        }

        BsonClassMap.RegisterClassMap<Idea>(cm =>
        {
            cm.AutoMap();
            cm.SetIgnoreExtraElements(true);
            cm.MapIdProperty(i => i.Id).SetElementName("_id");
            cm.MapMember(i => i.Title).SetElementName("title");
            cm.MapMember(i => i.Description).SetElementName("description");
            cm.MapMember(i => i.Category).SetElementName("category");
            cm.MapMember(i => i.Tags).SetElementName("tags");
            cm.MapMember(i => i.CreatedBy).SetElementName("createdBy");
            cm.MapMember(i => i.CreatedByName).SetElementName("createdByName");
            cm.MapMember(i => i.CreatedAt).SetElementName("createdAt");
            cm.MapMember(i => i.UpdatedAt).SetElementName("updatedAt");
            cm.MapMember(i => i.Status).SetElementName("status");
            cm.MapMember(i => i.Upvotes).SetElementName("upvotes");
            cm.MapMember(i => i.Downvotes).SetElementName("downvotes");
            cm.MapMember(i => i.CommentCount).SetElementName("commentCount");
            cm.MapMember(i => i.Followers).SetElementName("followers");
            cm.MapMember(i => i.Attachments).SetElementName("attachments");
            cm.MapMember(i => i.ChampionId).SetElementName("championId").SetIgnoreIfNull(true);
        });
    }

    private static void RegisterAttachment()
    {
        if (BsonClassMap.IsClassMapRegistered(typeof(Attachment)))
        {
            return;
        }

        BsonClassMap.RegisterClassMap<Attachment>(cm =>
        {
            cm.AutoMap();
            cm.SetIgnoreExtraElements(true);
            cm.MapMember(a => a.FileName).SetElementName("fileName");
            cm.MapMember(a => a.FileUrl).SetElementName("fileUrl");
            cm.MapMember(a => a.FileSize).SetElementName("fileSize");
            cm.MapMember(a => a.UploadedAt).SetElementName("uploadedAt");
        });
    }

    private static void RegisterUser()
    {
        if (BsonClassMap.IsClassMapRegistered(typeof(User)))
        {
            return;
        }

        BsonClassMap.RegisterClassMap<User>(cm =>
        {
            cm.AutoMap();
            cm.SetIgnoreExtraElements(true);
            cm.MapIdProperty(u => u.Id).SetElementName("_id");
            cm.MapMember(u => u.Email).SetElementName("email");
            cm.MapMember(u => u.Name).SetElementName("name");
            cm.MapMember(u => u.PasswordHash).SetElementName("passwordHash");
            cm.MapMember(u => u.DisplayName).SetElementName("displayName");
            cm.MapMember(u => u.Role).SetElementName("role");
            cm.MapMember(u => u.EipPoints).SetElementName("eipPoints");
            cm.MapMember(u => u.CreatedAt).SetElementName("createdAt");
            cm.MapMember(u => u.UpdatedAt).SetElementName("updatedAt");
            cm.MapMember(u => u.ProfilePicture).SetElementName("profilePicture").SetIgnoreIfNull(true);
        });
    }

    private static void RegisterComment()
    {
        if (BsonClassMap.IsClassMapRegistered(typeof(Comment)))
        {
            return;
        }

        BsonClassMap.RegisterClassMap<Comment>(cm =>
        {
            cm.AutoMap();
            cm.SetIgnoreExtraElements(true);
            cm.MapIdProperty(c => c.Id).SetElementName("_id");
            cm.MapMember(c => c.IdeaId).SetElementName("ideaId");
            cm.MapMember(c => c.UserId).SetElementName("userId");
            cm.MapMember(c => c.UserName).SetElementName("userName");
            cm.MapMember(c => c.Content).SetElementName("content");
            cm.MapMember(c => c.CreatedAt).SetElementName("createdAt");
            cm.MapMember(c => c.UpdatedAt).SetElementName("updatedAt");
            cm.MapMember(c => c.ParentCommentId).SetElementName("parentCommentId").SetIgnoreIfNull(true);
        });
    }

    private static void RegisterNotification()
    {
        if (BsonClassMap.IsClassMapRegistered(typeof(Notification)))
        {
            return;
        }

        BsonClassMap.RegisterClassMap<Notification>(cm =>
        {
            cm.AutoMap();
            cm.SetIgnoreExtraElements(true);
            cm.MapIdProperty(n => n.Id).SetElementName("_id");
            cm.MapMember(n => n.UserId).SetElementName("userId");
            cm.MapMember(n => n.Type).SetElementName("type");
            cm.MapMember(n => n.Title).SetElementName("title");
            cm.MapMember(n => n.Message).SetElementName("message");
            cm.MapMember(n => n.RelatedIdeaId).SetElementName("relatedIdeaId").SetIgnoreIfNull(true);
            cm.MapMember(n => n.IsRead).SetElementName("isRead");
            cm.MapMember(n => n.CreatedAt).SetElementName("createdAt");
        });
    }

    private static void RegisterVote()
    {
        if (BsonClassMap.IsClassMapRegistered(typeof(Vote)))
        {
            return;
        }

        BsonClassMap.RegisterClassMap<Vote>(cm =>
        {
            cm.AutoMap();
            cm.SetIgnoreExtraElements(true);
            cm.MapIdProperty(v => v.Id).SetElementName("_id");
            cm.MapMember(v => v.IdeaId).SetElementName("ideaId");
            cm.MapMember(v => v.UserId).SetElementName("userId");
            cm.MapMember(v => v.VoteType).SetElementName("voteType");
            cm.MapMember(v => v.CreatedAt).SetElementName("createdAt");
        });
    }
}
