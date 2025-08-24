# Fuzzy Search with Spellfix

This document explains how to set up and use fuzzy search functionality in arc-aide using SQLite's spellfix extension.

## Overview

The fuzzy search feature allows users to find content even when they make spelling mistakes. For example:

- Search "carmickaeel nummbers" to find "Carmichael numbers"
- Search "protagnist" to find "protagonist"
- Search "antgonist" to find "antagonist"

## Prerequisites

### For Local Development (SQLite)

1. **Install SQLite with spellfix extension**:

   ```bash
   # On Ubuntu/Debian
   sudo apt-get install sqlite3-tools

   # On macOS with Homebrew
   brew install sqlite
   ```

2. **Compile spellfix extension** (if not included):
   ```bash
   # Download SQLite source and compile spellfix
   wget https://sqlite.org/src/raw/ext/misc/spellfix.c
   gcc -shared -fPIC -o spellfix.so spellfix.c
   ```

### For Turso/LibSQL

Turso may have limited extension support. Check their documentation for spellfix availability or consider using a local SQLite setup for development.

## Setup

### 1. Run the Migration

The spellfix functionality requires running the migration:

```bash
# Apply the migration (adjust command based on your migration tool)
npx drizzle-kit push:sqlite
```

This creates:

- `spellfix_index` virtual table for spell correction
- `search_index_fts_aux` table for extracting FTS vocabulary
- Triggers to keep spellfix vocabulary synchronized with FTS content

### 2. Initialize Spellfix Index

Run the setup script to populate the spellfix index:

```bash
node scripts/setup-spellfix.js
```

This will:

- Check if spellfix extension is available
- Extract vocabulary from your existing FTS index
- Populate the spellfix table with searchable terms

### 3. Verify Setup

You can verify the setup worked by checking the spellfix statistics:

```typescript
import { getSpellfixStats } from '@/lib/db/spellfix-utils'

const stats = await getSpellfixStats()
console.log(`Spellfix has ${stats.totalWords} words available`)
console.log(`Sample words: ${stats.sampleWords.join(', ')}`)
```

## Usage

### API Endpoint

The search API now supports a `fuzzy` parameter:

```typescript
// Exact search (original behavior)
GET /api/campaigns/my-campaign/search?query=protagonist

// Fuzzy search (with spell correction)
GET /api/campaigns/my-campaign/search?query=protagnist&fuzzy=true
```

### In Your Application Code

```typescript
import { fuzzySearchWithHighlight } from '@/lib/db/search'

// Perform fuzzy search
const results = await fuzzySearchWithHighlight(
  'protagnist antgonist', // misspelled query
  campaignId,
  'any', // search type
  true // enable fuzzy matching
)

// Results include both original and corrected queries
results.forEach((result) => {
  console.log(`Original: ${result.originalQuery}`)
  console.log(`Corrected: ${result.correctedQuery}`)
  console.log(`Found: ${result.title}`)
  console.log(`Highlight: ${result.highlight}`)
})
```

### React Hook Integration

You can integrate fuzzy search into your existing search hooks:

```typescript
// In your search hook
const [enableFuzzy, setEnableFuzzy] = useState(true)

const searchQuery = useQuery({
  queryKey: ['search', query, campaignSlug, type, enableFuzzy],
  queryFn: async () => {
    const params = new URLSearchParams({
      query,
      type,
      ...(enableFuzzy && { fuzzy: 'true' }),
    })

    const response = await fetch(
      `/api/campaigns/${campaignSlug}/search?${params}`
    )
    return response.json()
  },
  enabled: query.length > 0,
})
```

## How It Works

### 1. Vocabulary Extraction

When content is added to the FTS index, triggers automatically:

- Extract individual words from titles and content
- Add new words to the spellfix vocabulary
- Filter out short words (< 3 characters) and non-alphabetic terms

### 2. Spell Correction

When a search is performed with fuzzy enabled:

1. Extract search terms from the query (ignoring FTS operators like AND, OR, NOT)
2. Look up each term in the spellfix index to find the closest match
3. Replace misspelled terms with corrected versions
4. Perform the FTS search with the corrected query

### 3. Result Enhancement

Search results include:

- `originalQuery`: The user's original search terms
- `correctedQuery`: The spell-corrected version (if different)
- `highlight`: Text snippet with `<mark>` tags around matching terms
- All standard search result fields (title, content, type, etc.)

## Performance Considerations

### Optimization Tips

1. **Vocabulary Size**: The spellfix index grows with your content. Monitor its size:

   ```typescript
   const stats = await getSpellfixStats()
   console.log(`Vocabulary size: ${stats.totalWords} words`)
   ```

2. **Selective Fuzzy Search**: Only enable fuzzy search when needed:

   ```typescript
   // Enable fuzzy only for longer queries or when exact search returns few results
   const enableFuzzy = query.length > 3 || exactResults.length < 5
   ```

3. **Caching**: Consider caching spell corrections for common misspellings

### Performance Metrics

- Spellfix lookup: ~1-5ms per term
- FTS search: ~5-50ms depending on corpus size
- Total fuzzy search: Usually < 100ms for typical queries

## Troubleshooting

### Common Issues

1. **"Spellfix extension not available"**

   - Ensure the migration has been run
   - Verify your SQLite build includes spellfix
   - For Turso, check extension support

2. **No spell corrections found**

   - Run the setup script to populate vocabulary
   - Check that your FTS index has content
   - Verify terms are being extracted correctly

3. **Poor correction quality**
   - Add domain-specific terms manually:
     ```typescript
     import { addWordsToSpellfixIndex } from '@/lib/db/spellfix-utils'
     await addWordsToSpellfixIndex(['protagonist', 'antagonist', 'campaign'])
     ```

### Debug Queries

```sql
-- Check spellfix vocabulary
SELECT COUNT(*) FROM spellfix_index_vocab;

-- Test spell correction manually
SELECT word FROM spellfix_index WHERE word MATCH 'protagnist' AND top=1;

-- Check FTS vocabulary
SELECT COUNT(*) FROM search_index_fts_aux WHERE col='*';
```

## Limitations

1. **Extension Dependency**: Requires spellfix extension availability
2. **English-focused**: Spellfix is optimized for English text
3. **Storage Overhead**: Additional vocabulary storage required
4. **Single Language**: No multi-language spell correction support

## Future Enhancements

- Configurable fuzzy matching thresholds
- Multi-language support
- Custom vocabulary management UI
- Performance monitoring and optimization
- Fallback strategies for environments without spellfix
