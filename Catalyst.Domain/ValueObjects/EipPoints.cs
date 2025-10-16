namespace Catalyst.Domain.ValueObjects;

/// <summary>
/// Strongly-typed EIP (Enterprise Innovation Points) value object.
/// Ensures points can never be negative, enforcing business rules at domain boundary.
/// </summary>
public record EipPoints
{
    public int Value { get; init; }

    private EipPoints(int value)
    {
        if (value < 0)
            throw new ArgumentException("EIP Points cannot be negative", nameof(value));
        Value = value;
    }

    /// <summary>
    /// Creates new EipPoints with validation.
    /// </summary>
    public static EipPoints Create(int value) => new(value);

    /// <summary>
    /// Adds points (returns new EipPoints instance).
    /// </summary>
    public EipPoints Add(int amount)
    {
        if (amount < 0)
            throw new ArgumentException("Cannot add negative points", nameof(amount));
        return new EipPoints(Value + amount);
    }

    /// <summary>
    /// Subtracts points, ensuring value never goes below zero.
    /// </summary>
    public EipPoints Subtract(int amount)
    {
        if (amount < 0)
            throw new ArgumentException("Cannot subtract negative points", nameof(amount));
        return new EipPoints(Math.Max(0, Value - amount));
    }

    public override string ToString() => Value.ToString();
}
