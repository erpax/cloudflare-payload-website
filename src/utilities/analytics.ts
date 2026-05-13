/**
 * Event tracking — Cloudflare Web Analytics edition.
 *
 * Cloudflare Web Analytics auto-records page views and Web Vitals; there is
 * no public custom-event API. This helper is intentionally a no-op so
 * existing call sites (`analyticsEvent('signup_started', ...)` etc.) keep
 * compiling. If you need custom events later, route them to a Worker that
 * writes to the Workers Analytics Engine binding.
 */

export function analyticsEvent(_event: string, _value?: unknown): void {
  // intentionally empty — see header comment
}
