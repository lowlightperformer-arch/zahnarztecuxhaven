import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import ClinicCard from '@/components/ClinicCard'
import Header from '@/components/Header'
import { CATEGORY_TYPE_DE_LABELS, type CategoryType } from '@/lib/cms'
import { getCategoryBySlug, getClinicsByCategorySlug } from '@/lib/public-data'

type CategoryPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    return {
      title: 'Kategorie nicht gefunden | Zahnärzte Cuxhaven',
      description: 'Die gewünschte Kategorie konnte nicht gefunden werden.',
    }
  }

  return {
    title: category.metaTitle,
    description: category.metaDescription,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const { category, clinics } = await getClinicsByCategorySlug(slug)

  if (!category) {
    notFound()
  }

  const groupLabel = CATEGORY_TYPE_DE_LABELS[category.type as CategoryType] ?? category.type

  return (
    <div className="min-h-screen bg-light-bg">
      <Header />

      <section className="py-10 sm:py-14">
        <nav className="mb-5 text-sm text-slate-500">
          <Link href="/" className="hover:text-primary-blue">
            Startseite
          </Link>
          <span className="mx-2">&gt;</span>
          <span>{groupLabel}</span>
          <span className="mx-2">&gt;</span>
          <span className="font-medium text-primary-blue">{category.name}</span>
        </nav>

        <div className="rounded-3xl border border-primary-blue/10 bg-white p-8 shadow-[0_16px_42px_rgba(18,58,99,0.06)]">
          <h1 className="text-3xl font-bold tracking-tight text-primary-blue sm:text-4xl">{category.h1}</h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600">{category.description}</p>
        </div>

        <section className="mt-8 space-y-8">
          {clinics.length > 0 ? (
            clinics.map((clinic) => (
              <ClinicCard
                key={clinic.id}
                clinic={{
                  id: clinic.id,
                  clinicName: clinic.name,
                  leadDoctor: clinic.leadDoctor ?? 'Lead Doctor',
                  doctorAvatar: clinic.doctorAvatar ?? clinic.imageUrl ?? '',
                  clinicImage: clinic.imageUrl ?? '',
                  googleMapsUrl: clinic.googleMapsUrl,
                  specialization: clinic.specialization ?? 'Zahnmedizin',
                  description: clinic.description ?? '',
                  categories: clinic.categories,
                  rating: clinic.rating ?? 0,
                  reviewsCount: clinic.reviewsCount ?? 0,
                  address: clinic.address ?? 'Cuxhaven',
                  phone: clinic.phone,
                  email: clinic.email,
                }}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-primary-blue/20 bg-white px-6 py-8 text-sm text-slate-600">
              Für diese Kategorie sind aktuell noch keine Kliniken verfügbar.
            </div>
          )}
        </section>
      </section>
    </div>
  )
}
