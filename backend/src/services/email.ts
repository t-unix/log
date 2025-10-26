import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com'
const APP_URL = process.env.APP_URL || 'http://localhost:3001'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

interface SendAuthEmailParams {
  to: string
  code: string
  token: string
}

export async function sendAuthEmail({ to, code, token }: SendAuthEmailParams): Promise<void> {
  const magicLink = `${FRONTEND_URL}/auth/verify?token=${token}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Login Code</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background-color: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #333;">
              📦 Log - Your Login Code
            </h1>

            <p style="margin: 0 0 30px 0; color: #666; font-size: 16px; line-height: 1.5;">
              Use this code to log in to your account:
            </p>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 30px 0;">
              <div style="font-size: 32px; font-weight: 700; color: white; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${code}
              </div>
            </div>

            <p style="margin: 0 0 20px 0; color: #666; font-size: 14px; line-height: 1.5;">
              Or click this button to log in instantly:
            </p>

            <div style="text-align: center; margin: 0 0 30px 0;">
              <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Login to Log
              </a>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="margin: 0 0 10px 0; color: #999; font-size: 12px; line-height: 1.5;">
                This code will expire in 15 minutes.
              </p>
              <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.5;">
                If you didn't request this code, you can safely ignore this email.
              </p>
            </div>
          </div>

          <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
            © 2025 Log Asset Management
          </p>
        </div>
      </body>
    </html>
  `

  const textContent = `
Your Login Code: ${code}

Or use this magic link to log in instantly:
${magicLink}

This code will expire in 15 minutes.
If you didn't request this code, you can safely ignore this email.

© 2025 Log Asset Management
  `

  // If Resend is not configured, log to console only
  if (!resend) {
    console.log('\n📧 =============== AUTH EMAIL (NO RESEND) ===============')
    console.log(`To: ${to}`)
    console.log(`Code: ${code}`)
    console.log(`Magic Link: ${magicLink}`)
    console.log('=======================================================\n')
    return
  }

  // Send email via Resend (works in both development and production)
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your login code: ${code}`,
      html: htmlContent,
      text: textContent
    })
    console.log(`✅ Auth email sent to ${to} (ID: ${result.data?.id})`)
  } catch (error: any) {
    console.error('❌ Failed to send email via Resend:', error.message || error)
    if (error.statusCode) {
      console.error(`   Status: ${error.statusCode}`)
    }
    if (error.name) {
      console.error(`   Error type: ${error.name}`)
    }
    // Fallback to console logging if email fails
    console.log('\n📧 =============== AUTH EMAIL (FALLBACK) ===============')
    console.log(`To: ${to}`)
    console.log(`Code: ${code}`)
    console.log(`Magic Link: ${magicLink}`)
    console.log('========================================================\n')
    throw error // Re-throw so the caller knows it failed
  }
}

// Clean up expired tokens (call this periodically)
export async function cleanupExpiredTokens(query: any): Promise<void> {
  try {
    await query('DELETE FROM auth_tokens WHERE expires_at < NOW() OR used_at IS NOT NULL')
    console.log('✅ Cleaned up expired auth tokens')
  } catch (error) {
    console.error('Failed to cleanup expired tokens:', error)
  }
}
