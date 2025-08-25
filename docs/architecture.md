# Architecture Overview

ArcAide is built as a modern full-stack web application with server-side rendering capabilities. This document outlines the key architectural decisions and component structure.

## Technology Stack

### Frontend

- **Astro** - Meta-framework for static site generation with SSR capabilities
- **React** - Component library for interactive UI elements
- **Tailwind CSS** - Utility-first CSS framework
- **Slate.js** - Rich text editing framework for content creation
- **TanStack Query** - Data fetching and state management
- **Zustand** - Lightweight state management

### Backend

- **Astro API Routes** - Server-side API endpoints
- **Better Auth** - Authentication and session management
- **Drizzle ORM** - Type-safe database operations
- **Turso/LibSQL** - Distributed SQLite database

### Development & Operations

- **TypeScript** - Type safety across the entire stack
- **ESLint** - Code linting and quality enforcement
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit quality checks
- **PostHog** - Analytics and user behavior tracking
- **Honeybadger** - Error monitoring and reporting

## Application Structure

### Core Domain Models

```
Campaign
├── Arcs (Story Structures)
│   ├── Hook (Opening)
│   ├── Protagonist (Main Character)
│   ├── Antagonist (Opposition)
│   ├── Problem (Central Conflict)
│   ├── Key (Solution/Tool)
│   └── Outcome (Resolution)
├── Things (Campaign Entities)
│   ├── NPCs
│   ├── Locations
│   ├── Items
│   └── Plot Devices
└── Thing Types (Custom Categories)
```

### Database Schema

```sql
-- Core campaign management
campaigns (id, slug, name, description, user_id, created_at, updated_at)
arcs (id, slug, name, hook, protagonist, antagonist, problem, key, outcome, campaign_id, parent_arc_id)
thing_types (id, name, campaign_id)
things (id, slug, name, description, type_id, campaign_id)
arc_things (arc_id, thing_id) -- Many-to-many relationship

-- Authentication
users (id, name, email, email_verified, image, created_at, updated_at)
sessions (id, expires_at, token, user_id, created_at, updated_at)
accounts (id, provider, provider_account_id, user_id, access_token, refresh_token)
```

## Component Architecture

### Layout Structure

```
MainLayout (Global wrapper)
└── Screen Components (Page-level logic)
    └── Feature Components (Business logic)
        └── UI Components (Presentation)
```

### State Management

**Global State (Zustand)**

- Current campaign context
- User preferences
- UI state (modals, navigation)

**Server State (TanStack Query)**

- Campaign data
- Arc management
- Thing management
- Search results

**Local State (React hooks)**

- Form inputs
- Component-specific UI state
- Temporary data

### Data Flow

1. **Authentication**: Better Auth handles user sessions
2. **Authorization**: Middleware protects routes and API endpoints
3. **Data Fetching**: TanStack Query manages server state
4. **Mutations**: Optimistic updates with server synchronization
5. **Real-time Updates**: Automatic query invalidation

## Security Model

### Authentication

- Email/password authentication via Better Auth
- Session-based authentication with secure tokens
- Automatic session refresh and cleanup

### Authorization

- Route-level protection via Astro middleware
- API endpoint authentication checks
- User-scoped data access (campaigns belong to users)

### Data Protection

- SQL injection prevention via Drizzle ORM
- Input validation using Zod schemas
- Error boundary and monitoring via Honeybadger

## Performance Considerations

### Frontend Optimization

- **Astro Islands**: React components only hydrate when needed
- **Code Splitting**: Automatic component-level code splitting
- **Image Optimization**: Built-in Astro image optimization
- **Prefetching**: Intelligent link prefetching

### Backend Optimization

- **Database Indexing**: Strategic indexes on frequently queried fields
- **Query Optimization**: Efficient Drizzle ORM queries
- **Caching**: Browser caching for static assets

### Build Optimization

- **Tree Shaking**: Unused code elimination
- **Minification**: Production code compression
- **Asset Optimization**: CSS and JavaScript optimization

## Development Patterns

### API Design

- RESTful endpoints following convention
- Consistent error handling and response formats
- Input validation using Zod schemas
- Proper HTTP status codes

### Component Patterns

- Container/Presenter pattern for complex components
- Custom hooks for reusable logic
- Compound components for complex UI patterns
- Error boundaries for graceful error handling

### State Management Patterns

- Separate server state from client state
- Optimistic updates for better UX
- Proper loading and error states
- Cache invalidation strategies

## File Organization

```
src/
├── components/
│   ├── app/                 # Application components
│   │   ├── components/      # Feature-specific components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── screens/        # Page-level components
│   │   └── stores/         # Zustand stores
│   └── ui/                 # Reusable UI components
├── layouts/                # Astro layout components
├── lib/                    # Utilities and configurations
│   ├── auth/              # Authentication setup
│   ├── db/                # Database configuration
│   └── utils.ts           # Utility functions
├── pages/                 # Astro pages and API routes
│   ├── api/               # API endpoints
│   └── dashboard/         # Dashboard pages
└── styles/                # Global CSS styles
```

### Component Organization

Components within `src/components/app/components/` are organized by domain:

- **arc/** - Arc creation, editing, and display components
  - `create-arc/` - Arc creation dialog with form validation
- **campaign/** - Campaign listing and creation components
  - `campaign-list/` - Campaign grid display with navigation
  - `create-campaign/` - Campaign creation dialog
- **editor/** - Rich text editor using Slate.js with markdown support
  - Handles content conversion between Slate AST and plain text/HTML
- **search-bar/** - Search functionality with auto-complete and spell correction
  - Supports different search types (thing, arc, any)
  - Configurable return modes (navigation vs. function callback)
- **thing/** - Thing management, creation, and arc association
  - `create-thing/` - Thing creation dialog with type selection
  - `create-thing-type/` - Thing type creation dialog
  - `add-thing-to-arc/` - Component for associating things with arcs
  - `arc-list/` - Display arcs that contain a specific thing

### File Naming Conventions

- **Directories**: kebab-case (`create-thing/`)
- **Files**: kebab-case (`create-thing.tsx`)
- **Components**: PascalCase exports (`CreateThing`)
- **Organization**: Group related components in feature directories

Example structure:

```
components/thing/
├── create-thing/
│   └── create-thing.tsx
├── thing.tsx
└── arc-list/
    └── arc-list.tsx
```

### Rich Text Content Management

Content is stored as Slate.js AST and converted using utilities:

```tsx
import { slateToPlainText, slateToHtml } from '@utils/slate-text-extractor'

// For search indexing
const searchText = slateToPlainText(slateContent)

// For display rendering
const htmlContent = slateToHtml(slateContent)
```
