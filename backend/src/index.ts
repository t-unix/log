import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { authRouter } from './routes/auth.js'
import { assetsRouter } from './routes/assets.js'
import { loansRouter } from './routes/loans.js'
import { issuesRouter } from './routes/issues.js'
import { logbookRouter } from './routes/logbook.js'
import { uploadsRouter } from './routes/uploads.js'
import { errorHandler } from './middleware/errorHandler.js'
import { setupPassport } from './config/passport.js'

dotenv.config()

const app = express()
const PORT = process.env.APP_PORT || 3001

// Security middleware - configure helmet to allow serving uploaded images
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Setup passport for OAuth
setupPassport(app)

// Serve uploaded files statically
const UPLOADS_DIR = path.join(process.cwd(), 'uploads')
app.use('/uploads', express.static(UPLOADS_DIR))
console.log('📁 Serving uploads from:', UPLOADS_DIR)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRouter)
app.use('/api/assets', assetsRouter)
app.use('/api/loans', loansRouter)
app.use('/api/issues', issuesRouter)
app.use('/api/logbook', logbookRouter)
app.use('/api/uploads', uploadsRouter)

// Error handling
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app
