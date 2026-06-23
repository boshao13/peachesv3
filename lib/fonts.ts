import { Pacifico, Quicksand, Oswald } from "next/font/google";

// Font Option B (spec §5.2): Pacifico script accent, Quicksand body, Oswald headings.
// All self-hosted at build by next/font — no runtime CDN. Exposed as CSS variables.

export const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-display",
});

export const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-heading",
});

export const fontVariables = `${pacifico.variable} ${quicksand.variable} ${oswald.variable}`;
