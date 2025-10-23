import { Router } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth.js'
import { query } from '../config/database.js'
import { AppError } from '../middleware/errorHandler.js'

export const loansRouter = Router()

// Get all loans
loansRouter.get('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const result = await query(
      `SELECT l.*, a.name as asset_name, u.name as user_name
       FROM loans l
       JOIN assets a ON l.asset_id = a.id
       JOIN users u ON l.user_id = u.id
       WHERE l.organization_id = $1
       ORDER BY l.created_at DESC`,
      [req.user!.organizationId]
    )

    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// Create loan
loansRouter.post('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { assetId, expectedReturnDate, notes } = req.body

    if (!assetId) {
      throw new AppError('Asset ID is required', 400)
    }

    // Check if asset is available
    const assetResult = await query(
      'SELECT * FROM assets WHERE id = $1 AND organization_id = $2',
      [assetId, req.user!.organizationId]
    )

    if (assetResult.rows.length === 0) {
      throw new AppError('Asset not found', 404)
    }

    if (assetResult.rows[0].status !== 'available') {
      throw new AppError('Asset is not available for loan', 400)
    }

    // Create loan
    const loanResult = await query(
      `INSERT INTO loans (organization_id, asset_id, user_id, expected_return_date, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user!.organizationId, assetId, req.user!.id, expectedReturnDate || null, notes || null]
    )

    // Update asset status
    await query(
      'UPDATE assets SET status = $1 WHERE id = $2',
      ['loaned', assetId]
    )

    // Log the action
    await query(
      `INSERT INTO logbook_entries (organization_id, type, title, description, user_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user!.organizationId,
        'loan',
        'Asset loaned',
        `${assetResult.rows[0].name} was loaned`,
        req.user!.id,
        JSON.stringify({ assetId, loanId: loanResult.rows[0].id })
      ]
    )

    // Get full loan data with joined info
    const fullLoan = await query(
      `SELECT l.*, a.name as asset_name, u.name as user_name
       FROM loans l
       JOIN assets a ON l.asset_id = a.id
       JOIN users u ON l.user_id = u.id
       WHERE l.id = $1`,
      [loanResult.rows[0].id]
    )

    res.status(201).json(fullLoan.rows[0])
  } catch (error) {
    next(error)
  }
})

// Return loan
loansRouter.post('/:id/return', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    // Get loan
    const loanResult = await query(
      'SELECT * FROM loans WHERE id = $1 AND organization_id = $2',
      [req.params.id, req.user!.organizationId]
    )

    if (loanResult.rows.length === 0) {
      throw new AppError('Loan not found', 404)
    }

    const loan = loanResult.rows[0]

    if (loan.status === 'returned') {
      throw new AppError('Loan already returned', 400)
    }

    // Update loan
    await query(
      'UPDATE loans SET status = $1, returned_at = NOW() WHERE id = $2',
      ['returned', req.params.id]
    )

    // Update asset status
    await query(
      'UPDATE assets SET status = $1 WHERE id = $2',
      ['available', loan.asset_id]
    )

    // Get asset name for logging
    const assetResult = await query('SELECT name FROM assets WHERE id = $1', [loan.asset_id])

    // Log the action
    await query(
      `INSERT INTO logbook_entries (organization_id, type, title, description, user_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user!.organizationId,
        'return',
        'Asset returned',
        `${assetResult.rows[0].name} was returned`,
        req.user!.id,
        JSON.stringify({ assetId: loan.asset_id, loanId: req.params.id })
      ]
    )

    // Get updated loan
    const updatedLoan = await query(
      `SELECT l.*, a.name as asset_name, u.name as user_name
       FROM loans l
       JOIN assets a ON l.asset_id = a.id
       JOIN users u ON l.user_id = u.id
       WHERE l.id = $1`,
      [req.params.id]
    )

    res.json(updatedLoan.rows[0])
  } catch (error) {
    next(error)
  }
})
