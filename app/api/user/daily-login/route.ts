import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (!forwarded) return null
  // Return the first IP (may include proxies)
  return forwarded.split(',')[0]?.trim() || null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Check whether today’s reward has been granted (UTC day)
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)

    const { data: todaySessions, error: fetchError } = await admin
      .from('user_sessions')
      .select('id')
      .eq('user_id', user.id)
      .gte('session_started_at', todayStart.toISOString())
      .limit(1)

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Failed to query today sessions:', fetchError)
      return NextResponse.json({ error: 'Failed to check login status' }, { status: 500 })
    }

    const alreadyRewarded = !!todaySessions && todaySessions.length > 0

    // Log session for analytics
    const { error: insertError } = await admin.from('user_sessions').insert({
      user_id: user.id,
      user_email: user.email,
      ip_address: getClientIp(request),
      user_agent: request.headers.get('user-agent'),
      session_started_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error('Failed to log session:', insertError)
    }

    if (alreadyRewarded) {
      return NextResponse.json({ rewarded: false, creditsAdded: 0 })
    }

    const { error: creditError } = await admin.rpc('add_credits', {
      user_id: user.id,
      amount: 5,
    })

    if (creditError) {
      console.error('Daily login credits grant failed:', creditError)
      return NextResponse.json({ error: 'Failed to grant credits' }, { status: 500 })
    }

    return NextResponse.json({ rewarded: true, creditsAdded: 5 })
  } catch (error) {
    console.error('Daily login reward handler error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
