"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { primaryNav, secondaryNav } from "@/content/nav";
import { site } from "@/content/site";
import { Button } from "@/components/ui/Button";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream/95 backdrop-blur-md shadow-[0_2px_20px_-12px_rgba(43,38,34,0.35)]"
          : "bg-cream/85 backdrop-blur-sm"
      }`}
    >
      <nav className="mx-auto flex h-[var(--header-h)] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="Peaches Fitness Club — home" className="flex items-center">
          {/* desktop: full wordmark logo */}
          <Image
            src="/images/brand/MAINLOGO-dark.png"
            alt="Peaches Fitness Club"
            width={1200}
            height={655}
            priority
            className={`hidden w-auto transition-all lg:block ${scrolled ? "h-11" : "h-12"}`}
          />
          {/* mobile: peach mark only */}
          <Image
            src="/images/brand/logo.png"
            alt=""
            width={44}
            height={44}
            className="h-10 w-10 rounded-full lg:hidden"
            priority
          />
        </Link>

        {/* desktop nav */}
        <ul className="hidden items-center gap-7 lg:flex">
          {primaryNav.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`text-sm font-medium uppercase tracking-wide transition-colors hover:text-coral-deep ${
                    active ? "text-coral-deep" : "text-charcoal"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden lg:block">
          <Button href={site.glofox.membershipsUrl} external size="md">
            Join Now
          </Button>
        </div>

        {/* mobile: Join Now + menu toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button href={site.glofox.membershipsUrl} external size="md">
            Join Now
          </Button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-charcoal"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-4 w-6">
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-current transition-all ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 block h-0.5 w-6 bg-current transition-all ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-6 bg-current transition-all ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* mobile menu */}
      {open ? (
        <div className="lg:hidden border-t border-charcoal/10 bg-cream max-h-[calc(100svh-var(--header-h))] overflow-y-auto overscroll-contain">
          <ul className="mx-auto max-w-6xl px-5 py-4">
            {[...primaryNav, ...secondaryNav].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block py-2.5 text-base font-medium uppercase tracking-wide text-charcoal/85 hover:text-coral-deep"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-3">
              <Button href={site.glofox.membershipsUrl} external size="lg" className="w-full">
                Join Now
              </Button>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
