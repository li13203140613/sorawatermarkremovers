import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, LogsFilter } from '@/lib/admin'
import { getLogs } from '@/lib/admin/queries'

export async function GET(request: NextRequest) {
  return requireAdmin(request, async (req) => {
    const { searchParams } = new URL(req.url)

    const filter: LogsFilter = {
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '50', 10),
      userId: searchParams.get('userId') || undefined,
      userEmail: searchParams.get('userEmail') || undefined,
      status: (searchParams.get('status') as 'success' | 'failed' | 'all') || 'all',
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    }

    const result = await getLogs(filter)
    return NextResponse.json(result)
  })
}
