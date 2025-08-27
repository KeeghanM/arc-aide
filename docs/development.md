# Development Setup

This guide covers setting up your local development environment for ArcAide.

## Recent Major Changes (August 27, 2025)

### Component Architecture Updates

**Slate Editor Refactoring**

- Moved from `/components/editor/` to `/components/slate-handling/`
- Split into `editor.tsx` (interactive) and `viewer.tsx` (read-only)
- Updated all import paths throughout the application

**UI Component Changes**

- Removed theme toggle components in favor of mode toggle
- Added `ModeToggle` component for Edit/View mode switching
- Eliminated dark mode support for focused D&D theming

### Database Schema Changes

**Arc Model Enhancement**

- Added `notes` field for additional campaign information
- Added `notesText` field for search functionality
- Updated API endpoints to handle notes CRUD operations

### Global State Management

**App Store Updates**

```typescript
// New mode state in appStore.ts
interface IAppState {
  // ... existing state
  mode: 'edit' | 'view'
  setMode: (mode: 'edit' | 'view') => void
}
```

### Import Path Updates

Update your imports when working with these components:

```typescript
// Old import paths
import MarkdownEditor from '@components/app/components/editor/editor'
import { CustomEditor } from '@components/app/components/editor/custom-types'

// New import paths
import MarkdownEditor from '@components/app/components/slate-handling/editor'
import SlateViewer from '@components/app/components/slate-handling/viewer'
import { CustomEditor } from '@components/app/components/slate-handling/custom-types'
```

### CSS and Theming Changes

**Removed Dark Mode**

- Eliminated `.dark` CSS classes and variables
- Removed theme toggle functionality
- Simplified CSS custom properties

**Added D&D Theme System**

- New CSS custom properties for D&D colors
- Font declarations for official D&D typography
- Component styling classes (`.dnd-content`, `.dnd-statblock`, etc.)

### Migration Guide for Contributors

1. **Update Import Statements**

   ```bash
   # Find and replace editor imports
   find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|@components/app/components/editor/|@components/app/components/slate-handling/|g'
   ```

2. **Remove Theme Toggle References**

   - Remove any references to `RThemeToggle` or `theme-toggle.astro`
   - Replace with `ModeToggle` component where appropriate

3. **Update CSS Classes**

   - Remove `.dark:` prefixed classes
   - Use D&D theme classes for new components

4. **Database Migrations**
   - Run latest migrations to add `notes` and `notesText` fields
   - Update any arc-related queries to handle new fields

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
| `yarn docs`       | Generate git diff for documentation updates  |

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

Some code can be quite long, and comments can help break it up into logical sections. But, avoid over-commenting & self-descriptive code is preferred.

```tsx
// Good: Section comments
// --- Form validation ---
const isValid = validateForm(data)
if (!isValid) {
  setError('Invalid form data')
  return
}

// --- API call ---
const response = await api.submitForm(data)
if (response.error) {
  setError(response.error)
  return
}

// --- Success handling ---
setSuccess(true)
```

### Component Size && DRY Code

Dry is good, but we like DRY-3. AKA, once you go to write something for the 3rd time, consider refactoring it into a reusable function or component.

File size is not always a good indicator of complexity, some files are just long and that's that.

However, as a general rule of thumb, try to keep components under 300 lines. If you find yourself going over this, consider breaking it down into smaller sub-components or extracting logic into custom hooks.

### Guard Clauses

Prefer early returns to reduce nesting:

```tsx
// Good: Early return
if (!data) {
  return <div>Loading...</div>
}

// Main logic
return <div>{data.content}</div>
```

This also applies to functions and error handling:

```tsx
function fetchData() {
  if (!isAuthenticated) {
    throw new Error('User not authenticated')
  }

  if (!api) {
    throw new Error('API client not initialized')
  }

  // Fetch data logic
  return api.getData()
}
```

We use Zod wherever possible for input validation to avoid manual checks. This should be done as close to the input source as possible (e.g., API route, form submission), and as high up the function as a guard clause.

```tsx
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(0, 'Age must be positive'),
})
const result = schema.safeParse(input)
if (!result.success) {
  throw new Error('Invalid input data')
}
const { name, age } = result.data
```

### Destructuring

We prefer to destructure objects and arrays for cleaner code:

```tsx
// Good: Destructuring
const { name, age } = user
const [firstItem, secondItem] = items

// Bad: Direct property access
const name = user.name
const firstItem = items[0]
```

This also applies to function parameters:

```tsx
// Good: Destructured parameters
function UserProfile({
  user,
  onUpdate,
}: {
  user: TUser
  onUpdate: (user: TUser) => void
}) {
  // Component logic
}
// Bad: Direct parameter access
function UserProfile(props: { user: TUser; onUpdate: (user: TUser) => void }) {
  const user = props.user
  const onUpdate = props.onUpdate
  // Component logic
}
```

While there a some exceptions, these should be rare and justified - using comments to explain why.

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Files**: kebab-case (`user-profile.tsx`)
- **Variables/Functions**: camelCase (`getUserProfile`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)

### Component Structure

```tsx
// External imports (alphabetized)
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

// Internal imports (alphabetized, grouped by type)
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

The project uses React Query for data fetching with custom hooks. Recent updates have simplified and improved the hook APIs:

```tsx
// Hook naming convention: use[Entity]Query or use[Entity]Queries
const { useArcQuery, createArc, modifyArc } = useArcQueries()
const { useSearchQuery } = useSearchQueries()

// Updated Thing hooks - now with parameter object for better flexibility
const { useThingsQuery } = useThingQueries()

// Usage examples:
const arcQuery = useArcQuery(arcSlug)
const searchResults = useSearchQuery(searchTerm, 'thing')

// Things query with new parameter object API
const thingsQuery = useThingsQuery({ count: 20 }) // Paginated
const allThingsQuery = useThingsQuery({ fetchAll: true }) // All things

// Thing Types query - simplified API using campaign from store
const { thingTypesQuery } = useThingTypeQueries()
// No need to pass campaignSlug - automatically uses current campaign
```

**Hook API Improvements:**

- **useThingsQuery**: Now accepts parameter object `{ count: number }` or `{ fetchAll: true }`
- **useThingTypeQueries**: Simplified to return `thingTypesQuery` directly (no function call needed)
- **Automatic Campaign Context**: Hooks now automatically use campaign from app store where applicable
- **Better Type Safety**: Improved TypeScript types for all hook responses

**Migration Notes:**

```tsx
// Before (deprecated)
const thingTypes = useThingTypesQuery(campaignSlug!)
const things = useThingsQuery(20)

// After (current)
const { thingTypesQuery } = useThingTypeQueries()
const thingsQuery = useThingsQuery({ count: 20 })
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
