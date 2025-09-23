import { auth } from '@auth/auth'
import type { TArc } from '@components/app/hooks/useArcQueries'
import { db } from '@db/db'
import { arc, campaign, thing } from '@db/schema'
import Honeybadger from '@honeybadger-io/js'
import { slateToPlainText } from '@utils/slate-text-extractor'
import { slugify } from '@utils/string'
import type { APIRoute } from 'astro'
import { and, eq, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import type { Descendant } from 'slate'
import * as z from 'zod'

/**
 * GET /api/campaigns/[campaignSlug]/arcs/[arcSlug]
 * Retrieves a specific arc within a campaign
 */
export const GET: APIRoute = async ({ request, params }) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    const { campaignSlug, arcSlug } = params

    // First verify the campaign exists and belongs to the user
    const campaignResult = await db
      .select({ id: campaign.id })
      .from(campaign)
      .where(
        and(
          eq(campaign.slug, campaignSlug as string),
          eq(campaign.userId, session.user.id)
        )
      )

    if (campaignResult.length === 0) {
      return new Response(JSON.stringify({ error: 'Campaign not found' }), {
        status: 404,
      })
    }

    const parent = alias(arc, 'parent')

    const arcResult = await db
      .select({
        arc: {
          ...arc,
          parentArc: parent,
        },
      })
      .from(arc)
      .fullJoin(parent, eq(arc.parentArcId, parent.id))
      .where(
        and(
          eq(arc.slug, arcSlug as string),
          eq(arc.campaignId, campaignResult[0].id)
        )
      )

    const arcData = arcResult[0]?.arc as TArc

    if (!arcData) {
      return new Response(JSON.stringify({ error: 'Arc not found' }), {
        status: 404,
      })
    }

    const childArcs = await db
      .select()
      .from(arc)
      .where(eq(arc.parentArcId, arcData.id))

    arcData.childArcs = childArcs
    arcData.parentArc = arcData.parentArcId ? arcData.parentArc : undefined

    return new Response(JSON.stringify(arcData), { status: 200 })
  } catch (error) {
    console.error('Error fetching arc:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}

/**
 * PUT /api/campaigns/[campaignSlug]/arcs/[arcSlug]
 * Updates an existing arc within a campaign and returns the full updated arc
 *
 * @param request.body.updatedArc - Arc update data
 * @param request.body.updatedArc.slug - Arc slug (required)
 * @param request.body.updatedArc.name - Arc name (optional, 1-255 characters)
 * @param request.body.updatedArc.hook - Hook content (optional, Slate.js format)
 * @param request.body.updatedArc.protagonist - Protagonist content (optional, Slate.js format)
 * @param request.body.updatedArc.antagonist - Antagonist content (optional, Slate.js format)
 * @param request.body.updatedArc.problem - Problem content (optional, Slate.js format)
 * @param request.body.updatedArc.key - Key content (optional, Slate.js format)
 * @param request.body.updatedArc.outcome - Outcome content (optional, Slate.js format)
 * @param request.body.updatedArc.notes - Notes content (optional, Slate.js format)
 * @param request.body.updatedArc.parentArcId - Parent Arc ID (optional, can be null)
 * @param request.body.updatedArc.published - Published status (optional, boolean)
 * @param request.body.relatedItems - Array of related items to link to this arc (optional)
 *
 * @example
 * ```json
 * {
 *   "updatedArc": {
 *     "slug": "goblin-ambush",
 *     "name": "The Goblin Ambush - Updated",
 *     "hook": [{"type": "paragraph", "children": [{"text": "The party encounters goblins..."}]}]
 *     "protagonist": [{"type": "paragraph", "children": [{"text": "A brave knight..."}]}],
 *   },
 *   "relatedItems": [
 *    { "type": "thing", "slug": "goblin-sword" },
 *    { "type": "arc", "slug": "goblin-hideout" }
 *    ]
 * }
 * ```
 *
 * @returns {TArc} The full updated arc object
 */
export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    const { campaignSlug, arcSlug } = params

    if (
      !campaignSlug ||
      !z.string().nonempty().safeParse(campaignSlug).success
    ) {
      return new Response(JSON.stringify({ error: 'Invalid campaign slug' }), {
        status: 400,
      })
    }

    if (!arcSlug || !z.string().nonempty().safeParse(arcSlug).success) {
      return new Response(JSON.stringify({ error: 'Invalid arc slug' }), {
        status: 400,
      })
    }

    // First verify the campaign exists and belongs to the user
    const campaignResult = await db
      .select({ id: campaign.id })
      .from(campaign)
      .where(
        and(
          eq(campaign.slug, campaignSlug),
          eq(campaign.userId, session.user.id)
        )
      )

    if (campaignResult.length === 0) {
      return new Response(JSON.stringify({ error: 'Campaign not found' }), {
        status: 404,
      })
    }

    // Verify the arc exists in this campaign
    const existingArc = await db
      .select()
      .from(arc)
      .where(
        and(
          eq(arc.slug, arcSlug as string),
          eq(arc.campaignId, campaignResult[0].id)
        )
      )

    if (existingArc.length === 0) {
      return new Response(JSON.stringify({ error: 'Arc not found' }), {
        status: 404,
      })
    }

    const UpdatedArc = z.object({
      slug: z.string().min(1).max(255),
      name: z.string().min(1).max(255).optional(),
      hook: z.array(z.unknown()).optional() as z.ZodType<Descendant[]>,
      protagonist: z.array(z.unknown()).optional() as z.ZodType<Descendant[]>,
      antagonist: z.array(z.unknown()).optional() as z.ZodType<Descendant[]>,
      problem: z.array(z.unknown()).optional() as z.ZodType<Descendant[]>,
      key: z.array(z.unknown()).optional() as z.ZodType<Descendant[], any, any>,
      outcome: z.array(z.unknown()).optional() as z.ZodType<Descendant[]>,
      notes: z.array(z.unknown()).optional() as z.ZodType<Descendant[]>,
      parentArcId: z.number().nullable().optional(),
      published: z.boolean().optional(),
    })

    const { updatedArc } = await request.json()
    const parsedArc = UpdatedArc.safeParse(updatedArc)

    if (!parsedArc.success) {
      return new Response(JSON.stringify({ error: 'Invalid arc data' }), {
        status: 400,
      })
    }

    const now = new Date()
    const updateData: any = {
      updatedAt: now,
    }

    // Add optional fields if provided
    if (parsedArc.data.name !== undefined) {
      updateData.name = parsedArc.data.name
      // Only update slug if name is being changed
      if (parsedArc.data.slug !== arcSlug) {
        updateData.slug = slugify(parsedArc.data.name)
      }
    }
    if (parsedArc.data.parentArcId !== undefined)
      updateData.parentArcId = parsedArc.data.parentArcId
    if (parsedArc.data.hook !== undefined) {
      updateData.hook = parsedArc.data.hook
      updateData.hookText = slateToPlainText(parsedArc.data.hook)
    }
    if (parsedArc.data.protagonist !== undefined) {
      updateData.protagonist = parsedArc.data.protagonist
      updateData.protagonistText = slateToPlainText(parsedArc.data.protagonist)
    }
    if (parsedArc.data.antagonist !== undefined) {
      updateData.antagonist = parsedArc.data.antagonist
      updateData.antagonistText = slateToPlainText(parsedArc.data.antagonist)
    }
    if (parsedArc.data.problem !== undefined) {
      updateData.problem = parsedArc.data.problem
      updateData.problemText = slateToPlainText(parsedArc.data.problem)
    }
    if (parsedArc.data.key !== undefined) {
      updateData.key = parsedArc.data.key
      updateData.keyText = slateToPlainText(parsedArc.data.key)
    }
    if (parsedArc.data.outcome !== undefined) {
      updateData.outcome = parsedArc.data.outcome
      updateData.outcomeText = slateToPlainText(parsedArc.data.outcome)
    }
    if (parsedArc.data.notes !== undefined) {
      updateData.notes = parsedArc.data.notes
      updateData.notesText = slateToPlainText(parsedArc.data.notes)
    }
    if (parsedArc.data.published !== undefined)
      updateData.published = parsedArc.data.published

    // If no fields to update, return early
    if (Object.keys(updateData).length === 1) {
      return new Response(JSON.stringify(existingArc[0]), { status: 200 })
    }
    // Update the arc and get the updated row
    const [returnedArc] = await db
      .update(arc)
      .set(updateData)
      .where(eq(arc.id, existingArc[0].id))
      .returning()

    // If the Arcs slug has changed, we need to update all links to it in the entries
    if (updateData.slug) {
      const oldLink = `[[arc#${arcSlug}]]`
      const newLink = `[[arc#${updateData.slug}]]`

      await db.run(sql`
        UPDATE ${arc} SET 
          ${arc.hook} = REPLACE(${arc.hook}, ${oldLink}, ${newLink}),
          ${arc.protagonist} = REPLACE(${arc.protagonist}, ${oldLink}, ${newLink}),
          ${arc.antagonist} = REPLACE(${arc.antagonist}, ${oldLink}, ${newLink}),
          ${arc.problem} = REPLACE(${arc.problem}, ${oldLink}, ${newLink}),
          ${arc.key} = REPLACE(${arc.key}, ${oldLink}, ${newLink}),
          ${arc.outcome} = REPLACE(${arc.outcome}, ${oldLink}, ${newLink}),
          ${arc.notes} = REPLACE(${arc.notes}, ${oldLink}, ${newLink}),
          ${arc.hookText} = REPLACE(${arc.hookText}, ${oldLink}, ${newLink}),
          ${arc.protagonistText} = REPLACE(${arc.protagonistText}, ${oldLink}, ${newLink}),
          ${arc.antagonistText} = REPLACE(${arc.antagonistText}, ${oldLink}, ${newLink}),
          ${arc.problemText} = REPLACE(${arc.problemText}, ${oldLink}, ${newLink}),
          ${arc.outcomeText} = REPLACE(${arc.outcomeText}, ${oldLink}, ${newLink}),
          ${arc.keyText} = REPLACE(${arc.keyText}, ${oldLink}, ${newLink}),
          ${arc.notesText} = REPLACE(${arc.notesText}, ${oldLink}, ${newLink})
        WHERE ${arc.campaignId} = ${returnedArc.campaignId}
      `)

      await db.run(sql`
        UPDATE ${thing} SET 
          ${thing.description} = REPLACE(${thing.description}, ${oldLink}, ${newLink}),
          ${thing.descriptionText} = REPLACE(${thing.descriptionText}, ${oldLink}, ${newLink})
        WHERE ${thing.campaignId} = ${returnedArc.campaignId}
      `)
    }

    // Fetch parent arc if parentArcId exists
    let parentArc = null
    if (returnedArc.parentArcId) {
      const parentArcResult = await db
        .select()
        .from(arc)
        .where(eq(arc.id, updatedArc.parentArcId))
      parentArc = parentArcResult[0] ?? null
    }

    // Attach parentArc to result
    const fullArc = { ...updatedArc, parentArc } as TArc

    await db
      .update(campaign)
      .set({
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(campaign.userId, session.user.id),
          eq(campaign.slug, campaignSlug)
        )
      )

    return new Response(JSON.stringify(fullArc), { status: 200 })
  } catch (error) {
    console.error('Error updating arc:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}

/**
 * DELETE /api/campaigns/[campaignSlug]/arcs/[arcSlug]
 * Deletes an existing arc from a campaign
 */
export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    const { campaignSlug, arcSlug } = params

    // First verify the campaign exists and belongs to the user
    const campaignResult = await db
      .select({ id: campaign.id })
      .from(campaign)
      .where(
        and(
          eq(campaign.slug, campaignSlug as string),
          eq(campaign.userId, session.user.id)
        )
      )

    if (campaignResult.length === 0) {
      return new Response(JSON.stringify({ error: 'Campaign not found' }), {
        status: 404,
      })
    }

    // Verify the arc exists in this campaign
    const existingArc = await db
      .select()
      .from(arc)
      .where(
        and(
          eq(arc.slug, arcSlug as string),
          eq(arc.campaignId, campaignResult[0].id)
        )
      )

    if (existingArc.length === 0) {
      return new Response(JSON.stringify({ error: 'Arc not found' }), {
        status: 404,
      })
    }

    await db.delete(arc).where(eq(arc.id, existingArc[0].id))

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Error deleting arc:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}
