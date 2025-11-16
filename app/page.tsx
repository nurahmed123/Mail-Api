import Link from 'next/link'

export default function Landing() {
  return (
    <div className="grid md:grid-cols-2 gap-10 items-center">
      <div>
        <h1 className="heading">Email infrastructure for builders</h1>
        <p className="mt-4 subheading">
          Send, track, and manage emails with a simple REST API. Built-in dashboard, SMTP setup, and API playground.
        </p>
        <div className="mt-6 flex gap-4">
          <Link href="/signup" className="btn btn-primary">Get started</Link>
          <Link href="/api-docs" className="btn btn-secondary">Read API guide</Link>
        </div>
      </div>
      <div className="card card-pad">
        <div className="text-sm text-gray-500">Example request</div>
        <pre className="mt-2 text-xs bg-gray-50 p-4 rounded-md overflow-auto">{
`POST /api/send\nContent-Type: application/json\nAuthorization: Bearer <your_token>\n\n{\n  "from": "noreply@yourapp.com",\n  "to": "user@example.com",\n  "subject": "Welcome!",\n  "text": "Thanks for signing up."\n}`
        }</pre>
      </div>
    </div>
  )
}
