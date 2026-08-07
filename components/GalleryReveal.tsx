"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useLayoutEffect, useRef } from "react";

import type { Card } from "@/lib/cards";

import { CardGrid } from "./CardGrid";
import { GradientWaves } from "./GradientWaves";

type GalleryRevealProps = {
  cards: Card[];
};

export function GalleryReveal({ cards }: GalleryRevealProps) {
  const galleryAnchorRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const revealProgress = useMotionValue(0);
  const opacity = useTransform(revealProgress, [0, 0.25, 0.82], [0.08, 0.4, 1]);
  const scale = useTransform(revealProgress, [0, 0.82], [0.93, 1]);
  const y = useTransform(revealProgress, [0, 0.82], [72, 0]);
  const filter = useTransform(
    revealProgress,
    [0, 0.82],
    ["blur(14px)", "blur(0px)"],
  );

  useLayoutEffect(() => {
    const galleryAnchor = galleryAnchorRef.current;

    if (!galleryAnchor) return;

    let animationFrame = 0;
    const updateProgress = () => {
      const galleryTop =
        galleryAnchor.getBoundingClientRect().top + window.scrollY;
      const revealStart = galleryTop - window.innerHeight;
      const revealDistance = window.innerHeight;
      const nextProgress = Math.min(
        1,
        Math.max(0, (window.scrollY - revealStart) / revealDistance),
      );

      revealProgress.set(nextProgress);
    };
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [revealProgress]);

  return (
    <section
      className="relative z-0 -mt-[35svh] min-h-[calc(100vh-var(--nav-height))] isolate overflow-clip"
      aria-labelledby="gallery-heading"
    >
      <span
        ref={galleryAnchorRef}
        id="gallery"
        className="absolute top-[35svh]"
        aria-hidden="true"
      />
      <GradientWaves variant="subtle" />
      <motion.div
        className="relative z-2 mx-auto w-full max-w-[1320px] origin-top px-[4vw] pt-[calc(35svh+clamp(5rem,10vw,9rem))] pb-32 will-change-[transform,filter,opacity] max-sm:px-4"
        style={reduceMotion ? undefined : { filter, opacity, scale, y }}
      >
        <header className="mb-[clamp(2.5rem,6vw,5rem)] grid gap-4">
          <p className="m-0 text-xs font-bold tracking-[0.17em] text-[#65736c] uppercase">
            All · {cards.length} cards
          </p>
          <h2
            id="gallery-heading"
            className="m-0 max-w-[900px] font-serif text-[clamp(3.1rem,6.5vw,6.8rem)] leading-[0.88] font-normal tracking-[-0.055em]"
          >
            Your birthday album
          </h2>
          <p className="m-0 max-w-2xl font-serif text-[clamp(1rem,1.8vw,1.3rem)] leading-[1.6] text-[#65736c]">
            Each card holds a note. Click to see it :3.
          </p>
        </header>
        <CardGrid cards={cards} revealOnScroll />
      </motion.div>
    </section>
  );
}
