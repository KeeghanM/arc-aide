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
│   │   ├── components/  # Feature components
│   │   ├── hooks/       # React hooks
│   │   └── screens/     # Page-level components
│   └── ui/              # Reusable UI components
├── layouts/             # Astro layouts
├── lib/                 # Utilities and configurations
│   ├── auth/           # Authentication setup
│   ├── db/             # Database configuration
│   └── utils.ts        # Utility functions
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
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/components/app/stores/appStore'
import type { TCampaign } from '@/hooks/useCampaignQueries'

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

## API Development

### Creating New Endpoints

API routes follow the file-based routing pattern in `src/pages/api/`:

```typescript
// src/pages/api/example.ts
import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db/db'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ request }) => {
  try {
    // Always check authentication for protected routes
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    // Your logic here
    const data = await db.select().from(someTable)

    return new Response(JSON.stringify(data), { status: 200 })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}
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
