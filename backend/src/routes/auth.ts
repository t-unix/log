import { Router } from 'express'
import passport from 'passport'
import { authenticateToken, generateToken, AuthRequest } from '../middleware/auth.js'
import { query } from '../config/database.js'

export const authRouter = Router()

// Helper to check if provider is configured
const isProviderConfigured = (provider: string): boolean => {
  switch (provider) {
    case 'github':
      return !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
    case 'google':
      return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    case 'apple':
      return !!(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET)
    default:
      return false
  }
}

// Demo/Development login endpoint
authRouter.post('/demo-login', async (req, res) => {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Demo login is not available in production' })
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

// GitHub OAuth
authRouter.get('/github', (req, res, next) => {
  if (!isProviderConfigured('github')) {
    return res.status(503).json({
      error: 'GitHub authentication is not configured',
      hint: 'Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables'
    })
  }
  passport.authenticate('github', { scope: ['user:email'] })(req, res, next)
})

authRouter.get('/github/callback', (req, res, next) => {
  if (!isProviderConfigured('github')) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=github_not_configured`)
  }

  passport.authenticate('github', { failureRedirect: '/login' }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`)
    }
    const token = generateToken(user)
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?token=${token}`)
  })(req, res, next)
})

// Google OAuth
authRouter.get('/google', (req, res, next) => {
  if (!isProviderConfigured('google')) {
    return res.status(503).json({
      error: 'Google authentication is not configured',
      hint: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables'
    })
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next)
})

authRouter.get('/google/callback', (req, res, next) => {
  if (!isProviderConfigured('google')) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_not_configured`)
  }

  passport.authenticate('google', { failureRedirect: '/login' }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`)
    }
    const token = generateToken(user)
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?token=${token}`)
  })(req, res, next)
})

// Apple OAuth
authRouter.get('/apple', (req, res, next) => {
  if (!isProviderConfigured('apple')) {
    return res.status(503).json({
      error: 'Apple authentication is not configured',
      hint: 'Please set APPLE_CLIENT_ID and APPLE_CLIENT_SECRET environment variables'
    })
  }
  // Apple strategy would be used here if configured
  res.status(503).json({ error: 'Apple authentication is configured but strategy needs implementation' })
})

authRouter.get('/apple/callback', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=apple_not_implemented`)
})

// Get current user
authRouter.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await query('SELECT id, email, name, avatar, role, organization_id FROM users WHERE id = $1', [req.user!.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
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
