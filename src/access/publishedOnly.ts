import type { Access } from 'payload'

export const publishedOnly: Access = ({ req: { user } }) => {
  if ((user as { roles?: string[] } | null)?.roles?.includes('admin')) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
