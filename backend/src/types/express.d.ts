import { Request } from 'express'

declare global {
  namespace Express {
    interface User {
      id: string
      email: string
      organizationId: string
      role: string
    }
  }
}
