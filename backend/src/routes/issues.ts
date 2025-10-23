import { Router } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth.js'
import { query } from '../config/database.js'
import { AppError } from '../middleware/errorHandler.js'

export const issuesRouter = Router()

// Get all issues
issuesRouter.get('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const result = await query(
      `SELECT i.*, a.name as asset_name, u.name as reported_by_name
       FROM issues i
       JOIN assets a ON i.asset_id = a.id
       JOIN users u ON i.reported_by = u.id
       WHERE i.organization_id = $1
       ORDER BY i.created_at DESC`,
      [req.user!.organizationId]
    )

    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// Create issue
issuesRouter.post('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { assetId, title, description, severity } = req.body

    if (!assetId || !title || !description) {
      throw new AppError('Asset ID, title, and description are required', 400)
    }

    const result = await query(
      `INSERT INTO issues (organization_id, asset_id, title, description, severity, reported_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user!.organizationId, assetId, title, description, severity || 'medium', req.user!.id]
    )

    // Get asset name for logging
    const assetResult = await query('SELECT name FROM assets WHERE id = $1', [assetId])

    // Log the action
    await query(
      `INSERT INTO logbook_entries (organization_id, type, title, description, user_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user!.organizationId,
        'issue',
        'Issue reported',
        `Issue reported for ${assetResult.rows[0].name}: ${title}`,
        req.user!.id,
        JSON.stringify({ assetId, issueId: result.rows[0].id })
      ]
    )

    // Get full issue data
    const fullIssue = await query(
      `SELECT i.*, a.name as asset_name, u.name as reported_by_name
       FROM issues i
       JOIN assets a ON i.asset_id = a.id
       JOIN users u ON i.reported_by = u.id
       WHERE i.id = $1`,
      [result.rows[0].id]
    )

    res.status(201).json(fullIssue.rows[0])
  } catch (error) {
    next(error)
  }
})

// Update issue status
issuesRouter.patch('/:id/status', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { status } = req.body

    if (!status) {
      throw new AppError('Status is required', 400)
    }

    const result = await query(
      'UPDATE issues SET status = $1 WHERE id = $2 AND organization_id = $3 RETURNING *',
      [status, req.params.id, req.user!.organizationId]
    )

    if (result.rows.length === 0) {
      throw new AppError('Issue not found', 404)
    }

    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})
