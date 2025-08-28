---
title: 'Database Design'
description: 'Database schema, relationships, indexing strategy, and data patterns.'
---

# Database Design

ArcAide uses SQLite via Turso/LibSQL with Drizzle ORM for type-safe database operations.

## Schema Overview

### Core Tables

```sql
-- User management
users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  image TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)

-- Session management
sessions (
  id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)

-- OAuth accounts
accounts (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at INTEGER,
  refresh_token_expires_at INTEGER,
  scope TEXT,
  password TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)

-- Campaign management
campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT, -- JSON rich text
  user_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(slug, user_id)
)

-- Thing categorization
thing_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  campaign_id INTEGER NOT NULL,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  UNIQUE(name, campaign_id)
)

-- Campaign entities
things (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT, -- JSON rich text
  description_text TEXT, -- Plain text for search
  type_id INTEGER NOT NULL,
  campaign_id INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id) REFERENCES thing_types(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  UNIQUE(slug, campaign_id)
)

-- Story arcs
arcs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  hook TEXT, -- JSON rich text
  protagonist TEXT, -- JSON rich text
  antagonist TEXT, -- JSON rich text
  problem TEXT, -- JSON rich text
  key TEXT, -- JSON rich text
  outcome TEXT, -- JSON rich text
  notes TEXT, -- JSON rich text
  hook_text TEXT, -- Plain text for search
  protagonist_text TEXT, -- Plain text for search
  antagonist_text TEXT, -- Plain text for search
  problem_text TEXT, -- Plain text for search
  key_text TEXT, -- Plain text for search
  outcome_text TEXT, -- Plain text for search
  notes_text TEXT, -- Plain text for search
  campaign_id INTEGER NOT NULL,
  parent_arc_id INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_arc_id) REFERENCES arcs(id) ON DELETE SET NULL,
  UNIQUE(slug, campaign_id)
)

-- Arc-Thing associations
arc_things (
  arc_id INTEGER NOT NULL,
  thing_id INTEGER NOT NULL,
  PRIMARY KEY (arc_id, thing_id),
  FOREIGN KEY (arc_id) REFERENCES arcs(id) ON DELETE CASCADE,
  FOREIGN KEY (thing_id) REFERENCES things(id) ON DELETE CASCADE
)
```

## Indexing Strategy

### Primary Indexes

All tables have primary keys with automatic indexing:

- `users.id` - User lookup
- `campaigns.id` - Campaign operations
- `arcs.id` - Arc operations
- `things.id` - Thing operations
- `thing_types.id` - Type operations

### Composite Unique Indexes

Ensure data integrity within scopes:

```sql
-- Slug uniqueness within user scope
CREATE UNIQUE INDEX idx_campaigns_slug_user
ON campaigns(slug, user_id)

-- Slug uniqueness within campaign scope
CREATE UNIQUE INDEX idx_arcs_slug_campaign
ON arcs(slug, campaign_id)

CREATE UNIQUE INDEX idx_things_slug_campaign
ON things(slug, campaign_id)

-- Type name uniqueness within campaign
CREATE UNIQUE INDEX idx_thing_types_name_campaign
ON thing_types(name, campaign_id)
```

### Performance Indexes

Optimize common query patterns:

```sql
-- User-based campaign queries
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id)

-- Campaign-based content queries
CREATE INDEX idx_arcs_campaign_id ON arcs(campaign_id)
CREATE INDEX idx_things_campaign_id ON things(campaign_id)
CREATE INDEX idx_thing_types_campaign_id ON thing_types(campaign_id)

-- Hierarchical arc queries
CREATE INDEX idx_arcs_parent_arc_id ON arcs(parent_arc_id)

-- Type-based thing queries
CREATE INDEX idx_things_type_id ON things(type_id)

-- Session management
CREATE INDEX idx_sessions_user_id ON sessions(user_id)
CREATE INDEX idx_sessions_token ON sessions(token)

-- Updated_at queries for recent content
CREATE INDEX idx_campaigns_updated_at ON campaigns(updated_at)
CREATE INDEX idx_arcs_updated_at ON arcs(updated_at)
CREATE INDEX idx_things_updated_at ON things(updated_at)
```

## Full-Text Search

### FTS Virtual Tables

SQLite FTS5 for high-performance text search:

```sql
-- Arc content search
CREATE VIRTUAL TABLE arcs_fts USING fts5(
  name, hook_text, protagonist_text, antagonist_text,
  problem_text, key_text, outcome_text, notes_text,
  content='arcs', content_rowid='id'
)

-- Thing content search
CREATE VIRTUAL TABLE things_fts USING fts5(
  name, description_text,
  content='things', content_rowid='id'
)

-- Campaign search
CREATE VIRTUAL TABLE campaigns_fts USING fts5(
  name, description_text,
  content='campaigns', content_rowid='id'
)
```

