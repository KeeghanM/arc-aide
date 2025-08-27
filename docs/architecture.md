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
│   ├── Outcome (Resolution)
│   ├── Notes (Additional Information & Campaign Context)
│   ├── Parent/Child Relationships (Hierarchical Structure)
│   └── Search Text Fields (Plain Text for FTS)
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
arcs (id, slug, name, hook, protagonist, antagonist, problem, key, outcome, notes,
      hook_text, protagonist_text, antagonist_text, problem_text, key_text, outcome_text, notes_text,
      campaign_id, parent_arc_id, created_at, updated_at)
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
- User preferences and settings
- UI state (modals, navigation)
- **View/Edit Mode**: Global mode toggle between editing and reading modes
  - Edit Mode: Full editing interface with toolbars and multi-column layout
  - View Mode: Clean D&D-themed presentation optimized for reading/sharing

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
  - `arc-item.tsx` - Individual arc display card component (renamed from `arc.tsx` for clarity)
  - `create-arc/` - Arc creation dialog with form validation
  - `parent-arc/` - Component for displaying and managing parent arc relationships
- **campaign/** - Campaign listing and creation components
  - `campaign-list/` - Campaign grid display with navigation
  - `create-campaign/` - Campaign creation dialog
  - `campaign-settings/` - Campaign configuration and management
- **slate-handling/** - Rich text editor and viewer components using Slate.js
  - `editor.tsx` - Interactive editing interface with markdown support and internal linking
  - `viewer.tsx` - Read-only content presentation with D&D theming
  - `custom-types.d.ts` - Shared TypeScript definitions for Slate content
  - Handles content conversion between Slate AST and plain text/HTML
  - Implements internal linking system with `[[...]]` syntax
  - Integrates SearchBar component for inline entity selection
- **search-bar/** - Search functionality with auto-complete and spell correction
  - Supports different search types (thing, arc, any)
  - Configurable return modes (navigation vs. function callback)
- **side-bar/** - Navigation sidebar component for dashboard pages
  - Persistent navigation across campaign, arc, and thing pages
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

Content is stored as Slate.js AST and rendered using specialized components:

```tsx
import MarkdownEditor from '@components/app/components/slate-handling/editor'
import SlateViewer from '@components/app/components/slate-handling/viewer'
import { slateToPlainText, slateToHtml } from '@utils/slate-text-extractor'

// For editing
<MarkdownEditor
  initialValue={content}
  onChange={handleChange}
  height="lg"
/>

// For display
<SlateViewer content={content} />

// For search indexing
const searchText = slateToPlainText(slateContent)
```

#### Content Presentation Modes

- **Editor Mode**: Interactive Slate.js editor with full formatting capabilities
- **Viewer Mode**: Read-only presentation with D&D theming and typography
- **Mode Toggle**: Global state controls which interface users see

### Internal Linking System

The rich text editor supports wiki-style internal linking using `[[...]]` syntax:

#### Custom Slate Types

```typescript
interface CustomText {
  text: string
  // Existing formatting properties...

  // Link properties
  link?: true
  linkSlug?: string | undefined
  linkType?: 'arc' | 'thing' | undefined
  linkSearch?: boolean
  linkRange?: { path: number[]; offset: number; length: number }
}
```

#### Link Detection and Rendering

- **Regex Pattern**: `/\[\[([^\]]*)\]\]/g` detects link syntax during decoration
- **Search Trigger**: Empty brackets `[[]]` activate SearchBar component
- **Link Resolution**: Format `[[type#slug]]` creates navigational links
- **Text Replacement**: Slate Transforms API updates content when links are selected

#### Integration Points

- **SearchBar Component**: Provides entity selection interface
- **App Store**: Supplies campaign context for link generation
- **Navigation**: Links route to appropriate campaign pages

## Theme and Design System

### D&D 5e Visual Design

ArcAide uses a dedicated D&D 5e-inspired theme system designed for tabletop RPG content:

#### Typography Hierarchy

- **Bookinsanity**: Primary serif font for body content and narratives
- **Mr Eaves Small Caps**: Headers, titles, and section dividers
- **Zatanna Misdirection**: Spell names and magical content styling
- **Nodesto Caps Condensed**: Stat block headers and monster names
- **Scaly Sans**: Tables, stats, and compact information display
- **Solbera Imitation**: Drop cap styling for special content
- **Dungeon Drop Case**: Alternative drop cap styling

#### Color Palette (Homebrewery-inspired)

```css
:root {
  --HB_Color_Background: #eee5ce; /* Parchment base */
  --HB_Color_Accent: #e0e5c1; /* Subtle highlights */
  --HB_Color_HeaderUnderline: #c0ad6a; /* Section dividers */
  --HB_Color_HorizontalRule: #9c2b1b; /* Strong dividers */
  --HB_Color_HeaderText: #58180d; /* Headers and titles */
  --HB_Color_MonsterStatBackground: #f2e5b5; /* Stat blocks */
  --HB_Color_CaptionText: #766649; /* Subtle text */
  --HB_Color_WatercolorStain: #bbad82; /* Decorative elements */
  --HB_Color_Footnotes: #c9ad6a; /* Footer content */
}
```

#### Component Styling

**Content Areas**

- Parchment background textures from `/images/parchmentBackground.jpg`
- Proper padding and margins for print-like appearance
- Rounded corners with subtle shadows

**Stat Blocks**

- Bordered containers with appropriate spacing
- Monster stat formatting with official D&D styling
- Table layouts for ability scores and stats

**Typography Elements**

- Section headers with underline styling
- Blockquotes with accent backgrounds
- Code blocks with subtle background highlighting

### UI/UX Patterns

#### Mode System

- **Edit Mode**: Traditional interface optimized for content creation
  - Multi-column layouts for efficiency
  - Full toolbar access and formatting options
  - Real-time auto-save functionality
- **View Mode**: Presentation interface optimized for reading/sharing
  - Single-column narrative flow
  - D&D-themed styling throughout
  - Minimal UI chrome for distraction-free reading

#### Layout Adaptation

```tsx
const { mode } = useAppStore()

<div className={cn(
  'grid grid-cols-1 gap-4',
  mode === 'edit' && 'md:grid-cols-2'
)}>
  {mode === 'view' ? (
    <SlateViewer content={consolidatedContent} />
  ) : (
    <EditingSections />
  )}
</div>
```

#### Design Principles

1. **Authenticity**: Visual design matches official D&D 5e materials
2. **Functionality**: Mode system serves both creators and consumers
3. **Accessibility**: Proper contrast ratios and readable typography
4. **Performance**: Optimized font loading and minimal CSS overhead
5. **Consistency**: Unified visual language across all content types
