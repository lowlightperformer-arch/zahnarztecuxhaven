'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Save, Home, HelpCircle, LayoutText } from 'lucide-react'
import TiptapEditor from './TiptapEditor'
import type { HomepageConfig, FaqItem } from '@/lib/cms'

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { ...init, cache: 'no-store' })
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string }
    throw new Error(body.message ?? 'Anfrage fehlgeschlagen.')
  }
  return (await response.json()) as T
}

export default function AdminHomepageCms() {
  const [activeTab, setActiveTab] = useState<'seo' | 'faq'>('seo')
  const [config, setConfig] = useState<HomepageConfig>({ bottomSeoText: '', faq: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const isFetching = useRef(false)

  useEffect(() => {
    async function loadConfig() {
      if (isFetching.current) return
      isFetching.current = true
      
      try {
        const data = await fetchJson<HomepageConfig>('/api/admin/homepage')
        // Only update if we have data to avoid unnecessary re-renders
        if (data) {
          setConfig(data)
        }
      } catch (err) {
        console.error('Failed to load homepage config:', err)
        setError(err instanceof Error ? err.message : 'Fehler beim Laden.')
      } finally {
        setIsLoading(false)
        isFetching.current = false
      }
    }
    loadConfig()
  }, [])

  async function handleSave() {
    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      await fetchJson('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      setSuccess('Einstellungen erfolgreich gespeichert.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.')
    } finally {
      setIsSaving(false)
    }
  }

  function addFaq() {
    setConfig(prev => ({
      ...prev,
      faq: [...prev.faq, { question: '', answer: '' }]
    }))
  }

  function updateFaq(index: number, field: keyof FaqItem, value: string) {
    setConfig(prev => {
      const newFaq = [...prev.faq]
      newFaq[index] = { ...newFaq[index], [field]: value }
      return { ...prev, faq: newFaq }
    })
  }

  function deleteFaq(index: number) {
    setConfig(prev => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index)
    }))
  }

  if (isLoading) {
    return <div className="py-12 text-sm text-slate-600">Laden...</div>
  }

  return (
    <section className="py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-blue flex items-center gap-2">
            <Home className="h-6 w-6 text-accent-blue" />
            Homepage Settings
          </h2>
          <p className="text-sm text-slate-600">Verwalte SEO-Texte und FAQ für die Startseite.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-blue px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-blue/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Speichern...' : 'Update Homepage'}
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{success}</div>}

      <div className="flex gap-4 border-b border-primary-blue/10 mb-8">
        <button
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
            activeTab === 'seo' ? 'border-b-2 border-accent-blue text-accent-blue' : 'text-slate-500 hover:text-primary-blue'
          }`}
        >
          <LayoutText className="h-4 w-4" />
          SEO Text
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
            activeTab === 'faq' ? 'border-b-2 border-accent-blue text-accent-blue' : 'text-slate-500 hover:text-primary-blue'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          FAQ Manager
        </button>
      </div>

      {activeTab === 'seo' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary-blue/10 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-primary-blue mb-4">Bottom SEO Text</h3>
            <TiptapEditor
              value={config?.bottomSeoText || ""}
              onChange={(val) => setConfig(prev => ({ ...prev, bottomSeoText: val }))}
            />
          </div>
        </div>
      )}

      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-primary-blue italic">FAQ Einträge</h3>
            <button
              onClick={addFaq}
              className="inline-flex items-center gap-2 rounded-xl border border-primary-blue/15 px-4 py-2 text-sm font-semibold text-primary-blue hover:bg-light-bg"
            >
              <Plus className="h-4 w-4" />
              Eintrag hinzufügen
            </button>
          </div>

          <div className="space-y-4">
            {(config?.faq || []).map((item, index) => (
              <div key={index} className="rounded-2xl border border-primary-blue/10 bg-white p-6 shadow-sm relative group">
                <button
                  onClick={() => deleteFaq(index)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Frage</span>
                    <input
                      value={item.question}
                      onChange={(e) => updateFaq(index, 'question', e.target.value)}
                      className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                      placeholder="z.B. Wie finde ich einen Zahnarzt?"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Antwort</span>
                    <textarea
                      value={item.answer}
                      onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                      className="h-24 w-full resize-none rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                      placeholder="Antwort hier eingeben..."
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
