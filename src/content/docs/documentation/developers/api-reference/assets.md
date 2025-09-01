---
title: 'Assets API'
description: 'API endpoints for managing campaign assets including image uploads'
---

# Assets API

The Assets API provides endpoints for managing campaign assets, particularly images. Asset management includes both URL-based image insertion (free) and file uploads (premium feature).

## Authentication

All asset endpoints require authentication via session cookies or API tokens.

## Premium Requirements

File upload operations require an active premium subscription. URL-based image insertion is available for all users.

## Endpoints

### Request Upload URL

Request a secure upload URL for file upload to Cloudflare Images.

```http
POST /api/campaigns/{campaignSlug}/assets/upload-url
```

#### Request Body

```json
{
  "label": "string" // Descriptive label for the asset
}
```

#### Response

```json
{
  "success": true,
  "uploadURL": "string", // Secure upload URL
  "imageId": "string" // Cloudflare image ID
}
```

#### Error Responses

- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - Premium subscription required
- `404 Not Found` - Campaign not found or not accessible
- `400 Bad Request` - Missing or invalid label

### Confirm Upload

Confirm successful upload and save asset to database.

```http
POST /api/campaigns/{campaignSlug}/assets/confirm-upload
```

#### Request Body

```json
{
  "imageId": "string", // Cloudflare image ID from upload URL request
  "label": "string" // Descriptive label for the asset
}
```

#### Response

```json
{
  "success": true,
  "url": "string" // Public URL of the uploaded image
}
```

#### Error Responses

- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - Premium subscription required
- `404 Not Found` - Campaign not found or not accessible
- `400 Bad Request` - Missing parameters or upload not completed
- `500 Internal Server Error` - Upload verification failed

## Usage Flow

### File Upload (Premium)

1. Request upload URL with asset label
2. Upload file directly to Cloudflare using the provided URL
3. Confirm upload completion to save asset in database
4. Use returned public URL in content

### URL-based Images (Free)

For free users, images can be added directly using external URLs without going through the upload process.

## Data Model

### Asset

```typescript
interface Asset {
  id: number
  label: string // User-provided descriptive label
  cloudflareId: string // Unique Cloudflare image identifier
  url: string // Public URL for the image
  campaignId: number // Associated campaign
  userId: string // Asset owner
  createdAt: Date // Creation timestamp
}
```

## Integration

### Editor Integration

Assets are integrated with the rich text editor through the image uploader component:

- Toolbar button opens upload dialog
- Users can choose between URL and file upload modes
- Premium users see file upload option
- Free users are shown premium upgrade prompts for file uploads

### HTML Rendering

When assets are used in content:

- Alt text is populated from the asset label
- Images display with descriptive labels below
- Proper accessibility attributes are included

## Error Handling

The API provides detailed error responses for various failure scenarios:

- Authentication failures
- Permission violations (premium required)
- Upload verification issues
- Invalid parameters
- Network or service errors

Clients should handle these errors gracefully and provide appropriate user feedback.
