import type { ReactNode } from "react";

import { GradientWaves } from "./GradientWaves";

type CollectionPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
};

export function CollectionPage({
  eyebrow,
  title,
  intro,
  children,
}: CollectionPageProps) {
  return (
    <main className="relative min-h-[calc(100vh-var(--nav-height))] isolate">
      <GradientWaves variant="subtle" />
      <div className="relative z-2 mx-auto w-full max-w-[1320px] px-[4vw] pt-[clamp(3.5rem,8vw,7.5rem)] pb-32 max-sm:px-4">
        <header className="mb-[clamp(2.5rem,6vw,5rem)] grid gap-4">
          <p className="m-0 text-xs font-bold tracking-[0.17em] text-[#65736c] uppercase">
            {eyebrow}
          </p>
          <h1 className="m-0 max-w-[900px] font-serif text-[clamp(3.1rem,6.5vw,6.8rem)] leading-[0.88] font-normal tracking-[-0.055em]">
            {title}
          </h1>
          <p className="m-0 max-w-2xl font-serif text-[clamp(1rem,1.8vw,1.3rem)] leading-[1.6] text-[#65736c]">
            {intro}
          </p>
        </header>
        {children}
      </div>
    </main>
  );
}
