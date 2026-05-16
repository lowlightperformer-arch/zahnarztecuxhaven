import type { BlogPost, PostStatus } from './cms'

export function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function normalizePostStatus(value: string): PostStatus {
  return value === 'published' ? 'published' : 'draft'
}

export function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function inlineMarkdownToHtml(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
}

export function contentToHtml(content: string) {
  const trimmed = content.trim()
  if (!trimmed) return ''

  // If content already contains HTML tags, trust CMS input.
  if (/<\/?[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed
  }

  const lines = trimmed.split(/\r?\n/)
  const html: string[] = []

  for (const lineRaw of lines) {
    const line = lineRaw.trim()

    if (!line) continue

    if (line.startsWith('### ')) {
      html.push(`<h3>${inlineMarkdownToHtml(escapeHtml(line.slice(4)))}</h3>`)
      continue
    }

    if (line.startsWith('## ')) {
      html.push(`<h2>${inlineMarkdownToHtml(escapeHtml(line.slice(3)))}</h2>`)
      continue
    }

    if (line.startsWith('# ')) {
      html.push(`<h1>${inlineMarkdownToHtml(escapeHtml(line.slice(2)))}</h1>`)
      continue
    }

    if (line.startsWith('- ')) {
      const item = `<li>${inlineMarkdownToHtml(escapeHtml(line.slice(2)))}</li>`
      const previous = html.at(-1)
      if (previous?.endsWith('</ul>')) {
        html[html.length - 1] = previous.replace('</ul>', `${item}</ul>`)
      } else {
        html.push(`<ul>${item}</ul>`)
      }
      continue
    }

    html.push(`<p>${inlineMarkdownToHtml(escapeHtml(line))}</p>`)
  }

  return html.join('\n')
}

export function normalizeExcerpt(post: Pick<BlogPost, 'excerpt' | 'content'>) {
  const excerpt = post.excerpt.trim()
  if (excerpt) return excerpt

  const source = stripHtml(contentToHtml(post.content))
  return source.slice(0, 180)
}
