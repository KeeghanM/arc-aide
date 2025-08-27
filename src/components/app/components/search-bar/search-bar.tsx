import { useSearchQueries } from '@hooks/useSearchQueries'
import { useAppStore } from '@stores/appStore'
import { properCase } from '@utils/string'
import { useState } from 'react'
import ScreenWrapper, { type TScreenWrapperProps } from '../../screen-wrapper'

type TSearchBarProps = {
  searchType?: 'thing' | 'arc' | 'any'
  showTitle?: boolean
  title?: string
} & (
  | {
      returnType?: 'link'
      onSelect?: never
    }
  | {
      returnType: 'function'
      onSelect: (result: {
        entitySlug: string
        entityId: number
        title: string
        type: 'thing' | 'arc'
      }) => void
    }
)

export default function SearchBar({
  searchType = 'any',
  returnType = 'link',
  onSelect,
  showTitle = false,
  title,
}: TSearchBarProps) {
  const [value, setValue] = useState('')
  const { campaignSlug } = useAppStore()
  const { useSearchQuery } = useSearchQueries()
  const query = useSearchQuery(value, searchType)

  // --- Spell correction detection ---
  // Check if any search results include spell corrections
  const hasCorrections = query.data?.some(
    (result) =>
      result.correctedQuery && result.correctedQuery !== result.originalQuery
  )
  const correctedQuery = hasCorrections ? query.data?.[0]?.correctedQuery : null

  return (
    <div className='relative space-y-2'>
      {showTitle && <h2 className='text-2xl font-semibold'>{title}</h2>}
      <input
        type='text'
        placeholder='Search...'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setValue('')
          }
        }}
        className='border-border focus:border-primary w-md max-w-full flex-1 rounded-md border p-2 focus:outline-none'
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
              {returnType === 'link' ? (
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
              ) : (
                <button
                  type='button'
                  className='absolute inset-0 cursor-pointer opacity-0'
                  onClick={() => {
                    if (onSelect == undefined) return
                    setValue('')
                    onSelect({
                      entitySlug: result.slug,
                      entityId: result.entityId,
                      title: result.title,
                      type: result.type,
                    })
                  }}
                >
                  <span className='sr-only'>Select {result.title}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function SearchBarWrapper({
  searchType = 'any',
  returnType = 'link',
  onSelect,
  showTitle = false,
  title,
  user,
  campaignSlug,
}: TSearchBarProps & TScreenWrapperProps) {
  return (
    <ScreenWrapper
      user={user}
      campaignSlug={campaignSlug}
    >
      <SearchBar
        searchType={searchType}
        {...(returnType === 'function' && onSelect
          ? { returnType: 'function', onSelect }
          : { returnType: 'link' })}
        showTitle={showTitle}
        title={title}
      />
    </ScreenWrapper>
  )
}
