import { FC } from 'react'
import { Heart, MapPin, ShieldCheck, Star } from 'lucide-react'

const features = [
  {
    title: 'Vertrauenswürdige Zahnärzte',
    description: 'Alle Einträge werden sorgfältig geprüft.',
    Icon: ShieldCheck,
  },
  {
    title: 'Echte Bewertungen',
    description: 'Echte Erfahrungen von Patienten helfen bei der Entscheidung.',
    Icon: Star,
  },
  {
    title: 'Alle Leistungen',
    description: 'Von Prophylaxe bis Implantologie – alle Fachbereiche.',
    Icon: Heart,
  },
  {
    title: 'In Cuxhaven',
    description: 'Alle Informationen an einem Ort.',
    Icon: MapPin,
  },
]

const FeaturesGrid: FC = () => {
  return (
    <section className="pb-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {features.map(({ title, description, Icon }) => (
          <article
            key={title}
            className="rounded-3xl border border-primary-blue/8 bg-white p-6 shadow-[0_14px_40px_rgba(18,58,99,0.06)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-accent-blue">
              <Icon className="h-6 w-6" strokeWidth={1.9} />
            </div>
            <h3 className="mt-5 text-xl font-semibold leading-7 text-primary-blue">{title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default FeaturesGrid