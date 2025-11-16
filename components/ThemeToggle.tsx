'use client'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('mailapi_theme') : null
    const isDark = saved === 'dark'
    setDark(isDark)
    if (isDark) document.documentElement.classList.add('dark')
  }, [])
  function toggle() {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('mailapi_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('mailapi_theme', 'light')
    }
  }
  return (
    <button onClick={toggle} className="btn btn-secondary">
      {dark ? 'Light' : 'Dark'}
    </button>
  )
}

