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
      eyebrow={`The complete collection · ${cards.length} cards`}
      title="The whole wall"
      intro="Each image or video holds a note. Choose one to bring it forward, then close it to return to your place."
    >
      <CardGrid cards={cards} />
    </CollectionPage>
  );
}
