"use client";

import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { site } from "@/content/site";
import { formatAddress, directionsUrl } from "@/lib/nap";
import { IconMapPin } from "@/components/ui/icons";

// Branded Mapbox GL map (spec §11): dynamically imported, client-only, mounted on
// scroll-into-view. No API key OR load failure → static fallback + Get Directions.
export function MapEmbed({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "fallback">("idle");
  const token = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

  useEffect(() => {
    if (!token) {
      setStatus("fallback");
      return;
    }
    const el = containerRef.current;
    if (!el) return;

    let cleanup: (() => void) | undefined;
    const obs = new IntersectionObserver(
      async (entries) => {
        if (!entries[0]?.isIntersecting) return;
        obs.disconnect();
        setStatus("loading");
        try {
          const mapboxgl = (await import("mapbox-gl")).default;
          if (!mapRef.current) return;
          mapboxgl.accessToken = token;
          const { geo } = site.nap;
          const map = new mapboxgl.Map({
            container: mapRef.current,
            style: site.mapbox.styleUrl,
            center: [geo.lng, geo.lat],
            zoom: site.mapbox.zoom,
            pitch: site.mapbox.pitch,
            attributionControl: true,
          });
          map.addControl(new mapboxgl.NavigationControl(), "top-right");

          const marker = document.createElement("img");
          marker.src = "/images/brand/logo3.png";
          marker.width = 28;
          marker.height = 28;
          marker.alt = "Peaches Fitness Club";
          marker.style.borderRadius = "9999px";
          new mapboxgl.Marker({ element: marker }).setLngLat([geo.lng, geo.lat]).addTo(map);

          map.on("load", () => setStatus("ready"));
          map.on("error", () => setStatus("fallback"));
          cleanup = () => map.remove();
        } catch {
          setStatus("fallback");
        }
      },
      { rootMargin: "200px" },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cleanup?.();
    };
  }, [token]);

  return (
    <div
      ref={containerRef}
      className={`relative min-h-[320px] overflow-hidden rounded-3xl ring-1 ring-charcoal/10 ${className}`}
    >
      {status === "fallback" ? (
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
      ) : (
        <>
          <div ref={mapRef} className="h-full min-h-[320px] w-full" />
          {status !== "ready" ? (
            <div className="absolute inset-0 grid place-items-center bg-peach/40 text-charcoal/80">
              Loading map…
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
