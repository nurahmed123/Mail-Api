import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { listSenders, upsertSender } from '@lib/db'

export async function GET() {
  return NextResponse.json({ senders: await listSenders() })
}

const Schema = z.object({ email: z.string().email(), label: z.string().optional() })

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  const { email, label } = parsed.data
  await upsertSender({ id: crypto.randomUUID(), email, label })
  return NextResponse.json({ ok: true })
}
