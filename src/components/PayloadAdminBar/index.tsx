'use client'

/**
 * Wraps `@payloadcms/admin-bar` so we can render it once in the frontend
 * layout. The bar only appears for logged-in admin users (Payload checks
 * its own cookie); for anonymous visitors it renders nothing.
 */

import { PayloadAdminBar as Bar } from '@payloadcms/admin-bar'
import * as React from 'react'

export const PayloadAdminBar: React.FC = () => {
  const cmsURL = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  return (
    <Bar
      cmsURL={cmsURL}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    />
  )
}
