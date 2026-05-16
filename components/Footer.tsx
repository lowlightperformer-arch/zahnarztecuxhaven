'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SmilePlus, Share2 } from 'lucide-react'

interface SiteSettings {
  facebookUrl: string
  aboutUsSlug: string
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/admin/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Footer settings fetch error:', error)
      }
    }
    fetchSettings()
  }, [])

  return (
    <footer className="border-t border-primary-blue/5 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
          {/* Col 1: Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent-blue/20 bg-accent-blue/10 text-accent-blue">
                <SmilePlus className="h-6 w-6" strokeWidth={1.8} />
              </span>
              <span>
                ZAHNÄRZTE <span className="text-slate-500">CUXHAVEN</span>
              </span>
            </Link>

            {settings?.facebookUrl && (
              <div className="pt-2">
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-slate-400 transition-all hover:scale-110 hover:bg-blue-600 hover:text-white"
                  aria-label="Folgen Sie uns auf Facebook"
                >
                  <Share2 className="h-5 w-5" />
                </a>
              </div>
            )}
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Navigation</h3>
            <ul className="mt-6 space-y-4">
              <li>
                <Link href="/" className="text-sm transition hover:text-accent-blue font-medium">
                  Startseite
                </Link>
              </li>
              <li>
                <Link href="/ratgeber" className="text-sm transition hover:text-accent-blue font-medium">
                  Ratgeber
                </Link>
              </li>
              <li>
                <Link href="/uber-uns" className="text-sm transition hover:text-accent-blue font-medium">
                  Über uns
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Rechtliches</h3>
            <ul className="mt-6 space-y-4">
              <li>
                <Link href="/impressum" className="text-xs transition hover:text-accent-blue text-slate-400">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-xs transition hover:text-accent-blue text-slate-400">
                  Datenschutz
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-white/5 pt-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <p className="text-xs text-slate-500">
              © {currentYear} Zahnärzte Cuxhaven. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Made for Cuxhaven
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
