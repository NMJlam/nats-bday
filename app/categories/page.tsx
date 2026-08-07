import type { Metadata } from "next";
import { connection } from "next/server";

import { CategoriesGallery } from "@/components/CategoriesGallery";
import { CollectionPage } from "@/components/CollectionPage";
import { getAllCards, shuffleCards } from "@/lib/cards";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function CategoriesPage() {
  await connection();
  const cards = shuffleCards(getAllCards());

  return (
    <CollectionPage
      eyebrow=">.<"
      title="Why are you so popular?"
      intro="Click to filter by group."
    >
      <CategoriesGallery cards={cards} />
    </CollectionPage>
  );
}
