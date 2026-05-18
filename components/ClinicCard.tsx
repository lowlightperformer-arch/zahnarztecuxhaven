import Image from 'next/image'
import Link from 'next/link'
import { Heart, Mail, MapPin, Phone, Star } from 'lucide-react'

import type { Clinic } from '../data/dentists'

type ClinicCardProps = {
  clinic: Clinic
}

function formatAddress(address: string) {
  const [street, city] = address.split(', ')

  return {
    street: street ?? address,
    city: city ?? '',
  }
}

export default function ClinicCard({ clinic }: ClinicCardProps) {
  const { street, city } = formatAddress(clinic.address ?? 'Cuxhaven')
  const mapsQuery = `${clinic.clinicName} Cuxhaven`
  const fallbackMapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery).replace(/%20/g, '+')}`
  const mapsHref = clinic.googleMapsUrl?.trim() ? clinic.googleMapsUrl.trim() : fallbackMapsHref

  const createSlug = (value: string) => {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }

  const clinicSlug = clinic.slug || createSlug(clinic.clinicName)

  const badges =
    clinic.categories && clinic.categories.length > 0
      ? clinic.categories.map((category) => ({
          key: category.id,
          label: category.name,
          href: `/kategorien/${category.slug}`,
        }))
      : (clinic.services ?? []).map((service) => ({
          key: service,
          label: service,
          href: undefined,
        }))

  return (
    <article className="relative grid w-full gap-6 rounded-[28px] border border-primary-blue/10 bg-white p-4 sm:p-5 shadow-[0_18px_50px_rgba(18,58,99,0.07)] transition-shadow duration-200 hover:shadow-[0_24px_70px_rgba(18,58,99,0.1)] lg:grid-cols-[260px_minmax(0,1fr)_240px] lg:gap-8 lg:p-6">
      <button
        type="button"
        aria-label={`Klinik ${clinic.clinicName} merken`}
        className="absolute right-5 top-5 rounded-full border border-accent-blue/15 bg-white p-2 text-accent-blue transition-colors hover:bg-blue-50"
      >
        <Heart className="h-5 w-5" strokeWidth={1.9} />
      </button>

      <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
        <Image
          src={clinic.clinicImage ?? 'https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=1200&q=80'}
          alt={clinic.clinicName}
          fill
          className="object-cover"
        />

        {clinic.doctorAvatar && clinic.leadDoctor && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 rounded-full border border-white/70 bg-white/95 px-3 py-2 shadow-lg shadow-primary-blue/10 backdrop-blur">
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-full ring-4 ring-white flex items-center justify-center bg-white shadow-md border border-gray-100">
              <Image
                src={clinic.doctorAvatar}
                alt={clinic.leadDoctor}
                width={112}
                height={112}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="hidden pr-1 sm:block">
              <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 leading-none">Lead Doctor</p>
              <p className="text-sm font-semibold text-primary-blue break-words leading-tight">{clinic.leadDoctor}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 min-w-0">
        <Link href={`/clinics/${clinicSlug}`}>
          <h3 className="text-2xl font-bold tracking-tight text-primary-blue hover:text-accent-blue transition-colors break-words">
            {clinic.clinicName}
          </h3>
        </Link>
        {clinic.specialization && <p className="mt-1 text-base font-medium text-primary-blue/75 break-words">{clinic.specialization}</p>}
        {clinic.description && <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 line-clamp-3 break-words">{clinic.description}</p>}
        
        <div className="mt-2">
          <Link 
            href={`/clinics/${clinicSlug}`} 
            className="text-sm font-bold text-accent-blue hover:underline underline-offset-4"
          >
            Details ansehen →
          </Link>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {badges.map((badge) =>
            badge.href ? (
              <Link
                key={badge.key}
                href={badge.href}
                className="rounded-full bg-light-bg px-3 py-1.5 text-xs font-medium text-primary-blue/80 ring-1 ring-primary-blue/5 transition hover:bg-accent-blue/10 hover:text-primary-blue"
              >
                {badge.label}
              </Link>
            ) : (
              <span
                key={badge.key}
                className="rounded-full bg-light-bg px-3 py-1.5 text-xs font-medium text-primary-blue/80 ring-1 ring-primary-blue/5"
              >
                {badge.label}
              </span>
            ),
          )}
        </div>

        {(clinic.rating !== undefined && clinic.rating > 0) && (
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="text-lg font-bold text-[#4285F4]">G</span>
            <span className="font-semibold text-primary-blue">{clinic.rating.toFixed(1)}</span>
            <span className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-current" />
              ))}
            </span>
            <span>({clinic.reviewsCount ?? 0} Bewertungen)</span>
          </div>
        )}
      </div>

      <div className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5 w-full gap-3">
        <div className="rounded-2xl border border-primary-blue/10 bg-white p-4 sm:p-5 flex flex-col gap-3">
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex w-full items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" strokeWidth={2} />
              <div className="min-w-0 flex-1">
                <p className="text-sm sm:text-base font-medium leading-tight text-slate-700 break-words">{street}</p>
                {city ? <p className="text-sm sm:text-base font-medium leading-tight text-slate-700 break-words">{city}</p> : null}
              </div>
            </div>

            {clinic.leadDoctor && (
              <div className="flex w-full items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <p className="min-w-0 flex-1 text-sm sm:text-base font-medium leading-tight text-slate-700 break-words">
                  <span className="font-medium text-slate-500">Leitender Arzt:</span> {clinic.leadDoctor}
                </p>
              </div>
            )}

            {clinic.phone && (
              <div className="flex w-full items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" strokeWidth={2} />
                <p className="min-w-0 flex-1 text-sm sm:text-base font-medium leading-tight text-slate-700 break-words">{clinic.phone}</p>
              </div>
            )}

            {clinic.email && (
              <div className="flex w-full items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" strokeWidth={2} />
                <p className="min-w-0 flex-1 text-sm sm:text-base font-medium leading-tight text-slate-700 break-all">{clinic.email}</p>
              </div>
            )}
          </div>
        </div>

        <a
          href={mapsHref}
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all md:hidden"
        >
          <MapPin className="h-4 w-4 shrink-0" strokeWidth={2.2} />
          <span>Route anzeigen</span>
        </a>

        <a
          href={mapsHref}
          target="_blank"
          rel="noreferrer"
          className="relative mt-5 hidden overflow-hidden rounded-2xl border border-primary-blue/10 bg-blue-50 md:block"
        >
          <div className="aspect-[4/3] bg-[linear-gradient(135deg,rgba(226,239,255,0.95),rgba(255,255,255,0.98)),repeating-linear-gradient(0deg,transparent,transparent_24px,rgba(18,58,99,0.04)_24px,rgba(18,58,99,0.04)_26px),repeating-linear-gradient(90deg,transparent,transparent_34px,rgba(47,128,237,0.05)_34px,rgba(47,128,237,0.05)_36px)]" />
          <div className="absolute inset-0 opacity-60">
            <div className="absolute left-6 top-8 h-24 w-2 rotate-12 rounded-full bg-emerald-200/70" />
            <div className="absolute right-10 top-6 h-28 w-3 -rotate-12 rounded-full bg-emerald-200/60" />
            <div className="absolute bottom-8 left-12 h-20 w-20 rounded-full border border-accent-blue/10 bg-accent-blue/5" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-blue text-white shadow-lg shadow-accent-blue/30">
              <MapPin className="h-5 w-5 fill-current" strokeWidth={2.2} />
            </div>
          </div>
        </a>
      </div>
    </article>
  )
}