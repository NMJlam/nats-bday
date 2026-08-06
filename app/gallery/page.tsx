import type { Metadata } from "next";

import { CardGrid } from "@/components/CardGrid";
import { CollectionPage } from "@/components/CollectionPage";
import { getAllCards } from "@/lib/cards";

export const metadata: Metadata = {
  title: "Gallery",
};

export default function GalleryPage() {
  const cards = getAllCards();

  return (
    <CollectionPage
      eyebrow={`The complete collection · ${cards.length} cards`}
      title="The whole wall"
      intro="Each image holds a note. Choose one to bring it forward, then close it to return to your place."
    >
      <CardGrid cards={cards} />
    </CollectionPage>
  );
}
