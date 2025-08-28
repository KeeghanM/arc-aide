---
title: 'Development Patterns'
description: 'Code organization patterns, best practices, and development conventions.'
---

# Development Patterns

ArcAide follows established development patterns and best practices to ensure code quality, maintainability, and team productivity.

## API Design Patterns

### RESTful Conventions

Consistent endpoint design following REST principles:

```typescript
// Resource-based URLs
GET    /api/campaigns              # List campaigns
POST   /api/campaigns              # Create campaign
GET    /api/campaigns/{slug}       # Get campaign
PUT    /api/campaigns/{slug}       # Update campaign
DELETE /api/campaigns/{slug}       # Delete campaign

// Nested resources
GET    /api/campaigns/{slug}/arcs           # List arcs
POST   /api/campaigns/{slug}/arcs           # Create arc
GET    /api/campaigns/{slug}/arcs/{arcSlug} # Get arc
PUT    /api/campaigns/{slug}/arcs/{arcSlug} # Update arc
DELETE /api/campaigns/{slug}/arcs/{arcSlug} # Delete arc

// Associations
GET    /api/campaigns/{slug}/things/{thingSlug}/arcs      # Get arcs for thing
POST   /api/campaigns/{slug}/things/{thingSlug}/arcs      # Associate thing with arc
DELETE /api/campaigns/{slug}/things/{thingSlug}/arcs/{arcSlug} # Remove association
```

### Response Format Standards

Consistent response structures:

```typescript
// Success responses
interface SuccessResponse<T> {
  data: T
  meta?: {
    pagination?: PaginationMeta
    timestamp: string
  }
}

// Error responses
interface ErrorResponse {
  error: string
  details?: string[]
  code?: string
}

// Pagination metadata
interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Implementation
export async function GET({ request, params }) {
  return withAuth(request, async (user) => {
    const campaigns = await getCampaigns(user.id)

    return {
      data: campaigns,
      meta: {
        timestamp: new Date().toISOString(),
      },
    }
  })
}
```

### Input Validation Pattern

Consistent validation using Zod schemas:

```typescript
// Define schemas
export const createCampaignSchema = z.object({
  newCampaign: z.object({
    name: z.string().min(1).max(100),
    description: richTextSchema.optional(),
  }),
})

export const updateArcSchema = z.object({
  updatedArc: z.object({
    slug: z.string().min(1),
    name: z.string().min(1).max(100),
    parentArcId: z.number().positive().optional().nullable(),
    hook: richTextSchema.optional().nullable(),
    // ... other fields
  }),
})

// Validation wrapper
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await request.json()

  try {
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation failed: ${error.errors.map((e) => e.message).join(', ')}`
      )
    }
    throw error
  }
}

// Usage in endpoints
export async function POST({ request, params }) {
  return withAuth(request, async (user) => {
    const validation = await validateRequest(request, createCampaignSchema)
    const { newCampaign } = validation

    const campaign = await createCampaign(newCampaign, user.id)
    return { data: campaign }
  })
}
```

## Component Design Patterns

### Container/Presenter Pattern

Separate data logic from presentation:

```typescript
// Container Component (handles data and logic)
export function ArcListContainer({ campaignSlug }: { campaignSlug: string }) {
  const { data: arcs, isLoading, error } = useArcs(campaignSlug)
  const { mutate: createArc } = useCreateArc(campaignSlug)
  const { mutate: deleteArc } = useDeleteArc(campaignSlug)

  const handleCreate = useCallback((newArc: CreateArcRequest) => {
    createArc(newArc)
  }, [createArc])

  const handleDelete = useCallback((arcSlug: string) => {
    deleteArc({ arcSlug })
  }, [deleteArc])

  return (
    <ArcListPresenter
      arcs={arcs || []}
      isLoading={isLoading}
      error={error}
      onCreateArc={handleCreate}
      onDeleteArc={handleDelete}
    />
  )
}

// Presenter Component (handles display)
interface ArcListPresenterProps {
  arcs: Arc[]
  isLoading: boolean
  error: string | null
  onCreateArc: (arc: CreateArcRequest) => void
  onDeleteArc: (arcSlug: string) => void
}

