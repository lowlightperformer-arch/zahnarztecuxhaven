'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import ClinicCard from './ClinicCard'
import FaqAccordion from './FaqAccordion'
import SeoSection from './SeoSection'
import type { Clinic } from '../data/dentists'

type ClinicListProps = {
  clinics: any[]
  homepageConfig?: {
    faq?: Array<{ question: string; answer: string }>
    bottomSeoText?: string
  }
}

export default function ClinicList({ clinics, homepageConfig }: ClinicListProps) {
  const [visibleCount, setVisibleCount] = useState(12)

  const showMore = () => {
    setVisibleCount((prev) => prev + 12)
  }

  const hasMore = clinics.length > visibleCount

  return (
    <section className="pt-6 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight text-primary-blue">Zahnärzte in Cuxhaven</h2>

      <div className="mt-8 space-y-8">
        {clinics.slice(0, visibleCount).map((clinic) => (
          <ClinicCard
            key={clinic.id}
            clinic={{
              id: clinic.id,
              clinicName: clinic.name,
              leadDoctor: clinic.leadDoctor ?? 'Lead Doctor',
              doctorAvatar: clinic.doctorAvatar ?? clinic.imageUrl,
              clinicImage: clinic.imageUrl,
              googleMapsUrl: clinic.googleMapsUrl,
              specialization: clinic.specialization ?? 'Zahnmedizin',
              description: clinic.description,
              categories: clinic.categories,
              rating: clinic.rating,
              reviewsCount: clinic.reviewsCount,
              address: clinic.address ?? 'Cuxhaven',
              phone: clinic.phone,
              email: clinic.email,
              slug: clinic.slug,
            }}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 flex justify-center pb-8 border-b border-primary-blue/5">
          <button
            onClick={showMore}
            type="button"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-accent-blue/20 bg-white px-8 py-4 text-sm font-bold text-accent-blue shadow-lg shadow-primary-blue/5 transition-all hover:bg-accent-blue/5 hover:border-accent-blue/40"
          >
            Mehr anzeigen
            <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* SEO Content and FAQ always visible below the list */}
      <div className="mt-20 space-y-20 pb-12">
        {homepageConfig?.bottomSeoText && (
          <SeoSection htmlContent={homepageConfig.bottomSeoText} />
        )}
        {homepageConfig?.faq && homepageConfig.faq.length > 0 && (
          <FaqAccordion faq={homepageConfig.faq} />
        )}
      </div>
    </section>
  )
}
