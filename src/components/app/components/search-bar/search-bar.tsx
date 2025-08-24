import { useState } from 'react'
import { useSearchQueries } from '../../hooks/useSearchQueries'
import { useAppStore } from '../../stores/appStore'

export default function SearchBar() {
  const [value, setValue] = useState('')
  const { campaignSlug } = useAppStore()
  // // WE MIGHT WANT TO DEBOUNCE THIS LATER
  // const [debouncedValue, setDebouncedValue] = useState('')

  // const debouncedSetDebouncedValue = useMemo(
  //   () => debounce(setDebouncedValue, 300),
  //   []
  // )

  const { searchQuery } = useSearchQueries()
  const query = searchQuery(value, 'any')

  return (
    <>
      <h2 className='mb-2 flex items-center gap-2 text-2xl font-semibold'>
        Search the Campaign
      </h2>
      <input
        type='text'
        placeholder='Search...'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className='border-border focus:border-primary mb-4 w-full rounded-md border p-2 focus:outline-none'
      />
      {query.data && (
        <ul className='max-h-60 space-y-2 overflow-y-auto'>
          {query.data.map((result) => (
            <li
              key={result.entityId + result.type}
              className='border-border relative rounded-md border p-2'
            >
              <div className='font-bold'>{result.title}</div>
              <div
                className='text-sm text-gray-500'
                dangerouslySetInnerHTML={{ __html: result.highlight }}
              />
              <a
                href={
                  result.type === 'arc'
                    ? `/dashboard/campaign/${campaignSlug}/arc/${result.slug}/`
                    : `/dashboard/campaign/${campaignSlug}/thing/${result.slug}/`
                }
                className='absolute inset-0'
              >
                <span className='sr-only'>Go to {result.title}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
