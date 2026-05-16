import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; password?: string }
    const username = body.username?.trim() ?? ''
    const password = body.password ?? ''

    console.log('Login attempt:', { username, passwordLength: password.length })

    if (username === 'admin' && password === '123456') {
      console.log('Login successful')
      const response = NextResponse.json({ ok: true })

      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 8,
      })

      return response
    }

    console.log('Login failed: invalid credentials', { username, passwordCorrect: password === '123456', userCorrect: username === 'admin' })
    return NextResponse.json({ ok: false, message: 'Falscher Benutzername oder Passwort' }, { status: 401 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ ok: false, message: 'Anmeldefehler' }, { status: 500 })
  }
}
