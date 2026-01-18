using System.Net;
using System.Text.Json;
using BookmarkManager.Domain.Exceptions;

namespace BookmarkManager.Api.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var response = context.Response;
        response.ContentType = "application/json";

        var errorResponse = new ErrorResponse();

        switch (exception)
        {
            case EntityNotFoundException notFoundEx:
                response.StatusCode = (int)HttpStatusCode.NotFound;
                errorResponse.Message = notFoundEx.Message;
                errorResponse.ErrorCode = "ENTITY_NOT_FOUND";
                _logger.LogWarning(exception, "Entity not found: {EntityType} with ID {EntityId}",
                    notFoundEx.EntityType, notFoundEx.EntityId);
                break;

            case DuplicateEntityException duplicateEx:
                response.StatusCode = (int)HttpStatusCode.Conflict;
                errorResponse.Message = duplicateEx.Message;
                errorResponse.ErrorCode = "DUPLICATE_ENTITY";
                _logger.LogWarning(exception, "Duplicate entity: {EntityType} with {PropertyName} = {PropertyValue}",
                    duplicateEx.EntityType, duplicateEx.PropertyName, duplicateEx.PropertyValue);
                break;

            case UnauthorizedEntityAccessException unauthorizedEx:
                response.StatusCode = (int)HttpStatusCode.Forbidden;
                errorResponse.Message = unauthorizedEx.Message;
                errorResponse.ErrorCode = "ACCESS_DENIED";
                _logger.LogWarning(exception, "Unauthorized access to {EntityType} with ID {EntityId}",
                    unauthorizedEx.EntityType, unauthorizedEx.EntityId);
                break;

            case UnauthorizedAccessException:
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse.Message = "Unauthorized access";
                errorResponse.ErrorCode = "UNAUTHORIZED";
                _logger.LogWarning(exception, "Unauthorized access attempt");
                break;

            case ArgumentException argEx:
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.Message = argEx.Message;
                errorResponse.ErrorCode = "INVALID_ARGUMENT";
                _logger.LogWarning(exception, "Invalid argument: {Message}", argEx.Message);
                break;

            default:
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                errorResponse.Message = "An unexpected error occurred";
                errorResponse.ErrorCode = "INTERNAL_ERROR";
                _logger.LogError(exception, "Unhandled exception occurred");
                break;
        }

        var result = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await response.WriteAsync(result);
    }
}

public class ErrorResponse
{
    public string Message { get; set; } = string.Empty;
    public string ErrorCode { get; set; } = string.Empty;
}

public static class GlobalExceptionHandlerMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder app)
    {
        return app.UseMiddleware<GlobalExceptionHandlerMiddleware>();
    }
}
