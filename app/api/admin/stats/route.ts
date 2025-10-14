import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getStats } from '@/lib/admin/queries'

export async function GET(request: NextRequest) {
  return requireAdmin(request, async () => {
    const stats = await getStats()
    return NextResponse.json(stats)
  })
}
