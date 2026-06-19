import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide " +
  "transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-coral-deep disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  // AA-safe: white text on coral-deep (5.42:1), hover coral-dark
  primary: "bg-coral-deep text-white hover:bg-coral-dark shadow-[0_8px_24px_-10px_rgba(168,80,58,0.6)] hover:-translate-y-0.5",
  secondary:
    "bg-transparent text-charcoal ring-1 ring-charcoal/20 hover:ring-coral-deep hover:text-coral-deep",
  ghost: "bg-transparent text-coral-deep hover:bg-peach/40",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

type AsLink = CommonProps & {
  href: string;
  external?: boolean;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">;

type AsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, "className" | "children"> & { href?: undefined };

export function Button(props: AsLink | AsButton) {
  const { variant = "primary", size = "md", className = "", children } = props;
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in props && props.href) {
    const { href, external, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as AsButton;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
