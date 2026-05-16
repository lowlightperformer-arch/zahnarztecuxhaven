'use client'

import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import { ChevronDown, LogOut, Mail, MapPin, Pencil, Phone, Plus, Star, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Category = {
  id: string
  name: string
  slug: string
}

type ClinicFormState = {
  name: string
  description: string
  phone: string
  email: string
  rating: string
  reviewsCount: string
  imageUrl: string
  categoryIds: string[]
}

type ClinicEntry = {
  id: string
  name: string
  description: string
  phone: string
  email: string
  rating: number
  reviewsCount: number
  imageUrl: string
  categories: Category[]
}

const initialCategories: Category[] = [
  { id: 'cat-notdienst', name: 'Notdienst', slug: 'notdienst' },
  { id: 'cat-lechhausen', name: 'Lechhausen', slug: 'lechhausen' },
]

const emptyClinicForm: ClinicFormState = {
  name: '',
  description: '',
  phone: '',
  email: '',
  rating: '5.0',
  reviewsCount: '0',
  imageUrl: '',
  categoryIds: [],
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

export default function AdminDashboardClient() {
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [categoryName, setCategoryName] = useState('')
  const [categorySlug, setCategorySlug] = useState('')
  const [clinics, setClinics] = useState<ClinicEntry[]>([])
  const [form, setForm] = useState<ClinicFormState>(emptyClinicForm)
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null)
  const [formError, setFormError] = useState('')

  const selectedCategoryNames = useMemo(() => {
    return categories.filter((category) => form.categoryIds.includes(category.id)).map((category) => category.name)
  }, [categories, form.categoryIds])

  function updateField<K extends keyof ClinicFormState>(field: K, value: ClinicFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleCategoryCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedName = categoryName.trim()
    const normalizedSlug = createSlug(categorySlug || categoryName)

    if (!normalizedName || !normalizedSlug) return

    if (categories.some((category) => category.slug === normalizedSlug)) return

    const nextCategory: Category = {
      id: `cat-${crypto.randomUUID()}`,
      name: normalizedName,
      slug: normalizedSlug,
    }

    setCategories((current) => [...current, nextCategory])
    setCategoryName('')
    setCategorySlug('')
  }

  function handleCategoryDelete(categoryId: string) {
    setCategories((current) => current.filter((category) => category.id !== categoryId))
    setForm((current) => ({
      ...current,
      categoryIds: current.categoryIds.filter((id) => id !== categoryId),
    }))
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const localUrl = URL.createObjectURL(file)
    updateField('imageUrl', localUrl)
  }

  function toggleCategorySelection(categoryId: string) {
    setForm((current) => {
      const hasCategory = current.categoryIds.includes(categoryId)
      const nextCategoryIds = hasCategory
        ? current.categoryIds.filter((id) => id !== categoryId)
        : [...current.categoryIds, categoryId]

      return {
        ...current,
        categoryIds: nextCategoryIds,
      }
    })
  }

  function resetClinicForm() {
    setForm(emptyClinicForm)
    setEditingClinicId(null)
    setFormError('')
  }

  function handleClinicSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    if (!form.name.trim() || !form.description.trim() || !form.phone.trim() || !form.email.trim()) {
      setFormError('Bitte alle Pflichtfelder ausfüllen.')
      return
    }

    if (!form.imageUrl) {
      setFormError('Bitte ein Klinikbild hochladen.')
      return
    }

    const rating = Number(form.rating)
    const reviewsCount = Number(form.reviewsCount)

    if (Number.isNaN(rating) || rating < 0 || rating > 5) {
      setFormError('Google Rating muss zwischen 0.0 und 5.0 liegen.')
      return
    }

    if (!Number.isInteger(reviewsCount) || reviewsCount < 0) {
      setFormError('Reviews Count muss eine positive Ganzzahl sein.')
      return
    }

    const selectedCategories = categories.filter((category) => form.categoryIds.includes(category.id))

    const payload: ClinicEntry = {
      id: editingClinicId ?? `clinic-${crypto.randomUUID()}`,
      name: form.name.trim(),
      description: form.description.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      rating,
      reviewsCount,
      imageUrl: form.imageUrl,
      categories: selectedCategories,
    }

    setClinics((current) => {
      if (!editingClinicId) {
        return [payload, ...current]
      }

      return current.map((clinic) => (clinic.id === editingClinicId ? payload : clinic))
    })

    resetClinicForm()
  }

  function handleClinicDelete(clinicId: string) {
    setClinics((current) => current.filter((clinic) => clinic.id !== clinicId))
    if (editingClinicId === clinicId) {
      resetClinicForm()
    }
  }

  function handleClinicEdit(clinicId: string) {
    const clinic = clinics.find((entry) => entry.id === clinicId)
    if (!clinic) return

    setEditingClinicId(clinic.id)
    setForm({
      name: clinic.name,
      description: clinic.description,
      phone: clinic.phone,
      email: clinic.email,
      rating: clinic.rating.toFixed(1),
      reviewsCount: String(clinic.reviewsCount),
      imageUrl: clinic.imageUrl,
      categoryIds: clinic.categories.map((category) => category.id),
    })
    setFormError('')
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
    router.refresh()
  }

  return (
    <section className="py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-accent-blue">Admin CMS</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary-blue">Zahnärzte Cuxhaven Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Kategorien verwalten, Kliniken erfassen und Inhalte für das Verzeichnis vorbereiten.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-primary-blue/15 bg-white px-4 py-2.5 text-sm font-semibold text-primary-blue transition-colors hover:bg-light-bg"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-primary-blue/10 bg-white p-6 shadow-[0_12px_32px_rgba(18,58,99,0.06)]">
          <h2 className="text-xl font-bold text-primary-blue">Category Manager</h2>
          <p className="mt-1 text-sm text-slate-600">Erstellen und löschen Sie Kategorien für die Klinikzuordnung.</p>

          <form onSubmit={handleCategoryCreate} className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Name</span>
              <input
                value={categoryName}
                onChange={(event) => {
                  setCategoryName(event.target.value)
                  if (!categorySlug) {
                    setCategorySlug(createSlug(event.target.value))
                  }
                }}
                className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                placeholder="z. B. Notdienst"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Slug</span>
              <input
                value={categorySlug}
                onChange={(event) => setCategorySlug(createSlug(event.target.value))}
                className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                placeholder="notdienst"
                required
              />
            </label>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-blue/90"
            >
              <Plus className="h-4 w-4" />
              Kategorie erstellen
            </button>
          </form>

          <div className="mt-6 space-y-2.5">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-xl border border-primary-blue/10 bg-light-bg/70 px-3.5 py-2.5"
              >
                <div>
                  <p className="text-sm font-semibold text-primary-blue">{category.name}</p>
                  <p className="text-xs text-slate-500">/{category.slug}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCategoryDelete(category.id)}
                  className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                  aria-label={`Kategorie ${category.name} löschen`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-8">
          <section className="rounded-3xl border border-primary-blue/10 bg-white p-6 shadow-[0_12px_32px_rgba(18,58,99,0.06)]">
            <h2 className="text-xl font-bold text-primary-blue">Clinic Management</h2>
            <p className="mt-1 text-sm text-slate-600">8-Felder-Formular zur Erfassung und Pflege von Kliniken.</p>

            <form onSubmit={handleClinicSave} className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Name</span>
                <input
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                  placeholder="Zahnarztpraxis Dr. Markus Weber"
                  required
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  className="h-28 w-full resize-none rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                  placeholder="Kurzer deutscher Text über Philosophie und Ausstattung"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Phone</span>
                <input
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                  placeholder="0821 123456"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                  placeholder="info@praxis.de"
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
                  value={form.rating}
                  onChange={(event) => updateField('rating', event.target.value)}
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
                  value={form.reviewsCount}
                  onChange={(event) => updateField('reviewsCount', event.target.value)}
                  className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                  required
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Clinic Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full rounded-xl border border-dashed border-primary-blue/25 bg-light-bg/60 px-3.5 py-3 text-sm text-slate-700"
                  required={!editingClinicId}
                />

                <div className="mt-3 flex items-center gap-4">
                  <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-primary-blue/10 bg-light-bg">
                    {form.imageUrl ? (
                      <img src={form.imageUrl} alt="Vorschau Klinikbild" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">1:1 Vorschau</div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">Bild wird als lokaler URL-Preview gespeichert.</p>
                </div>
              </label>

              <fieldset className="md:col-span-2">
                <legend className="mb-2 text-sm font-semibold text-primary-blue">Categories</legend>

                <div className="grid gap-2 sm:grid-cols-2">
                  {categories.map((category) => {
                    const checked = form.categoryIds.includes(category.id)

                    return (
                      <label
                        key={category.id}
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-primary-blue/10 bg-light-bg/70 px-3 py-2"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCategorySelection(category.id)}
                          className="h-4 w-4 accent-accent-blue"
                        />
                        <span className="text-sm text-primary-blue">{category.name}</span>
                      </label>
                    )
                  })}
                </div>

                {selectedCategoryNames.length > 0 ? (
                  <p className="mt-2 text-xs text-slate-500">Ausgewählt: {selectedCategoryNames.join(', ')}</p>
                ) : null}
              </fieldset>

              {formError ? <p className="md:col-span-2 text-sm font-medium text-red-600">{formError}</p> : null}

              <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-xl bg-primary-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-blue/90"
                >
                  {editingClinicId ? 'Klinik speichern' : 'Klinik hinzufügen'}
                </button>

                {editingClinicId ? (
                  <button
                    type="button"
                    onClick={resetClinicForm}
                    className="inline-flex items-center rounded-xl border border-primary-blue/20 bg-white px-4 py-2.5 text-sm font-semibold text-primary-blue transition hover:bg-light-bg"
                  >
                    Bearbeitung abbrechen
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-primary-blue/10 bg-white p-6 shadow-[0_12px_32px_rgba(18,58,99,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-primary-blue">Klinikliste</h2>
              <span className="rounded-full bg-accent-blue/10 px-3 py-1 text-xs font-semibold text-accent-blue">
                {clinics.length} Einträge
              </span>
            </div>

            {clinics.length === 0 ? (
              <p className="rounded-xl border border-dashed border-primary-blue/20 bg-light-bg/50 px-4 py-6 text-sm text-slate-500">
                Noch keine Kliniken vorhanden. Erstellen Sie den ersten Eintrag über das Formular.
              </p>
            ) : (
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
                          onClick={() => handleClinicEdit(clinic.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-primary-blue/15 bg-white px-3 py-1.5 text-xs font-semibold text-primary-blue transition hover:bg-light-bg"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleClinicDelete(clinic.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-accent-blue" />
                        {clinic.phone}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-accent-blue" />
                        {clinic.email}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-amber-400" />
                        {clinic.rating.toFixed(1)} ({clinic.reviewsCount})
                      </span>
                    </div>

                    {clinic.categories.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {clinic.categories.map((category) => (
                          <span
                            key={category.id}
                            className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-primary-blue ring-1 ring-primary-blue/10"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-primary-blue/15 bg-white px-5 py-2.5 text-sm font-semibold text-primary-blue"
        >
          Mehr Aktionen
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </section>
  )
}
