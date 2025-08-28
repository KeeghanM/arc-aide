---
title: 'Overview'
description: 'Comprehensive documentation for all API endpoints in ArcAide.'
sidebar:
  order: 3
---

# API Reference

This document provides comprehensive documentation for all API endpoints in ArcAide.

:::tip[API Quick Start]
New to our API? Start with [Authentication](./authentication) to learn how to authenticate your requests, then explore the [Campaigns](./campaigns) endpoints.
:::

## Quick Navigation

- [Authentication](./authentication) - Session management and security
- [Campaigns](./campaigns) - Campaign CRUD operations
- [Arcs](./arcs) - Arc management and hierarchy
- [Things](./things) - Entity management and associations
- [Thing Types](./thing-types) - Category management
- [Search](./search) - Content search functionality
- [Data Types](./data-types) - TypeScript definitions and schemas
- [Error Handling](./error-handling) - Error responses and troubleshooting

## Overview

:::note[API Design Philosophy]
ArcAide provides a RESTful API designed for managing tabletop RPG campaign content with a focus on type safety and intuitive endpoints.
:::

ArcAide provides a RESTful API for managing tabletop RPG campaign content. All endpoints follow consistent patterns and return JSON responses.

### Base URL

```bash title="API Base URL"
https://your-domain.com/api/
```

All API endpoints are prefixed with `/api/`

### Content Format

:::caution[Rich Text Content]
Rich text content uses Slate.js document format for structured editing capabilities. Make sure to handle this format correctly in your applications.
:::

Rich text content uses Slate.js document format for structured editing capabilities.

### Response Format

All successful responses return appropriate HTTP status codes with JSON data. Error responses include descriptive error messages.

:::tip[Next Steps]
For detailed documentation on each endpoint category, please refer to the specific sections linked above. We recommend starting with the authentication flow before exploring other endpoints.
:::
