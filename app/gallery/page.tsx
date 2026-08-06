import type { Metadata } from "next";

import { CardGrid } from "@/components/CardGrid";
import { GradientWaves } from "@/components/GradientWaves";
import { getAllCards } from "@/lib/cards";

export const metadata: Metadata = {
  title: "Gallery",
};

export default function GalleryPage() {
  const cards = getAllCards();

  return (
    <main className="page-shell">
      <GradientWaves variant="subtle" />
      <div className="page-content">
        <header className="page-heading">
          <p className="eyebrow">The complete collection · {cards.length} cards</p>
          <h1 className="display-title">The whole wall</h1>
          <p className="page-intro">
            Each image holds a note. Choose one to bring it forward, then close
            it to return to your place.
          </p>
        </header>
        <CardGrid cards={cards} />
      </div>
    </main>
  );
}
