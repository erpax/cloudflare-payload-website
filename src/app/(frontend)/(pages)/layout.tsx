import { Footer } from '@components/Footer/index'
import { Header } from '@components/Header/index'
import { fetchGlobals } from '@data/index'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import React from 'react'

export const dynamic = 'force-static'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { isEnabled: draft } = await draftMode()
  const getGlobals = draft
    ? fetchGlobals
    : unstable_cache(fetchGlobals, ['globals', 'mainMenu', 'footer'])

  // Tolerate an empty/uninitialized D1 (e.g. before migrations run during the
  // first Cloudflare Pages build). Header/Footer accept the missing fields
  // gracefully via spread, so we fall back to empty globals on error.
  let footer: any = {}
  let mainMenu: any = {}
  let topBar: any = undefined
  try {
    const globals = await getGlobals()
    footer = globals.footer
    mainMenu = globals.mainMenu
    topBar = globals.topBar
  } catch (error) {
    console.error(error) // eslint-disable-line no-console
  }

  return (
    <React.Fragment>
      <Header {...mainMenu} topBar={topBar} />
      <div>
        {children}
        <Footer {...footer} />
      </div>
    </React.Fragment>
  )
}
