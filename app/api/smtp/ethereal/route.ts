import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@lib/session'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import { saveSmtpConfig } from '@lib/db'

export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true })
  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  if (!session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const acc = await nodemailer.createTestAccount()
  const id = crypto.randomUUID()
  await saveSmtpConfig({
    id,
    userId: session.userId,
    label: 'Ethereal',
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    user: acc.user,
    pass: acc.pass,
    fromEmail: acc.user,
    fromName: 'Mail API'
  })
  return NextResponse.json({ ok: true, id })
}

