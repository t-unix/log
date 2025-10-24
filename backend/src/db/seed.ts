import bcrypt from 'bcrypt'
import { pool } from '../config/database.js'

async function seed() {
  try {
    console.log('🌱 Seeding database...')

    // Create default organization
    const orgResult = await pool.query(`
      INSERT INTO organizations (name)
      VALUES ('Default Organization')
      ON CONFLICT DO NOTHING
      RETURNING id
    `)

    let orgId: string
    if (orgResult.rows.length > 0) {
      orgId = orgResult.rows[0].id
      console.log('✅ Created default organization')
    } else {
      // Organization already exists, fetch it
      const existingOrg = await pool.query(`
        SELECT id FROM organizations WHERE name = 'Default Organization' LIMIT 1
      `)
      orgId = existingOrg.rows[0].id
      console.log('ℹ️  Default organization already exists')
    }

    // Hash the password
    const passwordHash = await bcrypt.hash('log', 10)

    // Create default admin user
    const userResult = await pool.query(`
      INSERT INTO users (
        organization_id,
        email,
        username,
        name,
        password_hash,
        role
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (username) DO UPDATE
      SET password_hash = EXCLUDED.password_hash
      RETURNING id, username
    `, [orgId, 'admin@example.com', 'admin', 'Administrator', passwordHash, 'admin'])

    if (userResult.rows.length > 0) {
      console.log(`✅ Created/Updated admin user: ${userResult.rows[0].username}`)
      console.log('   Username: admin')
      console.log('   Password: log')
    }

    console.log('✅ Database seeding completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seed()
