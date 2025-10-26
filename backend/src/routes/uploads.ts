import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { authenticateToken } from '../middleware/auth.js'

export const uploadsRouter = Router()

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  console.log('=Á Created uploads directory:', UPLOADS_DIR)
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR)
  },
  filename: (_req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`
    const ext = path.extname(file.originalname)
    const basename = path.basename(file.originalname, ext)
    const sanitizedBasename = basename.replace(/[^a-zA-Z0-9-_]/g, '_')
    cb(null, `${uniqueSuffix}-${sanitizedBasename}${ext}`)
  }
})

// File filter to only allow images
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'))
  }
}

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
})

// Upload endpoint (protected by authentication)
uploadsRouter.post(
  '/',
  authenticateToken,
  upload.single('file'),
  (req: Request, res: Response): void => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' })
        return
      }

      // Generate public URL for the file
      const fileUrl = `/uploads/${req.file.filename}`

      res.json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      })
    } catch (error: any) {
      console.error('Upload error:', error)
      res.status(500).json({ error: 'Failed to upload file' })
    }
  }
)

// Delete file endpoint (protected by authentication)
uploadsRouter.delete(
  '/:filename',
  authenticateToken,
  (req: Request, res: Response): void => {
    try {
      const { filename } = req.params

      // Validate filename (security: prevent path traversal)
      if (!filename || filename.includes('..') || filename.includes('/')) {
        res.status(400).json({ error: 'Invalid filename' })
        return
      }

      const filePath = path.join(UPLOADS_DIR, filename)

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: 'File not found' })
        return
      }

      fs.unlinkSync(filePath)
      res.json({ success: true, message: 'File deleted' })
    } catch (error: any) {
      console.error('Delete error:', error)
      res.status(500).json({ error: 'Failed to delete file' })
    }
  }
)
