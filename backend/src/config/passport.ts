import { Express } from 'express'
import passport from 'passport'
import { Strategy as GitHubStrategy } from 'passport-github2'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import session from 'express-session'
import { query } from './database.js'

export function setupPassport(app: Express) {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }))

  app.use(passport.initialize())
  app.use(passport.session())

  // Serialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id)
  })

  // Deserialize user
  passport.deserializeUser(async (id: string, done) => {
    try {
      const result = await query('SELECT * FROM users WHERE id = $1', [id])
      done(null, result.rows[0])
    } catch (error) {
      done(error, null)
    }
  })

  // GitHub Strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.APP_URL || 'http://localhost:3001'}/api/auth/github/callback`
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const user = await findOrCreateUser({
          provider: 'github',
          providerId: profile.id,
          email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
          name: profile.displayName || profile.username,
          avatar: profile.photos?.[0]?.value
        })
        done(null, user)
      } catch (error) {
        done(error, null)
      }
    }))
  }

  // Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.APP_URL || 'http://localhost:3001'}/api/auth/google/callback`
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const user = await findOrCreateUser({
          provider: 'google',
          providerId: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value
        })
        done(null, user)
      } catch (error) {
        done(error, null)
      }
    }))
  }
}

async function findOrCreateUser(profile: {
  provider: string
  providerId: string
  email: string
  name: string
  avatar?: string
}) {
  // Check if user exists
  const existingUser = await query(
    'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
    [profile.provider, profile.providerId]
  )

  if (existingUser.rows.length > 0) {
    return existingUser.rows[0]
  }

  // Create default organization if needed
  let orgResult = await query(
    'SELECT * FROM organizations LIMIT 1'
  )

  if (orgResult.rows.length === 0) {
    orgResult = await query(
      'INSERT INTO organizations (name) VALUES ($1) RETURNING *',
      ['Default Organization']
    )
  }

  const organization = orgResult.rows[0]

  // Create new user
  const newUser = await query(
    `INSERT INTO users (organization_id, email, name, avatar, provider, provider_id, role)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [organization.id, profile.email, profile.name, profile.avatar, profile.provider, profile.providerId, 'member']
  )

  return newUser.rows[0]
}
