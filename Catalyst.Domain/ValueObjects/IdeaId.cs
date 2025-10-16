namespace Catalyst.Domain.ValueObjects;

/// <summary>
/// Strongly-typed identifier for Idea entities.
/// Prevents mixing IdeaId with UserId or other ID types.
/// </summary>
public record IdeaId
{
    public string Value { get; init; }

    private IdeaId(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("IdeaId cannot be empty", nameof(value));
        Value = value;
    }

    /// <summary>
    /// Creates a new IdeaId from a string value.
    /// </summary>
    public static IdeaId Create(string value) => new(value);

    public override string ToString() => Value;
}
