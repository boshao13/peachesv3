import Link from "next/link";
import { site } from "@/content/site";
import { primaryNav, secondaryNav } from "@/content/nav";
import { formatAddress, directionsUrl } from "@/lib/nap";
import { IconInstagram } from "@/components/ui/icons";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  const { nap } = site;
  const year = 2026; // build-stamped; avoids hydration mismatch from Date()

  return (
    <footer className="bg-charcoal text-cream">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* brand + newsletter */}
          <div className="lg:col-span-1">
            <p className="script text-3xl text-peach">Peaches</p>
            <p className="mt-3 text-sm text-cream/70 max-w-xs">
              Albuquerque&apos;s women-focused fitness club — a safe, judgment-free, community-driven
              space to grow strong.
            </p>
            <div className="mt-5">
              <p className="text-xs uppercase tracking-widest text-cream/60 mb-2">Newsletter</p>
              <NewsletterForm />
            </div>
          </div>

          {/* explore */}
          <nav aria-label="Footer — explore">
            <p className="text-xs uppercase tracking-widest text-cream/60 mb-3">Explore</p>
            <ul className="space-y-2 text-sm">
              {primaryNav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-cream/80 hover:text-peach transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* more */}
          <nav aria-label="Footer — more">
            <p className="text-xs uppercase tracking-widest text-cream/60 mb-3">More</p>
            <ul className="space-y-2 text-sm">
              {secondaryNav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-cream/80 hover:text-peach transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* visit */}
          <div>
            <p className="text-xs uppercase tracking-widest text-cream/60 mb-3">Visit</p>
            <address className="not-italic text-sm text-cream/80 space-y-2">
              <a
                href={directionsUrl(nap)}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-peach"
              >
                {formatAddress(nap)}
              </a>
              <a href={`tel:${nap.phoneHref}`} className="block hover:text-peach">
                {nap.phone}
              </a>
              <a href={`mailto:${nap.email}`} className="block hover:text-peach">
                {nap.email}
              </a>
            </address>
            <a
              href={site.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-cream/80 hover:text-peach"
            >
              <IconInstagram className="h-5 w-5" /> @peachesfitnessclub
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-cream/15 pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-cream/55">
          <p>
            Our services are available to all members of the public regardless of race, gender, or
            sexual orientation.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-peach">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-peach">
              Terms
            </Link>
            <span>© {year} Peaches Fitness Club</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
