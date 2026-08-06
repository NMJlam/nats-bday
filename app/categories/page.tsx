import type { Metadata } from "next";

import { CategoriesGallery } from "@/components/CategoriesGallery";
import { GradientWaves } from "@/components/GradientWaves";
import { getAllCards } from "@/lib/cards";

export const metadata: Metadata = {
  title: "Categories",
};

export default function CategoriesPage() {
  const cards = getAllCards();

  return (
    <main className="page-shell">
      <GradientWaves variant="subtle" />
      <div className="page-content">
        <header className="page-heading">
          <p className="eyebrow">Browse by feeling</p>
          <h1 className="display-title">Choose a thread</h1>
          <p className="page-intro">
            Stretch a collection open, or keep every card together on one wall.
          </p>
        </header>
        <CategoriesGallery cards={cards} />
      </div>
    </main>
  );
}
