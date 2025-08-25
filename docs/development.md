# Development Setup

This guide covers setting up your local development environment for ArcAide.

## Prerequisites

- **Node.js** (v18 or higher)
- **Yarn** (recommended) or npm
- **Git**

## Initial Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd arc-aide
   ```

2. **Install dependencies**

   ```bash
   yarn install
   # or
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   ```

   Configure the following environment variables:

   ```bash
   # Database
   TURSO_DATABASE_URL="file:local.db"
   TURSO_AUTH_TOKEN=""

   # Authentication
   BETTER_AUTH_SECRET="your-auth-secret"
   BETTER_AUTH_URL="http://localhost:4321"

   # Email (optional for local development)
   RESEND_API_KEY=""

   # Analytics & Monitoring (optional for local development)
   PUBLIC_HONEYBADGER_KEY=""
   PUBLIC_POSTHOG_KEY=""
   PUBLIC_POSTHOG_HOST=""
   ```

4. **Database setup**

   ```bash
   yarn migrate:db
   ```

5. **Start development server**
   ```bash
   yarn dev
   ```

Your application will be available at `http://localhost:4321`

## Key Dependencies

### Core Framework

- **Astro** - Meta-framework for content-focused websites
- **React** - UI library for interactive components
- **TypeScript** - Type safety and enhanced developer experience

### Data & State Management

- **Drizzle ORM** - Type-safe database access
- **Turso/LibSQL** - Serverless SQLite database
- **TanStack Query** - Server state management and caching
- **Zustand** - Lightweight client state management

### Rich Text Editing

- **Slate.js** - Highly customizable rich text editor framework
- **Showdown** - Markdown to HTML conversion
- **@slate-serializers/html** - Slate.js HTML serialization
- **Prism.js** - Syntax highlighting for code blocks

### UI Components

- **Radix UI** - Unstyled, accessible UI primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Tailwind Merge** - Utility for merging Tailwind classes

### Authentication & Analytics

- **Better Auth** - Modern authentication library
- **PostHog** - Product analytics and feature flags
- **Honeybadger** - Error monitoring and reporting

## Development Commands

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `yarn dev`        | Start development server                     |
| `yarn build`      | Build for production                         |
| `yarn preview`    | Preview production build                     |
| `yarn qa`         | Run all quality checks (lint, style, format) |
| `yarn qa:fix`     | Auto-fix quality issues                      |
| `yarn migrate:db` | Run database migrations                      |

## Project Structure

```
src/
├── components/           # React components
│   ├── app/             # Application-specific components
│   │   ├── components/  # Feature components (organized by domain)
│   │   │   ├── arc/     # Arc-related components
│   │   │   ├── campaign/ # Campaign-related components
│   │   │   ├── editor/  # Rich text editor components
│   │   │   ├── search-bar/ # Search functionality
│   │   │   └── thing/   # Thing-related components
│   │   ├── hooks/       # React hooks for data fetching
│   │   ├── screens/     # Page-level components
│   │   └── stores/      # Global state management
│   └── ui/              # Reusable UI components
├── layouts/             # Astro layouts
├── lib/                 # Utilities and configurations
│   ├── auth/           # Authentication setup
│   ├── db/             # Database configuration
│   └── utils/          # Utility functions
│       ├── slate-text-extractor.ts # Slate.js content conversion
│       └── string.ts   # String manipulation utilities
├── pages/              # Astro pages and API routes
│   ├── api/            # API endpoints
│   ├── auth/           # Authentication pages
│   └── dashboard/      # Dashboard pages
└── styles/             # Global styles
```

## Code Style Guidelines

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Files**: kebab-case (`user-profile.tsx`)
- **Variables/Functions**: camelCase (`getUserProfile`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)

### Component Structure

```tsx
// External imports first
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// Internal imports grouped by type
import { Button } from '@components/ui/button'
import { useAppStore } from '@stores/appStore'
import type { TCampaign } from '@hooks/useCampaignQueries'

// Types defined near usage
type TProps = {
  campaign: TCampaign
  onUpdate: (campaign: TCampaign) => void
}

// Component with descriptive name
export default function CampaignEditor({ campaign, onUpdate }: TProps) {
  // Hooks at the top
  const [isEditing, setIsEditing] = useState(false)

  // Early returns for loading/error states
  if (!campaign) {
    return <div>Loading...</div>
  }

  // Main component logic
  return <div>{/* Component JSX */}</div>
}
```

