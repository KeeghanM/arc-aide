/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: import('better-auth').User & {
      username?: string | null
      displayUsername?: string | null
    }
    session: import('better-auth').Session
  }
}
