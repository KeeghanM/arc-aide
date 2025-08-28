---
title: 'Theme System'
description: 'D&D-inspired design system, typography, colors, and component styling.'
---

# Theme System

ArcAide features a comprehensive theme system inspired by official D&D 5e materials, providing an authentic tabletop RPG experience through carefully crafted typography, colors, and styling.

## Design Philosophy

### Authenticity First

The theme system prioritizes authentic D&D 5e visual design while maintaining modern web usability:

- **Official Styling**: Matches the look and feel of official D&D materials
- **Professional Presentation**: Suitable for sharing content with players
- **Dual Modes**: Edit mode for content creation, View mode for presentation
- **Accessibility**: Maintains proper contrast and readability standards

### Mode-Based Design

The application operates in two distinct visual modes:

1. **Edit Mode** - Clean, functional interface optimized for content creation
2. **View Mode** - D&D-themed presentation optimized for reading and sharing

## Typography System

### D&D 5e Font Stack

ArcAide uses authentic D&D 5e fonts for different content types:

```css
/* Primary content font */
.font-bookinsanity {
  font-family: 'Bookinsanity', 'Book Antiqua', 'Palatino Linotype', serif;
}

/* Headers and titles */
.font-mr-eaves {
  font-family: 'Mr Eaves Small Caps', 'Cinzel', 'Times New Roman', serif;
}

/* Spell names and magical content */
.font-zatanna {
  font-family: 'Zatanna Misdirection', 'Metamorphous', cursive;
}

/* Stat blocks and monster names */
.font-nodesto {
  font-family: 'Nodesto Caps Condensed', 'Oswald', sans-serif;
}

/* Tables and compact information */
.font-scaly-sans {
  font-family: 'Scaly Sans', 'Source Sans Pro', sans-serif;
}

/* Drop caps and special styling */
.font-solbera {
  font-family: 'Solbera Imitation', 'Uncial Antiqua', cursive;
}

.font-dungeon {
  font-family: 'Dungeon Drop Case', 'Metamorphous', cursive;
}
```

### Typography Hierarchy

```css
/* Heading styles with D&D theming */
.dnd-h1 {
  @apply font-mr-eaves text-header-text border-header-underline mb-4 border-b-2 pb-2 text-4xl font-bold;
}

.dnd-h2 {
  @apply font-mr-eaves text-header-text border-header-underline mb-3 border-b pb-1 text-3xl font-semibold;
}

.dnd-h3 {
  @apply font-mr-eaves text-header-text mb-2 text-2xl font-medium;
}

/* Body text with appropriate line height */
.dnd-body {
  @apply font-bookinsanity text-body-text text-base leading-relaxed;
}

/* Special text styles */
.dnd-spell {
  @apply font-zatanna text-spell-text italic;
}

.dnd-stat-block {
  @apply font-nodesto text-sm font-bold tracking-wide uppercase;
}
```

## Color System

### Homebrewery-Inspired Palette

Colors designed to match official D&D materials:

```css
:root {
  /* Primary background colors */
  --color-background: #eee5ce; /* Parchment base */
  --color-accent: #e0e5c1; /* Subtle highlights */
  --color-card: #f2e5b5; /* Card backgrounds */

  /* Text colors */
  --color-header-text: #58180d; /* Headers and titles */
  --color-body-text: #000000; /* Primary body text */
  --color-caption-text: #766649; /* Subtle text */
  --color-spell-text: #58180d; /* Magical content */

  /* Accent and decoration */
  --color-header-underline: #c0ad6a; /* Section dividers */
  --color-horizontal-rule: #9c2b1b; /* Strong dividers */
  --color-watercolor-stain: #bbad82; /* Decorative elements */
  --color-footnotes: #c9ad6a; /* Footer content */

  /* Monster stat blocks */
  --color-monster-bg: #f2e5b5; /* Stat block background */
  --color-monster-border: #9c2b1b; /* Stat block borders */
}
```

### Theme Application

```css
/* View mode applies D&D theming */
.theme-dnd {
  background-color: var(--color-background);
  background-image: url('/images/parchmentBackground.jpg');
  background-size: cover;
  background-attachment: fixed;
}

/* Edit mode uses clean modern styling */
.theme-modern {
  background-color: #ffffff;
  color: #1a1a1a;
}
```

## Component Styling

### Card Components

D&D-styled content containers:

```css
.dnd-card {
  @apply bg-card border-monster-border rounded-lg border-2 p-4 shadow-lg;
  background-image: url('/images/parchmentBackground.jpg');
  background-size: cover;
}

.stat-block {
  @apply dnd-card border-monster-border;

  .stat-block-header {
    @apply font-nodesto border-monster-border mb-2 border-b-2 pb-2 text-center text-lg font-bold;
  }

  .stat-block-content {
    @apply space-y-2;
  }
}
```

### Rich Text Styling

Prose styling for D&D content:

