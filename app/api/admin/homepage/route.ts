import { NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'
import type { HomepageConfig } from '@/lib/cms'

export async function GET() {
  const db = await readDb()
  const config = db.homepageConfig || { bottomSeoText: '', faq: [] }
  return NextResponse.json(config)
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    // Support both flattened and nested structures
    const payload = body.homepage || body
    
    // Relaxed validation: ensure fields exist even if they are empty
    if (typeof (payload.bottomSeoText ?? '') !== 'string' || !Array.isArray(payload.faq ?? [])) {
      return NextResponse.json({ message: 'Ungültiges Format.' }, { status: 400 })
    }

    const db = await readDb()
    db.homepageConfig = {
      h1: String(payload.h1 || '').trim(),
      metaTitle: String(payload.metaTitle || '').trim(),
      metaDescription: String(payload.metaDescription || '').trim(),
      bottomSeoText: payload.bottomSeoText || '',
      faq: Array.isArray(payload.faq) 
        ? payload.faq.map((item: any) => ({
            question: String(item.question || '').trim(),
            answer: String(item.answer || '').trim()
          }))
        : []
    }

    await writeDb(db)
    return NextResponse.json({ ok: true, config: db.homepageConfig })
  } catch (error) {
    console.error('Homepage config update error:', error)
    return NextResponse.json({ message: 'Fehler beim Speichern der Einstellungen.' }, { status: 500 })
  }
}
