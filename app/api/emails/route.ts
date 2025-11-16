import { NextResponse } from 'next/server'
import { getDb } from '@lib/mongo'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const from = url.searchParams.get('from') || undefined
  const to = url.searchParams.get('to') || undefined
  const subject = url.searchParams.get('subject') || undefined
  const q = url.searchParams.get('q') || undefined
  const dateFrom = url.searchParams.get('dateFrom') ? Number(url.searchParams.get('dateFrom')) : undefined
  const dateTo = url.searchParams.get('dateTo') ? Number(url.searchParams.get('dateTo')) : undefined
  const hasText = url.searchParams.get('hasText') === 'true'
  const hasHtml = url.searchParams.get('hasHtml') === 'true'

  const query: any = {}
  if (from) query.from = from.toLowerCase()
  if (to) query.to = { $regex: to, $options: 'i' }
  if (subject) query.subject = { $regex: subject, $options: 'i' }
  if (q) query.$or = [
    { text: { $regex: q, $options: 'i' } },
    { html: { $regex: q, $options: 'i' } }
  ]
  if (dateFrom || dateTo) {
    query.timestamp = {}
    if (dateFrom) query.timestamp.$gte = dateFrom
    if (dateTo) query.timestamp.$lte = dateTo
  }
  if (hasText) query.text = { $exists: true, $ne: null }
  if (hasHtml) query.html = { $exists: true, $ne: null }

  const db = await getDb()
  const items = await db.collection('emails').find(query).toArray()
  return NextResponse.json({ emails: items })
}

