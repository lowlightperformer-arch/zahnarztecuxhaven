'use client'

import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { CATEGORY_TYPE_LABELS, type Category, type CategoryType, type CmsClinic } from '@/lib/cms'

type ClinicFormState = {
  name: string
  description: string
  phone: string
  email: string
  rating: string
  reviewsCount: string
  imageUrl: string
  googleMapsUrl: string
  leadDoctor: string
  categoryIds: string[]
}

type BulkImportClinicPayload = {
  clinicName: string
  description: string
  phone: string
  email: string
  rating: number
  reviewsCount: number
  image: string
  categorySlugs: string[]
  googleMapsUrl?: string
}

const emptyClinicForm: ClinicFormState = {
  name: '',
  description: '',
  phone: '',
  email: '',
  rating: '5.0',
  reviewsCount: '0',
  imageUrl: '',
  googleMapsUrl: '',
  leadDoctor: '',
  categoryIds: [],
}

interface ClinicManagerProps {
  categories: Category[]
  clinics: CmsClinic[]
  refreshData: () => Promise<void>
  setError: (msg: string) => void
  setSuccess: (msg: string) => void
  fetchJson: <T>(input: RequestInfo | URL, init?: RequestInit) => Promise<T>
}

export function ClinicManager({
  categories,
  clinics,
  refreshData,
  setError,
  setSuccess,
  fetchJson
}: ClinicManagerProps) {
  const [clinicForm, setClinicForm] = useState<ClinicFormState>(emptyClinicForm)
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null)
  const [isClinicImportModalOpen, setIsClinicImportModalOpen] = useState(false)
  const [bulkClinicImportText, setBulkClinicImportText] = useState('')
  const [isImportingClinics, setIsImportingClinics] = useState(false)

  const groupedCategories = useMemo(() => {
    return {
      district: categories.filter((category) => category.type === 'district'),
      general: categories.filter((category) => category.type === 'general'),
      service: categories.filter((category) => category.type === 'service'),
    }
  }, [categories])

  const selectedCategoryNames = useMemo(
    () => categories.filter((category) => clinicForm.categoryIds.includes(category.id)).map((category) => category.name),
    [categories, clinicForm.categoryIds],
  )

  function resetClinicForm() {
    setClinicForm(emptyClinicForm)
    setEditingClinicId(null)
  }

  function editClinic(clinic: CmsClinic) {
    setEditingClinicId(clinic.id)
    setClinicForm({
      name: clinic.name,
      description: clinic.description ?? '',
      phone: clinic.phone ?? '',
      email: clinic.email ?? '',
      rating: (clinic.rating ?? 0).toFixed(1),
      reviewsCount: String(clinic.reviewsCount ?? 0),
      imageUrl: clinic.imageUrl ?? '',
      googleMapsUrl: clinic.googleMapsUrl ?? '',
      leadDoctor: clinic.leadDoctor ?? '',
      categoryIds: clinic.categoryIds ?? [],
    })
  }

  async function deleteClinic(id: string) {
    setError('')
    setSuccess('')
    try {
      await fetchJson(`/api/admin/clinics/${id}`, { method: 'DELETE' })
      await refreshData()
      if (editingClinicId === id) {
        resetClinicForm()
      }
      setSuccess('Klinik gelöscht.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Klinik konnte nicht gelöscht werden.')
    }
  }

  function toggleClinicCategory(categoryId: string) {
    setClinicForm((current) => {
      const hasCategory = current.categoryIds.includes(categoryId)
      return {
        ...current,
        categoryIds: hasCategory
          ? current.categoryIds.filter((id) => id !== categoryId)
          : [...current.categoryIds, categoryId],
      }
    })
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setClinicForm((current) => ({ ...current, imageUrl: reader.result as string }))
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleClinicSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    const payload = {
      name: clinicForm.name.trim(),
      description: clinicForm.description.trim(),
      phone: clinicForm.phone.trim(),
      email: clinicForm.email.trim(),
      rating: Number(clinicForm.rating),
      reviewsCount: Number(clinicForm.reviewsCount),
      imageUrl: clinicForm.imageUrl,
      googleMapsUrl: clinicForm.googleMapsUrl.trim(),
      leadDoctor: clinicForm.leadDoctor.trim(),
      categoryIds: clinicForm.categoryIds,
    }

    try {
      if (editingClinicId) {
        await fetchJson(`/api/admin/clinics/${editingClinicId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        setSuccess('Klinik aktualisiert.')
      } else {
        await fetchJson('/api/admin/clinics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        setSuccess('Klinik erstellt.')
      }
      await refreshData()
      resetClinicForm()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Klinik konnte nicht gespeichert werden.')
    }
  }

  function validateBulkClinicImportPayload(input: string): BulkImportClinicPayload[] {
    let parsed: unknown
    try {
      parsed = JSON.parse(input)
    } catch {
      throw new Error('Ungültiges JSON. Bitte prüfe die Syntax und versuche es erneut.')
    }
    if (!Array.isArray(parsed)) {
      throw new Error('Ungültiges Format. Bitte ein JSON-Array mit Kliniken einfügen.')
    }
    return parsed.map((entry) => {
      if (!entry || typeof entry !== 'object') {
        throw new Error('Eintrag ist kein gültiges Objekt.')
      }
      const record = entry as Record<string, unknown>
      const clinicName = record.clinicName
      if (!clinicName || typeof clinicName !== 'string' || !String(clinicName).trim()) {
        throw new Error('Feld "clinicName" ist erforderlich.')
      }
      return {
        clinicName: String(clinicName).trim(),
        description: record.description ? String(record.description).trim() : '',
        phone: record.phone ? String(record.phone).trim() : '',
        email: record.email ? String(record.email).trim() : '',
        rating: typeof record.rating === 'number' ? record.rating : 0,
        reviewsCount: typeof record.reviewsCount === 'number' ? record.reviewsCount : 0,
        image: record.image ? String(record.image).trim() : '',
        categorySlugs: Array.isArray(record.categorySlugs) ? (record.categorySlugs as string[]) : [],
      }
    })
  }

  async function handleBulkClinicImport() {
    setError('')
    setSuccess('')
    const input = bulkClinicImportText.trim()
    if (!input) {
      setError('Bitte füge zuerst JSON-Daten in das Import-Feld ein.')
      return
    }
    let validatedClinics: BulkImportClinicPayload[]
    try {
      validatedClinics = validateBulkClinicImportPayload(input)
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : 'Import konnte nicht validiert werden.')
      return
    }
    setIsImportingClinics(true)
    try {
      const result = await fetchJson<{ addedCount: number; warningCount: number }>(
        '/api/admin/clinics/bulk',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clinics: validatedClinics }),
        }
      )
      await refreshData()
      setBulkClinicImportText('')
      setIsClinicImportModalOpen(false)
      let successMsg = `${result.addedCount} Kliniken erfolgreich hinzugefügt.`
      if (result.warningCount > 0) {
        successMsg += ` (${result.warningCount} unbekannte Kategorien wurden ignoriert)`
      }
      setSuccess(successMsg)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Klinik-Import fehlgeschlagen.");
    } finally {
      setIsImportingClinics(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-primary-blue/10 bg-white p-6 shadow-[0_12px_32px_rgba(18,58,99,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-primary-blue">Clinic Management</h2>
          <button
            type="button"
            onClick={() => setIsClinicImportModalOpen(true)}
            className="rounded-xl border border-primary-blue/20 bg-white px-3.5 py-2 text-sm font-semibold text-primary-blue transition hover:bg-light-bg"
          >
            Mass-Import
          </button>
        </div>

        <form onSubmit={handleClinicSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Name</span>
            <input
              value={clinicForm.name}
              onChange={(event) => setClinicForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
              required
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Description</span>
            <textarea
              value={clinicForm.description}
              onChange={(event) => setClinicForm((current) => ({ ...current, description: event.target.value }))}
              className="h-28 w-full resize-none rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Phone</span>
            <input
              value={clinicForm.phone}
              onChange={(event) => setClinicForm((current) => ({ ...current, phone: event.target.value }))}
              className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Email</span>
            <input
              type="email"
              value={clinicForm.email}
              onChange={(event) => setClinicForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Google Rating (0.0 - 5.0)</span>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={clinicForm.rating}
              onChange={(event) => setClinicForm((current) => ({ ...current, rating: event.target.value }))}
              className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Reviews Count</span>
            <input
              type="number"
              min={0}
              step={1}
              value={clinicForm.reviewsCount}
              onChange={(event) => setClinicForm((current) => ({ ...current, reviewsCount: event.target.value }))}
              className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
              required
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Google Maps URL</span>
            <input
              type="url"
              value={clinicForm.googleMapsUrl}
              onChange={(event) => setClinicForm((current) => ({ ...current, googleMapsUrl: event.target.value }))}
              placeholder="https://goo.gl/maps/..."
              className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Leitender Arzt <span className="font-normal text-slate-400">(optional)</span></span>
            <input
              type="text"
              value={clinicForm.leadDoctor}
              onChange={(event) => setClinicForm((current) => ({ ...current, leadDoctor: event.target.value }))}
              placeholder="z. B. Dr. med. Max Mustermann"
              className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Clinic Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full rounded-xl border border-dashed border-primary-blue/25 bg-light-bg/60 px-3.5 py-3 text-sm text-slate-700"
            />

            <div className="mt-3 flex items-center gap-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-primary-blue/10 bg-light-bg">
                {clinicForm.imageUrl ? (
                  <img src={clinicForm.imageUrl} alt="Vorschau Klinikbild" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">1:1 Vorschau</div>
                )}
              </div>
              <p className="text-xs text-slate-500">Bild wird als lokaler URL-Preview gespeichert.</p>
            </div>
          </label>

          <fieldset className="md:col-span-2">
            <legend className="mb-2 text-sm font-semibold text-primary-blue">Categories</legend>
            <div className="space-y-3">
              {(Object.keys(CATEGORY_TYPE_LABELS) as CategoryType[]).map((type) => (
                <div key={type}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {CATEGORY_TYPE_LABELS[type]}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {groupedCategories[type].map((category) => (
                      <label
                        key={category.id}
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-primary-blue/10 bg-light-bg/70 px-3 py-2"
                      >
                        <input
                          type="checkbox"
                          checked={clinicForm.categoryIds.includes(category.id)}
                          onChange={() => toggleClinicCategory(category.id)}
                          className="h-4 w-4 accent-accent-blue"
                        />
                        <span className="text-sm text-primary-blue">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedCategoryNames.length > 0 ? (
              <p className="mt-2 text-xs text-slate-500">Ausgewählt: {selectedCategoryNames.join(', ')}</p>
            ) : null}
          </fieldset>

          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-xl bg-primary-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-blue/90"
            >
              {editingClinicId ? 'Klinik speichern' : 'Klinik hinzufügen'}
            </button>
            {editingClinicId ? (
              <button
                type="button"
                onClick={resetClinicForm}
                className="rounded-xl border border-primary-blue/20 px-4 py-2.5 text-sm font-semibold text-primary-blue"
              >
                Abbrechen
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-primary-blue/10 bg-white p-6 shadow-[0_12px_32px_rgba(18,58,99,0.06)]">
        <h2 className="mb-4 text-xl font-bold text-primary-blue">Klinikliste</h2>
        <div className="space-y-4">
          {clinics.map((clinic) => (
            <article key={clinic.id} className="rounded-2xl border border-primary-blue/10 bg-light-bg/40 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-primary-blue">{clinic.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{clinic.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => editClinic(clinic)}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary-blue/15 bg-white px-3 py-1.5 text-xs font-semibold text-primary-blue"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteClinic(clinic.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              {(clinic.categoryIds ?? []).length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(clinic.categoryIds ?? []).map((categoryId) => {
                    const category = categories.find((entry) => entry.id === categoryId)
                    if (!category) return null

                    return (
                      <span
                        key={category.id}
                        className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-primary-blue ring-1 ring-primary-blue/10"
                      >
                        {category.name}
                      </span>
                    )
                  })}
                </div>
              ) : null}
            </article>
          ))}
          {clinics.length === 0 ? (
            <p className="rounded-xl border border-dashed border-primary-blue/20 bg-light-bg/50 px-4 py-6 text-sm text-slate-500">
              Noch keine Kliniken vorhanden.
            </p>
          ) : null}
        </div>
      </section>

      {isClinicImportModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-primary-blue/10 bg-white p-6 shadow-[0_24px_60px_rgba(18,58,99,0.2)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-primary-blue">Mass-Import Kliniken</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Füge ein JSON-Array ein. Pflichtfelder: clinicName, description, phone, email, rating, reviewsCount, image, categorySlugs. Optional: googleMapsUrl.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsClinicImportModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-light-bg"
                aria-label="Import-Modal schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <textarea
              value={bulkClinicImportText}
              onChange={(event) => setBulkClinicImportText(event.target.value)}
              placeholder='[{"clinicName":"...","description":"...","phone":"...","email":"...","rating":4.8,"reviewsCount":120,"image":"/uploads/...","googleMapsUrl":"https://goo.gl/maps/...","categorySlugs":["notdienst","lechhausen"]}]'
              className="mt-5 h-72 w-full rounded-2xl border border-primary-blue/15 bg-light-bg/20 px-4 py-3 text-sm text-slate-800 outline-none ring-accent-blue/20 transition focus:ring-4"
            />

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsClinicImportModalOpen(false)}
                className="rounded-xl border border-primary-blue/20 px-4 py-2.5 text-sm font-semibold text-primary-blue"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleBulkClinicImport}
                disabled={isImportingClinics}
                className="rounded-xl bg-primary-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isImportingClinics ? 'Import läuft...' : 'Importieren'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
