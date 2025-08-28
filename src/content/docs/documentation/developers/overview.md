---
title: 'Overview'
description: 'Complete guide to on the project structure and coding standards.'
sidebar:
  order: 1
---

# Development Guide

This document provides a comprehensive guide to understanding the project structure and coding standards.

:::tip[Quick Navigation]
New to the project? Start with the [Architecture Overview](./architecture) to understand the high-level system design.
:::

## Tech Stack

:::note[Technology Choices]
Our technology stack is carefully chosen to provide type safety, performance, and developer experience while building a scalable D&D campaign management platform.
:::

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
- **Prism.js** - Markdown styling and syntax highlighting
- **Showdown** - Markdown to HTML conversion

### UI Components

- **Radix UI** - Unstyled, accessible UI primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Tailwind Merge** - Utility for merging Tailwind classes

### Authentication & Analytics

:::caution[Third-Party Services]
These services require proper configuration and API keys for full functionality.
:::

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
├── docs/               # Documentation files
│   ├── change-log/     # Change log entries
|   |   ├── {yyyy-mm-dd-v0.0.0}/     # Individual change log files
│   ├── developers/     # Developer guides and references
│   ├── user-guide/     # User-facing documentation
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
│   ├── docs/           # Public documentation pages
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

- **Components**: PascalCase (`function UserProfile()`)
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

### Data Fetching Hooks

The project uses React Query for data fetching with custom hooks. Each different domain has its own hook file, which is imported from `@hooks/`. Within that file, you have some direct access functions, and some factory functions for creating hooks - this is for queries that need parameters, usually single-entity queries.

```tsx
// Hook naming convention: use[Entity]Queries()
const { useArcQuery, createArc, arcsQuery } = useArcQueries()
const { thingsQuery, modifyThing } = useThingQueries()

// For the factory functions, they should be used like this:
const arcQuery = useArcQuery(arcId)

// So now, we have access to all queries, and the now follow the same pattern.
const { data: arc, isLoading: isArcLoading } = arcQuery
const { data: arcs, isLoading: areArcsLoading } = arcsQuery

// And we can use mutations like this:
function handleUpdateArc(updatedArc: TArc) {
  modifyArc.mutate(updatedArc)
}
```

### Rich Text Editor (Slate.js)

The project uses Slate.js for rich text editing with markdown support:

```tsx
import MarkdownEditor from '@components/app/components/slate-handling/editor'

// Usage
;<MarkdownEditor
  initialValue={content}
  onChange={handleChange}
  height='md' // 'sm' | 'md' | 'lg'
/>
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
