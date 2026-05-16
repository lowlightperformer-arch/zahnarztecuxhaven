import ClinicCard from '../components/ClinicCard'
import { ChevronDown } from 'lucide-react'
import Header from '../components/Header'
import FeaturesGrid from '../components/FeaturesGrid'
import Hero from '../components/Hero'
import ClinicList from '../components/ClinicList'
import { getPublicData } from '@/lib/public-data'
import { readDb } from '@/lib/db'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const db = await readDb()
  const config = db.homepageConfig

  return {
    title: config?.metaTitle || 'Dental Listing Cuxhaven - Zahnärzte finden',
    description: config?.metaDescription || 'Lokaler Vergleich von Zahnarztpraxen in Cuxhaven.',
    alternates: {
      canonical: '/',
      languages: {
        'de-DE': '/',
        'x-default': '/',
      },
    },
  }
}

export default async function HomePage() {
  const { clinics } = await getPublicData()
  
  const db = await readDb()
  const homepageConfig = db.homepageConfig

  return (
    <div className="min-h-screen bg-light-bg">
      <Header />
      <Hero h1={homepageConfig?.h1} />
      <div className="pb-20">
        <FeaturesGrid />
        <ClinicList clinics={clinics} homepageConfig={homepageConfig} />
      </div>
    </div>
  )
}