import { FC } from 'react'
import Image from 'next/image'
import { BadgeCheck } from 'lucide-react'

type HeroProps = {
  h1?: string
}

const Hero: FC<HeroProps> = ({ h1 }) => {
  return (
    <section className="relative overflow-hidden bg-white py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_left_center,rgba(47,128,237,0.12),transparent_42%),radial-gradient(circle_at_right_top,rgba(18,58,99,0.08),transparent_32%)]" />
      <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className="max-w-xl">
          <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-primary-blue md:text-6xl">
            {h1 || (
              <>
                Zahnärzte in <span className="text-accent-blue">Cuxhaven</span> finden
              </>
            )}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
            Finden Sie geprüfte Zahnärzte und Kliniken in Cuxhaven. Bewertungen, Leistungen und Kontaktinformationen auf einen Blick.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-primary-blue shadow-sm shadow-accent-blue/5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-accent-blue">
              <BadgeCheck className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <span>
              <span className="block font-semibold">Geprüfte Anbieter</span>
              <span className="block text-slate-500">Nur verifizierte Zahnärzte und Kliniken</span>
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-2xl lg:ml-auto">
          <div className="absolute -left-12 top-10 hidden h-56 w-56 rounded-full bg-accent-blue/10 blur-3xl lg:block" />
          <div className="absolute -right-8 bottom-2 hidden h-48 w-48 rounded-full bg-primary-blue/10 blur-3xl lg:block" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-slate-100 shadow-[0_30px_80px_rgba(18,58,99,0.18)]">
            <div className="absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-white via-white/85 to-transparent" />
            <Image
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80"
              alt="Lächelnde Patientin beim Zahnarzt"
              width={1200}
              height={840}
              priority
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
