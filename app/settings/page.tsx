'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Token = { id: string; label?: string; createdAt: number }

export default function Settings() {
  const router = useRouter()
  const [tokens, setTokens] = useState<Token[]>([])
  const [label, setLabel] = useState('')
  const [newToken, setNewToken] = useState<string>('')

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  async function load() {
    const res = await fetch('/api/tokens')
    const data = await res.json()
    setTokens(data.tokens || [])
  }

  useEffect(() => { load() }, [])

  async function createToken(e: React.FormEvent) {
    e.preventDefault()
    setNewToken('')
    const res = await fetch('/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label })
    })
    const data = await res.json()
    if (res.ok) { setNewToken(data.token); setLabel(''); try { localStorage.setItem(`mailapi_token_${data.id}`, data.token) } catch {} ; load() }
  }

  async function revoke(id: string) {
    await fetch('/api/tokens', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    load()
  }

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold">Account settings</h1>
        <p className="mt-4 text-gray-600">Manage your account or sign out.</p>
        <button onClick={logout} className="btn btn-secondary mt-6">Sign out</button>
      </div>
      <div className="max-w-md">
        <h2 className="text-2xl font-semibold">API Tokens</h2>
        <form onSubmit={createToken} className="mt-6 space-y-3">
          <input className="w-full border rounded-md px-3 py-2" placeholder="Label (optional)" value={label} onChange={e => setLabel(e.target.value)} />
          <button className="btn btn-primary" type="submit">Create token</button>
          {newToken && <div className="mt-4"><div className="text-sm text-gray-600">Copy your token now:</div><pre className="bg-gray-50 p-3 rounded-md select-all">{newToken}</pre></div>}
        </form>
        <div className="mt-8">
          <h3 className="text-lg font-medium">Existing tokens</h3>
          <ul className="mt-2 divide-y">
            {tokens.map(t => (
              <li key={t.id} className="py-2 flex items-center justify-between">
                <span className="text-sm">{t.label || 'Token'} · {new Date(t.createdAt).toLocaleString()}</span>
                <button className="btn btn-secondary" onClick={() => revoke(t.id)}>Revoke</button>
              </li>
            ))}
            {tokens.length === 0 && <li className="py-2 text-gray-500">No tokens yet</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
