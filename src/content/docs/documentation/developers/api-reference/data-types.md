---
title: 'Data Types'
description: 'TypeScript definitions and data schemas used throughout the ArcAide API.'
---

# Data Types

TypeScript definitions and data schemas used throughout the ArcAide API.

## Rich Text Content

Rich text fields use Slate.js document format for structured content editing:

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

// Rich text field type
type RichText = Descendant[] | null
```

### Common Rich Text Elements

```typescript
// Paragraph
{
  type: "paragraph",
  children: [{ text: "Content here" }]
}

// Heading
{
  type: "heading",
  level: 1, // 1-6
  children: [{ text: "Heading text" }]
}

// List
{
  type: "bulleted-list",
  children: [
    {
      type: "list-item",
      children: [{ text: "List item" }]
    }
  ]
}
```

## Core Data Models

### Campaign

```typescript
type Campaign = {
  id: number
  slug: string
  name: string
  description: RichText
  createdAt: Timestamp
  updatedAt: Timestamp
  userId: string
}
```

### Arc

```typescript
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
  notes: RichText
  createdAt: Timestamp
  updatedAt: Timestamp
  campaignId: number
  parentArcId: number | null
  parentArc?: Arc | null
  childArcs?: Arc[]
  things?: Thing[]
}
```

### Thing

```typescript
type Thing = {
  id: number
  slug: string
  typeId: number
  name: string
  description: RichText
  campaignId: number
  createdAt: Timestamp
  updatedAt: Timestamp
  type?: ThingType
  arcs?: Arc[]
}
```

### Thing Type

```typescript
type ThingType = {
  id: number
  name: string
  campaignId: number
  things?: Thing[]
}
```

## Request/Response Types

### API Request Bodies

```typescript
// Campaign creation
type CreateCampaignRequest = {
  newCampaign: {
    name: string
  }
}

// Campaign update
type UpdateCampaignRequest = {
  updatedCampaign: {
    slug: string
    name: string
    description?: RichText
  }
}

// Arc creation
type CreateArcRequest = {
  newArc: {
    name: string
    parentArcId?: number
  }
}

// Arc update
type UpdateArcRequest = {
  updatedArc: {
    slug: string
    name: string
    parentArcId?: number | null
    hook?: RichText
    protagonist?: RichText
    antagonist?: RichText
    problem?: RichText
    key?: RichText
    outcome?: RichText
    notes?: RichText
  }
}

// Thing creation
type CreateThingRequest = {
  newThing: {
    name: string
    typeId: number
  }
}

// Thing update
type UpdateThingRequest = {
  updatedThing: {
    slug: string
    name: string
    typeId: number
    description?: RichText
  }
}

// Thing type creation
type CreateThingTypeRequest = {
  newThingType: {
    name: string
  }
}

// Thing type update
type UpdateThingTypeRequest = {
  updatedThingType: {
    id: number
    name: string
  }
}
```

### Search Types

```typescript
type SearchResult = {
  type: 'arc' | 'thing' | 'campaign'
  id: number
  name: string
  slug: string
  excerpt: string
  highlights: string[]
}

type SearchResponse = {
  results: SearchResult[]
}
```

## Utility Types

### Timestamps

```typescript
// ISO 8601 format string
type Timestamp = string

// Example: "2024-01-15T10:30:00Z"
```

### Database Relations

```typescript
// Arc with parent/child relationships
type ArcWithRelations = Arc & {
  parentArc: Arc | null
  childArcs: Arc[]
  things: Thing[]
}

// Thing with type and arc associations
type ThingWithRelations = Thing & {
  type: ThingType
  arcs: Arc[]
}

// Campaign with all content
type CampaignWithContent = Campaign & {
  arcs: Arc[]
  things: Thing[]
  thingTypes: ThingType[]
}
```

## Validation Schemas

All API endpoints use Zod schemas for request validation. Key validation rules:

- **Names** must be non-empty strings
- **Slugs** are auto-generated and URL-safe
- **Rich text** fields accept null or valid Slate.js documents
- **IDs** must be positive integers
- **Relationships** are validated for existence and ownership
