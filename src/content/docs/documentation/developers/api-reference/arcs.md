---
title: 'Arcs API'
description: 'Arc management endpoints for creating and organizing story arcs with hierarchical relationships.'
---

# Arcs API

Arc management endpoints for creating and organizing story arcs with hierarchical relationships.

## Endpoints

### GET /api/campaigns/[campaignSlug]/arcs

Get all arcs for a campaign with their associated things.

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
    "notes": [
      {
        "type": "paragraph",
        "children": [{ "text": "Additional notes about the arc..." }]
      }
    ],
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-16T09:30:00Z",
    "campaignId": 1,
    "parentArcId": null,
    "parentArc": null,
    "childArcs": [],
    "things": [
      {
        "id": 5,
        "slug": "klarg",
        "name": "Klarg",
        "typeId": 1,
        "description": [...],
        "campaignId": 1,
        "createdAt": "2024-01-15T12:30:00Z",
        "updatedAt": "2024-01-15T12:30:00Z"
      }
    ]
  }
]
```

**Notes:**

- Each arc includes a `things` array containing all things associated with that arc
- The response includes the full thing objects, not just references

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

**Parameters:**

- `campaignSlug` (string) - URL-safe campaign identifier
- `arcSlug` (string) - URL-safe arc identifier

**Response:**

```json
{
  "id": 1,
  "slug": "goblin-ambush",
  "name": "Goblin Ambush",
  "hook": [...],
  "protagonist": [...],
  "antagonist": [...],
  "problem": [...],
  "key": [...],
  "outcome": [...],
  "notes": [...],
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-16T09:30:00Z",
  "campaignId": 1,
  "parentArcId": null,
  "parentArc": null,
  "childArcs": [
    {
      "id": 2,
      "slug": "goblin-hideout-infiltration",
      "name": "Goblin Hideout Infiltration",
      "createdAt": "2024-01-16T10:00:00Z",
      "updatedAt": "2024-01-16T10:00:00Z"
    }
  ]
}
```

### PUT /api/campaigns/[campaignSlug]/arcs/[arcSlug]

Update an existing arc and returns the full updated arc object.

**Parameters:**

- `campaignSlug` (string) - URL-safe campaign identifier
- `arcSlug` (string) - URL-safe arc identifier

**Request Body:**

```json
{
  "updatedArc": {
    "slug": "goblin-ambush",
    "name": "Goblin Ambush - Updated",
    "parentArcId": 5,
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
    "outcome": [...],
    "notes": [
      {
        "type": "paragraph",
        "children": [{ "text": "Additional notes..." }]
      }
    ]
  }
}
```

**Response:**

```json
{
  "id": 1,
  "slug": "goblin-ambush",
  "name": "Goblin Ambush - Updated",
  "parentArcId": 5,
  "parentArc": {
    "id": 5,
    "slug": "chapter-one",
    "name": "Chapter One"
  },
  "hook": [...],
  "protagonist": [...],
  "antagonist": [...],
  "problem": [...],
  "key": [...],
  "outcome": [...],
  "notes": [...],
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-21T14:30:00Z",
  "campaignId": 1
}
```

### DELETE /api/campaigns/[campaignSlug]/arcs/[arcSlug]

Delete an arc.

## Arc Structure

Arcs follow a structured storytelling framework with the following fields:

- **Hook** - What draws the characters into the story
- **Protagonist** - The main character(s) driving the action
- **Antagonist** - The opposition or challenge to overcome
- **Problem** - The central conflict or obstacle
- **Key** - The method or solution to resolve the problem
- **Outcome** - The result or consequences of the arc
- **Notes** - Additional information or DM notes

## Hierarchical Relationships

Arcs support parent-child relationships for organizing complex storylines:

- Parent arcs can contain multiple child arcs
- Child arcs inherit context from their parent
- Hierarchies help organize campaign structure
