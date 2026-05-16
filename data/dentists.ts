import type { Category } from '@/lib/cms'

export interface Clinic {
  id: string
  clinicName: string
  leadDoctor?: string
  doctorAvatar?: string
  clinicImage?: string
  googleMapsUrl?: string
  specialization?: string
  description?: string
  services?: string[]
  categories?: Category[]
  rating?: number
  reviewsCount?: number
  address?: string
  phone?: string
  email?: string
  slug?: string
}

export const clinics: Clinic[] = [
  {
    id: 'dr-markus-weber',
    clinicName: 'Zahnarztpraxis Dr. Markus Weber',
    leadDoctor: 'Dr. Markus Weber',
    doctorAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80',
    clinicImage: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=1200&q=80',
    specialization: 'Allgemeine Zahnheilkunde',
    description:
      'Moderne Zahnarztpraxis im Herzen von Cuxhaven. Wir bieten umfassende zahnmedizinische Behandlungen für die ganze Familie in angenehmer Atmosphäre.',
    services: ['Implantologie', 'Prophylaxe', 'Parodontologie', 'Ästhetische Zahnheilkunde', 'Zahnerhaltung'],
    rating: 5,
    reviewsCount: 128,
    address: 'Mittlerer Lech 1, 86150 Cuxhaven',
    phone: '0821 123456',
    email: 'info@dr-weber-cuxhaven.de',
  },
  {
    id: 'dr-anna-schmidt',
    clinicName: 'Dr. Anna Schmidt',
    leadDoctor: 'Dr. Anna Schmidt',
    doctorAvatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=300&q=80',
    clinicImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    specialization: 'Kieferorthopädie',
    description:
      'Fachpraxis für Kieferorthopädie für Kinder, Jugendliche und Erwachsene. Uns ist eine individuelle und schonende Behandlung besonders wichtig.',
    services: ['Zahnspangen', 'Invisalign', 'Kinderorthodontie', 'Kiefergelenkdiagnostik', 'Retainer'],
    rating: 4.9,
    reviewsCount: 96,
    address: 'Lechhauser Str. 20, 86165 Cuxhaven',
    phone: '0821 234567',
    email: 'kontakt@dr-anna-schmidt.de',
  },
  {
    id: 'zahnzentrum-cuxhaven',
    clinicName: 'Zahnzentrum Cuxhaven',
    leadDoctor: 'Dr. Tobias Keller',
    doctorAvatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=300&q=80',
    clinicImage: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1200&q=80',
    specialization: 'Zahnmedizinisches Zentrum',
    description:
      'Unser Zahnzentrum bietet Ihnen modernste Zahnmedizin unter einem Dach. Ein erfahrenes Team aus Spezialisten kümmert sich um Ihre Zahngesundheit.',
    services: ['Chirurgie', 'Implantologie', 'Prothetik', 'Parodontologie', 'Prophylaxe'],
    rating: 4.8,
    reviewsCount: 214,
    address: 'Gögginger Str. 91, 86199 Cuxhaven',
    phone: '0821 345678',
    email: 'info@zahnzentrum-cuxhaven.de',
  },
  {
    id: 'dr-julia-hofmann',
    clinicName: 'Dr. Julia Hofmann',
    leadDoctor: 'Dr. Julia Hofmann',
    doctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
    clinicImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    specialization: 'Kinderzahnheilkunde',
    description:
      'Liebevolle und einfühlsame Zahnmedizin für die Kleinsten. Wir nehmen uns Zeit für Kinder und sorgen für ein positives Zahnarzterlebnis.',
    services: ['Kinderzahnheilkunde', 'Prophylaxe', 'Fissurenversiegelung', 'Milchzahnbehandlung'],
    rating: 5,
    reviewsCount: 73,
    address: 'Pfarrer-Grimm-Str. 6, 86150 Cuxhaven',
    phone: '0821 456789',
    email: 'praxis@dr-julia-hofmann.de',
  },
]