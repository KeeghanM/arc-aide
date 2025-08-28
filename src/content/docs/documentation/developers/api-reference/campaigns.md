---
title: 'Campaigns API'
description: 'Campaign management endpoints for creating, reading, updating, and deleting campaigns.'
---

# Campaigns API

Campaign management endpoints for organizing your tabletop RPG content.

## Endpoints

### GET /api/campaigns

Get all campaigns for the authenticated user.

**Response:**

```json
[
  {
    "id": 1,
    "slug": "lost-mine-of-phandelver",
    "name": "Lost Mine of Phandelver",
    "description": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:15:00Z",
    "userId": "user_123"
  }
]
```

### POST /api/campaigns

Create a new campaign.

**Request Body:**

```json
{
  "newCampaign": {
    "name": "Dragon Heist Campaign"
  }
}
```

**Response:**

```json
{
  "id": 2,
  "slug": "dragon-heist-campaign",
  "name": "Dragon Heist Campaign",
  "description": null,
  "createdAt": "2024-01-21T09:00:00Z",
  "updatedAt": "2024-01-21T09:00:00Z",
  "userId": "user_123"
}
```

### GET /api/campaigns/[campaignSlug]

Get a specific campaign by slug.

**Parameters:**

- `campaignSlug` (string) - URL-safe campaign identifier

**Response:**

```json
{
  "id": 1,
  "slug": "lost-mine-of-phandelver",
  "name": "Lost Mine of Phandelver",
  "description": [
    {
      "type": "paragraph",
      "children": [{ "text": "A classic D&D starter adventure..." }]
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:15:00Z",
  "userId": "user_123"
}
```

### PUT /api/campaigns/[campaignSlug]

Update an existing campaign.

**Request Body:**

```json
{
  "updatedCampaign": {
    "slug": "lost-mine-of-phandelver",
    "name": "Lost Mine of Phandelver - Updated",
    "description": "Updated description"
  }
}
```

### DELETE /api/campaigns/[campaignSlug]

Delete a campaign and all associated data.

**Response:**

```json
{
  "success": true
}
```

## Notes

- Campaign slugs are automatically generated from names
- Deleting a campaign cascades to all associated arcs, things, and relationships
- Campaign ownership is enforced - users can only access their own campaigns
