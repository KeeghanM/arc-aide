---
title: 'Authentication'
description: 'Authentication and authorization for ArcAide API endpoints.'
---

# Authentication

All API endpoints (except public routes) require authentication. Authentication is handled via session cookies managed by Better Auth.

## Authentication Headers

```
Cookie: better-auth.session_token=<token>
```

## Session Management

ArcAide uses Better Auth for session management, which provides:

- Secure session tokens
- Automatic session renewal
- Cross-site request forgery (CSRF) protection
- Secure cookie handling

## Protected Routes

All API endpoints require authentication unless explicitly marked as public. Protected routes include:

- All campaign management endpoints
- All content creation and modification endpoints
- User-specific data retrieval

## Error Responses

### 401 Unauthorized

Returned when authentication is required but not provided or invalid.

```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden

Returned when the user is authenticated but doesn't have permission to access the resource.

```json
{
  "error": "Forbidden"
}
```

## Security Considerations

- Session tokens are httpOnly cookies for security
- All authenticated requests are validated server-side
- User permissions are checked for resource access
- Campaign ownership is enforced for all campaign-specific operations

## User Profile Endpoints

### Update User Profile

Update the authenticated user's profile information including username and display name.

```typescript
authClient.updateUser({
  name?: string
  username?: string
  displayUsername?: string
})
```

**Response:**

```json
{
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "username": "johndoe",
    "displayUsername": "John the DM",
    "email": "john@example.com"
  }
}
```

### Check Username Availability

Check if a username is available for use.

```typescript
authClient.isUsernameAvailable({
  username: string,
})
```

**Response:**

```json
{
  "data": {
    "available": true
  }
}
```

**Error Response:**

```json
{
  "data": {
    "available": false
  }
}
```

### Username Validation Rules

- **Length**: 3-30 characters
- **Characters**: Letters (a-z, A-Z), numbers (0-9), underscores (\_), hyphens (-)
- **Uniqueness**: Must be unique across all users
- **Case Sensitivity**: Usernames are case-insensitive for uniqueness checking

### Profile Fields

- **name**: User's display name (optional)
- **username**: Unique identifier for URL generation (required for publishing)
- **displayUsername**: Public-facing name (defaults to username)
- **email**: Account email (read-only via profile update)
