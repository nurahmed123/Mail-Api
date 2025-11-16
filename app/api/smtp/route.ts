import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { listSmtpConfigs, saveSmtpConfig, deleteSmtpConfig } from '@lib/db'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@lib/session'

const CreateSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().positive(),
  secure: z.boolean(),
  user: z.string().min(1),
  pass: z.string().min(1),
  fromEmail: z.string().email().optional(),
  fromName: z.string().optional(),
  label: z.string().optional()
})

export async function GET(req: Request) {
  const res = NextResponse.json({ ok: true })
  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  if (!session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const list = await listSmtpConfigs(session.userId)
  const sanitized = list.map(({ pass, ...rest }) => rest)
  return NextResponse.json({ configs: sanitized })
}

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  const res = NextResponse.json({ ok: true })
  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  if (!session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = crypto.randomUUID()
  await saveSmtpConfig({ id, userId: session.userId, ...parsed.data })
  return res
}

const UpdateSchema = z.object({
  id: z.string().min(1),
  host: z.string().min(1),
  port: z.number().int().positive(),
  secure: z.boolean(),
  user: z.string().min(1),
  pass: z.string().min(1),
  fromEmail: z.string().email().optional(),
  fromName: z.string().optional(),
  label: z.string().optional()
})

export async function PUT(req: Request) {
  const body = await req.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  const res = NextResponse.json({ ok: true })
  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  if (!session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await saveSmtpConfig({ userId: session.userId, ...parsed.data })
  return res
}

const DeleteSchema = z.object({ id: z.string().min(1) })

export async function DELETE(req: Request) {
  const body = await req.json()
  const parsed = DeleteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  const res = NextResponse.json({ ok: true })
  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  if (!session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await deleteSmtpConfig(session.userId, parsed.data.id)
  return res
}
