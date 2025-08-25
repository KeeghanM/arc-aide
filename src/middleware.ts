import { auth } from '@auth/auth'
import { defineMiddleware } from 'astro:middleware'

/**
 * Authentication Middleware
 *
 * Protects routes and manages authentication state across the application.
 * Implements a performance-optimized approach by checking route patterns
 * before making expensive database calls for session validation.
 *
 * Route Protection Strategy:
 * - Public routes: No auth check (performance optimization)
 * - Protected routes (/dashboard/*): Require valid session
 * - Auth routes (/auth/*): Redirect authenticated users to dashboard
 */

const PROTECTED_ROUTES = ['/dashboard']
const AUTH_ROUTES = ['/auth']

export const onRequest = defineMiddleware(async (context, next) => {
  // --- Performance optimization: Skip auth check for public routes ---
  // Check non-protected routes first to avoid unnecessary DB queries
  if (
    !PROTECTED_ROUTES.some((route) => context.url.pathname.startsWith(route)) &&
    !AUTH_ROUTES.some((route) => context.url.pathname.startsWith(route))
  ) {
    return next()
  }

  // --- Session validation ---
  const isAuthed = await auth.api.getSession({
    headers: context.request.headers,
  })

  // Make user/session available to all pages via Astro locals
  context.locals.user = isAuthed ? isAuthed.user : null
  context.locals.session = isAuthed ? isAuthed.session : null

  // --- Route protection logic ---
  // Redirect unauthenticated users to login with return URL
  if (!isAuthed) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/auth/login?redirect=${encodeURIComponent(context.url.pathname)}`,
      },
    })
  }

  // Redirect authenticated users away from auth pages
  if (context.url.pathname.startsWith('/auth')) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/dashboard`,
      },
    })
  }

  // Everything is good, proceed to route
  return next()
})