export function ArcListPresenter({
  arcs,
  isLoading,
  error,
  onCreateArc,
  onDeleteArc,
}: ArcListPresenterProps) {
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} />

  return (
    <div className="space-y-4">
      <ArcCreateForm onSubmit={onCreateArc} />

      <div className="grid gap-4">
        {arcs.map(arc => (
          <ArcCard
            key={arc.id}
            arc={arc}
            onDelete={() => onDeleteArc(arc.slug)}
          />
        ))}
      </div>
    </div>
  )
}
```

### Compound Components Pattern

Related components that work together:

```typescript
// Parent component with context
interface DialogContextValue {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = createContext<DialogContextValue | null>(null)

export function Dialog({
  children,
  open,
  onOpenChange
}: DialogProps) {
  return (
    <DialogContext.Provider value={{ isOpen: open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

// Child components
function DialogTrigger({ children, ...props }: DialogTriggerProps) {
  const context = useContext(DialogContext)
  if (!context) throw new Error('DialogTrigger must be used within Dialog')

  return (
    <button
      onClick={() => context.onOpenChange(true)}
      {...props}
    >
      {children}
    </button>
  )
}

function DialogContent({ children, ...props }: DialogContentProps) {
  const context = useContext(DialogContext)
  if (!context) throw new Error('DialogContent must be used within Dialog')

  if (!context.isOpen) return null

  return (
    <div className="dialog-overlay">
      <div className="dialog-content" {...props}>
        {children}
      </div>
    </div>
  )
}

// Attach child components
Dialog.Trigger = DialogTrigger
Dialog.Content = DialogContent
Dialog.Header = DialogHeader
Dialog.Title = DialogTitle
Dialog.Description = DialogDescription

// Usage
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Trigger>
    <Button>Open Dialog</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit Arc</Dialog.Title>
      <Dialog.Description>
        Make changes to your arc here.
      </Dialog.Description>
    </Dialog.Header>
    {/* Dialog content */}
  </Dialog.Content>
</Dialog>
```

### Custom Hooks Pattern

Encapsulate reusable logic:

```typescript
// Data fetching hook
export function useArc(campaignSlug: string, arcSlug: string) {
  return useQuery({
    queryKey: ['arc', campaignSlug, arcSlug],
    queryFn: () => fetchArc(campaignSlug, arcSlug),
    enabled: !!(campaignSlug && arcSlug),
  })
}

// Form management hook
export function useArcForm(arc?: Arc) {
  const form = useForm<ArcFormData>({
    defaultValues: {
      name: arc?.name || '',
      parentArcId: arc?.parentArcId || undefined,
      hook: arc?.hook || getEmptyRichText(),
      // ... other fields
    },
    resolver: zodResolver(arcFormSchema),
  })

  const isDirty = form.formState.isDirty
  const isValid = form.formState.isValid

  return {
    form,
    isDirty,
    isValid,
    reset: form.reset,
    handleSubmit: form.handleSubmit,
  }
}

// Local storage hook
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  })

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value)
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key]
  )

  return [storedValue, setValue]
}

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

## State Management Patterns

### Query State Patterns

Efficient server state management:

```typescript
// Query key factory
export const queryKeys = {
  all: ['app'] as const,
  campaigns: () => [...queryKeys.all, 'campaigns'] as const,
  campaign: (slug: string) => [...queryKeys.campaigns(), slug] as const,
  arcs: (campaignSlug: string) =>
    [...queryKeys.campaign(campaignSlug), 'arcs'] as const,
  arc: (campaignSlug: string, arcSlug: string) =>
    [...queryKeys.arcs(campaignSlug), arcSlug] as const,
  things: (campaignSlug: string) =>
    [...queryKeys.campaign(campaignSlug), 'things'] as const,
  thing: (campaignSlug: string, thingSlug: string) =>
    [...queryKeys.things(campaignSlug), thingSlug] as const,
}

// Optimistic updates
export function useCreateArc(campaignSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (newArc: CreateArcRequest) => createArc(campaignSlug, newArc),

    onMutate: async (newArc) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(queryKeys.arcs(campaignSlug))

      // Snapshot the previous value
      const previousArcs = queryClient.getQueryData(
        queryKeys.arcs(campaignSlug)
      )

      // Optimistically update
      queryClient.setQueryData(
        queryKeys.arcs(campaignSlug),
        (old: Arc[] = []) => [
          {
            id: Math.random(), // Temporary ID
            slug: generateSlug(newArc.name),
            ...newArc,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          ...old,
        ]
      )

      return { previousArcs }
    },

    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousArcs) {
        queryClient.setQueryData(
          queryKeys.arcs(campaignSlug),
          context.previousArcs
        )
      }
      toast.error('Failed to create arc')
    },

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(queryKeys.arcs(campaignSlug))
      toast.success('Arc created successfully')
    },
  })
}
```

### Global State Patterns

Clean global state with Zustand:

