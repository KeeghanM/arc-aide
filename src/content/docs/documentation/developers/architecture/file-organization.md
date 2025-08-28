---
title: 'File Organization'
description: 'Project structure, naming conventions, and code organization principles.'
---

# File Organization

ArcAide follows a structured approach to file organization that promotes maintainability, scalability, and developer productivity.

## Project Structure Overview

```
arc-aide/
├── .env                          # Environment variables
├── .gitignore                    # Git ignore patterns
├── astro.config.ts              # Astro configuration
├── drizzle.config.ts            # Database configuration
├── package.json                 # Dependencies and scripts
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── docs/                        # Documentation
├── migrations/                  # Database migrations
├── public/                      # Static assets
└── src/                         # Source code
```

## Source Code Organization

### Top-Level Structure

```
src/
├── components/                  # React components
│   ├── app/                    # Application-specific components
│   └── ui/                     # Reusable UI components
├── content/                    # Content collections (if used)
├── layouts/                    # Astro layout components
├── lib/                        # Utility libraries and configurations
├── pages/                      # Astro pages and API routes
└── styles/                     # Global styles
```

### Component Organization

#### Application Components (`src/components/app/`)

```
src/components/app/
├── components/                 # Feature components
│   ├── arc/                   # Arc-related components
│   │   ├── arc-card.tsx
│   │   ├── arc-editor.tsx
│   │   ├── arc-form.tsx
│   │   ├── arc-hierarchy.tsx
│   │   ├── arc-list.tsx
│   │   ├── arc-section.tsx
│   │   └── arc-viewer.tsx
│   ├── campaign/              # Campaign components
│   │   ├── campaign-card.tsx
│   │   ├── campaign-form.tsx
│   │   ├── campaign-list.tsx
│   │   └── campaign-settings.tsx
│   ├── search-bar/            # Search functionality
│   │   ├── search-bar.tsx
│   │   ├── search-results.tsx
│   │   └── search-item.tsx
│   ├── side-bar/              # Navigation sidebar
│   │   ├── side-bar.tsx
│   │   ├── nav-item.tsx
│   │   └── nav-section.tsx
│   ├── slate-handling/        # Rich text editor
│   │   ├── slate-editor.tsx
│   │   ├── slate-viewer.tsx
│   │   ├── slate-elements.tsx
│   │   ├── slate-leaves.tsx
│   │   └── link-plugin.tsx
│   └── thing/                 # Thing management
│       ├── thing-card.tsx
│       ├── thing-editor.tsx
│       ├── thing-form.tsx
│       ├── thing-list.tsx
│       └── thing-type-manager.tsx
├── hooks/                     # Custom React hooks
│   ├── use-app-store.ts
│   ├── use-campaign.ts
│   ├── use-arcs.ts
│   ├── use-things.ts
│   ├── use-search.ts
│   └── use-debounce.ts
├── screens/                   # Page-level components
│   ├── campaign-screen.tsx
│   ├── arc-screen.tsx
│   ├── thing-screen.tsx
│   └── dashboard-screen.tsx
├── stores/                    # Zustand state stores
│   ├── app-store.ts
│   ├── search-store.ts
│   └── editor-store.ts
└── screen-wrapper.tsx         # Common screen wrapper
```

#### UI Components (`src/components/ui/`)

```
src/components/ui/
├── button.tsx                 # Button component
├── card.tsx                   # Card container
├── dialog.tsx                 # Modal dialogs
├── dropdown-menu.tsx          # Dropdown menus
├── input.tsx                  # Form inputs
├── label.tsx                  # Form labels
├── select.tsx                 # Select dropdowns
├── textarea.tsx               # Text areas
├── toast.tsx                  # Toast notifications
├── tooltip.tsx                # Tooltips
├── loading-spinner.tsx        # Loading indicators
├── error-boundary.tsx         # Error boundaries
├── mode-toggle.tsx            # View/Edit mode toggle
├── saving-spinner.tsx         # Auto-save indicator
└── time-ago.tsx              # Relative time display
```

### Library Organization (`src/lib/`)

```
src/lib/
├── auth/                      # Authentication
│   ├── config.ts             # Better Auth configuration
│   ├── middleware.ts         # Auth middleware
│   └── utils.ts              # Auth utilities
├── db/                       # Database
│   ├── index.ts              # Database connection
│   ├── schema.ts             # Drizzle schema
│   ├── migrations.ts         # Migration utilities
│   └── queries.ts            # Common queries
├── validation/               # Input validation
│   ├── schemas.ts            # Zod schemas
│   └── types.ts              # TypeScript types
├── utils/                    # Utility functions
│   ├── index.ts              # Main utilities
│   ├── slug.ts               # Slug generation
│   ├── date.ts               # Date utilities
│   ├── text.ts               # Text processing
│   └── api.ts                # API utilities
├── hooks/                    # Shared hooks
│   ├── use-query-client.ts   # Query client setup
│   └── use-local-storage.ts  # Local storage hook
├── analytics/                # Analytics integration
│   ├── posthog.ts            # PostHog setup
│   └── events.ts             # Event tracking
├── monitoring/               # Error monitoring
│   ├── honeybadger.ts        # Honeybadger setup
│   └── error-utils.ts        # Error utilities
└── constants/                # Application constants
    ├── routes.ts             # Route definitions
    ├── config.ts             # App configuration
    └── defaults.ts           # Default values
```

### Page Organization (`src/pages/`)

