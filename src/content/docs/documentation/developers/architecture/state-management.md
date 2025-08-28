---
title: 'State Management'
description: 'Data flow patterns, state management solutions, and data synchronization strategies.'
---

# State Management

ArcAide uses a hybrid approach to state management, separating server state from client state for optimal performance and developer experience.

## State Architecture Overview

### State Categories

1. **Server State** - Data from the database (campaigns, arcs, things)
2. **Client State** - UI state and user preferences
3. **Form State** - Temporary form inputs and validation
4. **Cache State** - Optimized data access and synchronization

### Technology Stack

- **TanStack Query** - Server state management and caching
- **Zustand** - Client state management
- **React Hook Form** - Form state management
- **Local Storage** - Persistent client preferences

## Server State Management

### TanStack Query Integration

Server state is managed through TanStack Query for automatic caching, background refetching, and optimistic updates.

#### Query Configuration

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})
```

#### Custom Query Hooks

```typescript
// hooks/use-campaign.ts
export function useCampaign(campaignSlug: string) {
  return useQuery({
    queryKey: ['campaign', campaignSlug],
    queryFn: () => fetchCampaign(campaignSlug),
    enabled: !!campaignSlug,
  })
}

export function useArcs(campaignSlug: string) {
  return useQuery({
    queryKey: ['arcs', campaignSlug],
    queryFn: () => fetchArcs(campaignSlug),
    enabled: !!campaignSlug,
  })
}

export function useThings(campaignSlug: string, options?: { count?: number }) {
  return useQuery({
    queryKey: ['things', campaignSlug, options],
    queryFn: () => fetchThings(campaignSlug, options),
    enabled: !!campaignSlug,
  })
}
```

#### Mutation Hooks

```typescript
// hooks/use-arc-mutations.ts
export function useCreateArc(campaignSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (newArc: CreateArcRequest) => createArc(campaignSlug, newArc),
    onSuccess: () => {
      // Invalidate and refetch arcs list
      queryClient.invalidateQueries(['arcs', campaignSlug])
    },
    onError: (error) => {
      toast.error('Failed to create arc: ' + error.message)
    },
  })
}

export function useUpdateArc(campaignSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      arcSlug,
      updates,
    }: {
      arcSlug: string
      updates: Partial<Arc>
    }) => updateArc(campaignSlug, arcSlug, updates),
    onMutate: async ({ arcSlug, updates }) => {
      // Optimistic update
      await queryClient.cancelQueries(['arc', campaignSlug, arcSlug])

      const previousArc = queryClient.getQueryData([
        'arc',
        campaignSlug,
        arcSlug,
      ])

      queryClient.setQueryData(['arc', campaignSlug, arcSlug], (old: Arc) => ({
        ...old,
        ...updates,
      }))

      return { previousArc }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousArc) {
        queryClient.setQueryData(
          ['arc', variables.campaignSlug, variables.arcSlug],
          context.previousArc
        )
      }
      toast.error('Failed to update arc: ' + error.message)
    },
    onSettled: (data, error, { arcSlug }) => {
      // Always refetch after mutation
      queryClient.invalidateQueries(['arc', campaignSlug, arcSlug])
      queryClient.invalidateQueries(['arcs', campaignSlug])
    },
  })
}
```

### Data Invalidation Strategy

Strategic cache invalidation for data consistency:

```typescript
// When creating new content
const onCreateSuccess = (type: 'arc' | 'thing', campaignSlug: string) => {
  queryClient.invalidateQueries([type + 's', campaignSlug])
  queryClient.invalidateQueries(['search', campaignSlug]) // Invalidate search cache
}

// When updating content
const onUpdateSuccess = (
  type: 'arc' | 'thing',
  campaignSlug: string,
  slug: string
) => {
  queryClient.invalidateQueries([type, campaignSlug, slug])
  queryClient.invalidateQueries([type + 's', campaignSlug])
  queryClient.invalidateQueries(['search', campaignSlug])
}

