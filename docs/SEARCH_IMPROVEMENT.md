# Search Improvement: Plain Text Extraction from Slate AST

## Problem

The search functionality was returning raw JSON data from Slate AST instead of readable text. When searching for "Tavern", results would show "...in a tavern"}]}][{"type":"paragraph..." instead of clean, readable text.

## Solution

We've implemented a dual-column approach that stores both the original Slate AST JSON (for the editor) and extracted plain text (for search):

### Database Changes

1. **New columns added:**

   - `arc` table: `hook_text`, `protagonist_text`, `antagonist_text`, `problem_text`, `outcome_text`
   - `thing` table: `description_text`

2. **Updated FTS triggers:** Now use plain text columns instead of JSON extraction

### Application Changes

1. **Text extraction utility:** `src/lib/slate-text-extractor.ts` - Recursively extracts plain text from Slate AST
2. **Updated API endpoints:** Arc and Thing update endpoints now populate both JSON and text columns
3. **Migration script:** `migrate-search-text.ts` - Extracts text from existing data

### Benefits

- ✅ Search returns clean, readable text snippets
- ✅ Editor functionality unchanged (still uses JSON)
- ✅ Better search relevance and highlighting
- ✅ Backward compatible with existing data

## How to Apply

1. Run the database migrations:

   ```bash
   # Apply migrations (will add new columns and update triggers)
   npm run db:migrate
   ```

2. Extract text from existing data:

   ```bash
   # Run the migration script to populate text columns
   deno run --allow-read --allow-write migrate-search-text.ts
   ```

3. Future saves will automatically populate both columns

## Files Changed

- `migrations/0005_add_search_text_columns.sql`
- `migrations/0006_update_fts_triggers.sql`
- `src/lib/db/schema.ts`
- `src/lib/slate-text-extractor.ts`
- `src/pages/api/campaigns/[campaignSlug]/arcs/[arcSlug]/index.ts`
- `src/pages/api/campaigns/[campaignSlug]/things/[thingSlug]/index.ts`
- `migrate-search-text.ts`
