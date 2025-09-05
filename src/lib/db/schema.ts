import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

// Core tables
export const campaign = sqliteTable(
  'campaign',
  {
    id: integer('id').primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description', { mode: 'json' }),
    published: integer('published', {
      mode: 'boolean',
    })
      .notNull()
      .default(false),
    createdAt: integer('created_at', {
      mode: 'timestamp',
    }).notNull(),
    updatedAt: integer('updated_at', {
      mode: 'timestamp',
    }).notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
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
    key: text('key', { mode: 'json' }),
    outcome: text('outcome', { mode: 'json' }),
    notes: text('notes', { mode: 'json' }),
    // Plain text versions for search indexing
    hookText: text('hook_text').default(''),
    protagonistText: text('protagonist_text').default(''),
    antagonistText: text('antagonist_text').default(''),
    problemText: text('problem_text').default(''),
    outcomeText: text('outcome_text').default(''),
    notesText: text('notes_text').default(''),
    published: integer('published', {
      mode: 'boolean',
    })
      .notNull()
      .default(false),
    createdAt: integer('created_at', {
      mode: 'timestamp',
    }).notNull(),
    updatedAt: integer('updated_at', {
      mode: 'timestamp',
    }).notNull(),
    campaignId: integer('campaign_id')
      .notNull()
      .references(() => campaign.id, {
        onDelete: 'cascade',
      }),
    parentArcId: integer('parent_arc_id'),
  },
  (table) => [
    unique('campaign_arcSlug_unique').on(table.campaignId, table.slug),
  ]
)

export const thingType = sqliteTable('thing_type', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  campaignId: integer('campaign_id')
    .notNull()
    .references(() => campaign.id, {
      onDelete: 'cascade',
    }),
})

export const thing = sqliteTable(
  'thing',
  {
    id: integer('id').primaryKey(),
    slug: text('slug').notNull(),
    typeId: integer('type_id')
      .notNull()
      .references(() => thingType.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description', { mode: 'json' }),
    // Plain text version for search indexing
    descriptionText: text('description_text').default(''),
    published: integer('published', {
      mode: 'boolean',
    })
      .notNull()
      .default(false),
    campaignId: integer('campaign_id')
      .notNull()
      .references(() => campaign.id, {
        onDelete: 'cascade',
      }),
    createdAt: integer('created_at', {
      mode: 'timestamp',
    }).notNull(),
    updatedAt: integer('updated_at', {
      mode: 'timestamp',
    }).notNull(),
  },
  (table) => [
    unique('campaign_thingSlug_unique').on(table.campaignId, table.slug),
  ]
)

export const asset = sqliteTable('asset', {
  id: integer('id').primaryKey(),
  label: text('label').notNull(),
  cloudflareId: text('cloudflare_id').notNull().unique(),
  url: text('url').notNull(),
  campaignId: integer('campaign_id')
    .notNull()
    .references(() => campaign.id, {
      onDelete: 'cascade',
    }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', {
    mode: 'timestamp',
  }).notNull(),
})

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
  username: text('username').unique(),
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

// Relations
export const arcRelations = relations(arc, ({ one, many }) => ({
  parentArc: one(arc, {
    fields: [arc.parentArcId],
    references: [arc.id],
    relationName: 'parentArc',
  }),
  childArcs: many(arc, {
    relationName: 'parentArc',
  }),
  campaign: one(campaign, {
    fields: [arc.campaignId],
    references: [campaign.id],
  }),
  arcThings: many(arcThing),
}))

export const campaignRelations = relations(campaign, ({ many, one }) => ({
  arcs: many(arc),
  things: many(thing),
  thingTypes: many(thingType),
  user: one(user, {
    fields: [campaign.userId],
    references: [user.id],
  }),
}))

export const thingRelations = relations(thing, ({ one, many }) => ({
  thingType: one(thingType, {
    fields: [thing.typeId],
    references: [thingType.id],
  }),
  campaign: one(campaign, {
    fields: [thing.campaignId],
    references: [campaign.id],
  }),
  arcThings: many(arcThing),
}))

export const thingTypeRelations = relations(thingType, ({ one, many }) => ({
  campaign: one(campaign, {
    fields: [thingType.campaignId],
    references: [campaign.id],
  }),
  things: many(thing),
}))

export const arcThingRelations = relations(arcThing, ({ one }) => ({
  arc: one(arc, {
    fields: [arcThing.arcId],
    references: [arc.id],
  }),
  thing: one(thing, {
    fields: [arcThing.thingId],
    references: [thing.id],
  }),
}))

export const userRelations = relations(user, ({ many }) => ({
  campaigns: many(campaign),
  sessions: many(session),
  accounts: many(account),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))
