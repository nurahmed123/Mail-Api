"use client"
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

type Email = { id: string; from: string; to: string; subject: string; text?: string; html?: string; timestamp: number }

export default function Dashboard() {
  const [emails, setEmails] = useState<Email[]>([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [q, setQ] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [hasText, setHasText] = useState(false)
  const [hasHtml, setHasHtml] = useState(false)

  async function load() {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (subject) params.set('subject', subject)
    if (q) params.set('q', q)
    if (dateFrom) params.set('dateFrom', String(dayjs(dateFrom).valueOf()))
    if (dateTo) params.set('dateTo', String(dayjs(dateTo).endOf('day').valueOf()))
    if (hasText) params.set('hasText', 'true')
    if (hasHtml) params.set('hasHtml', 'true')
    const res = await fetch('/api/emails?' + params.toString())
    const data = await res.json()
    setEmails(data.emails || [])
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    const t = setTimeout(() => { load() }, 300)
    return () => clearTimeout(t)
  }, [from, to, subject, q, dateFrom, dateTo, hasText, hasHtml])

  const today = dayjs().startOf('day')
  const sentToday = useMemo(() => emails.filter(e => dayjs(e.timestamp).isAfter(today)).length, [emails])
  const total = emails.length
  const bySender = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const e of emails) counts[e.from] = (counts[e.from] || 0) + 1
    return Object.entries(counts).map(([sender, count]) => ({ sender, count })).sort((a, b) => b.count - a.count)
  }, [emails])

  function preview(e: { text?: string; html?: string }) {
    const t = e.text?.trim()
    if (t) return t.length > 200 ? t.slice(0, 200) + '…' : t
    const h = e.html || ''
    const s = h.replace(/<[^>]+>/g, '').trim()
    return s.length > 200 ? s.slice(0, 200) + '…' : s
  }

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card card-pad">
          <div className="text-sm text-gray-500">Emails sent today</div>
          <div className="mt-2 text-3xl font-bold">{sentToday}</div>
        </div>
        <div className="card card-pad">
          <div className="text-sm text-gray-500">Total emails</div>
          <div className="mt-2 text-3xl font-bold">{total}</div>
        </div>
        <div className="card card-pad">
          <div className="text-sm text-gray-500">Unique senders</div>
          <div className="mt-2 text-3xl font-bold">{bySender.length}</div>
        </div>
      </div>

      <div className="card card-pad">
        <div className="text-sm text-gray-500">By sender</div>
        <ul className="mt-2 divide-y">
          {bySender.map((x) => (
            <li key={x.sender} className="py-2 flex justify-between"><span>{x.sender}</span><span className="font-semibold">{x.count}</span></li>
          ))}
          {bySender.length === 0 && <li className="py-2 text-gray-500">No emails yet</li>}
        </ul>
      </div>

      <div className="card card-pad">
        <div className="grid md:grid-cols-3 gap-3">
          <input className="border rounded-md px-3 py-2" placeholder="From" value={from} onChange={e => setFrom(e.target.value)} />
          <input className="border rounded-md px-3 py-2" placeholder="To contains" value={to} onChange={e => setTo(e.target.value)} />
          <input className="border rounded-md px-3 py-2" placeholder="Subject contains" value={subject} onChange={e => setSubject(e.target.value)} />
          <input className="border rounded-md px-3 py-2 md:col-span-2" placeholder="Content contains" value={q} onChange={e => setQ(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className="border rounded-md px-3 py-2" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <input className="border rounded-md px-3 py-2" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={hasText} onChange={e => setHasText(e.target.checked)} /> Has text</label>
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={hasHtml} onChange={e => setHasHtml(e.target.checked)} /> Has HTML</label>
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <div className="text-sm text-gray-500">Recent emails</div>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">From</th>
                <th className="py-2 pr-4">To</th>
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2">Content</th>
              </tr>
            </thead>
            <tbody>
              {emails.slice().sort((a,b)=>b.timestamp-a.timestamp).map(e => (
                <tr key={e.id} className="border-t">
                  <td className="py-2 pr-4 whitespace-nowrap">{dayjs(e.timestamp).format('YYYY-MM-DD HH:mm')}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{e.from}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{e.to}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{e.subject}</td>
                  <td className="py-2 text-gray-600 dark:text-gray-300">{preview(e)}</td>
                </tr>
              ))}
              {emails.length === 0 && (
                <tr>
                  <td className="py-4 text-gray-500" colSpan={5}>No emails match filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
