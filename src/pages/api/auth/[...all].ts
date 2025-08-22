import { auth } from '@auth/auth'
import Honeybadger from '@honeybadger-io/js'
import type { APIRoute } from 'astro'

export const ALL: APIRoute = async (ctx) => {
  try {
    await auth.handler(ctx.request)
  } catch (error) {
    console.error('Auth Error:', error)
    Honeybadger.notify(error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
