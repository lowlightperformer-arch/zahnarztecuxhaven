import { NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'
import { StaticPage } from '@/lib/cms'

export async function GET() {
  try {
    const db = await readDb()
    return NextResponse.json(db.pages || [])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const db = await readDb()
    
    const newPage: StaticPage = {
      id: Math.random().toString(36).substr(2, 9),
      title: body.title,
      slug: body.slug,
      content: body.content,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const pages = db.pages || []
    pages.push(newPage)
    
    await writeDb({ ...db, pages })
    return NextResponse.json(newPage)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const db = await readDb()
    
    const pages = db.pages || []
    const index = pages.findIndex(p => p.id === body.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    pages[index] = {
      ...pages[index],
      ...body,
      updatedAt: new Date().toISOString()
    }

    await writeDb({ ...db, pages })
    return NextResponse.json(pages[index])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const db = await readDb()
    const pages = (db.pages || []).filter(p => p.id !== id)
    
    await writeDb({ ...db, pages })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 })
  }
}
