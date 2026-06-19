import type { SVGProps } from "react";

// Custom inline SVG icons (currentColor). Decorative by default (aria-hidden);
// pass a `title`/role at the call site if an icon is meaningful.
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

/** Women-focused — a blossom */
export function IconBloom(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 9.6V4.5M12 14.4V19.5M9.6 12H4.5M14.4 12H19.5" />
      <path d="M9.9 9.9 6.8 6.8M14.1 14.1l3.1 3.1M14.1 9.9l3.1-3.1M9.9 14.1l-3.1 3.1" opacity=".55" />
    </svg>
  );
}

/** Judgment-free / safe — shield with heart */
export function IconShield(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.3 7 9 4.1-1.7 7-4.8 7-9V6l-7-2.5Z" />
      <path d="M12 14.2s-2.6-1.5-2.6-3.3a1.6 1.6 0 0 1 2.6-1.2 1.6 1.6 0 0 1 2.6 1.2c0 1.8-2.6 3.3-2.6 3.3Z" />
    </svg>
  );
}

/** Strong community — people */
export function IconCommunity(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8.5" r="2.6" />
      <path d="M3.8 18.5a5.2 5.2 0 0 1 10.4 0" />
      <circle cx="16.5" cy="9.5" r="2" opacity=".7" />
      <path d="M15.5 13.4a4.4 4.4 0 0 1 4.7 4.1" opacity=".7" />
    </svg>
  );
}

/** Premium amenities — sparkle */
export function IconSparkle(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5c.6 4.3 2.2 5.9 6.5 6.5-4.3.6-5.9 2.2-6.5 6.5-.6-4.3-2.2-5.9-6.5-6.5 4.3-.6 5.9-2.2 6.5-6.5Z" />
      <path d="M18.5 15.5c.3 1.6.9 2.2 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.3 2.2-.9 2.5-2.5Z" opacity=".7" />
    </svg>
  );
}

/** Brand peach (filled) */
export function IconPeach(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
      <path d="M12.8 5.1c1-1 2.5-1.4 3.8-1.1.2 1.1-.1 2.3-.9 3.2 1.7.6 2.9 2.3 2.9 4.3 0 3.9-3.1 7.2-6.6 7.2S5.4 15.4 5.4 11.5c0-2.9 2.2-5.3 5-5.6.7-.1 1.6 0 2.4-.8Z" />
    </svg>
  );
}

/** Location pin */
export function IconMapPin(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s6.5-5.4 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.6 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </svg>
  );
}

/** Instagram */
export function IconInstagram(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.8" cy="7.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Check */
export function IconCheck(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m4.5 12.5 4.5 4.5 10.5-11" />
    </svg>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m14.5 5.5-7 6.5 7 6.5" />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m9.5 5.5 7 6.5-7 6.5" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 12h15M13 5.5l6.5 6.5L13 18.5" />
    </svg>
  );
}