### FTS Triggers

Automatic index maintenance:

```sql
-- Arc FTS triggers
CREATE TRIGGER arcs_fts_insert AFTER INSERT ON arcs
BEGIN
  INSERT INTO arcs_fts(rowid, name, hook_text, protagonist_text, antagonist_text, problem_text, key_text, outcome_text, notes_text)
  VALUES (new.id, new.name, new.hook_text, new.protagonist_text, new.antagonist_text, new.problem_text, new.key_text, new.outcome_text, new.notes_text);
END;

CREATE TRIGGER arcs_fts_delete AFTER DELETE ON arcs
BEGIN
  INSERT INTO arcs_fts(arcs_fts, rowid, name, hook_text, protagonist_text, antagonist_text, problem_text, key_text, outcome_text, notes_text)
  VALUES ('delete', old.id, old.name, old.hook_text, old.protagonist_text, old.antagonist_text, old.problem_text, old.key_text, old.outcome_text, old.notes_text);
END;

CREATE TRIGGER arcs_fts_update AFTER UPDATE ON arcs
BEGIN
  INSERT INTO arcs_fts(arcs_fts, rowid, name, hook_text, protagonist_text, antagonist_text, problem_text, key_text, outcome_text, notes_text)
  VALUES ('delete', old.id, old.name, old.hook_text, old.protagonist_text, old.antagonist_text, old.problem_text, old.key_text, old.outcome_text, old.notes_text);
  INSERT INTO arcs_fts(rowid, name, hook_text, protagonist_text, antagonist_text, problem_text, key_text, outcome_text, notes_text)
  VALUES (new.id, new.name, new.hook_text, new.protagonist_text, new.antagonist_text, new.problem_text, new.key_text, new.outcome_text, new.notes_text);
END;
```

## Data Patterns

### Rich Text Storage

Rich text content is stored as JSON in TEXT fields:

```typescript
// Slate.js document structure
interface RichTextDocument {
  type: string
  children: Array<{
    type: string
    children: Array<{ text: string }>
  }>
}
```

### Plain Text Extraction

Automatic extraction for search optimization:

```typescript
// Convert rich text to plain text for FTS
function extractPlainText(richText: RichTextDocument[]): string {
  return richText
    .map((node) => extractTextFromNode(node))
    .join(' ')
    .trim()
}
```

### Slug Generation

URL-safe identifiers with conflict resolution:

```typescript
function generateSlug(name: string, existingSlugs: string[]): string {
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  let slug = baseSlug
  let counter = 1

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}
```

## Migration Strategy

### Drizzle Migrations

Version-controlled schema changes:

```typescript
// Example migration
export async function up(db: Database) {
  await db.execute(`
    CREATE TABLE new_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      -- new columns
    )
  `)
}

export async function down(db: Database) {
  await db.execute(`DROP TABLE new_table`)
}
```

### Migration History

```
migrations/
├── 0000_initial_setup.sql
├── 0001_fts.sql
├── 0002_spellfix_setup.sql
├── 0003_add_search_text_columns.sql
├── 0004_update_fts_triggers.sql
├── 0005_silent_wind_dancer.sql
├── 0006_mute_blink.sql
└── 0007_complete_proudstar.sql
```

## Performance Considerations

### Query Optimization

- **Prepared Statements**: Drizzle ORM uses prepared statements by default
- **Index Usage**: Queries designed to leverage existing indexes
- **Batch Operations**: Multiple operations combined when possible
- **Connection Pooling**: Efficient database connection management

### Data Size Management

- **Rich Text Compression**: Consider compression for large content
- **Pagination**: Limit result sets for large datasets
- **Lazy Loading**: Load detailed content only when needed
- **Cache Strategy**: Browser caching for frequently accessed data

### Backup and Recovery

- **SQLite Benefits**: Single file backup and restore
- **Turso Integration**: Automatic backups and point-in-time recovery
- **Migration Testing**: All migrations tested in development
- **Data Validation**: Integrity checks after migrations

## Security Considerations

### Data Access Control

- **User Isolation**: All queries scoped to authenticated user
- **Campaign Ownership**: Strict ownership validation for all operations
- **SQL Injection Prevention**: Drizzle ORM parameterized queries
- **Input Validation**: Zod schemas for all user input

### Sensitive Data Handling

- **Password Security**: Better Auth handles password hashing
- **Session Security**: Secure token generation and storage
- **PII Protection**: Minimal personal information storage
- **Audit Trail**: Operation logging for security monitoring

This database design provides a solid foundation for the ArcAide application with excellent performance, data integrity, and security while maintaining flexibility for future growth.