```
src/pages/
├── index.astro               # Homepage
├── dashboard/                # Dashboard pages
│   ├── index.astro          # Dashboard overview
│   └── settings.astro       # User settings
├── auth/                    # Authentication pages
│   ├── signin.astro         # Sign in page
│   ├── signup.astro         # Sign up page
│   └── verify-email.astro   # Email verification
├── campaign/                # Campaign pages
│   ├── [slug]/              # Dynamic campaign routes
│   │   ├── index.astro      # Campaign overview
│   │   ├── arcs/            # Arc management
│   │   │   ├── index.astro  # Arc list
│   │   │   └── [arcSlug].astro # Individual arc
│   │   ├── things/          # Thing management
│   │   │   ├── index.astro  # Thing list
│   │   │   └── [thingSlug].astro # Individual thing
│   │   └── settings.astro   # Campaign settings
│   └── new.astro           # Create campaign
└── api/                    # API routes
    ├── auth/               # Authentication endpoints
    ├── campaigns/          # Campaign API
    │   ├── index.ts       # List/create campaigns
    │   └── [slug]/        # Campaign-specific APIs
    │       ├── index.ts   # Get/update/delete campaign
    │       ├── arcs/      # Arc management
    │       │   ├── index.ts
    │       │   └── [arcSlug].ts
    │       ├── things/    # Thing management
    │       │   ├── index.ts
    │       │   └── [thingSlug].ts
    │       ├── thing-types/
    │       │   ├── index.ts
    │       │   └── [typeId].ts
    │       └── search.ts  # Search endpoint
    └── health.ts          # Health check
```

## Naming Conventions

### File Naming

#### Components

```
// React components - PascalCase
ArcEditor.tsx
CampaignList.tsx
SearchBar.tsx

// Astro components - kebab-case
main-layout.astro
campaign-screen.astro
error-404.astro
```

#### Utilities and Libraries

```
// Utility files - kebab-case
slug-generator.ts
date-utils.ts
api-client.ts

// Configuration files - kebab-case
auth-config.ts
db-schema.ts
query-client.ts
```

#### API Routes

```
// API endpoints follow REST conventions
/api/campaigns              # GET, POST
/api/campaigns/[slug]       # GET, PUT, DELETE
/api/campaigns/[slug]/arcs  # GET, POST
/api/campaigns/[slug]/arcs/[arcSlug]  # GET, PUT, DELETE
```

### Variable and Function Naming

#### TypeScript Conventions

```typescript
// Variables and functions - camelCase
const campaignSlug = 'my-campaign'
const userData = await fetchUser()
function generateSlug(name: string): string

// Constants - SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.arcaide.com'
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024

// Types and interfaces - PascalCase
interface Campaign {
  id: number
  slug: string
  name: string
}

type CreateCampaignRequest = {
  newCampaign: Pick<Campaign, 'name'>
}

// Enums - PascalCase
enum ThingType {
  NPC = 'npc',
  Location = 'location',
  Item = 'item',
}
```

#### Component Props

```typescript
// Props interfaces follow ComponentNameProps pattern
interface ArcEditorProps {
  arc: Arc
  onSave: (arc: Arc) => void
  isLoading?: boolean
}

interface SearchBarProps {
  campaignSlug: string
  onSelect: (result: SearchResult) => void
  placeholder?: string
}
```

## Import Organization

### Import Order

```typescript
// 1. External libraries
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { z } from 'zod'

// 2. Internal utilities and libraries
import { cn } from '@/lib/utils'
import { validateCampaign } from '@/lib/validation'
import { useAppStore } from '@/lib/stores'

// 3. Component imports
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArcForm } from '@/components/app/arc/arc-form'

// 4. Type imports (use type-only imports when possible)
import type { Arc, Campaign } from '@/lib/types'
import type { ComponentProps } from 'react'
```

### Path Aliases

```typescript
// tsconfig.json configuration
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  }
}

// Usage in imports
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/stores/app-store'
import { getCampaign } from '@/lib/db/queries'
```

## Code Organization Principles

### Single Responsibility

Each file should have a single, well-defined purpose:

```typescript
// ❌ Mixed responsibilities
// components/campaign-arc-thing-manager.tsx

// ✅ Single responsibility
// components/campaign/campaign-editor.tsx
// components/arc/arc-list.tsx
// components/thing/thing-form.tsx
```

### Domain-Driven Organization

Group related functionality by domain:

```
// Group by feature/domain
src/components/app/arc/
src/components/app/campaign/
src/components/app/thing/

// Not by technical layer
src/components/forms/
src/components/lists/
src/components/editors/
```

### Consistent Directory Structure

Maintain consistent patterns across similar features:

```
// Each feature follows the same pattern
components/app/arc/
├── arc-card.tsx        # List item component
├── arc-editor.tsx      # Editing component
├── arc-form.tsx        # Form component
├── arc-list.tsx        # List container
└── arc-viewer.tsx      # Display component

components/app/thing/
├── thing-card.tsx      # List item component
├── thing-editor.tsx    # Editing component
├── thing-form.tsx      # Form component
├── thing-list.tsx      # List container
└── thing-viewer.tsx    # Display component
```

### Export Patterns

#### Named Exports (Preferred)

```typescript
// Explicit and tree-shakable
export function ArcEditor({ arc }: ArcEditorProps) {
  // component implementation
}

export function ArcCard({ arc }: ArcCardProps) {
  // component implementation
}

// Import with destructuring
import { ArcEditor, ArcCard } from './components/arc'
```

#### Index Files for Convenience

```typescript
// components/arc/index.ts
export { ArcEditor } from './arc-editor'
export { ArcCard } from './arc-card'
export { ArcForm } from './arc-form'
export { ArcList } from './arc-list'
export { ArcViewer } from './arc-viewer'

// Simplified imports
import { ArcEditor, ArcCard } from '@/components/arc'
```

This file organization structure promotes maintainability, enables efficient development workflows, and scales well as the application grows in complexity.
