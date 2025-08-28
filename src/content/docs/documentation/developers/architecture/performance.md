---
title: 'Performance'
description: 'Performance optimization strategies, monitoring, and best practices.'
---

# Performance

ArcAide is designed with performance as a core consideration, leveraging modern web technologies and optimization strategies to provide excellent user experience.

## Frontend Performance

### Astro Optimization

Astro provides excellent performance out of the box:

#### Island Architecture

```typescript
// Only interactive components are hydrated
export default function CampaignPage({ campaign }) {
  return (
    <Layout>
      {/* Static content - no JavaScript */}
      <h1>{campaign.name}</h1>
      <p>{campaign.description}</p>

      {/* Interactive components - hydrated on demand */}
      <ArcEditor client:visible campaign={campaign} />
      <SearchBar client:idle />
      <SideBar client:load />
    </Layout>
  )
}
```

#### Selective Hydration Strategies

```typescript
// Hydration strategies for different use cases
{/* Critical interactive content */}
<Navigation client:load />

{/* Above-the-fold interactivity */}
<ModeToggle client:idle />

{/* Scroll-triggered content */}
<ArcList client:visible />

{/* Media query responsive */}
<MobileSidebar client:media="(max-width: 768px)" />

{/* Only when needed */}
<AdvancedEditor client:only="react" />
```

### Bundle Optimization

#### Code Splitting

```typescript
// Automatic route-based splitting
const pages = {
  '/dashboard': () => import('./pages/dashboard.astro'),
  '/campaign/[slug]': () => import('./pages/campaign/[slug].astro'),
  '/arc/[slug]': () => import('./pages/arc/[slug].astro'),
}

// Component-level splitting for large dependencies
const SlateEditor = lazy(() =>
  import('./components/slate-editor').then((module) => ({
    default: module.SlateEditor,
  }))
)

// Library splitting for optimal caching
const externals = {
  'react': 'React',
  'react-dom': 'ReactDOM',
  '@tanstack/react-query': 'ReactQuery',
}
```

#### Tree Shaking

```typescript
// Import only what's needed
import { useQuery, useMutation } from '@tanstack/react-query'
import { create } from 'zustand'
import { eq, and } from 'drizzle-orm'

// Avoid importing entire libraries
// ❌ import * as lodash from 'lodash'
// ✅ import { debounce } from 'lodash-es'
```

### Asset Optimization

#### Image Optimization

```astro
---
// Astro's built-in image optimization
import { Image } from 'astro:assets'
import parchmentBg from '../assets/parchmentBackground.jpg'
---

<!-- Optimized images with multiple formats -->
<Image
  src={parchmentBg}
  alt='Parchment background'
  width={1920}
  height={1080}
  format='webp'
  quality={80}
  loading='lazy'
/>

<!-- Responsive images -->
<Image
  src={heroImage}
  alt='Campaign hero'
  widths={[240, 540, 720, 1600]}
  sizes='(max-width: 360px) 240px, (max-width: 720px) 540px, (max-width: 1600px) 720px, 1600px'
/>
```

#### Font Loading Strategy

```css
/* Critical fonts preloaded */
@font-face {
  font-family: 'Bookinsanity';
  src: url('/fonts/Bookinsanity.otf') format('opentype');
  font-display: swap;
  font-weight: normal;
  font-style: normal;
}

/* Non-critical fonts loaded progressively */
@font-face {
  font-family: 'Nodesto Caps Condensed';
  src: url('/fonts/NodestoCapsCondensed.otf') format('opentype');
  font-display: optional;
  font-weight: normal;
  font-style: normal;
}
```

### Runtime Performance

#### React Query Optimization

```typescript
// Efficient query key strategies
const queryKeys = {
  campaigns: () => ['campaigns'],
  campaign: (slug: string) => ['campaign', slug],
  arcs: (campaignSlug: string) => ['arcs', campaignSlug],
  arc: (campaignSlug: string, arcSlug: string) => [
    'arc',
    campaignSlug,
    arcSlug,
  ],
}

// Optimized data fetching
export function useArcs(campaignSlug: string) {
  return useQuery({
    queryKey: queryKeys.arcs(campaignSlug),
    queryFn: () => fetchArcs(campaignSlug),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    // Only refetch when data is actually stale
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

// Intelligent prefetching
export function usePrefetchArc(campaignSlug: string, arcSlug: string) {
  const queryClient = useQueryClient()

  return useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.arc(campaignSlug, arcSlug),
      queryFn: () => fetchArc(campaignSlug, arcSlug),
      staleTime: 5 * 60 * 1000,
    })
  }, [queryClient, campaignSlug, arcSlug])
}
```

