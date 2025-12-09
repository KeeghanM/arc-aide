import { format } from 'timeago.js'

export function TimeAgo({ datetime }: { datetime: Date }) {
  return (
    <time dateTime={new Date(datetime).toISOString()}>{format(datetime)}</time>
  )
}
