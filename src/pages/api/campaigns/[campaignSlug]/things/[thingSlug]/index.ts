import { auth } from '@auth/auth'
import { db } from '@db/db'
import {
  createArcThingRelationship,
  createThingRelationship,
} from '@db/relationships'
import { arc, campaign, thing } from '@db/schema'
import Honeybadger from '@honeybadger-io/js'
import { slateToPlainText } from '@utils/slate-text-extractor'
import { slugify } from '@utils/string'
import type { APIRoute } from 'astro'
import { and, eq, sql } from 'drizzle-orm'
import * as z from 'zod'

/**
 * GET /api/campaigns/[campaignSlug]/things/[thingSlug]
 * Retrieves a specific thing (entity) from a campaign
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

    const { campaignSlug, thingSlug } = params

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

    const thingResult = await db
      .select()
      .from(thing)
      .where(
        and(
          eq(thing.slug, thingSlug as string),
          eq(thing.campaignId, campaignResult[0].id)
        )
      )

    if (thingResult.length === 0) {
      return new Response(JSON.stringify({ error: 'Thing not found' }), {
        status: 404,
      })
    }

    return new Response(JSON.stringify(thingResult[0]), { status: 200 })
  } catch (error) {
    console.error('Error fetching thing:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}

/**
 * PUT /api/campaigns/[campaignSlug]/things/[thingSlug]
 * Updates a specific thing (entity) in a campaign
 *
 * @param request.body.updatedThing - Thing update data
 * @param request.body.updatedThing.slug - Thing slug (required)
 * @param request.body.updatedThing.name - Thing name (optional, 1-255 characters)
 * @param request.body.updatedThing.typeId - Thing type ID (optional, positive integer)
 * @param request.body.updatedThing.description - Description content (optional, Slate.js format)
 *
 * @example
 * ```json
 * {
 *   "updatedThing": {
 *     "slug": "goblin-chief-klarg",
 *     "name": "Goblin Chief Klarg - Updated",
 *     "typeId": 1,
 *     "description": [{"type": "paragraph", "children": [{"text": "A fierce goblin leader..."}]}]
 *   }
 * }
 * ```
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

    const { campaignSlug, thingSlug } = params

    if (
      !campaignSlug ||
      !z.string().nonempty().safeParse(campaignSlug).success
    ) {
      return new Response(JSON.stringify({ error: 'Invalid campaign slug' }), {
        status: 400,
      })
    }

    if (!thingSlug || !z.string().nonempty().safeParse(thingSlug).success) {
      return new Response(JSON.stringify({ error: 'Invalid thing slug' }), {
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

    // Verify the thing exists in this campaign
    const existingThing = await db
      .select()
      .from(thing)
      .where(
        and(
          eq(thing.slug, thingSlug as string),
          eq(thing.campaignId, campaignResult[0].id)
        )
      )

    if (existingThing.length === 0) {
      return new Response(JSON.stringify({ error: 'Thing not found' }), {
        status: 404,
      })
    }

    const UpdatedThing = z.object({
      slug: z.string().min(1).max(255),
      name: z.string().min(1).max(255).optional(),
      typeId: z.number().int().positive().optional(),
      description: z.any().optional(),
      published: z.boolean().optional(),
    })

    const { updatedThing, relatedItems } = await request.json()
    const parsedThing = UpdatedThing.safeParse(updatedThing)

    if (!parsedThing.success) {
      return new Response(JSON.stringify({ error: 'Invalid thing data' }), {
        status: 400,
      })
    }

    const updateData: any = {}

    // Only update fields if provided
    if (parsedThing.data.name !== undefined) {
      updateData.name = parsedThing.data.name
      updateData.slug = slugify(parsedThing.data.name)
    }
    if (parsedThing.data.typeId !== undefined)
      updateData.typeId = parsedThing.data.typeId
    if (parsedThing.data.description !== undefined) {
      updateData.description = parsedThing.data.description
      updateData.descriptionText = slateToPlainText(
        parsedThing.data.description
      )
    }
    if (parsedThing.data.published !== undefined)
      updateData.published = parsedThing.data.published

    const [returnedThing] = await db
      .update(thing)
      .set(updateData)
      .where(eq(thing.id, existingThing[0].id))
      .returning()
    if (updateData.slug && updateData.slug !== thingSlug) {
      const oldLink = `[[thing#${thingSlug}]]`
      const newLink = `[[thing#${updateData.slug}]]`

      await db.run(sql`
        UPDATE ${arc} SET
          "hook" = REPLACE(${arc.hook}, ${oldLink}, ${newLink}),
          "protagonist" = REPLACE(${arc.protagonist}, ${oldLink}, ${newLink}),
          "antagonist" = REPLACE(${arc.antagonist}, ${oldLink}, ${newLink}),
          "problem" = REPLACE(${arc.problem}, ${oldLink}, ${newLink}),
          "key" = REPLACE(${arc.key}, ${oldLink}, ${newLink}),
          "outcome" = REPLACE(${arc.outcome}, ${oldLink}, ${newLink}),
          "notes" = REPLACE(${arc.notes}, ${oldLink}, ${newLink}),
          "hook_text" = REPLACE(${arc.hookText}, ${oldLink}, ${newLink}),
          "protagonist_text" = REPLACE(${arc.protagonistText}, ${oldLink}, ${newLink}),
          "antagonist_text" = REPLACE(${arc.antagonistText}, ${oldLink}, ${newLink}),
          "problem_text" = REPLACE(${arc.problemText}, ${oldLink}, ${newLink}),
          "outcome_text" = REPLACE(${arc.outcomeText}, ${oldLink}, ${newLink}),
          "key_text" = REPLACE(${arc.keyText}, ${oldLink}, ${newLink}),
          "notes_text" = REPLACE(${arc.notesText}, ${oldLink}, ${newLink})
        WHERE
        ${arc.campaignId} = ${returnedThing.campaignId}
        AND (
              "hook" LIKE '%' || ${oldLink} || '%' OR
              "protagonist" LIKE '%' || ${oldLink} || '%' OR
              "antagonist" LIKE '%' || ${oldLink} || '%' OR
              "problem" LIKE '%' || ${oldLink} || '%' OR
              "key" LIKE '%' || ${oldLink} || '%' OR
              "outcome" LIKE '%' || ${oldLink} || '%' OR
              "notes" LIKE '%' || ${oldLink} || '%' OR
              "hook_text" LIKE '%' || ${oldLink} || '%' OR
              "protagonist_text" LIKE '%' || ${oldLink} || '%' OR
              "antagonist_text" LIKE '%' || ${oldLink} || '%' OR
              "problem_text" LIKE '%' || ${oldLink} || '%' OR
              "outcome_text" LIKE '%' || ${oldLink} || '%' OR
              "key_text" LIKE '%' || ${oldLink} || '%' OR
              "notes_text" LIKE '%' || ${oldLink} || '%'
            )`)

      await db.run(sql`
        UPDATE ${thing} SET
          "description" = REPLACE(${thing.description}, ${oldLink}, ${newLink}),
          "description_text" = REPLACE(${thing.descriptionText}, ${oldLink}, ${newLink})
        WHERE ${thing.campaignId} = ${returnedThing.campaignId}
        AND (
          "description" LIKE '%' || ${oldLink} || '%' OR
          "description_text" LIKE '%' || ${oldLink} || '%'
        )`)
    }

    // Handle related items if provided
    // We will do an UPSERT on these, as we don't want to remove existing relations
    // incase they were added manually (i.e not in the text as links)
    // but we also don't want to duplicate relations
    const RelatedItems = z.array(
      z.object({
        type: z.enum(['thing', 'arc']),
        slug: z.string().min(1).max(255),
      })
    )

    const parsedRelatedItems = RelatedItems.safeParse(relatedItems)
    if (relatedItems && !parsedRelatedItems.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid related items data' }),
        {
          status: 400,
        }
      )
    }

    if (parsedRelatedItems.success && parsedRelatedItems.data.length > 0) {
      await Promise.all(
        parsedRelatedItems.data.map(async (item) => {
          // Items come in with Slugs, but we need IDs for the relationships
          // So we need to look them up first, making sure they belong to this campaign
          // If an item can't be found, we just skip it
          const itemResult =
            item.type === 'thing'
              ? await db
                  .select({ id: thing.id })
                  .from(thing)
                  .where(
                    and(
                      eq(thing.slug, item.slug),
                      eq(thing.campaignId, returnedThing.campaignId)
                    )
                  )
              : await db
                  .select({ id: arc.id })
                  .from(arc)
                  .where(
                    and(
                      eq(arc.slug, item.slug),
                      eq(arc.campaignId, returnedThing.campaignId)
                    )
                  )

          if (itemResult.length === 0) return

          const itemId = itemResult[0].id
          item.type === 'arc'
            ? await createArcThingRelationship(returnedThing.id, itemId)
            : await createThingRelationship(returnedThing.id, itemId)
        })
      )
    }

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

    return new Response(JSON.stringify(returnedThing), { status: 200 })
  } catch (error) {
    console.error('Error updating thing:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}

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

    const { campaignSlug, thingSlug } = params

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

    // Verify the thing exists in this campaign
    const existingThing = await db
      .select()
      .from(thing)
      .where(
        and(
          eq(thing.slug, thingSlug as string),
          eq(thing.campaignId, campaignResult[0].id)
        )
      )

    if (existingThing.length === 0) {
      return new Response(JSON.stringify({ error: 'Thing not found' }), {
        status: 404,
      })
    }

    await db.delete(thing).where(eq(thing.id, existingThing[0].id))

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Error deleting thing:', error)
    Honeybadger.notify(error as Error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}
