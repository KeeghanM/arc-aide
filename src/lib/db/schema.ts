import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

// Core tables
export const campaign = sqliteTable(
  'campaign',
  {
    id: integer('id').primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description', { mode: 'json' }),
    createdAt: integer('created_at', {
      mode: 'timestamp',
    }).notNull(),
    updatedAt: integer('updated_at', {
      mode: 'timestamp',
    }).notNull(),
    userId: text('user_id').notNull(),
  },
  (table) => [unique('user_campaignSlug_unique').on(table.userId, table.slug)]
)

export const arc = sqliteTable(
  'arc',
  {
    id: integer('id').primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    hook: text('hook', { mode: 'json' }),
    protagonist: text('protagonist', { mode: 'json' }),
    antagonist: text('antagonist', { mode: 'json' }),
    problem: text('problem', { mode: 'json' }),
    key: text('key'),
    outcome: text('outcome', { mode: 'json' }),
    createdAt: integer('created_at', {
      mode: 'timestamp',
    }).notNull(),
    updatedAt: integer('updated_at', {
      mode: 'timestamp',
    }).notNull(),
    campaignId: integer('campaign_id').notNull(),
  },
  (table) => [
    unique('campaign_arcSlug_unique').on(table.campaignId, table.slug),
  ]
)

export const thingType = sqliteTable('thing_type', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  campaignId: integer('campaign_id').notNull(),
})

export const thing = sqliteTable(
  'thing',
  {
    id: integer('id').primaryKey(),
    slug: text('slug').notNull(),
    typeId: integer('type_id')
      .notNull()
      .references(() => thingType.id, { onDelete: 'cascade' }),
    name: text('slug'),
    description: text('description', { mode: 'json' }),
    campaignId: integer('campaign_id').notNull(),
  },
  (table) => [
    unique('campaign_thingSlug_unique').on(table.campaignId, table.slug),
  ]
)

export const arcThing = sqliteTable(
  'arc_thing',
  {
    arcId: integer('arc_id')
      .notNull()
      .references(() => arc.id, { onDelete: 'cascade' }),
    thingId: integer('thing_id')
      .notNull()
      .references(() => thing.id, { onDelete: 'cascade' }),
  },
  (table) => [unique('arc_thing_unique').on(table.arcId, table.thingId)]
)

// Auth Tables
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', {
    mode: 'boolean',
  }).notNull(),
  image: text('image'),
  createdAt: integer('created_at', {
    mode: 'timestamp',
  }).notNull(),
  updatedAt: integer('updated_at', {
    mode: 'timestamp',
  }).notNull(),
})

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', {
    mode: 'timestamp',
  }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', {
    mode: 'timestamp',
  }).notNull(),
  updatedAt: integer('updated_at', {
    mode: 'timestamp',
  }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', {
    mode: 'timestamp',
  }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', {
    mode: 'timestamp',
  }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', {
    mode: 'timestamp',
  }).notNull(),
  updatedAt: integer('updated_at', {
    mode: 'timestamp',
  }).notNull(),
})

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', {
    mode: 'timestamp',
  }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
})
