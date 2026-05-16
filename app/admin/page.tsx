'use client'

import '../globals.css'
import { FormEvent, useState } from 'react'
import { LockKeyhole } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('123456')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    console.log('Login attempt started')
    setIsLoading(true)
    setError('')

    try {
      const payload = { username, password }
      console.log('Payload:', payload)

      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        setError('Falscher Benutzername oder Passwort')
        return
      }

      router.push('/admin/dashboard')
      router.refresh()
    } catch {
      setError('Anmeldung fehlgeschlagen. Bitte erneut versuchen.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-light-bg py-10">
      <div className="w-full max-w-md rounded-2xl border border-primary-blue/10 bg-white p-8 shadow-xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-blue/10 text-accent-blue">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-primary-blue">Admin Login</h1>
            <p className="text-sm text-slate-600">Zahnärzte Cuxhaven – CMS Zugang</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary-blue">Benutzername</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl border border-primary-blue/15 bg-white px-4 py-3 text-sm text-primary-blue outline-none ring-accent-blue/20 transition focus:ring-4"
              placeholder="admin"
              autoComplete="username"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-primary-blue">Passwort</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-primary-blue/15 bg-white px-4 py-3 text-sm text-primary-blue outline-none ring-accent-blue/20 transition focus:ring-4"
              placeholder="123456"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#1E3A8A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1E3A8A]/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? 'Loading...' : 'Anmelden'}
          </button>
        </form>

        <p className="mt-5 text-xs text-slate-500">Demo-Zugang: admin / 123456</p>
      </div>
    </section>
  )
}
