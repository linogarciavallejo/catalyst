using System.Text.RegularExpressions;

namespace Catalyst.Domain.ValueObjects;

/// <summary>
/// Strongly-typed Email value object with format validation.
/// Ensures only valid emails can be created and stored.
/// </summary>
public record Email
{
    public string Value { get; init; }

    private Email(string value)
    {
        Value = value;
    }

    /// <summary>
    /// Creates a new Email with validation.
    /// Returns the Email if valid, throws if invalid.
    /// </summary>
    public static Email Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Email cannot be empty", nameof(value));

        var trimmed = value.Trim();

        if (trimmed.Length > 254)
            throw new ArgumentException("Email cannot exceed 254 characters", nameof(value));

        // RFC 5322 simplified email validation
        var emailPattern = @"^[^\s@]+@[^\s@]+\.[^\s@]+$";
        if (!Regex.IsMatch(trimmed, emailPattern))
            throw new ArgumentException("Email format is invalid", nameof(value));

        return new Email(trimmed.ToLower());
    }

    public override string ToString() => Value;
}
