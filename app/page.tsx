import { Hero } from "@/components/sections/Hero";
// import { ValueProps } from "@/components/sections/ValueProps"; // temporarily disabled per owner request
// import { StatsBand } from "@/components/sections/StatsBand"; // temporarily disabled per owner request
import { AmenitiesPreview } from "@/components/sections/AmenitiesPreview";
import { ClassesPreview } from "@/components/sections/ClassesPreview";
import { TrainersPreview } from "@/components/sections/TrainersPreview";
import { FaqSection } from "@/components/sections/FaqSection";
import { MembershipCTA } from "@/components/sections/MembershipCTA";
import { LocationHours } from "@/components/sections/LocationHours";
import { MapEmbed } from "@/components/map/MapEmbed";

export default function HomePage() {
  return (
    <>
      <Hero />
      {/* ValueProps + StatsBand temporarily disabled per owner request */}
      <AmenitiesPreview />
      <TrainersPreview />
      <ClassesPreview />
      <FaqSection />
      <MembershipCTA />
      <LocationHours mapSlot={<MapEmbed className="h-full" />} />
    </>
  );
}