#### Component Optimization

```typescript
// Memoization for expensive computations
export const ArcViewer = memo(function ArcViewer({ arc }: { arc: Arc }) {
  const consolidatedContent = useMemo(() => {
    return consolidateArcContent(arc)
  }, [arc.hook, arc.protagonist, arc.antagonist, arc.problem, arc.key, arc.outcome])

  return <SlateViewer content={consolidatedContent} />
})

// Virtualization for large lists
export function ThingsList({ campaignSlug }: { campaignSlug: string }) {
  const { data: things } = useThings(campaignSlug, { fetchAll: true })

  const Row = useCallback(({ index, style }) => (
    <div style={style}>
      <ThingCard thing={things[index]} />
    </div>
  ), [things])

  return (
    <FixedSizeList
      height={600}
      itemCount={things?.length || 0}
      itemSize={120}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

## Backend Performance

### Database Optimization

#### Query Optimization

```typescript
// Efficient database queries with proper indexing
export async function getArcsWithThings(campaignId: number) {
  // Single query with joins instead of N+1 queries
  return await db
    .select({
      arc: arcs,
      things: sql<Thing[]>`
        COALESCE(
          json_group_array(
            json_object(
              'id', ${things.id},
              'slug', ${things.slug},
              'name', ${things.name},
              'typeId', ${things.typeId}
            )
          ) FILTER (WHERE ${things.id} IS NOT NULL),
          '[]'
        )
      `.as('things'),
    })
    .from(arcs)
    .leftJoin(arcThings, eq(arcs.id, arcThings.arcId))
    .leftJoin(things, eq(arcThings.thingId, things.id))
    .where(eq(arcs.campaignId, campaignId))
    .groupBy(arcs.id)
    .orderBy(desc(arcs.updatedAt))
}

// Pagination for large datasets
export async function getThingsPaginated(
  campaignId: number,
  page: number = 1,
  limit: number = 20
) {
  const offset = (page - 1) * limit

  const [things, totalCount] = await Promise.all([
    db
      .select()
      .from(things)
      .where(eq(things.campaignId, campaignId))
      .orderBy(desc(things.updatedAt))
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`count(*)` })
      .from(things)
      .where(eq(things.campaignId, campaignId))
      .then((result) => result[0].count),
  ])

  return {
    things,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  }
}
```

#### Full-Text Search Optimization

```sql
-- Optimized FTS queries with ranking
SELECT
  arcs.*,
  arcs_fts.rank
FROM arcs_fts
JOIN arcs ON arcs.id = arcs_fts.rowid
WHERE arcs_fts MATCH ?
  AND arcs.campaign_id = ?
ORDER BY arcs_fts.rank, arcs.updated_at DESC
LIMIT 20;

-- Combined search across multiple tables
SELECT
  'arc' as type,
  arcs.id,
  arcs.slug,
  arcs.name,
  snippet(arcs_fts, -1, '<mark>', '</mark>', '...', 32) as excerpt,
  arcs_fts.rank
FROM arcs_fts
JOIN arcs ON arcs.id = arcs_fts.rowid
WHERE arcs_fts MATCH ? AND arcs.campaign_id = ?

UNION ALL

SELECT
  'thing' as type,
  things.id,
  things.slug,
  things.name,
  snippet(things_fts, -1, '<mark>', '</mark>', '...', 32) as excerpt,
  things_fts.rank
FROM things_fts
JOIN things ON things.id = things_fts.rowid
WHERE things_fts MATCH ? AND things.campaign_id = ?

