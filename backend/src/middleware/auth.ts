import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { query } from '../config/database.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export type AuthRequest = Request

// Temporarily disable authentication - auto-login with first available user
export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    // Try to get user from token if provided
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      try {
        const user = jwt.verify(token, JWT_SECRET) as any
        req.user = user
        next()
        return
      } catch (error) {
        // Token invalid, continue to auto-login below
      }
    }

    // Auto-login: Get first admin user from database
    const result = await query(
      'SELECT id, email, name, role, organization_id FROM users WHERE role = $1 LIMIT 1',
      ['admin']
    )

    if (result.rows.length > 0) {
      const user = result.rows[0]
      req.user = {
        id: user.id,
        email: user.email,
        organizationId: user.organization_id,
        role: user.role
      }
      next()
    } else {
      // No users exist, create a temporary user context
      const orgResult = await query('SELECT id FROM organizations LIMIT 1')
      if (orgResult.rows.length > 0) {
        req.user = {
          id: 'temp-user',
          email: 'temp@example.com',
          organizationId: orgResult.rows[0].id,
          role: 'admin'
        }
        next()
      } else {
        res.status(500).json({ error: 'No organization found. Please run database seed.' })
      }
    }
  } catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({ error: 'Authentication error' })
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' })
      return
    }

    next()
  }
}

export function generateToken(user: any): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      organizationId: user.organization_id,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}
