import { SessionOptions } from 'iron-session'

export type SessionData = {
  userId?: string
}

export const sessionOptions: SessionOptions = {
  cookieName: 'mailapi_session',
  password: process.env.SESSION_SECRET || 'dev-secret-please-change-in-env-1234567890',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production'
  }
}
