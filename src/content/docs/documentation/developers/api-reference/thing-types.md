---
title: 'Thing Types API'
description: 'Category management endpoints for organizing things into types.'
---

# Thing Types API

Category management endpoints for organizing things into types (NPCs, Locations, Items, etc.).

## Endpoints

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

**Parameters:**

- `campaignSlug` (string) - URL-safe campaign identifier
- `thingTypeId` (number) - Thing type ID

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

**Warning:** Deleting a thing type will permanently remove all things associated with that type.

## Default Thing Types

When a campaign is created, these default thing types are automatically generated:

- **NPCs** - Non-player characters
- **Locations** - Places and settings
- **Items** - Objects and equipment

## Custom Thing Types

Users can create custom thing types to organize their content according to their specific campaign needs:

- **Organizations** - Groups and factions
- **Events** - Significant occurrences
- **Spells** - Magic and abilities
- **Vehicles** - Transportation
- **Deities** - Gods and divine beings
- **Planes** - Alternate dimensions

## Usage Guidelines

- Thing type names should be descriptive and consistent
- Consider your campaign's needs when creating custom types
- Use plural nouns for better organization (e.g., "NPCs" not "NPC")
- Avoid overly specific categories that might have few items
