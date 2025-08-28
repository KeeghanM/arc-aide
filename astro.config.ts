// @ts-check
import node from '@astrojs/node'
import partytown from '@astrojs/partytown'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import starlight from '@astrojs/starlight'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import compress from 'astro-compress'
import icon from 'astro-icon'
import robotsTxt from 'astro-robots-txt'
import starlightAutoSidebar from 'starlight-auto-sidebar'
import { loadEnv } from 'vite'
import { envDefinition } from './env-definition'

const { SITE_URL } = loadEnv(process.env.NODE_ENV!, process.cwd(), '')

export default defineConfig({
  site: SITE_URL, // The base URL for the site, used for generating absolute URLs
  output: 'server', // Output mode for the site, 'static' for static site generation - we opt in to SSR per route
  env: {
    schema: envDefinition, // Environment variable schema definition
    validateSecrets: true, // Validate secrets in production builds
  },
  server: {
    open: true, // Automatically open the browser when the server starts
  },
  integrations: [
    // Allow using React components in Astro
    react(), // Enable icon support for SVGs and other icons
    icon(),
    partytown({
      config: {
        forward: ['Honeybadger.notify'],
      },
    }), // Generate a sitemap for the site
    sitemap(), // Generate robots.txt file
    robotsTxt({
      sitemap: `${SITE_URL}/sitemap-index.xml`,
    }), // Enable compression for assets to reduce size
    compress(),
    starlight({
      plugins: [starlightAutoSidebar()],
      title: 'Arc Aide Docs',
      sidebar: [
        {
          label: 'User Guide',
          autogenerate: {
            directory: 'documentation/user-guide',
          },
        },
        {
          label: 'Developer Documentation',
          collapsed: true,
          autogenerate: {
            directory: 'documentation/developers',
          },
        },
        {
          label: 'Change Logs',
          collapsed: true,
          autogenerate: {
            directory: 'documentation/change-log',
          },
        },
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()], // Use Tailwind CSS for styling
  },
  adapter: node({
    mode: 'standalone', // Run on a Node.js server, can be swapped to another adapter for different environments
  }),
})
