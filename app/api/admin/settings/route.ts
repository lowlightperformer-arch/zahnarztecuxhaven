import { NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'

export async function GET() {
  try {
    const db = await readDb()
    const settings = db.siteSettings || {
      facebookUrl: '',
      gaId: '',
      gscMetaTag: '',
      generalEmail: '',
      aboutUsSlug: 'ueber-uns'
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json({ message: 'Fehler beim Laden der Einstellungen.' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json()
    const db = await readDb()
    
    db.siteSettings = {
      facebookUrl: String(payload.facebookUrl || '').trim(),
      gaId: String(payload.gaId || '').trim(),
      gscMetaTag: String(payload.gscMetaTag || '').trim(),
      generalEmail: String(payload.generalEmail || '').trim(),
      aboutUsSlug: String(payload.aboutUsSlug || 'ueber-uns').trim()
    }

    await writeDb(db)
    return NextResponse.json({ ok: true, settings: db.siteSettings })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ message: 'Fehler beim Speichern der Einstellungen.' }, { status: 500 })
  }
}
