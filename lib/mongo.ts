import { MongoClient, Db } from 'mongodb'

type Cached = { client: MongoClient | null; db: Db | null; indexesDone?: boolean }
declare global { var __mongo: Cached | undefined }

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017'
const dbName = process.env.MONGO_DB || 'mailapi'

async function ensureIndexes(db: Db) {
  if (global.__mongo?.indexesDone) return
  await db.collection('users').createIndex({ email: 1 }, { unique: true })
  await db.collection('senders').createIndex({ email: 1 }, { unique: true })
  await db.collection('emails').createIndex({ timestamp: -1 })
  await db.collection('smtp_configs').createIndex({ userId: 1, user: 1 }, { unique: true })
  await db.collection('api_tokens').createIndex({ tokenHash: 1 }, { unique: true })
  if (!global.__mongo) global.__mongo = { client: null, db: null, indexesDone: true }
  else global.__mongo.indexesDone = true
}

export async function getDb(): Promise<Db> {
  if (!global.__mongo) global.__mongo = { client: null, db: null }
  if (global.__mongo.db) return global.__mongo.db
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(dbName)
  global.__mongo.client = client
  global.__mongo.db = db
  await ensureIndexes(db)
  return db
}
