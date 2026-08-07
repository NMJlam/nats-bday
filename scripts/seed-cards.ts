import { readFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { put } from "@vercel/blob";

import { parseCards } from "../lib/cards";
import { getDb } from "../lib/db";
import { cards as cardsTable } from "../lib/db/schema";

// One-time migration: read content/card.md, upload each asset in content/imgs to
// Vercel Blob, and insert a card row owned by the admin. Run with:
//   npm run db:seed
// After verifying, content/card.md, content/imgs, and this script can be retired.

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
};

const adminEmail =
  (process.env.ADMIN_EMAILS ?? "").split(",")[0]?.trim().toLowerCase() ?? "";

function stripMarkdown(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/[*_`~]/g, "")
    .trim();
}

function localPathFor(publicSrc: string): string {
  // publicSrc looks like "/content-imgs/DSC06500.JPG"
  const filename = path.posix.basename(publicSrc);
  return path.join(process.cwd(), "content", "imgs", filename);
}

async function uploadAsset(publicSrc: string): Promise<string> {
  const localPath = localPathFor(publicSrc);
  const filename = path.basename(localPath);
  const ext = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
  const data = readFileSync(localPath);

  const blob = await put(`cards/${filename}`, data, {
    access: "public",
    contentType,
    addRandomSuffix: true,
  });

  return blob.url;
}

async function main() {
  const source = readFileSync(
    path.join(process.cwd(), "content", "card.md"),
    "utf8",
  );
  const parsed = parseCards(source);
  const db = getDb();

  console.log(`Seeding ${parsed.length} cards…`);

  for (const card of parsed) {
    const mediaUrl = await uploadAsset(card.media.src);
    const posterUrl =
      card.media.type === "video" && card.media.poster
        ? await uploadAsset(card.media.poster)
        : null;

    await db.insert(cardsTable).values({
      id: randomUUID(),
      category: card.category,
      message: stripMarkdown(card.message),
      mediaType: card.media.type,
      mediaUrl,
      posterUrl,
      alt: card.alt,
      ownerId: "seed",
      ownerEmail: adminEmail,
    });

    console.log(`  ✓ ${card.alt} (${card.category})`);
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
