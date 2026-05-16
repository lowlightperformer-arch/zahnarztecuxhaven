import { promises as fs } from 'fs'
import path from 'path'

import type { BlogPost, Category, CmsClinic, CmsDb } from './cms'

const dbPath = path.join(process.cwd(), 'data', 'db.json')

const fallbackDb: CmsDb = {
  categories: [],
  clinics: [],
  posts: [],
  pages: [],
}

async function ensureDbFile() {
  try {
    await fs.access(dbPath)
  } catch {
    await fs.mkdir(path.dirname(dbPath), { recursive: true })
    await fs.writeFile(dbPath, JSON.stringify(fallbackDb, null, 2), 'utf-8')
  }
}

export async function readDb(): Promise<CmsDb> {
  await ensureDbFile()

  const content = await fs.readFile(dbPath, 'utf-8')
  const parsed = JSON.parse(content) as Partial<CmsDb>

  return {
    categories: Array.isArray(parsed.categories) ? (parsed.categories as Category[]) : [],
    clinics: Array.isArray(parsed.clinics) ? (parsed.clinics as CmsClinic[]) : [],
    posts: Array.isArray(parsed.posts) ? (parsed.posts as BlogPost[]) : [],
    pages: Array.isArray(parsed.pages) ? (parsed.pages as StaticPage[]) : [],
    homepageConfig: parsed.homepageConfig,
    siteSettings: (parsed as any).siteSettings,
  }
}

export async function writeDb(db: CmsDb) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf-8')
}
