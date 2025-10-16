namespace Catalyst.Domain.ValueObjects;

/// <summary>
/// Strongly-typed Idea Description value object.
/// Ensures descriptions are non-empty and within reasonable length (1-5000 chars).
/// </summary>
public record IdeaDescription
{
    public const int MinLength = 1;
    public const int MaxLength = 5000;

    public string Value { get; init; }

    private IdeaDescription(string value)
    {
        Value = value;
    }

    /// <summary>
    /// Creates a new IdeaDescription with validation.
    /// </summary>
    public static IdeaDescription Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Description cannot be empty", nameof(value));

        var trimmed = value.Trim();

        if (trimmed.Length < MinLength)
            throw new ArgumentException($"Description must be at least {MinLength} character", nameof(value));

        if (trimmed.Length > MaxLength)
            throw new ArgumentException($"Description cannot exceed {MaxLength} characters", nameof(value));

        return new IdeaDescription(trimmed);
    }

    public override string ToString() => Value;
}
