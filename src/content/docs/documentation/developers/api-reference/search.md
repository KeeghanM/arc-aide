---
title: 'Search API'
description: 'Content search functionality for finding campaigns, arcs, and things.'
---

# Search API

Content search functionality for finding campaigns, arcs, and things across your campaign content.

## Endpoints

### GET /api/campaigns/[campaignSlug]/search

Search for content within a campaign.

**Query Parameters:**

- `q` (string) - Search query

**Example:**

```
GET /api/campaigns/my-campaign/search?q=goblin
```

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

## Search Features

### Fuzzy Search

The search system includes fuzzy search capabilities that can find content even with:

- **Typos and misspellings** - "goblin" will match "golbin"
- **Partial matches** - "guard" will match "guardian"
- **Word variations** - "guards" will match "guard"

### Content Types

Search covers all campaign content:

- **Arcs** - Names and all rich text fields (hook, protagonist, etc.)
- **Things** - Names and descriptions
- **Campaign** - Name and description

### Relevance Ranking

Results are ranked by relevance based on:

- **Exact matches** score higher than partial matches
- **Title matches** score higher than content matches
- **Multiple word matches** score higher than single matches
- **Recent content** may receive slight boost

### Search Highlighting

The search response includes:

- **Excerpts** - Relevant snippets from the matched content
- **Highlights** - Array of matched terms for emphasis
- **Context** - Surrounding text for better understanding

## Search Implementation

### Database Integration

- Uses SQLite FTS (Full Text Search) for performance
- Indexes are automatically maintained on content updates
- Supports advanced search operators

### Performance

- Search queries are optimized for speed
- Results are limited to prevent performance issues
- Pagination may be added for large result sets

## Search Tips

- Use specific terms for better results
- Try variations of words if initial search doesn't match
- Search terms are case-insensitive
- Special characters are automatically handled
