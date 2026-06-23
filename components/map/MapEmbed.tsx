"use client";

import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { site } from "@/content/site";
import { formatAddress, directionsUrl } from "@/lib/nap";
import { IconMapPin } from "@/components/ui/icons";

// Branded Mapbox GL map. Loads EAGERLY on mount (not on scroll) and does NOT
// auto-fall-back on a timer — on slow mobile networks it keeps loading rather
// than giving up. Falls back to address + directions only if there is no token
// or Mapbox emits a hard error (e.g. WebGL unavailable / requests blocked).
export function MapEmbed({ className = "" }: { className?: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");
  const token = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

  useEffect(() => {
    if (!token) {
      setStatus("fallback");
      return;
    }
    let cancelled = false;
    let map: import("mapbox-gl").Map | undefined;

    (async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        if (cancelled || !mapRef.current) return;
        mapboxgl.accessToken = token;
        const { geo } = site.nap;
        map = new mapboxgl.Map({
          container: mapRef.current,
          style: site.mapbox.styleUrl,
          center: [geo.lng, geo.lat],
          zoom: site.mapbox.zoom,
          pitch: site.mapbox.pitch,
          attributionControl: true,
          cooperativeGestures: true, // two-finger pan on mobile (no scroll-trap)
          failIfMajorPerformanceCaveat: false, // don't bail on low-power mobile GPUs
        });
        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        const marker = document.createElement("img");
        marker.src = "/images/brand/logo.png";
        marker.alt = site.name;
        marker.style.width = "44px";
        marker.style.height = "44px";
        marker.style.borderRadius = "9999px";
        marker.style.filter = "drop-shadow(0 3px 6px rgba(0,0,0,0.35))";
        new mapboxgl.Marker({ element: marker, anchor: "center" })
          .setLngLat([geo.lng, geo.lat])
          .addTo(map);

        map.on("load", () => {
          if (!cancelled) setStatus("ready");
        });
        map.on("error", () => {
          if (!cancelled) setStatus("fallback");
        });
      } catch {
        if (!cancelled) setStatus("fallback");
      }
    })();

    return () => {
      cancelled = true;
      try {
        map?.remove();
      } catch {
        /* already gone */
      }
    };
  }, [token]);

  if (status === "fallback") {
    return (
      <div
        className={`relative min-h-[320px] overflow-hidden rounded-3xl ring-1 ring-charcoal/10 ${className}`}
      >
        <a
          href={directionsUrl(site.nap)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 bg-peach/40 text-center text-charcoal/80"
        >
          <IconMapPin className="h-7 w-7 text-coral-deep" />
          <span>
            {formatAddress(site.nap)}
            <br />
            <span className="text-sm font-semibold underline">Get directions</span>
          </span>
        </a>
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-[320px] overflow-hidden rounded-3xl ring-1 ring-charcoal/10 ${className}`}
    >
      <div ref={mapRef} className="h-full min-h-[320px] w-full" />
      {status !== "ready" ? (
        <div className="absolute inset-0 grid place-items-center bg-peach/40 text-charcoal/80">
          Loading map…
        </div>
      ) : null}
    </div>
  );
}
