# API Reference

This document provides comprehensive documentation for all API endpoints in ArcAide.

## Authentication

All API endpoints (except public routes) require authentication. Authentication is handled via session cookies managed by Better Auth.

### Authentication Headers

```
Cookie: better-auth.session_token=<token>
```

### Error Responses

```json
// 401 Unauthorized
{
  "error": "Unauthorized"
}

// 500 Internal Server Error
{
  "error": "Internal Server Error"
}
```

## Campaigns

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

## Arcs

### GET /api/campaigns/[campaignSlug]/arcs

Get all arcs for a campaign.

**Response:**

```json
[
  {
    "id": 1,
    "slug": "goblin-ambush",
    "name": "Goblin Ambush",
    "hook": [
      {
        "type": "paragraph",
        "children": [{ "text": "The party is traveling to Phandalin..." }]
      }
    ],
    "protagonist": [
      {
        "type": "paragraph",
        "children": [{ "text": "The adventuring party" }]
      }
    ],
    "antagonist": [
      {
        "type": "paragraph",
        "children": [{ "text": "Klarg and his goblin tribe" }]
      }
    ],
    "problem": [
      {
        "type": "paragraph",
        "children": [{ "text": "Gundren has been captured" }]
      }
    ],
    "key": [
      {
        "type": "paragraph",
        "children": [{ "text": "Infiltrate the goblin hideout" }]
      }
    ],
    "outcome": [
      {
        "type": "paragraph",
        "children": [{ "text": "Rescue Gundren and learn about the mine" }]
      }
    ],
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-16T09:30:00Z",
    "campaignId": 1,
    "parentArcId": null
  }
]
```

### POST /api/campaigns/[campaignSlug]/arcs

Create a new arc in a campaign.

**Request Body:**

```json
{
  "newArc": {
    "name": "The Redbrand Hideout"
  }
}
```

### GET /api/campaigns/[campaignSlug]/arcs/[arcSlug]

Get a specific arc by slug.

### PUT /api/campaigns/[campaignSlug]/arcs/[arcSlug]

Update an existing arc.

**Request Body:**

```json
{
  "updatedArc": {
    "slug": "goblin-ambush",
    "name": "Goblin Ambush - Updated",
    "hook": [
      {
        "type": "paragraph",
        "children": [{ "text": "Updated hook content..." }]
      }
    ],
    "protagonist": [...],
    "antagonist": [...],
    "problem": [...],
    "key": [...],
    "outcome": [...]
  }
}
```

### DELETE /api/campaigns/[campaignSlug]/arcs/[arcSlug]

Delete an arc.

## Things

### GET /api/campaigns/[campaignSlug]/things

Get all things (entities) in a campaign.

**Response:**

```json
[
  {
    "id": 1,
    "slug": "gundren-rockseeker",
    "typeId": 1,
    "name": "Gundren Rockseeker",
    "description": [
      {
        "type": "paragraph",
        "children": [{ "text": "A dwarven noble and merchant..." }]
      }
    ],
    "campaignId": 1,
    "createdAt": "2024-01-15T12:00:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
]
```

### POST /api/campaigns/[campaignSlug]/things

Create a new thing in a campaign.

**Request Body:**

```json
{
  "newThing": {
    "name": "Sildar Hallwinter",
    "typeId": 1
  }
}
```

### GET /api/campaigns/[campaignSlug]/things/[thingSlug]

Get a specific thing by slug.

### PUT /api/campaigns/[campaignSlug]/things/[thingSlug]

Update an existing thing.

**Request Body:**

```json
{
  "updatedThing": {
    "slug": "gundren-rockseeker",
    "name": "Gundren Rockseeker",
    "typeId": 1,
    "description": [
      {
        "type": "paragraph",
        "children": [{ "text": "Updated description..." }]
      }
    ]
  }
}
```

### DELETE /api/campaigns/[campaignSlug]/things/[thingSlug]

Delete a thing.

### GET /api/campaigns/[campaignSlug]/things/[thingSlug]/arcs

Get all arcs that include a specific thing.

**Parameters:**

- `campaignSlug` (string) - URL-safe campaign identifier
- `thingSlug` (string) - URL-safe thing identifier

**Response:**

