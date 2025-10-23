import { Router } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth.js'
import { query } from '../config/database.js'

export const logbookRouter = Router()

// Get all logbook entries
logbookRouter.get('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { type, startDate, endDate } = req.query

    let queryText = `
      SELECT l.*, u.name as user_name
      FROM logbook_entries l
      JOIN users u ON l.user_id = u.id
      WHERE l.organization_id = $1
    `
    const params: any[] = [req.user!.organizationId]

    if (type) {
      params.push(type)
      queryText += ` AND l.type = $${params.length}`
    }

    if (startDate) {
      params.push(startDate)
      queryText += ` AND l.created_at >= $${params.length}`
    }

    if (endDate) {
      params.push(endDate)
      queryText += ` AND l.created_at <= $${params.length}`
    }

    queryText += ' ORDER BY l.created_at DESC LIMIT 100'

    const result = await query(queryText, params)

    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})
