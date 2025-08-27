/**
 * String manipulation utilities
 */

/**
 * Convert a string to a URL-safe slug
 * @param string - The string to slugify
 * @returns URL-safe slug string
 */
export function slugify(string: string) {
  return string
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace all non-alphanumeric with "-"
    .replace(/^-+|-+$/g, '') // Trim leading/trailing dashes
    .replace(/--+/g, '-') // Replace multiple dashes with single dash
}

/**
 * Convert a string to proper case (first letter uppercase, rest lowercase)
 * @param string - The string to convert
 * @returns String in proper case
 *
 * @example properCase('hello_world') // 'Hello World'
 * @example properCase('my-thing-name') // 'My Thing Name'
 * @example properCase('ANOTHER example') // 'Another Example'
 */
export function properCase(string: string) {
  return string
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/-/g, ' ') // Replace dashes with spaces
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
