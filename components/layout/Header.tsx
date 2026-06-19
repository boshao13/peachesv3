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
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          aria-label="Peaches Fitness Club — home"
          className={`flex items-center gap-2 transition-all ${scrolled ? "py-2" : "py-3"}`}
        >
          <Image
            src="/images/brand/logo.png"
            alt=""
            width={44}
            height={44}
            className={`rounded-full transition-all ${scrolled ? "h-9 w-9" : "h-11 w-11"}`}
            priority
          />
          <span className="script text-2xl text-coral-deep leading-none">Peaches</span>
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

        {/* mobile toggle */}
        <button
          type="button"
          className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-full text-charcoal"
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
      </nav>

      {/* mobile menu */}
      {open ? (
        <div className="lg:hidden border-t border-charcoal/10 bg-cream">
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
