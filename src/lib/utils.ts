import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie =
    name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/'
}

export function getCookie(name: string, cookieString: string) {
  const value = `; ${cookieString}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
}

export function slugify(string: string) {
  return string
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace all non-alphanumeric with "-"
    .replace(/^-+|-+$/g, '') // Trim leading/trailing dashes
    .replace(/--+/g, '-') // Replace multiple dashes with single dash
}

export function properCase(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}