// When deleting content
const onDeleteSuccess = (type: 'arc' | 'thing', campaignSlug: string) => {
  queryClient.invalidateQueries([type + 's', campaignSlug])
  queryClient.invalidateQueries(['search', campaignSlug])
  // Remove specific cache entries
  queryClient.removeQueries([type, campaignSlug])
}
```

## Client State Management

### Zustand Store

Global client state for UI preferences and application state:

```typescript
// stores/app-store.ts
interface AppState {
  // View/Edit mode toggle
  mode: 'edit' | 'view'
  setMode: (mode: 'edit' | 'view') => void

  // Current campaign context
  currentCampaign: string | null
  setCurrentCampaign: (slug: string | null) => void

  // UI state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  // User preferences
  preferences: UserPreferences
  updatePreferences: (preferences: Partial<UserPreferences>) => void
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  autoSave: boolean
  compactMode: boolean
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      mode: 'edit',
      setMode: (mode) => set({ mode }),

      currentCampaign: null,
      setCurrentCampaign: (slug) => set({ currentCampaign: slug }),

      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      preferences: {
        theme: 'system',
        autoSave: true,
        compactMode: false,
      },
      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),
    }),
    {
      name: 'arcaide-app-state',
      // Only persist certain keys
      partialize: (state) => ({
        mode: state.mode,
        preferences: state.preferences,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
```

### Search State Management

Dedicated store for search functionality:

```typescript
// stores/search-store.ts
interface SearchState {
  // Current search query
  query: string
  setQuery: (query: string) => void

  // Search results
  results: SearchResult[]
  setResults: (results: SearchResult[]) => void

  // Search UI state
  isOpen: boolean
  setIsOpen: (open: boolean) => void

  // Recent searches
  recentSearches: string[]
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: '',
      setQuery: (query) => set({ query }),

      results: [],
      setResults: (results) => set({ results }),

      isOpen: false,
      setIsOpen: (open) => set({ isOpen: open }),

      recentSearches: [],
      addRecentSearch: (query) => {
        const { recentSearches } = get()
        const filtered = recentSearches.filter((q) => q !== query)
        set({
          recentSearches: [query, ...filtered].slice(0, 10), // Keep only 10 recent
        })
      },
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'arcaide-search-state',
      partialize: (state) => ({
        recentSearches: state.recentSearches,
      }),
    }
  )
)
```

## Form State Management

### React Hook Form Integration

Efficient form handling with validation:

```typescript
// hooks/use-arc-form.ts
interface ArcFormData {
  name: string
  parentArcId?: number
  hook?: Descendant[]
  protagonist?: Descendant[]
  antagonist?: Descendant[]
  problem?: Descendant[]
  key?: Descendant[]
  outcome?: Descendant[]
  notes?: Descendant[]
}

export function useArcForm(arc?: Arc) {
  const form = useForm<ArcFormData>({
    defaultValues: {
      name: arc?.name || '',
      parentArcId: arc?.parentArcId || undefined,
      hook: arc?.hook || [{ type: 'paragraph', children: [{ text: '' }] }],
      protagonist: arc?.protagonist || [
        { type: 'paragraph', children: [{ text: '' }] },
      ],
      antagonist: arc?.antagonist || [
        { type: 'paragraph', children: [{ text: '' }] },
      ],
      problem: arc?.problem || [
        { type: 'paragraph', children: [{ text: '' }] },
      ],
      key: arc?.key || [{ type: 'paragraph', children: [{ text: '' }] }],
      outcome: arc?.outcome || [
        { type: 'paragraph', children: [{ text: '' }] },
      ],
      notes: arc?.notes || [{ type: 'paragraph', children: [{ text: '' }] }],
    },
    resolver: zodResolver(arcSchema),
  })

  // Auto-save functionality
  const { preferences } = useAppStore()
  const { mutate: updateArc } = useUpdateArc(arc?.campaignSlug || '')

  useEffect(() => {
    if (!preferences.autoSave || !arc) return

    const subscription = form.watch((data) => {
      const timeoutId = setTimeout(() => {
        if (form.formState.isDirty) {
          updateArc({ arcSlug: arc.slug, updates: data })
        }
      }, 2000) // 2 second delay

      return () => clearTimeout(timeoutId)
    })

    return subscription.unsubscribe
  }, [form, arc, preferences.autoSave, updateArc])

  return form
}
```

## Data Flow Patterns

### Optimistic Updates

Immediate UI updates with server reconciliation:

```typescript
// Example: Optimistic arc creation
export function useOptimisticArcCreation(campaignSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createArc,
    onMutate: async (newArc) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['arcs', campaignSlug])

      // Get current arcs
      const previousArcs =
        queryClient.getQueryData(['arcs', campaignSlug]) || []

      // Optimistically add new arc
      const optimisticArc = {
        id: Math.random(), // Temporary ID
        slug: generateSlug(newArc.name),
        ...newArc,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      queryClient.setQueryData(
        ['arcs', campaignSlug],
        [optimisticArc, ...previousArcs]
      )

      return { previousArcs, optimisticArc }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousArcs) {
        queryClient.setQueryData(['arcs', campaignSlug], context.previousArcs)
      }
    },
    onSuccess: (data, variables, context) => {
      // Replace optimistic arc with real data
      queryClient.setQueryData(['arcs', campaignSlug], (old: Arc[]) =>
        old.map((arc) => (arc.id === context?.optimisticArc.id ? data : arc))
      )
    },
  })
}
```

### Background Sync

Automatic data synchronization:

```typescript
// Background sync for active campaigns
export function useBackgroundSync(campaignSlug: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!campaignSlug) return

    // Set up interval for background sync
    const interval = setInterval(
      () => {
        // Refetch critical data
        queryClient.invalidateQueries(['campaign', campaignSlug])
        queryClient.invalidateQueries(['arcs', campaignSlug])
      },
      5 * 60 * 1000
    ) // Every 5 minutes

    return () => clearInterval(interval)
  }, [campaignSlug, queryClient])

  // Sync on window focus
  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries(['campaign', campaignSlug])
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [campaignSlug, queryClient])
}
```

## Performance Optimization

### Query Key Strategies

Efficient cache organization:

```typescript
// Hierarchical query keys for efficient invalidation
const queryKeys = {
  // Campaign level
  campaign: (slug: string) => ['campaign', slug],
  campaigns: () => ['campaigns'],

  // Arc level
  arc: (campaignSlug: string, arcSlug: string) => [
    'arc',
    campaignSlug,
    arcSlug,
  ],
  arcs: (campaignSlug: string) => ['arcs', campaignSlug],
  arcHierarchy: (campaignSlug: string) => ['arc-hierarchy', campaignSlug],

  // Thing level
  thing: (campaignSlug: string, thingSlug: string) => [
    'thing',
    campaignSlug,
    thingSlug,
  ],
  things: (campaignSlug: string, options?: any) => [
    'things',
    campaignSlug,
    options,
  ],
  thingTypes: (campaignSlug: string) => ['thing-types', campaignSlug],

  // Search
  search: (campaignSlug: string, query: string) => [
    'search',
    campaignSlug,
    query,
  ],
}
```

### Selective Data Loading

Load only necessary data:

```typescript
// Lightweight list queries
export function useArcList(campaignSlug: string) {
  return useQuery({
    queryKey: queryKeys.arcs(campaignSlug),
    queryFn: () => fetchArcs(campaignSlug, { lightweight: true }),
    select: (arcs) =>
      arcs.map((arc) => ({
        id: arc.id,
        slug: arc.slug,
        name: arc.name,
        updatedAt: arc.updatedAt,
      })),
  })
}

// Full arc data when needed
export function useArcDetail(campaignSlug: string, arcSlug: string) {
  return useQuery({
    queryKey: queryKeys.arc(campaignSlug, arcSlug),
    queryFn: () => fetchArc(campaignSlug, arcSlug),
    enabled: !!arcSlug,
  })
}
```

This state management architecture provides excellent performance, developer experience, and user experience while maintaining data consistency and enabling offline-first functionality where appropriate.
