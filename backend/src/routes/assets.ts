import { Router } from 'express'
import { authenticateToken, AuthRequest } from '../middleware/auth.js'
import { query } from '../config/database.js'
import { AppError } from '../middleware/errorHandler.js'

export const assetsRouter = Router()

// Get all assets
assetsRouter.get('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM assets WHERE organization_id = $1 ORDER BY created_at DESC',
      [req.user!.organizationId]
    )

    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

// Get single asset
assetsRouter.get('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM assets WHERE id = $1 AND organization_id = $2',
      [req.params.id, req.user!.organizationId]
    )

    if (result.rows.length === 0) {
      throw new AppError('Asset not found', 404)
    }

    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// Create asset
assetsRouter.post('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { name, description, category, serialNumber, purchaseDate, status, photos, metadata } = req.body

    if (!name || !category) {
      throw new AppError('Name and category are required', 400)
    }

    const result = await query(
      `INSERT INTO assets (organization_id, name, description, category, serial_number, purchase_date, status, photos, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        req.user!.organizationId,
        name,
        description || null,
        category,
        serialNumber || null,
        purchaseDate || null,
        status || 'available',
        photos || [],
        metadata || {},
        req.user!.id
      ]
    )

    // Log the action
    await query(
      `INSERT INTO logbook_entries (organization_id, type, title, description, user_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user!.organizationId,
        'create',
        'Asset created',
        `${name} was added to the inventory`,
        req.user!.id,
        JSON.stringify({ assetId: result.rows[0].id })
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// Update asset
assetsRouter.put('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { name, description, category, serialNumber, purchaseDate, status, photos, metadata } = req.body

    const result = await query(
      `UPDATE assets SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        serial_number = COALESCE($4, serial_number),
        purchase_date = COALESCE($5, purchase_date),
        status = COALESCE($6, status),
        photos = COALESCE($7, photos),
        metadata = COALESCE($8, metadata)
       WHERE id = $9 AND organization_id = $10 RETURNING *`,
      [name, description, category, serialNumber, purchaseDate, status, photos, metadata, req.params.id, req.user!.organizationId]
    )

    if (result.rows.length === 0) {
      throw new AppError('Asset not found', 404)
    }

    // Log the action
    await query(
      `INSERT INTO logbook_entries (organization_id, type, title, description, user_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user!.organizationId,
        'update',
        'Asset updated',
        `${result.rows[0].name} was updated`,
        req.user!.id,
        JSON.stringify({ assetId: req.params.id })
      ]
    )

    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// Delete asset
assetsRouter.delete('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const result = await query(
      'DELETE FROM assets WHERE id = $1 AND organization_id = $2 RETURNING name',
      [req.params.id, req.user!.organizationId]
    )

    if (result.rows.length === 0) {
      throw new AppError('Asset not found', 404)
    }

    // Log the action
    await query(
      `INSERT INTO logbook_entries (organization_id, type, title, description, user_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user!.organizationId,
        'delete',
        'Asset deleted',
        `${result.rows[0].name} was removed from inventory`,
        req.user!.id,
        JSON.stringify({ assetId: req.params.id })
      ]
    )

    res.json({ message: 'Asset deleted successfully' })
  } catch (error) {
    next(error)
  }
})
