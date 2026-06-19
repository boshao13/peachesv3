import type { ImgRef } from "@/content/types";

/** Concise helper to declare an ImgRef in content modules. */
export function img(src: string, width: number, height: number, alt: string): ImgRef {
  return { src, width, height, alt };
}
