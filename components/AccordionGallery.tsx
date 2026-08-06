"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { CATEGORIES, type CategoryId } from "@/lib/categories";
import type { Card } from "@/lib/cards";

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
    <section className="category-selector" aria-label="Filter by category">
      <button
        type="button"
        className={`category-all${selected === null ? " is-active" : ""}`}
        onClick={() => onSelect(null)}
        aria-pressed={selected === null}
      >
        All notes
      </button>
      <div className="category-panels">
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
              className={`category-panel${active ? " is-active" : ""}`}
              onClick={() => onSelect(category.id)}
              aria-pressed={active}
              animate={{ flexGrow: active ? 3.2 : 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.42, ease: "easeOut" }}
            >
              {representative ? (
                <Image
                  src={representative.image}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 28vw, 18vw"
                />
              ) : (
                <span className="category-panel__placeholder" aria-hidden="true" />
              )}
              <span className="category-panel__shade" aria-hidden="true" />
              <span className="category-panel__label">{category.label}</span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
