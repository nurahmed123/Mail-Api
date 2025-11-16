import './globals.css'
import Link from 'next/link'
import ThemeToggle from '@components/ThemeToggle'
import LogoutButton from '@components/LogoutButton'
import { cookies } from 'next/headers'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Mail API',
  description: 'Modern email API with dashboard, setup, and playground'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasSession = cookies().get('mailapi_session') ? true : false
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen text-gray-900 dark:text-gray-100`}
      >
        <header className="bg-gradient-to-r from-brand-500 to-brand-700 dark:from-gray-900 dark:to-gray-800 text-white">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-semibold">Mail API</Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/dashboard" className="hover:opacity-90">Dashboard</Link>
              <Link href="/api-docs" className="hover:opacity-90">API</Link>
              <Link href="/api-playground" className="hover:opacity-90">Playground</Link>
              <Link href="/setup" className="hover:opacity-90">Setup</Link>
              <Link href="/settings" className="hover:opacity-90">Settings</Link>
              <ThemeToggle />
              {hasSession ? (
                <LogoutButton />
              ) : (
                <>
                  <Link href="/login" className="btn btn-secondary">Log in</Link>
                  <Link href="/signup" className="btn btn-primary">Sign up</Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </body>
    </html>
  )
}
