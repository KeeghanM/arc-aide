import { auth } from '@auth/auth'
import { defineMiddleware } from 'astro:middleware'

const PROTECTED_ROUTES = ['/dashboard']
const AUTH_ROUTES = ['/auth']

export const onRequest = defineMiddleware(async (context, next) => {
  // We check for a non-protected route first, allowing us to skip
  // unnecessary auth checks on public routes, saving DB queries.
  // Because we redirect logged-in users away from auth routes, we
  // want to handle them later
  if (
    !PROTECTED_ROUTES.some((route) => context.url.pathname.startsWith(route)) &&
    !AUTH_ROUTES.some((route) => context.url.pathname.startsWith(route))
  ) {
    return next()
  }

  const isAuthed = await auth.api.getSession({
    headers: context.request.headers,
  })

  context.locals.user = isAuthed ? isAuthed.user : null
  context.locals.session = isAuthed ? isAuthed.session : null

  // Accessing a protected route without being logged in
  if (!isAuthed) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/auth/login?redirect=${encodeURIComponent(context.url.pathname)}`,
      },
    })
  }

  // Accessing an auth route while logged in
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