```typescript
// Slice pattern for large stores
interface AppState extends AppSlice, SearchSlice, EditorSlice {}

interface AppSlice {
  mode: 'edit' | 'view'
  setMode: (mode: 'edit' | 'view') => void
  currentCampaign: string | null
  setCurrentCampaign: (slug: string | null) => void
}

interface SearchSlice {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: SearchResult[]
  setSearchResults: (results: SearchResult[]) => void
}

interface EditorSlice {
  isDirty: boolean
  setIsDirty: (dirty: boolean) => void
  isAutoSaving: boolean
  setIsAutoSaving: (saving: boolean) => void
}

// Create slices
const createAppSlice: StateCreator<AppState, [], [], AppSlice> = (set) => ({
  mode: 'edit',
  setMode: (mode) => set({ mode }),
  currentCampaign: null,
  setCurrentCampaign: (slug) => set({ currentCampaign: slug }),
})

const createSearchSlice: StateCreator<AppState, [], [], SearchSlice> = (
  set
) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  searchResults: [],
  setSearchResults: (results) => set({ searchResults: results }),
})

const createEditorSlice: StateCreator<AppState, [], [], EditorSlice> = (
  set
) => ({
  isDirty: false,
  setIsDirty: (dirty) => set({ isDirty: dirty }),
  isAutoSaving: false,
  setIsAutoSaving: (saving) => set({ isAutoSaving: saving }),
})

// Combine slices
export const useAppStore = create<AppState>()(
  persist(
    (...args) => ({
      ...createAppSlice(...args),
      ...createSearchSlice(...args),
      ...createEditorSlice(...args),
    }),
    {
      name: 'arcaide-app-state',
      partialize: (state) => ({
        mode: state.mode,
        currentCampaign: state.currentCampaign,
      }),
    }
  )
)
```

## Error Handling Patterns

### Boundary Pattern

Comprehensive error boundaries:

```typescript
// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ComponentType<{ error: Error }> },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    Honeybadger.notify(error, {
      context: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error!} />
    }

    return this.props.children
  }
}

// Error fallback component
function DefaultErrorFallback({ error }: { error: Error }) {
  return (
    <div className="error-boundary">
      <h2>Something went wrong</h2>
      <details>
        <summary>Error details</summary>
        <pre>{error.message}</pre>
      </details>
      <Button onClick={() => window.location.reload()}>
        Reload page
      </Button>
    </div>
  )
}

// Usage
<ErrorBoundary fallback={CustomErrorFallback}>
  <CampaignScreen campaignSlug={slug} />
</ErrorBoundary>
```

### API Error Pattern

Consistent API error handling:

```typescript
// API client with error handling
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new APIError(
        errorData.error || 'Request failed',
        response.status,
        errorData
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }

    // Network or parsing errors
    throw new APIError('Network error', 0, { originalError: error })
  }
}

// Custom error class
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Error handling in hooks
export function useCampaign(campaignSlug: string) {
  return useQuery({
    queryKey: queryKeys.campaign(campaignSlug),
    queryFn: () => apiRequest<Campaign>(`/campaigns/${campaignSlug}`),
    onError: (error) => {
      if (error instanceof APIError) {
        switch (error.status) {
          case 404:
            toast.error('Campaign not found')
            break
          case 403:
            toast.error('Access denied')
            break
          default:
            toast.error('Failed to load campaign')
        }
      }
    },
  })
}
```

## Testing Patterns

### Component Testing

Testing components with proper mocking:

```typescript
// Test utilities
export function renderWithProviders(
  ui: React.ReactElement,
  options: {
    queryClient?: QueryClient
    store?: AppStore
  } = {}
) {
  const {
    queryClient = createTestQueryClient(),
    store = createTestStore(),
  } = options

  return render(
    <QueryClientProvider client={queryClient}>
      <StoreProvider store={store}>
        {ui}
      </StoreProvider>
    </QueryClientProvider>
  )
}

// Example component test
describe('ArcEditor', () => {
  it('renders arc data correctly', () => {
    const mockArc = createMockArc()

    renderWithProviders(
      <ArcEditor arc={mockArc} />
    )

    expect(screen.getByDisplayValue(mockArc.name)).toBeInTheDocument()
    expect(screen.getByText(/hook/i)).toBeInTheDocument()
  })

  it('calls onSave when form is submitted', async () => {
    const mockArc = createMockArc()
    const onSave = vi.fn()

    renderWithProviders(
      <ArcEditor arc={mockArc} onSave={onSave} />
    )

    const nameInput = screen.getByLabelText(/name/i)
    await user.type(nameInput, ' Updated')

    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: mockArc.name + ' Updated'
      })
    )
  })
})
```

These development patterns ensure consistent, maintainable, and testable code across the ArcAide application while promoting best practices and developer productivity.
