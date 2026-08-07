import type { Metadata } from "next";
import { connection } from "next/server";

import { CardGrid } from "@/components/CardGrid";
import { CollectionPage } from "@/components/CollectionPage";
import { getAllCards, shuffleCards } from "@/lib/cards";

export const metadata: Metadata = {
  title: "Gallery",
};

export default async function GalleryPage() {
  await connection();
  const cards = shuffleCards(getAllCards());

  return (
    <CollectionPage
      eyebrow={`All · ${cards.length} cards`}
      title="Your birthday gallery"
      intro="Each card holds a note. Click to see it :3."
    >
      <CardGrid cards={cards} />
    </CollectionPage>
  );
}
