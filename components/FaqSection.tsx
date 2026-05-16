'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { FaqItem } from '@/lib/cms'

export default function FaqSection({ faq }: { faq: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!faq || faq.length === 0) return null

  // Generate LD+JSON schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faq.map((item) => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer,
      },
    })),
  }

  return (
    <section className="mt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h2 className="mb-8 text-3xl font-bold tracking-tight text-primary-blue">Häufig gestellte Fragen (FAQ)</h2>
      <div className="space-y-4">
        {faq.map((item, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-primary-blue/10 bg-white transition shadow-sm hover:shadow-md"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between px-6 py-5 text-left font-semibold text-primary-blue"
            >
              <span>{item.question}</span>
              {openIndex === index ? (
                <ChevronUp className="h-5 w-5 text-accent-blue" />
              ) : (
                <ChevronDown className="h-5 w-5 text-accent-blue" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-6 pb-5 text-slate-600 border-t border-primary-blue/5 pt-4 bg-light-bg/30">
                <p className="leading-relaxed">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
