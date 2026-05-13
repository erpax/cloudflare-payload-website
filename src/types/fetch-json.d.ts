/**
 * Restore `Response.json(): Promise<any>` semantics across the codebase.
 *
 * Background: Node 18+ ships `undici-types` (transitively via @types/node)
 * which declares `class BodyMixin { json(): Promise<unknown> }`. That
 * collides with — and effectively replaces — lib.dom.d.ts's looser
 * `json(): Promise<any>`, so any callsite like `const data = await
 * req.json(); data.url` fails with "Type error: 'data' is of type
 * 'unknown'" under `next build`'s type-check.
 *
 * Refactoring 40+ legacy `await req.json()` callsites in this repo to add
 * inline type assertions is not worth the churn; this single global
 * augmentation makes the default return type `any` again while leaving the
 * generic form available for new code that wants type safety:
 *
 *   const data = await res.json()                    // any
 *   const data = await res.json<{ url: string }>()   // typed
 *
 * Scope is intentionally global so it covers every Response, Request, and
 * Body instance in app code.
 */

export {}

declare global {
  interface Body {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json<T = any>(): Promise<T>
  }
}
