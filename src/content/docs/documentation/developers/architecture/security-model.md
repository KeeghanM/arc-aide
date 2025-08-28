---
title: 'Security Model'
description: 'Authentication, authorization, data protection, and security best practices.'
---

# Security Model

ArcAide implements a comprehensive security model covering authentication, authorization, data protection, and secure development practices.

## Authentication System

### Better Auth Integration

ArcAide uses Better Auth for modern, secure authentication:

```typescript
// lib/auth/config.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  advanced: {
    generateId: () => crypto.randomUUID(),
    crossSubDomainCookies: {
      enabled: false, // Single domain only
    },
  },
})
```

### Session Management

Secure session handling with automatic renewal:

```typescript
// Session configuration
interface SessionConfig {
  cookieName: 'better-auth.session_token'
  httpOnly: true
  secure: true // HTTPS only in production
  sameSite: 'lax'
  maxAge: 7 * 24 * 60 * 60 // 7 days
  domain: process.env.NODE_ENV === 'production' ? '.arcaide.com' : undefined
}

// Session validation middleware
export async function validateSession(request: Request) {
  const sessionToken = request.headers.get('cookie')
    ?.split(';')
    .find(c => c.trim().startsWith('better-auth.session_token='))
    ?.split('=')[1]

  if (!sessionToken) {
    return null
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    return session
  } catch (error) {
    console.error('Session validation error:', error)
    return null
  }
}
```

### Password Security

Secure password handling and requirements:

```typescript
// Password validation schema
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

// Better Auth handles:
// - bcrypt hashing with salt rounds
// - Password breach checking (optional)
// - Rate limiting for login attempts
// - Account lockout after failed attempts
```

## Authorization System

### Route Protection

Multi-layer route protection:

```typescript
// middleware.ts - Astro middleware
export async function onRequest(context, next) {
  const { url, request } = context

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/verify-email',
    '/api/auth/', // Auth endpoints
  ]

  const isPublicRoute = publicRoutes.some((route) =>
    url.pathname.startsWith(route)
  )

  if (isPublicRoute) {
    return next()
  }

  // Validate session for protected routes
  const session = await validateSession(request)

  if (!session?.user) {
    // Redirect to signin for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return Response.redirect(new URL('/auth/signin', url.origin))
    }

    // Return 401 for API requests
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Add user to context
  context.locals.user = session.user
  context.locals.session = session

  return next()
}
```

### API Endpoint Protection

Consistent API security patterns:

```typescript
// lib/auth/api-protection.ts
export async function withAuth<T>(
  request: Request,
  handler: (user: User, request: Request) => Promise<T>
): Promise<Response> {
  try {
    const session = await validateSession(request)

    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const result = await handler(session.user, request)

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('API handler error:', error)

    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// Usage in API routes
// pages/api/campaigns/[slug].ts
export async function GET({ request, params }) {
  return withAuth(request, async (user) => {
    const campaign = await getCampaign(params.slug, user.id)

    if (!campaign) {
      throw new Error('Campaign not found')
    }

    return campaign
  })
}
```

### Resource-Level Authorization

Campaign ownership validation:

```typescript
// lib/auth/resource-authorization.ts
export async function validateCampaignAccess(
  campaignSlug: string,
  userId: string
): Promise<Campaign> {
  const campaign = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.slug, campaignSlug), eq(campaigns.userId, userId)))
    .get()

  if (!campaign) {
    throw new Error('Campaign not found or access denied')
  }

  return campaign
}

export async function validateArcAccess(
  campaignSlug: string,
  arcSlug: string,
  userId: string
): Promise<{ campaign: Campaign; arc: Arc }> {
  // First validate campaign access
  const campaign = await validateCampaignAccess(campaignSlug, userId)

  // Then find arc within that campaign
  const arc = await db
    .select()
    .from(arcs)
    .where(and(eq(arcs.slug, arcSlug), eq(arcs.campaignId, campaign.id)))
    .get()

  if (!arc) {
    throw new Error('Arc not found')
  }

  return { campaign, arc }
}
```

## Data Protection

### Input Validation

Comprehensive input validation using Zod:

```typescript
// lib/validation/schemas.ts
export const createCampaignSchema = z.object({
  newCampaign: z.object({
    name: z
      .string()
      .min(1, 'Campaign name is required')
      .max(100, 'Campaign name too long')
      .regex(
        /^[a-zA-Z0-9\s\-_]+$/,
        'Campaign name contains invalid characters'
      ),
  }),
})

export const updateArcSchema = z.object({
  updatedArc: z.object({
    slug: z.string().min(1),
    name: z.string().min(1).max(100),
    parentArcId: z.number().positive().optional().nullable(),
    hook: richTextSchema.optional().nullable(),
    protagonist: richTextSchema.optional().nullable(),
    antagonist: richTextSchema.optional().nullable(),
    problem: richTextSchema.optional().nullable(),
    key: richTextSchema.optional().nullable(),
    outcome: richTextSchema.optional().nullable(),
    notes: richTextSchema.optional().nullable(),
  }),
})

// Rich text validation
const richTextSchema = z.array(
  z.object({
    type: z.string(),
    children: z.array(z.any()),
  })
)

// Usage in API handlers
export async function POST({ request, params }) {
  return withAuth(request, async (user) => {
    const body = await request.json()

    // Validate input
    const validation = createCampaignSchema.safeParse(body)
    if (!validation.success) {
      throw new Error('Invalid campaign data')
    }

    const { newCampaign } = validation.data

    // Process validated data
    return await createCampaign(newCampaign, user.id)
  })
}
```

