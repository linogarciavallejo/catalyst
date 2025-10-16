namespace Catalyst.Domain.ValueObjects;

/// <summary>
/// Strongly-typed Tags collection value object.
/// Ensures tags are deduplicated, non-empty, and within reasonable limits (1-10 tags, max 50 chars each).
/// </summary>
public record Tags
{
    public const int MinTags = 1;
    public const int MaxTags = 10;
    public const int MaxTagLength = 50;

    public IReadOnlyList<string> Value { get; init; }

    private Tags(IReadOnlyList<string> value)
    {
        Value = value;
    }

    /// <summary>
    /// Creates a new Tags collection with validation.
    /// Automatically deduplicates and normalizes tags.
    /// </summary>
    public static Tags Create(IEnumerable<string> tags)
    {
        if (tags == null)
            throw new ArgumentNullException(nameof(tags));

        var cleanedTags = tags
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Select(t => t.Trim().ToLower())
            .Distinct()
            .ToList();

        if (cleanedTags.Count < MinTags)
            throw new ArgumentException($"At least {MinTags} tag is required", nameof(tags));

        if (cleanedTags.Count > MaxTags)
            throw new ArgumentException($"Maximum {MaxTags} tags allowed", nameof(tags));

        var invalidTag = cleanedTags.FirstOrDefault(t => t.Length > MaxTagLength);
        if (invalidTag != null)
            throw new ArgumentException($"Tag '{invalidTag}' exceeds {MaxTagLength} character limit", nameof(tags));

        return new Tags(cleanedTags.AsReadOnly());
    }

    public override string ToString() => string.Join(", ", Value);
}
