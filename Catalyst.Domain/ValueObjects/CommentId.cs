namespace Catalyst.Domain.ValueObjects;

/// <summary>
/// Strongly-typed identifier for Comment entities.
/// Prevents mixing CommentId with UserId or other ID types.
/// </summary>
public record CommentId
{
    public string Value { get; init; }

    private CommentId(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("CommentId cannot be empty", nameof(value));
        Value = value;
    }

    /// <summary>
    /// Creates a new CommentId from a string value.
    /// </summary>
    public static CommentId Create(string value) => new(value);

    public override string ToString() => Value;
}
