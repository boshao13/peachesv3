export interface NavLink {
  href: string;
  label: string;
}

// Primary header nav (kept lean for elegance); the rest live in the footer + mobile menu.
export const primaryNav: NavLink[] = [
  { href: "/about", label: "About" },
  { href: "/amenities", label: "Amenities" },
  { href: "/trainers", label: "Trainers" },
  { href: "/classes", label: "Classes" },
  { href: "/membership", label: "Membership" },
  { href: "/contact", label: "Contact" },
];

// Full set for the mobile menu + footer.
export const secondaryNav: NavLink[] = [
  { href: "/day-pass", label: "Day Pass" },
  { href: "/kids-care", label: "Kids Care" },
  { href: "/faq", label: "FAQ" },
  { href: "/careers", label: "Careers" },
  { href: "/code-of-conduct", label: "Code of Conduct" },
];

export const allNav: NavLink[] = [...primaryNav, ...secondaryNav];
