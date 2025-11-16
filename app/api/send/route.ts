import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { logEmail, getSmtpConfigByUser, findUserIdByToken } from '@lib/db'
import nodemailer, { type SendMailOptions } from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@lib/session'

const emailOrArray = z.union([z.string().email(), z.array(z.string().email())])
const Schema = z.object({
  from: z.string().email().optional(),
  to: emailOrArray,
  cc: emailOrArray.optional(),
  bcc: emailOrArray.optional(),
  replyTo: z.string().email().optional(),
  subject: z.string().min(1),
  text: z.string().optional(),
  html: z.string().optional(),
  smtpUser: z.string().optional(),
  token: z.string().optional()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    const { from, to, cc, bcc, replyTo, subject, text, html, smtpUser } = parsed.data

    const res = NextResponse.json({ ok: true })
    const authHeader = (req as any).headers?.get?.('authorization') || ''
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    let userId: string | undefined
    if (bearer) userId = await findUserIdByToken(bearer)
    if (!userId) {
      const session = await getIronSession<SessionData>(req, res, sessionOptions)
      userId = session.userId
    }
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const cfg = smtpUser ? await getSmtpConfigByUser(userId, smtpUser) : null
    if (!cfg) return NextResponse.json({ error: 'SMTP not configured' }, { status: 400 })

    const is465 = cfg.port === 465
    const primary: SMTPTransport.Options = {
      host: cfg.host,
      port: cfg.port,
      secure: is465 || !!cfg.secure,
      auth: { user: cfg.user, pass: cfg.pass },
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      name: 'mailapi.local',
      tls: { minVersion: 'TLSv1.2', rejectUnauthorized: false }
    }

    const toArr = Array.isArray(to) ? to : [to]
    const ccArr = cc ? (Array.isArray(cc) ? cc : [cc]) : undefined
    const bccArr = bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined

    const fromHeader = cfg.fromEmail ? (cfg.fromName ? `${cfg.fromName} <${cfg.fromEmail}>` : cfg.fromEmail) : from
    const mail: SendMailOptions = { from: fromHeader, to: toArr, cc: ccArr || undefined, bcc: bccArr || undefined, replyTo, subject, text, html }

    let info
    try {
      info = await nodemailer.createTransport(primary).sendMail(mail)
    } catch (err: any) {
      const msg = String(err?.message || '')
      const code = String((err && err.code) || '')
      let fallback
      if (cfg.port === 465 && (code === 'ECONNREFUSED' || msg.includes('ECONNREFUSED'))) {
        fallback = { ...primary, port: 587, secure: false } as SMTPTransport.Options
      } else if (cfg.port === 587 && (msg.includes('Greeting never received') || code === 'ETIMEDOUT')) {
        fallback = { ...primary, port: 465, secure: true } as SMTPTransport.Options
      }
      if (fallback) {
        info = await nodemailer.createTransport(fallback).sendMail(mail)
      } else {
        throw err
      }
    }

    await logEmail({ id: crypto.randomUUID(), from: (cfg.fromEmail || from || cfg.user).toLowerCase(), to: toArr.join(','), subject, text, html, timestamp: Date.now() })
    const previewUrl = cfg.host.includes('ethereal.email') ? nodemailer.getTestMessageUrl(info) : undefined
    return NextResponse.json({ ok: true, messageId: info.messageId, previewUrl })
  } catch (e: any) {
    const msg = typeof e?.message === 'string' ? e.message : 'Bad request'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
