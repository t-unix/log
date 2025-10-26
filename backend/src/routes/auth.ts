import { Router } from 'express'
import passport from 'passport'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { authenticateToken, generateToken, AuthRequest } from '../middleware/auth.js'
import { query } from '../config/database.js'
import { sendAuthEmail } from '../services/email.js'

export const authRouter = Router()

// Generate a random 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate a secure random token
function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Request authentication code/magic link
authRouter.post('/request-code', async (req, res): Promise<void> => {
  try {
    const { email } = req.body

    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Valid email is required' })
      return
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Generate code and token
    const code = generateCode()
    const token = generateRandomToken()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store the auth token in database
    await query(
      'INSERT INTO auth_tokens (email, code, token, expires_at) VALUES ($1, $2, $3, $4)',
      [normalizedEmail, code, token, expiresAt]
    )

    // Send email with code and magic link
    await sendAuthEmail({
      to: normalizedEmail,
      code,
      token
    })

    res.json({
      success: true,
      message: 'Authentication code sent to your email',
      expiresIn: 900 // 15 minutes in seconds
    })
  } catch (error) {
    console.error('Request code error:', error)
    res.status(500).json({ error: 'Failed to send authentication code' })
  }
})

// Verify code and login
authRouter.post('/verify-code', async (req, res): Promise<void> => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      res.status(400).json({ error: 'Email and code are required' })
      return
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find valid, unused token
    const tokenResult = await query(
      `SELECT * FROM auth_tokens
       WHERE email = $1 AND code = $2 AND expires_at > NOW() AND used_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
      [normalizedEmail, code]
    )

    if (tokenResult.rows.length === 0) {
      res.status(401).json({ error: 'Invalid or expired code' })
      return
    }

    // Mark token as used
    await query(
      'UPDATE auth_tokens SET used_at = NOW() WHERE id = $1',
      [tokenResult.rows[0].id]
    )

    // Find or create user
    let userResult = await query(
      'SELECT * FROM users WHERE email = $1',
      [normalizedEmail]
    )

    let user
    if (userResult.rows.length === 0) {
      // Create new user
      // First, get or create default organization
      let orgResult = await query('SELECT * FROM organizations ORDER BY created_at LIMIT 1')

      if (orgResult.rows.length === 0) {
        orgResult = await query(
          'INSERT INTO organizations (name) VALUES ($1) RETURNING *',
          ['Default Organization']
        )
      }

      const organization = orgResult.rows[0]

      // Create user
      userResult = await query(
        `INSERT INTO users (organization_id, email, name, role)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [organization.id, normalizedEmail, normalizedEmail.split('@')[0], 'member']
      )
      user = userResult.rows[0]
    } else {
      user = userResult.rows[0]
    }

    // Generate JWT token
    const jwtToken = generateToken(user)

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        organizationId: user.organization_id
      }
    })
  } catch (error) {
    console.error('Verify code error:', error)
    res.status(500).json({ error: 'Failed to verify code' })
  }
})

