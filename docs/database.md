# Database Schema

This document describes the database structure and relationships used in ArcAide.

## Overview

ArcAide uses a SQLite database (via Turso/LibSQL) with Drizzle ORM for type-safe database operations. The schema is designed around the core concepts of campaigns, arcs, and things (campaign entities).

## Core Tables

### Campaigns

The top-level container for organizing D&D campaigns.

```sql
CREATE TABLE campaign (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT, -- JSON field for rich content
  created_at INTEGER NOT NULL, -- Unix timestamp
  updated_at INTEGER NOT NULL, -- Unix timestamp
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(user_id, slug)
);
```

**Fields:**

- `id` - Auto-incrementing primary key
- `slug` - URL-safe identifier derived from name
- `name` - Human-readable campaign name
- `description` - Rich text content (stored as JSON)
- `user_id` - Reference to the campaign owner
- Unique constraint ensures users can't have duplicate campaign slugs

### Arcs

Narrative story structures within campaigns following a specific framework.

```sql
CREATE TABLE arc (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  hook TEXT, -- JSON field for rich content
  protagonist TEXT, -- JSON field for rich content
  antagonist TEXT, -- JSON field for rich content
  problem TEXT, -- JSON field for rich content
  key TEXT, -- JSON field for rich content
  outcome TEXT, -- JSON field for rich content
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  campaign_id INTEGER NOT NULL,
  parent_arc_id INTEGER REFERENCES arc(id),
  UNIQUE(campaign_id, slug)
);
```

**Arc Framework:**

- `hook` - The opening or inciting incident
- `protagonist` - The main character or hero
- `antagonist` - The opposition or villain
- `problem` - The central conflict or challenge
- `key` - The solution, tool, or method
- `outcome` - The resolution or consequence

**Relationships:**

- Arcs belong to campaigns
- Arcs can have sub-arcs (parent_arc_id for hierarchical structures)
- All rich text fields stored as JSON for Slate.js compatibility

### Thing Types

Custom categories for organizing campaign entities.

```sql
CREATE TABLE thing_type (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  campaign_id INTEGER NOT NULL
);
```

**Purpose:**

- Allows users to create custom categories (NPCs, Locations, Items, etc.)
- Campaign-specific to allow customization per campaign

### Things

Campaign entities like NPCs, locations, items, and plot devices.

```sql
CREATE TABLE thing (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL,
  type_id INTEGER NOT NULL REFERENCES thing_type(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT, -- JSON field for rich content
  campaign_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(campaign_id, slug)
);
```

**Features:**

- Flexible entity system through thing_types
- Rich text descriptions for detailed content
- Campaign-scoped with unique slugs

### Arc-Thing Relationships

Many-to-many relationship between arcs and things.

```sql
CREATE TABLE arc_thing (
  arc_id INTEGER NOT NULL REFERENCES arc(id) ON DELETE CASCADE,
  thing_id INTEGER NOT NULL REFERENCES thing(id) ON DELETE CASCADE,
  UNIQUE(arc_id, thing_id)
);
```

**Purpose:**

- Links entities to story arcs
- Enables tracking which NPCs, locations, etc. are involved in specific storylines

## Authentication Tables

### Users

User account information managed by Better Auth.

```sql
CREATE TABLE user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL, -- Boolean as integer
  image TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### Sessions

User session management for authentication.

```sql
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT
);
```

### Accounts

OAuth and external authentication provider information.

```sql
CREATE TABLE account (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at INTEGER,
  refresh_token_expires_at INTEGER,
  scope TEXT,
  password TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### Verification

Email verification and password reset tokens.

```sql
CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER,
  updated_at INTEGER
);
```

## Relationships and Constraints

### Data Integrity

- Foreign key constraints ensure referential integrity
- Cascade deletes prevent orphaned records
- Unique constraints prevent duplicate slugs within campaigns

### Indexes

```sql
-- Performance indexes for common queries
CREATE INDEX idx_campaign_user_id ON campaign(user_id);
CREATE INDEX idx_arc_campaign_id ON arc(campaign_id);
CREATE INDEX idx_thing_campaign_id ON thing(campaign_id);
CREATE INDEX idx_thing_type_id ON thing(type_id);
CREATE INDEX idx_session_user_id ON session(user_id);
```

## Data Types and Storage

### Rich Text Content

Rich text fields (descriptions, arc content) are stored as JSON containing Slate.js document structures:

```json
[
  {
    "type": "paragraph",
    "children": [
      { "text": "This is " },
      { "text": "bold", "bold": true },
      { "text": " text." }
    ]
  }
]
```

### Timestamps

All timestamps are stored as Unix timestamps (integers) for consistency and timezone handling.

### Slugs

URL-safe identifiers generated from names using a slugify function:

- Lowercase
- Spaces converted to hyphens
- Special characters removed
- Unique within their scope (campaign for arcs/things)

## Migration Strategy

### Schema Evolution

1. Database changes are tracked in the `migrations/` directory
2. Drizzle Kit generates migration files automatically
3. Migrations are applied using `yarn migrate:db`

### Data Migration

For significant schema changes:

1. Create backup of existing data
2. Write data transformation scripts
3. Test migrations on development data
4. Apply to production with rollback plan

## Query Patterns

### Common Queries

**Get campaign with arcs:**

```typescript
const campaignWithArcs = await db
  .select()
  .from(campaign)
  .leftJoin(arc, eq(arc.campaignId, campaign.id))
  .where(eq(campaign.slug, campaignSlug))
```

**Get arc with related things:**

```typescript
const arcWithThings = await db
  .select()
  .from(arc)
  .leftJoin(arcThing, eq(arcThing.arcId, arc.id))
  .leftJoin(thing, eq(thing.id, arcThing.thingId))
  .where(eq(arc.slug, arcSlug))
```

**Search things in campaign:**

```typescript
const searchResults = await db
  .select()
  .from(thing)
  .where(
    and(eq(thing.campaignId, campaignId), like(thing.name, `%${searchTerm}%`))
  )
```

## Performance Considerations

### Query Optimization

- Strategic use of indexes on frequently queried columns
- Efficient joins using Drizzle ORM's type-safe query builder
- Pagination for large result sets

### Data Access Patterns

- Campaign-scoped queries to limit data access
- Lazy loading of related entities when needed
- Optimistic updates for better user experience

### Scaling Considerations

- SQLite suitable for moderate scale (thousands of campaigns)
- Turso provides distributed SQLite for global access
- Future migration to PostgreSQL possible if needed
