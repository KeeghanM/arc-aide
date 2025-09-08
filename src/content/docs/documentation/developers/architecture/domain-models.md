---
title: 'Domain Models'
description: 'Core business logic and data structures that define the ArcAide domain.'
---

# Domain Models

ArcAide's domain is centered around tabletop RPG campaign management, with a focus on structured storytelling and entity organization.

## Core Domain Concepts

### Campaign

The top-level organizational unit that contains all content for a specific RPG campaign.

```typescript
interface Campaign {
  id: number
  slug: string
  name: string
  description: RichText | null
  userId: string
  createdAt: string
  updatedAt: string
}
```

**Key Properties:**

- **Slug**: URL-safe identifier generated from name
- **Description**: Rich text field for campaign overview
- **User Ownership**: Each campaign belongs to a single user
- **Hierarchical Container**: Contains all arcs, things, and types

### Arc (Story Structure)

Arcs represent structured story elements using a proven storytelling framework.

```typescript
interface Arc {
  id: number
  slug: string
  name: string
  campaignId: number
  parentArcId: number | null

  // Story Structure Fields
  hook: RichText | null
  protagonist: RichText | null
  antagonist: RichText | null
  problem: RichText | null
  key: RichText | null
  outcome: RichText | null
  notes: RichText | null

  // Search Fields (plain text)
  hookText: string | null
  protagonistText: string | null
  antagonistText: string | null
  problemText: string | null
  keyText: string | null
  outcomeText: string | null
  notesText: string | null

  createdAt: string
  updatedAt: string
}
```

#### Arc Story Framework

Each arc follows a structured storytelling approach:

1. **Hook** - What draws the characters into the story
   - The opening situation or event
   - Should immediately engage players
   - Sets the initial context and stakes

2. **Protagonist** - The main character(s) driving the action
   - Not always the player characters!
   - Can be NPCs the party is helping or working with
   - Defines who the story is really about
   - Example: "The temple priests trying to save their community" vs "The adventuring party"

3. **Antagonist** - The opposition or challenge to overcome
   - The primary opposition force
   - Can be characters, situations, or natural forces
   - Creates tension and conflict
   - Should have clear motivations and goals

4. **Problem** - The central conflict or obstacle
   - The main challenge to be resolved
   - Should be clear, specific, and have stakes
   - Explains what happens if not solved
   - Drives the narrative forward

5. **Key** - The crucial discovery or revelation needed to solve the problem
   - Often a twist or hidden piece of information
   - **The one thing** that unlocks the solution
   - Can be an item, knowledge, location, or realization
   - Changes the protagonists' understanding or capabilities
   - Provides direction for player agency

6. **Outcome** - The result or consequences of the arc
   - Resolution of the central problem
   - Sets up future story elements
   - Can include both success and failure scenarios

7. **Notes** - Additional information and DM context
   - Behind-the-scenes information
   - Alternative approaches or variations
   - Connection to other campaign elements

#### Hierarchical Structure

Arcs support parent-child relationships for complex storylines:

```
Campaign Arc (Parent)
├── Chapter 1 (Child)
│   ├── Scene 1.1 (Grandchild)
│   └── Scene 1.2 (Grandchild)
└── Chapter 2 (Child)
    ├── Scene 2.1 (Grandchild)
    └── Scene 2.2 (Grandchild)
```

**Benefits:**

- **Organization**: Complex campaigns broken into manageable pieces
- **Flexibility**: Stories can be reorganized as campaigns evolve
- **Context**: Child arcs inherit context from parents
- **Navigation**: Clear structure for both GMs and players

### Thing (Campaign Entity)

Things represent any entity within a campaign that can be referenced and organized.

```typescript
interface Thing {
  id: number
  slug: string
  name: string
  typeId: number
  description: RichText | null
  campaignId: number
  createdAt: string
  updatedAt: string
}
```

**Common Thing Categories:**

- **NPCs (Non-Player Characters)**: Characters controlled by the GM
- **Locations**: Places, buildings, cities, regions
- **Items**: Equipment, magical items, plot devices
- **Organizations**: Guilds, factions, governments
- **Events**: Historical events, festivals, disasters
- **Concepts**: Abstract ideas, rumors, legends

### Thing Type (Category System)

Thing Types provide flexible categorization for campaign entities.

```typescript
interface ThingType {
  id: number
  name: string
  campaignId: number
}
```

**Default Types Created:**

- NPCs
- Locations
- Items

**Custom Type Examples:**

- Magic Items
- Vehicles
- Deities
- Planes of Existence
- Spells
- Factions

## Relationships and Associations

### Arc-Thing Associations

Many-to-many relationship allowing flexible entity organization:

```sql
arc_things (arc_id, thing_id)
```

**Use Cases:**

- NPCs that appear in multiple arcs
- Locations used across different story elements
- Items that play roles in various storylines
- Organizations involved in multiple plots

### Hierarchical Arc Relationships

Parent-child relationships for story organization:

```sql
arcs.parent_arc_id → arcs.id
```

**Benefits:**

- **Nested Storylines**: Complex campaigns with multiple layers
- **Flexible Organization**: Easy to reorganize as campaigns evolve
- **Context Inheritance**: Child arcs can reference parent context
- **Visual Hierarchy**: Clear structure in campaign navigation

## Rich Text Integration

### Slate.js Document Structure

All rich text fields use Slate.js format for structured content:

```typescript
type RichText = Descendant[]

interface Descendant {
  type: string
  children: Descendant[]
  [key: string]: any
}
```

### Internal Linking System

Wiki-style links connect campaign content:

```typescript
interface CustomText {
  text: string
  link?: boolean
  linkSlug?: string
  linkType?: 'arc' | 'thing'
  linkSearch?: boolean
}
```

**Link Syntax:**

- `[[arc#arc-slug]]` - Links to specific arc
- `[[thing#thing-slug]]` - Links to specific thing
- `[[]]` - Triggers search interface for link creation

## Search and Discovery

### Full-Text Search Fields

Plain text versions of rich text content enable fast searching:

```sql
-- Arc search fields
hook_text, protagonist_text, antagonist_text,
problem_text, key_text, outcome_text, notes_text

-- Thing search fields
name, description (converted to plain text)

-- Campaign search fields
name, description (converted to plain text)
```

### Search Integration

- **SQLite FTS**: Built-in full-text search capabilities
- **Fuzzy Matching**: Typo-tolerant search results
- **Cross-Reference**: Find connections between arcs and things
- **Relevance Ranking**: Results ordered by importance and recency

## Data Validation and Integrity

### Business Rules

1. **User Ownership**: Users can only access their own campaigns
2. **Campaign Scope**: All arcs and things belong to a specific campaign
3. **Type Consistency**: Things must have valid types within their campaign
4. **Hierarchy Validity**: Arc parent-child relationships must be within same campaign
5. **Slug Uniqueness**: Slugs must be unique within their scope (campaign for arcs/things)

### Data Consistency

- **Cascade Deletions**: Deleting campaigns removes all associated data
- **Referential Integrity**: Foreign key constraints ensure valid relationships
- **Slug Generation**: Automatic slug creation from names with conflict resolution
- **Rich Text Validation**: Slate.js document structure validation

This domain model provides a flexible yet structured foundation for managing complex RPG campaigns while maintaining data integrity and enabling powerful search and organization capabilities.