```json
[
  {
    "id": 1,
    "slug": "the-goblin-ambush",
    "name": "The Goblin Ambush",
    "hook": [...],
    "protagonist": [...],
    "antagonist": [...],
    "problem": [...],
    "key": [...],
    "outcome": [...],
    "campaignId": 1,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:15:00Z"
  }
]
```

### POST /api/campaigns/[campaignSlug]/things/[thingSlug]/arcs

Associate a thing with an arc.

**Parameters:**

- `campaignSlug` (string) - URL-safe campaign identifier
- `thingSlug` (string) - URL-safe thing identifier

**Request Body:**

```json
{
  "arcSlug": "the-goblin-ambush"
}
```

**Response:**

```json
{
  "message": "Thing added to Arc successfully"
}
```

## Thing Types

### GET /api/campaigns/[campaignSlug]/thing-types

Get all thing types for a campaign.

**Response:**

```json
[
  {
    "id": 1,
    "name": "NPCs",
    "campaignId": 1
  },
  {
    "id": 2,
    "name": "Locations",
    "campaignId": 1
  },
  {
    "id": 3,
    "name": "Items",
    "campaignId": 1
  }
]
```

### POST /api/campaigns/[campaignSlug]/thing-types

Create a new thing type.

**Request Body:**

```json
{
  "newThingType": {
    "name": "Magic Items"
  }
}
```

### GET /api/campaigns/[campaignSlug]/thing-types/[thingTypeId]

Get a specific thing type by ID.

### PUT /api/campaigns/[campaignSlug]/thing-types/[thingTypeId]

Update an existing thing type.

**Request Body:**

```json
{
  "updatedThingType": {
    "id": 1,
    "name": "Non-Player Characters"
  }
}
```

### DELETE /api/campaigns/[campaignSlug]/thing-types/[thingTypeId]

Delete a thing type. This will cascade delete all things of this type.

## Search

### GET /api/campaigns/[campaignSlug]/search

Search for content within a campaign.

**Query Parameters:**

- `q` (string) - Search query

**Response:**

```json
{
  "results": [
    {
      "type": "thing",
      "id": 1,
      "name": "Gundren Rockseeker",
      "slug": "gundren-rockseeker",
      "excerpt": "A dwarven noble and merchant who hired the party...",
      "highlights": ["merchant", "party"]
    },
    {
      "type": "arc",
      "id": 1,
      "name": "Goblin Ambush",
      "slug": "goblin-ambush",
      "excerpt": "The party encounters goblins on the road...",
      "highlights": ["goblins", "party"]
    }
  ]
}
```

## Data Types

### Rich Text Content

Rich text fields use Slate.js document format:

```typescript
type Descendant = Element | Text

type Element = {
  type: string
  children: Descendant[]
  [key: string]: any
}

type Text = {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
}
```

### Common Field Types

```typescript
// Timestamps
type Timestamp = string // ISO 8601 format

// Rich Text
type RichText = Descendant[] | null

// Campaign
type Campaign = {
  id: number
  slug: string
  name: string
  description: RichText
  createdAt: Timestamp
  updatedAt: Timestamp
  userId: string
}

// Arc
type Arc = {
  id: number
  slug: string
  name: string
  hook: RichText
  protagonist: RichText
  antagonist: RichText
  problem: RichText
  key: RichText
  outcome: RichText
  createdAt: Timestamp
  updatedAt: Timestamp
  campaignId: number
  parentArcId: number | null
}

// Thing
type Thing = {
  id: number
  slug: string
  typeId: number
  name: string
  description: RichText
  campaignId: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Thing Type
type ThingType = {
  id: number
  name: string
  campaignId: number
}
```

## Error Handling

### Common HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Successful creation
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "error": "Error message description"
}
```

### Validation Errors

Request body validation is performed using Zod schemas. Invalid data returns:

```json
{
  "error": "Invalid [entity] data"
}
```

## Rate Limiting

Currently, no rate limiting is implemented, but it's recommended to implement rate limiting for production use, especially for:

- User registration/login endpoints
- Content creation endpoints
- Search endpoints

## Caching

- Static assets are cached via browser cache headers
- No API response caching is currently implemented
- Database queries use connection pooling for performance
