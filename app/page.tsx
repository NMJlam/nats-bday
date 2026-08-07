import Link from "next/link";
import { connection } from "next/server";

import FoldText from "@/components/FoldText";
import { GalleryReveal } from "@/components/GalleryReveal";
import { LandingSlideshow } from "@/components/LandingSlideshow";
import { getAllCards, shuffleCards } from "@/lib/cards";
import { SITE_TITLE } from "@/lib/site";

export default async function Home() {
  await connection();
  const cards = await getAllCards();
  const galleryCards = shuffleCards(cards);
  const slides = cards.flatMap((card) =>
    card.media.type === "image" ? [{ src: card.media.src }] : [],
  );

  return (
    <main className="relative isolate">
      <section className="relative z-10 grid min-h-[calc(100vh-var(--nav-height))] items-end overflow-hidden rounded-b-[clamp(1.75rem,4vw,4.5rem)] px-[5vw] py-[clamp(3rem,8vw,7rem)] text-white shadow-[0_35px_90px_rgba(23,37,31,0.3)]">
        <LandingSlideshow slides={slides} />
        <div className="relative z-3 grid max-w-[980px] gap-6">
          <h1 className="m-0 max-w-[900px] font-serif text-[clamp(3.4rem,8vw,7.8rem)] leading-[0.88] font-normal tracking-[-0.055em] text-shadow-lg">
            <FoldText
              color="inherit"
              creaseShading={0.55}
              duration={0.65}
              ease="power3.out"
              fontSize="inherit"
              fontWeight="inherit"
              hinge="bottom"
              perspective={700}
              splitBy="char"
              stagger={0.055}
              style={{ letterSpacing: "inherit", lineHeight: "inherit" }}
              text={SITE_TITLE}
              trigger="mount"
            />
          </h1>
          <p className="m-0 max-w-2xl font-serif text-[clamp(1.05rem,2vw,1.35rem)] leading-[1.55] text-white/90 text-shadow-md">
            A wall of little windows. Open one to find a message from someone who
            feels lucky to have you.
          </p>
          <Link
            className="mt-4 inline-flex w-fit items-center gap-6 rounded-full border border-white px-6 py-4 text-xs font-bold tracking-[0.14em] text-white uppercase no-underline shadow-lg transition-all hover:gap-8 hover:bg-white hover:text-[#17251f] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a]"
            href="#gallery"
          >
            Scroll to the gallery<span aria-hidden="true">↓</span>
          </Link>
        </div>
      </section>
      <GalleryReveal cards={galleryCards} />
    </main>
  );
}
