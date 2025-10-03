import { and, eq } from 'drizzle-orm'
import { db } from './db'
import { arcArc, arcThing, thingThing } from './schema'

/**
 * Creates a bidirectional relationship between two things.
 * Automatically orders IDs to prevent duplicates.
 */
export async function createThingRelationship(
  thingId1: number,
  thingId2: number
) {
  // Ensure we always insert with the smaller ID first
  const [firstId, secondId] =
    thingId1 < thingId2 ? [thingId1, thingId2] : [thingId2, thingId1]

  return db
    .insert(thingThing)
    .values({
      firstThingId: firstId,
      secondThingId: secondId,
      createdAt: new Date(),
    })
    .onConflictDoNothing() // Prevent errors if relationship already exists
}

/**
 * Creates a bidirectional relationship between two arcs.
 * Automatically orders IDs to prevent duplicates.
 */
export async function createArcRelationship(arcId1: number, arcId2: number) {
  // Ensure we always insert with the smaller ID first
  const [firstId, secondId] =
    arcId1 < arcId2 ? [arcId1, arcId2] : [arcId2, arcId1]

  return db
    .insert(arcArc)
    .values({
      firstArcId: firstId,
      secondArcId: secondId,
      createdAt: new Date(),
    })
    .onConflictDoNothing() // Prevent errors if relationship already exists
}

/**
 * Creates a relationship between an arc and a thing.
 * This is directional (arc -> thing) so no ordering is needed.
 */
export async function createArcThingRelationship(
  arcId: number,
  thingId: number
) {
  return db
    .insert(arcThing)
    .values({
      arcId,
      thingId,
    })
    .onConflictDoNothing() // Prevent errors if relationship already exists
}

/**
 * Removes a bidirectional relationship between two things.
 */
export async function removeThingRelationship(
  thingId1: number,
  thingId2: number
) {
  const [firstId, secondId] =
    thingId1 < thingId2 ? [thingId1, thingId2] : [thingId2, thingId1]

  return db
    .delete(thingThing)
    .where(
      and(
        eq(thingThing.firstThingId, firstId),
        eq(thingThing.secondThingId, secondId)
      )
    )
}

/**
 * Removes a bidirectional relationship between two arcs.
 */
export async function removeArcRelationship(arcId1: number, arcId2: number) {
  const [firstId, secondId] =
    arcId1 < arcId2 ? [arcId1, arcId2] : [arcId2, arcId1]

  return db
    .delete(arcArc)
    .where(
      and(eq(arcArc.firstArcId, firstId), eq(arcArc.secondArcId, secondId))
    )
}

/**
 * Removes a relationship between an arc and a thing.
 */
export async function removeArcThingRelationship(
  arcId: number,
  thingId: number
) {
  return db
    .delete(arcThing)
    .where(and(eq(arcThing.arcId, arcId), eq(arcThing.thingId, thingId)))
}
