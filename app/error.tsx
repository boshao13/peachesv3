"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-5 py-24 text-center">
      <div>
        <p className="script text-5xl text-coral-deep">Hmm</p>
        <h1 className="mt-2 text-3xl font-semibold uppercase tracking-wide">Something went wrong</h1>
        <p className="mt-3 text-charcoal/70 max-w-md mx-auto">
          We hit an unexpected error. Please try again — if it keeps happening, give us a call.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button href="/" variant="secondary">
            Back home
          </Button>
        </div>
      </div>
    </div>
  );
}
