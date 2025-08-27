# Search Functionality

This document explains how the search system works in ArcAide, including full-text search, fuzzy matching, and text extraction from rich content.

## Overview

ArcAide provides powerful search capabilities that allow users to find content across campaigns, arcs, and things. The search system includes:

- **Full-text search** using SQLite FTS5
- **Fuzzy search** with spell correction using SQLite spellfix extension
- **Clean text extraction** from Slate.js rich text content
- **Highlighted search results** with context snippets

## Architecture

### Dual-Column Approach

The search system uses a dual-column approach for rich text content:

- **JSON columns** (`hook`, `description`, etc.) - Store original Slate.js AST for the editor
- **Text columns** (`hook_text`, `description_text`, etc.) - Store extracted plain text for search

This ensures:

- Editor functionality remains unchanged
- Search returns clean, readable text snippets
- Better search relevance and highlighting
- Backward compatibility with existing data

### Database Structure

```sql
-- FTS5 virtual table for full-text search
CREATE VIRTUAL TABLE search_index_fts USING fts5(
  title,
  content,
  type,
  campaign_id UNINDEXED,
  entity_id UNINDEXED,
  content=search_index,
  content_rowid=rowid
);

-- Spellfix table for fuzzy search
CREATE VIRTUAL TABLE spellfix_index USING spellfix1;
CREATE TABLE spellfix_index_vocab(word TEXT PRIMARY KEY);
```

## Features

### 1. Full-Text Search

Basic search functionality using SQLite FTS5:

```typescript
// API endpoint
GET /api/campaigns/my-campaign/search?q=goblin&type=arc

// Search function
import { searchWithHighlight } from '@db/search'

const results = await searchWithHighlight(
  'goblin tavern',
  campaignId,
  'arc' // or 'thing', 'any'
)
```

### 2. Fuzzy Search with Spell Correction

Advanced search that handles misspellings:

```typescript
// API endpoint with fuzzy enabled
GET /api/campaigns/my-campaign/search?q=protagnist&fuzzy=true

// Search function
import { fuzzySearchWithHighlight } from '@db/search'

const results = await fuzzySearchWithHighlight(
  'protagnist antgonist', // misspelled query
  campaignId,
  'any',
  true // enable fuzzy matching
)

// Results include corrections
results.forEach((result) => {
  console.log(`Original: ${result.originalQuery}`)
  console.log(`Corrected: ${result.correctedQuery}`)
  console.log(`Found: ${result.title}`)
})
```

### 3. Text Extraction

The `slate-text-extractor.ts` utility handles converting Slate.js AST to plain text:

```typescript
import { extractPlainTextFromSlate } from '@utils/slate-text-extractor'

// Extract text from Slate AST
const plainText = extractPlainTextFromSlate([
  {
    type: 'paragraph',
    children: [{ text: 'The party encounters goblins...' }],
  },
])
// Returns: "The party encounters goblins..."
```

## API Usage

### Search Endpoint

```
GET /api/campaigns/[campaignSlug]/search
```

**Query Parameters:**

- `q` - Search query string (required)
- `type` - Content type filter: `'any'`, `'arc'`, `'thing'` (default: `'any'`)
- `fuzzy` - Enable fuzzy search: `'true'` or `'false'` (default: `'false'`)

**Examples:**

```bash
# Basic search
GET /api/campaigns/my-campaign/search?q=goblin

# Search only arcs
GET /api/campaigns/my-campaign/search?q=tavern&type=arc

# Fuzzy search with spell correction
GET /api/campaigns/my-campaign/search?q=protagnist&fuzzy=true
```

### Response Format

```json
{
  "results": [
    {
      "type": "arc",
      "id": 1,
      "name": "Goblin Ambush",
      "slug": "goblin-ambush",
      "excerpt": "The party encounters goblins on the road...",
      "highlights": ["goblins", "party"],
      "originalQuery": "protagnist",
      "correctedQuery": "protagonist"
    }
  ]
}
```

## React Integration

### Search Hook Example

```typescript
import { useQuery } from '@tanstack/react-query'

function useSearch(
  query: string,
  type: string = 'any',
  fuzzy: boolean = false
) {
  return useQuery({
    queryKey: ['search', query, campaignSlug, type, fuzzy],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: query,
        type,
        ...(fuzzy && { fuzzy: 'true' }),
      })

      const response = await fetch(
        `/api/campaigns/${campaignSlug}/search?${params}`
      )
      return response.json()
    },
    enabled: query.length > 0,
  })
}
```

### Search Component Example

```typescript
function SearchResults({ query }: { query: string }) {
  const [enableFuzzy, setEnableFuzzy] = useState(true)

  const { data, isLoading } = useSearch(query, 'any', enableFuzzy)

  if (isLoading) return <div>Searching...</div>

  return (
    <div>
      {data?.results.map((result) => (
        <div key={`${result.type}-${result.id}`}>
          <h3>{result.name}</h3>
          <p dangerouslySetInnerHTML={{ __html: result.excerpt }} />
          {result.correctedQuery && (
            <small>Did you mean: {result.correctedQuery}?</small>
          )}
        </div>
      ))}
    </div>
  )
}
```

## How Fuzzy Search Works

### 1. Vocabulary Building

When content is saved, triggers automatically:

- Extract individual words from titles and content
- Add new words to the spellfix vocabulary table
- Filter out short words (< 3 characters) and non-alphabetic terms

### 2. Spell Correction Process

