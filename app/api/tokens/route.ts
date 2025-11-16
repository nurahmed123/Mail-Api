import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createApiToken, listApiTokens, revokeApiToken } from '@lib/db'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@lib/session'

export async function GET(req: Request) {
  const res = NextResponse.json({ ok: true })
  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  if (!session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const tokens = await listApiTokens(session.userId)
  return NextResponse.json({ tokens })
}

const CreateSchema = z.object({ label: z.string().optional() })

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  const res = NextResponse.json({ ok: true })
  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  if (!session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { token, id } = await createApiToken(session.userId, parsed.data.label)
  return NextResponse.json({ token, id })
}

const DeleteSchema = z.object({ id: z.string().min(1) })

export async function DELETE(req: Request) {
  const body = await req.json()
  const parsed = DeleteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  const res = NextResponse.json({ ok: true })
  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  if (!session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await revokeApiToken(session.userId, parsed.data.id)
  return res
}

