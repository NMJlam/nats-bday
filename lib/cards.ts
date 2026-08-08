import { desc } from "drizzle-orm";

import { type CategoryId } from "./categories";
import { getDb } from "./db";
import { cards as cardsTable, type CardRow } from "./db/schema";

export type CardMedia =
  | { type: "image"; src: string }
  | { type: "video"; src: string; poster?: string };

export type Card = {
  id: string;
  media: CardMedia;
  category: CategoryId;
  message: string;
  alt: string;
  ownerId?: string;
};

export function shuffleCards(
  cards: readonly Card[],
  random: () => number = Math.random,
): Card[] {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function rowToCard(row: CardRow): Card {
  const media: CardMedia =
    row.mediaType === "video"
      ? {
          type: "video",
          src: row.mediaUrl,
          ...(row.posterUrl ? { poster: row.posterUrl } : {}),
        }
      : { type: "image", src: row.mediaUrl };

  return {
    id: row.id,
    media,
    category: row.category as CategoryId,
    message: row.message,
    alt: row.alt,
    ownerId: row.ownerId,
  };
}

export async function getAllCards(): Promise<Card[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(cardsTable)
    .orderBy(desc(cardsTable.createdAt));

  return rows.map(rowToCard);
}