1. **Term Extraction**: Parse query to extract searchable terms (ignoring FTS operators)
2. **Spell Lookup**: Check each term against the spellfix index
3. **Correction**: Replace misspelled terms with closest matches
4. **Search Execution**: Perform FTS search with corrected query
5. **Result Enhancement**: Include both original and corrected queries in results

### 3. Performance Optimizations

- **Selective Activation**: Enable fuzzy search strategically
- **Vocabulary Caching**: Spellfix maintains an in-memory vocabulary
- **Result Limiting**: Limit corrections to top matches only

## Setup and Configuration

### Database Migrations

The search system requires specific migrations:

```bash
# Apply search-related migrations
yarn migrate:db
```

Key migrations include:

- FTS5 virtual table creation
- Text column additions
- Spellfix table setup
- Trigger configuration

### Spellfix Initialization

For fuzzy search to work, initialize the spellfix vocabulary:

```bash
# Run setup script (if available)
node scripts/setup-spellfix.js
```

Or programmatically:

```typescript
import { initializeSpellfixVocabulary } from '@db/search'

await initializeSpellfixVocabulary()
```

## Performance Considerations

### Search Performance

- **FTS Search**: 5-50ms depending on content volume
- **Fuzzy Lookup**: 1-5ms per term
- **Total Search Time**: Usually < 100ms for typical queries

### Optimization Tips

1. **Strategic Fuzzy Usage**:

   ```typescript
   // Enable fuzzy only when needed
   const enableFuzzy = query.length > 3 || exactResults.length < 5
   ```

2. **Query Optimization**:

   ```typescript
   // Use specific search types when possible
   const results = await searchWithHighlight(query, campaignId, 'arc')
   ```

3. **Result Limiting**:
   ```typescript
   // Limit results for performance
   const results = await searchWithHighlight(query, campaignId, 'any', 20)
   ```

## Troubleshooting

### Common Issues

**No search results:**

- Verify FTS index is populated
- Check that content has been saved with text extraction
- Ensure search terms are not too short (< 3 characters)

**Fuzzy search not working:**

- Check that spellfix extension is available
- Verify spellfix vocabulary is populated
- Test with common misspellings

**Poor search quality:**

- Review text extraction from Slate content
- Check FTS trigger configuration
- Consider manual vocabulary additions

### Debug Queries

```sql
-- Check FTS index content
SELECT COUNT(*) FROM search_index_fts;

-- Verify spellfix vocabulary
SELECT COUNT(*) FROM spellfix_index_vocab;

-- Test manual spell correction
SELECT word FROM spellfix_index WHERE word MATCH 'protagnist' AND top=1;

-- Check specific content indexing
SELECT * FROM search_index_fts WHERE content MATCH 'goblin';
```

## Limitations

- **Extension Dependency**: Fuzzy search requires SQLite spellfix extension
- **English Optimization**: Spell correction optimized for English text
- **Storage Overhead**: Additional storage for text columns and vocabulary
- **Single Language**: No multi-language spell correction support

## Future Enhancements

- Configurable fuzzy matching sensitivity
- Multi-language spell correction support
- Advanced search operators (date ranges, field-specific search)
- Search analytics and optimization
- Autocomplete and search suggestions

## Component Usage

### SearchBar Component

The `SearchBar` component provides a flexible search interface with multiple configuration options:

```tsx
import SearchBar from '@components/app/components/search-bar/search-bar'

// Basic search with navigation
<SearchBar />

// Search with custom handler (e.g., for modals)
<SearchBar
  searchType="thing" // 'thing' | 'arc' | 'any'
  returnType="function"
  onSelect={(result) => {
    // Handle selection
    console.log(result.entitySlug, result.title, result.type)
  }}
/>

// Search with title and filtering
<SearchBar
  showTitle={true}
  title="Search Things"
  searchType="thing"
/>
```

### SearchBarWrapper Component

If you need to use the SearchBar within an Astro page, use the `SearchBarWrapper` which handles user and campaign context:

```tsx
import { SearchBarWrapper } from '@components/app/components/search-bar/search-bar'
;<SearchBarWrapper
  user={user}
  campaignSlug={campaignSlug}
  searchType='any'
  showTitle={true}
  title='Search Campaign'
/>
```

### Search Types

- **`thing`** - Search only things (NPCs, locations, items, etc.)
- **`arc`** - Search only story arcs
- **`any`** - Search across all content types

### Return Types

- **`link`** (default) - Navigate to the selected item
- **`function`** - Execute a callback function with the selected item

### Rich Text Editor Integration

The SearchBar component is integrated into the rich text editor for internal linking functionality:

```tsx
// Within the Slate.js editor's Leaf component
<SearchBar
  searchType='any'
  returnType='function'
  onSelect={(result) => {
    if (!result) return
    // Replace [[]] with [[type#slug]]
    const newText = `[[${result.type}#${result.entitySlug}]]`

    // Use Slate Transforms to update the text
    const range = {
      anchor: { path: linkRange.path, offset: linkRange.offset },
      focus: {
        path: linkRange.path,
        offset: linkRange.offset + linkRange.length,
      },
    }
    Transforms.select(editor, range)
    Transforms.insertText(editor, newText)
  }}
/>
```

This integration enables:

- **Inline entity selection** when typing `[[]]` in the editor
- **Automatic link creation** with proper formatting
- **Seamless workflow** without leaving the editing context
- **Type safety** ensuring only valid entities can be linked

### Search Component Features

The component automatically handles:

- Real-time search as you type
- Spell correction suggestions
- Highlighted search results
- Keyboard navigation (Escape to clear)
- Loading states and error handling
