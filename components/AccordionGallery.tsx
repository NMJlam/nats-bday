"use client";

import { motion, useReducedMotion } from "framer-motion";

import { CATEGORIES, type CategoryId } from "@/lib/categories";
import type { Card } from "@/lib/cards";

import { CardMedia } from "./CardMedia";

type AccordionGalleryProps = {
  cards: Card[];
  selected: CategoryId | null;
  onSelect: (category: CategoryId | null) => void;
};

export function AccordionGallery({
  cards,
  selected,
  onSelect,
}: AccordionGalleryProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="sticky top-[calc(var(--nav-height)+0.75rem)] z-20 -mt-8 mb-[clamp(3rem,6vw,5rem)] grid gap-3 rounded-[1.4rem] border border-white/50 bg-[rgba(246,244,237,0.8)] p-3 shadow-[0_16px_50px_rgba(25,45,36,0.1)] backdrop-blur-2xl max-sm:top-[calc(var(--nav-height)+0.4rem)] max-sm:-mx-1 max-sm:p-2"
      aria-label="Filter by category"
    >
      <button
        type="button"
        className={`w-fit cursor-pointer rounded-full border-0 px-3 py-1.5 text-[0.68rem] font-bold tracking-[0.14em] uppercase focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a] ${
          selected === null
            ? "bg-[#17251f] text-white"
            : "bg-transparent text-[#65736c]"
        }`}
        onClick={() => onSelect(null)}
        aria-pressed={selected === null}
      >
        All notes
      </button>
      <div className="flex h-24 gap-1.5 sm:h-[7.25rem] sm:gap-2 lg:h-[8.5rem]">
        {CATEGORIES.map((category) => {
          const representative = cards.find(
            (card) => card.category === category.id,
          );
          const active = selected === category.id;

          return (
            <motion.button
              layout
              key={category.id}
              type="button"
              className="group relative min-w-0 cursor-pointer overflow-hidden rounded-xl border-0 bg-[#68756f] p-0 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a]"
              onClick={() => onSelect(category.id)}
              aria-pressed={active}
              animate={{ flexGrow: active ? 3.2 : 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.42, ease: "easeOut" }}
            >
              {representative ? (
                <CardMedia
                  media={representative.media}
                  alt=""
                  sizes="(max-width: 767px) 28vw, 18vw"
                />
              ) : (
                <span
                  className="absolute inset-0 bg-linear-to-br from-[#78847c] to-[#b78873]"
                  aria-hidden="true"
                />
              )}
              <span
                className={`absolute inset-0 bg-linear-to-t from-[rgba(9,17,13,0.78)] to-transparent ${active ? "from-[rgba(9,17,13,0.58)]" : ""}`}
                aria-hidden="true"
              />
              <span className="absolute right-2 bottom-2 left-2 overflow-hidden text-left font-serif text-[0.68rem] text-ellipsis whitespace-nowrap text-white sm:text-[clamp(0.82rem,1.8vw,1.15rem)]">
                {category.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
