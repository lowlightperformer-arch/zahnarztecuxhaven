'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { FileText, LogOut, Pencil, Plus, Trash2, X, Home, Settings, FileBox } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { CATEGORY_TYPE_LABELS, type Category, type CategoryType, type CmsClinic } from '@/lib/cms'
import { ClinicManager } from './ClinicManager'
import Homapagemanager from './Homapagemanager'
import SiteSettingsManager from './SiteSettingsManager'
import PagesManager from './PagesManager'

type CategoryFormState = {
  name: string
  slug: string
  type: CategoryType
  h1: string
  description: string
  metaTitle: string
  metaDescription: string
}

type BulkImportCategoryPayload = {
  name: string
  slug: string
  type: CategoryType
  h1: string
  description: string
  metaTitle: string
  metaDescription: string
}

const emptyCategoryForm: CategoryFormState = {
  name: '',
  slug: '',
  type: 'general',
  h1: '',
  description: '',
  metaTitle: '',
  metaDescription: '',
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    cache: 'no-store',
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string }
    throw new Error(body.message ?? 'Anfrage fehlgeschlagen.')
  }

  return (await response.json()) as T
}

export default function AdminDashboardCms() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [clinics, setClinics] = useState<CmsClinic[]>([])

  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [bulkImportText, setBulkImportText] = useState('')
  const [isImportingCategories, setIsImportingCategories] = useState(false)
  
  const [activeTab, setActiveTab] = useState<'content' | 'homepage' | 'pages' | 'settings'>('content')
  const isFetching = useRef(false)

  const groupedCategories = useMemo(() => {
    return {
      district: categories.filter((category) => category.type === 'district'),
      general: categories.filter((category) => category.type === 'general'),
      service: categories.filter((category) => category.type === 'service'),
    }
  }, [categories])

  useEffect(() => {
    async function bootstrap() {
      if (isFetching.current) return
      isFetching.current = true
      
      try {
        const [categoriesResult, clinicsResult] = await Promise.all([
          fetchJson<{ categories: Category[] }>('/api/admin/categories'),
          fetchJson<{ clinics: CmsClinic[] }>('/api/admin/clinics'),
        ])

        setCategories(categoriesResult.categories)
        setClinics(clinicsResult.clinics)
      } catch (requestError) {
        console.error('Bootstrap data fetch failed:', requestError)
        setError(requestError instanceof Error ? requestError.message : 'Laden fehlgeschlagen.')
      } finally {
        setIsLoading(false)
        isFetching.current = false
      }
    }

    void bootstrap()
  }, [])

  function resetCategoryForm() {
    setCategoryForm(emptyCategoryForm)
    setEditingCategoryId(null)
  }

  async function refreshData() {
    const [categoriesResult, clinicsResult] = await Promise.all([
      fetchJson<{ categories: Category[] }>('/api/admin/categories'),
      fetchJson<{ clinics: CmsClinic[] }>('/api/admin/clinics'),
    ])

    setCategories(categoriesResult.categories)
    setClinics(clinicsResult.clinics)
  }

  async function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const payload = {
      ...categoryForm,
      name: categoryForm.name.trim(),
      slug: createSlug(categoryForm.slug || categoryForm.name),
      h1: categoryForm.h1.trim() || categoryForm.name.trim(),
      metaTitle: categoryForm.metaTitle.trim() || categoryForm.name.trim(),
    }

    try {
      if (editingCategoryId) {
        await fetchJson(`/api/admin/categories/${editingCategoryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        setSuccess('Kategorie aktualisiert.')
      } else {
        await fetchJson('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        setSuccess('Kategorie erstellt.')
      }

      await refreshData()
      resetCategoryForm()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Kategorie konnte nicht gespeichert werden.')
    }
  }

  function editCategory(category: Category) {
    setEditingCategoryId(category.id)
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      type: category.type,
      h1: category.h1,
      description: category.description,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
    })
  }

  async function deleteCategory(categoryId: string) {
    setError('')
    setSuccess('')

    try {
      await fetchJson(`/api/admin/categories/${categoryId}`, { method: 'DELETE' })
      await refreshData()

      if (editingCategoryId === categoryId) {
        resetCategoryForm()
      }

      setSuccess('Kategorie gelöscht.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Kategorie konnte nicht gelöscht werden.')
    }
  }

  function validateBulkImportPayload(input: string): BulkImportCategoryPayload[] {
    let parsed: unknown
    try {
      parsed = JSON.parse(input)
    } catch {
      throw new Error('Ungültiges JSON. Bitte prüfe die Syntax und versuche es erneut.')
    }

    if (!Array.isArray(parsed)) {
      throw new Error('Ungültiges Format. Bitte ein JSON-Array mit Kategorien einfügen.')
    }

    const requiredFields = [
      'name',
      'slug',
      'type',
      'h1',
      'description',
      'metaTitle',
      'metaDescription',
    ]

    const allowedTypes: CategoryType[] = ['district', 'general', 'service']

    return parsed.map((entry, index) => {
      if (!entry || typeof entry !== 'object') {
        throw new Error(`Eintrag ${index + 1} ist kein gültiges Objekt.`)
      }

      const record = entry as Record<string, unknown>

      for (const field of requiredFields) {
        if (typeof record[field] !== 'string' || !record[field].trim()) {
          throw new Error(`Feld "${field}" fehlt oder ist leer (Eintrag ${index + 1}).`)
        }
      }

      const normalizedType = String(record.type).trim() as CategoryType
      if (!allowedTypes.includes(normalizedType)) {
        throw new Error(`Ungültiger type in Eintrag ${index + 1}. Erlaubt: district, general, service.`)
      }

      return {
        name: String(record.name).trim(),
        slug: createSlug(String(record.slug).trim()),
        type: normalizedType,
        h1: String(record.h1).trim(),
        description: String(record.description).trim(),
        metaTitle: String(record.metaTitle).trim(),
        metaDescription: String(record.metaDescription).trim(),
      }
    })
  }

  async function handleBulkImport() {
    setError('')
    setSuccess('')

    const input = bulkImportText.trim()
    if (!input) {
      setError('Bitte füge zuerst JSON-Daten in das Import-Feld ein.')
      return
    }

    let validatedCategories: BulkImportCategoryPayload[]
    try {
      validatedCategories = validateBulkImportPayload(input)
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : 'Import konnte nicht validiert werden.')
      return
    }

    setIsImportingCategories(true)

    try {
      const result = await fetchJson<{ addedCount: number }>('/api/admin/categories/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: validatedCategories }),
      });

      await refreshData();
      setBulkImportText('');
      setIsImportModalOpen(false);
      setSuccess(`${result.addedCount} Kategorien erfolgreich hinzugefügt.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Mass-Import fehlgeschlagen.');
    } finally {
      setIsImportingCategories(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
    router.refresh()
  }

  if (isLoading) {
    return <section className="py-12 text-sm text-slate-600">Dashboard wird geladen...</section>;
  }

  return (
    <div className="min-h-screen bg-light-bg px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary-blue">CMS Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Kategorien mit SEO-Metadaten verwalten und Kliniken kategorisiert veröffentlichen.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/ratgeber"
              className="inline-flex items-center gap-2 rounded-xl border border-primary-blue/15 bg-white px-4 py-2.5 text-sm font-semibold text-primary-blue transition-colors hover:bg-light-bg"
            >
              <FileText className="h-4 w-4" />
              Ratgeber
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-primary-blue/15 bg-white px-4 py-2.5 text-sm font-semibold text-primary-blue transition-colors hover:bg-light-bg"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="flex gap-4 border-b border-primary-blue/10 mb-8">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === 'content' ? 'border-b-2 border-accent-blue text-accent-blue' : 'text-slate-500 hover:text-primary-blue'
            }`}
          >
            <FileText className="h-4 w-4" />
            Categories & Clinics
          </button>
          <button
            onClick={() => setActiveTab('homepage')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === 'homepage' ? 'border-b-2 border-accent-blue text-accent-blue' : 'text-slate-500 hover:text-primary-blue'
            }`}
          >
            <Home className="h-4 w-4" />
            Homepage Settings
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === 'pages' ? 'border-b-2 border-accent-blue text-accent-blue' : 'text-slate-500 hover:text-primary-blue'
            }`}
          >
            <FileBox className="h-4 w-4" />
            Pages
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === 'settings' ? 'border-b-2 border-accent-blue text-accent-blue' : 'text-slate-500 hover:text-primary-blue'
            }`}
          >
            <Settings className="h-4 w-4" />
            Global Settings
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
            {success}
          </div>
        )}

        {activeTab === 'homepage' && <Homapagemanager />}
        {activeTab === 'pages' && <PagesManager />}
        {activeTab === 'settings' && <SiteSettingsManager />}
        
        {activeTab === 'content' && (
          <div className="grid gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">
            <aside className="rounded-3xl border border-primary-blue/10 bg-white p-6 shadow-[0_12px_32px_rgba(18,58,99,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-primary-blue">Category Manager</h2>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="rounded-xl border border-primary-blue/20 bg-white px-3.5 py-2 text-sm font-semibold text-primary-blue transition hover:bg-light-bg"
                >
                  Mass-Import
                </button>
              </div>

              <form onSubmit={handleCategorySubmit} className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Name</span>
                  <input
                    value={categoryForm.name}
                    onChange={(event) =>
                      setCategoryForm((current) => ({
                        ...current,
                        name: event.target.value,
                        slug: current.slug ? current.slug : createSlug(event.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Slug</span>
                  <input
                    value={categoryForm.slug}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, slug: createSlug(event.target.value) }))}
                    className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Type</span>
                  <select
                    value={categoryForm.type}
                    onChange={(event) =>
                      setCategoryForm((current) => ({ ...current, type: event.target.value as CategoryType }))
                    }
                    className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                  >
                    <option value="district">District</option>
                    <option value="general">General</option>
                    <option value="service">Service</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-primary-blue">H1</span>
                  <input
                    value={categoryForm.h1}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, h1: event.target.value }))}
                    className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Description</span>
                  <textarea
                    value={categoryForm.description}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))}
                    className="h-24 w-full resize-none rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Meta Title</span>
                  <input
                    value={categoryForm.metaTitle}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, metaTitle: event.target.value }))}
                    className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Meta Description</span>
                  <textarea
                    value={categoryForm.metaDescription}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, metaDescription: event.target.value }))}
                    className="h-20 w-full resize-none rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                  />
                </label>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-blue/90"
                  >
                    <Plus className="h-4 w-4" />
                    {editingCategoryId ? 'Kategorie speichern' : 'Kategorie erstellen'}
                  </button>
                  {editingCategoryId ? (
                    <button
                      type="button"
                      onClick={resetCategoryForm}
                      className="rounded-xl border border-primary-blue/20 px-4 py-2.5 text-sm font-semibold text-primary-blue"
                    >
                      Abbrechen
                    </button>
                  ) : null}
                </div>
              </form>

              <div className="mt-6 space-y-4">
                {(Object.keys(CATEGORY_TYPE_LABELS) as CategoryType[]).map((type) => (
                  <div key={type}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {CATEGORY_TYPE_LABELS[type]}
                    </h3>
                    <div className="space-y-2">
                      {groupedCategories[type].map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between rounded-xl border border-primary-blue/10 bg-light-bg/70 px-3.5 py-2.5"
                        >
                          <div>
                            <p className="text-sm font-semibold text-primary-blue">{category.name}</p>
                            <p className="text-xs text-slate-500">/{category.slug}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => editCategory(category)}
                              className="rounded-lg p-2 text-primary-blue transition hover:bg-primary-blue/10"
                              aria-label={`Kategorie ${category.name} bearbeiten`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteCategory(category.id)}
                              className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                              aria-label={`Kategorie ${category.name} löschen`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <ClinicManager 
              categories={categories}
              clinics={clinics}
              refreshData={refreshData}
              setError={setError}
              setSuccess={setSuccess}
              fetchJson={fetchJson}
            />
          </div>
        )}
      </div>

      {isImportModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-primary-blue/10 bg-white p-6 shadow-[0_24px_60px_rgba(18,58,99,0.2)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-primary-blue">Mass-Import Kategorien</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Füge ein JSON-Array ein. Pflichtfelder: name, slug, type, h1, description, metaTitle,
                  metaDescription.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-light-bg"
                aria-label="Import-Modal schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <textarea
              value={bulkImportText}
              onChange={(event) => setBulkImportText(event.target.value)}
              placeholder='[{"name":"...","slug":"...","type":"general","h1":"...","description":"...","metaTitle":"...","metaDescription":"..."}]'
              className="mt-5 h-72 w-full rounded-2xl border border-primary-blue/15 bg-light-bg/20 px-4 py-3 text-sm text-slate-800 outline-none ring-accent-blue/20 transition focus:ring-4"
            />

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="rounded-xl border border-primary-blue/20 px-4 py-2.5 text-sm font-semibold text-primary-blue"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                disabled={isImportingCategories}
                className="rounded-xl bg-primary-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isImportingCategories ? 'Import läuft...' : 'Importieren'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
