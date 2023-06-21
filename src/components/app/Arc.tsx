import { useContext, createSignal, createEffect } from "solid-js"
import { ArcContext } from "./Story"

import type { ArcType, CollectionType, ThingType } from "./types"
import { get } from "../../pages/api/collections"
type ArcProps = {
  openArc: (arc: ArcType) => void
}
export default function Arc(props: ArcProps) {
  // @ts-ignore
  const [arc] = useContext(ArcContext)
  const [getCollections, setCollections] = createSignal<CollectionType[]>(
    arc().collections
  )
  const [getCollection, setCollection] = createSignal<
    CollectionType | undefined
  >()
  const [getThing, setThing] = createSignal<ThingType | undefined>()

  const addCollection = () => {
    const name = prompt("Collection name?")
    if (name) {
      const newCollection: CollectionType = {
        name,
        things: [],
      }
      setCollections([...getCollections(), newCollection])
      arc().collections = getCollections()
    }
  }

  return (
    <div class="arc ">
      <div class="section">
        <h3>SubArcs</h3>
        <ul class="bullets maxHeight">
          {arc().SubArcs?.map((sub: ArcType) => (
            <li class="clickable" onclick={() => props.openArc(sub)}>
              {sub.name}
            </li>
          ))}
        </ul>
      </div>
      <div class="section">
        <h3>Information</h3>
        <ul>
          {Object.entries(arc().information).map(([key, value]) => (
            <li>
              <span class="key">{key}:</span>
              <span class="value">{String(value)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div class="section">
        <div class="sectionTitle">
          <h3>Collections</h3>
          <span onclick={addCollection}>+</span>
        </div>
        <ul class="bullets">
          {getCollections().map((collection: CollectionType) => (
            <li class="clickable" onclick={() => setCollection(collection)}>
              {collection.name}
            </li>
          ))}
        </ul>
      </div>
      {/* <div class="section">
        <h3>Thing</h3>
        <p>{getThing()?.name}</p>
      </div> */}
    </div>
  )
}
