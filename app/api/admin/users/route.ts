import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getUsers } from '@/lib/admin/queries'

export async function GET(request: NextRequest) {
  return requireAdmin(request, async (req) => {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const result = await getUsers(page, limit)
    return NextResponse.json(result)
  })
}
