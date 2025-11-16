import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { addUser, findUserByEmail } from '@lib/db'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@lib/session'

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
})

function hash(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  const { email, password, name } = parsed.data
  if (await findUserByEmail(email)) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
  const id = crypto.randomUUID()
  await addUser({ id, email: email.toLowerCase(), passwordHash: hash(password), name })
  const res = NextResponse.json({ ok: true })
  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  session.userId = id
  await session.save()
  return res
}