```css
.prose-dnd {
  /* Headings */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply font-mr-eaves text-header-text;
  }

  h1 {
    @apply border-header-underline border-b-2 pb-2 text-4xl;
  }

  h2 {
    @apply border-header-underline border-b pb-1 text-3xl;
  }

  /* Body text */
  p,
  li {
    @apply font-bookinsanity text-body-text leading-relaxed;
  }

  /* Special elements */
  blockquote {
    @apply bg-accent border-header-underline border-l-4 py-2 pl-4 italic;
  }

  code {
    @apply bg-accent rounded px-2 py-1 font-mono text-sm;
  }

  /* Tables for stat blocks */
  table {
    @apply border-monster-border bg-monster-bg border-2;
  }

  th {
    @apply font-nodesto bg-monster-border p-2 text-center text-white;
  }

  td {
    @apply border-monster-border border p-2 text-center;
  }

  /* Links maintain D&D styling */
  a {
    @apply text-header-text hover:text-horizontal-rule underline;
  }
}
```

### Form Elements

D&D-themed form inputs for edit mode:

```css
.dnd-input {
  @apply bg-accent border-header-underline font-bookinsanity focus:border-header-text placeholder:text-caption-text rounded border-2 px-3 py-2 focus:outline-none;
}

.dnd-button {
  @apply bg-header-text text-background font-mr-eaves border-header-text hover:bg-background hover:text-header-text rounded border-2 px-4 py-2 transition-colors duration-200;
}

.dnd-select {
  @apply bg-accent border-header-underline font-bookinsanity focus:border-header-text rounded border-2 px-3 py-2 focus:outline-none;
}
```

## Layout Patterns

### Single-Column Narrative Flow (View Mode)

```css
.view-mode-layout {
  @apply mx-auto max-w-4xl px-6 py-8;

  /* Ensure proper reading flow */
  .content-section {
    @apply mb-8 space-y-4;
  }

  /* Drop caps for section starts */
  .section-start::first-letter {
    @apply font-solbera text-header-text float-left mt-1 mr-2 text-6xl leading-none;
  }
}
```

### Multi-Column Editing (Edit Mode)

```css
.edit-mode-layout {
  @apply mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-2;

  .editor-panel {
    @apply rounded-lg border bg-white p-4 shadow-sm;
  }

  .preview-panel {
    @apply bg-background rounded-lg border p-4;
  }
}
```

## Responsive Design

### Breakpoint Strategy

```css
/* Mobile-first responsive design */
.responsive-dnd {
  /* Mobile - Single column, simplified typography */
  @apply text-sm;

  /* Tablet */
  @screen md {
    @apply text-base;
    /* Enable two-column layout in edit mode */
  }

  /* Desktop */
  @screen lg {
    @apply text-lg;
    /* Full feature set, larger typography */
  }

  /* Large screens */
  @screen xl {
    /* Maximum content width, enhanced readability */
  }
}
```

### Font Loading Strategy

Optimized font loading for performance:

```typescript
// Font loading configuration
const fontConfigs = {
  'Bookinsanity': {
    family: 'Bookinsanity',
    variants: ['normal', 'italic', 'bold', 'bold-italic'],
    display: 'swap',
    preload: true, // Primary content font
  },
  'Mr Eaves Small Caps': {
    family: 'Mr Eaves Small Caps',
    variants: ['normal'],
    display: 'swap',
    preload: true, // Headers
  },
  'Nodesto Caps Condensed': {
    family: 'Nodesto Caps Condensed',
    variants: ['normal', 'bold', 'italic', 'bold-italic'],
    display: 'swap',
    preload: false, // Stat blocks only
  },
  // Other fonts loaded on demand
}

// Progressive font loading
function loadFonts() {
  fontConfigs.forEach((config) => {
    if (config.preload) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = `/fonts/${config.family}.otf`
      link.as = 'font'
      link.type = 'font/otf'
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    }
  })
}
```

## Theme Customization

### CSS Custom Properties

Customizable theme variables:

```css
/* Allow theme customization */
.theme-customizable {
  /* Users can override these variables */
  --custom-background: var(--color-background);
  --custom-text: var(--color-body-text);
  --custom-accent: var(--color-accent);
  --custom-border: var(--color-header-underline);

  /* Apply custom values */
  background-color: var(--custom-background);
  color: var(--custom-text);
}

/* Dark mode variant */
.theme-dark {
  --color-background: #2d2d2d;
  --color-accent: #3a3a3a;
  --color-header-text: #d4af37;
  --color-body-text: #e5e5e5;
  --color-caption-text: #a0a0a0;
}
```

### Component Variants

Flexible component styling:

```typescript
// Component variant system
const cardVariants = {
  default: 'bg-card border border-gray-200',
  dnd: 'bg-card border-2 border-monster-border dnd-card',
  stat: 'bg-monster-bg border-2 border-monster-border stat-block',
  clean: 'bg-white border border-gray-200 shadow-sm',
}

export function Card({ variant = 'default', className, ...props }) {
  return (
    <div
      className={cn(cardVariants[variant], className)}
      {...props}
    />
  )
}
```

## Print Styling

Optimized for physical printing:

```css
@media print {
  .theme-dnd {
    /* Remove background images for print */
    background-image: none !important;
    background-color: white !important;

    /* Ensure proper font scaling */
    font-size: 12pt;
    line-height: 1.4;
  }

  /* Hide interactive elements */
  .edit-controls,
  .navigation,
  .sidebar {
    display: none !important;
  }

  /* Optimize for page breaks */
  .stat-block,
  .content-section {
    break-inside: avoid;
  }

  /* Ensure proper margins */
  body {
    margin: 0.5in;
  }
}
```

This comprehensive theme system provides an authentic D&D experience while maintaining flexibility for different use cases and ensuring excellent performance across all devices.
