/**
 * Cookie management utilities
 */

/**
 * Set a cookie with optional expiration
 * @param name - Cookie name
 * @param value - Cookie value
 * @param days - Number of days until expiration (default: 365)
 */
export function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie =
    name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/'
}

/**
 * Get a cookie value from a cookie string
 * @param name - Cookie name to retrieve
 * @param cookieString - Cookie string to parse
 * @returns Cookie value or undefined if not found
 */
export function getCookie(name: string, cookieString: string) {
  const value = `; ${cookieString}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
}
