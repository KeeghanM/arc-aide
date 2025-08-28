---
title: 'Error Handling'
description: 'Error responses, status codes, and troubleshooting guide for the ArcAide API.'
---

# Error Handling

Error responses, status codes, and troubleshooting guide for the ArcAide API.

## HTTP Status Codes

### Success Codes

- **200 OK** - Successful request with data returned
- **201 Created** - Successful creation of new resource
- **204 No Content** - Successful request with no data returned (e.g., deletions)

### Client Error Codes

- **400 Bad Request** - Invalid request data or malformed request
- **401 Unauthorized** - Authentication required but not provided
- **403 Forbidden** - User authenticated but lacks permission
- **404 Not Found** - Requested resource does not exist
- **409 Conflict** - Request conflicts with current resource state
- **422 Unprocessable Entity** - Valid request format but invalid data

### Server Error Codes

- **500 Internal Server Error** - Unexpected server error
- **503 Service Unavailable** - Server temporarily unavailable

## Error Response Format

All error responses follow a consistent JSON format:

```json
{
  "error": "Error message description"
}
```

### Common Error Messages

```json
// Authentication errors
{
  "error": "Unauthorized"
}

// Permission errors
{
  "error": "Forbidden"
}

// Not found errors
{
  "error": "Campaign not found"
}
{
  "error": "Arc not found"
}
{
  "error": "Thing not found"
}

// Validation errors
{
  "error": "Invalid campaign data"
}
{
  "error": "Invalid arc data"
}
{
  "error": "Invalid thing data"
}

// Conflict errors
{
  "error": "Campaign with this name already exists"
}
{
  "error": "Cannot delete thing type with existing things"
}
```

## Validation Errors

Request body validation is performed using Zod schemas. When validation fails, the API returns a 400 status with descriptive error messages.

### Common Validation Issues

- **Missing required fields** - "name is required"
- **Invalid data types** - "id must be a number"
- **Empty strings** - "name cannot be empty"
- **Invalid relationships** - "parentArcId does not exist"

## Authentication Errors

### 401 Unauthorized

Occurs when:

- No session token provided
- Invalid or expired session token
- Session token malformed

**Solution:** Ensure proper authentication via session cookies.

### 403 Forbidden

Occurs when:

- User tries to access another user's campaign
- User lacks permission for the requested operation
- Campaign ownership validation fails

**Solution:** Verify user has permission to access the resource.

## Not Found Errors

### Resource-Specific 404 Errors

- **Campaign not found** - Invalid campaign slug or user doesn't own campaign
- **Arc not found** - Invalid arc slug or arc doesn't exist in campaign
- **Thing not found** - Invalid thing slug or thing doesn't exist in campaign
- **Thing type not found** - Invalid thing type ID

## Server Errors

### 500 Internal Server Error

Indicates an unexpected server-side error. These should be logged and investigated.

Common causes:

- Database connection issues
- Unhandled exceptions in application code
- Configuration problems

## Troubleshooting Guide

### Authentication Issues

1. **Check session cookies** - Ensure `better-auth.session_token` is included
2. **Verify token validity** - Tokens may expire and need renewal
3. **Check cookie settings** - Ensure cookies are sent with requests

### Permission Errors

1. **Verify ownership** - Users can only access their own campaigns
2. **Check campaign access** - Ensure user owns the specified campaign
3. **Validate relationships** - Ensure arcs/things belong to the specified campaign

### Validation Failures

1. **Review request format** - Ensure JSON structure matches expected format
2. **Check required fields** - All required fields must be present and valid
3. **Validate data types** - Ensure numbers are numbers, strings are strings, etc.
4. **Test with minimal data** - Start with minimum required fields

### Performance Issues

1. **Limit query size** - Use pagination for large datasets
2. **Optimize search queries** - Use specific search terms
3. **Check database performance** - Monitor query execution times

## Rate Limiting

Currently, no rate limiting is implemented, but it's recommended for production use:

- **Authentication endpoints** - Prevent brute force attacks
- **Content creation** - Prevent spam and abuse
- **Search endpoints** - Prevent excessive server load

## Monitoring and Logging

For production environments, implement:

- **Error tracking** - Log all 500 errors for investigation
- **Performance monitoring** - Track response times and database queries
- **Authentication logging** - Monitor failed authentication attempts
- **API usage analytics** - Track endpoint usage patterns
