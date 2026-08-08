import { randomUUID } from "node:crypto";

import { z } from "zod";

import { auth } from "@/auth";
import { rowToCard } from "@/lib/cards";
import { CATEGORY_IDS } from "@/lib/categories";
import { getDb } from "@/lib/db";
import { cards } from "@/lib/db/schema";
import { isBlobUrl } from "@/lib/media";

const createSchema = z.object({
  category: z.enum([...CATEGORY_IDS] as [string, ...string[]]),
  message: z.string().max(2000).default(""),
  mediaType: z.enum(["image", "video"]),
  mediaUrl: z.string().url().refine(isBlobUrl, "mediaUrl must be a Vercel Blob URL"),
  posterUrl: z
    .string()
    .url()
    .refine(isBlobUrl, "posterUrl must be a Vercel Blob URL")
    .optional(),
  alt: z.string().max(300).optional(),
});

export async function POST(request: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid card", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const db = getDb();
  const [row] = await db
    .insert(cards)
    .values({
      id: randomUUID(),
      category: data.category,
      message: data.message,
      mediaType: data.mediaType,
      mediaUrl: data.mediaUrl,
      posterUrl: data.mediaType === "video" ? data.posterUrl ?? null : null,
      alt: data.alt ?? "",
      ownerId: session.user.id,
      ownerEmail: session.user.email ?? "",
      ownerName: session.user.name ?? null,
    })
    .returning();

  return Response.json({ card: rowToCard(row) }, { status: 201 });
}
