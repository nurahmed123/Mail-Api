import { getDb } from './mongo'
import crypto from 'crypto'

export type User = { id: string; email: string; passwordHash: string; name?: string }
export type Sender = { id: string; email: string; label?: string }
export type EmailLog = { id: string; from: string; to: string; subject: string; text?: string; html?: string; timestamp: number }
export type SmtpConfig = { id: string; userId: string; host: string; port: number; secure: boolean; user: string; pass: string; fromEmail?: string; fromName?: string; label?: string }
export type ApiToken = { id: string; userId: string; tokenHash: string; label?: string; createdAt: number }

export async function addUser(user: User) {
  const db = await getDb()
  await db.collection<User>('users').insertOne(user)
}

export async function findUserByEmail(email: string) {
  const db = await getDb()
  return db.collection<User>('users').findOne({ email: email.toLowerCase() })
}

export async function upsertSender(sender: Sender) {
  const db = await getDb()
  await db.collection<Sender>('senders').updateOne(
    { email: sender.email.toLowerCase() },
    { $set: { ...sender, email: sender.email.toLowerCase() } },
    { upsert: true }
  )
}

export async function listSenders() {
  const db = await getDb()
  return db.collection<Sender>('senders').find().toArray()
}

export async function logEmail(entry: EmailLog) {
  const db = await getDb()
  await db.collection<EmailLog>('emails').insertOne(entry)
}

export async function listEmails() {
  const db = await getDb()
  return db.collection<EmailLog>('emails').find().toArray()
}

export async function queryEmails(filters: {
  from?: string
  to?: string
  subject?: string
  q?: string
  dateFrom?: number
  dateTo?: number
  hasText?: boolean
  hasHtml?: boolean
}) {
  const db = await getDb()
  const q: any = {}
  if (filters.from) q.from = filters.from.toLowerCase()
  if (filters.to) q.to = { $regex: filters.to, $options: 'i' }
  if (filters.subject) q.subject = { $regex: filters.subject, $options: 'i' }
  if (filters.q) q.$or = [
    { text: { $regex: filters.q, $options: 'i' } },
    { html: { $regex: filters.q, $options: 'i' } }
  ]
  if (filters.dateFrom || filters.dateTo) {
    q.timestamp = {}
    if (filters.dateFrom) q.timestamp.$gte = filters.dateFrom
    if (filters.dateTo) q.timestamp.$lte = filters.dateTo
  }
  if (filters.hasText) q.text = { $exists: true, $ne: null }
  if (filters.hasHtml) q.html = { $exists: true, $ne: null }
  return db.collection<EmailLog>('emails').find(q).toArray()
}

export async function listSmtpConfigs(userId: string) {
  const db = await getDb()
  return db.collection<SmtpConfig>('smtp_configs').find({ userId }).toArray()
}

export async function getSmtpConfigByUser(userId: string, smtpUser: string) {
  const db = await getDb()
  return db.collection<SmtpConfig>('smtp_configs').findOne({ userId, user: smtpUser })
}

export async function saveSmtpConfig(cfg: SmtpConfig) {
  const db = await getDb()
  await db.collection<SmtpConfig>('smtp_configs').updateOne(
    { userId: cfg.userId, id: cfg.id },
    { $set: cfg },
    { upsert: true }
  )
}

export async function deleteSmtpConfig(userId: string, id: string) {
  const db = await getDb()
  await db.collection<SmtpConfig>('smtp_configs').deleteOne({ userId, id })
}

function hashToken(t: string) {
  return crypto.createHash('sha256').update(t).digest('hex')
}

export async function createApiToken(userId: string, label?: string) {
  const db = await getDb()
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashToken(token)
  const id = crypto.randomUUID()
  await db.collection<ApiToken>('api_tokens').insertOne({ id, userId, tokenHash, label, createdAt: Date.now() })
  return { token, id }
}

export async function listApiTokens(userId: string) {
  const db = await getDb()
  return db.collection<ApiToken>('api_tokens').find({ userId }).project({ tokenHash: 0 }).toArray()
}

export async function revokeApiToken(userId: string, id: string) {
  const db = await getDb()
  await db.collection<ApiToken>('api_tokens').deleteOne({ userId, id })
}

export async function findUserIdByToken(token: string) {
  const db = await getDb()
  const tokenHash = hashToken(token)
  const doc = await db.collection<ApiToken>('api_tokens').findOne({ tokenHash })
  return doc?.userId
}
