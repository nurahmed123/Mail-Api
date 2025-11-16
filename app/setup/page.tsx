'use client'
import { useEffect, useState } from 'react'

type SmtpConfig = { id?: string; label?: string; host: string; port: number; secure: boolean; user: string; pass?: string; fromEmail?: string; fromName?: string }

export default function Setup() {
  const [label, setLabel] = useState('')

  const [smtp, setSmtp] = useState<SmtpConfig>({ id: undefined, label: '', host: '', port: 587, secure: false, user: '', pass: '', fromEmail: '', fromName: '' })
  const [smtpList, setSmtpList] = useState<SmtpConfig[]>([])
  const [smtpSaved, setSmtpSaved] = useState(false)
  const [etherealSaved, setEtherealSaved] = useState(false)

  async function load() {
    const smtpRes = await fetch('/api/smtp')
    const smtpData = await smtpRes.json()
    if (smtpData?.configs) setSmtpList(smtpData.configs)
  }

  useEffect(() => { load() }, [])

  

  async function saveSmtp(e: React.FormEvent) {
    e.preventDefault()
    setSmtpSaved(false)
    const payload = { ...smtp, port: Number(smtp.port), secure: Boolean(smtp.secure) }
    const method = smtp.id ? 'PUT' : 'POST'
    const res = await fetch('/api/smtp', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) setSmtpSaved(true)
    load()
  }

  async function generateEthereal() {
    setEtherealSaved(false)
    const res = await fetch('/api/smtp/ethereal', { method: 'POST' })
    if (res.ok) { setEtherealSaved(true); load() }
  }

  async function editSmtp(id: string) {
    const cfg = smtpList.find(x => x.id === id)
    if (cfg) setSmtp({ ...cfg, pass: '' })
  }

  async function deleteSmtp(id: string) {
    await fetch('/api/smtp', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    load()
  }

  return (
    <div className="max-w-2xl">
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold">SMTP configuration</h1>
        <form onSubmit={saveSmtp} className="mt-6 space-y-3">
          <input className="w-full border rounded-md px-3 py-2" placeholder="Label (optional)" value={smtp.label || ''} onChange={e => setSmtp({ ...smtp, label: e.target.value })} />
          <input className="w-full border rounded-md px-3 py-2" placeholder="Host" value={smtp.host} onChange={e => setSmtp({ ...smtp, host: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input className="border rounded-md px-3 py-2" placeholder="Port" type="number" value={smtp.port} onChange={e => setSmtp({ ...smtp, port: Number(e.target.value) })} />
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={smtp.secure} onChange={e => setSmtp({ ...smtp, secure: e.target.checked })} /> Use TLS (secure)</label>
          </div>
          <input className="w-full border rounded-md px-3 py-2" placeholder="SMTP Username" value={smtp.user} onChange={e => setSmtp({ ...smtp, user: e.target.value })} />
          <input className="w-full border rounded-md px-3 py-2" placeholder="SMTP Password" type="password" value={smtp.pass} onChange={e => setSmtp({ ...smtp, pass: e.target.value })} />
          <input className="w-full border rounded-md px-3 py-2" placeholder="From Email" value={smtp.fromEmail || ''} onChange={e => setSmtp({ ...smtp, fromEmail: e.target.value })} />
          <input className="w-full border rounded-md px-3 py-2" placeholder="From Name (optional)" value={smtp.fromName || ''} onChange={e => setSmtp({ ...smtp, fromName: e.target.value })} />
          <button className="btn btn-primary" type="submit">Save SMTP</button>
          {smtpSaved && <div className="text-green-700 text-sm">SMTP settings saved</div>}
          <div className="flex items-center gap-3">
            <button type="button" onClick={generateEthereal} className="btn btn-secondary">Generate test SMTP (Ethereal)</button>
            {etherealSaved && <div className="text-green-700 text-sm">Ethereal SMTP added</div>}
          </div>
        </form>
        <div className="mt-8">
          <h3 className="text-lg font-medium">Configured SMTPs</h3>
          <ul className="mt-2 divide-y">
            {smtpList.map(s => (
              <li key={s.id} className="py-2 flex items-center justify-between">
                <span className="text-sm">{s.label || s.user} · {s.host}:{s.port} {s.secure ? '(TLS)' : ''}</span>
                <div className="flex gap-2">
                  <button className="btn btn-secondary" onClick={() => editSmtp(s.id!)}>Edit</button>
                  <button className="btn btn-secondary" onClick={() => deleteSmtp(s.id!)}>Delete</button>
                </div>
              </li>
            ))}
            {smtpList.length === 0 && <li className="py-2 text-gray-500">No SMTP configurations yet</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
