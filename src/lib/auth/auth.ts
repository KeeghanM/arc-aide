import { db } from '@db/db'
import * as schema from '@db/schema'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { username } from 'better-auth/plugins'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),
  emailAndPassword: { enabled: true },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
      usernameValidator: (username) => {
        // Only allow alphanumeric characters, underscores, and hyphens
        return /^[a-zA-Z0-9_-]+$/.test(username)
      },
    }),
  ],
})
