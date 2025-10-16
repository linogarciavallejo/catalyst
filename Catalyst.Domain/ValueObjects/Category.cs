namespace Catalyst.Domain.ValueObjects;

/// <summary>
/// Strongly-typed Category value object.
/// Ensures only standardized categories can be used, preventing inconsistent data.
/// </summary>
public record Category
{
    public string Value { get; init; }

    // Predefined category constants
    public static readonly Category Technology = new("Technology");
    public static readonly Category Process = new("Process");
    public static readonly Category Innovation = new("Innovation");
    public static readonly Category Efficiency = new("Efficiency");
    public static readonly Category Culture = new("Culture");

    private Category(string value)
    {
        Value = value;
    }

    /// <summary>
    /// Creates a new Category from a string value.
    /// Validates against predefined categories (case-insensitive).
    /// </summary>
    public static Category Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Category cannot be empty", nameof(value));

        var normalized = value.Trim().ToLower();

        return normalized switch
        {
            "technology" => Technology,
            "process" => Process,
            "innovation" => Innovation,
            "efficiency" => Efficiency,
            "culture" => Culture,
            _ => throw new ArgumentException($"Unknown category: {value}. Valid categories: Technology, Process, Innovation, Efficiency, Culture", nameof(value))
        };
    }

    /// <summary>
    /// Gets all available categories.
    /// </summary>
    public static IReadOnlyList<Category> GetAll() =>
        new[] { Technology, Process, Innovation, Efficiency, Culture };

    public override string ToString() => Value;
}
