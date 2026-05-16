'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FaqItem } from '@/lib/cms'

export default function FaqAccordion({ faq }: { faq: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!faq || faq.length === 0) return null

  // Generate LD+JSON schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <section className="mt-20 border-t border-primary-blue/5 pt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="mb-10 flex items-center gap-4">
        <div className="h-8 w-1.5 rounded-full bg-accent-blue" />
        <h2 className="text-3xl font-bold tracking-tight text-primary-blue">
          Häufig gestellte Fragen (FAQ)
        </h2>
      </div>

      <div className="grid gap-4 md:gap-5">
        {faq.map((item, index) => {
          const isOpen = openIndex === index
          return (
            <div
              key={index}
              className="group overflow-hidden rounded-2xl border border-primary-blue/10 bg-white shadow-sm transition-all hover:border-accent-blue/30 hover:shadow-md"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors"
                aria-expanded={isOpen}
              >
                <span className="pr-8 font-semibold text-primary-blue transition-colors group-hover:text-accent-blue md:text-lg">
                  {item.question}
                </span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                  isOpen ? 'bg-accent-blue border-accent-blue text-white' : 'border-primary-blue/10 text-primary-blue group-hover:border-accent-blue group-hover:text-accent-blue'
                }`}>
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="border-t border-primary-blue/5 bg-light-bg/30 px-6 pb-6 pt-5">
                      <p className="leading-relaxed text-slate-600 md:text-lg">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
