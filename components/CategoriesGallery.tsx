"use client";

import { useMemo, useState } from "react";

import { CATEGORIES, type CategoryId } from "@/lib/categories";
import type { Card } from "@/lib/cards";

import { AccordionGallery } from "./AccordionGallery";
import { CardGrid } from "./CardGrid";

type CategoriesGalleryProps = {
  cards: Card[];
};

export function CategoriesGallery({ cards }: CategoriesGalleryProps) {
  const [selected, setSelected] = useState<CategoryId | null>(null);
  const selectedLabel = CATEGORIES.find(
    (category) => category.id === selected,
  )?.label;
  const filteredCards = useMemo(
    () =>
      selected === null
        ? cards
        : cards.filter((card) => card.category === selected),
    [cards, selected],
  );

  return (
    <>
      <AccordionGallery
        cards={cards}
        selected={selected}
        onSelect={setSelected}
      />
      <div className="-mt-9 mb-5" aria-live="polite">
        <p className="m-0 text-xs font-bold tracking-[0.17em] text-[#65736c] uppercase">
          {selectedLabel === undefined
            ? "All collections"
            : `${selectedLabel} collection`} ·{" "}
          {filteredCards.length} {filteredCards.length === 1 ? "card" : "cards"}
        </p>
      </div>
      <CardGrid cards={filteredCards} />
    </>
  );
}
