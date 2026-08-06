"use client";

import { useMemo, useState } from "react";

import type { CategoryId } from "@/lib/categories";
import type { Card } from "@/lib/cards";

import { AccordionGallery } from "./AccordionGallery";
import { CardGrid } from "./CardGrid";

type CategoriesGalleryProps = {
  cards: Card[];
};

export function CategoriesGallery({ cards }: CategoriesGalleryProps) {
  const [selected, setSelected] = useState<CategoryId | null>(null);
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
      <div className="category-result" aria-live="polite">
        <p className="eyebrow">
          {selected === null ? "All collections" : `${selected} collection`} ·{" "}
          {filteredCards.length} {filteredCards.length === 1 ? "card" : "cards"}
        </p>
      </div>
      <CardGrid cards={filteredCards} />
    </>
  );
}
