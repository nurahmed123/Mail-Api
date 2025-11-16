'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })
    if (res.ok) router.push('/dashboard')
    else setError((await res.json()).error || 'Signup failed')
  }

  return (
    <div className="max-w-md mx-auto card card-pad">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input className="w-full rounded-md px-3 py-2" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="w-full rounded-md px-3 py-2" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full rounded-md px-3 py-2" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn btn-primary w-full" type="submit">Sign up</button>
      </form>
    </div>
  )
}
