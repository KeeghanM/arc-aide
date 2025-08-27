# Changelog

This document tracks significant changes and improvements to the ArcAide application.

## Sidebar Creation 27/08/2025

### Component Reorganization

**File Structure Updates**

- Renamed `src/components/app/components/arc/arc.tsx` to `arc-item.tsx` for better clarity
- Updated all imports throughout the application to reflect the new naming convention

**Impact:** Improved code organization and clarity around component naming. The `ArcItem` component name now better reflects its purpose as a display component for individual arc items.

### Hook API Improvements

**useThingQueries Hook Enhancement**

- **Breaking Change:** Modified `useThingsQuery` to accept a parameter object instead of a simple count
- Added support for fetching all things with `fetchAll: true` option
- Improved query key structure for better caching

```typescript
// Before
const thingsQuery = useThingsQuery(20)

// After
const thingsQuery = useThingsQuery({ count: 20 })
// OR
const thingsQuery = useThingsQuery({ fetchAll: true })
```

**useThingTypeQueries Hook Simplification**

- **Breaking Change:** Replaced `useThingTypesQuery(campaignSlug)` with direct `thingTypesQuery`
- Hook now automatically uses the campaign slug from the app store
- Simplified API reduces parameter passing and improves consistency

```typescript
// Before
const { useThingTypesQuery } = useThingTypeQueries()
const thingTypes = useThingTypesQuery(campaignSlug!)

// After
const { thingTypesQuery } = useThingTypeQueries()
// thingTypesQuery automatically uses the current campaign
```

### API Endpoint Enhancements

**Arcs API Improvements**

- Enhanced `/api/campaigns/[campaignSlug]/arcs` endpoint to include associated things
- Added proper JOIN operations to fetch arc-thing relationships
- Improved data structure to include `things` array in arc objects

**Things API Enhancements**

- Added `fetchAll` query parameter support to things endpoint
- Improved parameter handling with better fallback logic
- Added hard limit (1000) to prevent overload when fetching all items
- Added TODO for pagination implementation for large datasets

```typescript
// New API usage examples
GET /api/campaigns/my-campaign/things?count=20
GET /api/campaigns/my-campaign/things?fetchAll=true
```

### Authentication Middleware Improvements

**Type Safety Enhancements**

- Updated `App.Locals` interface to ensure user and session are always defined (non-null)
- Improved middleware flow to set user/session only after authentication is verified
- Removed potential null states that could cause runtime errors

```typescript
// Before
interface Locals {
  user: import('better-auth').User | null
  session: import('better-auth').Session | null
}

// After
interface Locals {
  user: import('better-auth').User
  session: import('better-auth').Session
}
```

### Layout and Navigation Updates

**Sidebar Integration**

- Added `SideBarWrapper` component to all main dashboard pages
- Implemented consistent sidebar navigation across arc, campaign, and thing pages
- Added `transition:persist` for better user experience during navigation
- Improved responsive layout with flex-based design

**Page Structure Improvements**

- Reorganized page layouts to use sidebar + main content structure
- Improved responsive design with `flex-1` main content areas
- Maintained existing functionality while improving navigation consistency

### Type Definition Improvements

**Enhanced Arc Type**

- Added `things` property to `TArc` type definition
- Improved type safety for arc-thing relationships
- Better integration between arc and thing data structures

**Simplified Type Imports**

- Reduced dependency on complex type imports in components
- Simplified arc list components to use minimal type definitions
- Improved type consistency across the application

## Migration Guide

### For Developers

If you're working with the updated codebase, be aware of these breaking changes:

1. **useThingsQuery API Change**

   ```typescript
   // Update your calls from:
   useThingsQuery(count)
   // To:
   useThingsQuery({ count })
   ```

2. **useThingTypeQueries API Change**

   ```typescript
   // Update your calls from:
   const { useThingTypesQuery } = useThingTypeQueries()
   const query = useThingTypesQuery(campaignSlug)
   // To:
   const { thingTypesQuery } = useThingTypeQueries()
   ```

3. **Import Path Updates**
   ```typescript
   // Update imports from:
   import ArcItem from '../components/arc/arc'
   // To:
   import ArcItem from '../components/arc/arc-item'
   ```

### Benefits of These Changes

1. **Better Type Safety** - Eliminated potential null reference errors in authentication
2. **Improved API Flexibility** - Things endpoint now supports both paginated and full data fetching
3. **Enhanced Data Relations** - Arcs now include their associated things for richer data
4. **Simplified Hook APIs** - Reduced parameter passing and improved consistency
5. **Better Navigation** - Consistent sidebar across all dashboard pages
6. **Clearer Component Names** - File and component names better reflect their purpose

### Performance Considerations

- The new `fetchAll` option for things should be used carefully on campaigns with large datasets
- The hard limit of 1000 items prevents server overload but may require pagination for very large campaigns
- Sidebar persistence improves perceived performance during navigation

## Next Steps

- Implement proper pagination for the things endpoint when `fetchAll` is used with large datasets
- Consider adding similar relationship loading for other entity types
- Evaluate opportunities for further hook API simplification
