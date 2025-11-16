import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { findUserByEmail } from '@lib/db'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@lib/session'

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

function hash(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  const { email, password } = parsed.data
  const u = await findUserByEmail(email)
  if (!u || u.passwordHash !== hash(password)) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  const res = NextResponse.json({ ok: true })
  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  session.userId = u.id
  await session.save()
  return res
}
