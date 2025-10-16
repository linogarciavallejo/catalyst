namespace Catalyst.Domain.ValueObjects;

/// <summary>
/// Strongly-typed Idea Title value object.
/// Ensures titles are non-empty and within reasonable length (1-200 chars).
/// </summary>
public record IdeaTitle
{
    public const int MinLength = 1;
    public const int MaxLength = 200;

    public string Value { get; init; }

    private IdeaTitle(string value)
    {
        Value = value;
    }

    /// <summary>
    /// Creates a new IdeaTitle with validation.
    /// </summary>
    public static IdeaTitle Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Title cannot be empty", nameof(value));

        var trimmed = value.Trim();

        if (trimmed.Length < MinLength)
            throw new ArgumentException($"Title must be at least {MinLength} character", nameof(value));

        if (trimmed.Length > MaxLength)
            throw new ArgumentException($"Title cannot exceed {MaxLength} characters", nameof(value));

        return new IdeaTitle(trimmed);
    }

    public override string ToString() => Value;
}
