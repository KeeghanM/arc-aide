import { properCase } from '@/lib/utils'
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

  // Check if any results have spell corrections
  const hasCorrections = query.data?.some(
    (result) =>
      result.correctedQuery && result.correctedQuery !== result.originalQuery
  )
  const correctedQuery = hasCorrections ? query.data?.[0]?.correctedQuery : null

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
        <ul className='absolute z-10 max-h-60 w-full max-w-md space-y-2 overflow-y-auto rounded-md border bg-white p-4 shadow-md'>
          {hasCorrections && correctedQuery && (
            <div className='mb-3 text-sm text-orange-600'>
              <span className='font-medium'>Showing results for:</span>{' '}
              <em>"{correctedQuery}"</em>
            </div>
          )}

          {query.data.map((result) => (
            <li
              key={result.entityId + result.type}
              className='border-border relative rounded-md border p-2'
            >
              <div className='font-bold'>
                {properCase(result.type)}: {result.title}
              </div>
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