// Verify magic link token and login
authRouter.get('/verify-link', async (req, res): Promise<void> => {
  try {
    const { token } = req.query

    if (!token || typeof token !== 'string') {
      res.status(400).json({ error: 'Token is required' })
      return
    }

    // Find valid, unused token
    const tokenResult = await query(
      `SELECT * FROM auth_tokens
       WHERE token = $1 AND expires_at > NOW() AND used_at IS NULL
       LIMIT 1`,
      [token]
    )

    if (tokenResult.rows.length === 0) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }

    const authToken = tokenResult.rows[0]

    // Mark token as used
    await query(
      'UPDATE auth_tokens SET used_at = NOW() WHERE id = $1',
      [authToken.id]
    )

    // Find or create user
    let userResult = await query(
      'SELECT * FROM users WHERE email = $1',
      [authToken.email]
    )

    let user
    if (userResult.rows.length === 0) {
      // Create new user
      let orgResult = await query('SELECT * FROM organizations ORDER BY created_at LIMIT 1')

      if (orgResult.rows.length === 0) {
        orgResult = await query(
          'INSERT INTO organizations (name) VALUES ($1) RETURNING *',
          ['Default Organization']
        )
      }

      const organization = orgResult.rows[0]

      userResult = await query(
        `INSERT INTO users (organization_id, email, name, role)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [organization.id, authToken.email, authToken.email.split('@')[0], 'member']
      )
      user = userResult.rows[0]
    } else {
      user = userResult.rows[0]
    }

    // Generate JWT token
    const jwtToken = generateToken(user)

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        organizationId: user.organization_id
      }
    })
  } catch (error) {
    console.error('Verify link error:', error)
    res.status(500).json({ error: 'Failed to verify magic link' })
  }
})

// DEPRECATED: Old username/password login (kept for backward compatibility)
authRouter.post('/login', async (req, res): Promise<void> => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' })
      return
    }

    // Find user by username or email
    const userResult = await query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    )

    if (userResult.rows.length === 0) {
      res.status(401).json({ error: 'Invalid username or password' })
      return
    }

    const user = userResult.rows[0]

    // Check if user has a password hash (local auth user)
    if (!user.password_hash) {
      res.status(401).json({ error: 'This account uses OAuth authentication' })
      return
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid username or password' })
      return
    }

    // Generate JWT token
    const token = generateToken(user)

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        organizationId: user.organization_id
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Failed to login' })
  }
})

// Demo/Development login endpoint
authRouter.post('/demo-login', async (_req, res): Promise<void> => {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      res.status(403).json({ error: 'Demo login is not available in production' })
      return
    }

    // Find or create demo user
    let userResult = await query(
      'SELECT * FROM users WHERE email = $1',
      ['demo@example.com']
    )

    if (userResult.rows.length === 0) {
      // Create default organization if needed
      let orgResult = await query('SELECT * FROM organizations LIMIT 1')

      if (orgResult.rows.length === 0) {
        orgResult = await query(
          'INSERT INTO organizations (name) VALUES ($1) RETURNING *',
          ['Demo Organization']
        )
      }

      const organization = orgResult.rows[0]

      // Create demo user
      userResult = await query(
        `INSERT INTO users (organization_id, email, name, avatar, provider, provider_id, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [organization.id, 'demo@example.com', 'Demo User', null, 'demo', 'demo-user', 'admin']
      )
    }

    const user = userResult.rows[0]
    const token = generateToken(user)

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        organizationId: user.organization_id
      }
    })
  } catch (error) {
    console.error('Demo login error:', error)
    res.status(500).json({ error: 'Failed to perform demo login' })
  }
})

// OAuth routes disabled - authentication is currently disabled for easier testing
// Uncomment these when you want to re-enable OAuth authentication

// // GitHub OAuth
// authRouter.get('/github', (req, res, next): void => {
//   if (!isProviderConfigured('github')) {
//     res.status(503).json({
//       error: 'GitHub authentication is not configured',
//       hint: 'Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables'
//     })
//     return
//   }
//   passport.authenticate('github', { scope: ['user:email'] })(req, res, next)
// })

// authRouter.get('/github/callback', (req, res, next): void => {
//   if (!isProviderConfigured('github')) {
//     res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=github_not_configured`)
//     return
//   }
//
//   passport.authenticate('github', { failureRedirect: '/login' }, (err: any, user: any) => {
//     if (err || !user) {
//       res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`)
//       return
//     }
//     const token = generateToken(user)
//     res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?token=${token}`)
//   })(req, res, next)
// })

// // Google OAuth
// authRouter.get('/google', (req, res, next): void => {
//   if (!isProviderConfigured('google')) {
//     res.status(503).json({
//       error: 'Google authentication is not configured',
//       hint: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables'
//     })
//     return
//   }
//   passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next)
// })

// authRouter.get('/google/callback', (req, res, next): void => {
//   if (!isProviderConfigured('google')) {
//     res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_not_configured`)
//     return
//   }
//
//   passport.authenticate('google', { failureRedirect: '/login' }, (err: any, user: any) => {
//     if (err || !user) {
//       res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`)
//       return
//     }
//     const token = generateToken(user)
//     res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?token=${token}`)
//   })(req, res, next)
// })

// // Apple OAuth
// authRouter.get('/apple', (_req, res, _next): void => {
//   if (!isProviderConfigured('apple')) {
//     res.status(503).json({
//       error: 'Apple authentication is not configured',
//       hint: 'Please set APPLE_CLIENT_ID and APPLE_CLIENT_SECRET environment variables'
//     })
//     return
//   }
//   // Apple strategy would be used here if configured
//   res.status(503).json({ error: 'Apple authentication is configured but strategy needs implementation' })
// })

// authRouter.get('/apple/callback', (_req, res): void => {
//   res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=apple_not_implemented`)
// })

// Get current user
authRouter.get('/me', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    const result = await query('SELECT id, email, name, avatar, role, organization_id FROM users WHERE id = $1', [req.user!.id])

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Logout
authRouter.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' })
  })
})
