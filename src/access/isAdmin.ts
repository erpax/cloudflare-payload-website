import type { Access, FieldAccess } from 'payload'

// plugin-mcp adds a `PayloadMcpApiKey` auth collection, so `req.user` is
// now `User | PayloadMcpApiKey | null`. Only `User` carries a `roles`
// field — narrow via property-in-union before access.
const hasAdminRole = (user: unknown): boolean => {
  if (!user || typeof user !== 'object' || !('roles' in user)) {
    return false
  }
  const roles = (user as { roles?: unknown }).roles
  return Array.isArray(roles) && roles.includes('admin')
}

export const isAdmin: Access = ({ req: { user } }) => hasAdminRole(user)

export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) => hasAdminRole(user)
