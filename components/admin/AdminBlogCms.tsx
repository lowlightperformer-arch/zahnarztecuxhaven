'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, LogOut, Pencil, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { contentToHtml, createSlug, stripHtml } from '@/lib/blog'
import type { BlogPost, PostStatus } from '@/lib/cms'
import TiptapEditor from '@/components/admin/TiptapEditor'

type PostFormState = {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  image: string
  status: PostStatus
  metaTitle: string
  metaDescription: string
}

const emptyPostForm: PostFormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  image: '',
  status: 'draft',
  metaTitle: '',
  metaDescription: '',
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function AdminBlogCms() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [postForm, setPostForm] = useState<PostFormState>(emptyPostForm)
  const [isSlugEditedManually, setIsSlugEditedManually] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const editingId = postForm.id

  useEffect(() => {
    async function bootstrap() {
      try {
        const result = await fetchJson<{ posts: BlogPost[] }>('/api/admin/posts')
        setPosts(result.posts)
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Posts konnten nicht geladen werden.')
      } finally {
        setIsLoading(false)
      }
    }

    void bootstrap()
  }, [])

  async function refreshPosts() {
    const result = await fetchJson<{ posts: BlogPost[] }>('/api/admin/posts')
    setPosts(result.posts)
  }

  function resetForm() {
    setPostForm(emptyPostForm)
    setIsSlugEditedManually(false)
  }

  function editPost(post: BlogPost) {
    setPostForm({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image,
      status: post.status,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
    })

    setIsSlugEditedManually(true)
    setError('')
    setSuccess('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSaving(true)

    const normalizedTitle = postForm.title.trim()
    const normalizedSlug = createSlug(postForm.slug || normalizedTitle)
    const normalizedExcerpt = postForm.excerpt.trim() || stripHtml(contentToHtml(postForm.content)).slice(0, 180)

    const payload = {
      id: postForm.id,
      title: normalizedTitle,
      slug: normalizedSlug,
      excerpt: normalizedExcerpt,
      content: postForm.content.trim(),
      image: postForm.image.trim(),
      status: postForm.status,
      metaTitle: postForm.metaTitle.trim() || normalizedTitle,
      metaDescription: postForm.metaDescription.trim() || normalizedExcerpt,
    }

    try {
      await fetchJson('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: editingId ? 'update' : 'create', post: payload }),
      })

      await refreshPosts()
      setSuccess(editingId ? 'Blogbeitrag aktualisiert.' : 'Blogbeitrag erstellt.')
      resetForm()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Post konnte nicht gespeichert werden.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setError('')
    setSuccess('')

    try {
      await fetchJson('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'delete', id }),
      })

      if (editingId === id) {
        resetForm()
      }

      await refreshPosts()
      setSuccess('Blogbeitrag gelöscht.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Post konnte nicht gelöscht werden.')
    }
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPostForm((current) => ({ ...current, image: reader.result as string }))
      }
    }

    reader.readAsDataURL(file)
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
    router.refresh()
  }

  if (isLoading) {
    return <section className="py-12 text-sm text-slate-600">Ratgeber CMS wird geladen...</section>
  }

  return (
    <section className="py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-accent-blue">Admin CMS</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary-blue">Ratgeber Management</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Artikel als Entwurf oder veröffentlicht verwalten, inklusive SEO-Metadaten.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-primary-blue/15 bg-white px-4 py-2.5 text-sm font-semibold text-primary-blue transition-colors hover:bg-light-bg"
          >
            <FileText className="h-4 w-4" />
            Dashboard
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

      {error ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p> : null}
      {success ? (
        <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{success}</p>
      ) : null}

      <div className="space-y-8">
        <section className="rounded-3xl border border-primary-blue/10 bg-white p-6 shadow-[0_12px_32px_rgba(18,58,99,0.06)]">
          <h2 className="text-xl font-bold text-primary-blue">{editingId ? 'Ratgeber-Artikel bearbeiten' : 'Neuer Ratgeber-Artikel'}</h2>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Titel</span>
              <input
                value={postForm.title}
                onChange={(event) => {
                  const title = event.target.value
                  setPostForm((current) => ({
                    ...current,
                    title,
                    slug: isSlugEditedManually ? current.slug : createSlug(title),
                  }))
                }}
                className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Slug</span>
              <input
                value={postForm.slug}
                onChange={(event) => {
                  setIsSlugEditedManually(true)
                  setPostForm((current) => ({ ...current, slug: createSlug(event.target.value) }))
                }}
                className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Status</span>
              <select
                value={postForm.status}
                onChange={(event) =>
                  setPostForm((current) => ({ ...current, status: event.target.value as PostStatus }))
                }
                className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Excerpt</span>
              <textarea
                value={postForm.excerpt}
                onChange={(event) => setPostForm((current) => ({ ...current, excerpt: event.target.value }))}
                className="h-20 w-full resize-none rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Content</span>
              <TiptapEditor
                value={postForm.content}
                onChange={(value) => setPostForm((current) => ({ ...current, content: value }))}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Bild (16:9)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full rounded-xl border border-dashed border-primary-blue/25 bg-light-bg/60 px-3.5 py-3 text-sm text-slate-700"
              />

              <div className="mt-3 overflow-hidden rounded-xl border border-primary-blue/10 bg-light-bg">
                <div className="relative aspect-video w-full">
                  {postForm.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={postForm.image} alt="Vorschau Blogbild" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">16:9 Vorschau</div>
                  )}
                </div>
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Meta Title</span>
              <input
                value={postForm.metaTitle}
                onChange={(event) => setPostForm((current) => ({ ...current, metaTitle: event.target.value }))}
                className="w-full rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-blue">Meta Description</span>
              <textarea
                value={postForm.metaDescription}
                onChange={(event) => setPostForm((current) => ({ ...current, metaDescription: event.target.value }))}
                className="h-20 w-full resize-none rounded-xl border border-primary-blue/15 px-3.5 py-2.5 text-sm outline-none ring-accent-blue/20 transition focus:ring-4"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                {isSaving ? 'Speichert...' : editingId ? 'Post speichern' : 'Post erstellen'}
              </button>

              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-primary-blue/20 px-4 py-2.5 text-sm font-semibold text-primary-blue"
                >
                  Abbrechen
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-primary-blue/10 bg-white p-5 shadow-[0_12px_32px_rgba(18,58,99,0.06)]">
          <h2 className="mb-3 text-lg font-bold text-primary-blue">Beitragsliste</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-primary-blue/10 text-[11px] uppercase tracking-[0.08em] text-slate-500">
                  <th className="px-2 py-1.5">Titel</th>
                  <th className="px-2 py-1.5">Status</th>
                  <th className="px-2 py-1.5">Erstellt</th>
                  <th className="px-2 py-1.5">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-primary-blue/5 align-top">
                    <td className="px-2 py-2">
                      <p className="font-semibold text-primary-blue">{post.title}</p>
                      <p className="text-[11px] text-slate-500">/{post.slug}</p>
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          post.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                            : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                        }`}
                      >
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-[11px] text-slate-500">{formatDate(post.createdAt)}</td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => editPost(post)}
                          className="rounded-lg p-1.5 text-primary-blue transition hover:bg-primary-blue/10"
                          aria-label={`Post ${post.title} bearbeiten`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(post.id)}
                          className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
                          aria-label={`Post ${post.title} löschen`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {posts.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-primary-blue/20 bg-light-bg/50 px-4 py-6 text-sm text-slate-500">
              Noch keine Blogposts vorhanden.
            </p>
          ) : null}
        </section>
      </div>
    </section>
  )
}
