'use client'

import React, { useEffect, useState } from 'react'
import { Save, Settings, BarChart3, Mail, Info, Search, Share2, ShieldCheck, ExternalLink } from 'lucide-react'
import { SiteSettings } from '@/lib/cms'

export default function SiteSettingsManager() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [settings, setSettings] = useState<Partial<SiteSettings>>({
    facebookUrl: '',
    gaId: '',
    gscMetaTag: '',
    email: '',
    aboutUsSlug: 'ueber-uns',
    robotsTxt: ''
  })

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/admin/settings', { cache: 'no-store' })
        if (!response.ok) throw new Error('Fehler beim Laden der Einstellungen.')
        const data = await response.json()
        setSettings(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Laden fehlgeschlagen.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  async function handleUpdateSettings() {
    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Speichern fehlgeschlagen.')
      }

      setSuccess('Einstellungen erfolgreich gespeichert.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="py-8 text-slate-500 italic">Einstellungen werden geladen...</div>
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-primary-blue">Global Settings</h2>
        <button
          onClick={handleUpdateSettings}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-blue px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-blue/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Speichert...' : 'Einstellungen speichern'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
          {error}
        </div>
      )}
      
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
          {success}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Social Media */}
        <section className="rounded-3xl border border-primary-blue/10 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-lg bg-blue-50 p-2 text-primary-blue">
              <Share2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-primary-blue">Social Media</h3>
          </div>
          
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Facebook URL</span>
              <input
                type="url"
                value={settings.facebookUrl || ''}
                onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
              />
            </label>
          </div>
        </section>

        {/* Contact & Content */}
        <section className="rounded-3xl border border-primary-blue/10 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-lg bg-blue-50 p-2 text-primary-blue">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-primary-blue">Kontakt & Inhalte</h3>
          </div>
          
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Allgemeine E-Mail</span>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="info@zahnarztecuxhaven.de"
                className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Über uns URL-Slug</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">/</span>
                <input
                  type="text"
                  value={settings.aboutUsSlug || ''}
                  onChange={(e) => setSettings({ ...settings, aboutUsSlug: e.target.value })}
                  placeholder="ueber-uns"
                  className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                />
              </div>
            </label>
          </div>
        </section>

        {/* Analytics & Search Console */}
        <section className="rounded-3xl border border-primary-blue/10 bg-white p-6 shadow-sm md:col-span-2">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-lg bg-blue-50 p-2 text-primary-blue">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-primary-blue">Tracking & Verifizierung</h3>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Google Analytics ID</span>
              <input
                type="text"
                value={settings.gaId || ''}
                onChange={(e) => setSettings({ ...settings, gaId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
              />
              <p className="mt-2 text-xs text-slate-400 flex items-start gap-1">
                <Info className="h-3 w-3 mt-0.5 shrink-0" />
                Ihre Google Analytics 4 Mess-ID (beginnt mit G-).
              </p>
            </label>
            
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-blue flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Console Meta Tag
              </span>
              <textarea
                value={settings.gscMetaTag || ''}
                onChange={(e) => setSettings({ ...settings, gscMetaTag: e.target.value })}
                placeholder='<meta name="google-site-verification" content="..." />'
                rows={3}
                className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4 font-mono"
              />
              <p className="mt-2 text-xs text-slate-400 flex items-start gap-1">
                <Info className="h-3 w-3 mt-0.5 shrink-0" />
                Vollständiges Meta-Tag zur Inhaberschaftsbestätigung.
              </p>
            </label>
          </div>
        </section>

        {/* Robots & Sitemap */}
        <section className="rounded-3xl border border-primary-blue/10 bg-white p-6 shadow-sm md:col-span-2">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-lg bg-blue-50 p-2 text-primary-blue">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-primary-blue">SEO Konfiguration (Robots & Sitemap)</h3>
          </div>
          
          <div className="space-y-6">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-blue flex items-center gap-2">
                Robots.txt Inhalt
              </span>
              <textarea
                value={settings.robotsTxt || ''}
                onChange={(e) => setSettings({ ...settings, robotsTxt: e.target.value })}
                placeholder="User-agent: *&#10;Allow: /"
                rows={5}
                className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4 font-mono bg-slate-50/50"
              />
              <p className="mt-2 text-xs text-slate-400">
                Steuern Sie, wie Suchmaschinen Ihre Website crawlen. Lassen Sie das Feld leer für Standard-Einstellungen.
              </p>
            </label>

            <div className="pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <h4 className="font-bold text-primary-blue text-sm">Automatisierte Sitemap</h4>
                  <p className="text-xs text-slate-500">Ihre Sitemap wird automatisch für alle Kliniken und Seiten generiert.</p>
                </div>
                <a 
                  href="/sitemap.xml" 
                  target="_blank" 
                  className="flex items-center gap-2 text-xs font-bold text-accent-blue hover:underline"
                >
                  Sitemap ansehen
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