### Import Path Aliases

The project uses several TypeScript path aliases for cleaner imports:

- `@components/*` - UI and app components
- `@db/*` - Database schema and utilities
- `@auth/*` - Authentication configuration
- `@hooks/*` - React hooks for data fetching
- `@stores/*` - Global state management (Zustand stores)
- `@utils/*` - Utility functions

For detailed component organization and architecture patterns, see [Architecture documentation](./architecture.md).

### Data Fetching Hooks

The project uses React Query for data fetching with custom hooks:

```tsx
// Hook naming convention: use[Entity]Query or use[Entity]Queries
const { useArcQuery, createArc, modifyArc } = useArcQueries()
const { useSearchQuery } = useSearchQueries()

// Usage in components
const arcQuery = useArcQuery(arcSlug)
const searchResults = useSearchQuery(searchTerm, 'thing')
```

### Rich Text Editor (Slate.js)

The project uses Slate.js for rich text editing with markdown support. See the [Architecture documentation](./architecture.md) for detailed component information and the [Search documentation](./search.md) for search-related functionality.

```tsx
import MarkdownEditor from '@components/app/components/editor/editor'

// Usage
;<MarkdownEditor
  initialValue={content}
  onChange={handleChange}
  height='md' // 'sm' | 'md' | 'lg'
/>
```

Content conversion utilities are documented in the [Architecture guide](./architecture.md#rich-text-content-management).

### Comments

Use comments to explain **why** something is done, not **what** is done:

```tsx
// Good: Explains reasoning
// We debounce the save to avoid excessive API calls while typing
const debouncedSave = useMemo(() => debounce(handleSave, 1000), [])

// Bad: States the obvious
// Set loading to true
setLoading(true)
```

## Database Development

### Schema Changes

1. Modify `src/lib/db/schema.ts`
2. Run `yarn migrate:db` to apply changes
3. Update TypeScript types if needed

### Adding New Tables

```typescript
// src/lib/db/schema.ts
export const newTable = sqliteTable('new_table', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// Add relations if needed
export const newTableRelations = relations(newTable, ({ one, many }) => ({
  // Define relationships here
}))
```

## Testing

Currently, the project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **Stylelint** for CSS linting

Run quality checks:

```bash
yarn qa        # Check all
yarn qa:fix    # Fix auto-fixable issues
```

Currently, the project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **Stylelint** for CSS linting

Run quality checks:

```bash
yarn qa        # Check all
yarn qa:fix    # Fix auto-fixable issues
```

## Common Issues

### Database Connection Issues

- Ensure `TURSO_DATABASE_URL` is set correctly
- For local development, use `file:local.db`
- Run `yarn migrate:db` if tables are missing

### Authentication Issues

- Verify `BETTER_AUTH_SECRET` is set
- Check `BETTER_AUTH_URL` matches your local URL
- Clear browser cookies if login fails

### Build Issues

- Clear `.astro` directory: `rm -rf .astro`
- Reinstall dependencies: `rm -rf node_modules && yarn install`
- Check for TypeScript errors: `yarn build`

### Rich Text Editor Issues

- If Slate.js content appears malformed, check the initial value structure
- Ensure `slateToPlainText` is used for search indexing, not raw JSON
- For display purposes, use `slateToHtml` to properly render markdown content

### Search Functionality Issues

- Search results not appearing: Check that content has been properly indexed with `descriptionText`, `hookText`, etc.
- Spell correction not working: Ensure the spellfix extension is properly loaded in your SQLite setup
- Performance issues: Consider adding more specific search types (`thing`, `arc`) instead of using `any`

### Component Import Issues

- Use the TypeScript path aliases (`@stores/`, `@hooks/`, etc.) instead of relative imports
- If imports fail, check that the alias is defined in `tsconfig.json`
- Ensure component files follow the naming convention (kebab-case files, PascalCase exports)
