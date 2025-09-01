---
title: 'Technology Stack'
description: 'Complete overview of technologies, frameworks, and tools used in ArcAide.'
---

# Technology Stack

ArcAide is built using modern web technologies chosen for performance, developer experience, and maintainability.

## Frontend Technologies

### Core Framework

**Astro** - Meta-framework for static site generation with SSR capabilities

- Provides excellent performance through partial hydration
- Server-side rendering for better SEO and initial load times
- Island architecture allows selective component hydration
- Built-in optimization for images and assets

**React** - Component library for interactive UI elements

- Used selectively for interactive components only
- Leverages Astro's island architecture for optimal performance
- Provides familiar development patterns and extensive ecosystem

### Styling and UI

**Tailwind CSS** - Utility-first CSS framework

- Rapid UI development with utility classes
- Built-in design system and responsive design
- Excellent performance through unused CSS purging
- Easy customization and theme extension

**Slate.js** - Rich text editing framework for content creation

- Highly customizable rich text editor
- Supports complex content structures and custom elements
- Provides excellent performance for large documents
- Enables wiki-style internal linking system

### State Management

**TanStack Query** - Data fetching and state management

- Server state synchronization and caching
- Automatic background refetching and cache invalidation
- Optimistic updates for better user experience
- Built-in loading and error states

**Zustand** - Lightweight state management

- Minimal boilerplate for client-side state
- TypeScript-first design
- Excellent performance and small bundle size
- Perfect for UI state and user preferences

## Backend Technologies

### Server Framework

**Astro API Routes** - Server-side API endpoints

- File-based routing system
- TypeScript support out of the box
- Excellent integration with frontend components
- Built-in middleware support

### Authentication

**Better Auth** - Authentication and session management

- Modern authentication patterns
- Secure session handling with cookies
- Multiple provider support (email/password, OAuth)
- Built-in CSRF protection and security features

### Database Layer

**Drizzle ORM** - Type-safe database operations

- Full TypeScript integration with schema definitions
- Excellent performance with prepared statements
- Migration system with version control
- SQL-first approach with safety guarantees

**Turso/LibSQL** - Distributed SQLite database

- SQLite compatibility with scaling capabilities
- Built-in full-text search (FTS) support
- Low latency through edge distribution
- Cost-effective for small to medium applications

## External Services

### Asset Management

**Cloudflare Images** - Image storage and optimization

- Global CDN delivery for fast image loading
- Automatic image optimization and variant generation
- Secure direct upload with signed URLs
- Cost-effective storage with generous free tier
- Built-in image transformations and resizing

### Payment Processing

**Kill Bill** - Subscription and billing management

- Flexible subscription billing and management
- Usage tracking and premium feature gating
- Multiple payment provider integration
- Dunning management and retry logic

## Development Tools

### Code Quality

**TypeScript** - Type safety across the entire stack

- Compile-time error detection
- Excellent IDE support and autocomplete
- Consistent interfaces between frontend and backend
- Improved refactoring capabilities

**ESLint** - Code linting and quality enforcement

- Catches potential bugs and code smells
- Enforces consistent coding standards
- Custom rules for project-specific patterns
- Integration with popular IDEs

**Prettier** - Code formatting

- Consistent code style across the team
- Automatic formatting on save
- Reduces bike-shedding about code style
- Integrates with Git hooks for enforcement

### Development Workflow

**Husky** - Git hooks for pre-commit quality checks

- Runs linting and type checking before commits
- Prevents broken code from entering the repository
- Enforces code quality standards automatically
- Easy to configure and customize

### Monitoring and Analytics

**PostHog** - Analytics and user behavior tracking

- Privacy-focused analytics platform
- Feature flags and A/B testing capabilities
- User session recordings and heatmaps
- Self-hosted option for data privacy

**Honeybadger** - Error monitoring and reporting

- Real-time error tracking and alerting
- Performance monitoring and insights
- Integration with development workflow
- Detailed error context and stack traces

## Architecture Choices

### Why Astro?

- **Performance**: Island architecture provides optimal loading
- **SEO**: Server-side rendering improves search visibility
- **Developer Experience**: Familiar React patterns with better performance
- **Flexibility**: Can integrate with any UI framework as needed

### Why SQLite/Turso?

- **Simplicity**: Single file database, easy to backup and migrate
- **Performance**: Excellent read performance for content-heavy applications
- **Full-Text Search**: Built-in FTS support for search functionality
- **Scaling**: Turso provides distributed SQLite for growth

### Why Better Auth?

- **Security**: Modern security practices built-in
- **Simplicity**: Easy to set up and configure
- **Flexibility**: Supports multiple authentication methods
- **TypeScript**: Full type safety for auth flows

### Why Slate.js?

- **Customization**: Highly customizable for our specific needs
- **Performance**: Excellent performance with large documents
- **Extensibility**: Easy to add custom elements and behaviors
- **Modern**: React-based with hooks and modern patterns

### Why Cloudflare Images?

- **Performance**: Global CDN ensures fast image delivery worldwide
- **Cost-effective**: Generous free tier with reasonable pricing at scale
- **Automatic optimization**: Intelligent compression and format selection
- **Developer experience**: Simple API with secure direct uploads
- **Variant generation**: Automatic creation of different image sizes

## Bundle Size and Performance

### Frontend Bundle Analysis

- **Astro Islands**: Only interactive components are shipped to client
- **Code Splitting**: Automatic route-based and component-based splitting
- **Tree Shaking**: Unused code eliminated during build
- **Asset Optimization**: Images, CSS, and JavaScript optimized automatically

### Runtime Performance

- **Server-Side Rendering**: Fast initial page loads
- **Selective Hydration**: Only necessary components become interactive
- **Efficient Database Queries**: Optimized queries with proper indexing
- **Caching Strategy**: Browser caching for static assets

## Development Environment

### Required Tools

- **Node.js** (18+) - JavaScript runtime
- **npm/pnpm** - Package manager
- **Git** - Version control
- **VS Code** (recommended) - Editor with excellent TypeScript support

### Recommended Extensions

- **Astro** - Official Astro language support
- **TypeScript** - Enhanced TypeScript features
- **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes
- **ESLint** - Real-time linting feedback
- **Prettier** - Automatic code formatting

### Local Development Stack

- **Vite** - Fast development server and build tool
- **Hot Module Replacement** - Instant updates during development
- **TypeScript Compiler** - Real-time type checking
- **Local Database** - SQLite file for development

This technology stack provides a solid foundation for building a modern, performant, and maintainable web application while keeping complexity manageable for a small development team.
