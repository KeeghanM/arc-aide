---
title: 'Component Architecture'
description: 'Frontend component structure, patterns, and organization principles.'
---

# Component Architecture

ArcAide follows a structured component architecture that separates concerns while maintaining flexibility and reusability.

## Architecture Overview

### Component Hierarchy

```
MainLayout (Global wrapper)
└── Screen Components (Page-level logic)
    └── Feature Components (Business logic)
        └── UI Components (Presentation)
```

### Component Types

1. **Layout Components** - Page structure and navigation
2. **Screen Components** - Page-level business logic and data fetching
3. **Feature Components** - Domain-specific functionality
4. **UI Components** - Reusable presentation components

## File Organization

```
src/components/
├── app/                     # Application-specific components
│   ├── components/          # Feature components organized by domain
│   │   ├── arc/            # Arc-related components
│   │   ├── campaign/       # Campaign management components
│   │   ├── search-bar/     # Search functionality
│   │   ├── side-bar/       # Navigation sidebar
│   │   ├── slate-handling/ # Rich text editor components
│   │   └── thing/          # Thing management components
│   ├── hooks/              # Custom React hooks
│   ├── screens/            # Page-level screen components
│   └── stores/             # Zustand state stores
└── ui/                     # Reusable UI components
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    └── ...
```

## Layout Components

### MainLayout

Global application wrapper providing consistent structure:

```typescript
interface MainLayoutProps {
  title: string
  children: React.ReactNode
}

export function MainLayout({ title, children }: MainLayoutProps) {
  return (
    <html>
      <head>
        <title>{title}</title>
        <!-- Global meta tags, styles -->
      </head>
      <body>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
```

### ScreenWrapper

Provides consistent screen-level structure and loading states:

```typescript
interface ScreenWrapperProps {
  title: string
  isLoading?: boolean
  error?: string | null
  children: React.ReactNode
}

export function ScreenWrapper({ title, isLoading, error, children }: ScreenWrapperProps) {
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} />

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      {children}
    </div>
  )
}
```

## Screen Components

Page-level components that handle data fetching and top-level state:

### CampaignScreen

```typescript
export function CampaignScreen({ campaignSlug }: { campaignSlug: string }) {
  const { data: campaign, isLoading, error } = useCampaign(campaignSlug)
  const { mode } = useAppStore()

  return (
    <ScreenWrapper
      title={campaign?.name || 'Campaign'}
      isLoading={isLoading}
      error={error}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <SideBar campaignSlug={campaignSlug} />
        </div>

        <div className="lg:col-span-3">
          {mode === 'view' ? (
            <CampaignViewer campaign={campaign} />
          ) : (
            <CampaignEditor campaign={campaign} />
          )}
        </div>
      </div>
    </ScreenWrapper>
  )
}
```

### ArcScreen

```typescript
export function ArcScreen({ campaignSlug, arcSlug }: ScreenProps) {
  const { data: arc, isLoading, error } = useArc(campaignSlug, arcSlug)
  const { mode } = useAppStore()

  return (
    <ScreenWrapper
      title={arc?.name || 'Arc'}
      isLoading={isLoading}
      error={error}
    >
      <div className={cn(
        'grid grid-cols-1 gap-4',
        mode === 'edit' && 'md:grid-cols-2'
      )}>
        {mode === 'view' ? (
          <ArcViewer arc={arc} />
        ) : (
          <ArcEditor arc={arc} />
        )}
      </div>
    </ScreenWrapper>
  )
}
```

## Feature Components

Domain-specific components that encapsulate business logic:

### Arc Components

#### ArcEditor

```typescript
interface ArcEditorProps {
  arc: Arc
}

export function ArcEditor({ arc }: ArcEditorProps) {
  const { mutate: updateArc } = useUpdateArc(arc.campaignId)

  return (
    <div className="space-y-6">
      <ArcBasicInfo arc={arc} onUpdate={updateArc} />
      <ArcStructureEditor arc={arc} onUpdate={updateArc} />
      <ArcThingsManager arc={arc} />
    </div>
  )
}
```

#### ArcStructureEditor

```typescript
export function ArcStructureEditor({ arc, onUpdate }: ArcStructureProps) {
  const [sections, setSections] = useState(ARC_SECTIONS)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sections.map(section => (
        <ArcSection
          key={section.key}
          label={section.label}
          value={arc[section.key]}
          onChange={(value) => onUpdate({ [section.key]: value })}
        />
      ))}
    </div>
  )
}
```

