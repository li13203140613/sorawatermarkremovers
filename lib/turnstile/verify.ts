/**
 * Turnstile 服务端验证
 * 文档: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  if (!secretKey) {
    console.error('Turnstile secret key not configured')
    return false
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    })

    const data: TurnstileVerifyResponse = await response.json()

    if (!data.success) {
      console.error('Turnstile verification failed:', data['error-codes'])
      return false
    }

    return true
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return false
  }
}
