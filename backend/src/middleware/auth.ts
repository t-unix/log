import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export type AuthRequest = Request

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ error: 'Access token required' })
    return
  }

  try {
    const user = jwt.verify(token, JWT_SECRET) as any
    req.user = user
    next()
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' })
    return
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
