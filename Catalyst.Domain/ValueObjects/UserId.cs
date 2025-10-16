namespace Catalyst.Domain.ValueObjects;

/// <summary>
/// Strongly-typed identifier for User entities.
/// Prevents mixing UserId with IdeaId or other ID types.
/// </summary>
public record UserId
{
    public string Value { get; init; }

    private UserId(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("UserId cannot be empty", nameof(value));
        Value = value;
    }

    /// <summary>
    /// Creates a new UserId from a string value.
    /// </summary>
    public static UserId Create(string value) => new(value);

    public override string ToString() => Value;
}
