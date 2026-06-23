import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-5 py-24 text-center">
      <div>
        <p className="script text-5xl text-coral-deep">Oops</p>
        <h1 className="mt-2 text-4xl font-semibold uppercase tracking-wide">Page not found</h1>
        <p className="mt-3 text-charcoal/70 max-w-md mx-auto">
          The page you&apos;re looking for moved or never existed. Let&apos;s get you back on track.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button href="/">Back home</Button>
          <Button href="/contact" variant="secondary">
            Contact us
          </Button>
        </div>
        <nav className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-charcoal/80">
          <Link href="/amenities" className="hover:text-coral-deep">Amenities</Link>
          <Link href="/classes" className="hover:text-coral-deep">Classes</Link>
          <Link href="/membership" className="hover:text-coral-deep">Membership</Link>
          <Link href="/trainers" className="hover:text-coral-deep">Trainers</Link>
        </nav>
      </div>
    </div>
  );
}