### Slate Editor Components

#### SlateEditor

```typescript
interface SlateEditorProps {
  value: Descendant[]
  onChange: (value: Descendant[]) => void
  placeholder?: string
  campaignSlug: string
}

export function SlateEditor({ value, onChange, placeholder, campaignSlug }: SlateEditorProps) {
  const editor = useMemo(() => withLinks(withHistory(createEditor())), [])
  const [searchRange, setSearchRange] = useState<Range | null>(null)

  return (
    <div className="relative">
      <Slate editor={editor} value={value} onChange={onChange}>
        <Editable
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          decorate={decorateLinks}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />

        {searchRange && (
          <SearchBar
            range={searchRange}
            campaignSlug={campaignSlug}
            onSelect={handleLinkSelect}
            onClose={() => setSearchRange(null)}
          />
        )}
      </Slate>
    </div>
  )
}
```

#### SlateViewer

```typescript
interface SlateViewerProps {
  content: Descendant[]
  className?: string
}

export function SlateViewer({ content, className }: SlateViewerProps) {
  const { mode } = useAppStore()

  return (
    <div className={cn(
      'prose max-w-none',
      mode === 'view' && 'prose-dnd', // D&D styling
      className
    )}>
      {content.map((node, index) => (
        <SlateNode key={index} node={node} />
      ))}
    </div>
  )
}
```

### Search Components

#### SearchBar

```typescript
interface SearchBarProps {
  campaignSlug: string
  onSelect: (item: SearchResult) => void
  range?: Range
}

export function SearchBar({ campaignSlug, onSelect, range }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const { data: results, isLoading } = useSearch(campaignSlug, query)

  return (
    <div className="absolute z-50 bg-white border rounded-md shadow-lg">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search arcs and things..."
        className="w-full p-2 border-none outline-none"
      />

      {isLoading ? (
        <div className="p-2">Loading...</div>
      ) : (
        <SearchResults results={results} onSelect={onSelect} />
      )}
    </div>
  )
}
```

## UI Components

Reusable presentation components following consistent patterns:

### Button Component

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  children: React.ReactNode
}

export function Button({
  variant = 'default',
  size = 'default',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size }),
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

### Card Component

```typescript
interface CardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={cn('border rounded-lg p-4 bg-card', className)}>
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      {children}
    </div>
  )
}
```

## Component Patterns

### Container/Presenter Pattern

Separate data logic from presentation:

```typescript
// Container Component (handles data)
export function ArcListContainer({ campaignSlug }: { campaignSlug: string }) {
  const { data: arcs, isLoading, error } = useArcs(campaignSlug)

  return (
    <ArcListPresenter
      arcs={arcs}
      isLoading={isLoading}
      error={error}
    />
  )
}

// Presenter Component (handles display)
interface ArcListPresenterProps {
  arcs: Arc[]
  isLoading: boolean
  error: string | null
}

export function ArcListPresenter({ arcs, isLoading, error }: ArcListPresenterProps) {
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} />

  return (
    <div className="space-y-4">
      {arcs.map(arc => (
        <ArcCard key={arc.id} arc={arc} />
      ))}
    </div>
  )
}
```

### Compound Components

Related components that work together:

```typescript
// Parent component
export function Dialog({ children, open, onOpenChange }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

// Child components
Dialog.Trigger = DialogTrigger
Dialog.Content = DialogContent
Dialog.Header = DialogHeader
Dialog.Title = DialogTitle
Dialog.Description = DialogDescription

// Usage
<Dialog>
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
    <!-- Dialog content -->
  </Dialog.Content>
</Dialog>
```

### Custom Hooks Pattern

Encapsulate component logic in reusable hooks:

```typescript
// Custom hook for arc editing
export function useArcEditor(arc: Arc) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const { mutate: updateArc, isLoading } = useUpdateArc(arc.campaignId)

  const handleSave = useCallback(
    (updates: Partial<Arc>) => {
      updateArc({ arcSlug: arc.slug, updates })
      setIsDirty(false)
    },
    [arc.slug, updateArc]
  )

  return {
    isEditing,
    setIsEditing,
    isDirty,
    setIsDirty,
    handleSave,
    isSaving: isLoading,
  }
}
```

## Error Boundaries

Graceful error handling at component boundaries:

```typescript
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo)
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}
```

This component architecture provides a solid foundation for building maintainable, scalable, and reusable UI components while maintaining clear separation of concerns and consistent patterns throughout the application.
