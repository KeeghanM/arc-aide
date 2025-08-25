# Contributing to ArcAide

Thank you for your interest in contributing to ArcAide! This guide will help you get started.

## Development Setup

Please see our [Development Guide](./docs/development.md) for detailed setup instructions.

## Code Quality Standards

### Code Style

- **TypeScript** for all new code
- **ESLint** and **Prettier** for consistent formatting
- **JSDoc comments** for public functions and complex logic
- **Meaningful variable and function names**

### Before Submitting

Run quality checks:

```bash
yarn qa        # Check all quality issues
yarn qa:fix    # Auto-fix what can be fixed
```

### Documentation Standards

- Update relevant documentation when adding features
- Include JSDoc comments for new functions
- Add inline comments for complex business logic
- Update API documentation for new endpoints

## Commit Guidelines

Use conventional commit format:

```
feat: add user authentication
fix: resolve database connection issue
docs: update API documentation
refactor: simplify search logic
```

## Pull Request Process

1. **Fork** the repository
2. **Create a feature branch** from main
3. **Make your changes** with tests if applicable
4. **Run quality checks** (`yarn qa`)
5. **Update documentation** as needed
6. **Submit pull request** with clear description

## Code Architecture

### API Endpoints

- Follow RESTful conventions
- Include proper error handling
- Add JSDoc comments for complex logic
- Validate input with Zod schemas

### Database Changes

- Use Drizzle migrations for schema changes
- Update documentation when schema changes
- Consider backward compatibility

### Frontend Components

- Follow React best practices
- Use TypeScript for props
- Keep components focused and small
- Document complex component logic

## Questions?

Feel free to open an issue for questions or suggestions!
