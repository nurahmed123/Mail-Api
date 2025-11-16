'use client'
import { useEffect, useMemo, useState } from 'react'

type Smtp = { id: string; label?: string; user: string; fromEmail?: string; fromName?: string }
type TokenItem = { id: string; label?: string; createdAt: number; value?: string }

export default function Playground() {
  const [smtpList, setSmtpList] = useState<Smtp[]>([])
  const [selectedSmtpId, setSelectedSmtpId] = useState<string>('')
  const [tokens, setTokens] = useState<TokenItem[]>([])
  const [selectedTokenId, setSelectedTokenId] = useState<string>('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [replyTo, setReplyTo] = useState('')
  const [subject, setSubject] = useState('')
  const [text, setText] = useState('')
  const [html, setHtml] = useState('')
  const [useHtml, setUseHtml] = useState(false)
  const [token, setToken] = useState('')
  const [smtpUser, setSmtpUser] = useState('')
  const [result, setResult] = useState<string>('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/smtp')
      const data = await res.json()
      const list: Smtp[] = (data.configs || []).map((c: any) => ({ id: c.id, label: c.label, user: c.user, fromEmail: c.fromEmail, fromName: c.fromName }))
      setSmtpList(list)
      if (list.length) {
        setSelectedSmtpId(list[0].id)
        setSmtpUser(list[0].user)
        const f = list[0].fromEmail || list[0].user
        setFrom(f)
        setReplyTo(f)
      }
      const tRes = await fetch('/api/tokens')
      const tData = await tRes.json()
      const tList: TokenItem[] = (tData.tokens || []).map((t: any) => ({ id: t.id, label: t.label, createdAt: t.createdAt, value: typeof window !== 'undefined' ? localStorage.getItem(`mailapi_token_${t.id}`) || undefined : undefined }))
      setTokens(tList)
      if (tList.length) {
        setSelectedTokenId(tList[0].id)
        const v = tList[0].value
        if (v) setToken(v)
      }
    })()
  }, [])

  useEffect(() => {
    const cfg = smtpList.find(x => x.id === selectedSmtpId)
    if (!cfg) return
    setSmtpUser(cfg.user)
    const f = cfg.fromEmail || cfg.user
    if (!from) setFrom(f)
    if (!replyTo) setReplyTo(f)
  }, [selectedSmtpId])

  const payload = useMemo(() => {
    const p: any = { subject, smtpUser }
    const toArr = to.split(',').map(x => x.trim()).filter(Boolean)
    if (toArr.length) p.to = toArr
    const ccArr = cc.split(',').map(x => x.trim()).filter(Boolean)
    if (ccArr.length) p.cc = ccArr
    const bccArr = bcc.split(',').map(x => x.trim()).filter(Boolean)
    if (bccArr.length) p.bcc = bccArr
    if (replyTo) p.replyTo = replyTo
    if (from) p.from = from
    if (useHtml && html) p.html = html
    else if (text) p.text = text
    return p
  }, [from, to, cc, bcc, replyTo, subject, text, html, useHtml, smtpUser])

  const curl = useMemo(() => {
    const headers = [`Content-Type: application/json`]
    if (token) headers.unshift(`Authorization: Bearer ${token}`)
    const body = JSON.stringify(payload, null, 2)
    const hdr = headers.map(h => `-H "${h}"`).join(' \
  ')
    return `curl -X POST \
  ${hdr} \
  -d '${body.replace(/'/g, "'\''")}' \
  http://localhost:3000/api/send`
  }, [token, payload])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      setResult(JSON.stringify(data, null, 2))
    } finally {
      setSending(false)
    }
  }

  const cfg = smtpList.find(x => x.id === selectedSmtpId)
  const fromOptions = cfg ? [cfg.user, cfg.fromEmail].filter(Boolean) as string[] : []

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold">API Playground</h1>
        <form onSubmit={send} className="mt-6 space-y-3">
          <div>
            <label className="text-sm text-gray-600">API Token</label>
            <div className="grid grid-cols-2 gap-3">
              <select className="border rounded-md px-3 py-2" value={selectedTokenId} onChange={e => {
                const id = e.target.value
                setSelectedTokenId(id)
                const item = tokens.find(x => x.id === id)
                const val = item?.value
                setToken(val || '')
              }} disabled={!tokens.length}>
                {tokens.map(t => <option key={t.id} value={t.id}>{(t.label || 'Token') + ' · ' + new Date(t.createdAt).toLocaleDateString()}</option>)}
              </select>
              <input className="border rounded-md px-3 py-2" placeholder="Paste token value" value={token} onChange={e => setToken(e.target.value)} />
            </div>
            {!tokens.length && <div className="text-xs text-gray-500 mt-1">No tokens yet. Create one in Settings.</div>}
          </div>
          <div>
            <label className="text-sm text-gray-600">SMTP Config</label>
            <select className="w-full border rounded-md px-3 py-2" value={selectedSmtpId} onChange={e => setSelectedSmtpId(e.target.value)} disabled={!smtpList.length}>
              {smtpList.map(s => <option key={s.id} value={s.id}>{(s.label || s.user) + (s.fromEmail ? ` · ${s.fromEmail}` : '')}</option>)}
            </select>
            {!smtpList.length && <div className="text-xs text-gray-500 mt-1">Configure SMTP in Setup first</div>}
          </div>
          <div>
            <label className="text-sm text-gray-600">From</label>
            <select className="w-full border rounded-md px-3 py-2" value={from} onChange={e => setFrom(e.target.value)} disabled={!fromOptions.length}>
              {fromOptions.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <input className="w-full border rounded-md px-3 py-2" placeholder="To (comma separated)" value={to} onChange={e => setTo(e.target.value)} />
          <input className="w-full border rounded-md px-3 py-2" placeholder="CC (comma separated)" value={cc} onChange={e => setCc(e.target.value)} />
          <input className="w-full border rounded-md px-3 py-2" placeholder="BCC (comma separated)" value={bcc} onChange={e => setBcc(e.target.value)} />
          <div>
            <label className="text-sm text-gray-600">Reply-To</label>
            <select className="w-full border rounded-md px-3 py-2" value={replyTo} onChange={e => setReplyTo(e.target.value)} disabled={!fromOptions.length}>
              {fromOptions.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <input className="w-full border rounded-md px-3 py-2" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
          <div className="flex items-center gap-3 text-sm">
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={useHtml} onChange={e => setUseHtml(e.target.checked)} /> Use HTML</label>
          </div>
          {!useHtml && <textarea className="w-full border rounded-md px-3 py-2" placeholder="Text" value={text} onChange={e => setText(e.target.value)} />}
          {useHtml && <textarea className="w-full border rounded-md px-3 py-2" placeholder="HTML" value={html} onChange={e => setHtml(e.target.value)} />}
          <button className="btn btn-primary w-full" type="submit" disabled={!smtpList.length || !token || sending}>
            {sending ? (<span className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>Sending…</span>) : 'Send'}
          </button>
        </form>
        {result && <pre className="mt-4 bg-gray-50 p-4 rounded-md">{result}</pre>}
      </div>
      <div className="card card-pad">
        <div className="text-sm text-gray-500">Live request</div>
        <pre className="mt-2 text-xs bg-gray-50 p-4 rounded-md overflow-auto">{curl}</pre>
      </div>
    </div>
  )
}
