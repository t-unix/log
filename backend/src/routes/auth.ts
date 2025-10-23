import { Router } from 'express'
import passport from 'passport'
import { authenticateToken, generateToken, AuthRequest } from '../middleware/auth.js'
import { query } from '../config/database.js'

export const authRouter = Router()

// GitHub OAuth
authRouter.get('/github', passport.authenticate('github', { scope: ['user:email'] }))

authRouter.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user)
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?token=${token}`)
  }
)

// Google OAuth
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

authRouter.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user)
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?token=${token}`)
  }
)

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
