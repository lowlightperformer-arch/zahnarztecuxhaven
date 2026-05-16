'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Save, HelpCircle, FileText, Search, Layout } from 'lucide-react'
import TiptapEditor from './TiptapEditor'

interface FaqItem {
  question: string
  answer: string
}

interface HomepageConfig {
  h1: string
  metaTitle: string
  metaDescription: string
  bottomSeoText: string
  faq: FaqItem[]
}

export default function Homapagemanager() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>({
    h1: '',
    metaTitle: '',
    metaDescription: '',
    bottomSeoText: '',
    faq: [],
  })

  useEffect(() => {
    async function fetchHomepageData() {
      try {
        const response = await fetch('/api/admin/homepage', { cache: 'no-store' })
        if (!response.ok) throw new Error('Fehler beim Laden der Homepage-Daten.')
        const data = await response.json()
        
        // Handle both nested and direct data structures
        const content = data.homepage || data
        
        setHomepageConfig({
          h1: content.h1 || '',
          metaTitle: content.metaTitle || '',
          metaDescription: content.metaDescription || '',
          bottomSeoText: content.bottomSeoText || '',
          faq: content.faq || [],
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Laden fehlgeschlagen.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchHomepageData()
  }, [])

  async function handleUpdateHomepage() {
    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      const response = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homepageConfig),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Speichern fehlgeschlagen.')
      }

      setSuccess('Homepage-Einstellungen erfolgreich gespeichert.')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.')
    } finally {
      setIsSaving(false)
    }
  }

  const addFaqItem = () => {
    setHomepageConfig((prev) => ({
      ...prev,
      faq: [...prev.faq, { question: '', answer: '' }],
    }))
  }

  const removeFaqItem = (index: number) => {
    setHomepageConfig((prev) => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index),
    }))
  }

  const updateFaqItem = (index: number, field: keyof FaqItem, value: string) => {
    setHomepageConfig((prev) => ({
      ...prev,
      faq: prev.faq.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  if (isLoading) {
    return <div className="py-8 text-slate-500 italic">Homepage-Daten werden geladen...</div>
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-primary-blue">Homepage Content</h2>
        <button
          onClick={handleUpdateHomepage}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-blue px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-blue/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Speichert...' : 'Änderungen speichern'}
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

      {/* Hero & SEO Section */}
      <section className="rounded-3xl border border-primary-blue/10 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="rounded-lg bg-blue-50 p-2 text-primary-blue">
            <Layout className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary-blue">Hero & SEO</h3>
            <p className="text-sm text-slate-500">Kritische Elemente für Google und die erste Ansicht.</p>
          </div>
        </div>

        <div className="space-y-6">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Homepage H1 Tag</span>
            <input
              type="text"
              value={homepageConfig.h1}
              onChange={(e) => setHomepageConfig(prev => ({ ...prev, h1: e.target.value }))}
              placeholder="Zahnärzte in Cuxhaven: Top-Praxen im Vergleich"
              className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
            />
          </label>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-semibold text-primary-blue">SEO Meta Title</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${homepageConfig.metaTitle.length > 60 ? 'text-red-500' : 'text-slate-400'}`}>
                  {homepageConfig.metaTitle.length} / 60
                </span>
              </div>
              <input
                type="text"
                value={homepageConfig.metaTitle}
                onChange={(e) => setHomepageConfig(prev => ({ ...prev, metaTitle: e.target.value }))}
                placeholder="Zahnärzte Cuxhaven | Die besten Praxen & Ratgeber"
                className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
              />
            </label>

            <label className="block">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-semibold text-primary-blue">SEO Meta Description</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${homepageConfig.metaDescription.length > 160 ? 'text-red-500' : 'text-slate-400'}`}>
                  {homepageConfig.metaDescription.length} / 160
                </span>
              </div>
              <textarea
                value={homepageConfig.metaDescription}
                onChange={(e) => setHomepageConfig(prev => ({ ...prev, metaDescription: e.target.value }))}
                placeholder="Finden Sie den besten Zahnarzt in Cuxhaven. Unabhängiger Vergleich von Praxen in Duhnen, Döse und Sahlenburg. Jetzt online informieren!"
                rows={2}
                className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
              />
            </label>
          </div>
        </div>
      </section>

      {/* SEO Text Section */}
      <section className="rounded-3xl border border-primary-blue/10 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="rounded-lg bg-blue-50 p-2 text-primary-blue">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary-blue">Bottom SEO Text</h3>
            <p className="text-sm text-slate-500">Dieser Text wird am Ende der Startseite angezeigt.</p>
          </div>
        </div>
        
        <div className="prose-slate max-w-none">
          <TiptapEditor 
            value={homepageConfig.bottomSeoText} 
            onChange={(content) => setHomepageConfig(prev => ({ ...prev, bottomSeoText: content }))}
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="rounded-3xl border border-primary-blue/10 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-primary-blue">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary-blue">FAQ Liste</h3>
              <p className="text-sm text-slate-500">Fragen und Antworten für den FAQ-Bereich verwalten.</p>
            </div>
          </div>
          <button
            onClick={addFaqItem}
            className="inline-flex items-center gap-2 rounded-xl border border-primary-blue/15 bg-white px-4 py-2 text-sm font-semibold text-primary-blue transition hover:bg-light-bg"
          >
            <Plus className="h-4 w-4" />
            Frage hinzufügen
          </button>
        </div>

        <div className="space-y-6">
          {homepageConfig.faq.length === 0 ? (
            <div className="py-8 text-center text-slate-400 italic">Noch keine FAQ-Einträge vorhanden.</div>
          ) : (
            homepageConfig.faq.map((item, index) => (
              <div key={index} className="group relative rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                <button
                  onClick={() => removeFaqItem(index)}
                  className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  title="Eintrag löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                
                <div className="grid gap-4 pr-10">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Frage</label>
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                      placeholder="z.B. Wie vereinbare ich einen Termin?"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-primary-blue outline-none transition focus:border-primary-blue/30 focus:ring-4 focus:ring-primary-blue/5"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Antwort</label>
                    <textarea
                      value={item.answer}
                      onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                      placeholder="Hier die Antwort formulieren..."
                      className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-primary-blue/30 focus:ring-4 focus:ring-primary-blue/5"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