### SQL Injection Prevention

Drizzle ORM provides built-in protection:

```typescript
// Safe parameterized queries
export async function getCampaignsByUser(userId: string) {
  return await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.userId, userId)) // Parameterized automatically
    .orderBy(desc(campaigns.updatedAt))
}

// Dynamic WHERE conditions are safe
export async function searchArcs(campaignId: number, query: string) {
  return await db
    .select()
    .from(arcs)
    .where(
      and(
        eq(arcs.campaignId, campaignId),
        sql`arcs.name LIKE ${`%${query}%`}` // Still parameterized
      )
    )
}
```

### XSS Prevention

Rich text content sanitization:

```typescript
// lib/security/sanitize.ts
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeRichText(content: Descendant[]): Descendant[] {
  return content.map((node) => sanitizeNode(node))
}

function sanitizeNode(node: Descendant): Descendant {
  if ('text' in node) {
    // Text nodes - escape HTML entities
    return {
      ...node,
      text: escapeHtml(node.text),
    }
  }

  // Element nodes - validate type and sanitize children
  const allowedTypes = [
    'paragraph',
    'heading',
    'bulleted-list',
    'numbered-list',
    'list-item',
    'blockquote',
    'code-block',
    'link',
  ]

  if (!allowedTypes.includes(node.type)) {
    // Convert unknown types to paragraphs
    return {
      type: 'paragraph',
      children: node.children.map(sanitizeNode),
    }
  }

  return {
    ...node,
    children: node.children.map(sanitizeNode),
  }
}

function escapeHtml(text: string): string {
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  }

  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char])
}
```

## CSRF Protection

Better Auth provides built-in CSRF protection:

```typescript
// Automatic CSRF token validation
// - Tokens generated for each session
// - Validated on state-changing operations
// - SameSite cookie attributes
// - Secure headers required

// Additional protection for sensitive operations
export async function withCSRF<T>(
  request: Request,
  handler: () => Promise<T>
): Promise<T> {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  // Verify origin matches host
  if (origin && !origin.endsWith(host)) {
    throw new Error('Invalid origin')
  }

  // Verify request is not from an iframe (if needed)
  const frameOptions = request.headers.get('x-frame-options')
  if (frameOptions === 'DENY') {
    throw new Error('Framed requests not allowed')
  }

  return handler()
}
```

## Error Handling and Monitoring

### Security-Aware Error Handling

Prevent information leakage:

```typescript
// lib/security/error-handling.ts
export function sanitizeError(error: unknown): { error: string } {
  if (error instanceof Error) {
    // Don't expose internal error details in production
    if (process.env.NODE_ENV === 'production') {
      return { error: 'Internal Server Error' }
    }

    // Filter out sensitive information
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /key/i,
      /database/i,
    ]

    const message = error.message
    const containsSensitive = sensitivePatterns.some((pattern) =>
      pattern.test(message)
    )

    if (containsSensitive) {
      return { error: 'Internal Server Error' }
    }

    return { error: message }
  }

  return { error: 'Unknown error occurred' }
}
```

### Security Monitoring

Integration with Honeybadger for security monitoring:

```typescript
// lib/monitoring/security.ts
import Honeybadger from '@honeybadger-io/js'

export function reportSecurityEvent(
  event: 'invalid_session' | 'unauthorized_access' | 'suspicious_activity',
  context: Record<string, any>
) {
  Honeybadger.notify(new Error(`Security event: ${event}`), {
    context: {
      ...context,
      securityEvent: true,
      timestamp: new Date().toISOString(),
    },
    tags: ['security', event],
  })
}

// Usage
export async function validateSession(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    return session
  } catch (error) {
    reportSecurityEvent('invalid_session', {
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      error: error.message,
    })
    return null
  }
}
```

## Security Headers

Essential security headers for all responses:

```typescript
// lib/security/headers.ts
export const securityHeaders = {
  // Prevent XSS attacks
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',

  // HTTPS enforcement
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',

  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.honeybadger.io",
    "frame-ancestors 'none'",
  ].join('; '),

  // Permissions Policy
  'Permissions-Policy': [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
  ].join(', '),
}

// Apply to all responses
export function addSecurityHeaders(response: Response): Response {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}
```

## Environment Security

### Secrets Management

Secure handling of environment variables:

```typescript
// lib/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_AUTH_TOKEN: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  HONEYBADGER_API_KEY: z.string().optional(),
  POSTHOG_KEY: z.string().optional(),
})

export const env = envSchema.parse(process.env)

// Never log or expose sensitive values
export function getRedactedEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV,
    // Never include secrets
  }
}
```

This comprehensive security model ensures that ArcAide maintains strong security posture across all layers of the application while providing a smooth user experience.
