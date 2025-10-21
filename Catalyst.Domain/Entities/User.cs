using System;
using Catalyst.Domain.Enums;
using Catalyst.Domain.ValueObjects;

namespace Catalyst.Domain.Entities;

public class User
{
    public UserId Id { get; set; }

    public Email Email { get; set; }

    public string Name { get; set; }

    public string PasswordHash { get; set; }

    public string DisplayName { get; set; }

    public UserRole Role { get; set; }

    public EipPoints EipPoints { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string? ProfilePicture { get; set; }

    public User()
    {
        // Parameterless constructor required for serialization and materialization
    }

    private User(
        Email email,
        string name,
        string passwordHash,
        string displayName,
        UserRole role,
        EipPoints eipPoints,
        DateTime createdAt,
        DateTime updatedAt,
        string profilePicture)
    {
        Email = email;
        Name = name;
        PasswordHash = passwordHash;
        DisplayName = displayName;
        Role = role;
        EipPoints = eipPoints;
        CreatedAt = createdAt;
        UpdatedAt = updatedAt;
        ProfilePicture = profilePicture;
    }

    public static User Create(
        Email email,
        string name,
        string passwordHash,
        string displayName,
        UserRole role,
        string? profilePicture = null)
    {
        var now = DateTime.UtcNow;
        return new User(
            email,
            name,
            passwordHash,
            displayName,
            role,
            EipPoints.Create(0),
            now,
            now,
            profilePicture);
    }

    public static User Rehydrate(
        UserId id,
        Email email,
        string name,
        string passwordHash,
        string displayName,
        UserRole role,
        EipPoints eipPoints,
        DateTime createdAt,
        DateTime updatedAt,
        string profilePicture)
    {
        var user = new User(
            email,
            name,
            passwordHash,
            displayName,
            role,
            eipPoints,
            createdAt,
            updatedAt,
            profilePicture)
        {
            Id = id
        };

        return user;
    }

    public void AssignId(UserId id)
    {
        Id = id;
    }
}
