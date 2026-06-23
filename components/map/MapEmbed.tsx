import { site } from "@/content/site";
import { formatAddress } from "@/lib/nap";

// Location map = Google Maps embed (iframe). Dependency-free, no WebGL, no API key,
// no client JS — loads reliably on every device/browser (unlike Mapbox GL, which can
// fail on some mobile browsers / content blockers and fall back to a plain link).
export function MapEmbed({ className = "" }: { className?: string }) {
  const query = encodeURIComponent(`${site.name}, ${formatAddress(site.nap)}`);
  return (
    <div
      className={`relative min-h-[320px] overflow-hidden rounded-3xl ring-1 ring-charcoal/10 ${className}`}
    >
      <iframe
        title={`Map to ${site.name}`}
        src={`https://www.google.com/maps?q=${query}&output=embed`}
        className="h-full min-h-[320px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
