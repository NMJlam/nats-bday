import Link from "next/link";

import { LandingSlideshow } from "@/components/LandingSlideshow";
import { getAllCards } from "@/lib/cards";
import { SITE_TITLE } from "@/lib/site";

export default function Home() {
  const slides = getAllCards().flatMap((card) =>
    card.media.type === "image" ? [{ src: card.media.src }] : [],
  );

  return (
    <main className="relative grid min-h-[calc(100vh-var(--nav-height))] items-end overflow-hidden px-[5vw] py-[clamp(3rem,8vw,7rem)] text-white">
      <LandingSlideshow slides={slides} />
      <div className="relative z-3 grid max-w-[980px] gap-6">
        <h1 className="m-0 max-w-[900px] font-serif text-[clamp(3.4rem,8vw,7.8rem)] leading-[0.88] font-normal tracking-[-0.055em] text-shadow-lg">
          {SITE_TITLE}
        </h1>
        <p className="m-0 max-w-2xl font-serif text-[clamp(1.05rem,2vw,1.35rem)] leading-[1.55] text-white/90 text-shadow-md">
          A wall of little windows. Open one to find a message from someone who
          feels lucky to have you.
        </p>
        <Link
          className="mt-4 inline-flex w-fit items-center gap-6 rounded-full border border-white px-6 py-4 text-xs font-bold tracking-[0.14em] text-white uppercase no-underline shadow-lg transition-all hover:gap-8 hover:bg-white hover:text-[#17251f] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a]"
          href="/gallery"
        >
          Click to view<span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
