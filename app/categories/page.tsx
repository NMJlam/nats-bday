import type { Metadata } from "next";

import { CategoriesGallery } from "@/components/CategoriesGallery";
import { CollectionPage } from "@/components/CollectionPage";
import { getAllCards } from "@/lib/cards";

export const metadata: Metadata = {
  title: "Categories",
};

export default function CategoriesPage() {
  const cards = getAllCards();

  return (
    <CollectionPage
      eyebrow="Browse by feeling"
      title="Choose a thread"
      intro="Stretch a collection open, or keep every card together on one wall."
    >
      <CategoriesGallery cards={cards} />
    </CollectionPage>
  );
}
