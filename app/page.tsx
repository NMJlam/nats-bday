import Link from "next/link";

import { GradientWaves } from "@/components/GradientWaves";
import { LandingIntro } from "@/components/LandingIntro";

export default function Home() {
  return (
    <>
      <LandingIntro />
      <main className="landing-content relative grid min-h-[calc(100vh-var(--nav-height))] items-end overflow-hidden px-[5vw] py-[clamp(3rem,8vw,7rem)]">
        <GradientWaves variant="full" />
        <div className="relative z-3 grid max-w-[980px] gap-6">
          <p className="m-0 text-xs font-bold tracking-[0.17em] text-[#65736c] uppercase">
            Images, videos, moments
          </p>
          <h1 className="m-0 max-w-[900px] font-serif text-[clamp(3.4rem,8vw,7.8rem)] leading-[0.88] font-normal tracking-[-0.055em]">
            Field Notes
          </h1>
          <p className="m-0 max-w-xl font-serif text-[clamp(1.05rem,2vw,1.35rem)] leading-[1.55] text-[rgba(23,37,31,0.78)]">
            A wall of small windows. Open one to find the story it has been
            keeping.
          </p>
          <Link
            className="mt-4 inline-flex w-fit items-center gap-6 rounded-full border border-[#17251f] px-6 py-4 text-xs font-bold tracking-[0.14em] text-[#17251f] uppercase no-underline transition-all hover:gap-8 hover:bg-[#17251f] hover:text-[#fbfaf5] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a]"
            href="/gallery"
          >
            Enter the gallery <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>
    </>
  );
}
