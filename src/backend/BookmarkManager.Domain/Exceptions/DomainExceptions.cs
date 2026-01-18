namespace BookmarkManager.Domain.Exceptions;

/// <summary>
/// Thrown when a requested entity is not found.
/// </summary>
public class EntityNotFoundException : Exception
{
    public string EntityType { get; }
    public object? EntityId { get; }

    public EntityNotFoundException(string entityType, object? entityId = null)
        : base($"{entityType} not found")
    {
        EntityType = entityType;
        EntityId = entityId;
    }

    public EntityNotFoundException(string entityType, object? entityId, string message)
        : base(message)
    {
        EntityType = entityType;
        EntityId = entityId;
    }
}

/// <summary>
/// Thrown when attempting to create a duplicate entity.
/// </summary>
public class DuplicateEntityException : Exception
{
    public string EntityType { get; }
    public string? PropertyName { get; }
    public object? PropertyValue { get; }

    public DuplicateEntityException(string entityType, string? propertyName = null, object? propertyValue = null)
        : base(propertyName != null
            ? $"{entityType} with {propertyName} '{propertyValue}' already exists"
            : $"{entityType} already exists")
    {
        EntityType = entityType;
        PropertyName = propertyName;
        PropertyValue = propertyValue;
    }
}

/// <summary>
/// Thrown when a user attempts to access a resource they don't own.
/// </summary>
public class UnauthorizedEntityAccessException : Exception
{
    public string EntityType { get; }
    public object? EntityId { get; }

    public UnauthorizedEntityAccessException(string entityType, object? entityId = null)
        : base($"Access denied to {entityType}")
    {
        EntityType = entityType;
        EntityId = entityId;
    }
}
