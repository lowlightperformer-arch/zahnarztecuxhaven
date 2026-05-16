import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Edit2, Save, X, ExternalLink, CheckCircle } from 'lucide-react'
import { StaticPage } from '@/lib/cms'
import TiptapEditor from './TiptapEditor'

export default function PagesManager() {
  const [pages, setPages] = useState<StaticPage[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState<Partial<StaticPage>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [success, setSuccess] = useState('')

  const fetchPages = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/pages')
      if (res.ok) {
        const data = await res.json()
        setPages(data)
      }
    } catch (error) {
      console.error('Failed to fetch pages', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  const showToast = (message: string) => {
    setSuccess(message)
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleEdit = (page: StaticPage) => {
    setCurrentPage(page)
    setIsEditing(true)
  }

  const handleCreate = () => {
    setCurrentPage({
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
    })
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Seite löschen möchten?')) return

    try {
      const res = await fetch(`/api/admin/pages?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPages(pages.filter(p => p.id !== id))
        showToast('Seite erfolgreich gelöscht')
      }
    } catch (error) {
      console.error('Failed to delete page', error)
    }
  }

  const handleSave = async () => {
    const method = currentPage.id ? 'PUT' : 'POST'
    try {
      const res = await fetch('/api/admin/pages', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPage),
      })

      if (res.ok) {
        setIsEditing(false)
        fetchPages()
        showToast(currentPage.id ? 'Seite erfolgreich aktualisiert' : 'Seite erfolgreich erstellt')
      }
    } catch (error) {
      console.error('Failed to save page', error)
    }
  }

  if (isLoading) return <div className="p-8 text-center text-gray-500">Laden...</div>

  return (
    <div className="space-y-6">
      {success && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-green-500/20">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Seiten verwalten</h2>
        {!isEditing && (
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Neue Seite
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              {currentPage.id ? 'Seite bearbeiten' : 'Neue Seite erstellen'}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                <X className="w-4 h-4" />
                Abbrechen
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 font-medium"
              >
                <Save className="w-4 h-4" />
                Speichern
              </button>
            </div>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Titel (Intern)</label>
                <input
                  value={currentPage.title || ''}
                  onChange={e => setCurrentPage({ ...currentPage, title: e.target.value })}
                  placeholder="z.B. Über uns"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Slug (URL)</label>
                <div className="flex items-center group">
                  <span className="bg-gray-50 px-4 py-3 border border-r-0 border-gray-200 rounded-l-xl text-gray-400 font-mono text-sm group-focus-within:border-blue-500 group-focus-within:bg-blue-50 transition">/p/</span>
                  <input
                    value={currentPage.slug || ''}
                    onChange={e => setCurrentPage({ ...currentPage, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="about"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition text-lg"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Seiteninhalt</label>
              <div className="border border-gray-200 rounded-xl overflow-hidden min-h-[400px] shadow-inner bg-slate-50/30">
                <TiptapEditor
                  value={currentPage.content || ''}
                  onChange={content => setCurrentPage({ ...currentPage, content })}
                />
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">SEO</div>
                  <h4 className="font-bold text-gray-800 uppercase tracking-tight">Meta-Daten</h4>
                </div>
                
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Meta Title</label>
                    <input
                      value={currentPage.metaTitle || ''}
                      onChange={e => setCurrentPage({ ...currentPage, metaTitle: e.target.value })}
                      placeholder="Maximal 60 Zeichen empfohlen"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 outline-none bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Meta Description</label>
                    <textarea
                      value={currentPage.metaDescription || ''}
                      onChange={e => setCurrentPage({ ...currentPage, metaDescription: e.target.value })}
                      placeholder="Maximal 160 Zeichen empfohlen"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 outline-none h-24 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {pages.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-gray-400 font-medium tracking-tight">Noch keine statischen Seiten vorhanden.</p>
              <button 
                onClick={handleCreate}
                className="mt-6 bg-slate-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-black transition shadow-lg shadow-slate-200"
              >
                Erste Seite erstellen
              </button>
            </div>
          ) : (
            pages.map(page => (
              <div key={page.id} className="group bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-xl hover:border-blue-100 transition-all duration-300 translate-y-0 hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors text-slate-400">
                    <CheckCircle className="w-6 h-6 border-2 border-current rounded-full p-1" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-900 transition-colors">{page.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter">Slug</span>
                      <code className="text-sm text-gray-400 font-mono">/{page.slug}</code>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a 
                    href={`/${page.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition shadow-sm hover:shadow"
                    title="Anschauen"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <button 
                    onClick={() => handleEdit(page)}
                    className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition shadow-sm hover:shadow"
                    title="Bearbeiten"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(page.id)}
                    className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition shadow-sm hover:shadow"
                    title="Löschen"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

