import { Hero } from "@/components/sections/Hero";
import { ValueProps } from "@/components/sections/ValueProps";
import { StatsBand } from "@/components/sections/StatsBand";
import { AmenitiesPreview } from "@/components/sections/AmenitiesPreview";
import { ClassesPreview } from "@/components/sections/ClassesPreview";
import { TrainersPreview } from "@/components/sections/TrainersPreview";
import { FaqSection } from "@/components/sections/FaqSection";
import { MembershipCTA } from "@/components/sections/MembershipCTA";
import { LocationHours } from "@/components/sections/LocationHours";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValueProps />
      <StatsBand />
      <AmenitiesPreview />
      <ClassesPreview />
      <TrainersPreview />
      <FaqSection />
      <MembershipCTA />
      <LocationHours />
    </>
  );
}
