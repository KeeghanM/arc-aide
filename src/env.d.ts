/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: import('better-auth').User
    session: import('better-auth').Session
  }
}
