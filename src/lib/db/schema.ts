import { relations, sql } from 'drizzle-orm'
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  unique,
} from 'drizzle-orm/sqlite-core'

/* CORE TABLES
These are the arc-aide core tables, for things like campaigns, arcs, and things. Modifying these may risk data loss, so be careful!
*/
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
    keyText: text('key_text').default(''),
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

export const thingThing = sqliteTable(
  'thing_thing',
  {
    id: integer('id').primaryKey(),
    firstThingId: integer('first_thing_id')
      .notNull()
      .references(() => thing.id, { onDelete: 'cascade' }),
    secondThingId: integer('second_thing_id')
      .notNull()
      .references(() => thing.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    unique('thing_thing_unique').on(table.firstThingId, table.secondThingId),
    // Ensure firstThingId < secondThingId to prevent duplicate relationships
    check(
      'first_thing_less_than_second',
      sql`first_thing_id < second_thing_id`
    ),
  ]
)
export const arcArc = sqliteTable(
  'arc_arc',
  {
    id: integer('id').primaryKey(),
    firstArcId: integer('first_arc_id')
      .notNull()
      .references(() => arc.id, { onDelete: 'cascade' }),
    secondArcId: integer('second_arc_id')
      .notNull()
      .references(() => arc.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    unique('arc_arc_unique').on(table.firstArcId, table.secondArcId),
    // Ensure firstArcId < secondArcId to prevent duplicate relationships
    check('first_arc_less_than_second', sql`first_arc_id < second_arc_id`),
  ]
)

/* FTS TABLES
These are here to support full-text search.
*/
export const searchVocabulary = sqliteTable(
  'search_vocabulary',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    term: text().notNull(),
    frequency: integer().default(1),
    createdAt: integer('created_at', {
      mode: 'timestamp',
    }).notNull(),
  },
  (table) => [index('idx_search_vocabulary_term').on(table.term)]
)
// The other FTS tables are created via migrations, as they require special handling because Drizzle doesn't support VIRTUAL tables yet.
// CREATE VIRTUAL TABLE search_index_fts_aux USING fts5vocab
// CREATE VIRTUAL TABLE search_index_fts
// Check the Migrsations for details.

/* OTHER TABLES
These are other tables used by the app, like for assets.
*/
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

/* AUTH TABLES
These are the tables used by next-auth for authentication. These should never be modified unless absolutely necessary, as it may break auth functionality.
*/
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  username: text('username').unique(),
  displayUsername: text('display_username'),
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

/* RELATIONSHIPS
These define relationships between the tables, for easier querying.
*/
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

export const thingThingRelations = relations(thingThing, ({ one }) => ({
  firstThing: one(thing, {
    fields: [thingThing.firstThingId],
    references: [thing.id],
    relationName: 'firstThing',
  }),
  secondThing: one(thing, {
    fields: [thingThing.secondThingId],
    references: [thing.id],
    relationName: 'secondThing',
  }),
}))

export const arcArcRelations = relations(arcArc, ({ one }) => ({
  firstArc: one(arc, {
    fields: [arcArc.firstArcId],
    references: [arc.id],
    relationName: 'firstArc',
  }),
  secondArc: one(arc, {
    fields: [arcArc.secondArcId],
    references: [arc.id],
    relationName: 'secondArc',
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
