'use client'

import { FC } from 'react'
import { SmilePlus } from 'lucide-react'
import Link from "next/link";
import { usePathname } from 'next/navigation';

const navLinks = [
  { name: "Startseite", href: "/" },
  { name: "Ratgeber", href: "/ratgeber" },
  { name: "Über uns", href: "/uber-uns" },
];

const Header: FC = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-primary-blue/10 bg-white/90 backdrop-blur-xl">
      <div className="flex items-center justify-between px-8 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary-blue">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent-blue/20 bg-accent-blue/5 text-accent-blue">
            <SmilePlus className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <span className="leading-none">
            ZAHNÄRZTE <span className="text-primary-blue/75">CUXHAVEN</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => {
            const isActive = link.href === '/' 
              ? pathname === '/' 
              : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`border-b-2 pb-2 text-sm font-semibold no-underline transition-colors ${
                  isActive
                    ? 'border-accent-blue text-primary-blue'
                    : 'border-transparent text-slate-600 hover:text-primary-blue'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;
