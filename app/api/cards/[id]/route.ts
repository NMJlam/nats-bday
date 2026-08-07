import { del } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/auth";
import { canEditCard } from "@/lib/auth-helpers";
import { rowToCard } from "@/lib/cards";
import { CATEGORY_IDS } from "@/lib/categories";
import { getDb } from "@/lib/db";
import { cards } from "@/lib/db/schema";
import { isBlobUrl } from "@/lib/media";

const updateSchema = z
  .object({
    category: z.enum([...CATEGORY_IDS] as [string, ...string[]]),
    message: z.string().max(2000),
    alt: z.string().max(300),
    mediaType: z.enum(["image", "video"]),
    mediaUrl: z
      .string()
      .url()
      .refine(isBlobUrl, "mediaUrl must be a Vercel Blob URL"),
    posterUrl: z
      .string()
      .url()
      .refine(isBlobUrl, "posterUrl must be a Vercel Blob URL")
      .nullable(),
  })
  .partial();

async function loadCardForMutation(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: Response.json({ error: "Not authenticated" }, { status: 401 }) };
  }

  const db = getDb();
  const [row] = await db.select().from(cards).where(eq(cards.id, id)).limit(1);
  if (!row) {
    return { error: Response.json({ error: "Card not found" }, { status: 404 }) };
  }

  const viewer = { id: session.user.id, isAdmin: session.user.isAdmin };
  if (!canEditCard(viewer, row)) {
    return { error: Response.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { db, row };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const loaded = await loadCardForMutation(id);
  if (loaded.error) {
    return loaded.error;
  }

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid update", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { db, row } = loaded;
  const data = parsed.data;

  // If media is being replaced, clean up the old blob(s) afterwards.
  const oldMediaUrl = row.mediaUrl;
  const oldPosterUrl = row.posterUrl;
  const mediaReplaced =
    data.mediaUrl !== undefined && data.mediaUrl !== oldMediaUrl;

  const [updated] = await db
    .update(cards)
    .set({
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.message !== undefined ? { message: data.message } : {}),
      ...(data.alt !== undefined ? { alt: data.alt } : {}),
      ...(data.mediaType !== undefined ? { mediaType: data.mediaType } : {}),
      ...(data.mediaUrl !== undefined ? { mediaUrl: data.mediaUrl } : {}),
      ...(data.posterUrl !== undefined ? { posterUrl: data.posterUrl } : {}),
      updatedAt: new Date(),
    })
    .where(eq(cards.id, id))
    .returning();

  if (mediaReplaced) {
    await Promise.allSettled(
      [oldMediaUrl, oldPosterUrl].filter(Boolean).map((url) => del(url as string)),
    );
  }

  return Response.json({ card: rowToCard(updated) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const loaded = await loadCardForMutation(id);
  if (loaded.error) {
    return loaded.error;
  }

  const { db, row } = loaded;

  await db.delete(cards).where(eq(cards.id, id));
  await Promise.allSettled(
    [row.mediaUrl, row.posterUrl].filter(Boolean).map((url) => del(url as string)),
  );

  return Response.json({ ok: true });
}
