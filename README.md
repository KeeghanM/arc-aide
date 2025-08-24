# ArcAide

A modern D&D campaign management application built with Astro, React, Tailwind CSS, Drizzle ORM, and more. ArcAide helps Dungeon Masters create compelling storylines, manage campaigns, and organize game content through an intuitive arc-based narrative structure.

## About ArcAide

ArcAide is designed specifically for Dungeon Masters who want to create more engaging and well-structured D&D campaigns. The application uses a narrative arc-based approach to help organize storylines, manage campaign content, and track important details throughout your game sessions.

### Key Concepts

- **Campaigns**: Top-level containers for your D&D campaigns
- **Arcs**: Narrative storylines within campaigns (Hook, Protagonist, Antagonist, Problem, Key, Outcome)
- **Things**: Campaign entities (NPCs, locations, items, plot devices) organized by custom types
- **Rich Text Editing**: Markdown-based content creation with real-time collaboration support

## Technologies Used

## Technologies Used

- **Astro**: Meta-framework for building fast websites with SSR capabilities
- **React**: Interactive UI components with TypeScript support
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Drizzle ORM**: Type-safe database operations with SQLite/Turso
- **Slate.js**: Rich text editing framework for content creation
- **Better Auth**: Modern authentication solution with session management
- **TanStack Query**: Powerful data fetching and state management
- **Zustand**: Lightweight state management for React
- **Honeybadger**: Error monitoring and reporting
- **PostHog**: Product analytics and user behavior tracking
- **Husky & Lint-Staged**: Git hooks and pre-commit quality automation
- **ESLint, Prettier, Stylelint**: Code quality and formatting tools

## Features

## Features

| Feature                | Status      | Description                                     |
| ---------------------- | ----------- | ----------------------------------------------- |
| Campaign Management    | ✅ Complete | Create and organize D&D campaigns               |
| Arc-based Storytelling | ✅ Complete | Structure narratives using the arc framework    |
| Rich Text Editing      | ✅ Complete | Slate.js-powered content creation               |
| Entity Management      | ✅ Complete | Manage NPCs, locations, items with custom types |
| Search & Discovery     | ✅ Complete | Full-text search across campaign content        |
| User Authentication    | ✅ Complete | Secure login with Better Auth                   |
| Responsive Design      | ✅ Complete | Mobile-friendly interface with Tailwind CSS     |
| Real-time Updates      | ✅ Complete | Optimistic UI updates with TanStack Query       |
| Error Monitoring       | ✅ Complete | Honeybadger integration                         |
| Analytics              | ✅ Complete | PostHog user behavior tracking                  |
| Code Quality           | ✅ Complete | ESLint, Prettier, Stylelint, Husky              |
| Database Migrations    | ✅ Complete | Drizzle ORM schema management                   |
| API Documentation      | ✅ Complete | Comprehensive API reference                     |
| Dark/Light Theme       | ✅ Complete | Theme toggle with system preference             |

## Getting Started

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Yarn package manager (recommended)
- Git

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd arc-aide
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the database**

   ```bash
   yarn migrate:db
   ```

5. **Start the development server**
   ```bash
   yarn dev
   ```

Visit `http://localhost:4321` to see your application running.

### Environment Configuration

Create a `.env` file with the following variables:

```bash
# Database
TURSO_DATABASE_URL="file:local.db"
TURSO_AUTH_TOKEN=""

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:4321"

# Optional: Email service
RESEND_API_KEY=""

# Optional: Monitoring and analytics
PUBLIC_HONEYBADGER_KEY=""
PUBLIC_POSTHOG_KEY=""
PUBLIC_POSTHOG_HOST=""
```

## Available Scripts

| Command           | Description                                       |
| ----------------- | ------------------------------------------------- |
| `yarn dev`        | Start the development server                      |
| `yarn build`      | Build for production                              |
| `yarn preview`    | Preview the production build                      |
| `yarn qa`         | Run all code quality checks (lint, style, format) |
| `yarn qa:fix`     | Auto-fix code quality issues                      |
| `yarn migrate:db` | Run Drizzle ORM database migrations               |

## Documentation

- **[Development Guide](./docs/development.md)** - Local setup and development workflow
- **[Architecture Overview](./docs/architecture.md)** - System design and technical decisions
- **[Database Schema](./docs/database.md)** - Database structure and relationships
- **[API Reference](./docs/api.md)** - Complete API endpoint documentation
- **[Deployment Guide](./docs/deployment.md)** - Production deployment instructions

## Project Structure

```
src/
├── components/              # React components
│   ├── app/                # Application-specific components
│   │   ├── components/     # Feature components (arcs, campaigns, etc.)
│   │   ├── hooks/          # Custom React hooks for data fetching
│   │   ├── screens/        # Page-level components
│   │   └── stores/         # Zustand state management
│   └── ui/                 # Reusable UI components (buttons, cards, etc.)
├── layouts/                # Astro layout components
├── lib/                    # Utilities and configurations
│   ├── auth/              # Authentication setup (Better Auth)
│   ├── db/                # Database configuration and schema
│   └── utils.ts           # Utility functions
├── pages/                 # Astro pages and API routes
│   ├── api/               # RESTful API endpoints
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Protected dashboard pages
├── styles/                # Global CSS and Tailwind configuration
docs/                      # Documentation
migrations/                # Database migration files
public/                    # Static assets
```

## Arc Framework

ArcAide uses a structured approach to storytelling based on narrative arcs. Each arc contains six key elements:

- **Hook**: The opening or inciting incident that draws players in
- **Protagonist**: The main character or hero of the story
- **Antagonist**: The opposition or conflict source
- **Problem**: The central challenge or conflict to be resolved
- **Key**: The solution, tool, or method to resolve the problem
- **Outcome**: The resolution and consequences of the arc

This framework helps Dungeon Masters create compelling, well-structured storylines that engage players and drive the narrative forward.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run quality checks (`yarn qa`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**ArcAide** - Create more compelling D&D campaigns, easily.
