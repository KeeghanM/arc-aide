export type ThingType = {
  name: string
  information: Record<string, string>
}

export type CollectionType = {
  name: string
  things: ThingType[]
  subCollections?: CollectionType[]
}

export type ArcType = {
  name: string
  information: Record<string, string>
  subArcs?: ArcType[]
  collections: string[]
}