ORDER BY rank, type, name
LIMIT 50;
```

### API Performance

#### Response Optimization

```typescript
// Selective field loading
export async function getArcsList(campaignId: number, lightweight = false) {
  const selectFields = lightweight
    ? {
        id: arcs.id,
        slug: arcs.slug,
        name: arcs.name,
        updatedAt: arcs.updatedAt,
      }
    : arcs // Full object

  return await db
    .select(selectFields)
    .from(arcs)
    .where(eq(arcs.campaignId, campaignId))
    .orderBy(desc(arcs.updatedAt))
}

// Response compression
export function compressResponse(data: any): Response {
  const json = JSON.stringify(data)

  return new Response(json, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Encoding': 'gzip',
      'Cache-Control': 'public, max-age=300', // 5 minutes
    },
  })
}
```

#### Caching Strategy

```typescript
// Memory cache for frequently accessed data
const cache = new Map<string, { data: any; expires: number }>()

export function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes
): Promise<T> {
  const cached = cache.get(key)

  if (cached && cached.expires > Date.now()) {
    return Promise.resolve(cached.data)
  }

  return fetcher().then((data) => {
    cache.set(key, {
      data,
      expires: Date.now() + ttl,
    })
    return data
  })
}

// Usage in API routes
export async function GET({ params }) {
  const cacheKey = `campaign:${params.slug}`

  const campaign = await getCached(
    cacheKey,
    () => fetchCampaign(params.slug),
    10 * 60 * 1000 // 10 minutes for campaigns
  )

  return compressResponse(campaign)
}
```

## Monitoring and Metrics

### Performance Monitoring

```typescript
// Core Web Vitals tracking
export function trackWebVitals() {
  // Largest Contentful Paint
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        analytics.track('LCP', { value: entry.startTime })
      }
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] })

  // First Input Delay
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'first-input') {
        analytics.track('FID', {
          value: entry.processingStart - entry.startTime,
        })
      }
    }
  }).observe({ entryTypes: ['first-input'] })

  // Cumulative Layout Shift
  let clsValue = 0
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value
      }
    }
    analytics.track('CLS', { value: clsValue })
  }).observe({ entryTypes: ['layout-shift'] })
}

// Database query performance
export async function withQueryTiming<T>(
  name: string,
  query: () => Promise<T>
): Promise<T> {
  const start = performance.now()

  try {
    const result = await query()
    const duration = performance.now() - start

    // Log slow queries
    if (duration > 100) {
      console.warn(`Slow query: ${name} took ${duration}ms`)
    }

    analytics.track('database_query', {
      name,
      duration,
      success: true,
    })

    return result
  } catch (error) {
    const duration = performance.now() - start

    analytics.track('database_query', {
      name,
      duration,
      success: false,
      error: error.message,
    })

    throw error
  }
}
```

### Bundle Analysis

```typescript
// Bundle size monitoring
export function analyzeBundles() {
  if (typeof window !== 'undefined') {
    // Track JavaScript bundle sizes
    performance.getEntriesByType('navigation').forEach((entry) => {
      analytics.track('bundle_size', {
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize,
      })
    })

    // Track resource loading times
    performance.getEntriesByType('resource').forEach((entry) => {
      if (entry.name.includes('.js') || entry.name.includes('.css')) {
        analytics.track('resource_timing', {
          name: entry.name,
          duration: entry.duration,
          size: entry.transferSize,
        })
      }
    })
  }
}
```

## Performance Best Practices

### Development Guidelines

1. **Measure First** - Always measure before optimizing
2. **Bundle Analysis** - Regular bundle size monitoring
3. **Database Indexing** - Proper indexes for query patterns
4. **Image Optimization** - WebP format, responsive sizes
5. **Code Splitting** - Route and component-level splitting
6. **Caching Strategy** - Appropriate cache headers and strategies

### Production Optimization Checklist

- [ ] Astro build optimization enabled
- [ ] Image optimization configured
- [ ] Font loading optimized
- [ ] Database indexes in place
- [ ] Query performance monitored
- [ ] Bundle sizes within targets
- [ ] Core Web Vitals tracking
- [ ] CDN configured for static assets
- [ ] Compression enabled
- [ ] Cache headers configured

### Performance Targets

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1
- **Database Queries**: < 100ms average
- **Bundle Size**: < 250KB compressed
- **Time to Interactive**: < 3.5s

This comprehensive performance strategy ensures ArcAide delivers excellent user experience while maintaining scalability and efficiency.
