'use client'

import { useEffect, type ReactNode } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TipTapLink from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import {
  Bold,
  Code,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  Link2Off,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
} from 'lucide-react'

type TiptapEditorProps = {
  value: string
  onChange: (value: string) => void
}

type MenuButtonProps = {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  title: string
  icon: ReactNode
}

function MenuButton({ active = false, disabled = false, onClick, title, icon }: MenuButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition ${
        active
          ? 'border-slate-300 bg-slate-200 text-primary-blue'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {icon}
    </button>
  )
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TipTapLink.configure({
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https', 'mailto'],
      }),
      Image,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'tiptap prose prose-slate max-w-none prose-headings:text-primary-blue prose-a:text-accent-blue min-h-[500px] px-4 py-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return

    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
  }, [editor, value])

  if (!editor) {
    return (
      <div className="rounded-xl border border-primary-blue/15 bg-white px-4 py-3 text-sm text-slate-500">
        Editor wird geladen...
      </div>
    )
  }

  const safeEditor = editor

  function handleSetLink() {
    const previousUrl = safeEditor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL eingeben', previousUrl || 'https://')

    if (url === null) return

    if (url.trim() === '') {
      safeEditor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    safeEditor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  function handleUnsetLink() {
    safeEditor.chain().focus().extendMarkRange('link').unsetLink().run()
  }

  function handleInsertImage() {
    const src = window.prompt('Bild-URL eingeben', 'https://')
    if (!src || !src.trim()) return

    const alt = window.prompt('Alt-Text für SEO eingeben', '') ?? ''

    safeEditor
      .chain()
      .focus()
      .setImage({
        src: src.trim(),
        alt: alt.trim(),
      })
      .run()
  }

  return (
    <div className="rounded-xl border border-primary-blue/15 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-primary-blue/10 bg-slate-50 px-3 py-3">
        <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
          <MenuButton
            title="Fett"
            icon={<Bold className="h-4 w-4" />}
            active={safeEditor.isActive('bold')}
            onClick={() => safeEditor.chain().focus().toggleBold().run()}
          />
          <MenuButton
            title="Kursiv"
            icon={<Italic className="h-4 w-4" />}
            active={safeEditor.isActive('italic')}
            onClick={() => safeEditor.chain().focus().toggleItalic().run()}
          />
          <MenuButton
            title="Durchgestrichen"
            icon={<Strikethrough className="h-4 w-4" />}
            active={safeEditor.isActive('strike')}
            onClick={() => safeEditor.chain().focus().toggleStrike().run()}
          />
          <MenuButton
            title="Code"
            icon={<Code className="h-4 w-4" />}
            active={safeEditor.isActive('code')}
            onClick={() => safeEditor.chain().focus().toggleCode().run()}
          />
        </div>

        <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
          <MenuButton
            title="Aufzählungsliste"
            icon={<List className="h-4 w-4" />}
            active={safeEditor.isActive('bulletList')}
            onClick={() => safeEditor.chain().focus().toggleBulletList().run()}
          />
          <MenuButton
            title="Nummerierte Liste"
            icon={<ListOrdered className="h-4 w-4" />}
            active={safeEditor.isActive('orderedList')}
            onClick={() => safeEditor.chain().focus().toggleOrderedList().run()}
          />
          <MenuButton
            title="Zitat"
            icon={<Quote className="h-4 w-4" />}
            active={safeEditor.isActive('blockquote')}
            onClick={() => safeEditor.chain().focus().toggleBlockquote().run()}
          />
        </div>

        <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
          <MenuButton
            title="Link einfügen"
            icon={<LinkIcon className="h-4 w-4" />}
            active={safeEditor.isActive('link')}
            onClick={handleSetLink}
          />
          <MenuButton
            title="Link entfernen"
            icon={<Link2Off className="h-4 w-4" />}
            disabled={!safeEditor.isActive('link')}
            onClick={handleUnsetLink}
          />
        </div>

        <div className="flex items-center gap-1">
          <MenuButton title="Bild einfügen" icon={<ImageIcon className="h-4 w-4" />} onClick={handleInsertImage} />
        </div>
      </div>

      <EditorContent editor={safeEditor} />
    </div>
  )
}
