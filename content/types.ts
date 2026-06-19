// Content data contracts (spec Appendix A). Imported by every content module + component.

export interface ImgRef {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface DayRange {
  days: string;
  open: string;
  close: string;
}

export interface SiteConfig {
  name: string;
  siteUrl: string;
  nap: {
    street: string;
    suite?: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    phoneHref: string;
    email: string;
    geo: { lat: number; lng: number };
  };
  hours: { operating: DayRange[]; staffed: DayRange[] };
  socials: { instagram: string; facebook?: string };
  glofox: { branchId: string; membershipsUrl: string; scheduleUrl: string };
  mapbox: { styleUrl: string; zoom: number; pitch: number };
  promo: { enabled: boolean; text: string };
  priceRange: string;
}

export interface Amenity {
  slug: string;
  name: string;
  description: string;
  images: ImgRef[];
}

export interface Trainer {
  slug: string;
  name: string;
  title: string;
  photo: ImgRef;
  bio: string[];
  specializations: string[];
  certifications?: string[];
  placeholder?: boolean;
}

export interface ClassType {
  slug: string;
  name: string;
  description: string;
}

export interface Plan {
  slug: string;
  tier: string;
  price?: string | null; // null → "Contact for pricing"
  cadence?: "monthly" | "quarterly" | "annual";
  features: string[];
  highlighted?: boolean;
}

export interface DayPass {
  name: string;
  price: string;
  includes: string[];
  highlighted?: boolean;
}

export interface KidsCare {
  intro: string;
  priceMonthly: string;
  priceAdditional: string;
  images: ImgRef[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ConductRule {
  title: string;
  body: string;
}

export interface Stat {
  value: string;
  label: string;
}
