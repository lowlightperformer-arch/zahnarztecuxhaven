import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import Footer from '@/components/Footer'
import { readDb } from '@/lib/db'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://zahnaerzte-cuxhaven.de'),
  title: 'Dental Listing Cuxhaven',
  description: 'Lokaler Vergleich von Zahnarztpraxen in Cuxhaven.',
  alternates: {
    canonical: '/',
    languages: {
      'de-DE': '/',
      'x-default': '/',
    },
  },
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const db = await readDb()
  const settings = db.siteSettings

  return (
    <html lang="de">
      <head>
        {settings?.gscMetaTag && (
          <script
            dangerouslySetInnerHTML={{
              __html: `<!-- Google Search Console -->\n${settings.gscMetaTag}`,
            }}
          />
        )}
      </head>
      <body className={inter.className}>
        {settings?.gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.gaId}');
              `}
            </Script>
          </>
        )}
        <main className="app-container">{children}</main>
        <Footer />
      </body>
    </html>
  )
}