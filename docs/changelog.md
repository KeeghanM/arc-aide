# Changelog

This document tracks significant changes and improvements to the ArcAide application.

## Major UI/UX Overhaul and Content Management Enhancement 27/08/2025

### 🎨 D&D Theme System Implementation

**Complete Theme Redesign**

- Removed dark mode support in favor of dedicated D&D 5e aesthetic
- Implemented Homebrewery-inspired color palette and typography
- Added support for official D&D fonts (Bookinsanity, Zatanna Misdirection, Nodesto Caps, etc.)
- Created comprehensive D&D-styled component library with stat blocks, spell descriptions, and parchment backgrounds
- Added CSS custom properties for D&D color scheme (parchment backgrounds, accent colors, etc.)

**Typography System**

- **Bookinsanity**: Primary content font (serif)
- **Mr Eaves Small Caps**: Headers and titles
- **Zatanna Misdirection**: Spell names and magical content
- **Nodesto Caps Condensed**: Stat block headers
- **Scaly Sans**: Tables and compact information
- **Solbera Imitation** & **Dungeon Drop Case**: Drop cap styling

### 📝 Content Management Mode System

**View/Edit Mode Toggle**

- Added global mode toggle between "Edit" and "View" modes across the application
- **Edit Mode**: Traditional editor interface with full editing capabilities
- **View Mode**: Clean, D&D-styled content presentation with minimal UI
- Mode state persists across navigation and is managed globally via app store

**Enhanced Content Presentation**

- **View Mode Features**:
  - D&D-themed content rendering with parchment backgrounds
  - Consolidated single-column layout for narrative flow
  - Automatic section headers (Hook, Protagonist, Antagonist, etc.)
  - Seamless content integration for better reading experience
- **Edit Mode Features**:
  - Maintains existing multi-column editor layout
  - Individual section editing with real-time auto-save
  - Full toolbar and formatting capabilities

### 🔧 Editor Architecture Refactoring

**Component Reorganization**

- Moved editor components from `/components/editor/` to `/components/slate-handling/`
- Split functionality into specialized components:
  - `editor.tsx`: Interactive editing interface
  - `viewer.tsx`: Read-only content presentation
  - `custom-types.d.ts`: Shared type definitions
- Updated all import paths throughout the application

**New SlateViewer Component**

- Purpose-built component for read-only content display
- Optimized for D&D theme styling and typography
- Supports all Slate.js content types with proper rendering
- Integrated with link resolution and navigation

### 📖 Arc Data Model Enhancement

**Notes Field Addition**

- Added `notes` field to Arc data model for additional campaign information
- Extended database schema with `notes` and `notesText` columns
- Added auto-save functionality for notes editing
- Full-width notes section spans both columns in edit mode
- Integrated notes into view mode presentation

**API Enhancements**

- Updated Arc PUT endpoint to handle notes field updates
- Added notes text extraction for search functionality
- Maintained backward compatibility with existing arc data

### 🎛️ UI Component Updates

**Mode Toggle Integration**

- Replaced theme toggle component with mode toggle (Edit/View)
- Added ModeToggle component to all dashboard pages
- Positioned as floating action button for easy access
- Consistent placement across Arc, Thing, and Campaign pages

**Layout Improvements**

- Dynamic grid system that adapts to current mode
- View mode uses single-column layout for better reading flow
- Edit mode maintains responsive multi-column layout
- Improved spacing and typography across all content areas

**Removed Components**

- Eliminated theme toggle components (`RThemeToggle.tsx`, `theme-toggle.astro`)
- Removed dark mode CSS variables and styling
- Simplified global CSS structure

### 🔗 Content Integration Enhancements

**Cross-Content Navigation**

- Enhanced link resolution between Arcs and Things
- Improved query integration for real-time content updates
- Better data synchronization between edit and view modes

**Thing Component Updates**

- Added view/edit mode support to Thing pages
- Integrated SlateViewer for consistent content presentation
- Maintained full editing capabilities in edit mode

### 🎯 User Experience Improvements

**Simplified Interface**

- Single theme reduces cognitive load and decision fatigue
- Mode toggle provides clear context switch between editing and reading
- Consistent D&D aesthetic creates immersive campaign management experience

**Enhanced Readability**

- D&D typography optimized for long-form content reading
- Parchment backgrounds and appropriate color contrast
- Professional TTRPG presentation suitable for player-facing content

**Workflow Optimization**

- Quick mode switching enables seamless transition between content creation and review
- View mode presentation suitable for sharing with players
- Edit mode maintains all power-user functionality

### 🚀 Technical Improvements

**Performance Optimizations**

- Reduced CSS bundle size by removing unused dark mode styles
- Optimized font loading with local and CDN fallbacks
- Improved component lazy loading and code splitting

**Type Safety Enhancements**

- Consolidated Slate.js type definitions in dedicated module
- Improved type safety across editor and viewer components
- Better IntelliSense support for content editing

**Maintainability**

- Cleaner component architecture with clear separation of concerns
- Reduced complexity by focusing on single theme system
- Better code organization with logical component grouping

### 🎲 D&D-Specific Features

**Stat Block Support**

- Ready-to-use CSS classes for D&D 5e stat blocks
- Proper formatting for monster/NPC statistics
- Spell description styling with appropriate typography

**Campaign Documentation**

- Professional presentation suitable for campaign handouts
- Print-friendly styling with appropriate margins and typography
- Consistent visual language matching official D&D materials

## Rich Text Editor Internal Linking 27/08/2025

### New Feature: Wiki-Style Internal Linking

**Interactive Link Creation**

- Added support for internal links using `[[...]]` syntax within the rich text editor
- Empty brackets `[[]]` trigger an interactive search interface for selecting entities
- Resolved links display as `[[type#slug]]` format and render as clickable navigation links
- Supports linking to both Arcs and Things within the current campaign

**Technical Implementation**

- Extended Slate.js custom types with new link properties:
  - `link`: Boolean flag for resolved links
  - `linkSlug`: Entity identifier for navigation
  - `linkType`: Entity type ('arc' or 'thing')
  - `linkSearch`: Boolean flag for search trigger
  - `linkRange`: Position data for text replacement
- Added real-time regex detection for `[[...]]` patterns during typing
- Integrated SearchBar component directly within editor for inline entity selection
- Automatic text replacement using Slate Transforms API

**User Experience**

- Type `[[]]` to open search interface within the editor
- Search and select any Arc or Thing to create a link
- Links automatically navigate to the correct campaign context
- Visual styling distinguishes links from regular text

**Impact:** Enables seamless cross-referencing between campaign content, improving content discoverability and narrative coherence.

## Authentication Route Fix 27/08/2025

### Middleware Bug Fix

**Authentication Route Access**

- Fixed issue where unauthenticated users couldn't access auth routes (`/auth/login`, `/auth/register`)
- Added explicit check to allow unauthenticated access to auth routes before redirect logic
- Improved middleware flow to handle edge case where users were redirected away from login page

**Technical Details**

- Added conditional check: `if (context.url.pathname.startsWith('/auth') && !isAuthed)`
- This ensures users can reach login/register pages even when not authenticated
- Fixes circular redirect issue that could occur in certain scenarios

```typescript
// Added to middleware.ts
// Allows unauthenticated access to auth routes
if (context.url.pathname.startsWith('/auth') && !isAuthed) {
  return next()
}
```

**Impact:** Resolves authentication flow issues and ensures proper access to login/registration pages.

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
