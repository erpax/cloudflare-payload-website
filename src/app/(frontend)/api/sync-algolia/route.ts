/**
 * Legacy path — Algolia has been replaced by D1 FTS. Kept so existing cron
 * triggers and admin "sync" buttons keep working. Forwards to the D1 sync.
 */

import { NextResponse } from 'next/server'

import syncToD1Search from '../../../../scripts/syncToD1Search'

export async function GET(): Promise<NextResponse> {
  await syncToD1Search()
  return NextResponse.json({ success: true }, { status: 200 })
}
