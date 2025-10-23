import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err)

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message
    })
    return
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error'
  })
}
