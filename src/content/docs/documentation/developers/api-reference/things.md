---
title: 'Things API'
description: 'Entity management endpoints for NPCs, locations, items, and other campaign elements.'
---

# Things API

Entity management endpoints for NPCs, locations, items, and other campaign elements.

## Endpoints

### GET /api/campaigns/[campaignSlug]/things

Get all things (entities) in a campaign with optional pagination or fetch all.

**Query Parameters:**

- `count` (number, optional) - Number of things to return (default: 20)
- `fetchAll` (boolean, optional) - If true, returns all things (up to 1000 limit)

**Examples:**

```
GET /api/campaigns/my-campaign/things
GET /api/campaigns/my-campaign/things?count=50
GET /api/campaigns/my-campaign/things?fetchAll=true
```

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

**Notes:**

- Default behavior returns 20 most recently updated things
- `fetchAll=true` has a hard limit of 1000 items to prevent server overload
- For campaigns with more than 1000 things, pagination will be implemented in future updates

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

**Parameters:**

- `campaignSlug` (string) - URL-safe campaign identifier
- `thingSlug` (string) - URL-safe thing identifier

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

## Arc Associations

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

## Thing Categories

Things are organized by types (categories) that help organize different kinds of entities:

- **NPCs** - Non-player characters
- **Locations** - Places and settings
- **Items** - Objects and equipment
- **Organizations** - Groups and factions
- **Events** - Significant occurrences
- **Custom Types** - User-defined categories

Each thing must belong to a type, which helps with organization and filtering.
