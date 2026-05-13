import type { Access, FieldAccess } from 'payload'

// `user` may be a `User` or a `PayloadMcpApiKey` (added by plugin-mcp).
// Narrow before touching `roles`.
type MaybeUserWithRoles = { id?: number | string; roles?: string[] } | null | undefined

export const isAdminOrSelf: Access = ({ req: { user } }) => {
  const u = user as MaybeUserWithRoles
  if (u) {
    if (u.roles?.includes('admin')) {
      return true
    }
    return {
      id: {
        equals: u.id,
      },
    }
  }
  return false
}

export const isAdminOrSelfFieldLevel: FieldAccess = ({ id, req: { user } }) => {
  const u = user as MaybeUserWithRoles
  if (u?.roles?.includes('admin')) {
    return true
  }
  if (u?.id === id) {
    return true
  }
  return false
}
