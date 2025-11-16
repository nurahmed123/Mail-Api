'use client'
export default function ApiGuide() {
  const sample = `POST /api/send
Content-Type: application/json

{
  "from": "sender@example.com",
  "to": "user@example.com",
  "subject": "Hello",
  "text": "Welcome"
}`
  return (
    <div className="prose max-w-none">
      <h1>Mail API</h1>
      <p>Use the REST endpoint to send emails. Authentication uses a bearer token; for this demo, the endpoint is open and records email requests for dashboard analytics.</p>
      <h2>Send an email</h2>
      <pre><code>{sample}</code></pre>
      <p>Monitor analytics on the Dashboard. Configure allowed senders in Setup.</p>
    </div>
  )
}
